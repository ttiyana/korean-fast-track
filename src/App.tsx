import { useEffect, useMemo, useRef, useState } from "react"
import { buildItems } from "./lib/deck"
import type { Item } from "./lib/deck"
import { loadState, saveState, dueSummary, pushState } from "./lib/store"
import type { AppState } from "./lib/store"
import Plan from "./views/Plan"
import HangulLab from "./views/Hangul"
import Review from "./views/Review"
import Deck from "./views/Deck"
import Scenarios from "./views/Scenarios"
import Drama from "./views/Drama"
import Songs from "./views/Songs"
import Decoder from "./views/Decoder"
import Progress from "./views/Progress"

const TABS = [
  { id: "plan", label: "Plan", icon: "◎" },
  { id: "review", label: "Review", icon: "↻" },
  { id: "hangul", label: "Hangul Lab", icon: "가" },
  { id: "scenarios", label: "Situations", icon: "☕" },
  { id: "drama", label: "Drama", icon: "▶" },
  { id: "songs", label: "Songs", icon: "♪" },
  { id: "decoder", label: "Decoder", icon: "⌘" },
  { id: "deck", label: "Deck", icon: "▤" },
  { id: "progress", label: "Progress", icon: "◔" },
]

function readHash(): string {
  const h = window.location.hash.replace("#", "")
  return TABS.some((t) => t.id === h) ? h : "plan"
}

export default function App() {
  const [state, setStateRaw] = useState<AppState>(() => loadState())
  const [tab, setTab] = useState<string>(() => readHash())
  const pushTimer = useRef<number | null>(null)

  const setState = (fn: (s: AppState) => AppState) => setStateRaw((s) => fn({ ...s, updatedAt: Date.now() }))

  useEffect(() => {
    const onHash = () => setTab(readHash())
    window.addEventListener("hashchange", onHash)
    return () => window.removeEventListener("hashchange", onHash)
  }, [])

  // Persist locally on every change, and mirror to the cloud at most every 20 s.
  useEffect(() => {
    saveState(state)
    if (!state.settings.syncEnabled) return
    if (pushTimer.current) window.clearTimeout(pushTimer.current)
    pushTimer.current = window.setTimeout(() => { void pushState(state) }, 20000)
    return () => { if (pushTimer.current) window.clearTimeout(pushTimer.current) }
  }, [state])

  const baseItems = useMemo(() => buildItems(), [])
  const items: Item[] = useMemo(() => {
    const mined: Item[] = state.custom.map((c, idx) => ({
      id: "c:" + c.ko,
      kind: "mine",
      ko: c.ko,
      en: c.en || "(no gloss yet)",
      note: c.source ? "mined from " + c.source : undefined,
      order: 10000 + idx,
    }))
    return [...baseItems, ...mined]
  }, [baseItems, state.custom])

  function mine(ko: string, en: string, source: string) {
    if (!ko.trim()) return
    setState((s) => {
      const exists = s.custom.find((c) => c.ko === ko)
      if (exists) return { ...s, custom: s.custom.map((c) => (c.ko === ko ? { ...c, en: en || c.en } : c)) }
      return { ...s, custom: [{ ko, en, source }, ...s.custom] }
    })
  }

  function go(id: string) {
    window.location.hash = id
    setTab(id)
  }

  const summary = dueSummary(state)
  const dueCount = summary.due.length + summary.learning.length

  return (
    <div className="app">
      <aside className="side">
        <div className="brand">
          <span className="ko">한국어</span>
          <b>Fast Track</b>
        </div>
        <div className="tagline">Shop Korean · drama Korean · song Korean, in 90 days</div>
        <nav className="nav">
          {TABS.map((t) => (
            <button key={t.id} className={tab === t.id ? "on" : ""} onClick={() => go(t.id)}>
              <span className="ic">{t.icon}</span>
              {t.label}
              {t.id === "review" && dueCount > 0 ? <span className="count">{dueCount}</span> : null}
            </button>
          ))}
        </nav>
        <p className="small" style={{ marginTop: 18 }}>
          Progress is stored locally and mirrored to Netlify Blobs under your sync code. Audio uses your browser's Korean
          voice — no account, no tracking.
        </p>
      </aside>

      <main className="main">
        {tab === "plan" ? <Plan state={state} setState={setState} items={items} go={go} /> : null}
        {tab === "review" ? <Review state={state} setState={setState} items={items} onMined={mine} /> : null}
        {tab === "hangul" ? <HangulLab /> : null}
        {tab === "scenarios" ? <Scenarios state={state} setState={setState} mine={mine} /> : null}
        {tab === "drama" ? <Drama state={state} setState={setState} mine={mine} /> : null}
        {tab === "songs" ? <Songs state={state} setState={setState} mine={mine} go={go} /> : null}
        {tab === "decoder" ? <Decoder state={state} setState={setState} mine={mine} /> : null}
        {tab === "deck" ? <Deck state={state} setState={setState} items={items} mine={mine} /> : null}
        {tab === "progress" ? <Progress state={state} setState={setState} items={items} /> : null}
      </main>
    </div>
  )
}
