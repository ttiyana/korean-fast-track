// The method behind the app: what the research says, and the exact 90-day shape built on it.
export type Principle = { title: string; claim: string; why: string; do: string }
export type Phase = { id: string; name: string; weeks: string; minutes: number; focus: string[]; target: string }
export type Milestone = { hours: number; label: string; detail: string }

export const PRINCIPLES: Principle[] = [
  {
    title: "Learn to read Hangul first — it costs a day, not a year",
    claim: "Hangul has 24 basic letters, and every sound you will ever need is one of them.",
    why: "Every other step (subtitles, menus, song lyrics, signs) becomes available the moment reading clicks. Korean is unusual here: the writing system is genuinely learnable in an afternoon, so a phonetic alphabet is a shortcut nobody should skip.",
    do: "Do the Hangul Lab until the 4-minute reading drill stops being work. Target: one day, then touch it daily for a week.",
  },
  {
    title: "Follow frequency, not textbooks",
    claim: "A small number of items covers a huge share of everything you hear.",
    why: "The research on lexical coverage says roughly 3,000 word families gets you to about 95% of TV and film language, and 95–98% coverage is the threshold where listening and watching feel effortless. Spoken Korean is even more concentrated, because a handful of glued forms (거야, 게, 걸, 난) repeat endlessly.",
    do: "Work the deck in its fixed order: core words → grammar patterns → subtitle glue. Don't collect random vocabulary; let the frequency ordering decide.",
  },
  {
    title: "Maximise comprehensible input, but only just beyond your level",
    claim: "You acquire language by understanding messages, not by memorising rules (Krashen's i+1).",
    why: "Decades of evidence support input as the engine of acquisition — though the modern critique is that input alone is not enough: you also need retrieval practice and real interaction to cement it.",
    do: "Watch dramas with Korean subtitles on a show you already know. The rule: aim for about 80–95% understanding. Above that you're bored, below it you're drowning.",
  },
  {
    title: "Schedule every item or lose half of them",
    claim: "Spaced repetition is the difference between recognising a word and knowing it to the bone.",
    why: "Retention is a function of when you review, not how hard. This app runs the FSRS-6 scheduler: benchmarked across ~10,000 learners and ~350M reviews, it holds the same retention as the classic SM-2 algorithm with 20–30% fewer reviews — fewer hours for the same memory.",
    do: "Hit Review daily. It is better to do 10 minutes of due cards than an hour twice a week.",
  },
  {
    title: "Ladder your subtitles instead of choosing a side",
    claim: "Korean subs for listening, Korean + English for meaning, no subs for the final proof.",
    why: "Studies of dual subtitles and captioning point the same way: L1+L2 subtitles win for vocabulary, L2-only wins for listening. The order matters — captions are a scaffold, not a destination.",
    do: "Pass 1: Korean subs on, sound up. Pass 2: the lines you missed, decoded and saved to the deck. Pass 3: same scene, subtitles off.",
  },
  {
    title: "Mine sentences from real material, not word lists",
    claim: "Vocabulary that arrives inside a sentence you cared about is 2–3× more likely to stick.",
    why: "Sentence mining is the core of the immersion school (AJATT → MIA → Refold) and matches how memory works: retrieval with context, not bare definitions.",
    do: "Use the Decoder on any drama line or lyric you meet. It segments the line, glosses what the app knows and drops the unknowns straight into your review queue.",
  },
  {
    title: "Produce early and in small doses",
    claim: "Speaking 5 minutes a day beats a silent month of study.",
    why: "The critique of pure input is that comprehension can outrun production forever. Output forces retrieval and reveals the gaps — Korea's politeness system in particular only becomes real when you use it.",
    do: "Shadow the scenario dialogues out loud twice a day. Then talk to a real Korean: a language exchange partner or a tutor, twice a week from day 30.",
  },
  {
    title: "Plan for 2,200 hours, then steal 500 of them",
    claim: "The US Foreign Service Institute puts Korean in its hardest tier: ~88 weeks, 2,200 class hours for professional proficiency.",
    why: "That number is honest and also the wrong target. It is a classroom-hours figure for professional-level diplomats including reading and writing registers. For your goal — walk into a shop, order food, follow a drama — the first ~300 hours carry almost all the value.",
    do: "Track hours in the app. Aim for 60–90 minutes a day: 20 minutes of reviews, 30–60 minutes of real drama or song listening, a few minutes speaking.",
  },
  {
    title: "Say less, understand more, with the polite register",
    claim: "해요체 is the only register you need to speak for the first three months.",
    why: "Korean encodes hierarchy into grammar: 하십시오체 (formal), 해요체 (polite informal), 해체 (casual). Learning to *decode* all three and *speak* one well is faster and socially safer than learning all three badly.",
    do: "Speak 해요체 everywhere. In the Drama tab, read the 반말 column for understanding only — never to a stranger.",
  },
]

export const PHASES: Phase[] = [
  {
    id: "h1",
    name: "Phase 1 — Survival Korean",
    weeks: "Days 1–30",
    minutes: 60,
    focus: [
      "Hangul Lab daily until you read at ~1 syllable/second",
      "15 new words/day from the core deck (tier 1 only)",
      "The 10 scenario dialogues, out loud, both roles",
      "One drama episode a day with Korean subtitles, in 15-minute chunks",
    ],
    target: "Order food, buy anything, ask for directions, understand questions aimed at you. ~300 items known.",
  },
  {
    id: "h2",
    name: "Phase 2 — Everyday fluency",
    weeks: "Days 31–60",
    minutes: 75,
    focus: [
      "Second grammar wave: -는데, -잖아요, -거든요, -(으)려고, -기로 했어요",
      "Sentence mining: 5 lines a day from drama and lyrics through the Decoder",
      "Shadowing with the song player at 0.75× then 1.0×",
      "First live conversation: language partner or tutor, twice a week",
    ],
    target: "Follow an unscripted conversation on familiar topics, catch most of a drama scene without subtitles. ~900 items known.",
  },
  {
    id: "h3",
    name: "Phase 3 — Media fluency",
    weeks: "Days 61–90",
    minutes: 90,
    focus: [
      "Drama with Korean subtitles off; pause only for plot-critical lines",
      "10 song texts decoded per week; build your own lyrics deck",
      "TOPIK-style reading and listening practice if you want a certificate",
      "3× weekly speaking, plus writing your diary in Korean",
    ],
    target: "Watch a drama episode and follow it, sing along without looking up lines, hold a 10-minute conversation. ~1,800 items known.",
  },
]

export const MILESTONES: Milestone[] = [
  { hours: 20, label: "Reading unlocked", detail: "Hangul is automatic. Menus, signs and subtitles are decodable — slow but real." },
  { hours: 50, label: "Survival shop-and-order", detail: "You can run a café, convenience store and restaurant exchange without English." },
  { hours: 100, label: "The small-talk wall comes down", detail: "You understand the question before you understand your own answer. ~600 items." },
  { hours: 200, label: "Drama with subtitles (Korean)", detail: "~95% coverage of a familiar drama with Korean captions on, roughly 70% without them." },
  { hours: 300, label: "Half of K-drama, unassisted", detail: "You follow the plot and catch the emotional register, even when the slang escapes you." },
  { hours: 600, label: "Songs open up", detail: "Contractions and inner-voice endings are transparent; new songs only need one or two lookups." },
  { hours: 1200, label: "Comfortable media life", detail: "Dramas, variety shows and lyrics as entertainment, not study. Roughly half the FSI professional figure." },
]

export const DAILY = [
  { block: "5 min", what: "Due reviews first", why: "Scheduled cards decay fastest; clear the queue before anything new." },
  { block: "10 min", what: "New items", why: "10–20 new items a day is the sustainable ceiling for most learners." },
  { block: "10 min", what: "Reading or Hangul drill", why: "Speed of decoding is the real bottleneck of Korean listening." },
  { block: "20 min", what: "Drama or song, actively", why: "One scene fully decoded beats an hour of passive watching." },
  { block: "5 min", what: "Speak out loud", why: "Shadow the scenario lines; your mouth needs the reps your eyes already got." },
]
