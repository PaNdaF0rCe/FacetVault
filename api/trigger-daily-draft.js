/**
 * Vercel Cron — daily draft trigger
 *
 * Fires every day at 11:00 AM LKA (05:30 UTC).
 * Calls the FacetVault bot's /trigger-draft endpoint so it
 * generates the day's content and sends an FCM notification
 * to the admin app for review.
 *
 * Env vars required (same as other api/ functions):
 *   BOT_URL          — e.g. https://facetvaultbot.onrender.com
 *   ADMIN_API_KEY    — shared secret used by the bot's requireAdminKey middleware
 */
export default async function handler(req, res) {
  // Vercel cron sends GET requests; block anything else
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const botUrl   = process.env.BOT_URL || "https://facetvaultbot.onrender.com";
  const adminKey = process.env.ADMIN_API_KEY || "";

  const target = `${botUrl}/trigger-draft${adminKey ? `?key=${adminKey}` : ""}`;

  try {
    console.log(`[trigger-daily-draft] → ${botUrl}/trigger-draft`);

    const response = await fetch(target, {
      method: "GET",
      headers: { "x-admin-key": adminKey },
      // Render cold-starts can be slow — allow 25 s
      signal: AbortSignal.timeout(25_000),
    });

    const text = await response.text();

    if (!response.ok) {
      console.error(`[trigger-daily-draft] Bot returned ${response.status}: ${text}`);
      return res.status(502).json({ error: "Bot error", status: response.status, body: text });
    }

    console.log(`[trigger-daily-draft] Bot responded: ${text}`);
    return res.status(200).json({ ok: true, botResponse: text });
  } catch (err) {
    console.error("[trigger-daily-draft] Fetch failed:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
