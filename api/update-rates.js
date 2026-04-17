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

    const db = admin.firestore();

    await db.collection("siteSettings").doc("exchangeRates").set({
      base: "LKR",
      rates: data.rates,
      sourceDate: data.date,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}