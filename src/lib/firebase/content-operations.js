import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  limit,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./config";

const CONTENT_COL = "generated_content";
const TEMPLATES_COL = "prompt_templates";
const POSTS_COL = "social_posts";

// ── generated_content ───────────────────────────────────────────────────────

export async function saveGeneratedContent(data) {
  const docRef = await addDoc(collection(db, CONTENT_COL), {
    gemstoneType: data.gemstoneType,
    contentType: data.contentType,
    platform: data.platform,
    style: data.style,
    template: data.template,
    providerTarget: data.providerTarget || null,
    imagePrompt: data.imagePrompt || "",
    videoPrompt: data.videoPrompt || "",
    caption: data.caption || "",
    captionSinhala: data.captionSinhala || "",
    hashtags: data.hashtags || "",
    cta: data.cta || "",
    productDescription: data.productDescription || "",
    status: "draft", // draft | saved | posted
    isFavorite: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function getGeneratedContent({ statusFilter = null, limitCount = 50 } = {}) {
  let q = query(collection(db, CONTENT_COL), orderBy("createdAt", "desc"), limit(limitCount));
  if (statusFilter) {
    q = query(
      collection(db, CONTENT_COL),
      where("status", "==", statusFilter),
      orderBy("createdAt", "desc"),
      limit(limitCount)
    );
  }
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function updateContentStatus(docId, status) {
  await updateDoc(doc(db, CONTENT_COL, docId), { status, updatedAt: serverTimestamp() });
}

export async function toggleFavorite(docId, current) {
  await updateDoc(doc(db, CONTENT_COL, docId), {
    isFavorite: !current,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteContent(docId) {
  await deleteDoc(doc(db, CONTENT_COL, docId));
}

export async function updateContentField(docId, fields) {
  await updateDoc(doc(db, CONTENT_COL, docId), { ...fields, updatedAt: serverTimestamp() });
}

// ── social_posts ─────────────────────────────────────────────────────────────

export async function logSocialPost(contentId, { platform, postedAt, notes = "" }) {
  return addDoc(collection(db, POSTS_COL), {
    contentId,
    platform,
    postedAt: postedAt || serverTimestamp(),
    notes,
    createdAt: serverTimestamp(),
  });
}
