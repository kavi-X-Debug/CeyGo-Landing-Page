import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowDown, ArrowRight, Lock, MapPin, QrCode, ShieldCheck, Timer, Navigation, ShoppingBasket } from 'lucide-react';
import ScrollSequence from './ScrollSequence.jsx';
import { useScrollSequence } from '../hooks/useScrollSequence.js';
import { shouldUseCinematic, prefersReducedMotion } from '../lib/motion.js';
import { ROUTES } from '../lib/content.js';

gsap.registerPlugin(ScrollTrigger);

/*
 * The cinematic story: the bicycle footage stays fixed in the background
 * while five content chapters scroll over it. Scroll position drives the
 * frame (rotation-01 → rotation-02 → multiplication) and where the bike sits,
 * so the animation always plays *with* content, never on its own.
 *
 * Each chapter declares where the bike should be while it is on screen
 * (cx/cy = centre as a share of the viewport, size = scale of a "contain" fit).
 */
const CHAPTERS = ['hero', 'steps', 'designed', 'everyday', 'fleet'];

const LAYOUTS = {
  desktop: {
    hero: { cx: 0.68, cy: 0.55, size: 0.78, feather: 0.6, alpha: 1 },
    steps: { cx: 0.7, cy: 0.52, size: 0.8, feather: 0.6, alpha: 1 },
    designed: { cx: 0.33, cy: 0.52, size: 0.84, feather: 0.6, alpha: 1 },
    everyday: { cx: 0.67, cy: 0.52, size: 0.84, feather: 0.6, alpha: 1 },
    fleet: { cx: 0.5, cy: 0.6, size: 0.88, feather: 0.7, alpha: 1 },
  },
  tablet: {
    hero: { cx: 0.5, cy: 0.74, size: 0.95, feather: 0.62, alpha: 1 },
    steps: { cx: 0.5, cy: 0.5, size: 1.05, feather: 0.62, alpha: 0.45 },
    designed: { cx: 0.5, cy: 0.5, size: 1.05, feather: 0.62, alpha: 0.45 },
    everyday: { cx: 0.5, cy: 0.5, size: 1.05, feather: 0.62, alpha: 0.45 },
    fleet: { cx: 0.5, cy: 0.56, size: 1, feather: 0.72, alpha: 1 },
  },
  mobile: {
    hero: { cx: 0.5, cy: 0.83, size: 1.05, feather: 0.6, alpha: 1 },
    steps: { cx: 0.5, cy: 0.5, size: 1.3, feather: 0.6, alpha: 0.6 },
    designed: { cx: 0.5, cy: 0.5, size: 1.3, feather: 0.6, alpha: 0.6 },
    everyday: { cx: 0.5, cy: 0.5, size: 1.3, feather: 0.6, alpha: 0.6 },
    fleet: { cx: 0.5, cy: 0.5, size: 1.1, feather: 0.72, alpha: 1 },
  },
};

// Stills used when the animation is off (reduced motion, data saver, load failure).
const STILLS = {
  hero: '/frames/poster-hero.webp',
  steps: '/frames/poster-hero.webp',
  designed: '/frames/poster-side.webp',
  everyday: '/frames/poster-side.webp',
  fleet: '/frames/poster-fleet.webp',
};

function breakpoint() {
  const w = window.innerWidth;
  return w >= 1024 ? 'desktop' : w >= 768 ? 'tablet' : 'mobile';
}

const lerp = (a, b, t) => a + (b - a) * t;
const ease = (t) => t * t * (3 - 2 * t);

// Piecewise-linear lookup: keys = [[scrollY, value], ...] sorted by scrollY.
function sample(keys, y, mix) {
  if (y <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i += 1) {
    const [y1, v1] = keys[i];
    if (y <= y1) {
      const [y0, v0] = keys[i - 1];
      const t = (y - y0) / Math.max(1, y1 - y0);
      return mix(v0, v1, t);
    }
  }
  return keys[keys.length - 1][1];
}
const mixNum = (a, b, t) => lerp(a, b, t);
const mixLayout = (a, b, t) => {
  const e = ease(t);
  const out = {};
  for (const k of Object.keys(a)) out[k] = lerp(a[k], b[k], e);
  return out;
};

export default function CinematicStory() {
  const [mode, setMode] = useState(null); // 'cinematic' | 'static'
  useEffect(() => setMode(shouldUseCinematic() ? 'cinematic' : 'static'), []);
  if (!mode) return <section className="h-[100svh] bg-night" aria-hidden="true" />;
  return <Story cinematic={mode === 'cinematic'} onFail={() => setMode('static')} />;
}

function Story({ cinematic, onFail }) {
  const sectionRef = useRef(null);
  const canvasRef = useRef(null);
  const chapterRefs = useRef({});
  const [still, setStill] = useState('hero');
  const { status, progress, draw, resize, totalFrames, boundaries } = useScrollSequence(canvasRef, { enabled: cinematic });

  useEffect(() => {
    if (status === 'error') onFail();
  }, [status, onFail]);

  // Frames + bike position follow the scroll position (smoothed with GSAP).
  useLayoutEffect(() => {
    if (!cinematic || status !== 'ready') return undefined;
    const total = totalFrames();
    const b = boundaries();
    if (!total) return undefined;

    const state = { y: window.scrollY };
    let frameKeys = [];
    let layoutKeys = [];
    let queued = false;

    const render = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => {
        queued = false;
        if (!frameKeys.length) return;
        draw(sample(frameKeys, state.y, mixNum), sample(layoutKeys, state.y, mixLayout));
      });
    };

    const build = () => {
      const vh = window.innerHeight;
      const L = LAYOUTS[breakpoint()];
      const abs = (el) => el.getBoundingClientRect().top + window.scrollY;
      const sec = sectionRef.current;
      const start = abs(sec);
      const end = start + sec.offsetHeight - vh;
      const top = (name) => abs(chapterRefs.current[name]);

      // rotation-01 plays through "hero" and "steps", rotation-02 through
      // "designed" and "everyday", multiplication while "fleet" scrolls in.
      const r1End = (b[1] ?? Math.round(total * 0.29)) - 1;
      const r2End = (b[2] ?? Math.round(total * 0.64)) - 1;
      frameKeys = [
        [start, 0],
        [top('designed') - vh * 0.35, r1End],
        [top('fleet') - vh * 0.45, r2End],
        [Math.max(end, top('fleet') + vh * 0.2), total - 1],
      ];
      // Hold the bike still while each chapter's copy is on screen; move it between chapters.
      layoutKeys = [];
      CHAPTERS.forEach((name, i) => {
        const el = chapterRefs.current[name];
        const from = i === 0 ? start : top(name) - vh * 0.2;
        const to = name === 'fleet' ? Math.max(end, from + 1) : top(name) + el.offsetHeight - vh * 0.75;
        layoutKeys.push([from, L[name]], [Math.max(from + 1, to), L[name]]);
      });
      resize();
      render();
    };

    const st = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: 'top top',
      end: 'bottom bottom',
      onRefresh: build,
      onUpdate: (self) => {
        gsap.to(state, { y: self.scroll(), duration: 0.6, ease: 'power3.out', overwrite: true, onUpdate: render });
      },
    });
    build();
    ScrollTrigger.refresh();
    return () => {
      st.kill();
      gsap.killTweensOf(state);
    };
  }, [cinematic, status, draw, resize, totalFrames, boundaries]);

  // Chapter copy fades/slides in as it arrives and out as it leaves.
  useLayoutEffect(() => {
    if (prefersReducedMotion()) return undefined;
    const ctx = gsap.context(() => {
      CHAPTERS.forEach((name, i) => {
        const el = chapterRefs.current[name];
        const inner = el.querySelector('[data-chapter-content]');
        const tl = gsap.timeline({
          scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 0.5 },
        });
        if (i === 0) tl.set(inner, { autoAlpha: 1 }).to(inner, { autoAlpha: 1, duration: 0.5 });
        else tl.fromTo(inner, { autoAlpha: 0, y: 70 }, { autoAlpha: 1, y: 0, duration: 0.3, ease: 'power2.out' }).to(inner, { duration: 0.35 });
        if (name !== 'fleet') tl.to(inner, { autoAlpha: 0, y: -70, duration: 0.3, ease: 'power2.in' });
        else tl.to(inner, { duration: 0.3 });
      });
      gsap.from('[data-hero]', { y: 24, autoAlpha: 0, duration: 1, ease: 'power3.out', stagger: 0.08, delay: 0.15 });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  // Static mode: swap the still image to match the chapter in view.
  useEffect(() => {
    if (cinematic) return undefined;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setStill(e.target.dataset.chapter)),
      { rootMargin: '-45% 0px -45% 0px' },
    );
    Object.values(chapterRefs.current).forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, [cinematic]);

  const setRef = (name) => (el) => {
    chapterRefs.current[name] = el;
  };

  return (
    <section ref={sectionRef} id="top" className="relative bg-night" aria-label="CeyGo introduction">
      {/* Fixed visual layer behind the chapters */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      <div className="sticky top-0 h-[100svh] w-full overflow-hidden">
        <div className="grid-texture pointer-events-none absolute inset-0" />
        <div className="pointer-events-none absolute left-1/2 top-[55%] h-[70vmin] w-[90vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-teal/25 blur-[120px]" />
        {cinematic ? (
          <ScrollSequence ref={canvasRef} status={status} progress={progress} />
        ) : (
          <StillLayer active={still} />
        )}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-night to-transparent md:h-32" />
      </div>
      </div>

      <div className="relative z-10">
        <Chapter name="hero" setRef={setRef} className="lg:items-center">
          <HeroCopy />
          <a href="#how-it-works" className="absolute bottom-8 right-6 hidden items-center gap-2 text-sm font-medium text-white/55 hover:text-white md:flex lg:right-10">
            Scroll to explore <ArrowDown className="h-4 w-4 animate-bounce" aria-hidden="true" />
          </a>
        </Chapter>

        <Chapter name="steps" id="how-it-works" setRef={setRef} tall>
          <Panel className="lg:max-w-[34rem]">
            <Eyebrow>How it works</Eyebrow>
            <h2 className="story-title">Three simple steps. Freedom to ride.</h2>
            <p className="story-lead">Getting started with CeyGo is simple. No app installation, complicated process, or unnecessary waiting.</p>
            <ol className="mt-8 space-y-5">
              {[
                [MapPin, 'Find your ride', 'Open CeyGo in your browser and find an available bicycle at a nearby station.'],
                [QrCode, 'Scan and unlock', 'Generate your secure QR code and show it to the station camera. It is valid for 60 seconds and works once.'],
                [Lock, 'Ride and return', 'Enjoy your journey and return your bicycle to any available compatible docking slot.'],
              ].map(([Icon, title, text], i) => (
                <li key={title} className="group/step -mx-3 flex gap-4 rounded-2xl px-3 py-2 transition-colors duration-300 hover:bg-white/[0.05]">
                  <span className="relative grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-hover text-mint transition-transform duration-300 group-hover/step:-rotate-6 group-hover/step:scale-110">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                    <span className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full bg-mint text-[11px] font-bold text-night">{i + 1}</span>
                  </span>
                  <div>
                    <h3 className="text-lg font-bold text-white">{title}</h3>
                    <p className="mt-1 text-[15px] leading-relaxed text-white/65">{text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Panel>
        </Chapter>

        <Chapter name="designed" setRef={setRef} tall align="right">
          <Panel className="lg:max-w-[30rem]">
            <Eyebrow>The bicycle</Eyebrow>
            <h2 className="story-title">Designed for freedom.</h2>
            <p className="story-lead">Every journey begins with a smarter ride.</p>
            <ul className="mt-8 grid gap-3">
              {[
                [Navigation, 'GPS tracker on every bike', 'ESP32 and NEO-6M report the bike’s location while you ride.'],
                [Lock, 'Made for the smart dock', 'Locks into any compatible CeyGo slot when you return it.'],
                [ShoppingBasket, 'Front basket', 'Room for a bag, books or your shopping.'],
              ].map(([Icon, title, text]) => (
                <li key={title} data-spotlight className="group/card flex items-start gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-mint/40 hover:bg-white/[0.07]">
                  <Icon className="mt-0.5 h-5 w-5 shrink-0 text-mint transition-transform duration-300 group-hover/card:scale-125" aria-hidden="true" />
                  <div>
                    <p className="font-semibold text-white">{title}</p>
                    <p className="text-[15px] text-white/60">{text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Panel>
        </Chapter>

        <Chapter name="everyday" setRef={setRef} tall>
          <Panel className="lg:max-w-[32rem]">
            <Eyebrow>Simple pricing</Eyebrow>
            <h2 className="story-title">Built for your everyday adventures.</h2>
            <p className="story-lead">Ride to class, to work or along the coast. Pay only for the minutes you use.</p>
            <dl className="mt-8 grid grid-cols-3 gap-3">
              {[
                ['LKR 5', 'per minute'],
                ['Free', 'to unlock'],
                ['30 s', 'to collect the bike'],
              ].map(([v, l]) => (
                <div key={l} data-spotlight className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 transition-all duration-300 hover:-translate-y-1 hover:border-mint/40 hover:bg-white/[0.07] sm:p-4">
                  <dt className="sr-only">{l}</dt>
                  <dd className="whitespace-nowrap text-xl font-extrabold tracking-tight text-mint sm:text-2xl md:text-[28px]">{v}</dd>
                  <dd className="mt-1 text-[13px] leading-snug text-white/60">{l}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to={ROUTES.rent} data-magnetic className="btn-mint h-12 px-6">
                Rent a bike now <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <a href="#pricing" className="btn-ghost h-12 px-6">
                See pricing
              </a>
            </div>
          </Panel>
        </Chapter>

        <Chapter name="fleet" setRef={setRef} fleet>
          <div className="relative text-center">
            <div className="pointer-events-none absolute -inset-x-[20%] -bottom-10 -top-40 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(4,32,29,0.92)_0%,rgba(4,32,29,0.7)_45%,transparent_72%)]" aria-hidden="true" />
            <Eyebrow center>Connected fleet</Eyebrow>
            <h2 className="mx-auto max-w-3xl text-[40px] font-extrabold leading-[1] tracking-[-0.045em] text-white md:text-[60px] lg:text-[68px]">
              One ride. <span className="text-mint">Endless possibilities.</span>
            </h2>
            <p className="mx-auto mt-4 max-w-md text-[17px] font-medium text-white/80 md:text-lg">From one bicycle to a connected network of smarter journeys.</p>
          </div>
          <dl className="mt-auto grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/10 backdrop-blur-md md:grid-cols-4">
            {[
              ['03', 'Smart-lock slots at Station 01'],
              ['60s', 'QR code validity'],
              ['30s', 'Bike collection window'],
              ['0', 'Faces identified'],
            ].map(([v, l]) => (
              <div key={l} className="group/stat bg-night/70 p-4 transition-colors duration-300 hover:bg-hover/80 md:p-7">
                <dd className="text-[30px] font-extrabold leading-none tracking-[-0.05em] text-white transition-colors duration-300 group-hover/stat:text-mint md:text-[52px]">{v}</dd>
                <dt className="mt-2 text-xs text-white/60 md:text-sm">{l}</dt>
              </div>
            ))}
          </dl>
        </Chapter>
      </div>
      <p className="sr-only">
        In the background, the camera moves around a CeyGo bicycle, then one bicycle becomes a line-up of three.
      </p>
    </section>
  );
}

function Chapter({ name, id, setRef, children, align = 'left', tall = false, fleet = false, className = '' }) {
  const height = fleet ? 'min-h-[170svh]' : tall ? 'min-h-[120svh]' : 'min-h-[100svh]';
  return (
    <div ref={setRef(name)} id={id} data-chapter={name} className={`relative flex ${height} ${fleet ? 'items-start' : 'items-center'} ${className}`}>
      <div
        data-chapter-content
        className={`wrap ${fleet ? 'sticky top-0 flex h-[100svh] flex-col pb-10 pt-28 md:pb-14 md:pt-32' : 'py-28'} ${
          align === 'right' ? 'flex lg:justify-end' : ''
        }`}
      >
        {children}
      </div>
    </div>
  );
}

function Panel({ children, className = '' }) {
  return (
    <div className={`rounded-[28px] border border-white/10 bg-night/40 p-6 backdrop-blur-[6px] md:p-9 lg:border-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-0 ${className}`}>
      {children}
    </div>
  );
}

function Eyebrow({ children, center = false }) {
  return (
    <p className={`mb-4 flex items-center gap-2 text-sm font-semibold text-mint ${center ? 'justify-center' : ''}`}>
      <span className="h-px w-6 bg-mint/60" aria-hidden="true" />
      {children}
    </p>
  );
}

function HeroCopy() {
  return (
    <div className="max-w-[36rem] pt-6 lg:pt-0">
      <p data-hero className="eyebrow border border-mint/25 bg-mint/10 px-3.5 py-1.5 text-mint">
        <span className="h-1.5 w-1.5 rounded-full bg-mint" aria-hidden="true" />
        Smart bicycle sharing
      </p>
      <h1 className="mt-5 text-[48px] font-extrabold leading-[0.95] tracking-[-0.05em] text-white sm:text-[64px] md:mt-6 lg:text-[84px] xl:text-[92px]">
        <span data-hero className="block">
          Scan. Ride.
        </span>
        <span data-hero className="block text-mint">
          Return.
        </span>
      </h1>
      <p data-hero className="mt-5 max-w-[30rem] text-[15px] leading-relaxed text-white/70 md:mt-6 md:text-lg">
        Discover a smarter way to move. Find a bicycle, unlock with a secure scan, and enjoy the freedom to ride.
      </p>
      <div data-hero className="mt-6 flex flex-wrap gap-3 md:mt-8">
        <Link to={ROUTES.rent} data-magnetic className="btn-mint h-12 px-6 text-[15px] md:h-14 md:px-7 md:text-base">
          Rent a bike now <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
        <a href="#how-it-works" className="btn-ghost h-12 px-6 text-[15px] md:h-14 md:px-7 md:text-base">
          See how it works
        </a>
      </div>
      <ul data-hero className="no-scrollbar -mx-5 mt-6 flex gap-2 overflow-x-auto px-5 md:mx-0 md:mt-10 md:flex-wrap md:gap-x-6 md:gap-y-3 md:overflow-visible md:px-0">
        {[
          [Timer, 'LKR 5 per minute'],
          [QrCode, 'Secure one-time QR unlocking'],
          [ShieldCheck, 'Smart station security'],
        ].map(([Icon, label]) => (
          <li key={label} className="flex shrink-0 items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 text-[12px] font-medium text-white/70 md:border-0 md:p-0 md:text-sm">
            <Icon className="h-4 w-4 text-mint" aria-hidden="true" />
            {label}
          </li>
        ))}
      </ul>
    </div>
  );
}

function StillLayer({ active }) {
  const [failed, setFailed] = useState({});
  // Where each still sits; on large screens it stays clear of the chapter copy.
  const place = {
    hero: 'lg:left-auto lg:right-[2%] lg:w-[58%]',
    steps: 'lg:left-auto lg:right-[2%] lg:w-[58%]',
    designed: 'lg:left-[2%] lg:w-[58%]',
    everyday: 'lg:left-auto lg:right-[2%] lg:w-[58%]',
    fleet: 'lg:left-[15%] lg:w-[70%]',
  };
  return (
    <>
      {Object.entries(STILLS).map(([name, src]) =>
        failed[src] ? null : (
          <div
            key={name}
            className={`absolute left-[-10%] top-1/2 aspect-video w-[120%] -translate-y-1/2 transition-opacity duration-700 ${place[name]} ${
              active === name ? `opacity-100 ${name === 'fleet' ? '' : 'max-lg:opacity-40'}` : 'opacity-0'
            }`}
          >
            <img
              src={src}
              alt=""
              onError={() => setFailed((f) => ({ ...f, [src]: true }))}
              className="h-full w-full object-cover [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_70%)]"
            />
          </div>
        ),
      )}
    </>
  );
}
