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
//  Ace the DAT — ORGO • Acidity Ranking — Tip 03  (108s)
//  Judge the CONJUGATE BASE, run CARDIO in order, stop at the
//  first difference. Question-first hook + Your Turn quiz.
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
const RICH = 'oklch(0.745 0.152 150)'; // green · stabilized / winner
const POOR = 'oklch(0.775 0.16 58)'; // orange · pull / EWG
const SPARED = 'oklch(0.72 0.142 250)'; // blue · orbital
const REDX = 'oklch(0.63 0.2 25)'; // hot · concentrated charge

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

// ── brand ────────────────────────────────────────────────────
function BrandBug() {
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
  }, "ORGO · ACIDITY")));
}
function TipTag() {
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
  }, "TRICK 03");
}

// ── header sprite helper ─────────────────────────────────────
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

// ── result banner ────────────────────────────────────────────
function ResultBanner({
  start,
  end,
  color,
  kicker,
  big,
  sub
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
        top: 1336,
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

// ── letter chip (the CARDIO letter riding each tier) ─────────
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

// ── central conjugate-base stage (persistent panel) ──────────
function CBStage() {
  const t = useTime();
  const panelIn = clamp((t - 10.3) / 0.7, 0, 1);
  const panelOut = 1 - clamp((t - 59.6) / 0.5, 0, 1);
  const panelS = 0.95 + 0.05 * Easing.easeOutBack(panelIn);
  const op = panelIn * panelOut;
  if (op <= 0) return null;
  const seg = t < 19.0 ? 'c' : t < 28.0 ? 'a' : t < 40.0 ? 'r' : t < 52.0 ? 'd' : 'o';
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
  }), /*#__PURE__*/React.createElement("div", {
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
  }, "THE CONJUGATE BASE · HOW HAPPY IS THE CHARGE?"), seg === 'c' && /*#__PURE__*/React.createElement(TierCharge, {
    t: t
  }), seg === 'a' && /*#__PURE__*/React.createElement(TierAtom, {
    t: t
  }), seg === 'r' && /*#__PURE__*/React.createElement(TierResonance, {
    t: t
  }), seg === 'd' && /*#__PURE__*/React.createElement(TierInduction, {
    t: t
  }), seg === 'o' && /*#__PURE__*/React.createElement(TierOrbital, {
    t: t
  }));
}

// C — a drawn charge wins
function TierCharge({
  t
}) {
  const a = clamp((t - 10.8) / 0.6, 0, 1);
  const pulse = 1 + 0.06 * Math.sin((t - 10.8) * 3.2);
  const Card = ({
    x,
    glow,
    formula,
    note,
    chargeMark,
    color
  }) => /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: x,
      top: 760,
      width: 330,
      textAlign: 'center',
      opacity: a,
      background: CARD2,
      border: `1px solid ${glow ? color : LINE}`,
      borderRadius: 28,
      padding: '44px 20px 36px',
      boxShadow: glow ? `0 0 46px ${color}44, 0 16px 40px rgba(0,0,0,.5)` : '0 16px 40px rgba(0,0,0,.5)',
      transform: glow ? `scale(${pulse})` : 'scale(0.94)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: SERIF,
      fontWeight: 600,
      fontSize: 84,
      color: INK,
      lineHeight: 1
    }
  }, formula), chargeMark && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      right: 26,
      top: 22,
      width: 58,
      height: 58,
      borderRadius: '50%',
      background: color,
      color: '#1a140c',
      fontFamily: SERIF,
      fontWeight: 700,
      fontSize: 40,
      lineHeight: '58px',
      boxShadow: `0 0 22px ${color}`
    }
  }, "+"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: MONO,
      fontSize: 22,
      color: glow ? color : INK3,
      marginTop: 20
    }
  }, note));
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Card, {
    x: 130,
    glow: true,
    color: GOLD,
    formula: 'H₃O⁺',
    note: "pKa −1.7 · stronger",
    chargeMark: true
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: 880,
      textAlign: 'center',
      fontFamily: SERIF,
      fontSize: 52,
      color: INK3,
      opacity: a
    }
  }, "vs"), /*#__PURE__*/React.createElement(Card, {
    x: 620,
    color: INK3,
    formula: 'H₂O',
    note: "pKa 15.7 · neutral"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: 1130,
      textAlign: 'center',
      fontFamily: SANS,
      fontSize: 32,
      color: INK2,
      opacity: a
    }
  }, "a literal drawn ", /*#__PURE__*/React.createElement("b", {
    style: {
      color: GOLD
    }
  }, "+"), " or ", /*#__PURE__*/React.createElement("b", {
    style: {
      color: GOLD
    }
  }, "−"), " beats everything — check it first"));
}

// A — bigger atom spreads the charge
function TierAtom({
  t
}) {
  const HAL = [{
    s: 'F⁻',
    r: 44,
    hot: 1.0,
    x: 190
  }, {
    s: 'Cl⁻',
    r: 56,
    hot: 0.66,
    x: 400
  }, {
    s: 'Br⁻',
    r: 70,
    hot: 0.36,
    x: 630
  }, {
    s: 'I⁻',
    r: 88,
    hot: 0.0,
    x: 890
  }];
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("svg", {
    width: CW,
    height: CH,
    viewBox: `0 0 ${CW} ${CH}`,
    style: {
      position: 'absolute',
      inset: 0,
      overflow: 'visible'
    }
  }, HAL.map((h, i) => {
    const a = clamp((t - 19.6 - i * 0.35) / 0.5, 0, 1);
    const col = h.hot > 0.5 ? REDX : h.hot > 0.2 ? POOR : RICH;
    return /*#__PURE__*/React.createElement("g", {
      key: i,
      opacity: a
    }, /*#__PURE__*/React.createElement("circle", {
      cx: h.x,
      cy: 905,
      r: h.r + 26,
      fill: col,
      opacity: 0.16 + 0.3 * h.hot,
      style: {
        filter: 'blur(18px)'
      }
    }), /*#__PURE__*/React.createElement("circle", {
      cx: h.x,
      cy: 905,
      r: h.r,
      fill: CARD2,
      stroke: col,
      strokeWidth: 5
    }), /*#__PURE__*/React.createElement("text", {
      x: h.x,
      y: 905 + 14,
      textAnchor: "middle",
      fontFamily: SERIF,
      fontWeight: "600",
      fontSize: "44",
      fill: INK
    }, h.s), /*#__PURE__*/React.createElement("text", {
      x: h.x,
      y: 905 + h.r + 56,
      textAnchor: "middle",
      fontFamily: MONO,
      fontSize: "22",
      fill: i === 3 ? RICH : INK3
    }, i === 3 ? 'spread out · happy' : ''));
  }), /*#__PURE__*/React.createElement("line", {
    x1: 170,
    y1: 1080,
    x2: 950,
    y2: 1080,
    stroke: INK3,
    strokeWidth: 4,
    opacity: clamp((t - 21.4) / 0.5, 0, 1)
  }), /*#__PURE__*/React.createElement("polygon", {
    points: "962,1080 934,1068 934,1092",
    fill: INK3,
    opacity: clamp((t - 21.4) / 0.5, 0, 1)
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: 1096,
      textAlign: 'center',
      fontFamily: SANS,
      fontSize: 32,
      color: INK2,
      opacity: clamp((t - 21.6) / 0.5, 0, 1)
    }
  }, "same charge, bigger body → ", /*#__PURE__*/React.createElement("b", {
    style: {
      color: RICH
    }
  }, "more stable")), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: 1160,
      textAlign: 'center',
      fontFamily: MONO,
      fontSize: 24,
      color: GOLD,
      opacity: clamp((t - 22.6) / 0.5, 0, 1)
    }
  }, "left → right: electronegativity \xA0·\xA0 up → down: size"));
}

// R — the charge hops between two oxygens (share the load)
function TierResonance({
  t
}) {
  const a = clamp((t - 28.5) / 0.6, 0, 1);
  const hop = Math.floor((t - 28.5) / 0.9) % 2; // which O carries it
  const OXY = [{
    x: 380,
    y: 780
  }, {
    x: 700,
    y: 780
  }];
  const C = {
    x: 540,
    y: 930
  };
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("svg", {
    width: CW,
    height: CH,
    viewBox: `0 0 ${CW} ${CH}`,
    style: {
      position: 'absolute',
      inset: 0,
      overflow: 'visible',
      opacity: a
    }
  }, OXY.map((o, i) => {
    const on = hop === i;
    return /*#__PURE__*/React.createElement("g", {
      key: i
    }, /*#__PURE__*/React.createElement("line", {
      x1: C.x,
      y1: C.y,
      x2: o.x,
      y2: o.y,
      stroke: INK2,
      strokeWidth: 9
    }), !on && /*#__PURE__*/React.createElement("line", {
      x1: C.x + (i ? 14 : -14),
      y1: C.y - 10,
      x2: o.x + (i ? 14 : -14),
      y2: o.y - 10,
      stroke: INK2,
      strokeWidth: 6,
      opacity: 0.75
    }), /*#__PURE__*/React.createElement("circle", {
      cx: o.x,
      cy: o.y,
      r: 54,
      fill: CARD2,
      stroke: on ? RICH : LINE,
      strokeWidth: 5,
      style: on ? {
        filter: `drop-shadow(0 0 18px ${RICH})`
      } : null
    }), /*#__PURE__*/React.createElement("text", {
      x: o.x,
      y: o.y + 15,
      textAnchor: "middle",
      fontFamily: SERIF,
      fontWeight: "600",
      fontSize: "46",
      fill: INK
    }, "O"), /*#__PURE__*/React.createElement("circle", {
      cx: o.x + 44,
      cy: o.y - 44,
      r: 24,
      fill: on ? RICH : 'transparent',
      opacity: on ? 1 : 0
    }), /*#__PURE__*/React.createElement("text", {
      x: o.x + 44,
      y: o.y - 35,
      textAnchor: "middle",
      fontFamily: SERIF,
      fontWeight: "700",
      fontSize: "34",
      fill: "#1a140c",
      opacity: on ? 1 : 0
    }, "−"));
  }), /*#__PURE__*/React.createElement("circle", {
    cx: C.x,
    cy: C.y,
    r: 44,
    fill: CARD2,
    stroke: INK2,
    strokeWidth: 5
  }), /*#__PURE__*/React.createElement("text", {
    x: C.x,
    y: C.y + 14,
    textAnchor: "middle",
    fontFamily: SERIF,
    fontWeight: "600",
    fontSize: "40",
    fill: INK
  }, "C"), /*#__PURE__*/React.createElement("line", {
    x1: C.x,
    y1: C.y + 44,
    x2: C.x,
    y2: 1060,
    stroke: INK2,
    strokeWidth: 9
  }), /*#__PURE__*/React.createElement("text", {
    x: C.x,
    y: 1116,
    textAnchor: "middle",
    fontFamily: SERIF,
    fontWeight: "600",
    fontSize: "44",
    fill: INK
  }, "R"), /*#__PURE__*/React.createElement("path", {
    d: `M ${OXY[0].x + 60} ${OXY[0].y - 70} Q ${C.x} ${OXY[0].y - 150} ${OXY[1].x - 60} ${OXY[1].y - 70}`,
    fill: "none",
    stroke: RICH,
    strokeWidth: 5,
    strokeDasharray: "3 12",
    strokeLinecap: "round",
    opacity: 0.8
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: 1170,
      textAlign: 'center',
      fontFamily: SANS,
      fontSize: 32,
      color: INK2,
      opacity: a
    }
  }, "two oxygens ", /*#__PURE__*/React.createElement("b", {
    style: {
      color: RICH
    }
  }, "share the load"), " — like two people lifting the couch"));
}

// D/I — EWGs siphon the charge away through the bonds
function TierInduction({
  t
}) {
  const a = clamp((t - 40.5) / 0.6, 0, 1);
  const F = [{
    x: 250,
    y: 800
  }, {
    x: 210,
    y: 905
  }, {
    x: 250,
    y: 1010
  }];
  const CC = {
    x: 400,
    y: 905
  }; // CF3 carbon
  const O = {
    x: 760,
    y: 905
  }; // carboxylate end (charge)
  const dots = [];
  for (let j = 0; j < 6; j++) {
    const phase = ((t - 40.5) * 0.55 + j / 6) % 1;
    const u = Easing.easeInOutCubic(phase);
    const x = O.x - 90 + (CC.x + 60 - (O.x - 90)) * u;
    const op = Math.sin(Math.PI * phase) * a;
    dots.push(/*#__PURE__*/React.createElement("circle", {
      key: 'd' + j,
      cx: x,
      cy: 905,
      r: 8,
      fill: POOR,
      opacity: op,
      style: {
        filter: `drop-shadow(0 0 7px ${POOR})`
      }
    }));
  }
  const calm = clamp((t - 43.0) / 1.2, 0, 1);
  const chargeCol = calm > 0.5 ? RICH : REDX;
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("svg", {
    width: CW,
    height: CH,
    viewBox: `0 0 ${CW} ${CH}`,
    style: {
      position: 'absolute',
      inset: 0,
      overflow: 'visible',
      opacity: a
    }
  }, F.map((f, i) => /*#__PURE__*/React.createElement("g", {
    key: i
  }, /*#__PURE__*/React.createElement("line", {
    x1: CC.x,
    y1: CC.y,
    x2: f.x,
    y2: f.y,
    stroke: INK2,
    strokeWidth: 8
  }), /*#__PURE__*/React.createElement("text", {
    x: f.x - 34,
    y: f.y + 12,
    textAnchor: "middle",
    fontFamily: SERIF,
    fontWeight: "600",
    fontSize: "42",
    fill: POOR
  }, "F"))), /*#__PURE__*/React.createElement("circle", {
    cx: CC.x,
    cy: CC.y,
    r: 40,
    fill: CARD2,
    stroke: INK2,
    strokeWidth: 5
  }), /*#__PURE__*/React.createElement("text", {
    x: CC.x,
    y: CC.y + 13,
    textAnchor: "middle",
    fontFamily: SERIF,
    fontWeight: "600",
    fontSize: "36",
    fill: INK
  }, "C"), /*#__PURE__*/React.createElement("line", {
    x1: CC.x + 40,
    y1: 905,
    x2: O.x - 66,
    y2: 905,
    stroke: INK2,
    strokeWidth: 9
  }), /*#__PURE__*/React.createElement("circle", {
    cx: O.x,
    cy: O.y,
    r: 62,
    fill: CARD2,
    stroke: chargeCol,
    strokeWidth: 5,
    style: {
      filter: `drop-shadow(0 0 ${18 - 8 * calm}px ${chargeCol})`
    }
  }), /*#__PURE__*/React.createElement("text", {
    x: O.x,
    y: O.y + 14,
    textAnchor: "middle",
    fontFamily: SERIF,
    fontWeight: "600",
    fontSize: "40",
    fill: INK
  }, 'CO₂⁻'), dots), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: 1080,
      textAlign: 'center',
      fontFamily: SANS,
      fontSize: 32,
      color: INK2,
      opacity: a
    }
  }, "the fluorines ", /*#__PURE__*/React.createElement("b", {
    style: {
      color: POOR
    }
  }, "siphon the charge away"), " → the base calms down"), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: 1150,
      textAlign: 'center',
      fontFamily: MONO,
      fontSize: 24,
      color: GOLD,
      opacity: clamp((t - 46.4) / 0.5, 0, 1)
    }
  }, "closer pull = stronger · one carbon away, it drops off fast"));
}

// O — more s-character holds the pair closer
function TierOrbital({
  t
}) {
  const ORB = [{
    k: 'sp³',
    pct: 25,
    x: 220,
    c: INK3
  }, {
    k: 'sp²',
    pct: 33,
    x: 490,
    c: INK2
  }, {
    k: 'sp',
    pct: 50,
    x: 760,
    c: SPARED
  }];
  return /*#__PURE__*/React.createElement("div", null, ORB.map((o, i) => {
    const a = clamp((t - 52.5 - i * 0.35) / 0.5, 0, 1);
    const h = 300 * (o.pct / 50) * Easing.easeOutCubic(a);
    const win = i === 2;
    return /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        position: 'absolute',
        left: o.x,
        top: 740,
        width: 130,
        textAlign: 'center',
        opacity: a
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        height: 300,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 96,
        height: h,
        borderRadius: 14,
        background: win ? SPARED : CARD2,
        border: `1px solid ${win ? SPARED : LINE}`,
        boxShadow: win ? `0 0 26px ${SPARED}55` : 'none'
      }
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: SERIF,
        fontWeight: 600,
        fontSize: 46,
        color: win ? SPARED : INK2,
        marginTop: 16
      }
    }, o.k), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: MONO,
        fontSize: 24,
        color: INK3,
        marginTop: 4
      }
    }, o.pct, "% s"));
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: 1180,
      textAlign: 'center',
      fontFamily: SANS,
      fontSize: 32,
      color: INK2,
      opacity: clamp((t - 54.2) / 0.5, 0, 1)
    }
  }, "more s-character → pair held ", /*#__PURE__*/React.createElement("b", {
    style: {
      color: SPARED
    }
  }, "closer to the nucleus"), " → happier charge"));
}

// ── CARDIO lockup (run it in order) ──────────────────────────
function CardioLockup({
  start
}) {
  const t = useTime();
  const L = [{
    l: 'C',
    w: 'charge',
    c: GOLD
  }, {
    l: 'A',
    w: 'atom',
    c: RICH
  }, {
    l: 'R',
    w: 'resonance',
    c: RICH
  }, {
    l: 'D',
    w: 'dipole',
    c: POOR
  }, {
    l: 'I',
    w: 'induction',
    c: POOR
  }, {
    l: 'O',
    w: 'orbital',
    c: SPARED
  }];
  const sweep = Math.floor(clamp((t - start - 2.2) * 0.9, 0, 5.99));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 26,
      justifyContent: 'center',
      marginTop: 22
    }
  }, L.map((x, i) => {
    const a = clamp((t - start - i * 0.22) / 0.4, 0, 1);
    const on = t > start + 2.2 && i === sweep;
    return /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 12,
        opacity: a,
        transform: `translateY(${(1 - a) * 20}px) scale(${on ? 1.12 : 1})`,
        transition: 'transform 200ms'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 118,
        height: 118,
        borderRadius: 28,
        background: on ? x.c : CARD2,
        color: on ? '#1a140c' : x.c,
        border: `1px solid ${x.c}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: SERIF,
        fontWeight: 700,
        fontSize: 74,
        boxShadow: on ? `0 0 34px ${x.c}66` : '0 10px 24px rgba(0,0,0,.4)'
      }
    }, x.l), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: MONO,
        fontSize: 20,
        color: INK2,
        letterSpacing: '0.04em'
      }
    }, x.w));
  }));
}

// ── summary ladder ───────────────────────────────────────────
function CardioLadder({
  start,
  end
}) {
  const ROWS = [{
    k: 'C · CHARGE',
    ex: 'H₃O⁺ > H₂O',
    pill: 'a drawn charge wins',
    c: GOLD
  }, {
    k: 'A · ATOM',
    ex: 'HI > HBr > HCl > HF',
    pill: 'EN across · size down',
    c: RICH
  }, {
    k: 'R · RESONANCE',
    ex: 'RCOOH > ROH',
    pill: 'share the charge',
    c: RICH
  }, {
    k: 'D / I · INDUCTION',
    ex: 'CF₃COOH > CH₃COOH',
    pill: 'EWGs pull it away',
    c: POOR
  }, {
    k: 'O · ORBITAL',
    ex: 'sp > sp² > sp³',
    pill: 'more s-character',
    c: SPARED
  }];
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
    }, "RUN IT IN ORDER"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: SERIF,
        fontWeight: 600,
        fontSize: 54,
        color: INK,
        textAlign: 'center',
        marginBottom: 10,
        letterSpacing: '-0.01em'
      }
    }, "stop at the first difference"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: MONO,
        fontSize: 22,
        color: GOLD,
        textAlign: 'center',
        marginBottom: 24,
        letterSpacing: '0.06em'
      }
    }, "screenshot this — it’s the whole cheat sheet"), ROWS.map((r, i) => {
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
          fontSize: 44,
          color: INK,
          marginTop: 6,
          lineHeight: 1
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

// ── voiceover track ──────────────────────────────────────────
function VoiceTrack({
  base = 'voiceover/acidity/'
}) {
  // Inside the record studio the video runs in an iframe — mute the AI voice
  // so a live human take never gets the clone underneath it.
  if (window.self !== window.top) return null;
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

// ── ROOT ─────────────────────────────────────────────────────
function AcidityRankingVideo() {
  return /*#__PURE__*/React.createElement(Stage, {
    width: CW,
    height: CH,
    duration: 108,
    background: BG,
    persistKey: "acidity-ranking-03"
  }, /*#__PURE__*/React.createElement(VoiceTrack, null), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      backgroundImage: 'radial-gradient(900px 560px at 80% -6%, oklch(0.78 0.10 75 / 0.07), transparent 70%), radial-gradient(820px 520px at -10% 6%, oklch(0.62 0.10 150 / 0.05), transparent 68%)'
    }
  }), /*#__PURE__*/React.createElement(BrandBug, null), /*#__PURE__*/React.createElement(TipTag, null), /*#__PURE__*/React.createElement(Header, {
    start: 0.2,
    end: 4.3,
    top: 680
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
      fontSize: 86,
      color: INK,
      lineHeight: 1.08,
      letterSpacing: '-0.02em'
    }
  }, "CH₃CH₂OH vs CH₃COOH"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: MONO,
      fontSize: 24,
      color: INK3,
      marginTop: 14
    }
  }, "ethanol · acetic acid"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: SANS,
      fontSize: 38,
      color: INK2,
      marginTop: 28
    }
  }, "which is more acidic — ", /*#__PURE__*/React.createElement("b", {
    style: {
      color: GOLD
    }
  }, "and why?")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: MONO,
      fontSize: 24,
      color: GOLD,
      marginTop: 22,
      letterSpacing: '0.06em'
    }
  }, "comment your pick — answer at the end")), /*#__PURE__*/React.createElement(Header, {
    start: 4.5,
    end: 10.3,
    top: 300
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: MONO,
      fontSize: 24,
      letterSpacing: '0.2em',
      color: INK3,
      marginBottom: 24
    }
  }, "THE ONE PRINCIPLE"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: SERIF,
      fontWeight: 600,
      fontSize: 52,
      color: INK,
      lineHeight: 1.5
    }
  }, "kick the H", /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 34,
      verticalAlign: 'super'
    }
  }, "+"), " off —", /*#__PURE__*/React.createElement("br", null), "the ", /*#__PURE__*/React.createElement("b", {
    style: {
      color: RICH
    }
  }, "happier the charge"), " left behind,", /*#__PURE__*/React.createElement("br", null), "the ", /*#__PURE__*/React.createElement("b", {
    style: {
      color: GOLD
    }
  }, "stronger the acid"), "."), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: SANS,
      fontSize: 30,
      color: INK2,
      marginTop: 24
    }
  }, "five checks, in order: ", /*#__PURE__*/React.createElement("b", {
    style: {
      color: GOLD
    }
  }, "CARDIO"))), /*#__PURE__*/React.createElement(Header, {
    start: 10.5,
    end: 19.0,
    top: 170
  }, /*#__PURE__*/React.createElement(LetterChip, {
    letter: "C",
    word: "CHARGE",
    color: GOLD
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: SERIF,
      fontWeight: 600,
      fontSize: 46,
      color: INK
    }
  }, "a literal, drawn charge ", /*#__PURE__*/React.createElement("b", {
    style: {
      color: GOLD
    }
  }, "always wins")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: SANS,
      fontSize: 28,
      color: INK3,
      marginTop: 10
    }
  }, "rare on the test — but it’s check number one")), /*#__PURE__*/React.createElement(ResultBanner, {
    start: 15.0,
    end: 19.0,
    color: GOLD,
    kicker: "CHECK 1",
    big: "charge wins",
    sub: 'H₃O⁺ beats H₂O — done, stop there'
  }), /*#__PURE__*/React.createElement(Header, {
    start: 19.2,
    end: 28.0,
    top: 170
  }, /*#__PURE__*/React.createElement(LetterChip, {
    letter: "A",
    word: "ATOM",
    color: RICH
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: SERIF,
      fontWeight: 600,
      fontSize: 46,
      color: INK
    }
  }, "left → right, up → down"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: SANS,
      fontSize: 28,
      color: INK3,
      marginTop: 10
    }
  }, "who’s holding the charge — and how big are they?")), /*#__PURE__*/React.createElement(ResultBanner, {
    start: 24.4,
    end: 28.0,
    color: RICH,
    kicker: "CHECK 2",
    big: "HI is strongest",
    sub: "biggest atom · most spread-out charge"
  }), /*#__PURE__*/React.createElement(Header, {
    start: 28.2,
    end: 40.0,
    top: 170
  }, /*#__PURE__*/React.createElement(LetterChip, {
    letter: "R",
    word: "RESONANCE",
    color: RICH
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: SERIF,
      fontWeight: 600,
      fontSize: 46,
      color: INK
    }
  }, "more helpers → ", /*#__PURE__*/React.createElement("b", {
    style: {
      color: RICH
    }
  }, "more stable")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: SANS,
      fontSize: 28,
      color: INK3,
      marginTop: 10
    }
  }, "alone you throw your back out — with help, the couch is easy")), /*#__PURE__*/React.createElement(ResultBanner, {
    start: 35.2,
    end: 40.0,
    color: RICH,
    kicker: "CHECK 3",
    big: "RCOOH beats ROH",
    sub: "acetic pKa 4.8 · ethanol 15.9 — resonance is the gap"
  }), /*#__PURE__*/React.createElement(Header, {
    start: 40.2,
    end: 52.0,
    top: 170
  }, /*#__PURE__*/React.createElement(LetterChip, {
    letter: "D·I",
    word: "DIPOLE · INDUCTION",
    color: POOR
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: SERIF,
      fontWeight: 600,
      fontSize: 46,
      color: INK
    }
  }, "electron-withdrawers ", /*#__PURE__*/React.createElement("b", {
    style: {
      color: POOR
    }
  }, "always increase acidity")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: SANS,
      fontSize: 28,
      color: INK3,
      marginTop: 10
    }
  }, "they siphon the charge away through the bonds")), /*#__PURE__*/React.createElement(ResultBanner, {
    start: 47.4,
    end: 52.0,
    color: POOR,
    kicker: "CHECK 4",
    big: 'CF₃COOH ≫ CH₃COOH',
    sub: "pKa 0.2 vs 4.8 — three fluorines pulling"
  }), /*#__PURE__*/React.createElement(Header, {
    start: 52.2,
    end: 60.0,
    top: 170
  }, /*#__PURE__*/React.createElement(LetterChip, {
    letter: "O",
    word: "ORBITAL",
    color: SPARED
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: SERIF,
      fontWeight: 600,
      fontSize: 46,
      color: INK
    }
  }, "more s-character → more acidic"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: SANS,
      fontSize: 28,
      color: INK3,
      marginTop: 10
    }
  }, "the tiebreaker — it comes up in very few cases")), /*#__PURE__*/React.createElement(ResultBanner, {
    start: 56.4,
    end: 60.0,
    color: SPARED,
    kicker: "CHECK 5",
    big: 'sp > sp² > sp³',
    sub: "a terminal alkyne C–H · pKa 25"
  }), /*#__PURE__*/React.createElement(CBStage, null), /*#__PURE__*/React.createElement(Header, {
    start: 60.2,
    end: 71.0,
    top: 560
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: MONO,
      fontSize: 24,
      letterSpacing: '0.22em',
      color: GOLD,
      marginBottom: 10
    }
  }, "REMEMBER THIS"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: SERIF,
      fontWeight: 600,
      fontSize: 66,
      color: INK,
      letterSpacing: '-0.01em'
    }
  }, "run ", /*#__PURE__*/React.createElement("b", {
    style: {
      color: GOLD
    }
  }, "CARDIO"), ", in order"), /*#__PURE__*/React.createElement(CardioLockup, {
    start: 60.6
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: SANS,
      fontSize: 30,
      color: INK2,
      marginTop: 26
    }
  }, "is there a charge? no — next. different atom? no — next.", /*#__PURE__*/React.createElement("br", null), "resonance? ", /*#__PURE__*/React.createElement("b", {
    style: {
      color: RICH
    }
  }, "there it is — stop."))), /*#__PURE__*/React.createElement(CardioLadder, {
    start: 71.2,
    end: 83.0
  }), /*#__PURE__*/React.createElement(QuizBeat, {
    start: 83.2,
    qs: [{
      q: 'Which is more acidic?',
      opts: ['CH₃CH₂OH — ethanol', 'CH₃COOH — acetic acid', 'CH₄ — methane'],
      ans: 1,
      why: 'Run CARDIO: charge no, atom same — resonance. Two oxygens share the charge. Stop there.'
    }, {
      q: 'The strongest halogen acid?',
      opts: ['HF', 'HCl', 'HI'],
      ans: 2,
      why: 'Atom check — down the column the atom gets bigger, the charge spreads out, the base gets happier.'
    }]
  }), /*#__PURE__*/React.createElement(Sprite, {
    start: 99.8,
    end: 108
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
    }, "Rank what’s left behind.", /*#__PURE__*/React.createElement("br", null), "Run CARDIO, in order.", /*#__PURE__*/React.createElement("br", null), "Stop at the first difference."), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: SANS,
        fontSize: 34,
        color: INK2,
        marginTop: 28
      }
    }, "SN1 vs SN2 — the four questions — is next."), /*#__PURE__*/React.createElement("div", {
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
  }));
}
window.AcidityRankingVideo = AcidityRankingVideo;
if (typeof module !== "undefined") {
  module.exports = {
    AcidityRankingVideo
  };
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