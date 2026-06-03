import { useState, useCallback } from "react";

const KEY = "fv_wishlist_v1";

function loadWishlist() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

function saveWishlist(ids) {
  try {
    localStorage.setItem(KEY, JSON.stringify(ids));
  } catch {
    // storage blocked — fail silently
  }
}

export function useWishlist() {
  const [ids, setIds] = useState(() => loadWishlist());

  const toggle = useCallback((id) => {
    setIds((prev) => {
      const next = prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id];
      saveWishlist(next);
      return next;
    });
  }, []);

  const has = useCallback((id) => ids.includes(id), [ids]);

  return { ids, has, toggle, count: ids.length };
}
