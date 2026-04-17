import admin from "firebase-admin";

if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export async function GET(req) {
  try {
    const res = await fetch(
      "https://api.frankfurter.app/latest?from=LKR&to=USD,CAD,GBP,EUR,AUD"
    );

    const data = await res.json();

    const db = admin.firestore();

    await db.collection("siteSettings").doc("exchangeRates").set({
      base: "LKR",
      rates: data.rates,
      sourceDate: data.date,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}