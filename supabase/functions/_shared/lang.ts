// Shared language helpers for chat-style edge functions.

const LANG_MAP: Record<string, string> = {
  "pt-BR": "Brazilian Portuguese",
  "en": "English",
  "es": "Spanish",
};

export function normalizeLang(lang?: string | null): string {
  if (!lang) return "pt-BR";
  return LANG_MAP[lang] ? lang : "pt-BR";
}

/** Human-readable language name to inject in system prompts. */
export function responseLanguage(lang?: string | null): string {
  return LANG_MAP[normalizeLang(lang)];
}
