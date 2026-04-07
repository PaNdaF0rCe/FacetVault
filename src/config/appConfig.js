export const BASE_URL = "https://facetvault.store";
export const ADMIN_UID = import.meta.env.VITE_ADMIN_UID || "";
export const CONTACT_PHONE = import.meta.env.VITE_CONTACT_PHONE || "";

const rawWhatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || "";

// Keep digits only for wa.me links
export const WHATSAPP_NUMBER = rawWhatsappNumber.replace(/\D/g, "");

export const WHATSAPP_MESSAGE =
  import.meta.env.VITE_WHATSAPP_MESSAGE ||
  "Hello, I'm interested in this gemstone.";