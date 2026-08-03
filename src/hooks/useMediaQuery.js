import { useEffect, useState } from 'react';

const BREAKPOINTS = {
  sm:  640,
  md:  768,
  lg:  1024,
  xl:  1280,
  '2xl': 1536,
};

/**
 * Returns true when the viewport is at least `breakpoint` wide.
 * @param {'sm'|'md'|'lg'|'xl'|'2xl'|number} breakpoint
 */
const useMediaQuery = (breakpoint = 'md') => {
  const px = typeof breakpoint === 'number' ? breakpoint : BREAKPOINTS[breakpoint] ?? 768;
  const query = `(min-width: ${px}px)`;

  const [matches, setMatches] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(query).matches : false
  );

  useEffect(() => {
    const mql = window.matchMedia(query);
    const handler = (e) => setMatches(e.matches);
    mql.addEventListener('change', handler);
    setMatches(mql.matches);
    return () => mql.removeEventListener('change', handler);
  }, [query]);

  return matches;
};

export default useMediaQuery;
