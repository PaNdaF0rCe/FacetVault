import crypto from "crypto";

function klingJWT(accessKey, secretKey) {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const now = Math.floor(Date.now() / 1000);
  const payload = Buffer.from(JSON.stringify({ iss: accessKey, exp: now + 1800, nbf: now - 5 })).toString("base64url");
  const sig = crypto.createHmac("sha256", secretKey).update(`${header}.${payload}`).digest("base64url");
  return `${header}.${payload}.${sig}`;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { prompt, provider = "luma", aspectRatio = "9:16" } = req.body || {};
  if (!prompt) return res.status(400).json({ error: "prompt required" });

  // ── Luma Dream Machine (video) ────────────────────────────────────────────
  // Requires LUMA_DREAM_MACHINE_KEY from lumalabs.ai → Dream Machine → API settings
  // (different from the Luma Agents key used for images)
  if (provider === "luma") {
    const key = process.env.LUMA_DREAM_MACHINE_KEY;
    if (!key) return res.status(500).json({ error: "LUMA_DREAM_MACHINE_KEY not configured — get it from lumalabs.ai Dream Machine API settings" });

    const r = await fetch("https://api.lumalabs.ai/dream-machine/v1/generations", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, aspect_ratio: aspectRatio, loop: false }),
    });

    if (!r.ok) {
      const e = await r.json().catch(() => ({}));
      return res.status(r.status).json({ error: e.detail || e.message || `Luma error ${r.status}` });
    }

    const data = await r.json();
    return res.json({ generationId: data.id, provider: "luma", status: data.state });
  }

  // ── Kling AI ──────────────────────────────────────────────────────────────
  if (provider === "kling") {
    const accessKey = process.env.KLING_ACCESS_KEY;
    const secretKey = process.env.KLING_SECRET_KEY;
    if (!accessKey || !secretKey) {
      return res.status(500).json({ error: "KLING_ACCESS_KEY and KLING_SECRET_KEY both required" });
    }

    const token = klingJWT(accessKey, secretKey);

    const r = await fetch("https://api.klingai.com/v1/videos/text2video", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "kling-v1",
        prompt,
        aspect_ratio: aspectRatio,
        duration: "5",
        mode: "std",
      }),
    });

    if (!r.ok) {
      const e = await r.json().catch(() => ({}));
      return res.status(r.status).json({ error: e.message || `Kling error ${r.status}` });
    }

    const data = await r.json();
    return res.json({ generationId: data.data?.task_id, provider: "kling", status: "pending" });
  }

  return res.status(400).json({ error: "Unknown provider. Use 'luma' or 'kling'" });
}
