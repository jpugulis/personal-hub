/**
 * /api/gate — sign in to the shared expense pages.
 *
 *   GET     → { authed: boolean }
 *   POST    ← { password }   → sets the session cookie
 *   DELETE  → clears it
 */

const { TTL_MS, isAuthed, mintToken, passwordIsCorrect, setCookie } = require("./_auth");

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");

  if (req.method === "GET") {
    return res.status(200).json({
      authed: isAuthed(req),
      configured: Boolean(process.env.TRIP_PASSWORD),
    });
  }

  if (req.method === "POST") {
    if (!process.env.TRIP_PASSWORD) {
      return res.status(500).json({ error: "TRIP_PASSWORD nav uzstādīts" });
    }
    const body = typeof req.body === "string"
      ? JSON.parse(req.body || "{}")
      : req.body || {};

    if (!passwordIsCorrect(body.password)) {
      // Slow down guessing a little without holding the function open long.
      await new Promise((r) => setTimeout(r, 600));
      return res.status(401).json({ error: "Nepareiza parole" });
    }

    setCookie(res, mintToken(), Math.floor(TTL_MS / 1000));
    return res.status(200).json({ authed: true });
  }

  if (req.method === "DELETE") {
    setCookie(res, "", 0);
    return res.status(200).json({ authed: false });
  }

  res.setHeader("Allow", "GET, POST, DELETE");
  return res.status(405).json({ error: "method not allowed" });
};
