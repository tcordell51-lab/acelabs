import manifest from './renders/motion/manifest.mjs';

const STARTERS = new Set(['cytrus', 'atpup', 'twistle']);
const finite = value => typeof value === 'number' && Number.isFinite(value);

/** Pure frame selection; negative clocks settle on the first pose. */
export function idleFrameIndex(clip, elapsedMs) {
  if (!clip || !Number.isInteger(clip.frameCount) || clip.frameCount < 1 ||
      !finite(clip.durationMs) || clip.durationMs <= 0 || !finite(elapsedMs)) return null;
  return Math.min(clip.frameCount - 1, Math.floor((Math.max(0, elapsedMs) % clip.durationMs) / clip.durationMs * clip.frameCount));
}

/** Crop once per clip; normalize to the static sculpture's extent and baseline. */
export function starterMotionRect(clip, x, y, scale = 3) {
  if (!clip || !finite(x) || !finite(y) || !finite(scale) || scale <= 0) return null;
  const [sx, sy, sw, sh] = clip.unionTrimPx || [];
  const [ax, ay] = clip.footBaselinePx || [];
  if (![sx, sy, sw, sh, ax, ay, clip.normalizationExtentPx, clip.growthScale].every(finite) ||
      sw <= 0 || sh <= 0 || clip.normalizationExtentPx <= 0 || clip.growthScale <= 0) return null;
  const s = scale * .78;
  const unit = 32 * clip.growthScale / clip.normalizationExtentPx * s;
  return {sx, sy, sw, sh, dx: x - (ax - sx) * unit,
    dy: y + 11 * s - (ay - sy) * unit, dw: sw * unit, dh: sh * unit};
}

function validClip(key, clip) {
  const id = key.split(':')[0];
  return STARTERS.has(id) && key === id + ':0' && clip?.id === id && clip.stage === 0 &&
    clip.frameCount === 8 && clip.durationMs === 1600 && clip.width === 512 && clip.height === 512 &&
    Array.isArray(clip.frames) && clip.frames.length === 8 &&
    clip.frames.every((frame, index) => frame.index === index && frame.width === 512 && frame.height === 512 &&
      frame.file === `worlds/renders/motion/${id}-idle-${index}.png`) &&
    starterMotionRect(clip, 0, 0, 1) !== null;
}

/** Injectable browser edges permit deterministic tests without a browser. */
export function createStarterMotion({
  data = manifest,
  createImage = typeof Image === 'undefined' ? null : () => new Image(),
  clock = () => globalThis.performance?.now() ?? 0,
  systemReducedMotion = () => false,
  documentHidden = () => false,
} = {}) {
  const clips = new Map(), records = new Map();
  let gameReducedMotion = false;
  for (const [key, clip] of Object.entries(data?.clips || {})) if (validClip(key, clip)) clips.set(key, clip);

  function load(frame) {
    const record = {image: null, loaded: false};
    records.set(frame.file, record);
    if (!createImage) return Promise.resolve(false);
    return new Promise(resolve => {
      try {
        const image = createImage();
        record.image = image;
        const finish = loaded => {
          record.loaded = loaded;
          image.onload = null; image.onerror = null;
          resolve(loaded);
        };
        image.onload = () => finish(image.naturalWidth === frame.width && image.naturalHeight === frame.height);
        image.onerror = () => finish(false);
        // Only exact allowlisted local frame paths can reach the Image loader.
        image.src = new URL('../' + frame.file, import.meta.url).href;
      } catch { resolve(false); }
    });
  }

  const ready = Promise.all([...clips.values()].flatMap(clip => clip.frames.map(load)));
  const isReady = id => {
    const clip = clips.get(id + ':0');
    return Boolean(clip && clip.frames.every(frame => records.get(frame.file)?.loaded));
  };

  function drawStarterMotion(ctx, id, x, y, scale = 3, stage = 0) {
    if (!STARTERS.has(id) || (stage !== 0 && stage !== '0') || gameReducedMotion ||
        systemReducedMotion() || documentHidden() || !isReady(id)) return false;
    const clip = clips.get(id + ':0');
    const index = idleFrameIndex(clip, clock());
    const rect = starterMotionRect(clip, x, y, scale);
    if (index === null || !rect || !ctx ||
        !['save', 'restore', 'beginPath', 'ellipse', 'fill', 'drawImage'].every(name => typeof ctx[name] === 'function')) return false;
    const record = records.get(clip.frames[index].file);
    let saved = false;
    try {
      ctx.save(); saved = true;
      ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
      const s = scale * .78;
      ctx.fillStyle = '#24484b22'; ctx.beginPath(); ctx.ellipse(x, y + 11*s, 10*s, 2.1*s, 0, 0, 2*Math.PI); ctx.fill();
      ctx.drawImage(record.image, rect.sx, rect.sy, rect.sw, rect.sh, rect.dx, rect.dy, rect.dw, rect.dh);
      return true;
    } catch { return false; }
    finally { if (saved) ctx.restore(); }
  }

  return {ready, isReady, drawStarterMotion, setReducedMotion(value) { gameReducedMotion = Boolean(value); }};
}

const media = typeof globalThis.matchMedia === 'function' ? globalThis.matchMedia('(prefers-reduced-motion: reduce)') : null;
const runtime = createStarterMotion({
  systemReducedMotion: () => Boolean(media?.matches),
  documentHidden: () => typeof document !== 'undefined' && (document.hidden || document.visibilityState === 'hidden'),
});

export const ready = runtime.ready;
export const drawStarterMotion = runtime.drawStarterMotion;
export const setReducedMotion = runtime.setReducedMotion;
export const isStarterMotionReady = runtime.isReady;

// No RAF, intervals, event listeners, storage, or independent canvas repainting.
// Existing world draw calls sample the clock. The caller owns static fallback.
