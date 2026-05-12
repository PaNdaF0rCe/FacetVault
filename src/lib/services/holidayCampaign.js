/**
 * Tier 1 approved sale campaign system.
 * Only campaigns in the TIER1_* lists below can trigger discounts.
 * All other holidays (Poya days, minor observances, etc.) are ignored.
 * Campaigns activate 14 days before the anchor date and expire the day after.
 * If multiple approved campaigns overlap, both names are shown but only one
 * discount is applied — no stacking.
 */

const LEAD_DAYS = 14;
const TRAIL_DAYS = 1;

// ── Discount tiers (pricing-discounts.md) ─────────────────────────────────
export function getDiscountRate(price) {
  const p = Number(price) || 0;
  if (p <= 0) return 0;
  if (p < 5000) return 0.08;
  if (p < 10000) return 0.10;
  if (p < 15000) return 0.12;
  return 0.15;
}

export function applyDiscount(price) {
  const p = Number(price);
  if (!p || p <= 0) return null;
  return Math.round(p * (1 - getDiscountRate(p)));
}

// ── Tier 1 fixed-date campaigns (month 0-indexed) ─────────────────────────
// Only these fixed dates are approved. Do not add other public/religious
// holidays, Poya days, or minor observances.
const TIER1_FIXED = [
  { name: "Valentine's Day",          month: 1,  day: 14 },
  { name: "Women's Day",              month: 2,  day: 8  },
  { name: "Sinhala & Tamil New Year", month: 3,  day: 13 },
  { name: "Christmas",                month: 11, day: 25 },
  { name: "New Year",                 month: 0,  day: 1  },
];

// ── Tier 1 variable-date campaigns ────────────────────────────────────────
// Only Eid al-Fitr (main Eid) and Deepavali are approved.
// Eid al-Adha, Vesak Poya, and other Muslim/Buddhist observances are excluded.
const TIER1_VARIABLE = {
  2025: [
    { name: "Eid Sale",  date: new Date(2025, 2, 30) },
    { name: "Deepavali", date: new Date(2025, 9, 20) },
  ],
  2026: [
    { name: "Eid Sale",  date: new Date(2026, 2, 20) },
    { name: "Deepavali", date: new Date(2026, 9,  9) },
  ],
  2027: [
    { name: "Eid Sale",  date: new Date(2027, 2,  9) },
    { name: "Deepavali", date: new Date(2027, 9, 29) },
  ],
};

// ── Tier 1 computed campaigns (nth weekday of month) ──────────────────────
function nthWeekday(year, month, weekday, n) {
  const d = new Date(year, month, 1);
  let count = 0;
  while (d.getMonth() === month) {
    if (d.getDay() === weekday) {
      count++;
      if (count === n) return new Date(d);
    }
    d.setDate(d.getDate() + 1);
  }
  return null;
}

function getTier1ComputedCampaigns(year) {
  const campaigns = [];

  // Mother's Day — 2nd Sunday of May
  const mothersDay = nthWeekday(year, 4, 0, 2);
  if (mothersDay) campaigns.push({ name: "Mother's Day", date: mothersDay });

  // Father's Day — 3rd Sunday of June
  const fathersDay = nthWeekday(year, 5, 0, 3);
  if (fathersDay) campaigns.push({ name: "Father's Day", date: fathersDay });

  return campaigns;
}

// ── Main export ────────────────────────────────────────────────────────────

/**
 * Returns the active campaign state if today falls within the lead window of
 * any Tier 1 approved campaign, or null if no campaign is active.
 *
 * When multiple approved campaigns overlap (e.g. Christmas + New Year), their
 * names are combined in the label — but only a single discount is applied.
 */
export function getActiveCampaign(now = new Date()) {
  const year = now.getFullYear();
  const active = [];

  const checkDate = (name, holidayDate) => {
    const start = new Date(holidayDate);
    start.setDate(start.getDate() - LEAD_DAYS);
    const end = new Date(holidayDate);
    end.setDate(end.getDate() + TRAIL_DAYS);

    if (now >= start && now <= end) {
      const msUntil = holidayDate.getTime() - now.getTime();
      const daysUntil = Math.ceil(msUntil / (1000 * 60 * 60 * 24));
      active.push({ name, holidayDate, daysUntil });
    }
  };

  // Check previous, current, and next year so Dec/Jan boundary is handled
  for (const c of TIER1_FIXED) {
    for (const y of [year - 1, year, year + 1]) {
      checkDate(c.name, new Date(y, c.month, c.day));
    }
  }

  for (const y of [year - 1, year, year + 1]) {
    const list = TIER1_VARIABLE[y] || [];
    for (const c of list) checkDate(c.name, c.date);
  }

  for (const y of [year - 1, year, year + 1]) {
    for (const c of getTier1ComputedCampaigns(y)) checkDate(c.name, c.date);
  }

  if (active.length === 0) return null;

  // Sort: nearest upcoming first, then most recent past
  active.sort((a, b) => {
    const aUp = a.daysUntil >= 0;
    const bUp = b.daysUntil >= 0;
    if (aUp && !bUp) return -1;
    if (!aUp && bUp) return 1;
    return Math.abs(a.daysUntil) - Math.abs(b.daysUntil);
  });

  const primary = active[0];

  // Deduplicate and combine names when multiple campaigns overlap
  const names = [...new Set(active.map(c => c.name))];
  const label = names.length > 1
    ? `${names.join(" + ")} Sale`
    : `${names[0]} Sale`;

  return {
    name: names.join(" + "),
    label,
    daysUntil: primary.daysUntil,
    holidayDate: primary.holidayDate,
    discountSummary: "up to 15% off",
  };
}
