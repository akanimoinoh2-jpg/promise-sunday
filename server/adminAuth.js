import { createHash, createHmac, timingSafeEqual } from "node:crypto";

const COOKIE_NAME = "promise_admin";
const SESSION_SECONDS = 60 * 60 * 12;

function hmac(value) {
  return createHmac("sha256", process.env.ADMIN_SESSION_SECRET).update(value).digest();
}

function passwordDigest(value) {
  return createHash("sha256").update(value, "utf8").digest();
}

export function adminConfigurationError() {
  if (!process.env.ADMIN_PASSWORD || !process.env.ADMIN_SESSION_SECRET) {
    return "Admin login is not configured. Set ADMIN_PASSWORD and ADMIN_SESSION_SECRET in Vercel.";
  }
  if (process.env.ADMIN_PASSWORD.length < 8 || process.env.ADMIN_SESSION_SECRET.length < 32) {
    return "Admin password must be at least 8 characters and session secret at least 32 characters.";
  }
  return "";
}

export function requestIsSameOrigin(req) {
  const origin = req.headers.origin;
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  if (!origin || !host) return false;
  try {
    return new URL(origin).host.toLowerCase() === String(host).toLowerCase();
  } catch {
    return false;
  }
}

export function setAdminCookie(res, maxAge) {
  const cookie = maxAge
    ? `${COOKIE_NAME}=${createSessionToken()}; HttpOnly; Secure; SameSite=Strict; Path=/api/admin; Max-Age=${maxAge}`
    : `${COOKIE_NAME}=; HttpOnly; Secure; SameSite=Strict; Path=/api/admin; Max-Age=0`;
  res.setHeader("Set-Cookie", cookie);
}

function createSessionToken() {
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_SECONDS;
  const expiry = String(expiresAt);
  return `${expiry}.${hmac(expiry).toString("base64url")}`;
}

function readCookie(req, name) {
  const cookieHeader = req.headers.cookie || "";
  const pair = cookieHeader.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${name}=`));
  return pair ? pair.slice(name.length + 1) : "";
}

export function hasValidAdminSession(req) {
  if (adminConfigurationError()) return false;
  const token = readCookie(req, COOKIE_NAME);
  const [expiry, signature, extra] = token.split(".");
  if (!expiry || !signature || extra || !/^\d+$/.test(expiry) || Number(expiry) <= Math.floor(Date.now() / 1000)) {
    return false;
  }
  try {
    const expected = hmac(expiry);
    const provided = Buffer.from(signature, "base64url");
    return provided.length === expected.length && timingSafeEqual(provided, expected);
  } catch {
    return false;
  }
}

export function matchesAdminPassword(password) {
  const actual = passwordDigest(password);
  const expected = passwordDigest(process.env.ADMIN_PASSWORD || "");
  return timingSafeEqual(actual, expected);
}

export function jsonResponse(res) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Content-Type", "application/json; charset=utf-8");
}
