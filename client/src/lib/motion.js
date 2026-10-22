// Helpers that decide how much motion the page should use.

export function prefersReducedMotion() {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// Very rough "should we skip the heavy canvas sequence?" check.
// Data-saver mode or very weak hardware gets the static version.
export function isLowPowerDevice() {
  if (typeof navigator === 'undefined') return false;
  const conn = navigator.connection || {};
  if (conn.saveData) return true;
  if (/(^|-)2g$/.test(conn.effectiveType || '')) return true;
  if (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2) return true;
  if (navigator.deviceMemory && navigator.deviceMemory <= 1) return true;
  return false;
}

// Override for testing and demos: ?motion=full forces the cinematic hero,
// ?motion=static forces the still-image version.
function motionOverride() {
  if (typeof window === 'undefined') return null;
  const v = new URLSearchParams(window.location.search).get('motion');
  return v === 'full' || v === 'static' ? v : null;
}

export function shouldUseCinematic() {
  const o = motionOverride();
  if (o) return o === 'full';
  return !prefersReducedMotion() && !isLowPowerDevice();
}
