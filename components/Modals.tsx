"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import QrCode from "./QrCode";
import {
  formatInr,
  STANDARD_SURVEY_OPTIONS,
  type Product,
} from "@/lib/products";
import { post, rememberChoice } from "@/lib/analytics";

/* -------------------------------------------------------------------------- */
/* Shared shell                                                               */
/* -------------------------------------------------------------------------- */

function ModalShell({
  onClose,
  labelledBy,
  children,
}: {
  onClose: () => void;
  labelledBy: string;
  children: React.ReactNode;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);

    // Lock background scroll without the layout jumping.
    const { overflow, paddingRight } = document.body.style;
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`;

    panelRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      document.body.style.paddingRight = paddingRight;
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto p-0 sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelledBy}
    >
      <div
        className="animate-[fade_0.25s_ease-out_both] fixed inset-0 bg-ink-950/80 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        tabIndex={-1}
        className="animate-[rise_0.45s_cubic-bezier(0.16,1,0.3,1)_both] relative w-full max-w-md rounded-t-3xl border border-white/10 bg-ink-900 shadow-2xl shadow-black/60 outline-none sm:rounded-3xl"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-mist-300 transition hover:bg-white/10 hover:text-white"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
        {children}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Premium flow — mock GPay QR + route to the waitlist                        */
/* -------------------------------------------------------------------------- */

export function PremiumModal({
  product,
  onClose,
}: {
  product: Product;
  onClose: () => void;
}) {
  const router = useRouter();
  const [leaving, setLeaving] = useState(false);

  const upiId = process.env.NEXT_PUBLIC_UPI_ID || "stormproof@okhdfcbank";
  const upiName = process.env.NEXT_PUBLIC_UPI_NAME || "Stormproof";
  const upiPayload =
    `upi://pay?pa=${upiId}&pn=${encodeURIComponent(upiName)}` +
    `&am=${product.priceInr}&cu=INR&tn=${encodeURIComponent(product.name)}`;

  useEffect(() => {
    router.prefetch("/waitlist");
  }, [router]);

  function goToWaitlist() {
    setLeaving(true);
    rememberChoice(product.id);
    router.push(`/waitlist?product=${encodeURIComponent(product.id)}`);
  }

  return (
    <ModalShell onClose={onClose} labelledBy="premium-modal-title">
      <div className="px-6 pt-8 pb-7 sm:px-8">
        <p className="text-[11px] font-semibold tracking-[0.2em] text-storm-400 uppercase">
          Checkout
        </p>
        <h2 id="premium-modal-title" className="mt-2 text-xl font-semibold text-white">
          {product.name}
        </h2>
        <p className="mt-1 text-sm text-mist-400">{product.tagline}</p>

        <div className="mt-5 flex items-baseline gap-3">
          <span className="text-3xl font-bold text-white">
            {formatInr(product.priceInr)}
          </span>
          {product.compareAtInr ? (
            <span className="text-sm text-mist-400 line-through">
              {formatInr(product.compareAtInr)}
            </span>
          ) : null}
          <span className="ml-auto rounded-full bg-emerald-400/10 px-2.5 py-1 text-[11px] font-medium text-emerald-300">
            Free delivery
          </span>
        </div>

        <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <div className="mx-auto w-full max-w-[210px]">
            <div className="rounded-2xl bg-white p-3 shadow-lg shadow-black/30">
              <QrCode value={upiPayload} className="h-auto w-full" />
            </div>
          </div>

          <div className="mt-4 flex items-center justify-center gap-2 text-sm font-medium text-white">
            <GPayMark />
            <span>Scan to pay with GPay</span>
          </div>
          <p className="mt-1.5 text-center text-xs text-mist-400">
            Also works with PhonePe, Paytm &amp; any UPI app
          </p>

          <p className="mt-4 rounded-xl bg-amber-glow/10 px-3 py-2.5 text-center text-[11px] leading-relaxed text-amber-200">
            Demo QR — this is a concept test, no payment can be taken.
          </p>
        </div>

        <button
          type="button"
          onClick={goToWaitlist}
          disabled={leaving}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-storm-500 to-indigo-500 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-storm-500/25 transition hover:brightness-110 active:scale-[0.99] disabled:opacity-70"
        >
          {leaving ? "Taking you there…" : "Or click here to continue"}
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </button>

        <p className="mt-3 text-center text-xs text-mist-400">
          Reserve your unit from the first production run — no card needed.
        </p>
      </div>
    </ModalShell>
  );
}

function GPayMark() {
  return (
    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white">
      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" aria-hidden="true">
        <path fill="#4285F4" d="M22.5 12.2c0-.8-.07-1.4-.2-2.1H12v3.9h6c-.13 1-.77 2.6-2.2 3.6l3.4 2.6c2-1.8 3.3-4.6 3.3-8Z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.47-2.69c-.93.65-2.17 1.1-3.81 1.1-2.9 0-5.37-1.92-6.25-4.57l-3.57 2.76C3.99 20.5 7.7 23 12 23Z" />
        <path fill="#FBBC05" d="M5.75 14.18a6.6 6.6 0 0 1 0-4.36L2.18 7.06a11 11 0 0 0 0 9.88l3.57-2.76Z" />
        <path fill="#EA4335" d="M12 4.8c2.05 0 3.44.88 4.23 1.62l3.08-3C17.44 1.7 14.97.6 12 .6 7.7.6 3.99 3.1 2.18 7.06l3.57 2.76C6.63 7.17 9.1 4.8 12 4.8Z" />
      </svg>
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* Standard flow — the "why did you go cheap?" MCQ                            */
/* -------------------------------------------------------------------------- */

export function StandardModal({
  product,
  onClose,
}: {
  product: Product;
  onClose: () => void;
}) {
  const [answer, setAnswer] = useState<string | null>(null);
  const [otherText, setOtherText] = useState("");
  const [state, setState] = useState<"asking" | "saving" | "done">("asking");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!answer) return;
    setState("saving");
    await post("/api/survey", {
      productId: product.id,
      answerCode: answer,
      otherText: answer === "D" ? otherText : undefined,
    });
    setState("done");
  }

  return (
    <ModalShell onClose={onClose} labelledBy="standard-modal-title">
      {state === "done" ? (
        <div className="px-6 py-12 text-center sm:px-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-400/10">
            <svg viewBox="0 0 24 24" className="h-7 w-7 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </div>
          <h2 id="standard-modal-title" className="mt-5 text-xl font-semibold text-white">
            Thanks — that's genuinely useful.
          </h2>
          <p className="mx-auto mt-2 max-w-xs text-sm text-mist-400">
            One honest answer tells us more than a hundred page views. We're
            building around it.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="mt-7 w-full rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Back to the comparison
          </button>
        </div>
      ) : (
        <form onSubmit={submit} className="px-6 pt-8 pb-7 sm:px-8">
          <p className="text-[11px] font-semibold tracking-[0.2em] text-mist-400 uppercase">
            Quick question · 1 tap
          </p>
          <h2 id="standard-modal-title" className="mt-2 text-xl font-semibold text-white">
            Why did you choose this option?
          </h2>
          <p className="mt-1 text-sm text-mist-400">
            You picked the {formatInr(product.priceInr)} {product.name}. No wrong
            answer — we just want the real one.
          </p>

          <div className="mt-6 space-y-2.5">
            {STANDARD_SURVEY_OPTIONS.map((option) => {
              const selected = answer === option.code;
              return (
                <label
                  key={option.code}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3.5 text-sm transition ${
                    selected
                      ? "border-storm-400/60 bg-storm-400/10 text-white"
                      : "border-white/10 bg-white/[0.02] text-mist-200 hover:border-white/20 hover:bg-white/5"
                  }`}
                >
                  <input
                    type="radio"
                    name="survey"
                    value={option.code}
                    checked={selected}
                    onChange={() => setAnswer(option.code)}
                    className="sr-only"
                  />
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                      selected
                        ? "bg-storm-500 text-white"
                        : "bg-white/5 text-mist-400"
                    }`}
                  >
                    {option.code}
                  </span>
                  <span className="leading-snug">{option.label}</span>
                </label>
              );
            })}
          </div>

          {answer === "D" ? (
            <input
              type="text"
              autoFocus
              value={otherText}
              maxLength={200}
              onChange={(e) => setOtherText(e.target.value)}
              placeholder="Tell us in a few words…"
              className="mt-3 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder:text-mist-400/70 focus:border-storm-400/60"
            />
          ) : null}

          <button
            type="submit"
            disabled={!answer || state === "saving"}
            className="mt-6 w-full rounded-xl bg-white px-5 py-3.5 text-sm font-semibold text-ink-950 transition hover:bg-mist-200 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {state === "saving" ? "Saving…" : "Submit answer"}
          </button>
        </form>
      )}
    </ModalShell>
  );
}
