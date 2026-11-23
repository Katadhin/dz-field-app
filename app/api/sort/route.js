import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminEnabled, verifyAdminToken, ADMIN_COOKIE } from "../../../lib/adminAuth";
import { sortNote, sorterReady } from "../../../lib/sorter";

export const dynamic = "force-dynamic";

export async function POST(req) {
  // Admin only: this endpoint spends Claude credits, so it stays behind the gate.
  if (!adminEnabled()) {
    return NextResponse.json({ ok: false, error: "admin off" }, { status: 401 });
  }
  const token = cookies().get(ADMIN_COOKIE)?.value;
  if (!verifyAdminToken(token)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  if (!sorterReady()) {
    return NextResponse.json({ ok: false, error: "no_key" }, { status: 400 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad request" }, { status: 400 });
  }

  const text = (body?.note_text || "").trim();
  if (!text) {
    return NextResponse.json({ ok: false, error: "empty" }, { status: 400 });
  }

  try {
    const entries = await sortNote(text);
    return NextResponse.json({ ok: true, entries });
  } catch {
    return NextResponse.json({ ok: false, error: "sort_failed" }, { status: 502 });
  }
}
