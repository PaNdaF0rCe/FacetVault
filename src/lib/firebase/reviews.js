import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  where,
  serverTimestamp,
  limit,
} from "firebase/firestore";
import { db } from "./config";

const COLLECTION = "reviews";

export async function submitReview({ rating, text, name, location, anonymous }) {
  const doc = {
    rating: Number(rating),
    text: text.trim(),
    name: anonymous ? "Anonymous" : (name.trim() || "Anonymous"),
    location: anonymous ? "" : (location.trim() || ""),
    anonymous: Boolean(anonymous),
    approved: true, // auto-approve; delete from Firebase console to moderate
    createdAt: serverTimestamp(),
  };
  return addDoc(collection(db, COLLECTION), doc);
}

export async function getApprovedReviews(max = 20) {
  const q = query(
    collection(db, COLLECTION),
    where("approved", "==", true),
    orderBy("createdAt", "desc"),
    limit(max)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}
