# Korean Fast Track — 한국어, the useful kind

A Korean-learning web app built around one promise: **order food, run a convenience-store
conversation, follow a K-drama, and catch the words in a song.** Not a textbook — the ordering comes
from real subtitle frequency data and from the coverage thresholds that research on second-language
listening actually supports.

Stack: **Vite + React 19 + TypeScript**, static build on **Netlify**, one **Netlify Function** writing
your progress to **Netlify Blobs** (key-value store).

---

## Screenshots

`screenshots/01-plan.png` · `02-hangul.png` · `03-review.png` · `04-cafe.png` · `05-drama.png` ·
`06-songs.png` · `07-decoder.png` · `08-progress.png`

## What is in it

| Tab | What it does |
| --- | --- |
| **Plan** | The method with sources: frequency-first vocabulary, comprehensible input, FSRS scheduling, subtitle laddering, early output. 90-day plan, hour milestones, study timers. |
| **Review** | FSRS-6 spaced repetition. Three card modes per item (read → understand, listen → understand, English → Korean), keyboard driven (`space` reveals, `1–4` grade). |
| **Hangul Lab** | Jamo tables with audio, a syllable builder showing 초성/중성/종성 decomposition, the eight 받침 sound-change rules, and a timed reading drill. |
| **Situations** | Ten real scenarios — café, restaurant, convenience store, clothes shop, taxi, subway, pharmacy, delivery phone call, small talk, problems — as dialogues you can play, shadow, or practise by hiding your own lines. |
| **Drama** | ~110 lines grouped by function (reacting, worry, anger, romance, phone, daily requests, glue, idioms), each with the 반말 form you hear on screen and the polite twin you say, plus a shadowing player. |
| **Songs** | Ten rules of song Korean (contractions, inner-voice endings, dropped subjects), a verified title list broken into vocabulary, a love-song word pack, and a listening method. |
| **Decoder** | Paste any Korean — subtitle, lyric, sign, message — and get tokens split into words / grammar endings / unknowns, Revised-Romanisation, speech-level detection and a coverage score. Unknown words drop straight into your review deck. |
| **Deck** | Browse, search and filter all ~960 items, hide what you know, mine your own lines and write in their glosses. |
| **Progress** | Retention, reviews per day, study hours, coverage estimate against the 95%/98% lexical bands, leech list, cloud sync panel, settings, JSON export. |

Deck contents: **424 hand-glossed core words**, **39 grammar patterns** with examples,
**150 subtitle-glue words** drawn from real subtitle frequencies, **~110 drama lines**,
**10 scenarios**, song modules and a **verified song-title list**. Example sentences come from the
[Tatoeba](https://tatoeba.org) corpus (CC BY 2.0 FR) where a natural one exists.

## Design decisions worth knowing

- **Frequency first.** Deck order is study order: words → grammar → subtitle glue → drama →
  situations → songs. Spoken Korean is extremely concentrated, so the first few hundred items buy most
  of the comprehension (the research is linked inside the app on the Plan tab).
- **Speak 해요체, decode everything.** Polite and casual forms sit side by side everywhere: you speak
  one register for three months and *understand* all three.
- **A real scheduler, not a fake one.** `src/lib/fsrs.ts` implements the FSRS-6 power forgetting curve
  with the published default parameters and decay constant, plus learning/relearning steps and interval
  previews printed on the grade buttons.
- **Offline-capable.** Progress lives in `localStorage` first and mirrors to Netlify Blobs at most every
  20 s; conflicts merge per card by latest review. No accounts, no email, no PII — just a short sync
  code you can type on another device.
- **No copyrighted lyrics.** The Decoder runs on text *you* paste; the app ships grammar rules,
  vocabulary and verified titles instead of lyric text.
- **Audio** uses the browser's built-in Korean voice (SpeechSynthesis, `ko-KR`): no audio files to host,
  every sentence playable, speed controllable for shadowing.

## Running locally

```bash
npm install
npm run dev                # app on http://localhost:5173
npm run api:dev            # optional local stand-in for the Netlify Function (port 8787)
npm run build              # type-check + production build into dist/
npm run test:api           # unit-tests the function contract against a fake Blobs store
```

`vite.config.ts` proxies `/api` to `http://localhost:8787` in dev, so the sync buttons work offline.

## Deploying to Netlify (GitHub integration)

1. Push this repository to GitHub.
2. Netlify → **Add new site → Import an existing project → GitHub → pick the repo.**
3. Build command `npm run build`, publish directory `dist` (already in `netlify.toml`); the function in
   `netlify/functions/api.mjs` is picked up automatically.
4. Nothing else to configure — **Netlify Blobs needs no setup**: the function calls
   `getStore({ name: "korean-fast-track" })` and Netlify injects the store context at runtime.

API surface (single endpoint):

```
GET    /api/state?code=ABCDE-12345   → { code, state | null }
POST   /api/state?code=ABCDE-12345   → { ok, bytes, savedAt }      body: { state }
DELETE /api/state?code=ABCDE-12345   → { ok, deleted }
```

## Layout

```
src/data/                   content: words · grammar · glue · drama · scenarios · songs · plan + sources
src/lib/                    hangul (jamo + romaniser), fsrs (scheduler), decode (segmentation), speech, store, deck
src/views/                  one file per tab
src/components/ui.tsx       shared primitives
netlify/functions/api.mjs   progress store on Netlify Blobs
scripts/                    dev API shim + function tests
```

## Attribution

- Example sentences: [Tatoeba](https://tatoeba.org) — CC BY 2.0 FR.
- Subtitle frequency ordering: [FrequencyWords](https://github.com/hermitdave/FrequencyWords),
  derived from OpenSubtitles.
- Song titles validated against MusicBrainz and Korean Wikipedia.
- Research references are listed in-app on the Plan tab, each linked to its source.
