"use client";

import { useCallback, useEffect, useState } from "react";
import ProductCard from "@/components/ProductCard";
import { PremiumModal, StandardModal } from "@/components/Modals";
import { CATEGORIES, PRODUCTS, type Product } from "@/lib/products";
import { trackCardClick, trackPageView } from "@/lib/analytics";

export default function Home() {
  const [selected, setSelected] = useState<Product | null>(null);

  useEffect(() => {
    trackPageView("/");
  }, []);

  const handleSelect = useCallback((product: Product) => {
    trackCardClick(product.id);
    setSelected(product);
  }, []);

  const closeModal = useCallback(() => setSelected(null), []);

  return (
    <main className="relative mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6 lg:px-8">
      <Nav />
      <Hero />

      <div className="mt-16 space-y-20 sm:mt-24 sm:space-y-28">
        {CATEGORIES.map((category) => {
          const items = PRODUCTS.filter((p) => p.category === category.id);
          return (
            <section key={category.id} id={category.id} className="scroll-mt-24">
              <header className="max-w-2xl">
                <p className="text-[11px] font-semibold tracking-[0.25em] text-storm-400 uppercase">
                  {category.eyebrow}
                </p>
                <h2 className="mt-3 text-2xl font-bold text-balance text-white sm:text-3xl">
                  {category.title}
                </h2>
                <p className="mt-3 text-[15px] leading-relaxed text-mist-400">
                  {category.blurb}
                </p>
              </header>

              <div className="relative mt-8 grid gap-5 sm:grid-cols-2 sm:gap-6">
                {items.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onSelect={handleSelect}
                  />
                ))}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute top-1/2 left-1/2 hidden h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-ink-900 text-[11px] font-bold tracking-wider text-mist-400 sm:flex"
                >
                  VS
                </span>
              </div>
            </section>
          );
        })}
      </div>

      <Proof />
      <Footer />

      {selected?.tier === "premium" ? (
        <PremiumModal product={selected} onClose={closeModal} />
      ) : null}
      {selected?.tier === "standard" ? (
        <StandardModal product={selected} onClose={closeModal} />
      ) : null}
    </main>
  );
}

/* -------------------------------------------------------------------------- */

function Nav() {
  return (
    <nav className="flex items-center justify-between py-6">
      <div className="flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-storm-400 to-indigo-500 shadow-lg shadow-storm-500/25">
          <svg viewBox="0 0 24 24" className="h-5 w-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3a9 9 0 0 1 9 9H3a9 9 0 0 1 9-9Z" />
            <path d="M12 12v6.5a2.5 2.5 0 0 1-5 0" />
          </svg>
        </span>
        <span className="text-[15px] font-semibold tracking-tight text-white">
          Stormproof
        </span>
      </div>
      <div className="hidden items-center gap-7 text-sm text-mist-400 sm:flex">
        <a href="#umbrella" className="transition hover:text-white">Umbrellas</a>
        <a href="#rainwear" className="transition hover:text-white">Rainwear</a>
      </div>
      <a
        href="/waitlist"
        className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/10 sm:text-sm"
      >
        Join waitlist
      </a>
    </nav>
  );
}

function Hero() {
  return (
    <header className="pt-10 pb-2 text-center sm:pt-16">
      <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-[11px] font-medium text-mist-300 sm:text-xs">
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-storm-400 opacity-75" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-storm-400" />
        </span>
        Founding drop · Monsoon 2026
      </span>

      <h1 className="mx-auto mt-6 max-w-3xl text-4xl leading-[1.08] font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl">
        <span className="text-gradient">Rain gear that survives</span>
        <br />
        <span className="text-white">an Indian monsoon.</span>
      </h1>

      <p className="mx-auto mt-5 max-w-xl text-[15px] leading-relaxed text-balance text-mist-400 sm:text-base">
        Wind-stable umbrellas and breathable transit rainwear — engineered for a
        40-minute commute, not a 40-second dash to the car.
      </p>

      <div className="mx-auto mt-8 flex max-w-md flex-col items-center justify-center gap-3 sm:flex-row">
        <a
          href="#umbrella"
          className="w-full rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-ink-950 transition hover:bg-mist-200 sm:w-auto"
        >
          Compare the options
        </a>
        <a
          href="/waitlist"
          className="w-full rounded-xl border border-white/10 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10 sm:w-auto"
        >
          Join the waitlist
        </a>
      </div>

      <dl className="mx-auto mt-12 grid max-w-lg grid-cols-3 gap-3 sm:gap-6">
        {[
          { k: "90 km/h", v: "Wind tested" },
          { k: "10k/10k", v: "Breathability" },
          { k: "2 yrs", v: "Frame warranty" },
        ].map((stat) => (
          <div
            key={stat.k}
            className="rounded-2xl border border-white/8 bg-white/[0.02] px-3 py-4"
          >
            <dt className="text-base font-bold text-white sm:text-lg">{stat.k}</dt>
            <dd className="mt-0.5 text-[11px] text-mist-400 sm:text-xs">{stat.v}</dd>
          </div>
        ))}
      </dl>
    </header>
  );
}

function Proof() {
  return (
    <section className="mt-20 rounded-3xl border border-white/8 bg-white/[0.02] p-7 sm:mt-28 sm:p-10">
      <div className="grid gap-8 sm:grid-cols-3">
        {[
          {
            title: "Built for the wind, not the drizzle",
            body: "An asymmetric canopy turns into a gust instead of fighting it. That single design choice is why cheap umbrellas invert and ours doesn't.",
          },
          {
            title: "Dry outside, dry inside",
            body: "A PVC sheet keeps rain out and sweat in. A 3-layer membrane lets vapour leave, so you arrive presentable instead of merely un-rained-on.",
          },
          {
            title: "Priced to last a decade",
            body: "Two ₹399 umbrellas a season for ten years is ₹8,000 and twenty ruined commutes. One good one is ₹2,499.",
          },
        ].map((item) => (
          <div key={item.title}>
            <h3 className="text-[15px] font-semibold text-white">{item.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-mist-400">{item.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="mt-16 border-t border-white/8 pt-8 text-center sm:mt-24">
      <p className="text-xs text-mist-400">
        Stormproof is a concept in validation. Nothing on this page can take a
        payment yet.
      </p>
      <p className="mt-2 text-xs text-mist-400/70">
        © {new Date().getFullYear()} Stormproof · Made in India
      </p>
    </footer>
  );
}
