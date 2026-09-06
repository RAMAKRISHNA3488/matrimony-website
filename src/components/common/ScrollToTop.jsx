import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop automatically resets the window scroll position to (0, 0)
 * on every route change instantly, smoothly, and cleanly without lag.
 */
export default function ScrollToTop() {
  const { pathname, search, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      // If navigating to an in-page hash anchor (e.g., #faq, #app-download)
      const timer = setTimeout(() => {
        const element = document.querySelector(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 30);
      return () => clearTimeout(timer);
    } else {
      // Immediate clean scroll to top without delay or scroll position lag
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant'
      });
      if (document.documentElement) document.documentElement.scrollTop = 0;
      if (document.body) document.body.scrollTop = 0;
    }
  }, [pathname, search, hash]);

  return null;
}
