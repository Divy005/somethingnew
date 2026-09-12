import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase";
import { getProduct } from "@/lib/products";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/track
 *
 * Two event types, one endpoint:
 *   { type: 'page_view',  sessionId, path, referrer? }
 *   { type: 'card_click', sessionId, productId }
 *
 * Always answers 200 with { ok: boolean }. A tracking failure must never
 * surface to the visitor or stop a modal from opening.
 */
export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid json" }, { status: 400 });
  }

  const sessionId = typeof body.sessionId === "string" ? body.sessionId.slice(0, 100) : null;
  const type = body.type;

  if (!sessionId) {
    return NextResponse.json({ ok: false, error: "sessionId required" }, { status: 400 });
  }

  const supabase = getSupabaseServer();
  if (!supabase) {
    // Supabase not wired up yet — the page still works, we just no-op.
    return NextResponse.json({ ok: false, skipped: "supabase not configured" });
  }

  if (type === "page_view") {
    const userAgent = req.headers.get("user-agent") ?? "";
    const { error } = await supabase.from("page_views").insert({
      session_id: sessionId,
      path: typeof body.path === "string" ? body.path.slice(0, 200) : "/",
      referrer: typeof body.referrer === "string" ? body.referrer.slice(0, 500) : null,
      user_agent: userAgent.slice(0, 500),
      device: /mobile|android|iphone|ipad/i.test(userAgent) ? "mobile" : "desktop",
      country: req.headers.get("x-vercel-ip-country"),
    });
    if (error) {
      console.error("[track] page_view insert failed:", error.message);
      return NextResponse.json({ ok: false, error: error.message });
    }
    return NextResponse.json({ ok: true });
  }

  if (type === "card_click") {
    const product = typeof body.productId === "string" ? getProduct(body.productId) : undefined;
    if (!product) {
      return NextResponse.json({ ok: false, error: "unknown productId" }, { status: 400 });
    }
    const { error } = await supabase.from("card_clicks").insert({
      session_id: sessionId,
      product_id: product.id,
      category: product.category,
      tier: product.tier,
      price_inr: product.priceInr,
    });
    if (error) {
      console.error("[track] card_click insert failed:", error.message);
      return NextResponse.json({ ok: false, error: error.message });
    }
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ ok: false, error: "unknown event type" }, { status: 400 });
}
