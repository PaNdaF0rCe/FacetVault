import crypto from "crypto";

function klingJWT(accessKey, secretKey) {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const now = Math.floor(Date.now() / 1000);
  const payload = Buffer.from(JSON.stringify({ iss: accessKey, exp: now + 1800, nbf: now - 5 })).toString("base64url");
  const sig = crypto.createHmac("sha256", secretKey).update(`${header}.${payload}`).digest("base64url");
  return `${header}.${payload}.${sig}`;
}

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const { id, provider = "luma" } = req.query;
  if (!id) return res.status(400).json({ error: "id required" });

  // ── Luma Dream Machine ────────────────────────────────────────────────────
  if (provider === "luma") {
    const key = process.env.LUMA_DREAM_MACHINE_KEY;
    if (!key) return res.status(500).json({ error: "LUMA_DREAM_MACHINE_KEY not configured" });

    const r = await fetch(`https://api.lumalabs.ai/dream-machine/v1/generations/${id}`, {
      headers: { Authorization: `Bearer ${key}` },
    });

    if (!r.ok) return res.status(r.status).json({ error: `Luma status check failed (${r.status})` });

    const data = await r.json();
    // Luma states: pending | dreaming | completed | failed
    const done = data.state === "completed";
    const failed = data.state === "failed";
    return res.json({
      status: done ? "completed" : failed ? "failed" : "processing",
      videoUrl: data.assets?.video ?? null,
      thumbnailUrl: data.assets?.image ?? null,
    });
  }

  // ── Kling AI ──────────────────────────────────────────────────────────────
  if (provider === "kling") {
    const accessKey = process.env.KLING_ACCESS_KEY;
    const secretKey = process.env.KLING_SECRET_KEY;
    if (!accessKey || !secretKey) return res.status(500).json({ error: "Kling keys not configured" });

    const token = klingJWT(accessKey, secretKey);

    const r = await fetch(`https://api.klingai.com/v1/videos/text2video/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!r.ok) return res.status(r.status).json({ error: `Kling status check failed (${r.status})` });

    const data = await r.json();
    const taskStatus = data.data?.task_status;
    return res.json({
      status: taskStatus === "succeed" ? "completed" : taskStatus === "failed" ? "failed" : "processing",
      videoUrl: data.data?.task_result?.videos?.[0]?.url ?? null,
    });
  }

  return res.status(400).json({ error: "Unknown provider" });
}
