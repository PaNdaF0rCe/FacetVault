import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './config';

export async function uploadFileToStorage(file, userId) {
  try {
    if (!file) {
      throw new Error('No file provided');
    }

    const timestamp = Date.now();
    const extension = file.name?.split('.').pop() || 'jpg';
    const safeName = `gem_${timestamp}.${extension}`;
    const path = `inventory/${userId}/${safeName}`;

    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);

    return {
      downloadURL,
      path,
      filename: safeName
    };
  } catch (error) {
    console.error('Error uploading file to storage:', error);
    throw error;
  }
}

export async function deleteFileFromStorage(path) {
  try {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
    return true;
  } catch (error) {
    if (error.code === 'storage/object-not-found') {
      return true;
    }
    console.error('Error deleting file from storage:', error);
    throw error;
  }
}

export async function getFileFromStorage(path) {
  try {
    const storageRef = ref(storage, path);
    return await getDownloadURL(storageRef);
  } catch (error) {
    console.error('Error getting file from storage:', error);
    throw error;
  }
}

export async function uploadImageWithThumbnail(imagePayload, userId) {
  try {
    if (!imagePayload?.original) {
      throw new Error('No image provided');
    }

    const timestamp = Date.now();

    // ORIGINAL IMAGE
    const originalExt = imagePayload.original.name?.split('.').pop() || 'jpg';
    const originalName = `gem_${timestamp}.${originalExt}`;
    const originalPath = `inventory/${userId}/original/${originalName}`;

    const originalRef = ref(storage, originalPath);
    await uploadBytes(originalRef, imagePayload.original);
    const originalURL = await getDownloadURL(originalRef);

    let thumbnailURL = null;
    let thumbnailPath = null;

    // THUMBNAIL (optional but expected)
    if (imagePayload.thumbnail) {
      const thumbName = `gem_${timestamp}_thumb.webp`;
      thumbnailPath = `inventory/${userId}/thumbnails/${thumbName}`;

      const thumbRef = ref(storage, thumbnailPath);
      await uploadBytes(thumbRef, imagePayload.thumbnail);
      thumbnailURL = await getDownloadURL(thumbRef);
    }

    return {
      fileName: originalName,
      imageUrl: originalURL,
      imagePath: originalPath,
      thumbnailUrl: thumbnailURL,
      thumbnailPath: thumbnailPath
    };

  } catch (error) {
    console.error('Error uploading image with thumbnail:', error);
    throw error;
  }
}