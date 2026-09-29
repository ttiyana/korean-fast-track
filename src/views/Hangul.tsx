import { useEffect, useRef, useState } from "react"
import { CONSONANT_INFO, VOWEL_INFO, BATCHIM_RULES, HANGUL_FACTS, CHOSEONG, JUNGSEONG, JONGSEONG, compose, decompose, romanize } from "../lib/hangul"
import { Btn, Panel, Pill } from "../components/ui"
import { speak } from "../lib/speech"

const DRILL_KEY = "kft.drills.v1"

type Drill = { at: number; syllables: number; seconds: number; perSecond: number }

export default function Hangul() {
  const [cho, setCho] = useState("ㅎ")
  const [jung, setJung] = useState("ㅏ")
  const [jong, setJong] = useState("ㄴ")
  const syllable = compose(cho, jung, jong)
  const jamo = syllable ? decompose(syllable) : null

  const [drill, setDrill] = useState<string[] | null>(null)
  const [startedAt, setStartedAt] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const [history, setHistory] = useState<Drill[]>([])
  const timer = useRef<number | null>(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRILL_KEY)
      if (raw) setHistory(JSON.parse(raw))
    } catch { /* ignore */ }
  }, [])

  useEffect(() => {
    if (drill && !timer.current) {
      timer.current = window.setInterval(() => setElapsed((Date.now() - startedAt) / 1000), 100)
    }
    return () => {
      if (timer.current) { window.clearInterval(timer.current); timer.current = null }
    }
  }, [drill, startedAt])

  function startDrill() {
    const chars: string[] = []
    while (chars.length < 12) {
      const c = compose(
        CHOSEONG[Math.floor(Math.random() * CHOSEONG.length)],
        JUNGSEONG[Math.floor(Math.random() * JUNGSEONG.length)],
        JONGSEONG[Math.floor(Math.random() * JONGSEONG.length)]
      )
      if (c) chars.push(c)
    }
    setDrill(chars)
    setStartedAt(Date.now())
    setElapsed(0)
  }

  function finishDrill() {
    if (!drill) return
    const seconds = Math.max(1, (Date.now() - startedAt) / 1000)
    const entry: Drill = { at: Date.now(), syllables: drill.length, seconds, perSecond: drill.length / seconds }
    const next = [entry, ...history].slice(0, 20)
    setHistory(next)
    try { localStorage.setItem(DRILL_KEY, JSON.stringify(next)) } catch { /* ignore */ }
    setDrill(null)
    setElapsed(0)
  }

  const best = history.reduce((a, h) => Math.max(a, h.perSecond), 0)

  return (
    <div>
      <h1 className="h1">Hangul Lab</h1>
      <p className="sub">
        This is the cheapest win in Korean: 24 basic letters, and the writing system tells you how things sound. Spend
        one focused day here and every other feature of this app — subtitles, menus, lyrics, signs — opens up.
      </p>
      <div className="row" style={{ marginBottom: 18 }}>
        {HANGUL_FACTS.map((f) => (
          <Pill key={f} tone="blue">{f.slice(0, 52)}…</Pill>
        ))}
      </div>

      <div className="grid c2">
        <Panel title="Consonants (자음)" right={<span className="small">19 letters · click to hear</span>}>
          <div className="jamos">
            {CONSONANT_INFO.map((c) => (
              <button key={c.jamo} className="jamo" onClick={() => speak(c.jamo)} title={c.tip}>
                <b>{c.jamo}</b>
                <span>{c.name}</span>
                <span className="mono">{c.rom}</span>
              </button>
            ))}
          </div>
          <details style={{ marginTop: 12 }}>
            <summary>Tense and aspirated letters — the part English speakers miss</summary>
            <p>
              Korean distinguishes three kinds of stop: plain (ㄱ), tense (ㄲ, throat tightened, no air) and aspirated
              (ㅋ, a puff of air). English only has two, so your ear has to be rebuilt. Practise the triplets: ㄱ/ㄲ/ㅋ,
              ㄷ/ㄸ/ㅌ, ㅂ/ㅃ/ㅍ, ㅅ/ㅆ, ㅈ/ㅉ/ㅊ. If you say 가 with a puff you are saying 카.
            </p>
          </details>
        </Panel>

        <Panel title="Vowels (모음)" right={<span className="small">21 letters · click to hear</span>}>
          <div className="jamos">
            {VOWEL_INFO.map((v) => (
              <button key={v.jamo} className="jamo" onClick={() => speak(v.jamo)} title={v.tip}>
                <b>{v.jamo}</b>
                <span>{v.name}</span>
                <span className="mono">{v.rom}</span>
              </button>
            ))}
          </div>
          <details style={{ marginTop: 12 }}>
            <summary>How vowels are built</summary>
            <p>
              Three strokes make everything: a horizontal line (the earth), a vertical line (a person), a dot or short
              line (the sky). ㅏ = a person standing to the right, so the sound opens rightwards; ㅓ has the stroke on the
              left. Add a second short stroke and you get the y- versions: ㅑ, ㅕ, ㅛ, ㅠ.
            </p>
          </details>
        </Panel>
      </div>

      <Panel title="Syllable builder">
        <div className="grid c4">
          <div>
            <label className="field">Initial (초성)</label>
            <select value={cho} onChange={(e) => setCho(e.target.value)}>
              {CHOSEONG.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="field">Vowel (중성)</label>
            <select value={jung} onChange={(e) => setJung(e.target.value)}>
              {JUNGSEONG.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="field">Final (종성, optional)</label>
            <select value={jong} onChange={(e) => setJong(e.target.value)}>
              {JONGSEONG.map((c) => <option key={c} value={c}>{c === "" ? "— none —" : c}</option>)}
            </select>
          </div>
          <div>
            <label className="field">Result</label>
            <div className="row" style={{ gap: 12 }}>
              <span className="big-ko">{syllable || "?"}</span>
              <Btn onClick={() => syllable && speak(syllable)}>▶ hear</Btn>
            </div>
          </div>
        </div>
        <div className="row" style={{ marginTop: 12, gap: 18 }}>
          <span className="small">spelled out: <span className="ko">{jamo ? jamo.join(" + ") : "—"}</span></span>
          <span className="small">romanised: <span className="mono">{syllable ? romanize(syllable) : "—"}</span></span>
        </div>
        <p className="small" style={{ marginTop: 8 }}>
          Notice the 순서: the vowel's shape decides whether it sits to the right of the consonant (vertical vowels) or
          underneath it (horizontal vowels). That rule is why Korean blocks always look balanced — and why typing
          Korean is just two or three keystrokes per syllable.
        </p>
      </Panel>

      <Panel
        title="Reading drill"
        right={
          drill ? (
            <span className="row" style={{ gap: 12 }}>
              <span className="timer">{elapsed.toFixed(1)}s</span>
              <Btn variant="primary" onClick={finishDrill}>Done</Btn>
            </span>
          ) : (
            <Btn variant="primary" onClick={startDrill}>Start 12-syllable drill</Btn>
          )
        }
      >
        {drill ? (
          <>
            <div className="drill">
              {drill.map((c, i) => (
                <span key={i} onClick={() => speak(c)} style={{ cursor: "pointer" }}>{c}</span>
              ))}
            </div>
            <p className="small" style={{ marginTop: 12 }}>
              Read all twelve out loud as fast as you can, then hit Done. Under 12 seconds means you are decoding rather
              than recalling — that is reading.
            </p>
          </>
        ) : (
          <>
            <p className="small">
              Twelve random syllable blocks. Say them out loud, no romanisation. Speed here is the single best predictor
              of how fast your listening will improve.
            </p>
            {history.length > 0 ? (
              <table>
                <thead>
                  <tr><th>When</th><th>Syllables</th><th>Seconds</th><th>Per second</th></tr>
                </thead>
                <tbody>
                  {history.slice(0, 6).map((h) => (
                    <tr key={h.at}>
                      <td className="mono">{new Date(h.at).toLocaleString()}</td>
                      <td>{h.syllables}</td>
                      <td>{h.seconds.toFixed(1)}</td>
                      <td style={{ color: h.perSecond >= best ? "var(--jade)" : undefined }}>{h.perSecond.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : null}
          </>
        )}
      </Panel>

      <h2 className="h2">Batchim rules — where written Korean and spoken Korean part ways</h2>
      <p className="sub" style={{ marginBottom: 12 }}>
        The final consonant (받침) is why lyrics look different from what you hear. Eight rules cover almost everything.
      </p>
      <div className="grid c2">
        {BATCHIM_RULES.map((r) => (
          <Panel key={r.rule}>
            <div className="row between">
              <b>{r.rule}</b>
              <span className="mono small">{r.reads}</span>
            </div>
            <div className="ko" style={{ fontSize: 20, margin: "8px 0" }}>{r.example}</div>
            <p className="small" style={{ margin: 0 }}>{r.note}</p>
          </Panel>
        ))}
      </div>
    </div>
  )
}
