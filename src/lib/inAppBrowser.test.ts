import { describe, it, expect } from "vitest";
import { detectInAppBrowser } from "./inAppBrowser";

describe("detectInAppBrowser", () => {
  it("detects Instagram", () => {
    expect(detectInAppBrowser("Mozilla/5.0 ... Instagram 250.0.0.0").isInApp).toBe(true);
  });
  it("detects Facebook (FBAN)", () => {
    expect(detectInAppBrowser("... FBAN/FBIOS;FBAV/450 ...").isInApp).toBe(true);
  });
  it("detects Android WebView", () => {
    expect(detectInAppBrowser("Mozilla/5.0 (Linux; Android 13; wv) AppleWebKit").isInApp).toBe(true);
  });
  it("does not flag normal Safari", () => {
    expect(
      detectInAppBrowser(
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605 Version/17.0 Mobile/15E148 Safari/604.1",
      ).isInApp,
    ).toBe(false);
  });
  it("does not flag Chrome desktop", () => {
    expect(
      detectInAppBrowser(
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120 Safari/537.36",
      ).isInApp,
    ).toBe(false);
  });
});
