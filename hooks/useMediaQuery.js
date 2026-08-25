"use client";

import { useEffect, useState } from "react";

export function useMediaQuery(query) {
  // Starts false so server and first client render agree (no hydration mismatch).
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(query);
    setMatches(mql.matches);

    const onChange = (e) => setMatches(e.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}
