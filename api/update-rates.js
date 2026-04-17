import admin from "firebase-admin";

if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export default async function handler(req, res) {
  try {
    const response = await fetch(
      // ✅ ADDED AED HERE
      "https://api.frankfurter.dev/v2/rates?base=LKR&quotes=USD,CAD,GBP,EUR,AUD,AED"
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: "Rate API request failed",
        details: data,
      });
    }

    if (!Array.isArray(data) || data.length === 0) {
      return res.status(500).json({
        error: "Rate API returned unexpected data",
        details: data,
      });
    }

    const rates = {};
    for (const item of data) {
      if (item?.quote && typeof item.rate === "number") {
        rates[item.quote] = item.rate;
      }
    }

    if (Object.keys(rates).length === 0) {
      return res.status(500).json({
        error: "No valid rates found in API response",
        details: data,
      });
    }

    const sourceDate = data[0]?.date || null;
    const base = data[0]?.base || "LKR";

    const db = admin.firestore();

    await db.collection("siteSettings").doc("exchangeRates").set({
      base,
      rates,
      sourceDate,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return res.status(200).json({
      success: true,
      saved: {
        base,
        rates,
        sourceDate,
      },
    });
  } catch (err) {
    console.error("Update rates error:", err);
    return res.status(500).json({ error: err.message });
  }
}