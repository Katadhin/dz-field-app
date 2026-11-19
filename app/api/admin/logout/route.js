import { NextResponse } from "next/server";
import { ADMIN_COOKIE } from "../../../../lib/adminAuth";

export const dynamic = "force-dynamic";

export async function POST(req) {
  const origin = new URL(req.url).origin;
  const res = NextResponse.redirect(new URL("/admin/login", origin), 303);
  res.cookies.set(ADMIN_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return res;
}
