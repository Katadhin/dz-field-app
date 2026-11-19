import crypto from "crypto";

const COOKIE = "dz_admin";
const MAX_AGE_SECONDS = 12 * 60 * 60;

function secret() {
  return process.env.SESSION_SECRET || "dev-insecure-secret-change-me";
}

function hmac(data) {
  return crypto.createHmac("sha256", secret()).update(data).digest("base64url");
}

function timingEqual(a, b) {
  const ab = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

export const ADMIN_COOKIE = COOKIE;
export const ADMIN_MAX_AGE = MAX_AGE_SECONDS;

export function adminEnabled() {
  return Boolean(process.env.ADMIN_PASSCODE);
}

export function checkPasscode(input) {
  const pass = process.env.ADMIN_PASSCODE;
  if (!pass) return false;
  return timingEqual(input, pass);
}

export function makeAdminToken() {
  const payload = Buffer.from(JSON.stringify({ iat: Date.now() })).toString("base64url");
  return `${payload}.${hmac(payload)}`;
}

export function verifyAdminToken(token) {
  if (!token || typeof token !== "string") return false;
  const dot = token.indexOf(".");
  if (dot < 1) return false;
  const payload = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  if (!timingEqual(sig, hmac(payload))) return false;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString());
    if (typeof data.iat !== "number") return false;
    if (Date.now() - data.iat > MAX_AGE_SECONDS * 1000) return false;
    return true;
  } catch {
    return false;
  }
}
