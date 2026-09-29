import { useState } from "react"
import { decode } from "../lib/decode"
import { Btn, Panel, Pill, Bar } from "../components/ui"
import type { AppState } from "../lib/store"
import { speak } from "../lib/speech"

type Props = {
  state: AppState
  setState: (fn: (s: AppState) => AppState) => void
  mine: (ko: string, en: string, source: string) => void
}

const SAMPLES: { label: string; ko: string }[] = [
  { label: "Shop", ko: "이거 얼마예요?" },
  { label: "Café", ko: "아이스 아메리카노 한 잔 주세요. 포장이에요." },
  { label: "Drama (casual)", ko: "내가 잘할게, 걱정하지 마." },
  { label: "Drama (polite)", ko: "죄송한데요, 조금 천천히 말해 주세요." },
  { label: "Song-style (no 요)", ko: "보고 싶어, 사랑해, 잊지 마." },
  { label: "Real subtitle shape", ko: "왜 이제 왔어? 나 혼자 계속 기다렸잖아." },
]

export default function Decoder({ state, setState, mine }: Props) {
  const [text, setText] = useState("")
  const result = text.trim() ? decode(text) : null
  const coverage = result ? Math.round((result.knownSyllables / result.totalSyllables) * 100) : 0

  return (
    <div>
      <h1 className="h1">Decoder</h1>
      <p className="sub">
        Paste any Korean: a subtitle line, a lyric you typed, a sign you photographed, a message someone sent you. The
        decoder splits it into the words you know, the endings that explain the grammar, and the gaps worth mining. The
        gaps go straight into your review deck.
      </p>

      <div className="row" style={{ marginBottom: 12 }}>
        {SAMPLES.map((s) => (
          <button key={s.label} className="chip" onClick={() => setText(s.ko)}>
            <span>{s.label}</span>
            <span className="g">{s.ko.slice(0, 22)}</span>
          </button>
        ))}
      </div>

      <Panel>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="여기에 한국어를 붙여 넣으세요 — paste Korean here"
          style={{ fontFamily: "var(--ko-font)", fontSize: 18 }}
        />
        <div className="row between" style={{ marginTop: 10 }}>
          <div className="row">
            <Btn variant="primary" onClick={() => text.trim() && speak(text, { rate: 0.8 })}>▶ Slow</Btn>
            <Btn onClick={() => text.trim() && speak(text, { rate: 1 })}>▶ Normal</Btn>
            <Btn variant="ghost" onClick={() => setText("")}>Clear</Btn>
          </div>
          {result ? <Pill tone="blue">{result.totalSyllables} syllables</Pill> : null}
        </div>
      </Panel>

      {result ? (
        <>
          <Panel title="Line analysis">
            <div className="chips" style={{ marginBottom: 12 }}>
              {result.tokens.map((t, i) =>
                t.text.trim() === "" ? null : t.kind === "ending" ? (
                  <span key={i} className="chip e" title={t.en}>
                    <span className="ko">{t.text}</span>
                    <span className="g">ending · {t.en}</span>
                  </span>
                ) : t.kind === "word" ? (
                  <span key={i} className="chip w" title={t.en}>
                    <span className="ko">{t.text}</span>
                    <span className="g">{t.en || "—"}</span>
                  </span>
                ) : (
                  <span key={i} className="chip u">
                    <span className="ko">{t.text}</span>
                    <span className="g">unknown</span>
                  </span>
                )
              )}
            </div>
            <div className="roman">{result.roman}</div>
            <div className="row" style={{ marginTop: 12 }}>
              <Pill tone="jade">{result.level}</Pill>
            </div>
            <div style={{ marginTop: 12 }}>
              <div className="row between small">
                <span>Known syllables</span>
                <span className="mono">{coverage}%</span>
              </div>
              <Bar value={coverage} max={100} blue />
            </div>
            <p className="small" style={{ marginTop: 10 }}>
              Endings are shown separately on purpose: 거야, 잖아, 려고 and friends are grammar, not vocabulary. Learn them
              from context here rather than as flashcards, and mine only the content words.
            </p>
          </Panel>

          <Panel
            title={result.unknownWords.length ? "Unknown words — worth mining (" + result.unknownWords.length + ")" : "Nothing unknown — nice"}
            right={
              result.unknownWords.length ? (
                <Btn
                  variant="primary"
                  onClick={() => {
                    for (const w of result.unknownWords) mine(w, "", "decoder")
                  }}
                >
                  Add all to my deck
                </Btn>
              ) : null
            }
          >
            {result.unknownWords.length ? (
              <div className="chips">
                {result.unknownWords.map((w) => (
                  <button key={w} className="chip u" onClick={() => mine(w, "", "decoder")}>
                    <span className="ko">{w}</span>
                    <span className="g">tap to add · no gloss yet</span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="small" style={{ margin: 0 }}>
                Every token matched something in the deck. Try a harder line, or add this whole line to your deck as a
                sentence card.
              </p>
            )}
            <div className="row" style={{ marginTop: 12 }}>
              <Btn variant="jade" onClick={() => mine(text.trim(), "", "decoder-line")}>Add the whole line as a card</Btn>
              <span className="small">Mined cards appear in your review queue as “Mined by you”, with the gloss you type in the Deck tab.</span>
            </div>
          </Panel>
        </>
      ) : (
        <p className="small">Paste a line above and the analysis appears here.</p>
      )}
    </div>
  )
}
