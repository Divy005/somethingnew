"use client";

/**
 * Tiny first-party analytics helper.
 *
 * Every visitor gets an anonymous session id stored in localStorage so page
 * views, card clicks, survey answers and waitlist signups can be joined into a
 * funnel later. No cookies, no third party, no PII beyond the email the user
 * types into the waitlist form themselves.
 */

const SESSION_KEY = "sp_session_id";
const CHOICE_KEY = "sp_last_choice";

export function getSessionId(): string {
  if (typeof window === "undefined") return "ssr";
  try {
    let id = window.localStorage.getItem(SESSION_KEY);
    if (!id) {
      id = crypto.randomUUID();
      window.localStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    // Private mode / storage blocked — still track, just without continuity.
    return "anon-" + Math.random().toString(36).slice(2);
  }
}

/** Remembered so /waitlist knows which product sent the user there. */
export function rememberChoice(productId: string) {
  try {
    window.localStorage.setItem(CHOICE_KEY, productId);
  } catch {
    /* ignore */
  }
}

export function recallChoice(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(CHOICE_KEY);
  } catch {
    return null;
  }
}

type Payload = Record<string, unknown>;

/**
 * Fire-and-forget POST. Uses `keepalive` so the request survives the page
 * navigation that usually follows a click. Never throws — analytics must not
 * be able to break a conversion.
 */
export async function post(path: string, body: Payload): Promise<Response | null> {
  try {
    return await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId: getSessionId(), ...body }),
      keepalive: true,
    });
  } catch {
    return null;
  }
}

export function trackPageView(path: string) {
  void post("/api/track", {
    type: "page_view",
    path,
    referrer: typeof document !== "undefined" ? document.referrer || null : null,
  });
}

export function trackCardClick(productId: string) {
  void post("/api/track", { type: "card_click", productId });
}
