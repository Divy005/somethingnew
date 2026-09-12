"use client";

import Image from "next/image";
import { formatInr, type Product } from "@/lib/products";

export default function ProductCard({
  product,
  onSelect,
}: {
  product: Product;
  onSelect: (product: Product) => void;
}) {
  const premium = product.tier === "premium";

  return (
    <button
      type="button"
      onClick={() => onSelect(product)}
      aria-label={`Choose ${product.name} at ${formatInr(product.priceInr)}`}
      className={`group relative flex w-full flex-col overflow-hidden rounded-3xl border text-left transition duration-300 ${
        premium
          ? "border-storm-400/30 bg-linear-to-b from-ink-800/90 to-ink-900/90 shadow-xl shadow-storm-500/10 hover:-translate-y-1 hover:border-storm-400/60 hover:shadow-2xl hover:shadow-storm-500/20"
          : "border-white/8 bg-ink-900/70 hover:-translate-y-1 hover:border-white/20"
      }`}
    >
      {premium ? (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 -top-px h-px bg-linear-to-r from-transparent via-storm-400 to-transparent"
        />
      ) : null}

      {/* Artwork */}
      <div
        className={`relative aspect-4/3 w-full overflow-hidden ${
          premium ? "bg-ink-850" : "bg-ink-900"
        }`}
      >
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 420px"
          className={`object-cover transition duration-500 group-hover:scale-[1.04] ${
            premium ? "" : "opacity-75 saturate-50"
          }`}
        />
        <span
          className={`absolute top-3 left-3 rounded-full px-3 py-1 text-[11px] font-semibold backdrop-blur-sm ${
            premium
              ? "bg-storm-500/90 text-white"
              : "bg-ink-950/70 text-mist-400"
          }`}
        >
          {product.badge}
        </span>
        <span
          className={`absolute top-3 right-3 rounded-full px-3 py-1 text-[11px] font-semibold tracking-wider uppercase backdrop-blur-sm ${
            premium
              ? "bg-white/10 text-storm-400"
              : "bg-white/5 text-mist-400"
          }`}
        >
          {premium ? "Premium" : "Standard"}
        </span>
      </div>

      {/* Copy */}
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <h3
          className={`text-lg font-semibold ${
            premium ? "text-white" : "text-mist-200"
          }`}
        >
          {product.name}
        </h3>
        <p className="mt-1 text-sm text-mist-400">{product.tagline}</p>

        <div className="mt-4 flex items-baseline gap-2.5">
          <span
            className={`text-2xl font-bold ${
              premium ? "text-white" : "text-mist-200"
            }`}
          >
            {formatInr(product.priceInr)}
          </span>
          {product.compareAtInr ? (
            <span className="text-sm text-mist-400 line-through">
              {formatInr(product.compareAtInr)}
            </span>
          ) : null}
        </div>

        <ul className="mt-4 flex-1 space-y-2.5">
          {product.bullets.map((bullet) => (
            <li key={bullet} className="flex gap-2.5 text-[13px] leading-snug">
              <span className="mt-0.5 shrink-0">
                {premium ? (
                  <svg viewBox="0 0 24 24" className="h-4 w-4 text-storm-400" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" className="h-4 w-4 text-mist-400/60" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                    <path d="M5 12h14" />
                  </svg>
                )}
              </span>
              <span className={premium ? "text-mist-200" : "text-mist-400"}>
                {bullet}
              </span>
            </li>
          ))}
        </ul>

        <span
          className={`mt-6 flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition ${
            premium
              ? "bg-linear-to-r from-storm-500 to-indigo-500 text-white shadow-lg shadow-storm-500/25 group-hover:brightness-110"
              : "border border-white/10 bg-white/5 text-mist-200 group-hover:bg-white/10"
          }`}
        >
          Buy now — {formatInr(product.priceInr)}
          <svg viewBox="0 0 24 24" className="h-4 w-4 transition group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </span>
      </div>
    </button>
  );
}
