import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Stormproof — Umbrellas & rainwear built for Indian monsoons",
  description:
    "Wind-stable umbrellas and breathable transit rainwear, engineered for a 40-minute Indian commute. Join the founding drop.",
  openGraph: {
    title: "Stormproof — built for Indian monsoons",
    description:
      "Wind-stable umbrellas and breathable transit rainwear. Join the founding drop.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#05070d",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="storm-bg min-h-dvh antialiased">{children}</body>
    </html>
  );
}
