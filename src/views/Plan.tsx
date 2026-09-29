import { useEffect, useState } from "react"
import { PRINCIPLES, PHASES, MILESTONES, DAILY } from "../data/plan"
import { SOURCES } from "../data/grammar"
import { Btn, Panel, Pill, Ring, Bar, Stat } from "../components/ui"
import { dueSummary, todayKey, ensureDay, coverageEstimate, pushState } from "../lib/store"
import type { AppState } from "../lib/store"
import type { Item } from "../lib/deck"

type Props = {
  state: AppState
  setState: (fn: (s: AppState) => AppState) => void
  items: Item[]
  go: (tab: string) => void
}

export default function Plan({ state, setState, items, go }: Props) {
  const summary = dueSummary(state)
  const totalCards = items.length
  const [cloud, setCloud] = useState<string>("")

  const seen = Object.values(state.cards).filter((c) => c.phase !== "new").length
  const graduated = Object.values(state.cards).filter((c) => c.phase === "review").length
  const knownItems = new Set(
    Object.entries(state.cards)
      .filter(([, c]) => c.phase === "review")
      .map(([id]) => id.split("|")[0])
  ).size
  const coverage = coverageEstimate(knownItems)
  const day = ensureDay(state, todayKey())
  const minutes = Object.values(state.days).reduce((a, d) => a + d.minutes, 0)

  useEffect(() => {
    if (state.settings.syncEnabled && state.settings.syncCode) {
      pushState(state).then((ok) => setCloud(ok ? "cloud synced" : "offline (saved on this device)"))
    }
  }, [])

  return (
    <div>
      <div className="hero">
        <div>
          <div className="kicker">Fast-track Korean · 90 days</div>
          <h1>
            Understand the shop, <span className="ko-line">가게</span> · follow the drama{" "}
            <span className="ko-line">드라마</span> · hear the song <span className="ko-line">노래</span>
          </h1>
          <p className="sub">
            Built around one promise: you should walk into a convenience store and speak, understand a drama episode
            without English, and catch a lyric while it plays. Everything here is ordered by how often real Koreans
            actually say it — the subtitle corpus, not a textbook.
          </p>
          <div className="row">
            <Btn variant="primary" onClick={() => go("review")}>
              Review now {summary.due.length + summary.newCards.length > 0 ? "· " + (summary.due.length + Math.min(summary.newCards.length, state.settings.newPerDay)) + " cards" : ""}
            </Btn>
            <Btn onClick={() => go("hangul")}>Hangul Lab</Btn>
            <Btn variant="ghost" onClick={() => go("decoder")}>Decode a line from a drama or song</Btn>
          </div>
          <p className="small" style={{ marginTop: 12 }}>
            {items.length} items in the deck · {seen} cards started · {cloud || "local only"}
          </p>
        </div>
        <div className="stack" style={{ alignItems: "center" }}>
          <Ring value={coverage} label={String(coverage)} caption="estimated coverage of spoken Korean" />
          <div className="row" style={{ gap: 6, justifyContent: "center" }}>
            <Pill tone="red">{state.streak.current} day streak</Pill>
            <Pill tone="jade">{knownItems} items solid</Pill>
          </div>
        </div>
      </div>

      <div className="grid c4" style={{ marginTop: 22 }}>
        <Stat
          label="Due today"
          value={summary.due.length + summary.learning.length}
          sub={summary.learning.length + " in learning steps"}
        />
        <Stat
          label="New available"
          value={summary.newCards.length.toLocaleString("en-US")}
          sub={"released " + state.settings.newPerDay + " a day in Review"}
        />
        <Stat
          label="Reviewed today"
          value={day.reviewed}
          sub={day.reviewed > 0 ? Math.round((day.correct / Math.max(day.reviewed, 1)) * 100) + "% recalled" : "nothing yet — the queue is ready"}
        />
        <Stat
          label="Study time"
          value={Math.round(minutes)}
          unit="min"
          sub={Math.round(minutes / 60) + " h logged of ~300 h for drama fluency"}
        />
      </div>

      <Panel title="The daily loop" right={<Pill>60–90 min</Pill>}>
        <table>
          <thead>
            <tr>
              <th style={{ width: 80 }}>Block</th>
              <th>What</th>
              <th>Why</th>
            </tr>
          </thead>
          <tbody>
            {DAILY.map((d) => (
              <tr key={d.block}>
                <td className="mono" style={{ color: "var(--amber)" }}>{d.block}</td>
                <td>{d.what}</td>
                <td className="en">{d.why}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="small" style={{ marginTop: 10 }}>
          Miss a day and the streak resets but nothing is lost — the scheduler simply hands the cards back.
        </p>
      </Panel>

      <h2 className="h2">Why this method</h2>
      <p className="sub" style={{ marginBottom: 14 }}>
        Nine claims, each with the evidence behind it and the exact action it implies here.
      </p>
      {PRINCIPLES.map((p, i) => (
        <details key={p.title} open={i < 2}>
          <summary>
            {i + 1}. {p.title}
          </summary>
          <p>
            <b style={{ color: "var(--ink)" }}>{p.claim}</b>
          </p>
          <p>{p.why}</p>
          <p>
            <Pill tone="jade">Do this</Pill> <span style={{ marginLeft: 8 }}>{p.do}</span>
          </p>
        </details>
      ))}

      <h2 className="h2">The 90-day shape</h2>
      <div className="grid c3">
        {PHASES.map((p) => (
          <Panel key={p.id}>
            <div className="row between">
              <b>{p.name}</b>
              <Pill tone="amber">{p.weeks}</Pill>
            </div>
            <p className="small" style={{ marginTop: 6 }}>~{p.minutes} min a day</p>
            <ul style={{ paddingLeft: 18, margin: "10px 0", color: "var(--muted)", fontSize: 13.5 }}>
              {p.focus.map((f) => (
                <li key={f} style={{ marginBottom: 5 }}>{f}</li>
              ))}
            </ul>
            <div className="ok" style={{ fontSize: 12.5 }}>{p.target}</div>
          </Panel>
        ))}
      </div>

      <h2 className="h2">Hours → what unlocks</h2>
      <div className="grid c2">
        <div className="timeline">
          {MILESTONES.map((m) => (
            <div className="m" key={m.hours}>
              <div className="h">{m.hours} h</div>
              <b>{m.label}</b>
              <div className="en small">{m.detail}</div>
            </div>
          ))}
        </div>
        <div>
          <Panel title="Your position">
            <div className="stack">
              {MILESTONES.map((m) => (
                <div key={m.hours}>
                  <div className="row between small">
                    <span>{m.label}</span>
                    <span className="mono">{Math.min(100, Math.round((minutes / 60 / m.hours) * 100))}%</span>
                  </div>
                  <Bar value={minutes / 60} max={m.hours} blue />
                </div>
              ))}
            </div>
            <p className="small" style={{ marginTop: 12 }}>
              Logging happens automatically: review time counts, and the drama and song tabs have a timer you can start
              while you watch.
            </p>
          </Panel>
          <Panel title="Sources">
            <div className="stack">
              {SOURCES.map((g) => (
                <div key={g.group}>
                  <div className="kicker">{g.group}</div>
                  <ul style={{ paddingLeft: 16, margin: "6px 0 0", fontSize: 13 }}>
                    {g.items.map((s) => (
                      <li key={s.url} style={{ marginBottom: 6 }}>
                        <a href={s.url} target="_blank" rel="noreferrer">{s.label}</a>
                        {s.note ? <div className="small">{s.note}</div> : null}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  )
}
