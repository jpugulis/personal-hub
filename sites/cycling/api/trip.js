/**
 * /api/trip — shared state for the cycling expense pages.
 *
 *   GET  /api/trip?key=latvia-2026-xxxx   → { rev, updated, data } | null
 *   PUT  /api/trip?key=latvia-2026-xxxx   ← { data }  → { rev, updated }
 *
 * Storage: Upstash Redis via its REST API — no npm dependency, plain fetch.
 * Env vars are injected automatically when you connect the database in
 * Vercel → Storage. Both naming conventions are accepted.
 */

const REDIS_URL   = process.env.KV_REST_API_URL   || process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

const KEY_RE = /^[A-Za-z0-9_-]{6,64}$/;
const MAX_BYTES = 100 * 1024;

async function redis(command) {
  const r = await fetch(REDIS_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${REDIS_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify(command),
  });
  if (!r.ok) throw new Error(`redis ${r.status}: ${await r.text()}`);
  return (await r.json()).result;
}

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");

  if (!REDIS_URL || !REDIS_TOKEN) {
    return res.status(500).json({ error: "storage not configured — connect Upstash Redis in Vercel → Storage" });
  }

  const key = (req.query.key || "").toString();
  if (!KEY_RE.test(key)) return res.status(400).json({ error: "bad trip key" });
  const rk = `trip:${key}`;

  try {
    if (req.method === "GET") {
      const raw = await redis(["GET", rk]);
      return res.status(200).json(raw ? JSON.parse(raw) : null);
    }

    if (req.method === "PUT") {
      const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
      if (!body.data || typeof body.data !== "object") {
        return res.status(400).json({ error: "missing data" });
      }
      const payload = JSON.stringify(body.data);
      if (payload.length > MAX_BYTES) return res.status(413).json({ error: "payload too large" });

      const prevRaw = await redis(["GET", rk]);
      const prev = prevRaw ? JSON.parse(prevRaw) : null;
      const next = { rev: (prev?.rev || 0) + 1, updated: Date.now(), data: body.data };
      await redis(["SET", rk, JSON.stringify(next)]);
      return res.status(200).json({ rev: next.rev, updated: next.updated });
    }

    res.setHeader("Allow", "GET, PUT");
    return res.status(405).json({ error: "method not allowed" });
  } catch (err) {
    return res.status(502).json({ error: String(err.message || err) });
  }
};
