/**
 * Automatic holiday campaign system.
 * Campaigns activate 14 days before each holiday and expire the day after.
 * Discount tiers are sourced from the FacetVault pricing structure.
 * No admin action required — purely date-driven.
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

// ── Fixed-date holidays (month 0-indexed) ─────────────────────────────────
const FIXED_HOLIDAYS = [
  { name: "New Year",                 month: 0,  day: 1  },
  { name: "Valentine's Day",          month: 1,  day: 14 },
  { name: "Sinhala & Tamil New Year", month: 3,  day: 13 },
  { name: "Christmas",                month: 11, day: 25 },
  { name: "New Year's Eve",           month: 11, day: 31 },
];

// ── Variable holidays by year (Diwali, Eid, Vesak) ────────────────────────
const VARIABLE_HOLIDAYS = {
  2025: [
    { name: "Eid al-Fitr",  date: new Date(2025, 2, 30) },
    { name: "Vesak Poya",   date: new Date(2025, 4, 12) },
    { name: "Eid al-Adha",  date: new Date(2025, 5,  6) },
    { name: "Diwali",       date: new Date(2025, 9, 20) },
  ],
  2026: [
    { name: "Eid al-Fitr",  date: new Date(2026, 2, 20) },
    { name: "Vesak Poya",   date: new Date(2026, 4,  1) },
    { name: "Eid al-Adha",  date: new Date(2026, 4, 27) },
    { name: "Diwali",       date: new Date(2026, 9,  9) },
  ],
  2027: [
    { name: "Eid al-Fitr",  date: new Date(2027, 2,  9) },
    { name: "Vesak Poya",   date: new Date(2027, 4, 20) },
    { name: "Eid al-Adha",  date: new Date(2027, 4, 17) },
    { name: "Diwali",       date: new Date(2027, 9, 29) },
  ],
};

// ── Computed holidays (nth weekday of month) ──────────────────────────────
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

function getComputedHolidays(year) {
  const holidays = [];

  // Mother's Day — 2nd Sunday of May
  const mothersDay = nthWeekday(year, 4, 0, 2);
  if (mothersDay) holidays.push({ name: "Mother's Day", date: mothersDay });

  // Father's Day — 3rd Sunday of June
  const fathersDay = nthWeekday(year, 5, 0, 3);
  if (fathersDay) holidays.push({ name: "Father's Day", date: fathersDay });

  // Black Friday — day after 4th Thursday of November
  const thanksgiving = nthWeekday(year, 10, 4, 4);
  if (thanksgiving) {
    const blackFriday = new Date(thanksgiving);
    blackFriday.setDate(blackFriday.getDate() + 1);
    holidays.push({ name: "Black Friday", date: blackFriday });
  }

  // Easter Sunday (Anonymous Gregorian algorithm)
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31) - 1;
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  holidays.push({ name: "Easter", date: new Date(year, month, day) });

  return holidays;
}

// ── Main export ────────────────────────────────────────────────────────────

/**
 * Returns the active campaign if today falls within the lead window of any
 * major holiday, or null otherwise. Checks the current year and adjacent
 * years so Dec/Jan boundary holidays are handled correctly.
 */
export function getActiveCampaign(now = new Date()) {
  const year = now.getFullYear();
  const candidates = [];

  const checkDate = (name, holidayDate) => {
    const start = new Date(holidayDate);
    start.setDate(start.getDate() - LEAD_DAYS);
    const end = new Date(holidayDate);
    end.setDate(end.getDate() + TRAIL_DAYS);

    if (now >= start && now <= end) {
      const msUntil = holidayDate.getTime() - now.getTime();
      const daysUntil = Math.ceil(msUntil / (1000 * 60 * 60 * 24));
      candidates.push({ name, holidayDate, daysUntil });
    }
  };

  // Fixed holidays — check previous, current, and next year to handle boundaries
  for (const h of FIXED_HOLIDAYS) {
    for (const y of [year - 1, year, year + 1]) {
      checkDate(h.name, new Date(y, h.month, h.day));
    }
  }

  // Variable holidays
  for (const y of [year - 1, year, year + 1]) {
    const list = VARIABLE_HOLIDAYS[y] || [];
    for (const h of list) checkDate(h.name, h.date);
  }

  // Computed holidays
  for (const y of [year - 1, year, year + 1]) {
    for (const h of getComputedHolidays(y)) checkDate(h.name, h.date);
  }

  if (candidates.length === 0) return null;

  // When multiple overlap, prefer the nearest upcoming holiday; fall back to most recent
  candidates.sort((a, b) => {
    const aUp = a.daysUntil >= 0;
    const bUp = b.daysUntil >= 0;
    if (aUp && !bUp) return -1;
    if (!aUp && bUp) return 1;
    return Math.abs(a.daysUntil) - Math.abs(b.daysUntil);
  });

  const winner = candidates[0];

  return {
    name: winner.name,
    label: `${winner.name} Sale`,
    daysUntil: winner.daysUntil,
    holidayDate: winner.holidayDate,
    discountSummary: "up to 15% off",
  };
}
