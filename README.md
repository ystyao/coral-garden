# The Coral Garden ◈ 珊瑚花园

> A contemplative Three.js web installation where Oura Ring biometric data
> grows a 30-day underwater coral reef — one cluster per day, each species
> mapped to one dimension of the body.

![Hero screenshot placeholder — drop a wide garden screenshot at assets/screenshots/hero.png](assets/screenshots/hero.png)

---

## Table of Contents

- [Description](#description)
- [Target Audience](#target-audience)
- [Motivation](#motivation)
- [Human-Centered Design Analysis](#human-centered-design-analysis)
- [Installation](#installation)
- [Usage](#usage)
- [License](#license)
- [Acknowledgments](#acknowledgments)
- [Roadmap](#roadmap)

---

## Description

The Coral Garden turns thirty days of Oura Ring biometric data into a
walkable underwater scene. Each day is rendered as a small cluster of seven
corals on the sand; each of the seven coral species is bound to one
physiological dimension of the body (sleep, HRV, resting heart rate,
activity, deep sleep, body temperature, respiratory rate). As your daily
readings shift, the corals grow, shrink, and change colour; over time the
river-bed reads as a soft ledger of your recent weeks.

Two ritual objects sit in the scene:

- **The Hokora shrine** at the downstream end of the river. Clicking it
  draws a daily *omikuji* — a 7-rank Japanese fortune rendered as a classical
  5-character quatrain (五言絕句) in a rice-paper modal. The rank is derived
  from yesterday's readiness score; the poem is generated live by the Claude
  Sonnet API and falls back to a local poem library when offline.
- **A drifting bottle** rests in the sand beside every cluster. Today's
  bottle glows and can be written in; past bottles are sealed and can be
  read but not edited. The act of writing triggers a Claude-powered
  "resonance" analysis that compares the message's emotional tone against
  the body's signals and offers a one-line observation.

A **night mode** toggle in the top-left reveals a bioluminescent **jellyfish
lantern** on the sand beside the shrine. Clicking the lantern opens a
speech-bubble sticky-note containing a tender English *Sleep Guide* and a
short *Deep-Sea Bedtime Tale*, both generated from the day's biometrics.

### Key Features

| Feature | Summary |
|---------|---------|
| **Data-driven coral growth** | All 7 species vary simultaneously in scale + colour from your real Oura readings; cluster size also scales with readiness |
| **Live Oura integration** | Per-day auto-sync after 9 AM via local dev-proxy (works around Oura's browser CORS) |
| **Ritualised AI generation** | Claude Sonnet writes the daily omikuji poem, the sleep guide, the bedtime tale, and the bottle-resonance observation |
| **Interactive 3D scene** | Three.js with custom camera, fish schools (InstancedMesh + flocking), water particles, god-rays, and time-of-day lighting |
| **Contemplative UI** | Low-saturation palette, no social actions, no emoji, no dashboards — every surface is either a metaphoric object or a quiet HUD |
| **Local-first** | All data (Oura sync, bottles, omikuji cache) in browser storage; works offline once loaded |

---

## Target Audience

**Primary** — Reviewers of the Multimedia Web Design final project
(instructors, peers). The garden is intended to be experienced in a
five-to-fifteen-minute sitting at a desk browser.

**Secondary**

- Individuals who already track biometrics (Oura, Whoop, Apple Watch) and
  feel that dashboard visualisations fail to capture the temporal weight of
  their body's data.
- Designers and researchers working in biometric visualisation,
  contemplative computing, and East-Asian digital aesthetics.
- Artists interested in generative text (Claude API) grounded in personal
  physiological signals.

**Context of use.** The garden is not a fitness tool. It is closer to an
aquarium you keep on one monitor while doing something else — a slow,
peripheral reflection of the body rather than an actionable read-out. It
rewards return visits: the omikuji refreshes daily, the bottle invites
writing once a day, and the reef ages at the pace of life.

---

## Motivation

Quantified-self tools are almost always rendered as **dashboards**: bar
charts, trend lines, deltas, percentages. The underlying assumption is that
the user wants to read their body as management data — to *act on* it,
optimise it, correct it. This framing has three quiet costs:

1. **No temporal weight.** Today's readings sit next to yesterday's on the
   same chart with no ritual distinction. A bad sleep score is just a lower
   bar.
2. **No memorial grammar.** There is no form for *keeping* what the body
   already said. Yesterday's HRV is just gone.
3. **No stillness.** The dashboard nudges you toward action. There is no
   surface for sitting with the body's signals without doing anything about
   them.

The Coral Garden is an attempt at an alternative grammar, borrowing from
East-Asian memorial objects (the roadside *Hokora* shrine, the fortune
slip drawn once a day, the drifting bottle as a form of letter) and from
the deep-sea reef as a metaphor for accumulating body memory. Every day's
readings become a small, fixed artifact — a coral cluster — that will
still be on the reef a month from now, whether you look at it or not.

### Research Questions

- **Can biometric data be rendered as a contemplative artifact without
  suppressing its information content?** The garden still encodes every
  Oura field — scale, colour, pulse rate, cluster size are all tied to
  numeric data — but none of the numbers are shown in the main scene.
  (A reference panel is available in the top-right, but the reef itself
  speaks in shape and colour only.)
- **What does a "body ledger" look like if you take the
  immutability-of-the-past principle seriously?** In the Coral Garden, a
  sealed past bottle cannot be rewritten; yesterday's corals cannot be
  re-coloured. The UI enforces this as a hard constraint rather than a
  soft guideline.
- **Can a large language model hold the role of a shrine voice without
  collapsing into a chatbot?** The Claude integration is deliberately
  structured around three ritual slots (fortune poem, sleep guide, bedtime
  tale). None of them is a free-text conversation; each returns a single
  short piece of text in a fixed form.

---

## Human-Centered Design Analysis

This project applies Don Norman's HCD principles deliberately. The reef
is a 3D scene with very few controls; everything the user can do is
implied by an object in the world rather than a button in a toolbar.

### Affordances

Things the garden invites the user to do:

- **The scene itself** — orbit-dragging and scroll-zooming afford
  exploration. The camera's default framing places Hokora centrally,
  implying "there is a main object here."
- **The shrine (Hokora)** — a 3D model at the end of the river with a
  floating "Today" label at its eave. It affords clicking; the raycaster
  treats every mesh under `fossilGroup` as a click target.
- **The bottles** — one glass-and-cork bottle beside every cluster.
  Today's bottle is marked by a subtle warm glow (via `resonance` material
  tint), affording "this one is yours to write in."
- **The jellyfish lantern** — appears only in night mode, on the sand to
  the right of the shrine. It breathes and drifts, affording interaction.
- **The bio-panel buttons** (top-right) — `◈ REFRESH FROM OURA`,
  `◈ INTERACTION GUIDE`, `◈ CORAL MAPPING` — visible only when relevant;
  they afford specific actions (sync, read, learn).
- **The night-mode button** (top-left, under the clock) — toggles
  between day and night lighting; active state is indicated by colour shift.

### Anti-affordances

Things the garden deliberately refuses to offer:

- **Past bottles are read-only.** A sealed bottle from April 15 cannot be
  reopened and edited. The interaction guide explains the rule; the UI
  enforces it (`.bottle-reader.locked` hides the Edit button). This is
  the HCD equivalent of "we chose not to make this clickable."
- **Coral clusters cannot be selected or dragged.** Corals are not UI
  widgets; they are ledger entries. The only coral interaction is visual
  (they grow and change colour based on data).
- **No "delete today's omikuji" or "roll again."** One reading per day,
  cached by date. This anti-affordance is load-bearing: it protects the
  object from becoming a slot machine.
- **Body data is not editable.** The bio-panel shows numbers but gives
  no input field. Numbers change because the body changed, not because
  the user wanted them to.

### Constraints

- **Data integrity constraint**: `mergeOuraWithMockFill()` guarantees the
  reef is always 30 days, so the ritual structure (monthly ledger) is
  preserved even when Oura hasn't synced a given day. Missing days are
  quietly filled with mock data but surfaced with a red warning
  (`yesterday not yet synced · click refresh`) rather than hidden.
- **Temporal constraint**: Today's bottle can be edited within the day
  and then seals at local midnight. This encodes "the body writes the
  day, then the day ends" as a UI rule.
- **Species-to-metric binding**: The seven coral species are hard-wired
  to seven metrics (Favia ↔ Sleep, Xenia ↔ RHR, etc.). Users cannot
  reassign. This preserves the reef's narrative consistency across visits.
- **Cultural constraint**: The interior of the shrine enshrines a
  megalodon tooth (not a traditional Shinto *go-shintai*). This is a
  deliberate departure from literal Shinto representation, marking the
  object as a work of fiction rather than a cultural appropriation.

### Signifiers

- The **Hokora's size and isolation** at the river-mouth signify "this is
  the destination." It's the largest object in the scene and the camera
  default frames it.
- **"Today" label** above the shrine's right eave signifies "this is the
  present-tense object."
- **A small cluster with a soft glow** beside you when viewing signifies
  "today's bottle is here, and it's still open."
- **Cursor change to pointer on hover** over shrine, bottle, and lantern
  signifies clickability (standard browser affordance).
- **Hover tooltip** (black rounded rectangle) appears on hover, giving a
  one-line English summary of what the object does — this doubles as a
  *signifier* and a *help system*.
- **Scallop-ridged lantern bell with radial bright specks** signifies
  "this is a living thing, not static scenery" — its motion invites touch.
- **Progress bar during loading** (`growing the reef · 3 / 7 · favia`)
  signifies the system is alive and doing work, not stuck.

### Visual, Spatial, Interactive Cues

- **Spatial narrative**: the river flows from upstream (oldest, far end
  of the scene) to downstream (today, near the camera). Time is encoded
  as *space walked*.
- **Colour as data** (not decoration): each coral's colour sits on a two-
  colour gradient keyed to its metric. A pale sage-teal Favia means a
  below-median sleep score; a honey-yellow Favia means above-median.
  The user learns to read the reef over a few visits.
- **Ambient motion**: Xenia pulses at RHR ÷ 60 Hz (so the centre of each
  cluster literally beats at yesterday's heart rate); soft corals sway with
  decorrelated phases to read as water, not a metronome.
- **Day/night lighting** is a global signifier. Night mode not only
  darkens the sky but also reveals the jellyfish lantern — the mode and
  the affordance are bound.

### System Responses & Feedback

- **Sync feedback** — the bio-panel's source indicator changes colour
  and text (`auto-synced · 09:14` in jade green; `yesterday not yet
  synced · click refresh` in coral red). Users know whether they are
  looking at real Oura data or mock fallback.
- **Click feedback** — every clickable object opens a modal with a
  consistent cubic-bezier scale-in animation. The page content blurs and
  dims behind (`body.focus-mode`) so the user's attention is pulled into
  the modal.
- **Writing feedback** — the bottle writer's live character counter and
  "Reseal the bottle" button text differentiate first-write from edit
  mode.
- **Generative feedback** — when the omikuji or lantern whisper is
  loading from Claude, a "The lantern is listening to your body…"
  placeholder appears before content; the modal does not look frozen.
- **Ambient feedback** — the shrine's inner PointLight gently pulses
  (0.8 Hz), the jellyfish lantern's core breathes (0.9 Hz), the fish
  flock flows along the river. These are not goal-directed; they communicate
  *the world is still alive* between user actions.

### Feedback Loops

The primary loop is **daily**: the body generates a night's Oura reading
→ Coral Garden renders it into a cluster + omikuji + lantern whisper →
the user sits with the reef the next day → the user's actions feed back
into the body → the next night's Oura reading closes the loop. The garden
is explicitly designed to be *slow* — most of its information value only
appears over a month of use, not a single session.

A secondary loop is **within-day**: the bottle can be reopened and added
to any number of times before local midnight. The feedback is temporal:
"this ritual is still available to you, but only until the day ends."

---

## Installation

### Prerequisites

- **Node.js ≥ 18** (for `npx serve` / dev proxy; Node 20+ recommended)
- **Modern browser**: Chrome 120+, Edge 120+, Firefox 120+, Safari 17+
  (requires WebGL2, CSS `aspect-ratio`, ES module import, `clip-path`,
  `backdrop-filter`)
- **Biometric data**: the public build reads from a deterministic Oura
  simulator (`src/data/ouraSimulator.js`) tuned to the author's real
  baselines — no token needed. The live client (`src/data/ouraClient.js`)
  is kept in the repo for reference but is not imported by `index.html`.
- **Optional**: An Anthropic API key for live-generated omikuji poems,
  lantern guides and bottle resonance. It stays server-side (the
  `/api/claude` function); without it the garden falls back to bundled
  templates.

### Setup

```bash
# 1. Clone the repository
git clone https://github.com/<your-username>/coral-garden.git
cd coral-garden

# 2. (Optional) Compress the provided GLB models if you don't want to ship
#    the raw files. They are already pre-compressed in assets/models/.
#    See the Compression section below.
```

### Running Locally

```bash
npm install
cp .env.example .env.local     # then paste your key into ANTHROPIC_API_KEY
npm run dev
# Serves on http://localhost:3000 and runs /api/claude locally
```

Open **http://localhost:3000** in a modern browser. On first visit the
garden will spend a few seconds loading the 7 coral GLBs (you'll see
`growing the reef · 3 / 7 · favia` etc. on the loading screen).

### Deploying to Vercel

The site is fully static — no build step.

1. Push to GitHub, then in Vercel choose **Add New → Project** and import
   the repository.
2. Framework preset: **Other**. Leave build command and output directory
   empty (root is served as-is).
3. Under **Settings → Environment Variables**, add `ANTHROPIC_API_KEY`
   (and optionally `CLAUDE_MODEL`), then deploy. `vercel.json` adds a
   week-long cache header for the GLB models.
4. Set a monthly spend limit for the key in the Anthropic Console — the
   endpoint only accepts the garden's three tasks from the same origin,
   but it is still a public URL.

Every visitor sees the same simulated Oura series: each date's reading is
a pure function of that date, so past days never change and omikuji
signatures stay stable. Poems, guides and resonance are generated by
Claude through `api/claude.js`; if the key is missing or the call fails,
the bundled bank is used and the draw is not cached, so the next draw
retries.

### GLB Compression (if you need to re-compress source models)

```bash
# For each coral:
npx @gltf-transform/cli@latest optimize \
  assets/<name>.glb assets/models/<name>.glb \
  --compress meshopt --texture-compress webp \
  --texture-size 1024 --simplify-ratio 0.4

# For xenia specifically (the large one):
npx @gltf-transform/cli@latest optimize \
  assets/xenia.glb assets/models/xenia.glb \
  --compress meshopt --texture-compress webp \
  --texture-size 512 --simplify-ratio 0.2
```

Compressed targets: each coral ≤ 12 MB, total scene ≤ 40 MB after the
full 7-species + Hokora load.

---

## Usage

### First-Time Walkthrough

1. **Scene loads** — you see a slow breathing `◈` symbol with
   `growing the reef · N / 7 · <species>` below. This is the GLB preload.
2. **Cinematic intro** — on your first visit of the day, the camera
   starts tight on the shrine and pulls slowly back over ~6 seconds.
   You can click and drag at any point to interrupt.
3. **Default view** — camera faces the Hokora shrine from across the
   river-mouth. Thirty coral clusters stretch upstream along an S-shaped
   channel.

### Navigation

| Input | Action |
|-------|--------|
| **Left-drag** | Orbit camera around the focal point |
| **Scroll wheel** | Zoom in / out (clamped 2.5–22 m) |
| **Right-drag** | Pan camera (keeps current target) |
| **WASD / Arrow keys** | Pan camera horizontally |
| **On-screen arrow pad** (bottom centre) | Same as keyboard pan — useful on mouse-only |
| **`⊙` centre button** | Reset to default framing |
| **Double-click cluster** | Dive down to that cluster |
| **Double-click empty water** | Zoom back out to default view |

### Ritual Objects

- **Click the Hokora** to draw today's omikuji. A rice-paper modal slides
  in. The rank (大吉 down to 大凶) is printed in Ma Shan Zheng brush script;
  the poem's four lines are typeset vertically right-to-left; the English
  gloss and English date sit in the leftmost column. The `Rank Guide`
  button in the footer reveals the full score→rank mapping.
- **Click any bottle** to read or write. Today's bottle opens into the
  Writer with an empty text area; past bottles open into the Reader and
  are locked. The Writer supports three modes: *Today*, *Retroactive* (for
  days you missed), and *Edit* (add to today's already-sealed bottle).
- **Click `☾ NIGHT MODE`** (top-left, under the Garden Time panel) to
  toggle night. The jellyfish lantern fades in beside the shrine. Click
  the lantern for *Lantern's Whisper* — a Sleep Guide and Bedtime Tale
  generated live from the day's biometrics. Both are English prose.

### Bio Panel (top-right)

Shows yesterday's seven biometric readings from the simulated Oura
reading. `◈ SYNC OURA · SIMULATED` re-reads the simulator (it only
changes anything after midnight, when a new day enters the reef).

### Screenshots

```
assets/screenshots/
├── hero.png               wide shot of the 30-day garden
├── shrine-detail.png      Hokora close-up with the "Today" label
├── omikuji-modal.png      omikuji modal with a sample poem
├── night-mode.png         lantern glowing on the sand
├── lantern-whisper.png    speech-bubble modal with sleep guide + tale
├── bottle-writer.png      ruled-paper bottle writing interface
└── bio-panel.png          top-right panel showing yesterday's data
```

(Drop your own captures here; file names are referenced above.)

---

## License

This project is released under the **MIT License**. See
[`LICENSE`](LICENSE) for full terms.

Brief: you may use, copy, modify, and distribute the software freely, but
the original copyright notice and the MIT licence text must be included
with any substantial portion of the source.

Third-party asset note: the seven coral GLB files in `assets/` were
downloaded under their respective CC-0 / CC-BY licences from Sketchfab
and similar sources. Check the `assets/LICENSES.md` file (if present) or
the originating pages before redistributing.

---

## Acknowledgments

### Technologies

| Layer | Library / Service | Version |
|-------|-------------------|---------|
| 3D rendering | [Three.js](https://threejs.org) | r160 |
| Module system | Native ES modules via `<script type="module">` + CDN importmap | — |
| GLB loading | `three/addons/loaders/GLTFLoader.js` + `MeshoptDecoder` | with r160 |
| GLB compression | [@gltf-transform/cli](https://gltf-transform.dev) | 4.3+ |
| Generative text | [Claude Sonnet API](https://anthropic.com/claude) | `claude-sonnet-4-20250514` |
| Biometric data | [Oura API v2](https://cloud.ouraring.com/v2/docs) | — |
| Local storage | Browser `localStorage` + custom adapter | — |
| Dev server | `serve` via `npx`; custom Node CORS proxy | Node 18+ |
| Fonts (via Google Fonts) | Cormorant Garamond, Ma Shan Zheng, ZCOOL XiaoWei, Noto Serif SC, Caveat | — |

No build system is used. The project is a hand-written single `index.html`
plus `src/data/ouraClient.js`; no TypeScript, no bundler, no framework.

### Inspirations

- **Hokora (祠)** roadside shrines in Japan and the Shiota Hachiman-gu
  shrine in Kobe, Hyogo — primary visual reference for the 3D shrine
  model.
- **Omikuji (御神籤)** fortune paper slips — the 7-rank structure,
  vertical poetry typesetting, and black-box rank header are drawn
  directly from traditional printed omikuji.
- **Coral reefs as accumulated memory** — the metaphor of a reef as
  "solid biography" is inspired by both marine biology popular
  writing and East Asian landscape scrolls.
- **Bioluminescent jellyfish** — the lantern's interior specks + radial
  vein structure are modelled on photographs of *Aequorea victoria* and
  generic crystal-jellyfish bioluminescence.
- **Design framing** — Don Norman's *The Design of Everyday Things*
  (affordances / signifiers / constraints / feedback), Alan Cooper's
  *About Face* (modal dialogues as ritual surfaces), and
  *contemplative computing* writing by David Levy and Mihaly Csikszentmihalyi
  on technology-as-stillness.

### Related Projects

- [Oura API docs](https://cloud.ouraring.com/v2/docs) — the upstream
  data source.
- [Claude Sonnet API](https://anthropic.com/claude) — used for poem,
  sleep-guide, and bedtime-tale generation.
- [Three.js examples](https://threejs.org/examples) — baseline patterns
  for InstancedMesh flocking, shader water, and god rays.

---

## Roadmap

### P0 · Nearly complete

- [x] Compress Hokora GLB to < 5 MB and replace the procedural shrine
- [x] Acquire and compress 7 coral GLB models
- [x] Write `coralLoader` (GLB load + cache + clone with wrapper pattern)
- [x] Rewrite `buildDayCluster` to use 7 GLB species on a ring layout
- [x] Loading progress bar
- [x] Oura PAT integration with daily auto-sync
- [x] Dev CORS proxy for browser → Oura
- [x] Night mode + jellyfish lantern + Claude-generated sleep guide + bedtime tale
- [ ] Migrate from single-file `index.html` to a Vite project (in progress; only
  `src/data/ouraClient.js` is currently split out)

### P1 · Important

- [ ] **Oura OAuth** end-to-end for multi-user deployments (requires a
  server-side token-exchange endpoint, probably Vercel Functions)
- [ ] **Live time-of-day lighting** — remove the `FORCE_NOON` flag so the
  scene actually tracks the user's local clock through its 6-phase
  lighting schedule
- [ ] **IndexedDB migration** for bottles + omikuji cache to lift the 5–10 MB
  localStorage ceiling
- [ ] **Claude API proxy** so the Anthropic key doesn't ship with the
  client bundle
- [ ] **Resonance improvement** — richer bottle-resonance analysis (tone,
  length, time-of-day correlation with body state)

### P2 · Polish

- [ ] PWA offline shell (so a first-time visitor can open the garden
  even while offline, with cached data)
- [ ] Ambient ocean audio (slow, low-volume current sound; toggle-able
  in Interaction Guide)
- [ ] Save omikuji as image ("album" metaphor, not "share")
- [x] Deploy to Vercel (simulated Oura data)
- [ ] Lunar date display option beside the Gregorian date
- [ ] Bio-panel numbers → micro-visualisations (a tiny heartbeat line for
  RHR, a thin wave for respiration, etc.) so it reads as "sensed data"
  rather than "read-out data"

### P3 · Long-term

- [ ] Multi-user support — mentors, friends, partners maintain their own
  reefs; cross-reef visiting with clear permission model
- [ ] Annual timeline — scroll across a 365-day reef instead of a
  rolling 30-day window
- [ ] Export a month as a single printable scroll (long vertical image,
  printed on rice paper for an exhibition copy)

---

*The Coral Garden was built by Lorriane as the final project for the
Multimedia Web Design course. Contributions, issues, and pull requests are
welcome — particularly from anyone with strong feelings about the
appropriate low-saturation colour of a traumatised fire coral.*
