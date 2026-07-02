// TEMPLATE — word-level transcription for caption overlays.
// 1. Copy into the Remotion project (e.g. scripts/transcribe.mts) — running
//    it from outside the project breaks module resolution.
// 2. npm install @remotion/install-whisper-cpp (match the project's remotion version)
// 3. Extract 16kHz mono audio first:
//    ffmpeg -y -i <source-video> -ar 16000 -ac 1 <AUDIO_WAV>
// 4. npx tsx scripts/transcribe.mts   (first run downloads ~500MB model; run
//    in the background — whisper takes a few minutes for a 3-minute clip)
// 5. Delete this script afterwards or exclude it from tsc (top-level await
//    trips the project's typecheck).
import path from "path";
import fs from "fs";
import {
  downloadWhisperModel,
  installWhisperCpp,
  transcribe,
  toCaptions,
} from "@remotion/install-whisper-cpp";

// TODO: set these three paths.
const WHISPER_DIR = "/tmp/whisper.cpp"; // whisper install + model cache
const AUDIO_WAV = "/tmp/audio-16k.wav"; // 16kHz mono wav from step 3
const OUTPUT_JSON = "public/my-project/captions.json";

const to = path.resolve(WHISPER_DIR);

await installWhisperCpp({ to, version: "1.5.5" });
await downloadWhisperModel({ model: "small.en", folder: to });

const whisperCppOutput = await transcribe({
  model: "small.en",
  whisperPath: to,
  whisperCppVersion: "1.5.5",
  inputPath: path.resolve(AUDIO_WAV),
  tokenLevelTimestamps: true,
});

const { captions } = toCaptions({ whisperCppOutput });

fs.mkdirSync(path.dirname(OUTPUT_JSON), { recursive: true });
fs.writeFileSync(OUTPUT_JSON, JSON.stringify(captions, null, 2));
console.log(`Wrote ${captions.length} captions to ${OUTPUT_JSON}`);

// Print the transcript as timestamped sentences for overlay planning.
let line = "";
let lineStart = 0;
for (const cap of captions) {
  if (line === "") lineStart = cap.startMs;
  line += cap.text;
  if (/[.!?]$/.test(cap.text.trim()) || line.length > 90) {
    console.log(`${(lineStart / 1000).toFixed(1)}s: ${line.trim()}`);
    line = "";
  }
}
if (line) console.log(`${(lineStart / 1000).toFixed(1)}s: ${line.trim()}`);
