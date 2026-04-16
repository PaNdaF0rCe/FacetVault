import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  getDoc,
  doc,
  deleteDoc,
  updateDoc,
  limit,
} from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import { db, storage } from "./config";
import { createDocument, getDocument } from "./db-operations";
import { uploadImageWithThumbnail } from "./storage-utils";
import { UnauthorizedError } from "./errors";

/* ---------------- HELPERS ---------------- */

function generateStoneCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "FV-";
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function normalizeDateValue(value) {
  if (!value) return 0;
  if (typeof value?.toDate === "function") return value.toDate().getTime();
  if (value instanceof Date) return value.getTime();
  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
}

function mapDoc(docSnap) {
  return {
    id: docSnap.id,
    ...docSnap.data(),
  };
}

function sortByUpdatedDesc(items) {
  return [...items].sort(
    (a, b) => normalizeDateValue(b.updatedAt) - normalizeDateValue(a.updatedAt)
  );
}

function isVisiblePublicItem(item) {
  return !!item?.isForSale && !item?.isSold;
}

/* ---------------- BACKFILL FUNCTION ---------------- */

export async function backfillStoneCodes(userId) {
  const q = query(collection(db, "inventory"), where("userId", "==", userId));
  const snapshot = await getDocs(q);

  const updates = [];

  snapshot.docs.forEach((docSnap) => {
    const data = docSnap.data();

    if (!data.stoneCode) {
      updates.push(
        updateDoc(doc(db, "inventory", docSnap.id), {
          stoneCode: generateStoneCode(),
        })
      );
    }
  });

  await Promise.all(updates);
}

/* ---------------- INVENTORY FETCH ---------------- */

export async function getFilteredInventory(userId, filters = {}) {
  const q = query(
    collection(db, "inventory"),
    where("userId", "==", userId),
    orderBy("updatedAt", "desc")
  );

  const snapshot = await getDocs(q);

  let items = snapshot.docs.map(mapDoc);

  if (filters.search?.trim()) {
    const term = filters.search.toLowerCase();
    items = items.filter(
      (i) =>
        (i.name || "").toLowerCase().includes(term) ||
        (i.stoneCode || "").toLowerCase().includes(term)
    );
  }

  return items;
}

/* ---------------- CREATE ---------------- */

export async function uploadInventoryItem(filePayload, metadata, userId) {
  let uploadResult = null;

  if (filePayload?.original) {
    uploadResult = await uploadImageWithThumbnail(filePayload, userId);
  }

  const now = new Date();

  const itemData = {
    ...metadata,
    userId,
    stoneCode: metadata.stoneCode || generateStoneCode(),
    isSold: false,

    imageUrl: uploadResult?.imageUrl || null,
    imagePath: uploadResult?.imagePath || null,
    thumbnailUrl: uploadResult?.thumbnailUrl || null,
    thumbnailPath: uploadResult?.thumbnailPath || null,

    createdAt: now,
    updatedAt: now,
  };

  return createDocument("inventory", itemData);
}

/* ---------------- UPDATE ---------------- */

export async function updateInventoryItem(
  itemId,
  updatedData,
  userId,
  newImageFile = null
) {
  const existing = await getDocument("inventory", itemId);

  if (!existing) throw new Error("Item not found");
  if (existing.userId !== userId) throw new UnauthorizedError();

  const refDoc = doc(db, "inventory", itemId);

  let imageUpdate = {};

  if (newImageFile?.original) {
    const upload = await uploadImageWithThumbnail(newImageFile, userId);

    imageUpdate = {
      imageUrl: upload.imageUrl,
      imagePath: upload.imagePath,
      thumbnailUrl: upload.thumbnailUrl,
      thumbnailPath: upload.thumbnailPath,
    };
  }

  await updateDoc(refDoc, {
    ...updatedData,
    ...imageUpdate,
    stoneCode: existing.stoneCode || generateStoneCode(),
    isSold: !!updatedData.isSold,
    updatedAt: new Date(),
  });

  return true;
}

/* ---------------- DELETE ---------------- */

export async function deleteInventoryItem(itemId, userId) {
  const item = await getDocument("inventory", itemId);

  if (!item) throw new Error("Item not found");
  if (item.userId !== userId) throw new UnauthorizedError();

  await deleteDoc(doc(db, "inventory", itemId));

  if (item.imagePath) {
    try {
      await deleteObject(ref(storage, item.imagePath));
    } catch {}
  }

  if (item.thumbnailPath) {
    try {
      await deleteObject(ref(storage, item.thumbnailPath));
    } catch {}
  }

  return true;
}

/* ---------------- PUBLIC LIST ---------------- */

export async function getPublicSaleInventory() {
  const q = query(
    collection(db, "inventory"),
    where("isForSale", "==", true)
  );

  const snapshot = await getDocs(q);

  const items = snapshot.docs.map(mapDoc).filter(isVisiblePublicItem);

  return sortByUpdatedDesc(items);
}

/* ---------------- PUBLIC SINGLE ITEM ---------------- */

export async function getPublicStoneById(itemId) {
  const docRef = doc(db, "inventory", itemId);
  const snapshot = await getDoc(docRef);

  if (!snapshot.exists()) return null;

  const item = mapDoc(snapshot);

  if (!isVisiblePublicItem(item)) return null;

  return item;
}

/* ---------------- RELATED ITEMS ---------------- */

export async function getRelatedPublicStones(item, maxItems = 4) {
  if (!item) return [];

  const results = [];
  const seen = new Set([item.id]);

  const runQuery = async (field, value) => {
    if (!value || results.length >= maxItems) return;

    const q = query(
      collection(db, "inventory"),
      where("isForSale", "==", true),
      where(field, "==", value),
      orderBy("updatedAt", "desc"),
      limit(Math.max(maxItems * 2, 8))
    );

    const snapshot = await getDocs(q);

    for (const docSnap of snapshot.docs) {
      const candidate = mapDoc(docSnap);

      if (!isVisiblePublicItem(candidate)) continue;
      if (seen.has(candidate.id)) continue;

      seen.add(candidate.id);
      results.push(candidate);

      if (results.length >= maxItems) break;
    }
  };

  await runQuery("stoneType", item.stoneType);
  await runQuery("category", item.category);

  return results.slice(0, maxItems);
}