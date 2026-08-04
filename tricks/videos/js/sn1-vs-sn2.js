// @ds-adherence-ignore -- omelette starter scaffold (raw elements/hex/px by design)

/* BEGIN USAGE */
// animations.jsx
// Reusable animation starter: Stage, Timeline, Sprite, easing helpers.
// Exports (to window): Stage, Sprite, PlaybackBar, TextSprite, ImageSprite, RectSprite,
//   useTime, useTimeline, useSprite, Easing, interpolate, animate, clamp.
//
// Usage (in an HTML file that loads React + Babel):
//
//   <Stage width={1280} height={720} duration={10} background="#f6f4ef">
//     <MyScene />
//   </Stage>
//
// <Stage> auto-scales to the viewport and provides the scrubber, play/pause,
// ←/→ seek, space, and 0-to-reset controls, and persists the playhead.
// Inside <Stage>, any child can call useTime() to read the current
// playhead (seconds). Or wrap content in <Sprite start={1} end={4}>...</Sprite>
// to only render during that window -- children receive a `localTime` and
// `progress` via the useSprite() hook. Use Easing + interpolate()/animate()
// for tweens; TextSprite / ImageSprite / RectSprite have built-in entry/exit.
// Build YOUR scenes by composing Sprites inside a Stage.
/* END USAGE */
// ─────────────────────────────────────────────────────────────────────────────

// ── Easing functions (hand-rolled, Popmotion-style) ─────────────────────────
// All easings take t ∈ [0,1] and return eased t ∈ [0,1] (may overshoot for back/elastic).
const Easing = {
  linear: t => t,
  // Quad
  easeInQuad: t => t * t,
  easeOutQuad: t => t * (2 - t),
  easeInOutQuad: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
  // Cubic
  easeInCubic: t => t * t * t,
  easeOutCubic: t => --t * t * t + 1,
  easeInOutCubic: t => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
  // Quart
  easeInQuart: t => t * t * t * t,
  easeOutQuart: t => 1 - --t * t * t * t,
  easeInOutQuart: t => t < 0.5 ? 8 * t * t * t * t : 1 - 8 * --t * t * t * t,
  // Expo
  easeInExpo: t => t === 0 ? 0 : Math.pow(2, 10 * (t - 1)),
  easeOutExpo: t => t === 1 ? 1 : 1 - Math.pow(2, -10 * t),
  easeInOutExpo: t => {
    if (t === 0) return 0;
    if (t === 1) return 1;
    if (t < 0.5) return 0.5 * Math.pow(2, 20 * t - 10);
    return 1 - 0.5 * Math.pow(2, -20 * t + 10);
  },
  // Sine
  easeInSine: t => 1 - Math.cos(t * Math.PI / 2),
  easeOutSine: t => Math.sin(t * Math.PI / 2),
  easeInOutSine: t => -(Math.cos(Math.PI * t) - 1) / 2,
  // Back (overshoot)
  easeOutBack: t => {
    const c1 = 1.70158,
      c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  },
  easeInBack: t => {
    const c1 = 1.70158,
      c3 = c1 + 1;
    return c3 * t * t * t - c1 * t * t;
  },
  easeInOutBack: t => {
    const c1 = 1.70158,
      c2 = c1 * 1.525;
    return t < 0.5 ? Math.pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2) / 2 : (Math.pow(2 * t - 2, 2) * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2;
  },
  // Elastic
  easeOutElastic: t => {
    const c4 = 2 * Math.PI / 3;
    if (t === 0) return 0;
    if (t === 1) return 1;
    return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
  }
};

// ── Core interpolation helpers ──────────────────────────────────────────────

// Clamp a value to [min, max]
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

// interpolate([0, 0.5, 1], [0, 100, 50], ease?) -> fn(t)
// Popmotion-style: linearly maps t across input keyframes to output values,
// with optional easing per segment (single fn or array of fns).
function interpolate(input, output, ease = Easing.linear) {
  return t => {
    if (t <= input[0]) return output[0];
    if (t >= input[input.length - 1]) return output[output.length - 1];
    for (let i = 0; i < input.length - 1; i++) {
      if (t >= input[i] && t <= input[i + 1]) {
        const span = input[i + 1] - input[i];
        const local = span === 0 ? 0 : (t - input[i]) / span;
        const easeFn = Array.isArray(ease) ? ease[i] || Easing.linear : ease;
        const eased = easeFn(local);
        return output[i] + (output[i + 1] - output[i]) * eased;
      }
    }
    return output[output.length - 1];
  };
}

// animate({from, to, start, end, ease})(t) — simpler single-segment tween.
// Returns `from` before `start`, `to` after `end`.
function animate({
  from = 0,
  to = 1,
  start = 0,
  end = 1,
  ease = Easing.easeInOutCubic
}) {
  return t => {
    if (t <= start) return from;
    if (t >= end) return to;
    const local = (t - start) / (end - start);
    return from + (to - from) * ease(local);
  };
}

// ── Timeline context ────────────────────────────────────────────────────────

const TimelineContext = React.createContext({
  time: 0,
  duration: 10,
  playing: false
});
const useTime = () => React.useContext(TimelineContext).time;
const useTimeline = () => React.useContext(TimelineContext);

// ── Sprite ──────────────────────────────────────────────────────────────────
// Renders children only when the playhead is inside [start, end]. Provides
// a sub-context with `localTime` (seconds since start) and `progress` (0..1).
//
//   <Sprite start={2} end={5}>
//     {({ localTime, progress }) => <Thing x={progress * 100} />}
//   </Sprite>
//
// Or as a plain wrapper — children can call useSprite() themselves.

const SpriteContext = React.createContext({
  localTime: 0,
  progress: 0,
  duration: 0
});
const useSprite = () => React.useContext(SpriteContext);
function Sprite({
  start = 0,
  end = Infinity,
  children,
  keepMounted = false
}) {
  const {
    time
  } = useTimeline();
  const visible = time >= start && time <= end;
  if (!visible && !keepMounted) return null;
  const duration = end - start;
  const localTime = Math.max(0, time - start);
  const progress = duration > 0 && isFinite(duration) ? clamp(localTime / duration, 0, 1) : 0;
  const value = {
    localTime,
    progress,
    duration,
    visible
  };
  return /*#__PURE__*/React.createElement(SpriteContext.Provider, {
    value: value
  }, typeof children === 'function' ? children(value) : children);
}

// ── Sample sprite components ────────────────────────────────────────────────

// TextSprite: fades/slides text in on entry, holds, then fades out on exit.
// Props: text, x, y, size, color, font, entryDur, exitDur, align
function TextSprite({
  text,
  x = 0,
  y = 0,
  size = 48,
  color = '#111',
  font = 'Inter, system-ui, sans-serif',
  weight = 600,
  entryDur = 0.45,
  exitDur = 0.35,
  entryEase = Easing.easeOutBack,
  exitEase = Easing.easeInCubic,
  align = 'left',
  letterSpacing = '-0.01em'
}) {
  const {
    localTime,
    duration
  } = useSprite();
  const exitStart = Math.max(0, duration - exitDur);
  let opacity = 1;
  let ty = 0;
  if (localTime < entryDur) {
    const t = entryEase(clamp(localTime / entryDur, 0, 1));
    opacity = t;
    ty = (1 - t) * 16;
  } else if (localTime > exitStart) {
    const t = exitEase(clamp((localTime - exitStart) / exitDur, 0, 1));
    opacity = 1 - t;
    ty = -t * 8;
  }
  const translateX = align === 'center' ? '-50%' : align === 'right' ? '-100%' : '0';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: x,
      top: y,
      transform: `translate(${translateX}, ${ty}px)`,
      opacity,
      fontFamily: font,
      fontSize: size,
      fontWeight: weight,
      color,
      letterSpacing,
      whiteSpace: 'pre',
      lineHeight: 1.1,
      willChange: 'transform, opacity'
    }
  }, text);
}

// ImageSprite: scales + fades in; optional Ken Burns drift during hold.
function ImageSprite({
  src,
  x = 0,
  y = 0,
  width = 400,
  height = 300,
  entryDur = 0.6,
  exitDur = 0.4,
  kenBurns = false,
  kenBurnsScale = 1.08,
  radius = 12,
  fit = 'cover',
  placeholder = null // {label: string} for striped placeholder
}) {
  const {
    localTime,
    duration
  } = useSprite();
  const exitStart = Math.max(0, duration - exitDur);
  let opacity = 1;
  let scale = 1;
  if (localTime < entryDur) {
    const t = Easing.easeOutCubic(clamp(localTime / entryDur, 0, 1));
    opacity = t;
    scale = 0.96 + 0.04 * t;
  } else if (localTime > exitStart) {
    const t = Easing.easeInCubic(clamp((localTime - exitStart) / exitDur, 0, 1));
    opacity = 1 - t;
    scale = (kenBurns ? kenBurnsScale : 1) + 0.02 * t;
  } else if (kenBurns) {
    const holdSpan = exitStart - entryDur;
    const holdT = holdSpan > 0 ? (localTime - entryDur) / holdSpan : 0;
    scale = 1 + (kenBurnsScale - 1) * holdT;
  }
  const content = placeholder ? /*#__PURE__*/React.createElement("div", {
    style: {
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'repeating-linear-gradient(135deg, #e9e6df 0 10px, #dcd8cf 10px 20px)',
      color: '#6b6458',
      fontFamily: 'JetBrains Mono, ui-monospace, monospace',
      fontSize: 13,
      letterSpacing: '0.04em',
      textTransform: 'uppercase'
    }
  }, placeholder.label || 'image') : /*#__PURE__*/React.createElement("img", {
    src: src,
    alt: "",
    style: {
      width: '100%',
      height: '100%',
      objectFit: fit,
      display: 'block'
    }
  });
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: x,
      top: y,
      width,
      height,
      opacity,
      transform: `scale(${scale})`,
      transformOrigin: 'center',
      borderRadius: radius,
      overflow: 'hidden',
      willChange: 'transform, opacity'
    }
  }, content);
}

// RectSprite: simple rectangle that animates position/size/color via props.
// Useful demo primitive — takes a `render` fn for per-frame customization.
function RectSprite({
  x = 0,
  y = 0,
  width = 100,
  height = 100,
  color = '#111',
  radius = 8,
  entryDur = 0.4,
  exitDur = 0.3,
  render // optional: (ctx) => style overrides
}) {
  const spriteCtx = useSprite();
  const {
    localTime,
    duration
  } = spriteCtx;
  const exitStart = Math.max(0, duration - exitDur);
  let opacity = 1;
  let scale = 1;
  if (localTime < entryDur) {
    const t = Easing.easeOutBack(clamp(localTime / entryDur, 0, 1));
    opacity = clamp(localTime / entryDur, 0, 1);
    scale = 0.4 + 0.6 * t;
  } else if (localTime > exitStart) {
    const t = Easing.easeInQuad(clamp((localTime - exitStart) / exitDur, 0, 1));
    opacity = 1 - t;
    scale = 1 - 0.15 * t;
  }
  const overrides = render ? render(spriteCtx) : {};
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: x,
      top: y,
      width,
      height,
      background: color,
      borderRadius: radius,
      opacity,
      transform: `scale(${scale})`,
      transformOrigin: 'center',
      willChange: 'transform, opacity',
      ...overrides
    }
  });
}
function Stage({
  width = 1280,
  height = 720,
  duration = 10,
  background = '#f6f4ef',
  fps = 60,
  loop = true,
  autoplay = true,
  persistKey = 'animstage',
  children
}) {
  const [time, setTime] = React.useState(() => {
    try {
      const v = parseFloat(localStorage.getItem(persistKey + ':t') || '0');
      return isFinite(v) ? clamp(v, 0, duration) : 0;
    } catch {
      return 0;
    }
  });
  const [playing, setPlaying] = React.useState(autoplay);
  const [hoverTime, setHoverTime] = React.useState(null);
  const [scale, setScale] = React.useState(1);
  const stageRef = React.useRef(null);
  const canvasRef = React.useRef(null);
  const rafRef = React.useRef(null);
  const lastTsRef = React.useRef(null);

  // Persist playhead
  React.useEffect(() => {
    try {
      localStorage.setItem(persistKey + ':t', String(time));
    } catch {}
  }, [time, persistKey]);

  // Auto-scale to fit viewport
  React.useEffect(() => {
    if (!stageRef.current) return;
    const el = stageRef.current;
    const measure = () => {
      const barH = 44; // playback bar height
      const s = Math.min(el.clientWidth / width, (el.clientHeight - barH) / height);
      setScale(Math.max(0.05, s));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [width, height]);

  // Animation loop
  React.useEffect(() => {
    if (!playing) {
      lastTsRef.current = null;
      return;
    }
    const step = ts => {
      if (lastTsRef.current == null) lastTsRef.current = ts;
      const dt = (ts - lastTsRef.current) / 1000;
      lastTsRef.current = ts;
      setTime(t => {
        let next = t + dt;
        if (next >= duration) {
          if (loop) next = next % duration;else {
            next = duration;
            setPlaying(false);
          }
        }
        return next;
      });
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      lastTsRef.current = null;
    };
  }, [playing, duration, loop]);

  // Keyboard: space = play/pause, ← → = seek
  React.useEffect(() => {
    const onKey = e => {
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
      if (e.code === 'Space') {
        e.preventDefault();
        setPlaying(p => !p);
      } else if (e.code === 'ArrowLeft') {
        setTime(t => clamp(t - (e.shiftKey ? 1 : 0.1), 0, duration));
      } else if (e.code === 'ArrowRight') {
        setTime(t => clamp(t + (e.shiftKey ? 1 : 0.1), 0, duration));
      } else if (e.key === '0' || e.code === 'Home') {
        setTime(0);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [duration]);
  const displayTime = hoverTime != null ? hoverTime : time;
  const ctxValue = React.useMemo(() => ({
    time: displayTime,
    duration,
    playing,
    setTime,
    setPlaying
  }), [displayTime, duration, playing]);
  return /*#__PURE__*/React.createElement("div", {
    ref: stageRef,
    style: {
      position: 'absolute',
      inset: 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      background: '#0a0a0a',
      fontFamily: 'Inter, system-ui, sans-serif'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      minHeight: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    ref: canvasRef,
    style: {
      width,
      height,
      background,
      position: 'relative',
      transform: `scale(${scale})`,
      transformOrigin: 'center',
      flexShrink: 0,
      boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement(TimelineContext.Provider, {
    value: ctxValue
  }, children))), /*#__PURE__*/React.createElement(PlaybackBar, {
    time: displayTime,
    actualTime: time,
    duration: duration,
    playing: playing,
    onPlayPause: () => setPlaying(p => !p),
    onReset: () => {
      setTime(0);
    },
    onSeek: t => setTime(t),
    onHover: t => setHoverTime(t)
  }));
}

// ── Playback bar ────────────────────────────────────────────────────────────
// Play/pause, return-to-begin, scrub track, time display.
// Uses fixed-width time fields so layout doesn't thrash.

function PlaybackBar({
  time,
  duration,
  playing,
  onPlayPause,
  onReset,
  onSeek,
  onHover
}) {
  const trackRef = React.useRef(null);
  const [dragging, setDragging] = React.useState(false);
  const timeFromEvent = React.useCallback(e => {
    const rect = trackRef.current.getBoundingClientRect();
    const x = clamp((e.clientX - rect.left) / rect.width, 0, 1);
    return x * duration;
  }, [duration]);
  const onTrackMove = e => {
    if (!trackRef.current) return;
    const t = timeFromEvent(e);
    if (dragging) {
      onSeek(t);
    } else {
      onHover(t);
    }
  };
  const onTrackLeave = () => {
    if (!dragging) onHover(null);
  };
  const onTrackDown = e => {
    setDragging(true);
    const t = timeFromEvent(e);
    onSeek(t);
    onHover(null);
  };
  React.useEffect(() => {
    if (!dragging) return;
    const onUp = () => setDragging(false);
    const onMove = e => {
      if (!trackRef.current) return;
      const t = timeFromEvent(e);
      onSeek(t);
    };
    window.addEventListener('mouseup', onUp);
    window.addEventListener('mousemove', onMove);
    return () => {
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('mousemove', onMove);
    };
  }, [dragging, timeFromEvent, onSeek]);
  const pct = duration > 0 ? time / duration * 100 : 0;
  const fmt = t => {
    const total = Math.max(0, t);
    const m = Math.floor(total / 60);
    const s = Math.floor(total % 60);
    const cs = Math.floor(total * 100 % 100);
    return `${String(m).padStart(1, '0')}:${String(s).padStart(2, '0')}.${String(cs).padStart(2, '0')}`;
  };
  const mono = 'JetBrains Mono, ui-monospace, SFMono-Regular, monospace';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '8px 16px',
      background: 'rgba(20,20,20,0.92)',
      borderTop: '1px solid rgba(255,255,255,0.08)',
      width: '100%',
      maxWidth: 680,
      alignSelf: 'center',
      borderRadius: 8,
      color: '#f6f4ef',
      fontFamily: 'Inter, system-ui, sans-serif',
      userSelect: 'none',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement(IconButton, {
    onClick: onReset,
    title: "Return to start (0)"
  }, /*#__PURE__*/React.createElement("svg", {
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M3 2v10M12 2L5 7l7 5V2z",
    stroke: "currentColor",
    strokeWidth: "1.5",
    strokeLinejoin: "round",
    strokeLinecap: "round"
  }))), /*#__PURE__*/React.createElement(IconButton, {
    onClick: onPlayPause,
    title: "Play/pause (space)"
  }, playing ? /*#__PURE__*/React.createElement("svg", {
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none"
  }, /*#__PURE__*/React.createElement("rect", {
    x: "3",
    y: "2",
    width: "3",
    height: "10",
    fill: "currentColor"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "8",
    y: "2",
    width: "3",
    height: "10",
    fill: "currentColor"
  })) : /*#__PURE__*/React.createElement("svg", {
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M3 2l9 5-9 5V2z",
    fill: "currentColor"
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: mono,
      fontSize: 12,
      fontVariantNumeric: 'tabular-nums',
      width: 64,
      textAlign: 'right',
      color: '#f6f4ef'
    }
  }, fmt(time)), /*#__PURE__*/React.createElement("div", {
    ref: trackRef,
    onMouseMove: onTrackMove,
    onMouseLeave: onTrackLeave,
    onMouseDown: onTrackDown,
    style: {
      flex: 1,
      height: 22,
      position: 'relative',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 0,
      right: 0,
      height: 4,
      background: 'rgba(255,255,255,0.12)',
      borderRadius: 2
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 0,
      width: `${pct}%`,
      height: 4,
      background: 'oklch(72% 0.12 250)',
      borderRadius: 2
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: `${pct}%`,
      top: '50%',
      width: 12,
      height: 12,
      marginLeft: -6,
      marginTop: -6,
      background: '#fff',
      borderRadius: 6,
      boxShadow: '0 2px 4px rgba(0,0,0,0.4)'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: mono,
      fontSize: 12,
      fontVariantNumeric: 'tabular-nums',
      width: 64,
      textAlign: 'left',
      color: 'rgba(246,244,239,0.55)'
    }
  }, fmt(duration)));
}
function IconButton({
  children,
  onClick,
  title
}) {
  const [hover, setHover] = React.useState(false);
  return /*#__PURE__*/React.createElement("button", {
    onClick: onClick,
    title: title,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      width: 28,
      height: 28,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: hover ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 6,
      color: '#f6f4ef',
      cursor: 'pointer',
      padding: 0,
      transition: 'background 120ms'
    }
  }, children);
}
Object.assign(window, {
  Easing,
  interpolate,
  animate,
  clamp,
  TimelineContext,
  useTime,
  useTimeline,
  Sprite,
  SpriteContext,
  useSprite,
  TextSprite,
  ImageSprite,
  RectSprite,
  Stage,
  PlaybackBar
});

// ─────────────────────────────────────────────────────────────
//  Ace the DAT — TIP KIT (shared scene components for all Tips)
//  Concatenated between the animation framework and each video's
//  scene file. Palette + brand + Header/Banner/Lineup/Ladder +
//  QuizBeat ("Your Turn") + VoiceTrack + Outro.
// ─────────────────────────────────────────────────────────────
const BG = 'oklch(0.205 0.013 64)';
const BG2 = 'oklch(0.248 0.014 63)';
const CARD = 'oklch(0.262 0.015 63)';
const CARD2 = '#15110b';
const INK = 'oklch(0.952 0.008 85)';
const INK2 = 'oklch(0.785 0.011 80)';
const INK3 = 'oklch(0.625 0.013 75)';
const LINE = 'oklch(0.355 0.014 65)';
const GOLD = 'oklch(0.805 0.122 80)';
const RICH = 'oklch(0.745 0.152 150)';
const POOR = 'oklch(0.775 0.16 58)';
const SPARED = 'oklch(0.72 0.142 250)';
const REDX = 'oklch(0.63 0.2 25)';
const SERIF = "'Newsreader', Georgia, serif";
const SANS = "'Hanken Grotesk', system-ui, sans-serif";
const MONO = "'JetBrains Mono', ui-monospace, monospace";
const CW = 1080,
  CH = 1920;
function fade(progress, holdIn = 0.12, holdOut = 0.88) {
  let o = 1,
    ty = 0;
  if (progress < holdIn) {
    const t = Easing.easeOutCubic(progress / holdIn);
    o = t;
    ty = (1 - t) * 22;
  } else if (progress > holdOut) {
    const t = Easing.easeInCubic((progress - holdOut) / (1 - holdOut));
    o = 1 - t;
    ty = -t * 14;
  }
  return {
    opacity: o,
    ty
  };
}
function BrandBug({
  sub = 'ORGO'
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 64,
      top: 58,
      display: 'flex',
      alignItems: 'center',
      gap: 18
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 76,
      height: 76,
      borderRadius: 22,
      background: CARD2,
      color: GOLD,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: SERIF,
      fontWeight: 600,
      fontSize: 52,
      lineHeight: 1,
      border: `1px solid ${LINE}`,
      boxShadow: '0 8px 22px rgba(0,0,0,.5)'
    }
  }, "A"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      lineHeight: 1
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: SERIF,
      fontWeight: 600,
      fontSize: 36,
      color: INK,
      letterSpacing: '-0.02em'
    }
  }, "Ace the DAT"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: MONO,
      fontSize: 16,
      color: GOLD,
      letterSpacing: '0.16em',
      marginTop: 6
    }
  }, sub)));
}
function TipTag({
  label
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      right: 64,
      top: 66,
      fontFamily: MONO,
      fontSize: 20,
      color: '#1a140c',
      background: GOLD,
      padding: '10px 18px',
      borderRadius: 999,
      letterSpacing: '0.12em',
      fontWeight: 700,
      boxShadow: '0 6px 16px rgba(0,0,0,.4)'
    }
  }, label);
}
function Header({
  start,
  end,
  top = 152,
  children
}) {
  return /*#__PURE__*/React.createElement(Sprite, {
    start: start,
    end: end
  }, ({
    progress
  }) => {
    const {
      opacity,
      ty
    } = fade(progress);
    return /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        left: 0,
        right: 0,
        top,
        textAlign: 'center',
        opacity,
        transform: `translateY(${ty}px)`
      }
    }, children);
  });
}
function ResultBanner({
  start,
  end,
  color,
  kicker,
  big,
  sub,
  top = 1336
}) {
  return /*#__PURE__*/React.createElement(Sprite, {
    start: start,
    end: end
  }, ({
    progress
  }) => {
    const {
      opacity,
      ty
    } = fade(progress, 0.14, 0.86);
    return /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        left: 0,
        right: 0,
        top,
        textAlign: 'center',
        opacity,
        transform: `translateY(${ty}px)`
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: MONO,
        fontSize: 22,
        letterSpacing: '0.16em',
        color: INK3,
        marginBottom: 14
      }
    }, kicker), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 18,
        fontFamily: SERIF,
        fontWeight: 600,
        fontSize: 74,
        color
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 26,
        height: 26,
        borderRadius: '50%',
        background: color,
        boxShadow: `0 0 18px ${color}`
      }
    }), big), sub && /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: SANS,
        fontSize: 30,
        color: INK2,
        marginTop: 14
      }
    }, sub));
  });
}
function GroupCard({
  formula,
  annot,
  tag,
  color,
  delay,
  t,
  size = 54
}) {
  const a = clamp((t - delay) / 0.45, 0, 1);
  const s = 0.8 + 0.2 * Easing.easeOutBack(a);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 10,
      background: CARD2,
      border: `1px solid ${LINE}`,
      borderRadius: 22,
      padding: '20px 24px',
      minWidth: 168,
      opacity: a,
      transform: `scale(${s})`,
      boxShadow: '0 12px 26px rgba(0,0,0,.4)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: SERIF,
      fontWeight: 600,
      fontSize: size,
      color: INK,
      lineHeight: 1.1,
      textAlign: 'center'
    }
  }, formula), annot && /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: MONO,
      fontSize: 17,
      color,
      letterSpacing: '0.04em'
    }
  }, annot), tag && /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: SANS,
      fontSize: 22,
      color: INK3
    }
  }, tag));
}
function Lineup({
  title,
  titleColor,
  cards,
  sub,
  base,
  size
}) {
  const t = useTime();
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 22
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: MONO,
      fontSize: 24,
      letterSpacing: '0.2em',
      color: titleColor
    }
  }, title), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 22,
      justifyContent: 'center',
      flexWrap: 'wrap',
      maxWidth: 980
    }
  }, cards.map((c, i) => /*#__PURE__*/React.createElement(GroupCard, {
    key: i,
    size: size,
    ...c,
    t: t,
    delay: base + i * 0.32
  }))), sub && /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: SANS,
      fontSize: 30,
      color: INK2,
      opacity: clamp((t - base - cards.length * 0.32 - 0.1) / 0.5, 0, 1)
    }
  }, sub));
}
function LetterChip({
  letter,
  word,
  color
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 16,
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      minWidth: 74,
      height: 74,
      padding: '0 16px',
      borderRadius: 20,
      background: color,
      color: '#1a140c',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: SERIF,
      fontWeight: 700,
      fontSize: 48,
      boxShadow: `0 0 24px ${color}55`
    }
  }, letter), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: MONO,
      fontSize: 26,
      letterSpacing: '0.22em',
      color
    }
  }, word));
}

// generic center panel (the persistent stage card)
function CenterPanel({
  start,
  end,
  label,
  children
}) {
  const t = useTime();
  const panelIn = clamp((t - start) / 0.7, 0, 1);
  const panelOut = 1 - clamp((t - (end - 0.4)) / 0.4, 0, 1);
  const panelS = 0.95 + 0.05 * Easing.easeOutBack(panelIn);
  const op = panelIn * panelOut;
  if (op <= 0) return null;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      opacity: op
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 64,
      top: 400,
      width: 952,
      height: 1190,
      transform: `scale(${panelS})`,
      transformOrigin: 'center',
      borderRadius: 48,
      background: `linear-gradient(165deg, ${CARD} 0%, ${BG2} 100%)`,
      border: `1px solid ${LINE}`,
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,.05), 0 30px 70px rgba(0,0,0,.5)'
    }
  }), label && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: 452,
      textAlign: 'center',
      fontFamily: MONO,
      fontSize: 22,
      letterSpacing: '0.2em',
      color: INK3
    }
  }, label), children);
}
function SummaryLadder({
  start,
  end,
  kicker,
  title,
  rows
}) {
  return /*#__PURE__*/React.createElement(Sprite, {
    start: start,
    end: end
  }, ({
    progress
  }) => {
    const {
      opacity,
      ty
    } = fade(progress, 0.1, 0.9);
    const t = useTime();
    return /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        left: 60,
        right: 60,
        top: 250,
        opacity,
        transform: `translateY(${ty}px)`
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: MONO,
        fontSize: 24,
        letterSpacing: '0.2em',
        color: INK3,
        textAlign: 'center',
        marginBottom: 10
      }
    }, kicker), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: SERIF,
        fontWeight: 600,
        fontSize: 54,
        color: INK,
        textAlign: 'center',
        marginBottom: 10,
        letterSpacing: '-0.01em'
      }
    }, title), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: MONO,
        fontSize: 22,
        color: GOLD,
        textAlign: 'center',
        marginBottom: 24,
        letterSpacing: '0.06em'
      }
    }, "screenshot this — it’s the whole cheat sheet"), rows.map((r, i) => {
      const rv = clamp((t - start - 0.4 - i * 0.5) / 0.5, 0, 1);
      return /*#__PURE__*/React.createElement("div", {
        key: i,
        style: {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 20,
          background: CARD2,
          border: `1px solid ${r.c}`,
          borderRadius: 22,
          padding: '22px 28px',
          marginBottom: 18,
          opacity: rv,
          transform: `translateX(${(1 - rv) * -28}px)`,
          boxShadow: '0 12px 26px rgba(0,0,0,.4)'
        }
      }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
        style: {
          fontFamily: MONO,
          fontSize: 19,
          letterSpacing: '0.1em',
          color: r.c
        }
      }, r.k), /*#__PURE__*/React.createElement("div", {
        style: {
          fontFamily: SERIF,
          fontWeight: 600,
          fontSize: 42,
          color: INK,
          marginTop: 6,
          lineHeight: 1.1
        }
      }, r.ex)), /*#__PURE__*/React.createElement("div", {
        style: {
          fontFamily: MONO,
          fontWeight: 700,
          fontSize: 24,
          color: '#1a140c',
          background: r.c,
          borderRadius: 999,
          padding: '12px 22px',
          whiteSpace: 'nowrap'
        }
      }, r.pill));
    }));
  });
}

// ── QUIZ BEAT — "Your Turn" (reinforce + close the hook loop)
function QuizBeat({
  start,
  qs
}) {
  const t = useTime();
  const PER = 8.2;
  return /*#__PURE__*/React.createElement(Sprite, {
    start: start,
    end: start + qs.length * PER
  }, () => {
    const i = Math.min(qs.length - 1, Math.floor((t - start) / PER));
    const q = qs[i];
    const lt = t - start - i * PER;
    const a = clamp(lt / 0.5, 0, 1);
    const think = clamp(lt / 4.5, 0, 1);
    const revealed = lt > 4.5;
    return /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 300,
        textAlign: 'center',
        opacity: a
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: MONO,
        fontSize: 26,
        letterSpacing: '0.24em',
        color: GOLD,
        marginBottom: 10
      }
    }, "YOUR TURN · ", i + 1, " OF ", qs.length), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: SANS,
        fontSize: 26,
        color: INK3,
        marginBottom: 26
      }
    }, "pause it — commit before the reveal"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: SERIF,
        fontWeight: 600,
        fontSize: 54,
        color: INK,
        lineHeight: 1.25,
        padding: '0 90px',
        letterSpacing: '-0.01em'
      }
    }, q.q), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
        alignItems: 'center',
        marginTop: 46
      }
    }, q.opts.map((o, k) => {
      const win = revealed && k === q.ans;
      const dim = revealed && k !== q.ans;
      return /*#__PURE__*/React.createElement("div", {
        key: k,
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: 22,
          width: 820,
          background: win ? 'oklch(0.32 0.06 150)' : CARD2,
          border: `1px solid ${win ? RICH : LINE}`,
          borderRadius: 22,
          padding: '24px 30px',
          opacity: dim ? 0.35 : 1,
          boxShadow: win ? `0 0 34px ${RICH}44` : '0 10px 24px rgba(0,0,0,.4)',
          transform: win ? 'scale(1.03)' : 'scale(1)',
          transition: 'all 300ms'
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          width: 52,
          height: 52,
          borderRadius: 14,
          background: win ? RICH : BG2,
          color: win ? '#1a140c' : INK3,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: MONO,
          fontWeight: 700,
          fontSize: 26,
          flexShrink: 0
        }
      }, 'ABC'[k]), /*#__PURE__*/React.createElement("span", {
        style: {
          fontFamily: SERIF,
          fontWeight: 600,
          fontSize: 40,
          color: INK,
          textAlign: 'left',
          lineHeight: 1.15
        }
      }, o));
    })), !revealed && /*#__PURE__*/React.createElement("div", {
      style: {
        width: 560,
        height: 10,
        borderRadius: 999,
        background: BG2,
        margin: '44px auto 0',
        overflow: 'hidden'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: `${(1 - think) * 100}%`,
        height: '100%',
        borderRadius: 999,
        background: GOLD
      }
    })), revealed && /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: SANS,
        fontSize: 32,
        color: INK2,
        marginTop: 40,
        padding: '0 110px',
        lineHeight: 1.4
      }
    }, /*#__PURE__*/React.createElement("b", {
      style: {
        color: RICH
      }
    }, 'ABC'[q.ans], "."), " ", q.why));
  });
}

// ── outro card ───────────────────────────────────────────────
function OutroCard({
  start,
  end,
  lines,
  tease
}) {
  return /*#__PURE__*/React.createElement(Sprite, {
    start: start,
    end: end
  }, ({
    progress
  }) => {
    const {
      opacity,
      ty
    } = fade(progress, 0.12, 0.86);
    return /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        opacity,
        transform: `translateY(${ty}px)`,
        padding: '0 80px',
        boxSizing: 'border-box'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 112,
        height: 112,
        borderRadius: 30,
        background: CARD2,
        color: GOLD,
        border: `1px solid ${LINE}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: SERIF,
        fontWeight: 600,
        fontSize: 78,
        lineHeight: 1,
        marginBottom: 40
      }
    }, "A"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: SERIF,
        fontWeight: 600,
        fontSize: 60,
        color: INK,
        letterSpacing: '-0.01em',
        textAlign: 'center',
        lineHeight: 1.14,
        maxWidth: 920
      }
    }, lines.map((l, i) => /*#__PURE__*/React.createElement(React.Fragment, {
      key: i
    }, l, i < lines.length - 1 && /*#__PURE__*/React.createElement("br", null)))), tease && /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: SANS,
        fontSize: 34,
        color: INK2,
        marginTop: 28
      }
    }, tease), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: MONO,
        fontSize: 24,
        color: GOLD,
        marginTop: 30,
        letterSpacing: '0.06em'
      }
    }, "follow for the rest of the series"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: SERIF,
        fontWeight: 600,
        fontSize: 56,
        color: GOLD,
        marginTop: 16
      }
    }, "acethedat.com"));
  });
}

// ── voiceover track (per-video audio folder) ─────────────────
function VoiceTrack({
  base
}) {
  const {
    time,
    playing
  } = useTimeline();
  const [clips, setClips] = React.useState([]);
  const [metaVer, bump] = React.useState(0);
  const audios = React.useRef({});
  const durs = React.useRef({});
  React.useEffect(() => {
    let dead = false;
    fetch(base + 'manifest.json').then(r => r.ok ? r.json() : null).then(m => {
      if (!dead && m && Array.isArray(m.clips)) setClips(m.clips);
    }).catch(() => {});
    return () => {
      dead = true;
    };
  }, [base]);
  React.useEffect(() => {
    clips.forEach(c => {
      if (audios.current[c.id]) return;
      const a = new Audio(base + (c.src || 'audio/' + c.id + '.mp3'));
      a.preload = 'auto';
      if (c.duration) durs.current[c.id] = c.duration;
      a.addEventListener('loadedmetadata', () => {
        if (isFinite(a.duration) && a.duration > 0) {
          durs.current[c.id] = a.duration;
          bump(n => n + 1);
        }
      });
      audios.current[c.id] = a;
    });
  }, [clips, base]);
  React.useEffect(() => {
    if (!clips.length) return;
    let idx = -1;
    for (let i = 0; i < clips.length; i++) {
      if (clips[i].start <= time) idx = i;else break;
    }
    let active = -1;
    if (idx >= 0) {
      const c = clips[idx];
      const d = durs.current[c.id];
      if (d == null || time < c.start + d + 0.05) active = idx;
    }
    clips.forEach((c, i) => {
      const a = audios.current[c.id];
      if (!a) return;
      if (i !== active) {
        if (!a.paused) a.pause();
        return;
      }
      const target = Math.max(0, time - c.start);
      if (Math.abs(a.currentTime - target) > 0.22) {
        try {
          a.currentTime = target;
        } catch {}
      }
      if (playing) {
        if (a.paused) a.play().catch(() => {});
      } else if (!a.paused) a.pause();
    });
  }, [time, playing, clips, metaVer]);
  return null;
}

// standard ambient gradient
function Ambient() {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      backgroundImage: 'radial-gradient(900px 560px at 80% -6%, oklch(0.78 0.10 75 / 0.07), transparent 70%), radial-gradient(820px 520px at -10% 6%, oklch(0.62 0.10 150 / 0.05), transparent 68%)'
    }
  });
}

// ─────────────────────────────────────────────────────────────
//  Tip 04 — SN1 vs SN2 vs E1 vs E2: The Four Questions (108s)
//  Hook question -> the 4 questions -> 2x2 grid -> stereo beat ->
//  mnemonic (heat = elimination / bulky = Hofmann) -> ladder -> quiz.
// ─────────────────────────────────────────────────────────────

// central 2x2 mechanism grid — the active cell glows per beat
function MechGrid() {
  const t = useTime();
  const seg = t < 20.0 ? null : t < 27.0 ? 'sn2' : t < 34.0 ? 'sn1' : t < 41.0 ? 'e2' : t < 48.0 ? 'e1' : 'all';
  const CELLS = [{
    k: 'sn1',
    x: 128,
    y: 640,
    name: 'SN1',
    c: RICH,
    tell: 'weak Nu · protic · 3°'
  }, {
    k: 'e1',
    x: 568,
    y: 640,
    name: 'E1',
    c: POOR,
    tell: 'weak base · heat'
  }, {
    k: 'sn2',
    x: 128,
    y: 990,
    name: 'SN2',
    c: SPARED,
    tell: 'strong small Nu · aprotic'
  }, {
    k: 'e2',
    x: 568,
    y: 990,
    name: 'E2',
    c: GOLD,
    tell: 'strong base · TBuOK'
  }];
  return /*#__PURE__*/React.createElement(CenterPanel, {
    start: 13.2,
    end: 60.0,
    label: ""
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: 1340,
      textAlign: 'center',
      fontFamily: MONO,
      fontSize: 22,
      color: INK3,
      letterSpacing: '0.1em'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: RICH
    }
  }, "top row: stepwise · carbocation"), " \xA0·\xA0 ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: SPARED
    }
  }, "bottom row: concerted · one shot")), CELLS.map(cell => {
    const on = seg === cell.k || seg === 'all';
    const a = clamp((t - 13.8) / 0.6, 0, 1);
    return /*#__PURE__*/React.createElement("div", {
      key: cell.k,
      style: {
        position: 'absolute',
        left: cell.x,
        top: cell.y,
        width: 384,
        height: 300,
        opacity: a,
        background: CARD2,
        border: `1px solid ${on ? cell.c : LINE}`,
        borderRadius: 26,
        textAlign: 'center',
        boxShadow: on ? `0 0 40px ${cell.c}44, 0 16px 40px rgba(0,0,0,.5)` : '0 16px 40px rgba(0,0,0,.5)',
        transform: on ? 'scale(1.04)' : 'scale(0.97)',
        transition: 'all 300ms'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: SERIF,
        fontWeight: 700,
        fontSize: 92,
        color: on ? cell.c : INK3,
        marginTop: 52,
        lineHeight: 1
      }
    }, cell.name), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: MONO,
        fontSize: 21,
        color: on ? INK2 : INK3,
        marginTop: 26,
        padding: '0 16px',
        lineHeight: 1.5
      }
    }, cell.tell));
  }));
}
function SubElimVideo() {
  return /*#__PURE__*/React.createElement(Stage, {
    width: CW,
    height: CH,
    duration: 108,
    background: BG,
    persistKey: "snse-tip04"
  }, /*#__PURE__*/React.createElement(VoiceTrack, {
    base: "voiceover/tip04/"
  }), /*#__PURE__*/React.createElement(Ambient, null), /*#__PURE__*/React.createElement(BrandBug, {
    sub: "ORGO · SN / E"
  }), /*#__PURE__*/React.createElement(TipTag, {
    label: "TRICK 04"
  }), /*#__PURE__*/React.createElement(Header, {
    start: 0.2,
    end: 7.0,
    top: 620
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: MONO,
      fontSize: 26,
      letterSpacing: '0.24em',
      color: GOLD,
      marginBottom: 24
    }
  }, "CAN YOU ANSWER THIS?"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: SERIF,
      fontWeight: 600,
      fontSize: 78,
      color: INK,
      lineHeight: 1.12,
      letterSpacing: '-0.02em'
    }
  }, "CH₃CH₂CH₂CH₂Br", /*#__PURE__*/React.createElement("br", null), "+ NaCN, in DMSO."), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: MONO,
      fontSize: 24,
      color: INK3,
      marginTop: 14
    }
  }, "1-bromobutane — written out the way the test writes it"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: SANS,
      fontSize: 38,
      color: INK2,
      marginTop: 28
    }
  }, "which mechanism — and what happens to the stereocenter?"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: MONO,
      fontSize: 24,
      color: GOLD,
      marginTop: 22,
      letterSpacing: '0.06em'
    }
  }, "comment your pick — answer at the end")), /*#__PURE__*/React.createElement(Header, {
    start: 7.2,
    end: 13.0,
    top: 330
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: MONO,
      fontSize: 24,
      letterSpacing: '0.2em',
      color: INK3,
      marginBottom: 24
    }
  }, "THE FOUR QUESTIONS"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: SERIF,
      fontWeight: 600,
      fontSize: 52,
      color: INK,
      lineHeight: 1.55
    }
  }, /*#__PURE__*/React.createElement("b", {
    style: {
      color: RICH
    }
  }, "substrate"), " · ", /*#__PURE__*/React.createElement("b", {
    style: {
      color: SPARED
    }
  }, "nucleophile"), /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("b", {
    style: {
      color: POOR
    }
  }, "solvent"), " · ", /*#__PURE__*/React.createElement("b", {
    style: {
      color: GOLD
    }
  }, "temperature")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: SANS,
      fontSize: 30,
      color: INK2,
      marginTop: 22
    }
  }, "ask them in order — the answer falls out")), /*#__PURE__*/React.createElement(Header, {
    start: 13.2,
    end: 20.0,
    top: 150
  }, /*#__PURE__*/React.createElement(Lineup, {
    title: "Q1 · THE SUBSTRATE",
    titleColor: RICH,
    base: 13.6,
    cards: [{
      formula: 'methyl · 1°',
      annot: 'SN2 only',
      tag: 'no carbocation',
      color: SPARED
    }, {
      formula: '2°',
      annot: 'battleground',
      tag: 'next questions decide',
      color: GOLD
    }, {
      formula: '3°',
      annot: 'never SN2',
      tag: 'too crowded',
      color: RICH
    }]
  })), /*#__PURE__*/React.createElement(Header, {
    start: 20.2,
    end: 27.0,
    top: 170
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: MONO,
      fontSize: 24,
      letterSpacing: '0.2em',
      color: SPARED,
      marginBottom: 14
    }
  }, "Q2 · STRONG SMALL NUCLEOPHILE"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: SERIF,
      fontWeight: 600,
      fontSize: 46,
      color: INK
    }
  }, "CN⁻ · OH⁻ · RO⁻ (small) → ", /*#__PURE__*/React.createElement("b", {
    style: {
      color: SPARED
    }
  }, "SN2")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: SANS,
      fontSize: 28,
      color: INK3,
      marginTop: 10
    }
  }, "one concerted backside attack — the umbrella flips")), /*#__PURE__*/React.createElement(ResultBanner, {
    start: 23.2,
    end: 27.0,
    color: SPARED,
    kicker: "SN2 STEREOCHEMISTRY",
    big: "inversion",
    sub: "backside attack — every time"
  }), /*#__PURE__*/React.createElement(Header, {
    start: 27.2,
    end: 34.0,
    top: 170
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: MONO,
      fontSize: 24,
      letterSpacing: '0.2em',
      color: RICH,
      marginBottom: 14
    }
  }, "Q3 · THE SOLVENT TELL"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: SERIF,
      fontWeight: 600,
      fontSize: 46,
      color: INK
    }
  }, /*#__PURE__*/React.createElement("b", {
    style: {
      color: SPARED
    }
  }, "aprotic"), " (THF · DMSO · acetone) → SN2", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("b", {
    style: {
      color: RICH
    }
  }, "protic"), " (H₂O · ROH) → SN1 / E1")), /*#__PURE__*/React.createElement(ResultBanner, {
    start: 30.4,
    end: 34.0,
    color: RICH,
    kicker: "SN1 STEREOCHEMISTRY",
    big: "racemization",
    sub: "flat carbocation — attacked from both faces"
  }), /*#__PURE__*/React.createElement(Header, {
    start: 34.2,
    end: 41.0,
    top: 170
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: MONO,
      fontSize: 24,
      letterSpacing: '0.2em',
      color: GOLD,
      marginBottom: 14
    }
  }, "Q4 · STRONG BASE / HEAT"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: SERIF,
      fontWeight: 600,
      fontSize: 46,
      color: INK
    }
  }, "see ", /*#__PURE__*/React.createElement("b", {
    style: {
      color: GOLD
    }
  }, "TBuOK"), "? see ", /*#__PURE__*/React.createElement("b", {
    style: {
      color: POOR
    }
  }, "heat"), "? → elimination"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: SANS,
      fontSize: 28,
      color: INK3,
      marginTop: 10
    }
  }, "E2 needs the H and the leaving group anti-periplanar")), /*#__PURE__*/React.createElement(ResultBanner, {
    start: 37.4,
    end: 41.0,
    color: GOLD,
    kicker: "E2 REGIOCHEMISTRY",
    big: "Zaitsev",
    sub: "more substituted alkene = more stable"
  }), /*#__PURE__*/React.createElement(Header, {
    start: 41.2,
    end: 48.0,
    top: 170
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: MONO,
      fontSize: 24,
      letterSpacing: '0.2em',
      color: POOR,
      marginBottom: 14
    }
  }, "TWO TRAPS"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: SERIF,
      fontWeight: 600,
      fontSize: 44,
      color: INK,
      lineHeight: 1.5
    }
  }, "only ", /*#__PURE__*/React.createElement("b", {
    style: {
      color: RICH
    }
  }, "SN1 / E1 rearrange"), " — concerted never does", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("b", {
    style: {
      color: GOLD
    }
  }, "bulky base"), " (TBuOK) → ", /*#__PURE__*/React.createElement("b", {
    style: {
      color: GOLD
    }
  }, "Hofmann"), ", the less-substituted alkene")), /*#__PURE__*/React.createElement(Header, {
    start: 48.2,
    end: 60.0,
    top: 170
  }, /*#__PURE__*/React.createElement(Lineup, {
    title: "AND THE LEAVING GROUP",
    titleColor: POOR,
    base: 48.6,
    sub: "a weak, stable base leaves happily — tosylate is elite",
    cards: [{
      formula: 'I⁻',
      annot: 'best',
      tag: 'weakest base',
      color: RICH
    }, {
      formula: 'Br⁻',
      annot: 'great',
      tag: '',
      color: RICH
    }, {
      formula: 'Cl⁻',
      annot: 'okay',
      tag: '',
      color: GOLD
    }, {
      formula: 'F⁻ · OH⁻',
      annot: 'terrible',
      tag: 'strong bases',
      color: REDX
    }]
  })), /*#__PURE__*/React.createElement(MechGrid, null), /*#__PURE__*/React.createElement(Header, {
    start: 60.2,
    end: 71.0,
    top: 560
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: MONO,
      fontSize: 24,
      letterSpacing: '0.22em',
      color: GOLD,
      marginBottom: 12
    }
  }, "REMEMBER THIS"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: SERIF,
      fontWeight: 600,
      fontSize: 68,
      color: INK,
      lineHeight: 1.3,
      letterSpacing: '-0.01em'
    }
  }, "heat is ", /*#__PURE__*/React.createElement("b", {
    style: {
      color: POOR
    }
  }, "always elimination"), ".", /*#__PURE__*/React.createElement("br", null), "bulky base is ", /*#__PURE__*/React.createElement("b", {
    style: {
      color: GOLD
    }
  }, "always Hofmann"), ".", /*#__PURE__*/React.createElement("br", null), "aprotic means ", /*#__PURE__*/React.createElement("b", {
    style: {
      color: SPARED
    }
  }, "SN2"), "."), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: SANS,
      fontSize: 30,
      color: INK2,
      marginTop: 26
    }
  }, "three tells — they decide most questions on their own")), /*#__PURE__*/React.createElement(SummaryLadder, {
    start: 71.2,
    end: 83.0,
    kicker: "THE FOUR QUESTIONS",
    title: "ask them in order",
    rows: [{
      k: 'Q1 · SUBSTRATE',
      ex: 'methyl/1° SN2 · 3° never SN2',
      pill: 'count the carbons',
      c: RICH
    }, {
      k: 'Q2 · NUCLEOPHILE',
      ex: 'strong small → SN2 · bulky → E2',
      pill: 'strength + size',
      c: SPARED
    }, {
      k: 'Q3 · SOLVENT',
      ex: 'aprotic SN2 · protic SN1/E1',
      pill: 'THF · DMSO · acetone',
      c: POOR
    }, {
      k: 'Q4 · TEMPERATURE',
      ex: 'heat → E1 / E2',
      pill: 'heat = elimination',
      c: GOLD
    }]
  }), /*#__PURE__*/React.createElement(QuizBeat, {
    start: 83.2,
    qs: [{
      q: 'CH₃CH₂CH₂CH₂Br + NaCN, in DMSO →',
      opts: ['SN2 — with inversion', 'SN1 — racemization', 'E2 — an alkene'],
      ans: 0,
      why: 'Primary substrate, strong small nucleophile, polar aprotic — the SN2 trifecta. Backside attack, umbrella flips.'
    }, {
      q: '(CH₃)₃C–Br + t-BuOK + heat →',
      opts: ['SN2 product', 'E2 — the Hofmann alkene', 'SN1 — retention'],
      ans: 1,
      why: 'Never SN2 on 3°. Strong bulky base plus heat is E2 — and bulky means Hofmann, the less-substituted alkene.'
    }]
  }), /*#__PURE__*/React.createElement(OutroCard, {
    start: 99.8,
    end: 108,
    lines: ['Four questions,', 'asked in order.'],
    tease: "R/S in three moves — do the numbers — is next."
  }));
}
window.SubElimVideo = SubElimVideo;
if (typeof module !== "undefined") {
  module.exports = {
    SubElimVideo
  };
}