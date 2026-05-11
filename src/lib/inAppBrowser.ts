// Detecta navegadores in-app (Instagram, Facebook, TikTok, etc.) que bloqueiam
// cookies de terceiros e quebram o fluxo OAuth (causa "State verification failed").
// Também detecta PWA em modo standalone, que tem o mesmo problema no iOS/Android.

const IN_APP_PATTERNS = [
  /Instagram/i,
  /FBAN|FBAV|FB_IAB|FBIOS/i, // Facebook
  /MicroMessenger/i, // WeChat
  /Line\//i,
  /TikTok|musical_ly/i,
  /Twitter|TwitterAndroid/i,
  /LinkedInApp/i,
  /Snapchat/i,
  /Pinterest/i,
  /KAKAOTALK/i,
  /; wv\)/i, // generic Android WebView
];

export function detectInAppBrowser(ua: string = typeof navigator !== "undefined" ? navigator.userAgent : ""): {
  isInApp: boolean;
  name: string | null;
} {
  if (!ua) return { isInApp: false, name: null };
  for (const re of IN_APP_PATTERNS) {
    const m = ua.match(re);
    if (m) return { isInApp: true, name: m[0] };
  }
  return { isInApp: false, name: null };
}

export function isStandalonePWA(): boolean {
  if (typeof window === "undefined") return false;
  try {
    if (window.matchMedia?.("(display-mode: standalone)").matches) return true;
    // iOS Safari adicionado-à-tela
    // @ts-expect-error vendor flag
    if (window.navigator.standalone === true) return true;
  } catch {
    /* noop */
  }
  return false;
}

/** Verdadeiro quando OAuth tem alta chance de falhar com "State verification failed". */
export function oauthLikelyToFail(): boolean {
  return detectInAppBrowser().isInApp || isStandalonePWA();
}
