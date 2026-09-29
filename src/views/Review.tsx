import { useEffect, useMemo, useRef, useState } from "react"
import { Btn, Ko, Panel, Pill, Bar } from "../components/ui"
import { romanize } from "../lib/hangul"
import { speak } from "../lib/speech"
import { newCard, schedule, previewIntervals, retrievability, formatInterval } from "../lib/fsrs"
import type { Grade, CardState } from "../lib/fsrs"
import { MODE_LABEL, kindLabel } from "../lib/deck"
import type { Card, CardMode, Item } from "../lib/deck"
import { dueSummary, todayKey, ensureDay } from "../lib/store"
import type { AppState } from "../lib/store"

type Props = {
  state: AppState
  setState: (fn: (s: AppState) => AppState) => void
  items: Item[]
  onMined: (ko: string, en: string, source: string) => void
}

type QueueEntry = { card: Card; item: Item }

export default function Review({ state, setState, items }: Props) {
  const [sessionStart] = useState(Date.now())
  const queueRef = useRef<QueueEntry[] | null>(null)
  const [index, setIndex] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [tally, setTally] = useState({ again: 0, hard: 0, good: 0, easy: 0, minutes: 0 })
  const [finished, setFinished] = useState(false)
  const [recycled, setRecycled] = useState(0)

  const byId = useMemo(() => new Map(items.map((i) => [i.id, i])), [items])

  function buildQueue(): QueueEntry[] {
    const s = dueSummary(state)
    const today = ensureDay(state, todayKey())
    const newAllowance = Math.max(0, state.settings.newPerDay - today.newItems)
    // New items appear first as recognition cards only — the listen/recall variants of an item
    // stay in the queue once its first card has graduated, so you never drill one word three times in a row.
    const newOnes = s.newCards.filter((c) => c.mode === "recognise").slice(0, newAllowance)
    const order: Card[] = [...s.learning, ...s.due, ...newOnes]
    const out: QueueEntry[] = []
    for (const c of order) {
      const item = byId.get(c.itemId)
      if (item) out.push({ card: c, item })
    }
    return out
  }

  if (queueRef.current === null) queueRef.current = buildQueue()
  const queue = queueRef.current
  const current = queue[index]
  const cardState: CardState = current ? state.cards[current.card.id] ?? newCard() : newCard()

  useEffect(() => {
    setRevealed(false)
    if (!current) return
    if (state.settings.autoSpeak && (current.card.mode === "listen" || current.card.mode === "recognise")) {
      window.setTimeout(() => speak(current.item.ko, { rate: current.card.mode === "listen" ? 0.85 : 0.95 }), 220)
    }
  }, [index, current, state.settings.autoSpeak])

  const previews = current ? previewIntervals(cardState) : null

  function grade(g: Grade) {
    if (!current) return
    const now = Date.now()
    const res = schedule(cardState, g, now)
    const day = todayKey()
    setState((s) => {
      const prev = ensureDay(s, day)
      const isNew = !s.cards[current.card.id] || s.cards[current.card.id].phase === "new"
      const streakOk = s.streak.lastDay !== day
      const days = {
        ...s.days,
        [day]: {
          reviewed: prev.reviewed + 1,
          correct: prev.correct + (g >= 3 ? 1 : 0),
          newItems: prev.newItems + (isNew ? 1 : 0),
          minutes: prev.minutes + Math.max(1, Math.round((now - sessionStart) / 60000 / 8)),
        },
      }
      const streak = streakOk
        ? {
            current: isYesterday(s.streak.lastDay, day) ? s.streak.current + 1 : 1,
            best: Math.max(s.streak.best, isYesterday(s.streak.lastDay, day) ? s.streak.current + 1 : 1),
            lastDay: day,
          }
        : s.streak
      return { ...s, cards: { ...s.cards, [current.card.id]: res.card }, days, streak, updatedAt: now }
    })
    setTally((t) => ({
      again: t.again + (g === 1 ? 1 : 0),
      hard: t.hard + (g === 2 ? 1 : 0),
      good: t.good + (g === 3 ? 1 : 0),
      easy: t.easy + (g === 4 ? 1 : 0),
      minutes: t.minutes,
    }))
    // Only a lapse re-enters this session immediately; Good/Hard wait out their 10-minute step.
    if (g === 1) {
      queueRef.current = [...(queueRef.current ?? []), current]
      setRecycled((r) => r + 1)
    }
    if (index + 1 >= (queueRef.current?.length ?? 0)) setFinished(true)
    else setIndex(index + 1)
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!current) return
      if (e.code === "Space" || e.code === "Enter") {
        e.preventDefault()
        if (!revealed) setRevealed(true)
        else grade(3)
        return
      }
      if (revealed && ["1", "2", "3", "4"].includes(e.key)) {
        grade(Number(e.key) as Grade)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  })

  if (queue.length === 0) {
    return (
      <div>
        <h1 className="h1">Reviews</h1>
        <div className="ok" style={{ marginTop: 12 }}>
          Nothing is due. That is the scheduler working — new cards are released at {state.settings.newPerDay}/day.
          Come back later, or go and watch something: the Drama tab feeds this queue.
        </div>
        <div className="row" style={{ marginTop: 16 }}>
          <Btn onClick={() => { queueRef.current = buildQueue(); setIndex(0); setFinished(false) }}>Rebuild queue</Btn>
        </div>
      </div>
    )
  }

  if (finished || !current) {
    const totalGrades = tally.again + tally.hard + tally.good + tally.easy
    const retention = totalGrades ? Math.round(((tally.good + tally.easy) / totalGrades) * 100) : 0
    return (
      <div>
        <h1 className="h1">Session complete</h1>
        <p className="sub">{totalGrades} reviews · {retention}% recalled · {recycled} cards recycled within the session.</p>
        <div className="grid c4">
          <Panel><div className="kicker">Again</div><div style={{ fontSize: 26 }}>{tally.again}</div></Panel>
          <Panel><div className="kicker">Hard</div><div style={{ fontSize: 26 }}>{tally.hard}</div></Panel>
          <Panel><div className="kicker">Good</div><div style={{ fontSize: 26 }}>{tally.good}</div></Panel>
          <Panel><div className="kicker">Easy</div><div style={{ fontSize: 26 }}>{tally.easy}</div></Panel>
        </div>
        <div className="row" style={{ marginTop: 18 }}>
          <Btn variant="primary" onClick={() => { queueRef.current = buildQueue(); setIndex(0); setFinished(false); setTally({ again: 0, hard: 0, good: 0, easy: 0, minutes: 0 }) }}>
            Load next batch
          </Btn>
        </div>
      </div>
    )
  }

  const item = current.item
  const mode: CardMode = current.card.mode
  const helpVisible = !state.settings.reviewHelpDismissed
  const r = cardState.phase === "review" ? retrievability(cardState.stability, (Date.now() - (cardState.last ?? 0)) / 86400000) : null

  return (
    <div>
      {helpVisible ? (
        <div className="howto">
          <div className="row between" style={{ alignItems: "flex-start" }}>
            <div>
              <b>How a review works — three steps</b>
              <ol>
                <li>
                  <b>Read the Korean and say it out loud</b>, even if you are guessing. Saying it is what moves it into
                  your mouth, not just your eyes.
                </li>
                <li>
                  <b>Tap “Show answer”</b> (or press <span className="mono">space</span>) to check yourself.
                </li>
                <li>
                  <b>Grade yourself honestly</b> with the four buttons, or keys <span className="mono">1–4</span>. “Again”
                  means you had no idea, “Easy” means it was instant.
                </li>
              </ol>
              <div className="small">
                Your grade is the only thing that decides when the card comes back — nothing here is a test you can fail.
                Grading “Again” is useful information, not a penalty.
              </div>
            </div>
            <Btn
              className="tiny"
              variant="ghost"
              onClick={() => setState((s) => ({ ...s, settings: { ...s.settings, reviewHelpDismissed: true } }))}
            >
              Got it, hide this
            </Btn>
          </div>
        </div>
      ) : null}

      <div className="row between" style={{ marginBottom: 10 }}>
        <div className="row" style={{ gap: 8 }}>
          <Pill tone="amber">{kindLabel(item.kind)}</Pill>
          <Pill>{MODE_LABEL[mode]}</Pill>
          {item.tier ? <Pill tone="blue">tier {item.tier}</Pill> : null}
        </div>
        <span className="small mono">
          card {index + 1} of {queue.length}
        </span>
      </div>
      <Bar value={index} max={queue.length} blue />

      <div className="card-face" style={{ marginTop: 14 }}>
        {mode === "recognise" ? (
          <>
            <Ko text={item.ko} size="big" showRoman={state.settings.romanization} rate={0.9} />
            {revealed ? (
              <>
                <div className="en" style={{ fontSize: 17 }}>{item.en}</div>
                {item.polite ? <div className="small">Polite version: <span className="ko">{item.polite}</span></div> : null}
                {item.example ? (
                  <div className="line" style={{ borderTop: "1px dashed var(--line)", paddingTop: 12 }}>
                    <div className="ko">{item.example.ko}</div>
                    <div className="small">{item.example.en}</div>
                  </div>
                ) : null}
                {item.note ? <div className="small">{item.note}</div> : null}
              </>
            ) : (
              <div className="small">
                Say it out loud — the meaning and the sound — then reveal to check yourself.
              </div>
            )}
          </>
        ) : null}

        {mode === "listen" ? (
          <>
            <div className="row" style={{ gap: 12 }}>
              <Btn variant="primary" onClick={() => speak(item.ko, { rate: 0.85 })}>▶ Play (slow)</Btn>
              <Btn onClick={() => speak(item.ko, { rate: 1 })}>▶ Normal speed</Btn>
            </div>
            <div className="small">
              {revealed ? "Check your guess:" : "What did you hear? Play it again if you need to."}
            </div>
            {revealed ? (
              <>
                <Ko text={item.ko} size="mid" showRoman={state.settings.romanization} />
                <div className="en">{item.en}</div>
                {item.note ? <div className="small">{item.note}</div> : null}
              </>
            ) : null}
          </>
        ) : null}

        {mode === "recall" ? (
          <>
            <div className="en" style={{ fontSize: 20 }}>{item.en}</div>
            <div className="small">Say it in Korean — polite form if it matters.</div>
            {revealed ? (
              <>
                <Ko text={item.ko} size="big" showRoman={state.settings.romanization} />
                {item.polite ? <div className="small">polite: <span className="ko">{item.polite}</span></div> : null}
                {item.note ? <div className="small">{item.note}</div> : null}
              </>
            ) : null}
          </>
        ) : null}

        <div className="row" style={{ marginTop: 8, justifyContent: "flex-end" }}>
          {!revealed ? (
            <Btn variant="primary" onClick={() => setRevealed(true)}>
              Show answer <span className="small">(space)</span>
            </Btn>
          ) : (
            <span className="small">Now pick the button that matches what just happened ↓</span>
          )}
        </div>
      </div>

      {revealed && previews ? (
        <div className="grades" style={{ marginTop: 14 }}>
          {([1, 2, 3, 4] as Grade[]).map((g) => {
            const labels = { 1: "Again", 2: "Hard", 3: "Good", 4: "Easy" }
            const hint = { 1: "no idea", 2: "barely", 3: "got it", 4: "instant" }
            return (
              <button key={g} className={"btn g" + g} onClick={() => grade(g)} title={"Key " + g + " — " + hint[g]}>
                <span>
                  {labels[g]} <span className="mono small">({g})</span>
                </span>
                <small>{hint[g]}</small>
                <small>back in {previews[g]}</small>
              </button>
            )
          })}
        </div>
      ) : null}

      <p className="small" style={{ marginTop: 14 }}>
        Whichever grade you pick, the card returns at the time shown on that button — a minute for “Again”, days or weeks
        for “Easy”. Grade what actually happened: marking “Easy” what you struggled with is the one thing that breaks the
        schedule.
      </p>
      <details style={{ marginTop: 8 }}>
        <summary className="small">Scheduler details (FSRS-6)</summary>
        <p className="small">
          Phase <span className="mono">{cardState.phase}</span> · stability{" "}
          <span className="mono">{cardState.stability.toFixed(2)}d</span> · difficulty{" "}
          <span className="mono">{cardState.difficulty.toFixed(1)}</span>
          {r !== null ? <> · current chance of recall <span className="mono">{Math.round(r * 100)}%</span></> : null}. The
          scheduler is re-estimating the moment your memory would fail; these numbers are its working, not your score.
        </p>
      </details>
    </div>
  )
}

function isYesterday(prevDay: string, day: string): boolean {
  if (!prevDay) return false
  const d = new Date(day + "T00:00:00Z")
  d.setUTCDate(d.getUTCDate() - 1)
  return d.toISOString().slice(0, 10) === prevDay
}
