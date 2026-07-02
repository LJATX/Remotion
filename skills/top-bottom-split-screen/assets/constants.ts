// TEMPLATE — adapt the TODO-marked values for each new video.
export const FPS = 30;

// TODO: set to the source video duration in seconds (from ffprobe).
export const SOURCE_DURATION_SECONDS = 184.951;
export const DURATION_IN_FRAMES = Math.ceil(SOURCE_DURATION_SECONDS * FPS);

export const WIDTH = 1080;
export const HEIGHT = 1920;

// TODO: set from ffmpeg cropdetect. Phone footage often arrives as a vertical
// clip pillarboxed inside a 1920x1080 landscape file; this is the active
// region. If the source is already 9:16 full-frame, use
// { x: 0, y: 0, w: sourceWidth, h: sourceHeight }.
const REGION = { x: 656, y: 4, w: 608, h: 1072 };
const SCALE = HEIGHT / REGION.h;

export const SOURCE_VIDEO_STYLE: React.CSSProperties = {
  position: "absolute",
  width: 1920 * SCALE, // TODO: source file pixel dimensions
  height: 1080 * SCALE,
  left: WIDTH / 2 - (REGION.x + REGION.w / 2) * SCALE,
  top: HEIGHT / 2 - (REGION.y + REGION.h / 2) * SCALE,
};

export const COLORS = {
  accent: "#FFD52D", // caption highlight + seam + progress bar
  purple: "#A78BFA",
  cyan: "#22D3EE",
  green: "#34D399",
  amber: "#FBBF24",
  red: "#F87171",
  cardBg: "rgba(10, 12, 24, 0.88)",
  cardBorder: "rgba(255, 255, 255, 0.14)",
};

export const sec = (s: number) => Math.round(s * FPS);

// Split-screen layout: when an overlay element is on screen, it occupies a
// top panel and the talking head slides down into the bottom half.
export const TOP_PANEL_HEIGHT = 960;

// TODO: how far the source video shifts down at full split. Pick so the face
// is centered in the bottom half: check the face's y-range across several
// frames of the full-screen view; faceTop + shift should land below ~1060
// (clear of the seam captions) and the chin should stay on screen. 560 worked
// for a face spanning view y 540–1250.
export const VIDEO_SPLIT_SHIFT = 560;

// TODO: the overlay schedule, in seconds — one entry per continuous stretch
// of overlay elements. Merge windows separated by <1.5s so the split doesn't
// flap open/closed, and extend element durations to fill merged windows.
export const SPLIT_WINDOWS: Array<{ start: number; end: number }> = [
  { start: 0, end: 4.8 },
];
