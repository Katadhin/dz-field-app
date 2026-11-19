import { NextResponse } from "next/server";
import { checkPasscode, makeAdminToken, adminEnabled, ADMIN_COOKIE, ADMIN_MAX_AGE } from "../../../../lib/adminAuth";

export const dynamic = "force-dynamic";

export async function POST(req) {
  const origin = new URL(req.url).origin;

  if (!adminEnabled()) {
    return NextResponse.redirect(new URL("/admin", origin), 303);
  }

  let passcode = "";
  try {
    const form = await req.formData();
    passcode = form.get("passcode") || "";
  } catch {
    passcode = "";
  }

  if (!checkPasscode(passcode)) {
    return NextResponse.redirect(new URL("/admin/login?error=1", origin), 303);
  }

  const res = NextResponse.redirect(new URL("/admin", origin), 303);
  res.cookies.set(ADMIN_COOKIE, makeAdminToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ADMIN_MAX_AGE,
  });
  return res;
}
