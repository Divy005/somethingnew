import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import WaitlistForm from "@/components/WaitlistForm";

export const metadata: Metadata = {
  title: "Coming Soon — Join the Stormproof waitlist",
  description:
    "The founding drop opens soon. Leave your email and tell us the one reason you were ready to buy.",
};

export default function WaitlistPage() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col justify-center px-4 py-12 sm:px-6 sm:py-16">
      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-2 self-start text-sm text-mist-400 transition hover:text-white"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M11 18l-6-6 6-6" />
        </svg>
        Stormproof
      </Link>

      <div className="mb-8">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-[11px] font-medium text-mist-300">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-storm-400 opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-storm-400" />
          </span>
          Coming soon
        </span>
        <h1 className="mt-5 text-3xl leading-tight font-bold tracking-tight text-balance text-white sm:text-4xl">
          We're not shipping{" "}
          <span className="text-gradient">quite yet.</span>
        </h1>
        <p className="mt-4 text-[15px] leading-relaxed text-mist-400">
          The first production run is limited. Leave your email and you'll get
          first pick — plus founding-member pricing when it opens.
        </p>
      </div>

      <Suspense
        fallback={
          <div className="h-[420px] animate-pulse rounded-3xl border border-white/10 bg-ink-900/60" />
        }
      >
        <WaitlistForm />
      </Suspense>
    </main>
  );
}
