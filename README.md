# Turn Talking-Head Videos into Instagram Reels with Claude Code

*One-time setup takes ~15 minutes. After that, each video is a single prompt.*

This repo contains everything you need:

- **This README** — the step-by-step setup guide
- **[`top-bottom-split-screen.skill`](top-bottom-split-screen.skill)** — the
  Instagram split-screen skill, packaged for install (download it in Step 4)
- **[`skills/top-bottom-split-screen/`](skills/top-bottom-split-screen/)** —
  the same skill's source, if you want to read or customize how it works

The result: give Claude a talking-head clip, and it transcribes it, adds
stock b-roll, animated text graphics, and word-by-word captions in a
split-screen layout that never covers your face — then renders a
ready-to-post 1080×1920 Reel.

---

## ⚠️ First: where do I type all of this?

**Everything in this guide happens in the Terminal app on your Mac** (find it
with Spotlight: press ⌘-Space, type "Terminal", hit Enter). None of this goes
into the claude.ai website or the regular Claude chat app.

- Lines shown in `code boxes` below are commands — copy-paste them into
  Terminal and press Enter.
- Later, when you talk to Claude Code itself, that ALSO happens in Terminal
  (or in the **Claude Code desktop app**, which you can download from
  [claude.com/claude-code](https://claude.com/claude-code) if you'd rather
  not live in Terminal — same thing, friendlier window).

## Step 1 — Prerequisites (in Terminal)

```bash
# Install Homebrew first if you don't have it — instructions at https://brew.sh
brew install node ffmpeg
```

You'll also need a Claude Pro or Max subscription (from claude.ai).

## Step 2 — Install Claude Code (in Terminal)

```bash
npm install -g @anthropic-ai/claude-code
```

Then type `claude` in Terminal and press Enter — a sign-in link appears;
log in with your Claude account. You now have an AI agent running inside
your Terminal.

## Step 3 — Create your video project (in Terminal)

Type `exit` to leave Claude if it's running, then:

```bash
npx create-video@latest --yes --blank --no-tailwind my-video
cd my-video
```

This `my-video` folder is where you'll return every time you make a video.

## Step 4 — Install the two skills (in Terminal)

**Remotion's official skill** (teaches Claude the video framework):

```bash
npx skills add remotion-dev/skills
```

**The Instagram split-screen skill** — download
[`top-bottom-split-screen.skill`](top-bottom-split-screen.skill) from this
repo (click it, then the download button) so it lands in your Downloads
folder, then:

```bash
mkdir -p ~/.claude/skills
unzip ~/Downloads/top-bottom-split-screen.skill -d ~/.claude/skills/
```

(If you're using the Claude Code desktop app instead, you can just open the
.skill file and click **Save skill**.)

## Step 5 — Make your first Reel (talking to Claude, in Terminal)

Record a talking-head video on your phone and save it somewhere easy, like
Downloads. Then, in Terminal, from inside the `my-video` folder:

```bash
claude
```

Now you're chatting with Claude — this is where prompts go. Type:

> Use the top-bottom split screen skill to turn ~/Downloads/my-clip.mp4
> into an Instagram Reel.

(Replace `my-clip.mp4` with your actual file name.) Claude will ask
permission before running commands — approve them. The first run takes
~30 minutes (it downloads a speech-to-text model and renders the video);
later runs are faster. Your finished Reel lands in the `out/` folder inside
`my-video`.

## Tips

- **Everything is synced to what you say** — Claude reads the transcript and
  times graphics to your words. Clear audio = better results.
- **Review before rendering**: Claude shows you preview frames. If something
  looks off, just tell it in plain English ("make the title bigger",
  "use different stock footage for the money part").
- **Iterate cheaply**: after the first render, you can tweak text, timing,
  or colors with one sentence.
- **Coming back later?** Open Terminal, type `cd my-video`, then `claude`,
  and prompt away.
- Docs: [remotion.dev/docs/ai/skills](https://www.remotion.dev/docs/ai/skills)
  · [Claude Code docs](https://docs.anthropic.com/en/docs/claude-code)
