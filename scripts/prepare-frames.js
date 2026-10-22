#!/usr/bin/env node
/**
 * Turns the three CeyGo videos into numbered WebP frames for the scroll animation.
 *
 *   node scripts/prepare-frames.js            # default 20 fps
 *   node scripts/prepare-frames.js --fps 16   # fewer frames, smaller download
 *
 * Needs FFmpeg (with libwebp) on your PATH: https://ffmpeg.org/download.html
 *
 * Input:  client/public/videos/{rotation-01,rotation-02,multiplication}.mp4
 * Output: client/public/frames/<sequence>/<lg|sm>/0001.webp …
 *         client/public/frames/manifest.json
 *         client/public/frames/poster-*.webp  (stills used before frames load
 *                                               and as static fallbacks)
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const videosDir = path.join(root, 'client/public/videos');
const framesDir = path.join(root, 'client/public/frames');

// Order matters: this is the order the scroll animation plays them in.
const SEQUENCES = ['rotation-01', 'rotation-02', 'multiplication'];

// Two sizes: "lg" for desktop/tablet, "sm" for phones.
const SIZES = { lg: 1280, sm: 720 };
const QUALITY = { lg: 72, sm: 68 };

const argFps = process.argv.indexOf('--fps');
const FPS = argFps > -1 ? Number(process.argv[argFps + 1]) : 20;

function run(cmd, args) {
  const r = spawnSync(cmd, args, { stdio: ['ignore', 'pipe', 'pipe'], encoding: 'utf8' });
  if (r.error) throw r.error;
  if (r.status !== 0) throw new Error(`${cmd} failed:\n${r.stderr}`);
  return r.stdout;
}

function probe(file) {
  const out = run('ffprobe', [
    '-v', 'error', '-select_streams', 'v:0',
    '-show_entries', 'stream=width,height,r_frame_rate:format=duration',
    '-of', 'json', file,
  ]);
  const j = JSON.parse(out);
  const [n, d] = j.streams[0].r_frame_rate.split('/').map(Number);
  return {
    width: j.streams[0].width,
    height: j.streams[0].height,
    fps: n / d,
    duration: Number(j.format.duration),
  };
}

function checkTools() {
  try {
    run('ffmpeg', ['-hide_banner', '-version']);
  } catch {
    console.error('FFmpeg was not found. Install it and make sure "ffmpeg" and "ffprobe" are on your PATH.');
    process.exit(1);
  }
}

function main() {
  checkTools();

  const missing = SEQUENCES.filter((s) => !fs.existsSync(path.join(videosDir, `${s}.mp4`)));
  if (missing.length) {
    console.error('Missing video files in client/public/videos/:');
    missing.forEach((m) => console.error(`  - ${m}.mp4`));
    console.error('Add them (same names) and run this script again. Nothing was generated.');
    process.exit(1);
  }

  fs.mkdirSync(framesDir, { recursive: true });
  const manifest = { fps: FPS, generatedAt: new Date().toISOString(), sizes: {}, sequences: [] };

  for (const name of SEQUENCES) {
    const src = path.join(videosDir, `${name}.mp4`);
    const info = probe(src);
    console.log(`\n${name}: ${info.width}x${info.height}, ${info.fps} fps, ${info.duration.toFixed(2)} s`);

    let count = 0;
    for (const [size, width] of Object.entries(SIZES)) {
      const out = path.join(framesDir, name, size);
      fs.mkdirSync(out, { recursive: true });
      for (const f of fs.readdirSync(out)) if (f.endsWith('.webp')) fs.unlinkSync(path.join(out, f));

      run('ffmpeg', [
        '-v', 'error', '-y', '-i', src,
        '-vf', `fps=${FPS},scale=${width}:-2:flags=lanczos`,
        '-c:v', 'libwebp', '-quality', String(QUALITY[size]), '-compression_level', '5',
        path.join(out, '%04d.webp'),
      ]);
      const n = fs.readdirSync(out).filter((f) => f.endsWith('.webp')).length;
      const bytes = fs.readdirSync(out).reduce((a, f) => a + fs.statSync(path.join(out, f)).size, 0);
      console.log(`  ${size}: ${n} frames, ${(bytes / 1024 / 1024).toFixed(1)} MB`);
      count = n;
      manifest.sizes[size] = { width, height: Math.round((width * info.height) / info.width / 2) * 2 };
    }
    manifest.sequences.push({ name, frames: count, sourceDuration: info.duration });
  }

  // Still images: a hero poster (first frame), a side view and the three-bike lineup.
  const stills = [
    ['poster-hero.webp', 'rotation-01', '0'],
    ['poster-side.webp', 'rotation-02', 'last'],
    ['poster-fleet.webp', 'multiplication', 'last'],
  ];
  for (const [file, seq, at] of stills) {
    const src = path.join(videosDir, `${seq}.mp4`);
    const args = at === 'last' ? ['-sseof', '-0.2', '-i', src] : ['-ss', at, '-i', src];
    run('ffmpeg', [
      '-v', 'error', '-y', ...args, '-frames:v', '1',
      '-vf', 'scale=1600:-2:flags=lanczos',
      '-c:v', 'libwebp', '-quality', '80', path.join(framesDir, file),
    ]);
  }

  fs.writeFileSync(path.join(framesDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
  const total = manifest.sequences.reduce((a, s) => a + s.frames, 0);
  console.log(`\nDone: ${total} frames per size at ${FPS} fps. Manifest written to client/public/frames/manifest.json`);
}

main();
