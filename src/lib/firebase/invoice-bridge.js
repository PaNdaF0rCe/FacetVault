/**
 * invoice-bridge.js
 *
 * Writes a pre-populated draft invoice to the shared `invoices` Firestore
 * collection that the FacetVault Invoice App reads from.
 *
 * Both apps share the same Firebase project (gfacetvault) so no API or
 * webhook is needed — it's a direct Firestore write.
 *
 * One invoice document is written per *checkout*, not per stone — a
 * multi-stone sale to one customer becomes one invoice with one line item
 * per stone. See docs/STORE_INTEGRATION.md in facetvault-invoice-app for
 * the handoff spec this implements.
 */

import { doc, setDoc } from "firebase/firestore";
import { db } from "./config";

// Firestore doc ID of FacetVault's entry in the invoice app's `companies`
// collection (not the string "FacetVault" — the actual auto-generated ID).
// Looked up once in the Firebase console: Firestore Database → companies →
// doc where name == "FacetVault" → copy its ID.
const FACETVAULT_COMPANY_ID = import.meta.env.VITE_FACETVAULT_COMPANY_ID || "";

const DRAFT_ID_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
function randomDraftSuffix(length = 5) {
  let out = "";
  for (let i = 0; i < length; i++) {
    out += DRAFT_ID_CHARS.charAt(Math.floor(Math.random() * DRAFT_ID_CHARS.length));
  }
  return out;
}

function describeGem(gem) {
  const parts = [
    gem.name || gem.stoneType || "Natural Gemstone",
    gem.stoneType && gem.name ? `(${gem.stoneType})` : null,
    gem.carat ? `${Number(gem.carat).toFixed(2)} ct` : null,
    gem.color || null,
    gem.cut || null,
    gem.origin ? `— ${gem.origin}` : null,
  ].filter(Boolean);
  return parts.join(", ");
}

/**
 * Creates one draft invoice document from a completed checkout — one or
 * more stones sold together to the same customer.
 * The invoice app will immediately show it in its history as a draft.
 *
 * @param {Array<object>} saleItems  - [{ gem, sellingPrice, expenses, notes }]
 * @param {object} checkoutData      - { buyerName }
 */
export async function createInvoiceFromSale(saleItems, checkoutData = {}) {
  if (!Array.isArray(saleItems) || saleItems.length === 0) {
    throw new Error("createInvoiceFromSale requires at least one sale item");
  }
  if (!FACETVAULT_COMPANY_ID) {
    console.warn(
      "VITE_FACETVAULT_COMPANY_ID is not set — invoice draft will be rejected by " +
      "Firestore rules unless the writer is signed in as the invoice app admin."
    );
  }

  const { buyerName = "" } = checkoutData;

  const today = new Date();
  const dateStr = today.toISOString().split("T")[0]; // YYYY-MM-DD

  // One draft ID per checkout — not derived from any single stone.
  const invoiceNumber = `DRAFT-FV-${randomDraftSuffix()}`;

  const items = [];
  const stoneCodes = [];
  const noteParts = [];

  for (const { gem, sellingPrice, expenses = 0, notes = "" } of saleItems) {
    items.push({
      id: crypto.randomUUID(),
      description: describeGem(gem),
      price: Number(sellingPrice),
      quantity: 1,
    });

    if (Number(expenses) > 0) {
      items.push({
        id: crypto.randomUUID(),
        description: `Additional expenses — ${gem.stoneCode || gem.name || "stone"}`,
        price: Number(expenses),
        quantity: 1,
      });
    }

    const stoneRef = gem.stoneCode || gem.id.slice(-6).toUpperCase();
    stoneCodes.push(stoneRef);
    if (notes) noteParts.push(notes);
  }

  const invoice = {
    companyId: FACETVAULT_COMPANY_ID,
    invoiceNumber,
    issuedDate: dateStr,
    dueDate: "",
    currency: "LKR",
    status: "draft",
    discount: 0,
    discountType: "fixed",
    taxRate: 0,

    customer: {
      name: buyerName,
      address: "",
      country: "LK",
      phone: "",
      shipTo: "",
    },

    items,

    paymentInstruction:
      "Bank transfer or cash on delivery.\nPlease confirm payment method when placing order.",
    note:
      noteParts.join(" | ") ||
      `Stone code${stoneCodes.length > 1 ? "s" : ""}: ${stoneCodes.join(", ")}. Natural gemstone${stoneCodes.length > 1 ? "s" : ""} sourced from Sri Lanka.`,

    // Metadata for traceability
    sourceStoneIds: saleItems.map(({ gem }) => gem.id),
    sourceStoneCodes: stoneCodes,
    sourceStoneNames: saleItems.map(({ gem }) => gem.name || ""),

    savedAt: today.toISOString(),
  };

  const ref = doc(db, "invoices", invoiceNumber);
  await setDoc(ref, invoice);

  return invoiceNumber;
}
