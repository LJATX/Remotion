import { Easing, interpolate } from "remotion";
import { sec, SPLIT_WINDOWS } from "./constants";

// 0 = full-screen talking head, 1 = split screen (panel up top, face below).
// Driven by the absolute frame so the video, top panel, and captions all
// animate in lockstep.
export const splitProgressAtFrame = (frame: number): number => {
  let max = 0;
  for (const w of SPLIT_WINDOWS) {
    const start = sec(w.start);
    const end = sec(w.end);
    const enter = interpolate(frame, [start, start + 20], [0, 1], {
      easing: Easing.bezier(0.22, 1, 0.36, 1),
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    const exit = interpolate(frame, [end - 16, end], [0, 1], {
      easing: Easing.in(Easing.cubic),
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    max = Math.max(max, enter - exit);
  }
  return max;
};
