/**
 * Shared password gate for the expense pages.
 *
 * Vercel does not treat files starting with "_" as routes, so this is a
 * plain helper module rather than an endpoint.
 *
 * The protection has to live here, on the server, not in the page. The
 * expense ledger is shared state in Redis: anyone who knows the URL could
 * PUT to /api/trip straight from a terminal and overwrite everyone's
 * numbers. A password checked in the browser would stop nobody.
 *
 * Environment variable, set on the cycling Vercel project:
 *
 *   TRIP_PASSWORD   the password typed on the expenses page
 *   TRIP_SECRET     optional; signs the cookie. Defaults to TRIP_PASSWORD,
 *                   which conveniently invalidates every session whenever
 *                   the password is changed.
 */

const crypto = require("crypto");

const COOKIE = "trip_auth";
const TTL_MS = 1000 * 60 * 60 * 24 * 30; // a month — it is a trip, not a bank

function secret() {
  return process.env.TRIP_SECRET || process.env.TRIP_PASSWORD || "";
}

function sign(payload) {
  return crypto.createHmac("sha256", secret()).update(payload).digest("base64url");
}

function safeEqual(a, b) {
  const ab = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  if (ab.length !== bb.length) {
    // Still burn a comparison so the timing does not reveal the length.
    crypto.timingSafeEqual(ab, ab);
    return false;
  }
  return crypto.timingSafeEqual(ab, bb);
}

function mintToken() {
  const payload = String(Date.now() + TTL_MS);
  return `${payload}.${sign(payload)}`;
}

function tokenIsValid(token) {
  if (!token) return false;
  const [payload, mac] = String(token).split(".");
  if (!payload || !mac) return false;
  const expires = Number(payload);
  if (!Number.isFinite(expires) || expires < Date.now()) return false;
  return safeEqual(mac, sign(payload));
}

function readCookie(req, name) {
  const raw = req.headers.cookie || "";
  for (const part of raw.split(";")) {
    const [k, ...v] = part.trim().split("=");
    if (k === name) return decodeURIComponent(v.join("="));
  }
  return null;
}

/** True when the request carries a valid gate cookie. */
function isAuthed(req) {
  if (!process.env.TRIP_PASSWORD) return false; // fail closed
  return tokenIsValid(readCookie(req, COOKIE));
}

function setCookie(res, value, maxAgeSeconds) {
  res.setHeader("Set-Cookie", [
    `${COOKIE}=${encodeURIComponent(value)}`,
    "HttpOnly",
    "Secure",
    "SameSite=Lax",
    "Path=/",
    `Max-Age=${maxAgeSeconds}`,
  ].join("; "));
}

function passwordIsCorrect(input) {
  const expected = process.env.TRIP_PASSWORD;
  if (!expected) return false;
  return safeEqual(input || "", expected);
}

module.exports = {
  COOKIE,
  TTL_MS,
  isAuthed,
  mintToken,
  passwordIsCorrect,
  setCookie,
  tokenIsValid,
};
