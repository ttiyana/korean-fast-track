// Turns the content files into reviewable cards. One item can yield several card modes,
// each of which is scheduled independently.
import { WORDS } from "../data/words"
import { GLUE } from "../data/glue"
import { GRAMMAR } from "../data/grammar"
import { DRAMA } from "../data/drama"
import { SCENARIOS } from "../data/scenarios"
import { SONG_WORDS, SONG_TITLES } from "../data/songs"

export type ItemKind = "word" | "glue" | "grammar" | "drama" | "scenario" | "song" | "title" | "mine"

export type Item = {
  id: string
  kind: ItemKind
  ko: string
  en: string
  note?: string
  example?: { ko: string; en: string }
  /** polite twin for casual drama lines */
  polite?: string
  topic?: string
  tier?: 1 | 2 | 3
  order: number
}

export type CardMode = "recognise" | "listen" | "recall"

export type Card = {
  id: string
  itemId: string
  mode: CardMode
}

const KIND_LABEL: Record<ItemKind, string> = {
  word: "Core word",
  glue: "Subtitle glue",
  grammar: "Grammar pattern",
  drama: "Drama line",
  scenario: "Situation phrase",
  song: "Song word",
  title: "Song title",
  mine: "Mined by you",
}

export function kindLabel(k: ItemKind): string {
  return KIND_LABEL[k]
}

export function buildItems(): Item[] {
  const items: Item[] = []
  let order = 0
  // The order matters: it is the frequency-first study order.
  for (const w of WORDS) {
    items.push({
      id: "w:" + w.ko,
      kind: "word",
      ko: w.ko,
      en: w.en,
      topic: w.topic,
      tier: w.tier,
      example: w.ex ?? undefined,
      order: order++,
    })
  }
  for (const g of GRAMMAR) {
    items.push({
      id: "gr:" + g.id,
      kind: "grammar",
      ko: g.pattern,
      en: g.meaning,
      note: g.note,
      example: g.examples[0],
      order: order++,
    })
  }
  for (const gl of GLUE) {
    items.push({ id: "g:" + gl.ko, kind: "glue", ko: gl.ko, en: gl.en, note: gl.note, order: order++ })
  }
  for (const group of DRAMA) {
    for (const line of group.lines) {
      items.push({
        id: "d:" + line.ko,
        kind: "drama",
        ko: line.ko,
        en: line.en,
        note: line.note,
        polite: line.polite,
        order: order++,
      })
    }
  }
  for (const sc of SCENARIOS) {
    for (const k of sc.key) {
      items.push({ id: "s:" + sc.id + ":" + k.ko, kind: "scenario", ko: k.ko, en: k.en, topic: sc.id, order: order++ })
    }
    for (const line of sc.lines) {
      items.push({
        id: "sl:" + sc.id + ":" + line.ko,
        kind: "scenario",
        ko: line.ko,
        en: line.en,
        note: line.note,
        topic: sc.id,
        order: order++,
      })
    }
  }
  for (const sw of SONG_WORDS) {
    items.push({ id: "sw:" + sw.ko, kind: "song", ko: sw.ko, en: sw.en, note: sw.note, order: order++ })
  }
  for (const t of SONG_TITLES) {
    items.push({
      id: "t:" + t.ko,
      kind: "title",
      ko: t.ko,
      en: t.literal + " — " + t.artist,
      order: order++,
    })
  }
  return items
}

const SYLL = /[\uac00-\ud7a3]/g

function syllableCount(s: string): number {
  return (s.match(SYLL) || []).length
}

/** Which card modes make sense for an item. */
export function modesFor(item: Item): CardMode[] {
  const modes: CardMode[] = ["recognise"]
  const n = syllableCount(item.ko)
  if (n >= 3) modes.push("listen")
  if (n <= 6) modes.push("recall")
  return modes
}

export function cardsFor(item: Item): Card[] {
  return modesFor(item).map((m) => ({ id: item.id + "|" + m, itemId: item.id, mode: m }))
}

export function allCards(items: Item[]): Card[] {
  const out: Card[] = []
  for (const it of items) out.push(...cardsFor(it))
  return out
}

export const MODE_LABEL: Record<CardMode, string> = {
  recognise: "Read → understand",
  listen: "Listen → understand",
  recall: "English → Korean",
}
