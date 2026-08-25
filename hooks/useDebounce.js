"use client";

import { useEffect, useState } from "react";

/**
 * Delay a fast-changing value. Typing "raj" fires one request instead of three —
 * the difference between a search box and a load generator.
 */
export function useDebounce(value, delay = 350) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
