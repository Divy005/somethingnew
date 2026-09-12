"use client";

import { useMemo } from "react";

/**
 * Mock QR code.
 *
 * This renders a deterministic, QR-shaped pattern from the UPI payload string —
 * finder squares, alignment square, quiet zone and all. It is intentionally a
 * *mock*: this is a fake-door test, no money should ever move. Nothing here
 * encodes a real payment.
 *
 * When you go live, drop in a real encoder (e.g. `qrcode.react`) and pass the
 * same `value` string.
 */

const SIZE = 29; // modules per side, matches a QR version-3 grid

function hash(seed: string, i: number): number {
  let h = 2166136261 ^ i;
  for (let k = 0; k < seed.length; k++) {
    h ^= seed.charCodeAt(k);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967295;
}

function inFinder(r: number, c: number): boolean | null {
  const corners = [
    [0, 0],
    [0, SIZE - 7],
    [SIZE - 7, 0],
  ];
  for (const [fr, fc] of corners) {
    const dr = r - fr;
    const dc = c - fc;
    if (dr >= -1 && dr <= 7 && dc >= -1 && dc <= 7) {
      if (dr < 0 || dr > 6 || dc < 0 || dc > 6) return false; // separator
      const ring = Math.max(Math.abs(dr - 3), Math.abs(dc - 3));
      return ring !== 2; // 7x7 border + 3x3 centre, white ring between
    }
  }
  return null;
}

function inAlignment(r: number, c: number): boolean | null {
  const ar = SIZE - 9;
  const ac = SIZE - 9;
  const dr = r - ar;
  const dc = c - ac;
  if (dr >= 0 && dr <= 4 && dc >= 0 && dc <= 4) {
    const ring = Math.max(Math.abs(dr - 2), Math.abs(dc - 2));
    return ring !== 1;
  }
  return null;
}

function buildMatrix(value: string): boolean[][] {
  const grid: boolean[][] = [];
  for (let r = 0; r < SIZE; r++) {
    const row: boolean[] = [];
    for (let c = 0; c < SIZE; c++) {
      const finder = inFinder(r, c);
      if (finder !== null) {
        row.push(finder);
        continue;
      }
      const align = inAlignment(r, c);
      if (align !== null) {
        row.push(align);
        continue;
      }
      if (r === 6) {
        row.push(c % 2 === 0);
        continue;
      }
      if (c === 6) {
        row.push(r % 2 === 0);
        continue;
      }
      row.push(hash(value, r * SIZE + c) > 0.48);
    }
    grid.push(row);
  }
  return grid;
}

export default function QrCode({
  value,
  className = "",
}: {
  value: string;
  className?: string;
}) {
  const matrix = useMemo(() => buildMatrix(value), [value]);
  const quiet = 2;
  const total = SIZE + quiet * 2;

  return (
    <svg
      viewBox={`0 0 ${total} ${total}`}
      className={className}
      shapeRendering="crispEdges"
      role="img"
      aria-label="Mock UPI payment QR code — this is a demo and cannot take a payment"
    >
      <rect width={total} height={total} fill="#ffffff" rx="1.5" />
      {matrix.map((row, r) =>
        row.map((on, c) =>
          on ? (
            <rect
              key={`${r}-${c}`}
              x={c + quiet}
              y={r + quiet}
              width="1"
              height="1"
              fill="#0a0e18"
            />
          ) : null,
        ),
      )}
      {/* GPay-style centre mark */}
      <g>
        <rect
          x={total / 2 - 3.4}
          y={total / 2 - 3.4}
          width="6.8"
          height="6.8"
          rx="1.6"
          fill="#ffffff"
        />
        <path
          d={`M ${total / 2 - 2.2} ${total / 2 - 2.2} h4.4 v4.4 h-4.4 Z`}
          fill="none"
        />
        <circle cx={total / 2} cy={total / 2} r="2.4" fill="#0ea5e9" />
        <path
          d={`M ${total / 2 - 1.1} ${total / 2} l0.9 0.95 l1.5 -1.9`}
          stroke="#ffffff"
          strokeWidth="0.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </g>
    </svg>
  );
}
