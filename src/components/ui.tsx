import { useEffect, useId, useState } from "react"
import { romanize } from "../lib/hangul"
import { speak } from "../lib/speech"

export function Btn(props: {
  children: React.ReactNode
  onClick?: () => void
  variant?: "default" | "primary" | "ghost" | "jade"
  className?: string
  disabled?: boolean
  title?: string
}) {
  const cls = ["btn", props.variant && props.variant !== "default" ? props.variant : "", props.className || ""].join(" ")
  return (
    <button className={cls} onClick={props.onClick} disabled={props.disabled} title={props.title} type="button">
      {props.children}
    </button>
  )
}

export function SpeakBtn({ text, rate, big }: { text: string; rate?: number; big?: boolean }) {
  return (
    <button
      type="button"
      className="speak"
      style={big ? { width: 40, height: 40, fontSize: 16 } : undefined}
      title="Play Korean audio (browser voice)"
      onClick={(e) => {
        e.stopPropagation()
        speak(text, { rate: rate ?? 0.95 })
      }}
    >
      ▶
    </button>
  )
}

/** Korean text with an optional romanisation line and a play button. */
export function Ko({
  text,
  size = "mid",
  roman,
  showRoman = false,
  speak: withAudio = true,
  rate,
}: {
  text: string
  size?: "big" | "mid" | "inline"
  roman?: string
  showRoman?: boolean
  speak?: boolean
  rate?: number
}) {
  const cls = size === "big" ? "big-ko" : size === "mid" ? "mid-ko" : "ko"
  return (
    <div>
      <div className="row" style={{ gap: 10, flexWrap: "nowrap", alignItems: "center" }}>
        <span className={cls}>{text}</span>
        {withAudio ? <SpeakBtn text={text} rate={rate} /> : null}
      </div>
      {showRoman ? <div className="roman">{roman ?? romanize(text)}</div> : null}
    </div>
  )
}

export function Panel({ title, right, children }: { title?: string; right?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="panel">
      {title || right ? (
        <div className="row between" style={{ marginBottom: 12 }}>
          {title ? <h3 className="h2" style={{ margin: 0 }}>{title}</h3> : <span />}
          {right}
        </div>
      ) : null}
      {children}
    </section>
  )
}

export function Bar({ value, max, blue }: { value: number; max: number; blue?: boolean }) {
  const pct = max <= 0 ? 0 : Math.min(100, (value / max) * 100)
  return (
    <div className={"bar" + (blue ? " blue" : "")}>
      <i style={{ width: pct + "%" }} />
    </div>
  )
}

/** Progress ring. The caption lives outside the circle so nothing ever overflows the arc. */
export function Ring({
  value,
  label,
  unit = "%",
  caption,
  size = 156,
}: {
  value: number
  label?: string
  unit?: string
  caption?: string
  size?: number
}) {
  const gid = "ring-grad-" + useId().replace(/:/g, "")
  const stroke = 12
  const r = (size - stroke) / 2 - 3
  const c = 2 * Math.PI * r
  const pct = Math.max(0, Math.min(100, value))
  return (
    <div className="ring-wrap">
      <div className="ring" style={{ width: size, height: size }}>
        <svg width={size} height={size} role="img" aria-label={(label ?? String(pct)) + unit + (caption ? " " + caption : "")}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,.07)" strokeWidth={stroke} />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={"url(#" + gid + ")"}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={c - (pct / 100) * c}
            style={{ transition: "stroke-dashoffset .5s ease" }}
          />
          <defs>
            <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#ff6b5b" />
              <stop offset="100%" stopColor="#f0b95b" />
            </linearGradient>
          </defs>
        </svg>
        <div className="val">
          <b>
            {label ?? Math.round(pct)}
            <i>{unit}</i>
          </b>
        </div>
      </div>
      {caption ? <div className="ring-caption">{caption}</div> : null}
    </div>
  )
}

/** One headline number with a fixed card shape, so a row of stats always lines up. */
export function Stat({ label, value, unit, sub }: { label: string; value: React.ReactNode; unit?: string; sub?: string }) {
  return (
    <section className="panel stat">
      <div className="kicker">{label}</div>
      <div className="num">
        {value}
        {unit ? <small>{unit}</small> : null}
      </div>
      {sub ? <div className="sub">{sub}</div> : null}
    </section>
  )
}

export function Pill({ children, tone }: { children: React.ReactNode; tone?: "red" | "jade" | "blue" | "amber" }) {
  return <span className={"pill" + (tone ? " " + tone : "")}>{children}</span>
}

/** Hook that re-renders after speech voices load (they arrive asynchronously). */
export function useVoicesReady(): boolean {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return
    const tick = () => {
      if (window.speechSynthesis.getVoices().length) setReady(true)
    }
    tick()
    window.speechSynthesis.addEventListener("voiceschanged", tick)
    return () => window.speechSynthesis.removeEventListener("voiceschanged", tick)
  }, [])
  return ready
}
