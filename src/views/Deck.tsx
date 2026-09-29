import { useMemo, useState } from "react"
import { Btn, Panel, Pill } from "../components/ui"
import { romanize } from "../lib/hangul"
import { speak } from "../lib/speech"
import { kindLabel } from "../lib/deck"
import type { Item, ItemKind } from "../lib/deck"
import type { AppState } from "../lib/store"

type Props = {
  state: AppState
  setState: (fn: (s: AppState) => AppState) => void
  items: Item[]
  mine: (ko: string, en: string, source: string) => void
}

const KINDS: ItemKind[] = ["word", "glue", "grammar", "drama", "scenario", "song", "title", "mine"]

export default function Deck({ state, setState, items, mine }: Props) {
  const [kind, setKind] = useState<"all" | ItemKind>("all")
  const [topic, setTopic] = useState("all")
  const [tier, setTier] = useState("all")
  const [status, setStatus] = useState("all")
  const [query, setQuery] = useState("")
  const [limit, setLimit] = useState(80)

  const topics = useMemo(() => Array.from(new Set(items.map((i) => i.topic).filter(Boolean))) as string[], [items])

  const filtered = items.filter((i) => {
    if (kind !== "all" && i.kind !== kind) return false
    if (topic !== "all" && i.topic !== topic) return false
    if (tier !== "all" && String(i.tier ?? "") !== tier) return false
    const s = state.cards[i.id + "|recognise"] ?? state.cards[i.id + "|listen"] ?? state.cards[i.id + "|recall"]
    const phase = s?.phase ?? "new"
    if (status === "hidden" && !state.hidden.includes(i.id)) return false
    if (status !== "all" && status !== "hidden" && phase !== status) return false
    if (query.trim()) {
      const q = query.trim().toLowerCase()
      if (!(i.ko.includes(q) || i.en.toLowerCase().includes(q))) return false
    }
    return true
  })

  function toggleHidden(id: string) {
    setState((s) => ({
      ...s,
      hidden: s.hidden.includes(id) ? s.hidden.filter((x) => x !== id) : [...s.hidden, id],
      updatedAt: Date.now(),
    }))
  }

  function setGloss(ko: string, en: string) {
    setState((s) => ({ ...s, custom: s.custom.map((c) => (c.ko === ko ? { ...c, en } : c)), updatedAt: Date.now() }))
  }

  const counts = useMemo(() => {
    const out: Record<string, number> = {}
    for (const i of items) out[i.kind] = (out[i.kind] ?? 0) + 1
    return out
  }, [items])

  return (
    <div>
      <h1 className="h1">The deck</h1>
      <p className="sub">
        {items.length} items, in study order: core words → grammar patterns → subtitle glue → drama lines → situations →
        song vocabulary. Hide anything you already know, or mine your own lines from the Decoder.
      </p>

      <div className="row" style={{ marginBottom: 12 }}>
        {KINDS.map((k) => (
          <button key={k} className={"chip" + (kind === k ? " w" : "")} onClick={() => { setKind(kind === k ? "all" : k); setLimit(80) }}>
            {kindLabel(k)} <span className="g">{counts[k] ?? 0}</span>
          </button>
        ))}
      </div>

      <div className="filters">
        <select value={topic} onChange={(e) => setTopic(e.target.value)}>
          <option value="all">All topics</option>
          {topics.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={tier} onChange={(e) => setTier(e.target.value)}>
          <option value="all">All tiers</option>
          <option value="1">Tier 1 — survive</option>
          <option value="2">Tier 2 — everyday</option>
          <option value="3">Tier 3 — nuance</option>
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="all">Any state</option>
          <option value="new">Not started</option>
          <option value="learning">Learning</option>
          <option value="review">In review</option>
          <option value="relearn">Relearning</option>
          <option value="hidden">Hidden</option>
        </select>
        <input placeholder="Search…" value={query} onChange={(e) => { setQuery(e.target.value); setLimit(80) }} style={{ maxWidth: 220 }} />
        <span className="small" style={{ alignSelf: "center" }}>{filtered.length} shown</span>
      </div>

      <Panel>
        <table>
          <thead>
            <tr>
              <th style={{ width: 34 }}></th>
              <th>Korean</th>
              <th>Meaning</th>
              <th style={{ width: 120 }}>Kind</th>
              <th style={{ width: 130 }}>Scheduler</th>
              <th style={{ width: 110 }}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.slice(0, limit).map((i) => {
              const st = state.cards[i.id + "|recognise"]
              const phase = st?.phase ?? "new"
              const custom = state.custom.find((c) => c.ko === i.ko)
              return (
                <tr key={i.id}>
                  <td>
                    <button className="speak" onClick={() => speak(i.ko)} title="hear">▶</button>
                  </td>
                  <td>
                    <div className="ko" style={{ fontSize: 17 }}>{i.ko}</div>
                    <div className="roman">{romanize(i.ko)}</div>
                    {i.example ? <div className="small">e.g. {i.example.ko} — {i.example.en}</div> : null}
                  </td>
                  <td>
                    {custom ? (
                      <input
                        value={custom.en}
                        placeholder="type a gloss…"
                        onChange={(e) => setGloss(custom.ko, e.target.value)}
                        style={{ fontSize: 13 }}
                      />
                    ) : (
                      <span className="en">{i.en}</span>
                    )}
                    {i.polite ? <div className="small">polite: <span className="ko">{i.polite}</span></div> : null}
                    {i.note ? <div className="small">{i.note}</div> : null}
                  </td>
                  <td>
                    <Pill tone={i.kind === "mine" ? "red" : "blue"}>{kindLabel(i.kind)}</Pill>
                    {i.tier ? <div className="small" style={{ marginTop: 4 }}>tier {i.tier}</div> : null}
                  </td>
                  <td className="small mono">
                    {phase === "new" ? "new" : phase}
                    {st && st.phase !== "new" ? (
                      <>
                        <div>S {st.stability.toFixed(1)}d</div>
                        <div>due {new Date(st.due).toLocaleDateString()}</div>
                      </>
                    ) : null}
                  </td>
                  <td>
                    <div className="row" style={{ gap: 6 }}>
                      {custom ? <Btn className="tiny" variant="ghost" onClick={() => mine(i.ko, custom.en, "manual")}>reseed</Btn> : null}
                      <Btn className="tiny" variant="ghost" onClick={() => toggleHidden(i.id)}>
                        {state.hidden.includes(i.id) ? "unhide" : "hide"}
                      </Btn>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {filtered.length > limit ? (
          <div className="row" style={{ marginTop: 12 }}>
            <Btn onClick={() => setLimit(limit + 120)}>Show more ({filtered.length - limit} left)</Btn>
          </div>
        ) : null}
      </Panel>

      <Panel title="Add your own line or word">
        <MineForm mine={mine} />
        <p className="small" style={{ marginTop: 8 }}>
          Anything you add shows up as a “Mined by you” card in the review queue, with the gloss you type in the table
          above. Leave the gloss empty to fill it in later.
        </p>
      </Panel>
    </div>
  )
}

function MineForm({ mine }: { mine: (ko: string, en: string, source: string) => void }) {
  const [ko, setKo] = useState("")
  const [en, setEn] = useState("")
  return (
    <div className="row">
      <input placeholder="Korean" value={ko} onChange={(e) => setKo(e.target.value)} style={{ maxWidth: 260, fontFamily: "var(--ko-font)" }} />
      <input placeholder="English gloss" value={en} onChange={(e) => setEn(e.target.value)} style={{ maxWidth: 260 }} />
      <Btn
        variant="primary"
        disabled={!ko.trim()}
        onClick={() => {
          mine(ko.trim(), en.trim(), "manual")
          setKo("")
          setEn("")
        }}
      >
        Add to deck
      </Btn>
    </div>
  )
}
