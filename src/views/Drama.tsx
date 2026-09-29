import { useEffect, useRef, useState } from "react"
import { DRAMA } from "../data/drama"
import { GLUE } from "../data/glue"
import { Btn, Ko, Panel, Pill } from "../components/ui"
import TimeLogger from "../components/TimeLogger"
import { speak, stopSpeaking } from "../lib/speech"
import type { AppState } from "../lib/store"

type Props = {
  state: AppState
  setState: (fn: (s: AppState) => AppState) => void
  mine: (ko: string, en: string, source: string) => void
}

export default function Drama({ state, setState, mine }: Props) {
  const [query, setQuery] = useState("")
  const [rate, setRate] = useState(0.85)
  const [shadowing, setShadowing] = useState<string | null>(null)
  const [index, setIndex] = useState(0)
  const timer = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      stopSpeaking()
      if (timer.current) window.clearInterval(timer.current)
    }
  }, [])

  const group = DRAMA.find((g) => g.id === shadowing) ?? null

  function toggleShadow(id: string) {
    if (shadowing === id) {
      stopSpeaking()
      if (timer.current) window.clearInterval(timer.current)
      timer.current = null
      setShadowing(null)
      return
    }
    const g = DRAMA.find((x) => x.id === id)
    if (!g) return
    setShadowing(id)
    setIndex(0)
    let i = 0
    const step = () => {
      const line = g.lines[i]
      if (!line) {
        stopSpeaking()
        if (timer.current) window.clearInterval(timer.current)
        timer.current = null
        setShadowing(null)
        return
      }
      speak(line.ko, { rate })
      setIndex(i)
      i += 1
    }
    stopSpeaking()
    if (timer.current) window.clearInterval(timer.current)
    step()
    timer.current = window.setInterval(step, 3600)
  }

  const q = query.trim()
  const filtered = q
    ? DRAMA.map((g) => ({
        ...g,
        lines: g.lines.filter((l) => l.ko.includes(q) || l.en.toLowerCase().includes(q.toLowerCase()) || (l.polite ?? "").includes(q)),
      })).filter((g) => g.lines.length > 0)
    : DRAMA

  return (
    <div>
      <h1 className="h1">Drama mode</h1>
      <p className="sub">
        The lines that make up most of a K-drama's dialogue, grouped by what they do. Each one shows the 반말 form you
        hear on screen and, where it exists, the polite twin you should actually say. Shadow a group at 0.85× and your
        mouth starts to keep up with the subtitles.
      </p>

      <div className="row between" style={{ marginBottom: 14 }}>
        <input placeholder="Search a line (Korean or English)…" value={query} onChange={(e) => setQuery(e.target.value)} style={{ maxWidth: 340 }} />
        <label className="row small" style={{ gap: 8 }}>
          shadow speed
          <input type="range" min={0.6} max={1.1} step={0.05} value={rate} onChange={(e) => setRate(Number(e.target.value))} style={{ width: 120 }} />
          <span className="mono">{rate.toFixed(2)}×</span>
        </label>
      </div>

      <div className="grid c2">
        {filtered.map((g) => (
          <Panel
            key={g.id}
            title={g.title}
            right={
              <div className="row">
                <Pill>{g.lines.length} lines</Pill>
                <Btn className="tiny" variant={shadowing === g.id ? "primary" : "default"} onClick={() => toggleShadow(g.id)}>
                  {shadowing === g.id ? "■ stop (" + (index + 1) + "/" + g.lines.length + ")" : "▶ shadow"}
                </Btn>
              </div>
            }
          >
            <p className="small" style={{ marginTop: 0 }}>{g.blurb}</p>
            {g.lines.map((l) => (
              <div className="line" key={l.ko}>
                <div className="row between" style={{ alignItems: "flex-start", gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <Ko text={l.ko} size="mid" showRoman={state.settings.romanization} rate={rate} />
                    <div className="en">{l.en}</div>
                    <div className="row" style={{ gap: 8, marginTop: 4 }}>
                      <Pill tone={l.register === "slang" ? "red" : l.register === "casual" ? "amber" : "blue"}>{l.register}</Pill>
                      {l.polite ? <span className="small">polite: <span className="ko">{l.polite}</span></span> : null}
                    </div>
                    {l.note ? <div className="small" style={{ marginTop: 4 }}>{l.note}</div> : null}
                  </div>
                  <Btn className="tiny" variant="ghost" title="Add to my review deck" onClick={() => mine(l.ko, l.en + (l.polite ? " (polite: " + l.polite + ")" : ""), "drama")}>
                    + deck
                  </Btn>
                </div>
              </div>
            ))}
          </Panel>
        ))}
      </div>

      <h2 className="h2">Subtitle glue — the 150 words that hold dialogue together</h2>
      <p className="sub">
        Taken from real subtitle frequency data: these are the glued spoken forms (거야, 게, 걸, 난) that dictionaries
        list separately, if at all. Learn this list and the sentence skeletons start to appear even when the content
        words are new. Click any of them to hear it and add it to your deck.
      </p>
      <Panel title="Most frequent spoken forms" right={<span className="small">{GLUE.length} entries</span>}>
        <div className="chips">
          {GLUE.map((g) => (
            <button key={g.ko} className="chip" onClick={() => mine(g.ko, g.en, "glue")} title={g.note ?? g.en}>
              <span className="ko">{g.ko}</span>
              <span className="g">{g.en}</span>
            </button>
          ))}
        </div>
      </Panel>

      <div style={{ marginTop: 14 }}>
        <TimeLogger state={state} setState={setState} label="Episode timer (watch with Korean subtitles)" />
      </div>
    </div>
  )
}
