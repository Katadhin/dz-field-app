import { NextResponse } from "next/server";
import { ADMIN_COOKIE } from "../../../../lib/adminAuth";

export const dynamic = "force-dynamic";

export async function POST() {
  // Relative Location so the browser resolves it against the public URL.
  const res = new NextResponse(null, { status: 303, headers: { Location: "/admin/login" } });
  res.cookies.set(ADMIN_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return res;
}
