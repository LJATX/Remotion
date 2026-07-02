import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AbsoluteFill,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
  useDelayRender,
  useVideoConfig,
} from "remotion";
import { splitProgressAtFrame } from "./split";
import type { Caption } from "@remotion/captions";
import { createTikTokStyleCaptions, TikTokPage } from "@remotion/captions";
import { loadFont } from "@remotion/google-fonts/Montserrat";
import { COLORS } from "./constants";

const { fontFamily } = loadFont("normal", {
  weights: ["800", "900"],
  subsets: ["latin"],
});

const SWITCH_CAPTIONS_EVERY_MS = 1000;

const CaptionPage: React.FC<{ page: TikTokPage }> = ({ page }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const absoluteTimeMs = page.startMs + (frame / fps) * 1000;

  // Split-screen aware position: normally low on the chest, but riding the
  // seam between the top panel and the face when the split is open.
  const absoluteFrame = Math.round((page.startMs / 1000) * fps) + frame;
  const split = splitProgressAtFrame(absoluteFrame);
  const marginBottom = interpolate(split, [0, 1], [400, 920]);

  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center" }}>
      <div
        style={{
          marginBottom,
          maxWidth: 950,
          textAlign: "center",
          fontFamily,
          fontWeight: 900,
          fontSize: 64,
          lineHeight: 1.18,
          textTransform: "uppercase",
          color: "white",
          whiteSpace: "pre-wrap",
          textShadow:
            "0 0 14px rgba(0,0,0,0.85), 0 4px 8px rgba(0,0,0,0.9), 0 2px 3px rgba(0,0,0,1)",
          WebkitTextStroke: "2px rgba(0,0,0,0.65)",
          paintOrder: "stroke fill",
        }}
      >
        {page.tokens.map((token) => {
          const isActive =
            token.fromMs <= absoluteTimeMs && token.toMs > absoluteTimeMs;
          return (
            <span
              key={token.fromMs}
              style={{
                color: isActive ? COLORS.accent : "white",
              }}
            >
              {token.text}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export const Captions: React.FC = () => {
  const { fps } = useVideoConfig();
  const [captions, setCaptions] = useState<Caption[] | null>(null);
  const { delayRender, continueRender, cancelRender } = useDelayRender();
  const [handle] = useState(() => delayRender("Loading captions"));

  const fetchCaptions = useCallback(async () => {
    try {
      // TODO: your captions path under public/ (from scripts/transcribe.mts)
      const response = await fetch(staticFile("my-project/captions.json"));
      const data = (await response.json()) as Caption[];
      setCaptions(data.filter((c) => !c.text.includes("[")));
      continueRender(handle);
    } catch (e) {
      cancelRender(e);
    }
  }, [continueRender, cancelRender, handle]);

  useEffect(() => {
    fetchCaptions();
  }, [fetchCaptions]);

  const pages = useMemo(() => {
    if (!captions) {
      return [];
    }
    return createTikTokStyleCaptions({
      captions,
      combineTokensWithinMilliseconds: SWITCH_CAPTIONS_EVERY_MS,
    }).pages;
  }, [captions]);

  if (!captions) {
    return null;
  }

  return (
    <AbsoluteFill>
      {pages.map((page, index) => {
        const nextPage = pages[index + 1] ?? null;
        const startFrame = Math.round((page.startMs / 1000) * fps);
        const endFrame = Math.min(
          nextPage ? Math.round((nextPage.startMs / 1000) * fps) : Infinity,
          startFrame + Math.round((SWITCH_CAPTIONS_EVERY_MS / 1000) * fps) + 15,
        );
        const durationInFrames = endFrame - startFrame;
        if (durationInFrames <= 0) {
          return null;
        }
        return (
          <Sequence
            key={index}
            from={startFrame}
            durationInFrames={durationInFrames}
          >
            <CaptionPage page={page} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
