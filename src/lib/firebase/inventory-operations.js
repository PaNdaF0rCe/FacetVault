import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  doc,
  deleteDoc,
  updateDoc
} from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import { db, storage } from './config';
import { createDocument, getDocument } from './db-operations';
import { uploadFileToStorage } from './storage-utils';
import { updateUserStats } from './users';
import { UnauthorizedError } from './errors';

export async function getFilteredInventory(userId, filters = {}) {
  try {
    let q = query(
      collection(db, 'inventory'),
      where('userId', '==', userId),
      orderBy('updatedAt', 'desc')
    );

    const querySnapshot = await getDocs(q);

    let items = querySnapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data()
    }));

    if (filters.category) {
      items = items.filter((item) => item.category === filters.category);
    }

    if (filters.search?.trim()) {
      const searchTerm = filters.search.trim().toLowerCase();
      items = items.filter((item) =>
        (item.name || '').toLowerCase().includes(searchTerm) ||
        (item.category || '').toLowerCase().includes(searchTerm) ||
        (item.stoneType || '').toLowerCase().includes(searchTerm) ||
        (item.color || '').toLowerCase().includes(searchTerm) ||
        (item.cut || '').toLowerCase().includes(searchTerm) ||
        (item.origin || '').toLowerCase().includes(searchTerm) ||
        (item.notes || '').toLowerCase().includes(searchTerm)
      );
    }

    return items;
  } catch (error) {
    console.error('Error getting filtered inventory:', error);
    throw error;
  }
}

export async function uploadInventoryItem(file, metadata, userId) {
  try {
    const uploadedFile = await uploadFileToStorage(file, userId);

    const itemData = {
      userId,
      name: metadata.name || '',
      category: metadata.category || '',
      stoneType: metadata.stoneType || '',
      carat: metadata.carat !== null && metadata.carat !== undefined && metadata.carat !== ''
        ? Number(metadata.carat)
        : null,
      color: metadata.color || '',
      cut: metadata.cut || '',
      origin: metadata.origin || '',
      pricePaid: metadata.pricePaid !== null && metadata.pricePaid !== undefined && metadata.pricePaid !== ''
        ? Number(metadata.pricePaid)
        : null,
      notes: metadata.notes || '',
      quantity: metadata.quantity ? Number(metadata.quantity) : 1,
      fileName: uploadedFile.filename,
      imageUrl: uploadedFile.downloadURL,
      imagePath: uploadedFile.path
    };

    const result = await createDocument('inventory', itemData);
    await updateUserStats(userId);
    return result;
  } catch (error) {
    console.error('Error uploading inventory item:', error);
    throw error;
  }
}

export const updateInventoryItem = async (itemId, updatedData) => {
  try {
    const itemRef = doc(db, 'inventory', itemId);

    await updateDoc(itemRef, {
      ...updatedData,
      updatedAt: new Date()
    });

    return true;
  } catch (error) {
    console.error('Error updating inventory item:', error);
    throw error;
  }
};

export const deleteInventoryItem = async (itemId, userId) => {
  try {
    const item = await getDocument('inventory', itemId);

    if (!item) {
      throw new Error('Item not found');
    }

    if (item.userId !== userId) {
      throw new UnauthorizedError('Only the owner can delete this item');
    }

    await deleteDoc(doc(db, 'inventory', itemId));

    if (item.imagePath) {
      try {
        const imageRef = ref(storage, item.imagePath);
        await deleteObject(imageRef);
      } catch (storageError) {
        console.log('No image found or error deleting image:', storageError);
      }
    }

    await updateUserStats(userId);
    return true;
  } catch (error) {
    console.error('Error deleting inventory item:', error);
    throw error;
  }
};

export const updateItemQuantity = async (itemId, newQuantity) => {
  try {
    const itemRef = doc(db, 'inventory', itemId);

    await updateDoc(itemRef, {
      quantity: newQuantity,
      updatedAt: new Date()
    });

    return true;
  } catch (error) {
    console.error('Error updating quantity:', error);
    throw error;
  }
};