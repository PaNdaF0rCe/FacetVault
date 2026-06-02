/**
 * invoice-bridge.js
 *
 * Writes a pre-populated draft invoice to the shared `invoices` Firestore
 * collection that the FacetVault Invoice App reads from.
 *
 * Both apps share the same Firebase project (gfacetvault) so no API or
 * webhook is needed — it's a direct Firestore write.
 */

import { doc, setDoc } from "firebase/firestore";
import { db } from "./config";

/**
 * Creates a draft invoice document from a completed gem sale.
 * The invoice app will immediately show it in its history as a draft.
 *
 * @param {object} gem       - Full gem document from Firestore inventory
 * @param {object} saleData  - { sellingPrice, expenses, notes, buyerName }
 */
export async function createInvoiceFromSale(gem, saleData) {
  const { sellingPrice, expenses = 0, notes = "", buyerName = "" } = saleData;

  const today = new Date();
  const dateStr = today.toISOString().split("T")[0]; // YYYY-MM-DD

  // Use stone code as the draft identifier — readable and unique
  const stoneRef = gem.stoneCode || gem.id.slice(-6).toUpperCase();
  const invoiceNumber = `DRAFT-${stoneRef}`;

  // Build a human-readable description for the line item
  const parts = [
    gem.name || gem.stoneType || "Natural Gemstone",
    gem.stoneType && gem.name ? `(${gem.stoneType})` : null,
    gem.carat ? `${Number(gem.carat).toFixed(2)} ct` : null,
    gem.color || null,
    gem.cut || null,
    gem.origin ? `— ${gem.origin}` : null,
  ].filter(Boolean);
  const description = parts.join(", ");

  // Expenses become a separate line item if provided
  const items = [
    {
      id: crypto.randomUUID(),
      description,
      price: Number(sellingPrice),
      quantity: 1,
    },
  ];

  if (Number(expenses) > 0) {
    items.push({
      id: crypto.randomUUID(),
      description: "Additional expenses",
      price: Number(expenses),
      quantity: 1,
    });
  }

  const invoice = {
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
    note: notes || `Stone code: ${stoneRef}. Natural gemstone sourced from Sri Lanka.`,

    // Metadata for traceability
    sourceStoneId: gem.id,
    sourceStoneCode: gem.stoneCode || "",
    sourceStoneName: gem.name || "",

    savedAt: today.toISOString(),
  };

  const ref = doc(db, "invoices", invoiceNumber);
  await setDoc(ref, invoice);

  return invoiceNumber;
}
