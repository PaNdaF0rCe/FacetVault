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
      "https://api.frankfurter.app/latest?from=LKR&to=USD,CAD,GBP,EUR,AUD"
    );

    const data = await response.json();

    console.log("Frankfurter response:", data);

    if (!response.ok) {
      return res.status(response.status).json({
        error: "Rate API request failed",
        details: data,
      });
    }

    if (!data || typeof data !== "object" || !data.rates) {
      return res.status(500).json({
        error: "Rate API returned unexpected data",
        details: data,
      });
    }

    const db = admin.firestore();

    await db.collection("siteSettings").doc("exchangeRates").set({
      base: "LKR",
      rates: data.rates,
      sourceDate: data.date || null,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return res.status(200).json({
      success: true,
      saved: {
        base: "LKR",
        rates: data.rates,
        sourceDate: data.date || null,
      },
    });
  } catch (err) {
    console.error("Update rates error:", err);
    return res.status(500).json({ error: err.message });
  }
}