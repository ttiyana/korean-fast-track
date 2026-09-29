import { useEffect, useRef, useState } from "react"
import { SCENARIOS } from "../data/scenarios"
import { Btn, Ko, Panel, Pill } from "../components/ui"
import TimeLogger from "../components/TimeLogger"
import { speak, stopSpeaking } from "../lib/speech"
import { romanize } from "../lib/hangul"
import type { AppState } from "../lib/store"

type Props = {
  state: AppState
  setState: (fn: (s: AppState) => AppState) => void
  mine: (ko: string, en: string, source: string) => void
  initial?: string
}

export default function Scenarios({ state, setState, mine, initial }: Props) {
  const [openId, setOpenId] = useState<string | null>(initial ?? null)
  const [showEn, setShowEn] = useState(true)
  const [rate, setRate] = useState(0.9)
  const [playing, setPlaying] = useState(false)
  const [hiddenYourLines, setHiddenYourLines] = useState(false)
  const [revealed, setRevealed] = useState<Record<number, boolean>>({})
  const playIndex = useRef(0)
  const timer = useRef<number | null>(null)

  const scenario = SCENARIOS.find((s) => s.id === openId) ?? null

  useEffect(() => {
    return () => {
      stopSpeaking()
      if (timer.current) window.clearInterval(timer.current)
    }
  }, [])

  function playAll() {
    if (!scenario) return
    stopSpeaking()
    if (playing) {
      setPlaying(false)
      if (timer.current) { window.clearInterval(timer.current); timer.current = null }
      return
    }
    setPlaying(true)
    playIndex.current = 0
    const step = () => {
      const line = scenario.lines[playIndex.current]
      if (!line) {
        setPlaying(false)
        if (timer.current) { window.clearInterval(timer.current); timer.current = null }
        return
      }
      speak(line.ko, { rate })
      playIndex.current += 1
    }
    step()
    timer.current = window.setInterval(step, 4200)
  }

  if (!scenario) {
    return (
      <div>
        <h1 className="h1">Ten situations</h1>
        <p className="sub">
          The practical half of Korean: what you say, what you hear back, and the cultural rule behind it. Play a whole
          dialogue, shadow it, then hide your own lines and try to fill them in from memory.
        </p>
        <div className="grid c2">
          {SCENARIOS.map((s) => {
            const keyCount = s.key.length
            return (
              <button
                key={s.id}
                className="panel"
                style={{ textAlign: "left", cursor: "pointer", color: "inherit", font: "inherit" }}
                onClick={() => setOpenId(s.id)}
              >
                <div className="row between">
                  <b style={{ fontSize: 16 }}>{s.icon} {s.title}</b>
                  <Pill tone="blue">{s.lines.length} lines</Pill>
                </div>
                <div className="ko" style={{ fontSize: 18, margin: "6px 0 8px" }}>{s.ko}</div>
                <p className="small" style={{ margin: 0 }}>{s.goal}</p>
                <p className="small" style={{ marginTop: 8 }}>{keyCount} key phrases · tap to open</p>
              </button>
            )
          })}
        </div>
        <div style={{ marginTop: 18 }}>
          <TimeLogger state={state} setState={setState} label="Practise out loud (timer)" />
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="row between" style={{ marginBottom: 12 }}>
        <Btn variant="ghost" onClick={() => { stopSpeaking(); setPlaying(false); setOpenId(null) }}>← All situations</Btn>
        <div className="row">
          <label className="row small" style={{ gap: 6 }}>
            <input type="checkbox" checked={showEn} onChange={(e) => setShowEn(e.target.checked)} style={{ width: "auto" }} /> English
          </label>
          <label className="row small" style={{ gap: 6 }}>
            <input type="checkbox" checked={hiddenYourLines} onChange={(e) => setHiddenYourLines(e.target.checked)} style={{ width: "auto" }} /> Hide my lines
          </label>
          <label className="row small" style={{ gap: 6 }}>
            speed
            <input type="range" min={0.6} max={1.1} step={0.05} value={rate} onChange={(e) => setRate(Number(e.target.value))} style={{ width: 100 }} />
            <span className="mono">{rate.toFixed(2)}×</span>
          </label>
        </div>
      </div>

      <h1 className="h1">{scenario.icon} {scenario.title}</h1>
      <div className="ko" style={{ fontSize: 20, color: "var(--muted)", marginBottom: 8 }}>{scenario.ko}</div>
      <p className="sub">{scenario.goal}</p>

      <div className="row" style={{ marginBottom: 14 }}>
        <Btn variant="primary" onClick={playAll}>{playing ? "■ Stop playback" : "▶ Play the whole dialogue"}</Btn>
        <Btn onClick={() => mine(scenario.key[0].ko, scenario.key[0].en, scenario.id)}>Add first key phrase to deck</Btn>
      </div>

      <Panel title="Dialogue">
        {scenario.lines.map((line, i) => {
          const mineLine = line.who === "you"
          if (mineLine && hiddenYourLines && !revealed[i]) {
            return (
              <div className="line" key={i}>
                <div className="row between">
                  <span className="small">Your turn — say it out loud first, then check yourself</span>
                  <Btn className="tiny" variant="ghost" onClick={() => setRevealed({ ...revealed, [i]: true })}>Show my line</Btn>
                </div>
                <div className="ko" style={{ color: "var(--dim)", letterSpacing: "3px" }}>
                  {line.ko.replace(/[^\s]/g, "·")}
                </div>
              </div>
            )
          }
          return (
            <div className="line" key={i} style={{ display: "grid", gridTemplateColumns: "64px 1fr", gap: 12 }}>
              <div>
                <Pill tone={mineLine ? "jade" : "blue"}>{mineLine ? "you" : "them"}</Pill>
              </div>
              <div>
                <Ko text={line.ko} size="mid" showRoman={state.settings.romanization} rate={rate} />
                {showEn ? <div className="en">{line.en}</div> : null}
                {line.note ? <div className="small">{line.note}</div> : null}
              </div>
            </div>
          )
        })}
      </Panel>

      <div className="grid c2" style={{ marginTop: 14 }}>
        <Panel title="Key phrases" right={<span className="small">tap to add to your review deck</span>}>
          <div className="chips">
            {scenario.key.map((k) => (
              <button key={k.ko} className="chip w" onClick={() => mine(k.ko, k.en, scenario.id)} title="Add to deck">
                <span className="ko">{k.ko}</span>
                <span className="g">{k.en} · {romanize(k.ko)}</span>
              </button>
            ))}
          </div>
        </Panel>
        <Panel title="Why Koreans do it this way">
          <p className="small" style={{ margin: 0 }}>{scenario.culture}</p>
        </Panel>
      </div>

      <div style={{ marginTop: 14 }}>
        <TimeLogger state={state} setState={setState} label="Shadowing timer" />
      </div>
    </div>
  )
}
