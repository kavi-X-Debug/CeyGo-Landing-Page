import { useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { prefersReducedMotion } from '../lib/motion.js';

gsap.registerPlugin(ScrollTrigger);

/**
 * Fade-up entrances for [data-reveal] elements and soft parallax for
 * [data-parallax] elements inside rootRef. Does nothing with reduced motion
 * (the CSS starting state is only applied when <html> has .motion-ok).
 */
export function useReveal(rootRef) {
  useLayoutEffect(() => {
    if (prefersReducedMotion() || !rootRef.current) return undefined;
    const ctx = gsap.context(() => {
      ScrollTrigger.batch('[data-reveal]', {
        start: 'top 88%',
        once: true,
        onEnter: (els) =>
          gsap.to(els, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.09, overwrite: true }),
      });
      gsap.utils.toArray('[data-parallax]').forEach((el) => {
        gsap.fromTo(
          el,
          { yPercent: 6 },
          {
            yPercent: -6,
            ease: 'none',
            scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true },
          },
        );
      });
    }, rootRef);
    return () => ctx.revert();
  }, [rootRef]);
}
