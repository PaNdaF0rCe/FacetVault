import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import { db, storage } from "./config";
import { createDocument, getDocument } from "./db-operations";
import { uploadFileToStorage } from "./storage-utils";
import { updateUserStats } from "./users";
import { UnauthorizedError } from "./errors";

function normalizeDateValue(value) {
  if (!value) return 0;

  if (typeof value?.toDate === "function") {
    return value.toDate().getTime();
  }

  if (value instanceof Date) {
    return value.getTime();
  }

  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
}

function normalizeNumberValue(value) {
  if (value === null || value === undefined || value === "") return -1;
  const num = Number(value);
  return Number.isNaN(num) ? -1 : num;
}

export async function getFilteredInventory(userId, filters = {}) {
  try {
    const q = query(
      collection(db, "inventory"),
      where("userId", "==", userId),
      orderBy("updatedAt", "desc")
    );

    const querySnapshot = await getDocs(q);

    let items = querySnapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    }));

    if (filters.category) {
      items = items.filter((item) => item.category === filters.category);
    }

    if (filters.search?.trim()) {
      const searchTerm = filters.search.trim().toLowerCase();
      items = items.filter(
        (item) =>
          (item.name || "").toLowerCase().includes(searchTerm) ||
          (item.category || "").toLowerCase().includes(searchTerm) ||
          (item.stoneType || "").toLowerCase().includes(searchTerm) ||
          (item.color || "").toLowerCase().includes(searchTerm) ||
          (item.cut || "").toLowerCase().includes(searchTerm) ||
          (item.origin || "").toLowerCase().includes(searchTerm) ||
          (item.notes || "").toLowerCase().includes(searchTerm)
      );
    }

    switch (filters.sortBy) {
      case "createdAt":
        items.sort(
          (a, b) =>
            normalizeDateValue(b.createdAt) - normalizeDateValue(a.createdAt)
        );
        break;

      case "carat":
        items.sort(
          (a, b) =>
            normalizeNumberValue(b.carat) - normalizeNumberValue(a.carat)
        );
        break;

      case "pricePaid":
        items.sort(
          (a, b) =>
            normalizeNumberValue(b.pricePaid) -
            normalizeNumberValue(a.pricePaid)
        );
        break;

      case "updatedAt":
      default:
        items.sort(
          (a, b) =>
            normalizeDateValue(b.updatedAt) - normalizeDateValue(a.updatedAt)
        );
        break;
    }

    return items;
  } catch (error) {
    console.error("Error getting filtered inventory:", error);
    throw error;
  }
}

export async function uploadInventoryItem(filePayload, metadata, userId) {
    try {
      let uploadedOriginal = null;
      let uploadedThumbnail = null;

      // 🔥 Handle BOTH formats (backward compatible)
      if (filePayload?.original && filePayload?.thumbnail) {
        uploadedOriginal = await uploadFileToStorage(
          filePayload.original,
          userId
        );

        uploadedThumbnail = await uploadFileToStorage(
          filePayload.thumbnail,
          userId
        );
      } else {
        // fallback for old usage
        uploadedOriginal = await uploadFileToStorage(filePayload, userId);
      }

      const itemData = {
        userId,
        name: metadata.name || "",
        category: metadata.category || "",
        stoneType: metadata.stoneType || "",
        carat:
          metadata.carat !== null &&
          metadata.carat !== undefined &&
          metadata.carat !== ""
            ? Number(metadata.carat)
            : null,
        color: metadata.color || "",
        cut: metadata.cut || "",
        origin: metadata.origin || "",
        pricePaid:
          metadata.pricePaid !== null &&
          metadata.pricePaid !== undefined &&
          metadata.pricePaid !== ""
            ? Number(metadata.pricePaid)
            : null,
        notes: metadata.notes || "",
        quantity: metadata.quantity ? Number(metadata.quantity) : 1,
        isForSale: !!metadata.isForSale,
        salePrice:
          metadata.isForSale &&
          metadata.salePrice !== null &&
          metadata.salePrice !== undefined &&
          metadata.salePrice !== ""
            ? Number(metadata.salePrice)
            : null,
        saleUpdatedAt: metadata.isForSale ? new Date() : null,

        // 🔥 MAIN IMAGE
        fileName: uploadedOriginal.filename,
        imageUrl: uploadedOriginal.downloadURL,
        imagePath: uploadedOriginal.path,

        // 🔥 NEW: THUMBNAIL
        thumbnailUrl: uploadedThumbnail?.downloadURL || null,
        thumbnailPath: uploadedThumbnail?.path || null,

        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await createDocument("inventory", itemData);
      await updateUserStats(userId);
      return result;
    } catch (error) {
      console.error("Error uploading inventory item:", error);
      throw error;
    }
 }

export const updateInventoryItem = async (
  itemId,
  updatedData,
  userId,
  newImageFile = null
) => {
  try {
    const existingItem = await getDocument("inventory", itemId);

    if (!existingItem) {
      throw new Error("Item not found");
    }

    if (existingItem.userId !== userId) {
      throw new UnauthorizedError("Only the owner can update this item");
    }

    const itemRef = doc(db, "inventory", itemId);

    let nextImageData = {};
    let oldImagePathToDelete = null;

    if (newImageFile) {
      let uploadedOriginal = null;
      let uploadedThumbnail = null;

      if (newImageFile?.original && newImageFile?.thumbnail) {
        uploadedOriginal = await uploadFileToStorage(
          newImageFile.original,
          userId
        );

        uploadedThumbnail = await uploadFileToStorage(
          newImageFile.thumbnail,
          userId
        );
      } else {
        uploadedOriginal = await uploadFileToStorage(newImageFile, userId);
      }

      nextImageData = {
        fileName: uploadedOriginal.filename,
        imageUrl: uploadedOriginal.downloadURL,
        imagePath: uploadedOriginal.path,

        thumbnailUrl: uploadedThumbnail?.downloadURL || null,
        thumbnailPath: uploadedThumbnail?.path || null,
      };

      oldImagePathToDelete = existingItem.imagePath || null;
    }

    await updateDoc(itemRef, {
      ...updatedData,
      ...nextImageData,
      updatedAt: new Date(),
    });

    if (oldImagePathToDelete) {
      try {
        const oldImageRef = ref(storage, oldImagePathToDelete);
        await deleteObject(oldImageRef);
      } catch (storageError) {
        console.log("Old image cleanup skipped or failed:", storageError);
      }
    }

    return true;
  } catch (error) {
    console.error("Error updating inventory item:", error);
    throw error;
  }
};

export const deleteInventoryItem = async (itemId, userId) => {
  try {
    const item = await getDocument("inventory", itemId);

    if (!item) {
      throw new Error("Item not found");
    }

    if (item.userId !== userId) {
      throw new UnauthorizedError("Only the owner can delete this item");
    }

    await deleteDoc(doc(db, "inventory", itemId));

    if (item.imagePath) {
      try {
        const imageRef = ref(storage, item.imagePath);
        await deleteObject(imageRef);
      } catch (storageError) {
        console.log("No image found or error deleting image:", storageError);
      }
    }

    await updateUserStats(userId);
    return true;
  } catch (error) {
    console.error("Error deleting inventory item:", error);
    throw error;
  }
};

export const updateItemQuantity = async (itemId, newQuantity) => {
  try {
    const itemRef = doc(db, "inventory", itemId);

    await updateDoc(itemRef, {
      quantity: newQuantity,
      updatedAt: new Date(),
    });

    return true;
  } catch (error) {
    console.error("Error updating quantity:", error);
    throw error;
  }
};

export async function getPublicSaleInventory(filters = {}) {
  try {
    const q = query(
      collection(db, "inventory"),
      where("isForSale", "==", true)
    );

    const querySnapshot = await getDocs(q);

    let items = querySnapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    }));

    if (filters.search?.trim()) {
      const searchTerm = filters.search.trim().toLowerCase();

      items = items.filter(
        (item) =>
          (item.name || "").toLowerCase().includes(searchTerm) ||
          (item.stoneType || "").toLowerCase().includes(searchTerm) ||
          (item.category || "").toLowerCase().includes(searchTerm) ||
          (item.color || "").toLowerCase().includes(searchTerm) ||
          (item.cut || "").toLowerCase().includes(searchTerm) ||
          (item.origin || "").toLowerCase().includes(searchTerm) ||
          (item.notes || "").toLowerCase().includes(searchTerm)
      );
    }

    if (filters.category) {
      items = items.filter((item) => item.category === filters.category);
    }

    items.sort((a, b) => {
      const aTime = normalizeDateValue(
        a.saleUpdatedAt || a.updatedAt || a.createdAt
      );
      const bTime = normalizeDateValue(
        b.saleUpdatedAt || b.updatedAt || b.createdAt
      );
      return bTime - aTime;
    });

    return items;
  } catch (error) {
    console.error("Error getting public sale inventory:", error);
    throw error;
  }
}
