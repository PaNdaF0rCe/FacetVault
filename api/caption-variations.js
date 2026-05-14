import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.VITE_OPENAI_API_KEY });

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { caption, platform, gemstone, count = 3 } = req.body || {};

  if (!caption || !gemstone) {
    return res.status(400).json({ error: "Missing caption or gemstone" });
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a luxury gemstone copywriter for FacetVault. Output only valid JSON.",
        },
        {
          role: "user",
          content: `Write ${count} caption variations for a ${gemstone} gemstone post on ${platform}.
Base caption: "${caption}"

Return JSON: { "variations": ["variation1", "variation2", "variation3"] }

Tones:
- Variation 1: Poetic and sensory — evoke light, depth, rarity
- Variation 2: Direct collector tone — rarity, investment, connoisseur
- Variation 3: Warm and personal — like sharing a discovery with a friend

No em-dashes, no bullet points, under 180 words each.`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.9,
      max_tokens: 400,
    });

    const data = JSON.parse(response.choices[0].message.content);
    return res.status(200).json({ variations: data.variations || [] });
  } catch (err) {
    console.error("Caption variations error:", err);
    return res.status(500).json({ error: err.message });
  }
}
