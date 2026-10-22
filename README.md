# CeyGo — cinematic landing page

React + Vite + Tailwind CSS front end with a GSAP ScrollTrigger / HTML5 Canvas
scroll animation built from the three CeyGo bicycle videos, plus a small
Node.js + Express API ready for later rider, owner and IoT features.

```
ceygo/
├── client/                 React app (Vite)
│   ├── public/videos/      rotation-01.mp4, rotation-02.mp4, multiplication.mp4
│   ├── public/frames/      WebP frames + manifest.json (generated)
│   └── src/                components, hooks, pages
├── server/                 Express API (GET /api/health)
├── scripts/prepare-frames.js
└── package.json            helper scripts
```

## Quick preview on Windows (no installs)

Double-click **`Preview CeyGo.bat`**. It serves the ready-built site in
`client/dist` with Windows PowerShell and opens http://localhost:5173.
Close the window to stop it. (For development with live reload, use
`start-ceygo.bat` or the steps below — those need Node.js.)

## Requirements

- Node.js 18 or newer (20+ recommended)
- FFmpeg with WebP support, only if you need to regenerate the frames
  (Windows: `winget install Gyan.FFmpeg`, macOS: `brew install ffmpeg`)

## Setup

```bash
cd ceygo
npm run install:all          # installs client and server dependencies
cp server/.env.example server/.env   # Windows: copy server\.env.example server\.env
```

The frames are already generated in `client/public/frames`. To rebuild them
(for example after replacing a video):

```bash
npm run frames               # 20 fps, two sizes (1280px and 720px wide)
node scripts/prepare-frames.js --fps 16   # fewer frames, smaller download
```

## Run in development

Two terminals:

```bash
npm run dev:server           # API on http://localhost:4000
npm run dev:client           # site on http://localhost:5173 (proxies /api to :4000)
```

Useful URL switches while testing:

- `http://localhost:5173/?motion=full` forces the cinematic version
- `http://localhost:5173/?motion=static` forces the still-image version

## Production build

```bash
npm run build                # builds client/dist
# serve the built site and the API from one Node process:
#   set NODE_ENV=production in server/.env, then
npm start                    # http://localhost:4000
```

`client/dist` can also be deployed to any static host (Vercel, Netlify, S3);
the `public/frames` folder is copied into it automatically.

## How the scroll animation works

1. **Asset preparation** — `scripts/prepare-frames.js` probes each video with
   ffprobe and exports frames with FFmpeg at 20 fps as WebP in two sizes
   (`lg` 1280px, `sm` 720px). It writes `frames/manifest.json` (frame counts in
   play order) and three stills (`poster-hero`, `poster-side`, `poster-fleet`)
   used as the first paint and as static fallbacks.
2. **Loading** (`src/hooks/useScrollSequence.js`) — reads the manifest, picks
   `sm` on phones and `lg` elsewhere, paints the preloaded poster immediately,
   then loads the opening frames and every 10th frame across all three videos
   so scrubbing always has something close to show. The remaining frames load
   six at a time, nearest to the visitor's position first. Decoded images are
   kept in a bounded cache (200 on desktop, 140 on phones); frames far from the
   current position are released and re-fetched from the browser cache if needed.
3. **Drawing** — a single `<canvas>` (sized for devicePixelRatio, max 2×) draws
   the nearest available frame with a "contain" fit, so the bicycles are never
   stretched or cropped, then feathers the edges into the page background.
   The cut between rotation-01 and rotation-02 is softened with a 10-frame
   cross-fade.
4. **Scroll story** (`src/components/CinematicStory.jsx`) — the canvas sits in
   a sticky layer behind five content chapters (hero, how it works, the
   bicycle, everyday pricing, connected fleet) that scroll over it, so the
   animation always plays together with content. A GSAP ScrollTrigger tracks
   the section and eases the scroll position; from it the page works out the
   frame (rotation-01 across the first two chapters, rotation-02 across the
   next two, multiplication as the fleet chapter arrives) and where the bike
   sits (it holds still beside each chapter's copy and moves between
   chapters). Chapter copy fades in and out with scrubbed GSAP timelines.
5. **Fallbacks** — with `prefers-reduced-motion`, Data Saver, very low-end
   hardware, or if the frames fail to load, the story keeps all its content
   and shows still images that change with the chapter. The rest of the page still works fully.

## Video order and continuity

| Stage | File | Source video | Length |
|---|---|---|---|
| 1 | `rotation-01.mp4` | CeyGo_commuter_bicycle_animation | 8 s, 160 frames |
| 2 | `rotation-02.mp4` | CeyGo_bicycle_product_animation | 10 s, 200 frames |
| 3 | `multiplication.mp4` | Bicycles_revealing_in_studio | 10 s, 200 frames |

All three are 1920×1080 at 24 fps.

## Known limitations

- Rotation 01 ends at a rear three-quarter view while rotation 02 starts at a
  front three-quarter view of a slightly different bike (it adds a rear rack),
  so that join is a short cross-fade rather than one continuous camera move.
  Rotation 02 → multiplication join cleanly (both at a side view).
- Desktop downloads about 20 MB of frames in total (phones about 7 MB). They load
  progressively, but on slow connections the animation can show the nearest
  loaded frame for a moment while scrubbing quickly.
- "Rent a bike", "Report a problem" and the legal links open
  placeholder pages. The page is for riders only; the owner dashboard is a
  separate app. There is no real rental, sign-in, payment or hardware
  API yet — only `GET /api/health`.
- Interface pictures (map, QR screen, docking slots, ride cost, report form) are HTML/SVG
  mockups for illustration, with sample data.
- The Inter font loads from Google Fonts; offline it falls back to the system sans-serif.
