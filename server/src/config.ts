import "dotenv/config";

export const config = {
  host: process.env.HOST || "0.0.0.0",
  port: parseInt(process.env.PORT || "3000", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  publicBaseUrl: process.env.PUBLIC_BASE_URL || "",

  database: {
    url: process.env.DATABASE_URL || "",
  },

  jwt: {
    secret: process.env.JWT_SECRET || "dev-secret-change-in-production",
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "30d",
  },

  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || "12", 10),

  translateProviders: (process.env.TRANSLATE_PROVIDERS || "gemini,groq,openrouter,azure")
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean),

  sttProviders: (process.env.STT_PROVIDERS || "groq,gemini")
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean),

  gemini: {
    keys: _keys("GEMINI_API_KEYS", "GEMINI_API_KEY"),
    model: process.env.GEMINI_MODEL || "gemini-2.5-flash-lite",
    baseUrl: "https://generativelanguage.googleapis.com/v1beta",
  },

  groq: {
    key: process.env.GROQ_API_KEY || "",
    model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
    sttModel: process.env.GROQ_STT_MODEL || "whisper-large-v3",
    baseUrl: "https://api.groq.com/openai/v1",
  },

  openrouter: {
    key: process.env.OPENROUTER_API_KEY || "",
    model: process.env.OPENROUTER_MODEL || "meta-llama/llama-3.3-70b-instruct:free",
    baseUrl: "https://openrouter.ai/api/v1",
  },

  azure: {
    key: process.env.AZURE_TRANSLATOR_KEY || "",
    region: process.env.AZURE_TRANSLATOR_REGION || "",
    url: "https://api.cognitive.microsofttranslator.com/translate",
  },

  limits: {
    maxHistory: parseInt(process.env.MAX_HISTORY || "40", 10),
    maxListeners: parseInt(process.env.MAX_LISTENERS || "1500", 10),
    maxAudioBytes: parseInt(process.env.MAX_AUDIO_BYTES || "2000000", 10),
    maxRooms: parseInt(process.env.MAX_ROOMS || "300", 10),
    segQueueMax: parseInt(process.env.SEG_QUEUE_MAX || "24", 10),
    idleRoomTtl: parseInt(process.env.IDLE_ROOM_TTL || "1200", 10),
    rateLimitSessionsPerIp: parseInt(process.env.RATE_LIMIT_SESSIONS_PER_IP || "12", 10),
  },

  defaultTargetLangs: (process.env.DEFAULT_TARGET_LANGS || "")
    .split(",")
    .map((l) => l.trim())
    .filter(Boolean),

  frontendDir: process.env.FRONTEND_DIR || "../frontend",
} as const;

function _keys(...names: string[]): string[] {
  const out: string[] = [];
  for (const n of names) {
    for (const part of (process.env[n] || "").split(",")) {
      const k = part.trim();
      if (k && !out.includes(k)) out.push(k);
    }
  }
  return out;
}
