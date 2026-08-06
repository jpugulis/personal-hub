/**
 * Safety net for the expense-page password gate.
 *
 * The lock has to hold on the server — the ledger is shared state in Redis,
 * so a check in the browser would stop nobody. This exercises the token
 * logic directly: signatures, expiry, cookie parsing, that changing the
 * password kills old sessions, and above all that an unconfigured deploy
 * fails closed rather than open.
 *
 *   node scripts/test_gate.js
 */

const fs = require("node:fs");
const path = require("node:path");

const API = path.join(__dirname, "..", "sites", "cycling", "api");

process.env.TRIP_PASSWORD = "test-password";
const auth = require(path.join(API, "_auth.js"));

let failures = 0;
const ok = (name, passed, detail = "") => {
  if (!passed) failures++;
  console.log(`${passed ? "  ok  " : "FAIL  "}${name}${detail ? " — " + detail : ""}`);
};
const req = (cookie) => ({ headers: cookie ? { cookie } : {} });

/* ---- password ---------------------------------------------------- */
ok("correct password accepted", auth.passwordIsCorrect("test-password"));
ok("one extra character rejected", !auth.passwordIsCorrect("test-passwordd"));
ok("truncated rejected", !auth.passwordIsCorrect("test-passwor"));
ok("empty rejected", !auth.passwordIsCorrect(""));
ok("undefined rejected", !auth.passwordIsCorrect(undefined));
ok("case sensitive", !auth.passwordIsCorrect("Test-Password"));

/* ---- token ------------------------------------------------------- */
const tok = auth.mintToken();
ok("fresh token valid", auth.tokenIsValid(tok));
ok("tampered signature rejected", !auth.tokenIsValid(tok.slice(0, -3) + "aaa"));
ok("forged expiry rejected", !auth.tokenIsValid("9".repeat(13) + "." + tok.split(".")[1]));
ok("expired token rejected", !auth.tokenIsValid("1000000000000." + tok.split(".")[1]));
ok("garbage rejected", !auth.tokenIsValid("nope"));
ok("empty rejected", !auth.tokenIsValid(""));

/* ---- cookie ------------------------------------------------------ */
ok("no cookie is not authed", !auth.isAuthed(req()));
ok("valid cookie is authed", auth.isAuthed(req(`trip_auth=${encodeURIComponent(tok)}`)));
ok("found among other cookies", auth.isAuthed(req(`a=1; trip_auth=${encodeURIComponent(tok)}; b=2`)));
ok("different cookie name ignored", !auth.isAuthed(req(`other=${encodeURIComponent(tok)}`)));

/* ---- rotation and misconfiguration -------------------------------- */
process.env.TRIP_PASSWORD = "a-different-password";
ok("changing the password kills old sessions",
   !auth.isAuthed(req(`trip_auth=${encodeURIComponent(tok)}`)));

delete process.env.TRIP_PASSWORD;
ok("unconfigured deploy fails closed",
   !auth.isAuthed(req(`trip_auth=${encodeURIComponent(tok)}`)));
ok("unconfigured accepts no password", !auth.passwordIsCorrect(""));

/* ---- the endpoint actually uses it -------------------------------- */
const trip = fs.readFileSync(path.join(API, "trip.js"), "utf8");
ok("trip.js refuses before reaching storage",
   trip.indexOf("isAuthed") < trip.indexOf("REDIS_URL || !REDIS_TOKEN"));
ok("trip.js gates reads as well as writes",
   trip.indexOf("isAuthed") < trip.indexOf('req.method === "GET"'));

const page = fs.readFileSync(
  path.join(__dirname, "..", "sites", "cycling", "expenses-2026", "index.html"), "utf8");
ok("page never ships the password", !/kaska/i.test(page));
ok("page handles an expired session", (page.match(/status===401/g) || []).length === 2);
ok("ledger starts hidden", /<div id="app" hidden>/.test(page));

console.log(failures ? `\n${failures} FAILED` : "\ngate verified");
process.exit(failures ? 1 : 0);
