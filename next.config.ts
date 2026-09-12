import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    /**
     * The four product illustrations in /public/images are hand-authored SVGs
     * that ship with this repo. No remotePatterns are configured, so the image
     * optimiser will not fetch SVGs from anywhere else; the CSP below keeps
     * them inert regardless. Swap these for photographs and you can drop both
     * lines.
     */
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
