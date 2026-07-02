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
  weights: ["800", "900"],
  subsets: ["latin"],
});

// TEMPLATE — replace the three text lines below with a hook for the video's
// topic: a small setup line, a big accent-colored question/promise, and a
// payoff subtitle.
export const HookTitle: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const enter = interpolate(frame, [0, 18], [0, 1], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
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
  const progress = enter - exit;

  const subEnter = interpolate(frame, [10, 28], [0, 1], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div
        style={{
          textAlign: "center",
          fontFamily,
          opacity: progress,
          transform: `translateY(${(1 - enter) * -40}px) scale(${
            0.94 + enter * 0.06
          })`,
        }}
      >
        <div
          style={{
            fontSize: 58,
            fontWeight: 800,
            color: "white",
            textTransform: "uppercase",
            letterSpacing: 6,
            textShadow: "0 3px 10px rgba(0,0,0,0.9)",
          }}
        >
          What are
        </div>
        <div
          style={{
            fontSize: 130,
            fontWeight: 900,
            lineHeight: 1.05,
            color: COLORS.accent,
            textTransform: "uppercase",
            textShadow: "0 6px 22px rgba(0,0,0,0.9)",
          }}
        >
          AI Tokens?
        </div>
        <div
          style={{
            marginTop: 18,
            fontSize: 42,
            fontWeight: 800,
            color: "white",
            opacity: subEnter * progress,
            transform: `translateY(${(1 - subEnter) * 20}px)`,
            textShadow: "0 3px 10px rgba(0,0,0,0.9)",
          }}
        >
          …and why AI is so cheap right now 💸
        </div>
      </div>
    </AbsoluteFill>
  );
};
