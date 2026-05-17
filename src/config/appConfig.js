export const BASE_URL = "https://facetvault.store";
export const ADMIN_UID = import.meta.env.VITE_ADMIN_UID || "";
export const CONTACT_PHONE = import.meta.env.VITE_CONTACT_PHONE || "";

const rawWhatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || "";

// Keep digits only for wa.me links
export const WHATSAPP_NUMBER = rawWhatsappNumber.replace(/\D/g, "");

export const WHATSAPP_MESSAGE =
  import.meta.env.VITE_WHATSAPP_MESSAGE ||
  "Hi FacetVault, I'm interested in a natural gemstone. Can you help me?";

export const WA_MESSAGES = {
  general: "Hi FacetVault, I'm looking for a natural gemstone. Can you help me choose?",
  birthstone: "Hi FacetVault, I'm looking for a natural stone for birthstone or astrology use. Can you help me choose?",
  jewelry: "Hi FacetVault, I'm interested in turning a gemstone into custom jewelry. Can you guide me?",
  stone: (name, code) =>
    `Hi FacetVault, I saw ${name}${code ? ` (${code})` : ""}. Is it still available? Can I see a real video?`,
};