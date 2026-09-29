import { useEffect, useRef, useState } from "react"
import { Btn, Panel } from "./ui"
import { todayKey, ensureDay } from "../lib/store"
import type { AppState } from "../lib/store"

/** Start/stop timer that credits elapsed minutes to today's study time. */
export default function TimeLogger({ state, setState, label }: { state: AppState; setState: (fn: (s: AppState) => AppState) => void; label: string }) {
  const [running, setRunning] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const started = useRef(0)
  const tick = useRef<number | null>(null)

  useEffect(() => {
    return () => { if (tick.current) window.clearInterval(tick.current) }
  }, [])

  function start() {
    started.current = Date.now()
    setSeconds(0)
    setRunning(true)
    tick.current = window.setInterval(() => setSeconds((Date.now() - started.current) / 1000), 500)
  }

  function stop() {
    if (tick.current) { window.clearInterval(tick.current); tick.current = null }
    const mins = Math.round((Date.now() - started.current) / 60000)
    setRunning(false)
    setSeconds(0)
    if (mins < 1) return
    const day = todayKey()
    setState((s) => {
      const d = ensureDay(s, day)
      return { ...s, days: { ...s.days, [day]: { ...d, minutes: d.minutes + mins } }, updatedAt: Date.now() }
    })
  }

  return (
    <Panel title={label}>
      <div className="row">
        {!running ? <Btn variant="primary" onClick={start}>Start timer</Btn> : <Btn variant="primary" onClick={stop}>Stop & log {Math.floor(seconds / 60)}m</Btn>}
        {running ? <span className="timer">{Math.floor(seconds / 60)}:{String(Math.floor(seconds % 60)).padStart(2, "0")}</span> : null}
        <span className="small">Logged time counts towards the hour milestones on the Plan tab.</span>
      </div>
    </Panel>
  )
}
