"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { getProduct, WAITLIST_REASONS, formatInr } from "@/lib/products";
import { post, recallChoice, trackPageView } from "@/lib/analytics";

export default function WaitlistForm() {
  const params = useSearchParams();
  const [productId, setProductId] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [reason, setReason] = useState("");
  const [state, setState] = useState<"idle" | "saving" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    trackPageView("/waitlist");
    // Prefer the query param; fall back to whatever card they last clicked.
    setProductId(params.get("product") ?? recallChoice());
  }, [params]);

  const product = productId ? getProduct(productId) : undefined;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email.trim()) return setError("Please enter your email address.");
    if (!reason) return setError("Pick the reason that fits best.");

    setState("saving");
    const res = await post("/api/waitlist", {
      email: email.trim(),
      reason,
      productId: product?.id,
    });

    if (!res) {
      setState("idle");
      return setError("Network hiccup. Please try again.");
    }

    const data = (await res.json().catch(() => ({}))) as {
      ok?: boolean;
      error?: string;
    };

    if (!res.ok || !data.ok) {
      setState("idle");
      return setError(data.error ?? "Something went wrong. Please try again.");
    }

    setState("done");
  }

  if (state === "done") {
    return (
      <div className="animate-[rise_0.45s_cubic-bezier(0.16,1,0.3,1)_both] rounded-3xl border border-white/10 bg-ink-900/80 p-8 text-center sm:p-10">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-400/10">
          <svg viewBox="0 0 24 24" className="h-7 w-7 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>
        <h2 className="mt-5 text-2xl font-bold text-white">You're on the list.</h2>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-mist-400">
          We'll email <span className="text-mist-200">{email}</span> the moment
          the founding drop opens — and you'll get first pick of the run at
          founding-member pricing.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M11 18l-6-6 6-6" />
          </svg>
          Back to Stormproof
        </Link>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border border-white/10 bg-ink-900/80 p-6 shadow-2xl shadow-black/40 sm:p-9"
    >
      {product ? (
        <div className="mb-7 flex items-center gap-3 rounded-2xl border border-storm-400/20 bg-storm-400/5 px-4 py-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-storm-500/15 text-storm-400">
            <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </span>
          <p className="text-[13px] leading-snug text-mist-200">
            Reserving:{" "}
            <span className="font-semibold text-white">{product.name}</span>{" "}
            <span className="text-mist-400">
              · {formatInr(product.priceInr)}
            </span>
          </p>
        </div>
      ) : null}

      <div className="space-y-5">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-mist-200"
          >
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3.5 text-[15px] text-white placeholder:text-mist-400/60 transition focus:border-storm-400/60 focus:bg-white/[0.05]"
          />
        </div>

        <div>
          <label
            htmlFor="reason"
            className="block text-sm font-medium text-mist-200"
          >
            What is the #1 reason you were ready to buy this today?
          </label>
          <div className="relative mt-2">
            <select
              id="reason"
              name="reason"
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className={`w-full appearance-none rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3.5 pr-11 text-[15px] transition focus:border-storm-400/60 focus:bg-white/[0.05] ${
                reason ? "text-white" : "text-mist-400/60"
              }`}
            >
              <option value="" disabled>
                Choose one…
              </option>
              {WAITLIST_REASONS.map((r) => (
                <option key={r.value} value={r.value} className="bg-ink-900 text-white">
                  {r.label}
                </option>
              ))}
            </select>
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 right-4 h-4 w-4 -translate-y-1/2 text-mist-400"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </div>
          <p className="mt-2 text-xs text-mist-400">
            One answer. It decides what we build first.
          </p>
        </div>
      </div>

      {error ? (
        <p
          role="alert"
          className="mt-5 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-300"
        >
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={state === "saving"}
        className="mt-7 w-full rounded-xl bg-linear-to-r from-storm-500 to-indigo-500 px-6 py-4 text-sm font-semibold text-white shadow-lg shadow-storm-500/25 transition hover:brightness-110 active:scale-[0.99] disabled:opacity-60"
      >
        {state === "saving" ? "Reserving your spot…" : "Reserve my spot"}
      </button>

      <p className="mt-4 text-center text-xs leading-relaxed text-mist-400">
        No spam, no card, one email when we ship. Unsubscribe in a click.
      </p>
    </form>
  );
}
