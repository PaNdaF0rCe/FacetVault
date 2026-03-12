import { doc, setDoc, getDoc, getDocs, collection, query, where, updateDoc } from 'firebase/firestore';
import { db } from './config';
import { getDocument, updateDocument } from './db-operations';
import { validateUserData, validateProfileUpdates } from './validation';

export async function createUserDocument(user) {
  validateUserData(user);

  try {
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      const userData = {
        displayName: user.displayName || '',
        email: user.email || '',
        photoURL: user.photoURL || '',
        createdAt: new Date(),
        updatedAt: new Date(),
        totalItems: 0,
        itemsByCategory: {},
        lastScan: null
      };

      await setDoc(userRef, userData);
    }
  } catch (error) {
    console.error('Error creating user document:', error);
    throw error;
  }
}

export async function updateUserStats(userId) {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    // Create the user document first if it does not exist
    if (!userSnap.exists()) {
      await setDoc(userRef, {
        displayName: '',
        email: '',
        photoURL: '',
        createdAt: new Date(),
        updatedAt: new Date(),
        totalItems: 0,
        itemsByCategory: {},
        lastScan: null
      });
    }

    const inventoryRef = collection(db, 'inventory');
    const q = query(inventoryRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);

    const totalItems = querySnapshot.size;
    const itemsByCategory = {};

    querySnapshot.forEach((docSnap) => {
      const item = docSnap.data();
      const qty = Number(item.quantity) || 1;
      const category = item.category || 'Other';
      itemsByCategory[category] = (itemsByCategory[category] || 0) + qty;
    });

    await updateDoc(userRef, {
      totalItems,
      itemsByCategory,
      updatedAt: new Date()
    });

    return { totalItems, itemsByCategory };
  } catch (error) {
    console.error('Error updating user stats:', error);
    throw error;
  }
}

export async function getUserProfile(userId) {
  try {
    return await getDocument('users', userId);
  } catch (error) {
    if (error.message.includes('Document not found')) {
      return null;
    }
    console.error('Error getting user profile:', error);
    throw error;
  }
}

export async function updateUserProfile(userId, updates) {
  try {
    validateProfileUpdates(updates);
    await updateDocument('users', userId, updates);
    return true;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
}