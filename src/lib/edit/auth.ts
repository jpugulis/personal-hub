import { cookies } from "next/headers";

/**
 * Session handling for /edit.
 *
 * There is one user. Rather than a user table, the password lives in an
 * environment variable and a successful login mints an HMAC-signed cookie.
 * Nothing secret is ever sent to the browser — only "valid until <time>"
 * plus a signature the server can check.
 *
 * Required environment variables (set in Vercel → Settings → Environment):
 *   EDIT_PASSWORD  the password typed on /edit
 *   EDIT_SECRET    a long random string used to sign the session cookie
 */

export const COOKIE = "atlas_edit";
const TTL_MS = 1000 * 60 * 60 * 24 * 14; // two weeks

const enc = new TextEncoder();

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`${name} is not set`);
  return v;
}

/** Constant-time comparison — never leaks how much of the password matched. */
function safeEqual(a: string, b: string): boolean {
  const ab = enc.encode(a);
  const bb = enc.encode(b);
  // Compare a fixed-length digest so differing lengths cannot short-circuit.
  let diff = ab.length ^ bb.length;
  const n = Math.max(ab.length, bb.length);
  for (let i = 0; i < n; i++) diff |= (ab[i] ?? 0) ^ (bb[i] ?? 0);
  return diff === 0;
}

async function sign(payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(requireEnv("EDIT_SECRET")),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const mac = await crypto.subtle.sign("HMAC", key, enc.encode(payload));
  return Buffer.from(mac).toString("base64url");
}

export async function mintToken(): Promise<{ value: string; maxAge: number }> {
  const expires = Date.now() + TTL_MS;
  const payload = String(expires);
  return {
    value: `${payload}.${await sign(payload)}`,
    maxAge: Math.floor(TTL_MS / 1000),
  };
}

export async function tokenIsValid(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const [payload, mac] = token.split(".");
  if (!payload || !mac) return false;
  const expires = Number(payload);
  if (!Number.isFinite(expires) || expires < Date.now()) return false;
  return safeEqual(mac, await sign(payload));
}

export function passwordIsCorrect(input: string): boolean {
  return safeEqual(input, requireEnv("EDIT_PASSWORD"));
}

/** True when the current request carries a valid editor session. */
export async function isEditor(): Promise<boolean> {
  const jar = await cookies();
  return tokenIsValid(jar.get(COOKIE)?.value);
}

/** Uniform 401 body — says nothing about why. */
export function unauthorized(): Response {
  return Response.json({ error: "unauthorized" }, { status: 401 });
}

/** Slow down brute force a little; serverless makes counters unreliable. */
export function penaltyDelay(): Promise<void> {
  return new Promise((r) => setTimeout(r, 700 + Math.random() * 500));
}
