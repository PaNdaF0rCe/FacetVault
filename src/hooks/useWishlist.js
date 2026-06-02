import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'fv_wishlist_v1';

function readFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeToStorage(ids) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // storage full or unavailable
  }
}

export function useWishlist() {
  const [wishlist, setWishlist] = useState(() => readFromStorage());

  useEffect(() => {
    function handleStorageEvent(e) {
      if (e.key === STORAGE_KEY) {
        setWishlist(readFromStorage());
      }
    }
    window.addEventListener('storage', handleStorageEvent);
    return () => window.removeEventListener('storage', handleStorageEvent);
  }, []);

  const toggle = useCallback((id) => {
    setWishlist((prev) => {
      const next = prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id];
      writeToStorage(next);
      return next;
    });
  }, []);

  const isWishlisted = useCallback(
    (id) => wishlist.includes(id),
    [wishlist]
  );

  const clear = useCallback(() => {
    writeToStorage([]);
    setWishlist([]);
  }, []);

  return {
    wishlist,
    toggle,
    isWishlisted,
    count: wishlist.length,
    clear,
  };
}
