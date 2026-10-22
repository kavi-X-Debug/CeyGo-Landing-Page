import { forwardRef } from 'react';

/**
 * The canvas the bicycle frames are painted on, plus a small loading
 * indicator. The drawing itself is done by useScrollSequence.
 */
const ScrollSequence = forwardRef(function ScrollSequence({ status, progress }, ref) {
  const loading = status === 'idle' || status === 'loading';
  return (
    <div className="absolute inset-0">
      <canvas
        ref={ref}
        className="absolute inset-0 h-full w-full"
        aria-hidden="true"
      />
      <div
        role="status"
        aria-live="polite"
        className={`pointer-events-none absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-3 whitespace-nowrap rounded-full border border-white/10 bg-night/70 px-4 py-2 text-xs font-medium text-white/70 backdrop-blur transition-opacity duration-500 md:bottom-8 ${
          loading || progress < 1 ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <span className="relative h-1 w-24 overflow-hidden rounded-full bg-white/10">
          <span
            className="absolute inset-y-0 left-0 rounded-full bg-mint transition-[width] duration-300"
            style={{ width: `${Math.round(progress * 100)}%` }}
          />
        </span>
        <span>{loading ? 'Preparing the ride' : `Loading frames ${Math.round(progress * 100)}%`}</span>
      </div>
    </div>
  );
});

export default ScrollSequence;
