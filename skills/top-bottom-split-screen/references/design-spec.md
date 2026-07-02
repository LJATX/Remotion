# Split-Screen Design Spec

Measurements and reasoning behind the layout. The proven implementation this
is drawn from lives in `~/my-video/src/compositions/token-explainer/`.

## Canvas

- 1080×1920 @ 30fps. `durationInFrames = ceil(sourceSeconds * 30)`.

## The split mechanic

One number — `split` in [0,1] — drives everything, computed per-frame from the
`SPLIT_WINDOWS` schedule (see `split.ts`). Enter over 20 frames with
`Easing.bezier(0.22, 1, 0.36, 1)`, exit over 16 with `Easing.in(Easing.cubic)`.
Take the max across windows.

At `split = 1`:

| Region | Geometry |
|---|---|
| Top panel | y 0–960, dark gradient `#0B0E1C → #131A33`, 6px accent line at its bottom edge |
| Face video | clipped to y 960–1920 via `clipPath: inset(${split*960}px 0 0 0)`, shifted down `translateY(${split*560}px)` |
| Captions | block bottom at y ≈ 1000, straddling the seam |

**Why 560 and not 960/2:** the shift controls which vertical band of the
full-screen view shows in the bottom half. Shifting 560 shows view band
400–1360; with the face typically spanning view y 540–1250 this centers the
full face with ~100px clearance below the seam captions. Re-derive for a new
video: find the face's y-range across several frames, then pick a shift that
puts `faceTop + shift` comfortably below 1060 and `chin + shift` above the
frame bottom.

**Panel slide:** `translateY(${(split - 1) * 960}px)` — it slides down from
above in sync with the video sliding away.

## Source video crop (pillarboxed phone footage)

For an active region `{x, y, w, h}` inside a `1920×1080` file, filling
1080×1920:

```ts
const SCALE = 1920 / h; // cover height; width overflows slightly
const style = {
  position: "absolute",
  width: 1920 * SCALE,
  height: 1080 * SCALE,
  left: 1080 / 2 - (x + w / 2) * SCALE,
  top: 1920 / 2 - (y + h / 2) * SCALE,
};
```

## Captions

- Whisper word tokens → `createTikTokStyleCaptions` with
  `combineTokensWithinMilliseconds: 1000` (2–4 words per page).
- Montserrat 900, 64px, uppercase, white with heavy text-shadow +
  `WebkitTextStroke 2px` + `paintOrder: "stroke fill"`; active word in accent
  yellow `#FFD52D`.
- Position interpolates on `split`: `marginBottom` 400 (full-screen mode,
  sits on the chest below the chin) → 920 (split mode, rides the seam).
  Each caption page computes `split` from its **absolute** frame:
  `absFrame = round(page.startMs / 1000 * fps) + localFrame` — inside a
  Sequence, `useCurrentFrame()` is local.
- Filter out whisper noise tokens containing `[` (e.g. `[BLANK_AUDIO]`).

## B-roll in the panel

`objectFit: "cover"` on `@remotion/media`'s `<Video>` letterboxes instead of
covering (the underlying element ignores it). Size explicitly: for 16:9 clips
in the 1080×960 panel, `width = ceil(960 * 16/9) = 1707`, `height = 960`,
`left = (1080 - 1707) / 2`. Mute b-roll. Darken the bottom 260px with a
gradient and center a label pill (dark bg, `borderRadius: 999`, uppercase
Montserrat 800, 40px) at `bottom: 44`.

## Custom graphic cards

Centered in the panel (`justifyContent/alignItems: center`), width ≤ 980:

- Card: `rgba(10,12,24,0.88)` bg, 36px radius, 3px `rgba(255,255,255,0.14)`
  border, `0 24px 60px rgba(0,0,0,0.55)` shadow.
- Small-caps accent-colored kicker (30px, letterSpacing 6) as the card title.
- Palette: purple `#A78BFA`, cyan `#22D3EE`, green `#34D399`, amber `#FBBF24`,
  red `#F87171`; accent yellow `#FFD52D`.
- Stagger inner elements ~7–20 frames apart; pops use
  `Easing.bezier(0.34, 1.56, 0.64, 1)` (overshoot), slides use
  `Easing.bezier(0.22, 1, 0.36, 1)`.
- Patterns that worked: token chips splitting/reassembling, tiered rows with
  animated capability bars, count-up shock stats ($20 → ~$200), rising price
  bars, closing text callout.

## Assembly gotchas

- `premountFor={sec(1)}` on every overlay `<Sequence>` so videos preload.
- Elements keep their own enter/exit fades; the panel slide handles the rest.
- Merge overlay windows with gaps <1.5s into one `SPLIT_WINDOWS` entry, and
  extend element durations to cover the merged window so the open panel is
  never empty.
- Progress bar: 12px accent bar at the very top, width 0→100% linear.
- All animation via `useCurrentFrame()` + `interpolate` with clamping — never
  CSS transitions.
