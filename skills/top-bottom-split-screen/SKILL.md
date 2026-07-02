---
name: top-bottom-split-screen
description: Turn a talking-head video into a polished vertical Instagram Reel (or TikTok/Shorts) using Remotion with Lance's top/bottom split-screen format — added elements (stock b-roll, text graphics, stat cards) slide into a top panel, the speaker's face slides to the bottom half where it is never covered, and word-highlighted captions ride the seam between the two. Use this skill whenever Lance asks to make a talking-head video more engaging, add b-roll / graphics / captions / stock footage to a clip, turn a video into an Instagram post or Reel, or mentions the split-screen video format. Trigger even for casual requests like "spice up this clip" or "make this video pop" when the input is a talking-head video.
---

# Top/Bottom Split-Screen Reel

Transforms a talking-head video into a 1080×1920 vertical reel. The core rule,
set by Lance after reviewing earlier drafts: **added elements never cover his
face.** Whenever an element is on screen, the layout animates into a split —
element in a top panel, face slid down into the bottom half, captions across
the center seam. When nothing is added, the face is full-screen and captions
sit low on the chest.

Also load the `remotion-best-practices` skill for Remotion API details.

## Workflow

### 1. Inspect the source video

```bash
ffprobe -v error -show_entries format=duration:stream=codec_type,width,height -of default=noprint_wrappers=1 <video>
```

Phone videos often arrive as a vertical clip pillarboxed inside a 1920×1080
landscape file. Detect the active region — you need it for the crop math:

```bash
ffmpeg -v info -ss 30 -i <video> -t 5 -vf cropdetect=24:16:0 -f null - 2>&1 | grep -o "crop=[0-9:]*" | sort | uniq -c | sort -rn | head -3
```

Also extract 2–3 frames (`ffmpeg -vf "select=..."`) and look at them: you must
know where the face sits vertically to position the bottom-half crop, and
whether the top/bottom of the frame is safe background.

### 2. Transcribe with word timestamps

Copy `scripts/transcribe.mts` into the project, adjust paths, and run it with
`npx tsx` **from inside the project** (module resolution fails outside it).
It installs whisper.cpp, transcribes with `small.en`, and writes a
`Caption[]` JSON to `public/<project>/captions.json`. Print the transcript as
timestamped sentences and read it — the whole edit hangs off what is said when.

### 3. Plan the overlay timeline

Map transcript moments to elements. Guidelines that worked:

- **Hook title** (0–5s): big question/promise text restating the topic.
- **Stock b-roll** for concrete actions the speaker mentions (typing, money,
  using an app). 4–7 seconds each, muted, trimmed to the interesting part.
- **Custom animated graphics** for numbers, comparisons, lists, and processes
  (price stats, tiered options, step-by-step visualizations). These land
  harder than generic stock — prefer them whenever the speech has structure.
- Keep the face full-screen for a healthy share of the runtime; overlays are
  seasoning, not the meal.
- Write the windows down in seconds; merge windows separated by <1.5s so the
  split doesn't flap open and closed.

### 4. Source stock b-roll

Coverr works without an API key (Pexels and Pixabay block scraping):

```bash
curl -s -A "Mozilla/5.0 ... Chrome/126.0 Safari/537.36" "https://coverr.co/s?q=<term>" -o page.html
grep -ohE 'https://cdn\.coverr\.co/videos/coverr-[a-z0-9-]+/1080p\.mp4' page.html | sort -u
```

Skip slugs containing `premium` (paid license), `temp`, or `user-ai-generation`
(unstable). Download candidates, extract a frame from each, and **look at
them** before committing — titles lie. Copy keepers to `public/<project>/broll/`.

### 5. Build the composition

Copy the files in `assets/` into `src/compositions/<project>/` and adapt:

- `constants.ts` — set duration, crop region from step 1, colors, and the
  `SPLIT_WINDOWS` schedule from step 3.
- `split.ts` — shared split progress; drives video, panel, and captions in
  lockstep. Usually needs no changes.
- `MainComposition.tsx` — the split layout shell; swap in your overlay
  sequences. Give every `<Sequence>` a `premountFor` so videos preload.
- `Captions.tsx`, `BrollCard.tsx`, `HookTitle.tsx`, `CardGraphic.tsx` —
  captions, full-bleed b-roll, hook, and the card pattern for custom graphics.

Read `references/design-spec.md` for the layout math, styling system, and the
gotchas (the objectFit letterbox bug, caption/face clearance) before writing
custom graphics. Register the composition in `Root.tsx` at 1080×1920.

### 6. Verify with still renders

```bash
npx remotion still <CompId> --scale=0.4 --frame=<n> out.png
```

Render and *look at* stills covering: the hook, each graphic, a b-roll window,
a mid-transition frame, and a no-overlay frame. Check the face is fully
visible in every one, captions don't touch it, and b-roll fills the panel
edge-to-edge. Fix and re-render stills until clean.

### 7. Render and deliver

```bash
npx remotion render <CompId> out/<name>.mp4
```

Run in the background (a 3-minute reel takes ~15 minutes), verify the output
with ffprobe + extracted frames, then send the file to Lance.
