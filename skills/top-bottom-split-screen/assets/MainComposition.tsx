// TEMPLATE — the split-screen shell. Rename, point at your source video, and
// replace the example overlay sequences with your planned timeline. Every
// overlay window here must also appear in SPLIT_WINDOWS in constants.ts.
import {
  AbsoluteFill,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Video } from "@remotion/media";
import { Captions } from "./Captions";
import { HookTitle } from "./HookTitle";
import { BrollCard } from "./BrollCard";
import {
  COLORS,
  sec,
  SOURCE_VIDEO_STYLE,
  TOP_PANEL_HEIGHT,
  VIDEO_SPLIT_SHIFT,
} from "./constants";
import { splitProgressAtFrame } from "./split";

const ProgressBar: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const width = interpolate(frame, [0, durationInFrames], [0, 100]);
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        height: 12,
        width: `${width}%`,
        background: COLORS.accent,
        zIndex: 10,
      }}
    />
  );
};

export const MainComposition: React.FC = () => {
  const frame = useCurrentFrame();
  const split = splitProgressAtFrame(frame);

  return (
    <AbsoluteFill style={{ background: "black" }}>
      {/* Talking head. At full split it is clipped to the bottom half and
          shifted down so the face is centered in the visible band. */}
      <AbsoluteFill
        style={{ clipPath: `inset(${split * TOP_PANEL_HEIGHT}px 0 0 0)` }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            transform: `translateY(${split * VIDEO_SPLIT_SHIFT}px)`,
          }}
        >
          {/* TODO: your source video path under public/ */}
          <Video src={staticFile("my-project/source.mp4")} style={SOURCE_VIDEO_STYLE} />
        </div>
      </AbsoluteFill>

      {/* Top panel holding every added element; slides down with the split */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: TOP_PANEL_HEIGHT,
          transform: `translateY(${(split - 1) * TOP_PANEL_HEIGHT}px)`,
          background: "linear-gradient(180deg, #0B0E1C 0%, #131A33 100%)",
          overflow: "hidden",
        }}
      >
        {/* TODO: replace with your overlay timeline. premountFor is required
            on video overlays so they preload before sliding in. */}
        <Sequence durationInFrames={sec(4.8)}>
          <HookTitle />
        </Sequence>

        <Sequence from={sec(20.0)} durationInFrames={sec(4.9)} premountFor={sec(1)}>
          <BrollCard
            src="my-project/broll/example.mp4"
            label="Example label"
            trimBeforeSeconds={2}
          />
        </Sequence>

        {/* Seam accent line at the bottom edge of the panel */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 6,
            background: COLORS.accent,
          }}
        />
      </div>

      <Captions />
      <ProgressBar />
    </AbsoluteFill>
  );
};
