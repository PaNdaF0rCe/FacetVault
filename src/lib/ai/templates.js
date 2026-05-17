export const PROMPT_TEMPLATES = [
  {
    id: "feature-stone-showcase",
    name: "Feature Stone Showcase",
    postType: "feature",
    style: "Buyer-Focused",
    contentType: "Caption Only",
    description: "Stone code, key specs, WhatsApp CTA — practical and warm",
  },
  {
    id: "stone-to-jewelry",
    name: "Stone → Jewelry Journey",
    postType: "stone_to_jewelry",
    style: "Aspirational",
    contentType: "Caption Only",
    description: "Pick a stone, set it into a ring or pendant through partner jewelers",
  },
  {
    id: "birthstone-gift",
    name: "Birthstone Gift",
    postType: "birthstone",
    style: "Personal",
    contentType: "Caption Only",
    description: "Birthday, anniversary, meaningful gifting — ask for the month",
  },
  {
    id: "trust-education",
    name: "Trust & Education",
    postType: "trust",
    style: "Educational",
    contentType: "Caption Only",
    description: "Real videos, LGL cert, natural vs synthetic, what to ask — builds buyer confidence",
  },
  {
    id: "how-to-buy",
    name: "How to Buy",
    postType: "how_to_buy",
    style: "Practical",
    contentType: "Caption Only",
    description: "Step-by-step: see → video → confirm → pay → receive via WhatsApp",
  },
  {
    id: "faq-objection",
    name: "FAQ / Objection Handling",
    postType: "faq",
    style: "Conversational",
    contentType: "Caption Only",
    description: "One buyer question answered honestly — video, delivery, cert, custom jewelry",
  },
  {
    id: "mystery-stone",
    name: "Mystery Stone",
    postType: "mystery",
    style: "Curiosity",
    contentType: "Caption Only",
    description: "Unlisted stone, build desire, invite WhatsApp inquiry — never say unavailable",
  },
  {
    id: "origin-story",
    name: "Origin Story",
    postType: "origin",
    style: "Storytelling",
    contentType: "Image",
    description: "Ratnapura sourcing, Sri Lankan gem heritage, provenance and place",
  },
  {
    id: "gem-quiz",
    name: "Gem Quiz",
    postType: "quiz",
    style: "Engagement",
    contentType: "Image",
    description: "Fun gem trivia — drives comments and discovery",
  },
];

export const POST_TYPES = [
  "feature", "mystery", "origin", "stone_to_jewelry",
  "birthstone", "trust", "how_to_buy", "faq", "quiz",
];

export const POST_TYPE_LABELS = {
  feature:          "Feature Post",
  mystery:          "Mystery Post",
  origin:           "Informative Post",
  quiz:             "Gem Quiz",
  stone_to_jewelry: "Stone → Jewelry",
  birthstone:       "Birthstone Gift",
  trust:            "Trust & Education",
  how_to_buy:       "How to Buy",
  faq:              "FAQ",
};

export const CONTENT_TYPES = ["Caption Only", "Image", "Reel Concept"];
export const PLATFORMS = ["Instagram", "Facebook", "TikTok"];
export const STYLES = ["Buyer-Focused", "Aspirational", "Personal", "Educational", "Conversational", "Traditional", "Curiosity", "Storytelling", "Engagement", "Practical"];

export const GEMSTONES = [
  "Sapphire", "Ruby", "Emerald", "Spinel", "Tourmaline",
  "Yellow Sapphire", "Padparadscha", "Alexandrite", "Cat's Eye", "Mixed",
];

export const PROVIDER_MAP = {
  Image: [
    { id: "leonardo", label: "Leonardo AI", icon: "⚡" },
    { id: "midjourney", label: "Midjourney", icon: "🎨" },
  ],
  Video: [
    { id: "kling", label: "Kling AI", icon: "🎬" },
    { id: "luma", label: "Luma Dream Machine", icon: "🌊" },
  ],
  "Reel Concept": [
    { id: "runway", label: "Runway Gen-3", icon: "🚀" },
  ],
  "Caption Only": [],
};
