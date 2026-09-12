import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase";
import { getProduct, WAITLIST_REASONS } from "@/lib/products";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * POST /api/waitlist
 * Body: { sessionId, email, reason, productId? }
 *
 * Stores an email + the high-intent "#1 reason you were ready to buy" answer.
 * A repeat email is treated as success, not as an error — re-submitting should
 * never look like a failure to the visitor.
 */
export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid json" }, { status: 400 });
  }

  const sessionId = typeof body.sessionId === "string" ? body.sessionId.slice(0, 100) : null;
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const reason = WAITLIST_REASONS.find((r) => r.value === body.reason);
  const product = typeof body.productId === "string" ? getProduct(body.productId) : undefined;

  if (!sessionId) {
    return NextResponse.json({ ok: false, error: "sessionId required" }, { status: 400 });
  }
  if (!EMAIL_RE.test(email) || email.length > 254) {
    return NextResponse.json({ ok: false, error: "Please enter a valid email address." }, { status: 400 });
  }
  if (!reason) {
    return NextResponse.json({ ok: false, error: "Please pick a reason." }, { status: 400 });
  }

  const supabase = getSupabaseServer();
  if (!supabase) {
    return NextResponse.json({ ok: true, skipped: "supabase not configured" });
  }

  const { error } = await supabase.from("waitlist_signups").insert({
    session_id: sessionId,
    email,
    reason: reason.value,
    product_id: product?.id ?? null,
    category: product?.category ?? null,
  });

  // 23505 = unique_violation. Already on the list is still a win.
  if (error && error.code !== "23505") {
    console.error("[waitlist] insert failed:", error.message);
    return NextResponse.json(
      { ok: false, error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, alreadySubscribed: error?.code === "23505" });
}
