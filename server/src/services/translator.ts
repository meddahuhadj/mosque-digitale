import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { config } from "../config.js";
import { childLogger } from "../logger.js";

const log = childLogger("translator");

// ── System Prompt ──────────────────────────────────────────────────────

const FALLBACK_PROMPT =
  "Tu es un traducteur spécialisé dans le prêche musulman (khutbah). Tu traduis " +
  "fidèlement, sobrement et sans interprétation personnelle, segment par segment, " +
  "de l'arabe vers les langues cibles demandées. Conserve les termes islamiques " +
  "translittérés d'usage (salât, taqwa, sunnah...) avec au besoin une glose courte " +
  "entre parenthèses à la première occurrence. « Allah » reste « Allah ». Rends les " +
  "formules d'eulogie. Si le segment cite le Coran, mets is_quran=true et donne " +
  "quran_ref si tu la reconnais avec certitude, sinon null ; traduis alors au plus " +
  "près du texte. Ne complète jamais une phrase coupée. Réponds UNIQUEMENT en JSON " +
  "conforme au schéma, une entrée par langue demandée, aucune langue omise.";

function loadSystemPrompt(): string {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const candidates = [
    join(__dirname, "../../..", "SYSTEM_PROMPT.md"),
    join(__dirname, "../../SYSTEM_PROMPT.md"),
  ];
  for (const path of candidates) {
    try {
      const text = readFileSync(path, "utf-8");
      const marker = "\n---\n";
      const idx = text.indexOf(marker);
      const body = (idx !== -1 ? text.slice(idx + marker.length) : text).trim();
      if (body.length > 200) return body;
    } catch { continue; }
  }
  return FALLBACK_PROMPT;
}

const SYSTEM_PROMPT = loadSystemPrompt();

// ── Response Schema (for Gemini) ───────────────────────────────────────

const RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    arabic: { type: "string" },
    is_quran: { type: "boolean" },
    quran_ref: { type: ["string", "null"] },
    is_hadith: { type: "boolean" },
    translations: {
      type: "array",
      items: {
        type: "object",
        properties: { lang: { type: "string" }, text: { type: "string" } },
        required: ["lang", "text"],
      },
    },
  },
  required: ["arabic", "is_quran", "translations"],
};

// ── LRU + TTL Cache ───────────────────────────────────────────────────

const CACHE_SIZE = 400;
const CACHE_TTL = 45 * 60 * 1000; // 45 min

interface CacheEntry {
  ts: number;
  value: TranslationResult;
}

const cache = new Map<string, CacheEntry>();

function cacheGet(key: string): TranslationResult | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > CACHE_TTL) {
    cache.delete(key);
    return null;
  }
  // Move to end (LRU)
  cache.delete(key);
  cache.set(key, entry);
  return entry.value;
}

function cachePut(key: string, value: TranslationResult) {
  if (cache.size >= CACHE_SIZE) {
    const firstKey = cache.keys().next().value;
    if (firstKey) cache.delete(firstKey);
  }
  cache.set(key, { ts: Date.now(), value });
}

// ── Types ──────────────────────────────────────────────────────────────

export interface TranslationResult {
  arabic: string;
  is_quran: boolean;
  quran_ref: string | null;
  is_hadith: boolean;
  translations: Record<string, string>;
}

// ── HTTP State ─────────────────────────────────────────────────────────

let lastError = "";
let lastProvider = "";
let geminiKeyIdx = 0;

export function getLastError() { return lastError; }
export function getLastProvider() { return lastProvider; }

function statusToError(code: number): string {
  if (code === 401 || code === 403) return "auth";
  if (code === 429) return "quota";
  if (code >= 500) return "server";
  return "bad_response";
}

function worst(errors: string[]): string {
  for (const pref of ["quota", "auth", "server", "bad_response", "network"]) {
    if (errors.includes(pref)) return pref;
  }
  return errors[0] || "no_provider";
}

// ── Helpers ────────────────────────────────────────────────────────────

function userMsg(arabicText: string, langs: string[], glossary: string): string {
  const gloss = glossary
    ? `GLOSSAIRE DE LA MOSQUÉE (à respecter strictement pour les noms propres, titres et translittérations) :\n${glossary}\n\n`
    : "";
  return (
    gloss +
    `Langues cibles (codes) : ${langs.join(", ")}.\n` +
    "Traduis le segment de khutbah suivant (arabe). Fournis une entrée par langue, " +
    "dans cet ordre, sans en omettre aucune. Réponds UNIQUEMENT en JSON conforme " +
    "au schéma { arabic, is_quran, quran_ref, is_hadith, " +
    "translations:[{lang,text}] }.\n\nSEGMENT :\n" + arabicText
  );
}

function parseLLMJson(raw: string, langs: string[], arabicText: string): TranslationResult | null {
  raw = (raw || "").trim();
  if (!raw) return null;

  let data: any;
  try {
    data = JSON.parse(raw);
  } catch {
    const s = raw.indexOf("{");
    const e = raw.lastIndexOf("}");
    if (s === -1 || e === -1) return null;
    try {
      data = JSON.parse(raw.slice(s, e + 1));
    } catch {
      return null;
    }
  }

  const tmap: Record<string, string> = {};
  const items = data.translations;
  if (Array.isArray(items)) {
    for (const it of items) {
      const code = String(it.lang || "").trim();
      if (code) tmap[code] = String(it.text || "").trim();
    }
  } else if (items && typeof items === "object") {
    for (const [code, txt] of Object.entries(items)) {
      tmap[String(code).trim()] = String(txt || "").trim();
    }
  }
  for (const l of langs) {
    tmap[l] = tmap[l] || "";
  }

  return {
    arabic: String(data.arabic || arabicText).trim(),
    is_quran: Boolean(data.is_quran),
    quran_ref: data.quran_ref || null,
    is_hadith: Boolean(data.is_hadith),
    translations: tmap,
  };
}

function providerConfigured(name: string): boolean {
  const map: Record<string, boolean> = {
    gemini: config.gemini.keys.length > 0,
    groq: Boolean(config.groq.key),
    openrouter: Boolean(config.openrouter.key),
    azure: Boolean(config.azure.key && config.azure.region),
  };
  return map[name] || false;
}

export function hasApiKey(): boolean {
  return config.translateProviders.some((p) => providerConfigured(p));
}

// ── Gemini Provider ────────────────────────────────────────────────────

async function provGemini(
  arabicText: string, langs: string[], glossary: string
): Promise<[TranslationResult | null, string]> {
  if (!config.gemini.keys.length) return [null, "no_provider"];

  const payload = {
    systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
    contents: [{ role: "user", parts: [{ text: userMsg(arabicText, langs, glossary) }] }],
    generationConfig: {
      temperature: 0.2,
      topP: 0.9,
      candidateCount: 1,
      maxOutputTokens: 2048,
      responseMimeType: "application/json",
      responseSchema: RESPONSE_SCHEMA,
    },
    safetySettings: [
      "HARM_CATEGORY_HARASSMENT",
      "HARM_CATEGORY_HATE_SPEECH",
      "HARM_CATEGORY_SEXUALLY_EXPLICIT",
      "HARM_CATEGORY_DANGEROUS_CONTENT",
    ].map((category) => ({ category, threshold: "BLOCK_NONE" })),
  };

  const url = `${config.gemini.baseUrl}/models/${config.gemini.model}:generateContent`;
  let err = "network";
  const n = config.gemini.keys.length;

  for (let i = 0; i < n; i++) {
    const key = config.gemini.keys[geminiKeyIdx % n];
    geminiKeyIdx++;
    try {
      const r = await fetch(`${url}?key=${key}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(22000),
      });
      if (r.status === 200) {
        const json = await r.json() as any;
        const parts = json?.candidates?.[0]?.content?.parts || [];
        const rawText = parts.map((p: any) => p.text || "").join("");
        return [parseLLMJson(rawText, langs, arabicText), ""];
      }
      err = statusToError(r.status);
      log.warn(`[gemini] HTTP ${r.status} (${err})`);
      if (err === "quota" || err === "server") continue;
      return [null, err];
    } catch (exc: any) {
      log.warn(`[gemini] network: ${exc.message}`);
      err = "network";
    }
  }
  return [null, err];
}

// ── OpenAI-Compatible Provider (Groq, OpenRouter) ──────────────────────

async function provOpenAICompat(
  baseUrl: string, key: string, model: string,
  arabicText: string, langs: string[], glossary: string,
  extraHeaders?: Record<string, string>
): Promise<[TranslationResult | null, string]> {
  if (!key) return [null, "no_provider"];

  const headers: Record<string, string> = {
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
    ...extraHeaders,
  };

  const body = {
    model,
    temperature: 0.2,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userMsg(arabicText, langs, glossary) },
    ],
  };

  try {
    const r = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(22000),
    });
    if (r.status !== 200) {
      const err = statusToError(r.status);
      const text = await r.text().catch(() => "");
      log.warn(`[openai-compat] HTTP ${r.status} (${err}): ${text.slice(0, 200)}`);
      return [null, err];
    }
    const json = await r.json() as any;
    const rawText = json?.choices?.[0]?.message?.content || "";
    return [parseLLMJson(rawText, langs, arabicText), ""];
  } catch (exc: any) {
    log.warn(`[openai-compat] network: ${exc.message}`);
    return [null, "network"];
  }
}

async function provGroq(arabicText: string, langs: string[], glossary: string) {
  return provOpenAICompat(config.groq.baseUrl, config.groq.key, config.groq.model, arabicText, langs, glossary);
}

async function provOpenRouter(arabicText: string, langs: string[], glossary: string) {
  return provOpenAICompat(
    config.openrouter.baseUrl, config.openrouter.key, config.openrouter.model,
    arabicText, langs, glossary,
    { "HTTP-Referer": "https://github.com/", "X-Title": "mosque-digital-os" }
  );
}

// ── Azure AI Translator ────────────────────────────────────────────────

const AZURE_LANGS = new Set(["fr", "en", "nl", "de", "es", "tr", "ur", "bn", "ha", "ar"]);

async function provAzure(
  arabicText: string, langs: string[], _glossary: string
): Promise<[TranslationResult | null, string]> {
  if (!config.azure.key || !config.azure.region) return [null, "no_provider"];

  const targets = langs.filter((l) => AZURE_LANGS.has(l) && l !== "ar");
  if (!targets.length) {
    return [{
      arabic: arabicText,
      is_quran: false,
      quran_ref: null,
      is_hadith: false,
      translations: Object.fromEntries(langs.map((l) => [l, ""])),
    }, ""];
  }

  const params = new URLSearchParams({ "api-version": "3.0", from: "ar" });
  for (const t of targets) params.append("to", t);

  const headers = {
    "Ocp-Apim-Subscription-Key": config.azure.key,
    "Ocp-Apim-Subscription-Region": config.azure.region,
    "Content-Type": "application/json",
  };

  try {
    const r = await fetch(`${config.azure.url}?${params}`, {
      method: "POST",
      headers,
      body: JSON.stringify([{ Text: arabicText }]),
      signal: AbortSignal.timeout(22000),
    });
    if (r.status !== 200) {
      const err = statusToError(r.status);
      return [null, err];
    }
    const json = await r.json() as any;
    const trans = json?.[0]?.translations || [];
    const tmap: Record<string, string> = {};
    for (const t of trans) tmap[t.to] = t.text;
    for (const l of langs) tmap[l] = tmap[l] || "";
    return [{
      arabic: arabicText,
      is_quran: false,
      quran_ref: null,
      is_hadith: false,
      translations: tmap,
    }, ""];
  } catch (exc: any) {
    log.warn(`[azure] network: ${exc.message}`);
    return [null, "network"];
  }
}

// ── Provider Chain ─────────────────────────────────────────────────────

const TRANSLATE_IMPL: Record<string, typeof provGemini> = {
  gemini: provGemini,
  groq: provGroq,
  openrouter: provOpenRouter,
  azure: provAzure,
};

export async function translateSegment(
  arabicText: string,
  targetLangs: string[],
  glossary: string = "",
  useCache: boolean = true
): Promise<TranslationResult | null> {
  arabicText = (arabicText || "").trim();
  glossary = (glossary || "").trim().slice(0, 4000);
  const langs = [...new Set(targetLangs)].filter((l) => l && l !== "ar");
  if (!arabicText || !langs.length) return null;

  const cacheKey = `${arabicText}\x1f${[...langs].sort().join(",")}\x1f${glossary}`;
  if (useCache) {
    const cached = cacheGet(cacheKey);
    if (cached) return cached;
  }

  const chain = config.translateProviders.filter((p) => providerConfigured(p) && TRANSLATE_IMPL[p]);
  if (!chain.length) {
    lastError = "no_provider";
    return null;
  }

  const errors: string[] = [];
  for (const name of chain) {
    try {
      const [result, err] = await TRANSLATE_IMPL[name](arabicText, langs, glossary);
      if (result) {
        lastError = "";
        lastProvider = name;
        cachePut(cacheKey, result);
        return result;
      }
      errors.push(err);
    } catch (exc: any) {
      log.error(`[${name}] exception: ${exc.message}`);
      errors.push("server");
    }
  }

  lastError = worst(errors);
  log.error(`[translate] all providers failed (${chain} -> ${errors})`);
  return null;
}

// ── STT (Speech-to-Text) ──────────────────────────────────────────────

const STT_INSTRUCTION =
  "Transcris fidèlement cet extrait audio d'un prêche en ARABE. " +
  "Rends UNIQUEMENT le texte arabe prononcé, sans traduction, sans ponctuation " +
  "superflue, sans commentaire, sans guillemets.";

async function sttGroq(audioBytes: Buffer, mimeType: string): Promise<string | null> {
  if (!config.groq.key) return null;
  const extMap: Record<string, string> = {
    "audio/webm": "webm", "audio/ogg": "ogg", "audio/mp4": "mp4",
    "audio/mpeg": "mp3", "audio/wav": "wav",
  };
  const ext = extMap[mimeType] || "webm";
  const form = new FormData();
  form.append("file", new Blob([new Uint8Array(audioBytes)], { type: mimeType }), `chunk.${ext}`);
  form.append("model", config.groq.sttModel);
  form.append("language", "ar");
  form.append("temperature", "0");
  form.append("response_format", "text");

  try {
    const r = await fetch(`${config.groq.baseUrl}/audio/transcriptions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${config.groq.key}` },
      body: form,
      signal: AbortSignal.timeout(22000),
    });
    if (r.status !== 200) {
      const text = await r.text().catch(() => "");
      log.warn(`[groq-stt] HTTP ${r.status}: ${text.slice(0, 200)}`);
      return null;
    }
    return (await r.text()).trim().replace(/^"|"$/g, "");
  } catch (exc: any) {
    log.warn(`[groq-stt] network: ${exc.message}`);
    return null;
  }
}

async function sttGemini(audioBytes: Buffer, mimeType: string): Promise<string | null> {
  if (!config.gemini.keys.length) return null;
  const b64 = audioBytes.toString("base64");
  const payload = {
    contents: [{ role: "user", parts: [
      { text: STT_INSTRUCTION },
      { inlineData: { mimeType: mimeType || "audio/webm", data: b64 } },
    ] }],
    generationConfig: { temperature: 0.0, maxOutputTokens: 1024 },
  };
  const url = `${config.gemini.baseUrl}/models/${config.gemini.model}:generateContent`;
  try {
    const r = await fetch(`${url}?key=${config.gemini.keys[0]}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(22000),
    });
    if (r.status !== 200) return null;
    const json = await r.json() as any;
    const parts = json?.candidates?.[0]?.content?.parts || [];
    return parts.map((p: any) => p.text || "").join("").trim();
  } catch {
    return null;
  }
}

const STT_IMPL: Record<string, (audioBytes: Buffer, mt: string) => Promise<string | null>> = {
  groq: sttGroq,
  gemini: sttGemini,
};

export async function transcribeAudio(audioBytes: Buffer, mimeType: string): Promise<string | null> {
  if (!audioBytes?.length) return null;
  const mt = (mimeType || "audio/webm").split(";")[0].trim() || "audio/webm";
  for (const name of config.sttProviders) {
    const impl = STT_IMPL[name];
    if (!impl) continue;
    try {
      const text = await impl(audioBytes, mt);
      if (text) return text;
    } catch (exc: any) {
      log.warn(`[${name}-stt] exception: ${exc.message}`);
    }
  }
  return null;
}
