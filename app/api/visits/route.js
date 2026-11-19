import { NextResponse } from "next/server";
import { ensureVisitSchema, saveVisit } from "../../../lib/db";

export const dynamic = "force-dynamic";

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad request" }, { status: 400 });
  }

  const note_text = (body?.note_text || "").trim();
  if (!note_text) {
    return NextResponse.json({ ok: false, error: "note is empty" }, { status: 400 });
  }

  try {
    await ensureVisitSchema();
    const saved = await saveVisit({
      client_id: body.client_id,
      rep_name: body.rep_name,
      store_number: body.store_number,
      note_text,
      source: body.source,
      captured_at: body.captured_at,
    });
    return NextResponse.json({ ok: true, id: String(saved.id) });
  } catch (err) {
    // No database yet, or it is unreachable. The phone keeps the capture in its
    // outbox and tries again later.
    return NextResponse.json({ ok: false, error: "not saved" }, { status: 503 });
  }
}
