export const PROMPT_TEMPLATES = [
  {
    id: "luxury-sapphire-showcase",
    name: "Luxury Sapphire Showcase",
    gemstone: "Sapphire",
    style: "Luxury",
    contentType: "Image",
    description: "Royal blue velvet depth, gold accents, editorial stillness",
  },
  {
    id: "collector-stone-spotlight",
    name: "Collector Stone Spotlight",
    gemstone: "Mixed",
    style: "Minimal",
    contentType: "Caption Only",
    description: "Single stone hero, provenance story, collector narrative",
  },
  {
    id: "rare-gem-cinematic-reel",
    name: "Rare Gem Cinematic Reel",
    gemstone: "Ruby",
    style: "Cinematic",
    contentType: "Reel Concept",
    description: "Slow rotation, blood-red fire, dramatic shadow play",
  },
  {
    id: "minimal-premium-display",
    name: "Minimal Premium Display",
    gemstone: "Emerald",
    style: "Minimal",
    contentType: "Image",
    description: "Slate surface, single stone, perfect silence",
  },
  {
    id: "spinel-rarity-reveal",
    name: "Spinel Rarity Reveal",
    gemstone: "Spinel",
    style: "Cinematic",
    contentType: "Video",
    description: "Unboxing reveal, dark velvet, cinematic pull-back",
  },
  {
    id: "tourmaline-colour-story",
    name: "Tourmaline Colour Story",
    gemstone: "Tourmaline",
    style: "Luxury",
    contentType: "Image",
    description: "Gradient spectrum, each stone a chapter of colour",
  },
  {
    id: "heirloom-grade-statement",
    name: "Heirloom Grade Statement",
    gemstone: "Mixed",
    style: "Luxury",
    contentType: "Caption Only",
    description: "Legacy framing, investment tone, generational value",
  },
  {
    id: "dark-matter-gem",
    name: "Dark Matter Gem",
    gemstone: "Spinel",
    style: "Cinematic",
    contentType: "Image",
    description: "Black background, single light source, floating gem",
  },
];

export const GEMSTONES = ["Sapphire", "Ruby", "Emerald", "Spinel", "Tourmaline", "Mixed"];
export const CONTENT_TYPES = ["Image", "Video", "Reel Concept", "Caption Only"];
export const PLATFORMS = ["Instagram", "TikTok", "Facebook"];
export const STYLES = ["Luxury", "Minimal", "Cinematic"];

export const PROVIDER_MAP = {
  Image: [
    { id: "leonardo", label: "Leonardo AI", icon: "⚡" },
    { id: "midjourney", label: "Midjourney", icon: "🎨" },
  ],
  Video: [
    { id: "kling", label: "Kling AI", icon: "🎬" },
    { id: "luma", label: "Luma Dream Machine", icon: "🌊" },
    { id: "pika", label: "Pika Labs", icon: "⚡" },
  ],
  "Reel Concept": [
    { id: "higgsfield", label: "Higgsfield AI", icon: "🎥" },
    { id: "runway", label: "Runway Gen-3", icon: "🚀" },
  ],
  "Caption Only": [],
};
