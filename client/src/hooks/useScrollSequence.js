import { useCallback, useEffect, useRef, useState } from 'react';

/*
 * Frame-sequence engine for the cinematic story section.
 *
 * - Reads /frames/manifest.json (written by scripts/prepare-frames.js).
 * - Picks the "sm" or "lg" frame set for the screen size.
 * - Loads frames progressively: the opening frames first, then evenly spaced
 *   "key" frames across all three videos, then everything else ordered by
 *   distance from where the visitor currently is.
 * - Keeps a bounded cache of decoded images; frames far from the current
 *   position are released (the browser's HTTP cache makes re-fetching cheap).
 * - draw(frame, layout) paints the nearest available frame onto the canvas,
 *   cross-fading at the cut between rotation-01 and rotation-02.
 */

const MANIFEST_URL = '/frames/manifest.json';
const POSTER_URL = '/frames/poster-hero.webp';
const CONCURRENCY = 6;
const INITIAL_FRAMES = 12;
const KEYFRAME_STEP = 10;
const CROSSFADE_FRAMES = 10; // frames blended across the rotation-01 → rotation-02 cut

function pad(n) {
  return String(n).padStart(4, '0');
}

function pickSize() {
  const w = window.innerWidth;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  return w < 768 && w * dpr < 1100 ? 'sm' : 'lg';
}

export function useScrollSequence(canvasRef, { enabled = true } = {}) {
  const [status, setStatus] = useState('idle'); // idle | loading | ready | error
  const [progress, setProgress] = useState(0); // 0–1 share of the initial batch loaded

  const store = useRef({
    urls: [],
    images: [],
    loading: new Set(),
    failed: new Set(),
    keyframes: new Set(),
    boundaries: [], // first global index of each sequence
    total: 0,
    current: 0,
    cap: 200,
    active: 0,
    queue: [],
    poster: null,
    lastDraw: null,
    redrawPending: false,
    destroyed: false,
  });

  const draw = useCallback(
    (frame, layout) => {
      const s = store.current;
      const canvas = canvasRef.current;
      if (!canvas || !s.total) return;
      s.lastDraw = { frame, layout };
      s.current = Math.round(frame);

      const ctx = canvas.getContext('2d');
      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      // Cross-fade window around the cut between the first two videos.
      const cut = s.boundaries[1];
      const half = CROSSFADE_FRAMES / 2;
      const layers = [];
      if (cut && frame > cut - half && frame < cut + half) {
        const t = (frame - (cut - half)) / CROSSFADE_FRAMES;
        layers.push([cut - 1, 1]);
        layers.push([cut, t]);
      } else {
        layers.push([Math.round(frame), 1]);
      }

      const sample = nearestLoaded(s, layers[0][0]);
      if (!sample) return;
      const iw = sample.naturalWidth;
      const ih = sample.naturalHeight;

      // "contain" fit, then scale by layout.size and centre on (cx, cy).
      const fit = Math.min(W / iw, H / ih);
      const scale = fit * layout.size;
      const dw = iw * scale;
      const dh = ih * scale;
      const dx = layout.cx * W - dw / 2;
      const dy = layout.cy * H - dh / 2;

      for (const [idx, alpha] of layers) {
        const img = nearestLoaded(s, idx);
        if (!img) continue;
        ctx.globalAlpha = alpha * (layout.alpha ?? 1);
        ctx.drawImage(img, dx, dy, dw, dh);
      }
      ctx.globalAlpha = 1;

      // Feather the footage edges into the page background so the studio
      // backdrop blends with the site instead of showing a hard rectangle.
      ctx.save();
      ctx.globalCompositeOperation = 'destination-in';
      ctx.translate(dx + dw / 2, dy + dh / 2);
      ctx.scale(1, dh / dw);
      const r = dw / 2;
      const g = ctx.createRadialGradient(0, 0, r * (layout.feather ?? 0.62), 0, 0, r);
      g.addColorStop(0, 'rgba(0,0,0,1)');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.fillRect(-r, -r, r * 2, r * 2);
      ctx.restore();
    },
    [canvasRef],
  );

  // Redraw on the next animation frame (used when a needed frame arrives).
  const requestRedraw = useCallback(() => {
    const s = store.current;
    if (s.redrawPending || !s.lastDraw) return;
    s.redrawPending = true;
    requestAnimationFrame(() => {
      s.redrawPending = false;
      if (s.lastDraw) draw(s.lastDraw.frame, s.lastDraw.layout);
    });
  }, [draw]);

  const resize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.max(1, Math.round(rect.width * dpr));
    canvas.height = Math.max(1, Math.round(rect.height * dpr));
    const s = store.current;
    if (s.lastDraw) draw(s.lastDraw.frame, s.lastDraw.layout);
  }, [canvasRef, draw]);

  useEffect(() => {
    if (!enabled) return undefined;
    const s = store.current;
    s.destroyed = false;

    function loadFrame(i) {
      if (s.images[i] || s.loading.has(i) || s.failed.has(i)) return Promise.resolve();
      s.loading.add(i);
      s.active += 1;
      return new Promise((resolve) => {
        const img = new Image();
        img.decoding = 'async';
        img.src = s.urls[i];
        const done = (ok) => {
          s.loading.delete(i);
          s.active -= 1;
          if (s.destroyed) return resolve();
          if (ok) {
            s.images[i] = img;
            evict();
            if (Math.abs(i - s.current) <= 30) requestRedraw();
          } else {
            s.failed.add(i);
          }
          resolve();
          pump();
        };
        img.onload = () => (img.decode ? img.decode().catch(() => {}) : Promise.resolve()).then(() => done(true));
        img.onerror = () => done(false);
      });
    }

    // Release frames far from the current position once the cache is full.
    function evict() {
      const loaded = [];
      s.images.forEach((img, i) => img && !s.keyframes.has(i) && loaded.push(i));
      if (loaded.length <= s.cap) return;
      loaded.sort((a, b) => Math.abs(b - s.current) - Math.abs(a - s.current));
      for (const i of loaded.slice(0, loaded.length - s.cap)) s.images[i] = null;
    }

    // Background loader: nearest-to-viewer first, within the cache budget.
    function pump() {
      if (s.destroyed) return;
      while (s.active < CONCURRENCY) {
        const next = nextWanted();
        if (next === -1) return;
        loadFrame(next);
      }
    }

    function nextWanted() {
      const span = Math.floor(s.cap / 2);
      for (let d = 0; d <= span; d += 1) {
        for (const i of [s.current + d, s.current - d]) {
          if (i >= 0 && i < s.total && !s.images[i] && !s.loading.has(i) && !s.failed.has(i)) return i;
        }
      }
      return -1;
    }

    function loadPoster() {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
        img.src = POSTER_URL;
      });
    }

    function reportProgress() {
      if (!s.initial || !s.initial.length) return;
      const done = s.initial.filter((i) => s.images[i] || s.failed.has(i)).length;
      setProgress((p) => Math.max(p, done / s.initial.length));
    }

    // Keep loading around the visitor as they scroll, and report progress.
    const tick = setInterval(() => {
      pump();
      reportProgress();
    }, 250);

    async function init() {
      setStatus('loading');
      try {
        const res = await fetch(MANIFEST_URL, { cache: 'no-cache' });
        if (!res.ok) throw new Error(`manifest ${res.status}`);
        const manifest = await res.json();
        const size = pickSize();
        s.cap = size === 'sm' ? 140 : 200;
        s.urls = [];
        s.boundaries = [];
        for (const seq of manifest.sequences) {
          s.boundaries.push(s.urls.length);
          for (let f = 1; f <= seq.frames; f += 1) s.urls.push(`/frames/${seq.name}/${size}/${pad(f)}.webp`);
        }
        s.total = s.urls.length;
        s.images = new Array(s.total).fill(null);
        if (!s.total) throw new Error('empty manifest');

        for (let i = 0; i < s.total; i += KEYFRAME_STEP) s.keyframes.add(i);
        s.boundaries.forEach((b) => {
          s.keyframes.add(b);
          if (b > 0) s.keyframes.add(b - 1);
        });
        s.keyframes.add(s.total - 1);

        // First batch: opening frames + key frames across the whole sequence.
        const initial = new Set();
        for (let i = 0; i < Math.min(INITIAL_FRAMES, s.total); i += 1) initial.add(i);
        s.keyframes.forEach((k) => initial.add(k));

        resize();
        // Paint the (already preloaded) poster straight away, then the real first frame.
        s.poster = await loadPoster();
        if (s.poster) {
          setStatus('ready');
          requestRedraw();
        }
        await loadFrame(0);
        if (!s.images[0] && !s.poster) throw new Error('first frame failed to load');
        setStatus('ready');
        requestRedraw();

        // Load the first batch, then keep filling in around the visitor.
        s.initial = [...initial];
        const list = s.initial.filter((i) => i !== 0);
        let cursor = 0;
        const runInitial = () => {
          if (s.destroyed) return;
          while (s.active < CONCURRENCY && cursor < list.length) loadFrame(list[cursor++]).then(runInitial);
          if (cursor >= list.length) pump();
        };
        runInitial();
      } catch (err) {
        console.warn('[CeyGo] Scroll sequence unavailable:', err.message);
        if (!s.destroyed) setStatus('error');
      }
    }

    init();
    window.addEventListener('resize', resize);
    return () => {
      s.destroyed = true;
      clearInterval(tick);
      window.removeEventListener('resize', resize);
      s.images = [];
    };
  }, [enabled, resize, requestRedraw]);

  const totalFrames = useCallback(() => store.current.total, []);
  const boundaries = useCallback(() => store.current.boundaries, []);

  return { status, progress, draw, resize, totalFrames, boundaries };
}

// Closest frame we already have, so scrubbing never shows a blank canvas.
function nearestLoaded(s, idx) {
  const i = Math.max(0, Math.min(s.total - 1, idx));
  if (s.images[i]) return s.images[i];
  for (let d = 1; d < s.total; d += 1) {
    if (s.images[i - d]) return s.images[i - d];
    if (s.images[i + d]) return s.images[i + d];
  }
  return i < (s.boundaries[1] || Infinity) ? s.poster : null;
}
