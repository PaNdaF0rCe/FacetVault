/**
 * Vercel Cron — bot wake-up ping
 *
 * Fires 5 minutes before the scheduled post time to prevent
 * Render cold-start delays:
 *   Weekdays  → 6:55 PM LKA (1:25 PM UTC)
 *   Weekends  → 6:25 PM LKA (12:55 PM UTC)
 *
 * Just hits the bot's health endpoint so Render spins it up
 * in time for the actual post.
 */
export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const botUrl = process.env.BOT_URL || "https://facetvaultbot.onrender.com";

  try {
    console.log(`[wake-bot] Pinging ${botUrl}/`);

    const response = await fetch(`${botUrl}/`, {
      method: "GET",
      signal: AbortSignal.timeout(20_000),
    });

    const text = await response.text();
    console.log(`[wake-bot] Bot responded: ${text}`);

    return res.status(200).json({ ok: true, botStatus: text });
  } catch (err) {
    // A timeout here just means Render is still waking — that's fine,
    // the request itself triggered the cold start.
    console.warn(`[wake-bot] Ping timed out or failed: ${err.message} (bot is waking up)`);
    return res.status(200).json({ ok: true, note: "Ping sent, bot waking up", error: err.message });
  }
}
