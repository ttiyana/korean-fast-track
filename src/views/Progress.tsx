import { useEffect, useState } from "react"
import { Btn, Panel, Pill, Ring, Bar } from "../components/ui"
import { koreanVoices, speak } from "../lib/speech"
import { dueSummary, todayKey, coverageEstimate, syncNow, pushState } from "../lib/store"
import type { AppState } from "../lib/store"
import type { Item } from "../lib/deck"
import { GRAMMAR } from "../data/grammar"
import { GLUE } from "../data/glue"
import { WORDS } from "../data/words"
import { DRAMA } from "../data/drama"
import { SONG_WORDS } from "../data/songs"

type Props = {
  state: AppState
  setState: (fn: (s: AppState) => AppState) => void
  items: Item[]
}

export default function Progress({ state, setState, items }: Props) {
  const [msg, setMsg] = useState("")
  const [busy, setBusy] = useState(false)
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])

  useEffect(() => {
    function refresh() { setVoices(koreanVoices()) }
    refresh()
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.addEventListener("voiceschanged", refresh)
      const t = window.setTimeout(refresh, 900)
      return () => {
        window.speechSynthesis.removeEventListener("voiceschanged", refresh)
        window.clearTimeout(t)
      }
    }
  }, [])

  const cards = Object.entries(state.cards).map(([id, cs]) => ({ id, ...cs }))
  const started = cards.filter((c) => c.phase !== "new").length
  const solid = cards.filter((c) => c.phase === "review").length
  const learning = cards.filter((c) => c.phase === "learning" || c.phase === "relearn").length
  const known = new Set(cards.filter((c) => c.phase === "review").map((c) => c.id.split("|")[0]))
  const coverage = coverageEstimate(known.size)
  const summary = dueSummary(state)

  const last14 = Array.from({ length: 14 }).map((_, idx) => {
    const d = new Date()
    d.setDate(d.getDate() - (13 - idx))
    const key = todayKey(d)
    const s = state.days[key] ?? { reviewed: 0, correct: 0, newItems: 0, minutes: 0 }
    return { key, ...s }
  })
  const maxReviews = Math.max(1, ...last14.map((d) => d.reviewed))
  const totalReviews = Object.values(state.days).reduce((a, d) => a + d.reviewed, 0)
  const totalCorrect = Object.values(state.days).reduce((a, d) => a + d.correct, 0)
  const totalMinutes = Object.values(state.days).reduce((a, d) => a + d.minutes, 0)
  const retention = totalReviews ? Math.round((totalCorrect / totalReviews) * 100) : 0

  const leeches = cards
    .filter((c) => c.lapses >= 2)
    .sort((a, b) => b.lapses - a.lapses)
    .slice(0, 8)

  async function doSync(pushOnly = false) {
    setBusy(true)
    setMsg("Talking to Netlify Blobs…")
    if (pushOnly) {
      const ok = await pushState(state)
      setMsg(ok ? "Uploaded this device's progress." : "Upload failed — you may be offline.")
    } else {
      const { state: merged, result } = await syncNow(state)
      setState(() => merged)
      setMsg(result.message)
    }
    setBusy(false)
  }

  function exportJson() {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" })
    const a = document.createElement("a")
    a.href = URL.createObjectURL(blob)
    a.download = "korean-fast-track-progress.json"
    a.click()
  }

  return (
    <div>
      <h1 className="h1">Progress</h1>
      <p className="sub">
        Everything here is measured, not guessed: the coverage figure converts your solid items into an estimate of how
        much spoken Korean you would understand, using the frequency bands the research on lexical coverage describes.
      </p>

      <div className="grid c4">
        <Panel>
          <div className="kicker">Cards started</div>
          <div style={{ fontSize: 28, fontWeight: 650 }}>{started}</div>
          <div className="small">of {items.length} items · {learning} learning</div>
        </Panel>
        <Panel>
          <div className="kicker">Solid (in review)</div>
          <div style={{ fontSize: 28, fontWeight: 650 }}>{solid}</div>
          <div className="small">{known.size} distinct items</div>
        </Panel>
        <Panel>
          <div className="kicker">Retention</div>
          <div style={{ fontSize: 28, fontWeight: 650 }}>{retention}%</div>
          <div className="small">{totalReviews} reviews all-time</div>
        </Panel>
        <Panel>
          <div className="kicker">Study time</div>
          <div style={{ fontSize: 28, fontWeight: 650 }}>{Math.round(totalMinutes / 60)}h</div>
          <div className="small">{state.streak.current}-day streak · best {state.streak.best}</div>
        </Panel>
      </div>

      <div className="grid c2" style={{ marginTop: 14 }}>
        <Panel title="Last 14 days">
          <div style={{ display: "flex", gap: 5, alignItems: "flex-end", height: 120 }}>
            {last14.map((d) => (
              <div key={d.key} style={{ flex: 1, textAlign: "center" }} title={d.key + ": " + d.reviewed + " reviews, " + d.minutes + " min"}>
                <div
                  style={{
                    height: Math.max(3, (d.reviewed / maxReviews) * 96),
                    background: d.reviewed ? "linear-gradient(180deg, var(--accent), var(--amber))" : "rgba(255,255,255,.08)",
                    borderRadius: 5,
                  }}
                />
                <div className="small" style={{ fontSize: 10 }}>{d.key.slice(8)}</div>
              </div>
            ))}
          </div>
          <p className="small" style={{ marginTop: 8 }}>Bars are reviews; hover for minutes logged that day.</p>
        </Panel>

        <Panel title="Coverage estimate">
          <div className="row" style={{ gap: 20 }}>
            <Ring value={coverage} label={coverage + "%"} sub="of spoken Korean" />
            <div className="stack" style={{ flex: 1 }}>
              <div>
                <div className="row between small"><span>~75% (top 1,000 items)</span><span className="mono">{Math.min(100, Math.round((known.size / 1000) * 100))}%</span></div>
                <Bar value={known.size} max={1000} />
              </div>
              <div>
                <div className="row between small"><span>~95% (TV/film band, 3,000)</span><span className="mono">{Math.min(100, Math.round((known.size / 3000) * 100))}%</span></div>
                <Bar value={known.size} max={3000} />
              </div>
              <div>
                <div className="row between small"><span>98% comprehension band (7,000)</span><span className="mono">{Math.min(100, Math.round((known.size / 7000) * 100))}%</span></div>
                <Bar value={known.size} max={7000} />
              </div>
              <p className="small" style={{ margin: 0 }}>
                The bands come from lexical-coverage research on TV and film: about 3,000 word families for 95% coverage,
                ~7,000 for 98%. This deck is smaller than that by design — it covers the frequent core plus the grammar
                endings that carry the rest.
              </p>
            </div>
          </div>
        </Panel>
      </div>

      <div className="grid c2" style={{ marginTop: 14 }}>
        <Panel title="Leeches — the cards fighting back">
          {leeches.length === 0 ? (
            <p className="small" style={{ margin: 0 }}>None yet. A card becomes a leech after two lapses.</p>
          ) : (
            <table>
              <thead><tr><th>Card</th><th>Lapses</th><th>Stability</th></tr></thead>
              <tbody>
                {leeches.map((c) => (
                  <tr key={c.id}>
                    <td className="ko">{c.id.split("|")[0].replace(/^[a-z]+:/, "")}</td>
                    <td>{c.lapses}</td>
                    <td className="mono">{c.stability.toFixed(1)}d</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <p className="small" style={{ marginTop: 8 }}>
            Fix a leech by giving it a mnemonic or a picture, not by repeating it more.
          </p>
        </Panel>

        <Panel title="Cloud sync (Netlify Blobs)">
          <label className="field">Your progress code</label>
          <div className="row">
            <input value={state.settings.syncCode} readOnly className="mono" style={{ maxWidth: 220 }} />
            <Btn onClick={() => navigator.clipboard?.writeText(state.settings.syncCode)}>Copy</Btn>
            <Btn variant="primary" disabled={busy} onClick={() => doSync(false)}>Sync now</Btn>
            <Btn disabled={busy} onClick={() => doSync(true)}>Upload only</Btn>
          </div>
          <p className="small" style={{ marginTop: 10 }}>
            Progress lives in your browser and is mirrored to a Netlify Blobs key-value store under this code. Type the
            same code on another device to merge both sides — newest review per card wins. No account, no email.
          </p>
          {msg ? <div className="ok">{msg}</div> : null}
        </Panel>
      </div>

      <Panel title="Settings">
        <div className="grid c3">
          <div>
            <label className="field">New cards per day</label>
            <input
              type="number"
              min={0}
              max={80}
              value={state.settings.newPerDay}
              onChange={(e) => setState((s) => ({ ...s, settings: { ...s.settings, newPerDay: Number(e.target.value) } }))}
            />
          </div>
          <div>
            <label className="field">Korean voice for audio</label>
            <select
              value={state.settings.voiceName}
              onChange={(e) => {
                setState((s) => ({ ...s, settings: { ...s.settings, voiceName: e.target.value } }))
                speak("안녕하세요", { voiceName: e.target.value })
              }}
            >
              <option value="">Default Korean voice</option>
              {voices.map((v) => <option key={v.name} value={v.name}>{v.name}</option>)}
            </select>
            <div className="small" style={{ marginTop: 6 }}>
              {voices.length ? voices.length + " Korean voice(s) found in this browser." : "No Korean voice found — install one in your OS settings, or use Chrome/Safari on macOS which ship with Yuna."}
            </div>
          </div>
          <div className="stack">
            <label className="row small" style={{ gap: 8 }}>
              <input type="checkbox" style={{ width: "auto" }} checked={state.settings.romanization} onChange={(e) => setState((s) => ({ ...s, settings: { ...s.settings, romanization: e.target.checked } }))} />
              Show romanisation
            </label>
            <label className="row small" style={{ gap: 8 }}>
              <input type="checkbox" style={{ width: "auto" }} checked={state.settings.autoSpeak} onChange={(e) => setState((s) => ({ ...s, settings: { ...s.settings, autoSpeak: e.target.checked } }))} />
              Auto-play audio on new cards
            </label>
            <label className="row small" style={{ gap: 8 }}>
              <input type="checkbox" style={{ width: "auto" }} checked={state.settings.syncEnabled} onChange={(e) => setState((s) => ({ ...s, settings: { ...s.settings, syncEnabled: e.target.checked } }))} />
              Sync progress to the cloud
            </label>
            <div className="row">
              <Btn onClick={exportJson}>Export JSON</Btn>
              <Btn
                onClick={() => {
                  if (confirm("Reset all progress on this device? Your cloud copy stays until you sync again.")) {
                    setState((s) => ({ ...s, cards: {}, days: {}, streak: { current: 0, best: 0, lastDay: "" }, totalMinutes: 0, updatedAt: Date.now() }))
                  }
                }}
              >
                Reset progress
              </Btn>
            </div>
          </div>
        </div>
      </Panel>

      <Panel title="What's in the deck, and where it came from">
        <div className="grid c4">
          <div><div className="kicker">Core words</div><div style={{ fontSize: 22 }}>{WORDS.length}</div><div className="small">hand-glossed, frequency-ordered</div></div>
          <div><div className="kicker">Grammar patterns</div><div style={{ fontSize: 22 }}>{GRAMMAR.length}</div><div className="small">with example sentences</div></div>
          <div><div className="kicker">Subtitle glue</div><div style={{ fontSize: 22 }}>{GLUE.length}</div><div className="small">from real subtitle frequency</div></div>
          <div><div className="kicker">Drama lines</div><div style={{ fontSize: 22 }}>{DRAMA.reduce((a, g) => a + g.lines.length, 0)}</div><div className="small">by conversational function</div></div>
        </div>
        <div className="grid c2" style={{ marginTop: 12 }}>
          <div>
            <div className="kicker">Song vocabulary</div>
            <div style={{ fontSize: 22 }}>{SONG_WORDS.length}</div>
            <div className="small">plus the verified title list</div>
          </div>
          <div>
            <div className="kicker">Example sentences</div>
            <div className="small">
              Many examples come from <a href="https://tatoeba.org" target="_blank" rel="noreferrer">Tatoeba</a> (CC BY 2.0 FR),
              the subtitle frequency list from <a href="https://github.com/hermitdave/FrequencyWords" target="_blank" rel="noreferrer">FrequencyWords</a> (OpenSubtitles-derived),
              and song titles were validated against MusicBrainz and Korean Wikipedia. Glosses are written for this app.
            </div>
          </div>
        </div>
        <div className="row" style={{ marginTop: 12 }}>
          <Pill tone="jade">Queue: {summary.due.length} due · {summary.newCards.length} new</Pill>
          <Pill tone="amber">Scheduler: FSRS-6 defaults</Pill>
        </div>
      </Panel>
    </div>
  )
}
