import { useCallback } from 'react';
import type { MouseEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

/** Every section of the landing page the marketing chrome can link to. */
export const SECTION_IDS = {
  demo: 'demo',
  howItWorks: 'how-it-works',
  features: 'features',
  security: 'security',
  pricing: 'pricing',
  faq: 'faq',
} as const;

export type SectionId = (typeof SECTION_IDS)[keyof typeof SECTION_IDS];

/**
 * Links in the marketing chrome point at sections of the landing page. On the
 * landing page that should scroll rather than reload the document; from any
 * other route it has to navigate first and scroll once the section exists.
 *
 * The anchors keep a real `href` so middle-click, copy-link and keyboard use
 * all still behave; this only takes over the plain left click.
 */
export const useSectionLink = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return useCallback(
    (event: MouseEvent<HTMLAnchorElement>, id: SectionId | string) => {
      // Leave modified clicks to the browser so "open in new tab" still works.
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) {
        return;
      }
      event.preventDefault();

      const onLanding = location.pathname === '/' || location.pathname === '/landing';
      const target = onLanding ? document.getElementById(id) : null;

      if (target) {
        target.scrollIntoView({ block: 'start' });
        // Keep the address bar in step without pushing a history entry for
        // every section the person glances at.
        window.history.replaceState(null, '', `#${id}`);
        return;
      }

      // Not on the landing page (or the section has not mounted): let the
      // router take us there, and App's hash effect does the scrolling.
      navigate(`/#${id}`);
    },
    [location.pathname, navigate]
  );
};
