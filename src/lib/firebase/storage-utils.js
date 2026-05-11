import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { storage } from "./config";

export async function uploadFileToStorage(file, userId) {
  try {
    if (!file) {
      throw new Error("No file provided");
    }

    const timestamp = Date.now();
    const extension = file.name?.split(".").pop() || "jpg";
    const safeName = `gem_${timestamp}.${extension}`;
    const path = `inventory/${userId}/${safeName}`;

    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);

    return {
      downloadURL,
      path,
      filename: safeName,
    };
  } catch (error) {
    console.error("Error uploading file to storage:", error);
    throw error;
  }
}

export async function deleteFileFromStorage(path) {
  try {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
    return true;
  } catch (error) {
    if (error.code === "storage/object-not-found") {
      return true;
    }
    console.error("Error deleting file from storage:", error);
    throw error;
  }
}

export async function getFileFromStorage(path) {
  try {
    const storageRef = ref(storage, path);
    return await getDownloadURL(storageRef);
  } catch (error) {
    console.error("Error getting file from storage:", error);
    throw error;
  }
}

/* ------------------------------------------------------------------
   Multi-size image upload.
   imagePayload = {
     original  : File   // largest webp (or raw fallback)
     medium    : File?  // 1000px wide webp
     thumbnail : File?  // 600px wide webp
   }
   Resulting Storage layout:
     inventory/{uid}/original/gem_{ts}.{ext}
     inventory/{uid}/medium/gem_{ts}_medium.webp
     inventory/{uid}/thumbnails/gem_{ts}_thumb.webp
   ------------------------------------------------------------------ */

function pickExtension(file, fallback = "jpg") {
  if (file?.type === "image/webp") return "webp";
  const fromName = file?.name?.split(".").pop()?.toLowerCase();
  if (fromName && fromName.length <= 5) return fromName;
  return fallback;
}

async function uploadOne(file, path, contentType) {
  const storageRef = ref(storage, path);
  // contentType helps Firebase serve with the right Content-Type header,
  // which is important for webp caching/CDN behavior.
  await uploadBytes(storageRef, file, contentType ? { contentType } : undefined);
  return getDownloadURL(storageRef);
}

export async function uploadImageWithThumbnail(imagePayload, userId) {
  try {
    if (!imagePayload?.original) {
      throw new Error("No image provided");
    }

    const timestamp = Date.now();

    // ---- ORIGINAL (largest variant) ------------------------------
    const originalExt = pickExtension(imagePayload.original);
    const originalName = `gem_${timestamp}.${originalExt}`;
    const originalPath = `inventory/${userId}/original/${originalName}`;
    const originalURL = await uploadOne(
      imagePayload.original,
      originalPath,
      imagePayload.original.type || undefined
    );

    // ---- MEDIUM ---------------------------------------------------
    let mediumURL = null;
    let mediumPath = null;
    if (imagePayload.medium) {
      const mediumName = `gem_${timestamp}_medium.webp`;
      mediumPath = `inventory/${userId}/medium/${mediumName}`;
      mediumURL = await uploadOne(imagePayload.medium, mediumPath, "image/webp");
    }

    // ---- THUMBNAIL ------------------------------------------------
    let thumbnailURL = null;
    let thumbnailPath = null;
    if (imagePayload.thumbnail) {
      const thumbName = `gem_${timestamp}_thumb.webp`;
      thumbnailPath = `inventory/${userId}/thumbnails/${thumbName}`;
      thumbnailURL = await uploadOne(
        imagePayload.thumbnail,
        thumbnailPath,
        "image/webp"
      );
    }

    return {
      fileName: originalName,
      imageUrl: originalURL,
      imagePath: originalPath,
      mediumUrl: mediumURL,
      mediumPath: mediumPath,
      thumbnailUrl: thumbnailURL,
      thumbnailPath: thumbnailPath,
    };
  } catch (error) {
    console.error("Error uploading image with thumbnail:", error);
    throw error;
  }
}
