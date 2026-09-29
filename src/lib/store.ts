// Learning state: cards, sessions, streak, settings — persisted locally and mirrored to
// Netlify Blobs (key-value) through /api/state so the same progress code works on any device.
import { newCard } from "./fsrs"
import type { CardState } from "./fsrs"
import { buildItems, allCards } from "./deck"
import type { Item, Card } from "./deck"

export type DayStat = { reviewed: number; correct: number; newItems: number; minutes: number }

export type Settings = {
  reviewHelpDismissed: boolean
  newPerDay: number
  romanization: boolean
  autoSpeak: boolean
  showEnglish: boolean
  voiceName: string
  syncCode: string
  syncEnabled: boolean
}

export type CustomItem = { ko: string; en: string; source: string }

export type AppState = {
  version: 1
  cards: Record<string, CardState>
  custom: CustomItem[]
  hidden: string[]
  days: Record<string, DayStat>
  streak: { current: number; best: number; lastDay: string }
  totalMinutes: number
  settings: Settings
  updatedAt: number
}

const KEY = "kft.state.v1"
const CODE_KEY = "kft.syncCode"

export function todayKey(d = new Date()): string {
  return d.toISOString().slice(0, 10)
}

function randomCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  let s = ""
  for (let i = 0; i < 10; i++) s += alphabet[Math.floor(Math.random() * alphabet.length)]
  return s.slice(0, 5) + "-" + s.slice(5)
}

export function defaultState(): AppState {
  return {
    version: 1,
    cards: {},
    custom: [],
    hidden: [],
    days: {},
    streak: { current: 0, best: 0, lastDay: "" },
    totalMinutes: 0,
    settings: {
      reviewHelpDismissed: false,
      newPerDay: 15,
      romanization: true,
      autoSpeak: true,
      showEnglish: false,
      voiceName: "",
      syncCode: randomCode(),
      syncEnabled: true,
    },
    updatedAt: Date.now(),
  }
}

export function loadState(): AppState {
  if (typeof localStorage === "undefined") return defaultState()
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return defaultState()
    const parsed = JSON.parse(raw) as AppState
    const base = defaultState()
    return {
      ...base,
      ...parsed,
      settings: { ...base.settings, ...(parsed.settings || {}) },
      streak: { ...base.streak, ...(parsed.streak || {}) },
    }
  } catch {
    return defaultState()
  }
}

export function saveState(state: AppState): void {
  if (typeof localStorage === "undefined") return
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
    localStorage.setItem(CODE_KEY, state.settings.syncCode)
  } catch {
    /* quota — ignore */
  }
}

// ---------------------------------------------------------------- syncing

export type SyncResult = { ok: boolean; message: string; pulled?: number; pushed?: boolean }

async function api(method: "GET" | "POST", code: string, body?: unknown): Promise<Response> {
  return fetch("/api/state?code=" + encodeURIComponent(code), {
    method,
    headers: body ? { "content-type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  })
}

export function mergeStates(a: AppState, b: AppState): AppState {
  const cards: Record<string, CardState> = { ...a.cards }
  for (const [id, cardB] of Object.entries(b.cards || {})) {
    const cardA = cards[id]
    if (!cardA) { cards[id] = cardB; continue }
    const aLast = cardA.last ?? 0
    const bLast = cardB.last ?? 0
    cards[id] = bLast > aLast ? cardB : cardA
  }
  const days: Record<string, DayStat> = { ...a.days }
  for (const [d, s] of Object.entries(b.days || {})) {
    const cur = days[d]
    if (!cur) { days[d] = s; continue }
    days[d] = {
      reviewed: Math.max(cur.reviewed, s.reviewed),
      correct: Math.max(cur.correct, s.correct),
      newItems: Math.max(cur.newItems, s.newItems),
      minutes: Math.max(cur.minutes, s.minutes),
    }
  }
  const custom = [...a.custom]
  for (const c of b.custom || []) if (!custom.some((x) => x.ko === c.ko)) custom.push(c)
  const hidden = Array.from(new Set([...a.hidden, ...(b.hidden || [])]))
  return {
    ...a,
    cards,
    days,
    custom,
    hidden,
    streak: {
      current: Math.max(a.streak.current, b.streak.current),
      best: Math.max(a.streak.best, b.streak.best),
      lastDay: a.streak.lastDay > b.streak.lastDay ? a.streak.lastDay : b.streak.lastDay,
    },
    totalMinutes: Math.max(a.totalMinutes, b.totalMinutes),
    updatedAt: Math.max(a.updatedAt, b.updatedAt),
  }
}

/** Pull the remote copy, merge in both directions, push the merged result back. */
export async function syncNow(state: AppState): Promise<{ state: AppState; result: SyncResult }> {
  const code = state.settings.syncCode
  if (!code) return { state, result: { ok: false, message: "No sync code set." } }
  try {
    const res = await api("GET", code)
    if (!res.ok) throw new Error("HTTP " + res.status)
    const data = (await res.json()) as { state?: AppState | null }
    const remote = data.state || null
    let merged = state
    let pulled = 0
    let pushed = false
    if (remote) {
      merged = mergeStates(state, remote)
      pulled = Object.keys(merged.cards).length
    }
    merged = { ...merged, updatedAt: Date.now() }
    const put = await api("POST", code, { state: merged })
    pushed = put.ok
    if (!put.ok) throw new Error("push failed: HTTP " + put.status)
    return {
      state: merged,
      result: {
        ok: true,
        message: remote
          ? "Merged with the cloud copy (" + pulled + " cards) and uploaded."
          : "First upload — this progress code is now in the cloud.",
        pulled,
        pushed,
      },
    }
  } catch (err) {
    return {
      state,
      result: { ok: false, message: "Offline or no backend: " + (err instanceof Error ? err.message : String(err)) },
    }
  }
}

export async function pushState(state: AppState): Promise<boolean> {
  try {
    const res = await api("POST", state.settings.syncCode, { state })
    return res.ok
  } catch {
    return false
  }
}

// ---------------------------------------------------------------- helpers

export function cardState(state: AppState, cardId: string): CardState {
  return state.cards[cardId] ?? newCard()
}

export function ensureDay(state: AppState, day = todayKey()): DayStat {
  return state.days[day] ?? { reviewed: 0, correct: 0, newItems: 0, minutes: 0 }
}

export type Session = { items: Item[]; cards: Card[] }

export type DueSummary = {
  due: Card[]
  newCards: Card[]
  learning: Card[]
}

export function dueSummary(state: AppState, now = Date.now()): DueSummary {
  const items = buildItems()
  const known = new Set(state.hidden)
  const cards = allCards(items.filter((i) => !known.has(i.id)))
  const due: Card[] = []
  const newCards: Card[] = []
  const learning: Card[] = []
  for (const c of cards) {
    const s = state.cards[c.id]
    if (!s || s.phase === "new") { newCards.push(c); continue }
    if (s.due <= now) {
      if (s.phase === "learning" || s.phase === "relearn") learning.push(c)
      else due.push(c)
    }
  }
  return { due, newCards, learning }
}

export function itemById(items: Item[], id: string): Item | undefined {
  return items.find((i) => i.id === id)
}

export function coverageEstimate(knownItems: number): number {
  // Roughly: top-1000 items ≈ 75% of everyday speech, 3000 ≈ 95% of TV dialogue.
  const k = Math.max(0, knownItems)
  const pct = 75 * (1 - Math.exp(-k / 900)) + 20 * (1 - Math.exp(-k / 4000))
  return Math.min(98, Math.round(pct * 10) / 10)
}
