import { useEffect } from 'react';
import gsap from 'gsap';
import { prefersReducedMotion } from '../lib/motion.js';

/**
 * Pointer-driven hover effects, wired once with event delegation:
 *  - [data-spotlight] a soft mint glow that follows the cursor (CSS vars --mx/--my)
 *  - [data-tilt]      a gentle 3D tilt towards the cursor
 *  - [data-magnetic]  the element is pulled slightly towards the cursor
 * Only on devices with a real hover pointer, and never with reduced motion.
 */
export function useHoverEffects() {
  useEffect(() => {
    if (prefersReducedMotion()) return undefined;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return undefined;

    let tiltEl = null;
    let magnetEl = null;

    const onMove = (e) => {
      const target = e.target instanceof Element ? e.target : null;
      if (!target) return;

      const spot = target.closest('[data-spotlight]');
      if (spot) {
        const r = spot.getBoundingClientRect();
        spot.style.setProperty('--mx', `${e.clientX - r.left}px`);
        spot.style.setProperty('--my', `${e.clientY - r.top}px`);
      }

      const tilt = target.closest('[data-tilt]');
      if (tiltEl && tiltEl !== tilt) resetTilt(tiltEl);
      tiltEl = tilt;
      if (tilt) {
        const r = tilt.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        const max = Number(tilt.dataset.tilt) || 4;
        gsap.to(tilt, {
          rotateY: px * max * 2,
          rotateX: -py * max * 2,
          transformPerspective: 1200,
          duration: 0.6,
          ease: 'power3.out',
          overwrite: 'auto',
        });
      }

      const magnet = target.closest('[data-magnetic]');
      if (magnetEl && magnetEl !== magnet) resetMagnet(magnetEl);
      magnetEl = magnet;
      if (magnet) {
        const r = magnet.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        gsap.to(magnet, { x: dx * 0.18, y: dy * 0.25, duration: 0.4, ease: 'power3.out', overwrite: 'auto' });
      }
    };

    const resetTilt = (el) => gsap.to(el, { rotateX: 0, rotateY: 0, duration: 0.8, ease: 'elastic.out(1, 0.6)', overwrite: 'auto' });
    const resetMagnet = (el) => gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.5)', overwrite: 'auto' });

    const onLeaveWindow = () => {
      if (tiltEl) resetTilt(tiltEl);
      if (magnetEl) resetMagnet(magnetEl);
      tiltEl = null;
      magnetEl = null;
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerleave', onLeaveWindow);
    return () => {
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', onLeaveWindow);
    };
  }, []);
}
