import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/Montserrat";
import { COLORS } from "./constants";

const { fontFamily } = loadFont("normal", {
  weights: ["700", "800", "900"],
  subsets: ["latin"],
});

// Shared enter/exit for any graphic card living in the top panel. Enter
// slides down + fades; exit fades as the sequence ends (the panel slide
// handles the rest of the departure).
export const useCardProgress = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const enter = interpolate(frame, [0, 16], [0, 1], {
    easing: Easing.bezier(0.22, 1, 0.36, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const exit = interpolate(
    frame,
    [durationInFrames - 12, durationInFrames],
    [0, 1],
    {
      easing: Easing.in(Easing.cubic),
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );
  return { frame, enter, progress: enter - exit };
};

export const cardStyle = (
  enter: number,
  progress: number,
): React.CSSProperties => ({
  width: 980,
  borderRadius: 36,
  background: COLORS.cardBg,
  border: `3px solid ${COLORS.cardBorder}`,
  boxShadow: "0 24px 60px rgba(0,0,0,0.55)",
  padding: "48px 48px 54px",
  fontFamily,
  opacity: progress,
  transform: `translateY(${(1 - enter) * -60}px)`,
});

export const cardKickerStyle: React.CSSProperties = {
  fontSize: 30,
  fontWeight: 800,
  letterSpacing: 6,
  textTransform: "uppercase",
  color: COLORS.accent,
  textAlign: "center",
  marginBottom: 30,
};

// EXAMPLE card — a count-up shock stat ("You pay $20 → actually ~$200").
// Copy this shape for new graphics: kicker + animated body, inner elements
// staggered 7–20 frames apart. Overshoot pops: Easing.bezier(.34,1.56,.64,1).
export const ExampleStatCard: React.FC = () => {
  const { frame, enter, progress } = useCardProgress();

  const countUp = interpolate(frame, [40, 85], [20, 200], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div style={cardStyle(enter, progress)}>
        <div style={cardKickerStyle}>Investors are paying your tab</div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 40,
          }}
        >
          <div style={{ fontSize: 96, fontWeight: 900, color: COLORS.green }}>
            $20
          </div>
          <div style={{ fontSize: 70, color: "white" }}>→</div>
          <div style={{ fontSize: 96, fontWeight: 900, color: COLORS.red }}>
            ~${Math.round(countUp)}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
