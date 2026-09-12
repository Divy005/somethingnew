export type Category = "umbrella" | "rainwear";
export type Tier = "premium" | "standard";

export type Product = {
  id: string;
  category: Category;
  tier: Tier;
  name: string;
  tagline: string;
  priceInr: number;
  compareAtInr?: number;
  badge: string;
  bullets: string[];
  /** Swap these for real photography when you have it (see README). */
  image: string;
};

export const CATEGORIES: {
  id: Category;
  eyebrow: string;
  title: string;
  blurb: string;
}[] = [
  {
    id: "umbrella",
    eyebrow: "01 — Umbrellas",
    title: "The last umbrella you'll buy this monsoon",
    blurb:
      "Same rain. Same wind. Two very different outcomes. Pick the one you'd actually carry.",
  },
  {
    id: "rainwear",
    eyebrow: "02 — Rainwear",
    title: "Arrive dry. Arrive presentable.",
    blurb:
      "Built for a 40-minute commute, not for standing still under a shed.",
  },
];

export const PRODUCTS: Product[] = [
  {
    id: "umbrella-premium",
    category: "umbrella",
    tier: "premium",
    name: "Stormproof Aero",
    tagline: "Wind-stable asymmetric canopy",
    priceInr: 2499,
    compareAtInr: 3200,
    badge: "Tested to 90 km/h",
    bullets: [
      "Asymmetric blunt-tip canopy — turns into the wind instead of inverting",
      "Fibreglass rib frame, memory-flex so it springs back, not snaps",
      "Teflon-coated fabric, shakes dry in 3 seconds",
      "2-year no-questions frame warranty",
    ],
    image: "/images/umbrella-premium.svg",
  },
  {
    id: "umbrella-standard",
    category: "umbrella",
    tier: "standard",
    name: "Basic Street Umbrella",
    tagline: "The one from the corner shop",
    priceInr: 399,
    badge: "Everyone has one",
    bullets: [
      "Steel ribs — bends at the first proper gust",
      "Flips inside-out and stays that way",
      "Soaks your bag on the way home",
      "Replaced roughly twice a season",
    ],
    image: "/images/umbrella-standard.svg",
  },
  {
    id: "rainwear-premium",
    category: "rainwear",
    tier: "premium",
    name: "Stormproof Transit Shell",
    tagline: "Breathable 3-layer commuter jacket",
    priceInr: 2999,
    compareAtInr: 3800,
    badge: "10k/10k breathable",
    bullets: [
      "3-layer membrane — waterproof outside, vented inside, no sauna effect",
      "Taped seams, storm flap, adjustable helmet-friendly hood",
      "Packs into its own pocket, fits a laptop sleeve",
      "Cut to look like a jacket, not like safety gear",
    ],
    image: "/images/rainwear-premium.svg",
  },
  {
    id: "rainwear-standard",
    category: "rainwear",
    tier: "standard",
    name: "Local Plastic Raincoat",
    tagline: "The ₹499 poncho",
    priceInr: 499,
    badge: "Wet either way",
    bullets: [
      "PVC sheet — zero breathability, you sweat through it",
      "Sticks to your arms, tears at the seams by August",
      "No hood adjustment, no pockets you can reach",
      "Looks exactly like everyone else's",
    ],
    image: "/images/rainwear-standard.svg",
  },
];

export function getProduct(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}

export function formatInr(value: number): string {
  return "₹" + value.toLocaleString("en-IN");
}

/** MCQ shown to anyone who picks a standard/cheap option. */
export const STANDARD_SURVEY_OPTIONS = [
  { code: "A", label: "It's cheaper" },
  { code: "B", label: "I tend to lose my umbrellas / rainwear" },
  { code: "C", label: "I don't care about the design" },
  { code: "D", label: "Other" },
] as const;

/** High-intent question shown on the waitlist page. */
export const WAITLIST_REASONS = [
  { value: "design", label: "Design" },
  { value: "wind_stability", label: "Wind-Stability" },
  { value: "brand_vibe", label: "Brand Vibe" },
  { value: "transit_comfort", label: "Transit Comfort" },
] as const;
