import { useState, useEffect, useCallback } from "react";

const KEY = "fv_recently_viewed_v1";
const MAX = 8;

function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

function save(ids) {
  try {
    localStorage.setItem(KEY, JSON.stringify(ids));
  } catch {
    // storage unavailable
  }
}

/**
 * useRecentlyViewed(currentId?)
 *
 * On mount (when currentId is provided), pushes that id to the front of the
 * list so "last visited" is always first.  Returns the list *excluding* the
 * current stone so the strip never shows the stone you're currently on.
 */
export function useRecentlyViewed(currentId) {
  const [ids, setIds] = useState(load);

  // Record a visit whenever currentId changes
  useEffect(() => {
    if (!currentId) return;

    setIds((prev) => {
      const filtered = prev.filter((id) => id !== currentId);
      const next = [currentId, ...filtered].slice(0, MAX);
      save(next);
      return next;
    });
  }, [currentId]);

  // Return ids without the current stone (so you never see yourself in the strip)
  const others = currentId ? ids.filter((id) => id !== currentId) : ids;

  return others;
}
