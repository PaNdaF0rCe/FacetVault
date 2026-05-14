import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const openai = new OpenAI({ apiKey: process.env.VITE_OPENAI_API_KEY });

// Claude handles the brand voice — captions, Sinhala, product copy, CTA
async function generateCopyWithClaude({ gemstone, platform, style, template }) {
  const platformGuide = {
    Instagram: "2-3 short punchy sentences, warm and editorial",
    TikTok: "hook in first 3 words, casual luxury tone, max 120 chars",
    Facebook: "2-3 sentences with a storytelling arc, end with a CTA",
  };

  const styleGuide = {
    Luxury: "dark, opulent, unhurried — evoke Hermès and Bulgari",
    Minimal: "restraint is the statement — single stone, perfect silence",
    Cinematic: "dramatic, sensory, paint a scene with light and shadow",
  };

  const SYSTEM = `You are the brand voice for FacetVault — a premium Sri Lankan loose gemstone brand.
Write with the authority of a connoisseur and the warmth of a trusted guide.
Avoid clichés: no "nestled", "whisper", "born from the earth", "hides quietly".
No em-dashes, no bullet points, no lists in captions.
Always respond with a single valid JSON object — no markdown, no extra text.`;

  const prompt = `Write marketing copy for a ${gemstone} gemstone post.

Platform: ${platform} — ${platformGuide[platform]}
Visual style: ${style} — ${styleGuide[style]}
Template: ${template}

Return this exact JSON:
{
  "caption": "English caption for ${platform} — under 180 words",
  "captionSinhala": "Sinhala translation of the caption — natural, not literal",
  "cta": "One punchy call-to-action line (e.g. DM to enquire · facetvault.store)",
  "productDescription": "Luxury editorial description of the ${gemstone} — 2 sentences, evoke rarity and beauty",
  "hashtags": "${platform === "Instagram" ? "15 highly relevant hashtags as one string" : "5 targeted hashtags as one string"}"
}`;

  const response = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 700,
    system: [{ type: "text", text: SYSTEM, cache_control: { type: "ephemeral" } }],
    messages: [{ role: "user", content: prompt }],
  });

  const text = response.content[0].text;
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("Claude did not return valid JSON");
  return JSON.parse(match[0]);
}

// OpenAI handles structured technical prompts for image/video AI tools
async function generatePromptsWithOpenAI({ gemstone, contentType, style, template }) {
  const styleGuide = {
    Luxury: "dark navy background, gold accent rim light, editorial stillness, macro shot",
    Minimal: "pure black or slate surface, single stone, one directional light, negative space",
    Cinematic: "dramatic chiaroscuro, slow rotation implied, shallow depth of field, anamorphic flare",
  };

  const prompt = `Generate cinematic AI prompts for a ${gemstone} gemstone content piece.
Style: ${style} — ${styleGuide[style]}
Template: ${template}
Content type: ${contentType}

Return JSON:
{
  "imagePrompt": "Detailed prompt for Leonardo AI or Midjourney. Must include: macro gemstone photography, specific lighting description, background, mood, camera/lens feel. 80+ words. No generic phrases.",
  "videoPrompt": "Prompt for Kling AI, Luma Dream Machine, or Pika Labs. Include: camera movement, subject motion (slow rotation or light play), duration feel, colour grade, sound mood. 60+ words."
}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: "You are a prompt engineer specialising in luxury product cinematography for AI image/video generators. Output only valid JSON.",
      },
      { role: "user", content: prompt },
    ],
    response_format: { type: "json_object" },
    temperature: 0.85,
    max_tokens: 500,
  });

  return JSON.parse(response.choices[0].message.content);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { gemstone, contentType, platform, style, template } = req.body || {};

  if (!gemstone || !contentType || !platform || !style) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // Run both in parallel — Claude for copy, OpenAI for prompts
    const [copy, prompts] = await Promise.all([
      generateCopyWithClaude({ gemstone, platform, style, template }),
      contentType !== "Caption Only"
        ? generatePromptsWithOpenAI({ gemstone, contentType, style, template })
        : Promise.resolve({ imagePrompt: "", videoPrompt: "" }),
    ]);

    return res.status(200).json({
      ...copy,
      ...prompts,
    });
  } catch (err) {
    console.error("Content generation error:", err);
    return res.status(500).json({ error: err.message });
  }
}
