import { config } from "../config.js";
import { childLogger } from "../logger.js";

const log = childLogger("ai-assistant");

export interface KhutbahPlan {
  topic: string;
  introduction: string;
  mainPoints: string[];
  references: string[];
  examples: string[];
  conclusion: string;
  dua: string;
  warnings: string[];
}

export async function generateKhutbahPlan(
  topic: string,
  language: string = "fr"
): Promise<KhutbahPlan | null> {
  const prompt = `Tu es un assistant IA pour un imam musulman. Prépare un plan de khutbah sur le sujet suivant : "${topic}".

IMPORTANT :
- Ne jamais inventer de versets coraniques. Si tu cites un verset, donne la référence exacte (Sourate:Ayah).
- Ne jamais inventer de hadiths. Si tu cites un hadith, indique la source (Boukhari, Mouslim, etc.).
- Ne pas te présenter comme une autorité religieuse.
- Indiquer les sources quand disponibles.
- Signaler les éléments nécessitant vérification.

Réponds UNIQUEMENT en JSON conforme au schéma :
{
  "topic": "sujet",
  "introduction": "introduction",
  "mainPoints": ["point 1", "point 2", ...],
  "references": ["Sourate 2:153", "Boukhari 1234", ...],
  "examples": ["exemple 1", ...],
  "conclusion": "conclusion",
  "dua": "dua final",
  "warnings": ["élément à vérifier", ...]
}`;

  // Try Gemini first, then fallback to Groq
  if (config.gemini.keys.length > 0) {
    try {
      const r = await fetch(`${config.gemini.baseUrl}/models/${config.gemini.model}:generateContent?key=${config.gemini.keys[0]}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 2048,
            responseMimeType: "application/json",
          },
        }),
        signal: AbortSignal.timeout(30000),
      });
      if (r.status === 200) {
        const json = await r.json() as any;
        const raw = json?.candidates?.[0]?.content?.parts?.[0]?.text || "";
        return parsePlan(raw);
      }
    } catch (exc: any) {
      log.warn(`[gemini] assistant error: ${exc.message}`);
    }
  }

  if (config.groq.key) {
    try {
      const r = await fetch(`${config.groq.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.groq.key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: config.groq.model,
          temperature: 0.4,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: "You are an Islamic studies assistant. Always cite sources." },
            { role: "user", content: prompt },
          ],
        }),
        signal: AbortSignal.timeout(30000),
      });
      if (r.status === 200) {
        const json = await r.json() as any;
        const raw = json?.choices?.[0]?.message?.content || "";
        return parsePlan(raw);
      }
    } catch (exc: any) {
      log.warn(`[groq] assistant error: ${exc.message}`);
    }
  }

  return null;
}

function parsePlan(raw: string): KhutbahPlan | null {
  try {
    let data: any;
    try {
      data = JSON.parse(raw);
    } catch {
      const s = raw.indexOf("{");
      const e = raw.lastIndexOf("}");
      if (s === -1 || e === -1) return null;
      data = JSON.parse(raw.slice(s, e + 1));
    }
    return {
      topic: String(data.topic || ""),
      introduction: String(data.introduction || ""),
      mainPoints: Array.isArray(data.mainPoints) ? data.mainPoints : [],
      references: Array.isArray(data.references) ? data.references : [],
      examples: Array.isArray(data.examples) ? data.examples : [],
      conclusion: String(data.conclusion || ""),
      dua: String(data.dua || ""),
      warnings: Array.isArray(data.warnings) ? data.warnings : [],
    };
  } catch {
    return null;
  }
}

export async function answerMosqueQuestion(
  question: string,
  mosqueContext: string
): Promise<string | null> {
  const prompt = `Tu es l'assistant IA d'une mosquée. Réponds à la question du fidèle de manière concise et utile.

CONTEXTE DE LA MOSQUÉE :
${mosqueContext}

QUESTION : ${question}

Règles :
- Réponds à partir du contexte de la mosquée quand c'est possible.
- Ne donne pas de fatwa.
- Si tu ne sais pas, dis-le.
- Sois bref et utile.`;

  if (config.gemini.keys.length > 0) {
    try {
      const r = await fetch(`${config.gemini.baseUrl}/models/${config.gemini.model}:generateContent?key=${config.gemini.keys[0]}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 1024 },
        }),
        signal: AbortSignal.timeout(15000),
      });
      if (r.status === 200) {
        const json = await r.json() as any;
        return json?.candidates?.[0]?.content?.parts?.[0]?.text || null;
      }
    } catch { /* continue */ }
  }

  return null;
}
