// All AI calls go through Vercel serverless functions.
// Claude (claude-haiku) handles captions, Sinhala, product copy, CTA.
// OpenAI (gpt-4o-mini) handles image/video prompts and caption variations.
// API keys stay server-side — nothing exposed to the browser.

export async function generateGemstoneContent({ gemstone, contentType, platform, style, template }) {
  const res = await fetch("/api/generate-content", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ gemstone, contentType, platform, style, template }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Generation failed (${res.status})`);
  }

  return res.json();
}

export async function generateCaptionVariations({ caption, platform, gemstone, count = 3 }) {
  const res = await fetch("/api/caption-variations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ caption, platform, gemstone, count }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Variations failed (${res.status})`);
  }

  const data = await res.json();
  return data.variations || [];
}
