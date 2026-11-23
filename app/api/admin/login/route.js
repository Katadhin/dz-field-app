import { NextResponse } from "next/server";
import { checkPasscode, makeAdminToken, adminEnabled, ADMIN_COOKIE, ADMIN_MAX_AGE } from "../../../../lib/adminAuth";

export const dynamic = "force-dynamic";

// Redirect with a relative Location so the browser resolves it against the
// public URL. Building an absolute URL from req.url points at Render's internal
// host (localhost:10000), which the browser cannot open.
function redirectTo(path) {
  return new NextResponse(null, { status: 303, headers: { Location: path } });
}

export async function POST(req) {
  if (!adminEnabled()) {
    return redirectTo("/admin");
  }

  let passcode = "";
  try {
    const form = await req.formData();
    passcode = form.get("passcode") || "";
  } catch {
    passcode = "";
  }

  if (!checkPasscode(passcode)) {
    return redirectTo("/admin/login?error=1");
  }

  const res = redirectTo("/admin");
  res.cookies.set(ADMIN_COOKIE, makeAdminToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ADMIN_MAX_AGE,
  });
  return res;
}
