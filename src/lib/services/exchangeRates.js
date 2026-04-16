import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";

export async function getExchangeRates() {
  const ref = doc(db, "siteSettings", "exchangeRates");
  const snap = await getDoc(ref);

  if (!snap.exists()) return null;
  return snap.data();
}

export function detectCurrency() {
  try {
    const locale = Intl.NumberFormat().resolvedOptions().locale?.toUpperCase() || "";
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "";

    if (
      locale.includes("LK") ||
      timeZone === "Asia/Colombo"
    ) {
      return "LKR";
    }

    if (locale.includes("CA")) return "CAD";
    if (locale.includes("GB")) return "GBP";
    if (locale.includes("AU")) return "AUD";
    if (locale.includes("US")) return "USD";

    return "LKR";
  } catch {
    return "LKR";
  }
}

export function convertFromLkr(amount, currency, rates) {
  if (!amount || currency === "LKR") return amount;

  const rate = rates?.[currency];
  if (!rate) return null;

  return amount * rate;
}

export function formatCurrency(amount, currency) {
  if (!amount) return null;

  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    maximumFractionDigits: amount < 100 ? 2 : 0,
  }).format(amount);
}