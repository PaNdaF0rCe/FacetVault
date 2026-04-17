import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";

const SUPPORTED_CURRENCIES = [
  "LKR",
  "USD",
  "CAD",
  "GBP",
  "EUR",
  "AUD",
  "AED",
];

const COUNTRY_TO_CURRENCY = {
  LK: "LKR",
  US: "USD",
  CA: "CAD",
  GB: "GBP",
  AU: "AUD",
  DE: "EUR",
  FR: "EUR",
  IT: "EUR",
  ES: "EUR",
  NL: "EUR",
  BE: "EUR",
  IE: "EUR",
  PT: "EUR",
  AT: "EUR",
  FI: "EUR",
  GR: "EUR",
};

const TIMEZONE_TO_CURRENCY = {
  "Asia/Colombo": "LKR",
  "America/Toronto": "CAD",
  "America/Vancouver": "CAD",
  "America/Halifax": "CAD",
  "America/Winnipeg": "CAD",
  "Europe/London": "GBP",
  "Australia/Sydney": "AUD",
  "Australia/Melbourne": "AUD",
  "Australia/Perth": "AUD",
  "America/New_York": "USD",
  "America/Chicago": "USD",
  "America/Denver": "USD",
  "America/Los_Angeles": "USD",
};

const FORMAT_LOCALE_BY_CURRENCY = {
  LKR: "en-LK",
  USD: "en-US",
  CAD: "en-CA",
  GBP: "en-GB",
  EUR: "en-IE",
  AUD: "en-AU",
  AED: "en-AE",
};

export async function getExchangeRates() {
  const ref = doc(db, "siteSettings", "exchangeRates");
  const snap = await getDoc(ref);

  if (!snap.exists()) return null;
  return snap.data();
}

function getRegionFromLocale(locale) {
  if (!locale || typeof locale !== "string") return null;

  const parts = locale.replace("_", "-").split("-");
  const region = parts[1]?.toUpperCase();

  return region && region.length === 2 ? region : null;
}

function getBestRegionFromBrowser() {
  try {
    const candidates = [
      Intl.NumberFormat().resolvedOptions().locale,
      ...(typeof navigator !== "undefined" ? navigator.languages || [] : []),
      typeof navigator !== "undefined" ? navigator.language : null,
      typeof navigator !== "undefined" ? navigator.userLanguage : null,
    ].filter(Boolean);

    for (const locale of candidates) {
      const region = getRegionFromLocale(locale);
      if (region) return region;
    }

    return null;
  } catch {
    return null;
  }
}

function getBrowserTimeZone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || null;
  } catch {
    return null;
  }
}

export function detectCurrency() {
  try {
    const saved =
      typeof window !== "undefined"
        ? localStorage.getItem("preferredCurrency")
        : null;

    if (saved) return saved;

    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    // Sri Lanka (always priority)
    if (timeZone === "Asia/Colombo") return "LKR";

    // Major currency regions
    if (timeZone.startsWith("America/")) {
      // Canada (check first)
      if (
        timeZone.includes("Toronto") ||
        timeZone.includes("Vancouver") ||
        timeZone.includes("Winnipeg") ||
        timeZone.includes("Halifax")
      ) return "CAD";

      return "USD"; // rest of Americas → USD
    }

    if (timeZone.startsWith("Europe/")) {
      if (timeZone === "Europe/London") return "GBP";
      return "EUR"; // rest of Europe → EUR
    }

    if (timeZone.startsWith("Australia/")) {
      return "AUD";
    }

    if (timeZone === "Asia/Dubai") return "AED";

    // Asia fallback (India, SEA, etc.)
    if (timeZone.startsWith("Asia/")) {
      return "USD";
    }

    // Africa fallback
    if (timeZone.startsWith("Africa/")) {
      return "USD";
    }

    // Default fallback
    return "USD";
  } catch {
    return "USD";
  }
}

export function setPreferredCurrency(currency) {
  if (
    typeof window !== "undefined" &&
    SUPPORTED_CURRENCIES.includes(currency)
  ) {
    window.localStorage.setItem("preferredCurrency", currency);
  }
}

export function clearPreferredCurrency() {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem("preferredCurrency");
  }
}

export function getPreferredCurrency() {
  return detectCurrency();
}

export function convertFromLkr(amount, currency, rates) {
  if (amount == null) return null;
  if (!currency || currency === "LKR") return amount;

  const rate = rates?.[currency];
  if (typeof rate !== "number") return null;

  return amount * rate;
}

export function formatCurrency(amount, currency) {
  if (amount == null) return null;

  const safeCurrency = SUPPORTED_CURRENCIES.includes(currency)
    ? currency
    : "LKR";

  const locale = FORMAT_LOCALE_BY_CURRENCY[safeCurrency] || "en-LK";

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: safeCurrency,
    maximumFractionDigits: safeCurrency === "LKR" ? 0 : amount < 100 ? 2 : 0,
  }).format(amount);
}

/**
 * Main helper for UI:
 * - If user is in LKR, only show LKR
 * - If user is in another currency, show converted value
 * - Symbol changes automatically with currency
 */
export function getDisplayPrice(amountLkr, rates) {
  if (amountLkr == null) {
    return {
      currency: "LKR",
      amount: null,
      formatted: null,
      isConverted: false,
      showConverted: false,
    };
  }

  const currency = getPreferredCurrency();

  if (currency === "LKR") {
    return {
      currency: "LKR",
      amount: amountLkr,
      formatted: formatCurrency(amountLkr, "LKR"),
      isConverted: false,
      showConverted: false,
    };
  }

  const converted = convertFromLkr(amountLkr, currency, rates);

  if (converted == null) {
    return {
      currency: "LKR",
      amount: amountLkr,
      formatted: formatCurrency(amountLkr, "LKR"),
      isConverted: false,
      showConverted: false,
    };
  }

  return {
    currency,
    amount: converted,
    formatted: formatCurrency(converted, currency),
    isConverted: true,
    showConverted: true,
  };
}