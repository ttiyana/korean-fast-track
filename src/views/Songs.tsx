import { SONG_RULES, SONG_TITLES, SONG_WORDS } from "../data/songs"
import { Btn, Ko, Panel, Pill } from "../components/ui"
import TimeLogger from "../components/TimeLogger"
import type { AppState } from "../lib/store"
import { romanize } from "../lib/hangul"
import { speak } from "../lib/speech"

type Props = {
  state: AppState
  setState: (fn: (s: AppState) => AppState) => void
  mine: (ko: string, en: string, source: string) => void
  go: (tab: string) => void
}

export default function Songs({ state, setState, mine, go }: Props) {
  return (
    <div>
      <h1 className="h1">Song mode</h1>
      <p className="sub">
        Songs are the most distorted Korean you will hear: polite endings vanish, pronouns collapse into single
        syllables, and half the sentence is missing. Nonsense to a textbook — predictable to you, once you know the ten
        rules below. Then decode any lyric yourself with the Decoder tab.
      </p>

      <div className="row" style={{ marginBottom: 16 }}>
        <Btn variant="primary" onClick={() => go("decoder")}>Open the Decoder with a lyric</Btn>
        <Btn onClick={() => mine("보고 싶어", "I miss you", "song")}>Mine “보고 싶어”</Btn>
      </div>

      <Panel title="Ten rules that turn song Korean into plain Korean">
        {SONG_RULES.map((r) => (
          <div className="line" key={r.rule}>
            <div className="row between" style={{ alignItems: "flex-start" }}>
              <div style={{ flex: 1 }}>
                <b>{r.rule}</b>
                <div className="en" style={{ fontSize: 13.5, marginTop: 4 }}>{r.what}</div>
                <table style={{ marginTop: 8 }}>
                  <tbody>
                    {r.examples.map((ex) => (
                      <tr key={ex.from + ex.to}>
                        <td className="ko" style={{ width: "32%" }}>{ex.from}</td>
                        <td style={{ width: 26, color: "var(--dim)" }}>→</td>
                        <td className="ko" style={{ width: "32%" }}>
                          <span style={{ cursor: "pointer" }} onClick={() => speak(ex.to)} title="hear it">{ex.to} ▶</span>
                        </td>
                        <td className="small">{ex.mean}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {r.note ? <div className="small" style={{ marginTop: 6 }}>{r.note}</div> : null}
              </div>
            </div>
          </div>
        ))}
      </Panel>

      <h2 className="h2">Titles as vocabulary</h2>
      <p className="sub">
        A song title is a free lesson: short, memorable, and usually one idea. Korean titles were checked against
        MusicBrainz and Korean Wikipedia. Tap a word to drop it into your deck.
      </p>
      <div className="grid c2">
        {SONG_TITLES.map((t) => (
          <Panel key={t.ko} title={t.ko} right={<Pill tone="blue">{t.artist}</Pill>}>
            <div className="row between">
              <div className="small">{t.literal}</div>
              <button className="speak" onClick={() => speak(t.ko)} title="hear the title">▶</button>
            </div>
            <div className="chips" style={{ marginTop: 10 }}>
              {t.words.map((w) => (
                <button key={w.ko + w.en} className="chip w" onClick={() => mine(w.ko, w.en, "song-title")}>
                  <span className="ko">{w.ko}</span>
                  <span className="g">{w.en} · {romanize(w.ko)}</span>
                </button>
              ))}
            </div>
          </Panel>
        ))}
      </div>

      <Panel title="Love-song word pack" right={<span className="small">{SONG_WORDS.length} words · tap to add</span>}>
        <p className="small" style={{ marginTop: 0 }}>
          Ballads reuse a small vocabulary obsessively. Learn these and a breakup song stops being a wall of sound.
        </p>
        <div className="chips">
          {SONG_WORDS.map((w) => (
            <button key={w.ko} className="chip w" onClick={() => mine(w.ko, w.en, "song-pack")} title={w.note ?? w.en}>
              <span className="ko">{w.ko}</span>
              <span className="g">{w.en}</span>
            </button>
          ))}
        </div>
      </Panel>

      <h2 className="h2">How to actually learn from a song</h2>
      <div className="grid c3">
        <Panel title="1. Listen cold">
          <p className="small" style={{ margin: 0 }}>
            Play it twice with no lyrics in front of you. Write down the words you caught. You are training segmentation,
            not comprehension.
          </p>
        </Panel>
        <Panel title="2. Decode one verse">
          <p className="small" style={{ margin: 0 }}>
            Paste four lines into the Decoder. Mark only the <b>content</b> words as unknown — endings you can learn from
            the analysis, not by drilling.
          </p>
        </Panel>
        <Panel title="3. Shadow at 0.75×">
          <p className="small" style={{ margin: 0 }}>
            Sing along slowly, keeping vowels short. When you can do it at full speed without reading, the words are
            yours — melody included.
          </p>
        </Panel>
      </div>

      <div style={{ marginTop: 14 }}>
        <TimeLogger state={state} setState={setState} label="Listening timer" />
      </div>

      <p className="small" style={{ marginTop: 14 }}>
        Note on lyrics: this app deliberately does not bundle copyrighted lyrics. The Decoder works on any text you
        paste in — your own notes, a translation you own, or a line you typed out — and the rules above explain the
        grammar those lines use.
      </p>
    </div>
  )
}
