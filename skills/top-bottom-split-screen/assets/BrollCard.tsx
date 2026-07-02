import {
  AbsoluteFill,
  Easing,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Video } from "@remotion/media";
import { loadFont } from "@remotion/google-fonts/Montserrat";
import { TOP_PANEL_HEIGHT, WIDTH } from "./constants";

const { fontFamily } = loadFont("normal", {
  weights: ["800"],
  subsets: ["latin"],
});

// Explicit cover sizing for the 16:9 clips inside the 1080x960 panel —
// objectFit alone letterboxes the media Video, so oversize and center it.
const COVER_WIDTH = Math.ceil((TOP_PANEL_HEIGHT * 16) / 9);

// Full-bleed b-roll filling the top split panel, with a label pill.
export const BrollCard: React.FC<{
  src: string;
  label: string;
  trimBeforeSeconds?: number;
}> = ({ src, label, trimBeforeSeconds = 0 }) => {
  const frame = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();

  const enter = interpolate(frame, [0, 14], [0, 1], {
    easing: Easing.bezier(0.22, 1, 0.36, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const exit = interpolate(
    frame,
    [durationInFrames - 10, durationInFrames],
    [0, 1],
    {
      easing: Easing.in(Easing.cubic),
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );
  const progress = enter - exit;

  const labelIn = interpolate(frame, [8, 24], [0, 1], {
    easing: Easing.bezier(0.22, 1, 0.36, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ opacity: progress }}>
      <Video
        src={staticFile(src)}
        muted
        trimBefore={Math.round(trimBeforeSeconds * fps)}
        style={{
          position: "absolute",
          width: COVER_WIDTH,
          height: TOP_PANEL_HEIGHT,
          left: (WIDTH - COVER_WIDTH) / 2,
          top: 0,
        }}
      />
      {/* darken the lower edge so the label reads cleanly */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: 260,
          background:
            "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.65) 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 44,
          display: "flex",
          justifyContent: "center",
          opacity: labelIn * progress,
          transform: `translateY(${(1 - labelIn) * 30}px)`,
        }}
      >
        <div
          style={{
            fontFamily,
            fontWeight: 800,
            fontSize: 40,
            color: "white",
            textTransform: "uppercase",
            letterSpacing: 2,
            background: "rgba(10, 12, 24, 0.82)",
            border: "2px solid rgba(255,255,255,0.18)",
            borderRadius: 999,
            padding: "16px 40px",
            maxWidth: 960,
            textAlign: "center",
          }}
        >
          {label}
        </div>
      </div>
    </AbsoluteFill>
  );
};
