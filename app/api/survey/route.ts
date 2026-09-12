import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase";
import { getProduct, STANDARD_SURVEY_OPTIONS } from "@/lib/products";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/survey
 * Body: { sessionId, productId, answerCode: 'A'|'B'|'C'|'D', otherText? }
 *
 * Stores the "Why did you choose this option?" MCQ answer from people who
 * clicked a standard/cheap card.
 */
export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid json" }, { status: 400 });
  }

  const sessionId = typeof body.sessionId === "string" ? body.sessionId.slice(0, 100) : null;
  const product = typeof body.productId === "string" ? getProduct(body.productId) : undefined;
  const option = STANDARD_SURVEY_OPTIONS.find((o) => o.code === body.answerCode);

  if (!sessionId) {
    return NextResponse.json({ ok: false, error: "sessionId required" }, { status: 400 });
  }
  if (!product) {
    return NextResponse.json({ ok: false, error: "unknown productId" }, { status: 400 });
  }
  if (!option) {
    return NextResponse.json({ ok: false, error: "invalid answerCode" }, { status: 400 });
  }

  const supabase = getSupabaseServer();
  if (!supabase) {
    return NextResponse.json({ ok: true, skipped: "supabase not configured" });
  }

  const { error } = await supabase.from("standard_survey_responses").insert({
    session_id: sessionId,
    product_id: product.id,
    category: product.category,
    answer_code: option.code,
    answer_label: option.label,
    other_text:
      option.code === "D" && typeof body.otherText === "string"
        ? body.otherText.trim().slice(0, 500) || null
        : null,
  });

  if (error) {
    console.error("[survey] insert failed:", error.message);
    return NextResponse.json({ ok: false, error: "could not save response" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
