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