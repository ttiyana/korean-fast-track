// The Decoder: paste any Korean line (drama subtitle, lyric, sign) and get it segmented,
// glossed, romanised, speech-level graded, and with the gaps marked.
import { WORDS } from "../data/words"
import { GLUE } from "../data/glue"
import { SONG_WORDS } from "../data/songs"
import { romanize, decompose, compose } from "./hangul"

export type Gloss = { text: string; en: string; kind: "word" | "ending" | "unknown"; note?: string }

export type DecodeResult = {
  tokens: Gloss[]
  roman: string
  level: string
  knownSyllables: number
  totalSyllables: number
  unknownWords: string[]
}

const DICT: Map<string, { en: string; note?: string }> = new Map()
for (const w of WORDS) DICT.set(w.ko, { en: w.en })
for (const g of GLUE) if (!DICT.has(g.ko)) DICT.set(g.ko, { en: g.en, note: g.note })
for (const s of SONG_WORDS) if (!DICT.has(s.ko)) DICT.set(s.ko, { en: s.en, note: s.note })

// Extra high-frequency spoken chunks the decks above do not carry as headwords.
const EXTRA: [string, string][] = [
  ["오늘", "today"], ["내일", "tomorrow"], ["어제", "yesterday"], ["진짜", "really"], ["정말", "really"],
  ["사람", "person"], ["시간", "time"], ["생각", "thought"], ["마음", "heart"], ["이름", "name"],
  ["학교", "school"], ["회사", "company"], ["집", "house"], ["물", "water"], ["밥", "meal, rice"],
  ["돈", "money"], ["일", "work, matter"], ["말", "words"], ["거", "thing"], ["것", "thing"],
  ["때", "when, time"], ["곳", "place"], ["중", "middle, among"], ["안", "inside; not"], ["밖", "outside"],
  ["위", "above"], ["아래", "below"], ["앞", "front"], ["뒤", "behind"], ["옆", "beside"],
  ["너", "you"], ["나", "I"], ["우리", "we, our"], ["저", "I (polite)"], ["누구", "who"], ["뭐", "what"],
  ["어디", "where"], ["언제", "when"], ["왜", "why"], ["어떻게", "how"], ["얼마", "how much"],
  ["아주", "very"], ["너무", "too, so"], ["많이", "a lot"], ["조금", "a little"], ["좀", "a bit; please"],
  ["다시", "again"], ["또", "again, also"], ["아직", "still, yet"], ["이미", "already"], ["항상", "always"],
  ["있다", "to exist, have"], ["없다", "to not exist"], ["하다", "to do"], ["되다", "to become"],
  ["가다", "to go"], ["오다", "to come"], ["보다", "to see"], ["먹다", "to eat"], ["주다", "to give"],
  ["받다", "to receive"], ["알다", "to know"], ["모르다", "to not know"], ["싶다", "to want"],
  ["좋다", "to be good"], ["없이", "without"], ["있는", "that exists"], ["하는", "that does"],
  ["아무", "any"], ["모든", "every, all"], ["다른", "other"], ["같은", "same, like"], ["이런", "this kind of"],
  ["그런", "that kind of"], ["어떤", "what kind of"], ["무슨", "what kind of"], ["새로운", "new"],
  ["사랑", "love"], ["미안", "sorry"], ["고마워", "thanks"], ["괜찮", "to be okay"], ["행복", "happiness"],
  ["슬픔", "sadness"], ["아픔", "pain"], ["기억", "memory"], ["약속", "promise"], ["영원", "eternity"],
  ["그대", "you (poetic)"], ["님", "beloved"], ["하늘", "sky"], ["별", "star"], ["바람", "wind"],
  ["꽃", "flower"], ["길", "road"], ["밤", "night"], ["꿈", "dream"], ["세상", "world"], ["시간", "time"],
  ["우리", "we"], ["혼자", "alone"], ["함께", "together"], ["마지막", "the last"], ["처음", "first time"],
  // Loanwords: free wins, and they turn up in every café, shop and lyric.
  ["아이스", "iced"], ["아메리카노", "americano"], ["라떼", "latte"], ["카푸치노", "cappuccino"],
  ["주스", "juice"], ["콜라", "cola"], ["케이크", "cake"], ["햄버거", "hamburger"], ["샌드위치", "sandwich"],
  ["아이스크림", "ice cream"], ["초콜릿", "chocolate"], ["스마트폰", "smartphone"], ["인터넷", "internet"],
  ["이메일", "email"], ["뉴스", "news"], ["쇼핑", "shopping"], ["파티", "party"], ["콘서트", "concert"],
  ["드라마", "drama (TV series)"], ["영화", "movie"], ["아이돌", "idol"], ["팬", "fan"], ["앨범", "album"],
  ["티켓", "ticket"], ["호텔", "hotel"], ["레스토랑", "restaurant"], ["셀카", "selfie"], ["메시지", "message"],
  ["스타일", "style"], ["리듬", "rhythm"], ["무드", "mood"], ["에너지", "energy"], ["스트레스", "stress"],
  ["다이어트", "diet"], ["알바", "part-time job (slang)"], ["회식", "company dinner"], ["노래방", "karaoke room"],
  ["볼링", "bowling"], ["게임", "game"], ["컴퓨터", "computer"], ["프로그램", "program"],
]
for (const [ko, en] of EXTRA) if (!DICT.has(ko)) DICT.set(ko, { en })

// Endings, longest first: they explain what is left after a stem.
export const ENDINGS: [string, string][] = [
  ["잖아요", "'you know' — reminding (polite)"], ["잖아", "'you know' — reminding (casual)"],
  ["거든요", "'you see, because'"], ["거든", "'you see, because' (casual)"],
  ["는데요", "background/softener (polite)"], ["는데", "background, 'and…/but…'"], ["은데", "background"], ["ㄴ데", "background"],
  ["으니까", "because (assertive)"], ["니까", "because"], ["니깐", "because (casual)"], ["으니", "because"],
  ["으려고", "in order to, intending to"], ["려고", "in order to"], ["으러", "in order to (with movement)"], ["러", "in order to"],
  ["기로 했", "decided to"], ["기로 하", "decide to"], ["을게요", "I'll (promise)"], ["ㄹ게요", "I'll (promise)"],
  ["을게", "I'll (casual)"], ["ㄹ게", "I'll (casual)"], ["을래요", "want to / shall we"], ["ㄹ래요", "want to"],
  ["을래", "want to (casual)"], ["ㄹ래", "want to (casual)"], ["을까요", "shall we?"], ["ㄹ까요", "shall we?"],
  ["을까", "shall we (casual)"], ["ㄹ까", "shall we"], ["을 거예요", "will (plan)"], ["ㄹ 거예요", "will"],
  ["을 거야", "will (casual)"], ["ㄹ 거야", "will (casual)"], ["을 것 같", "it seems it will"], ["ㄹ 것 같", "it seems it will"],
  ["고 싶", "want to"], ["아 주", "do for someone"], ["어 주", "do for someone"], ["해 주", "do for someone"],
  ["아도 되", "may, it's okay to"], ["어도 되", "may"], ["으면 안 되", "must not"], ["면 안 되", "must not"],
  ["아야 하", "must"], ["어야 하", "must"], ["아야 돼", "must"], ["어야 돼", "must"],
  ["고 있", "currently doing"], ["아 봤", "have tried"], ["어 봤", "have tried"], ["해 봤", "have tried"],
  ["는 것 같", "it seems"], ["은 것 같", "it seems"], ["ㄴ 것 같", "it seems"], ["것 같", "it seems"],
  ["지 마", "don't!"], ["지 마세요", "please don't"], ["아야", "only when / must"], ["어야", "only when"],
  ["으세요", "polite imperative / honorific"], ["세요", "polite imperative"], ["십시오", "formal imperative"],
  ["습니다", "formal polite present"], ["ㅂ니다", "formal polite present"], ["습니까", "formal polite question"],
  ["네요", "'oh, it is…' (realising)"], ["군요", "'I see, it is…'"], ["네", "'oh, it is' (casual)"],
  ["지요", "…right?"], ["죠", "…right?"], ["지", "…right? / of course"],
  ["았", "past"], ["었", "past"], ["했", "did (past)"], ["겠", "will, probably"],
  ["시", "honorific (subject respected)"], ["셨", "honorific past"],
  ["는", "modifier: that …s / topic"], ["은", "topic marker; modifier"], ["을", "object marker; will"],
  ["를", "object marker"], ["이", "subject marker"], ["가", "subject marker"], ["에", "to, at, in"],
  ["에서", "at, from"], ["으로", "by, to (means)"], ["로", "by, as, to"], ["와", "and, with"], ["과", "and, with"],
  ["도", "also, too"], ["만", "only"], ["의", "of, 's"], ["한테", "to a person"], ["에게", "to a person"],
  ["부터", "from"], ["까지", "until, to"], ["처럼", "like, as if"], ["보다", "than (comparison)"],
  ["마다", "every"], ["밖에", "only (with a negative)"], ["이나", "or, as much as"], ["나", "or"],
  ["자", "let's"], ["냐", "question (casual)"], ["니", "question (casual)"], ["세요", "please do"],
  ["다", "plain declarative"], ["요", "polite ending"], ["게", "so that / adverb form"], ["고", "and (joining)"],
  ["서", "so, because"], ["며", "and (formal)"], ["면", "if, when"], ["야", "must; 'is' (casual)"],
  ["아", "casual ending"], ["어", "casual ending"], ["해", "do (casual)"], ["는다", "plain declarative"],
]

const ENDINGS_SORTED = [...ENDINGS].sort((a, b) => b[0].length - a[0].length)
const SYLL = /[\uac00-\ud7a3]/g

// Compound vowels decompose into the vowel of the base stem plus the past-tense vowel:
// 왔 = 오 + 았, 갔 = 가 + 았, 됐 = 되 + 었, 줬 = 주 + 었. Reconstruct candidates and look them up.
const COMPOUND_VOWELS: Record<string, string[]> = {
  // y-vowels can come from i + 었 (기다리 + 었 → 기다렸), so ㅕ resolves back to ㅣ.
  "ㅕ": ["ㅣ", "ㅕ"],
  "ㅑ": ["ㅏ", "ㅑ"],
  "ㅠ": ["ㅜ", "ㅠ"],
  "ㅛ": ["ㅗ", "ㅛ"],
  "ㅖ": ["ㅔ", "ㅣ"],
  "ㅒ": ["ㅐ", "ㅒ"],
  "ㅔ": ["ㅓ", "ㅔ"],
  "ㅐ": ["ㅏ", "ㅐ"],
  "ㅘ": ["ㅗ", "ㅏ"],
  "ㅝ": ["ㅜ", "ㅓ"],
  "ㅙ": ["ㅚ", "ㅗ", "ㅐ"],
  "ㅞ": ["ㅜ", "ㅟ"],
  "ㅚ": ["ㅗ", "ㅣ"],
  "ㅢ": ["ㅡ", "ㅣ"],
}

/** Given a stem whose last syllable ends in ㅆ, guess the base stem(s). */
export function pastStemCandidates(stem: string): string[] {
  if (!stem) return []
  const last = stem[stem.length - 1]
  const d = decompose(last)
  if (!d) return []
  const [cho, jung, jong] = d
  if (jong !== "ㅆ" && jong !== "ㅆ") return []
  if (jong !== "ㅆ") return []
  const body = stem.slice(0, -1)
  const vowels = [jung, ...(COMPOUND_VOWELS[jung] ?? [])]
  const out = new Set<string>()
  for (const v of vowels) {
    const syl = compose(cho, v, "")
    if (syl) out.add(body + syl)
  }
  return Array.from(out)
}

// One-syllable dictionary hits that are almost always grammar, not vocabulary, mid-word.
const SINGLE_BLOCK = new Set(["다", "나", "이"])

function syllables(s: string): number {
  return (s.match(SYLL) || []).length
}

function stripEndings(token: string): { stems: string[]; endings: { text: string; en: string }[] } {
  const stems: string[] = []
  const endings: { text: string; en: string }[] = []
  let rest = token
  for (let guard = 0; guard < 4; guard++) {
    let matched = false
    for (const [end, gloss] of ENDINGS_SORTED) {
      if (rest.length > end.length && rest.endsWith(end)) {
        endings.unshift({ text: end, en: gloss })
        rest = rest.slice(0, rest.length - end.length)
        matched = true
        break
      }
    }
    if (!matched) break
  }
  if (rest) stems.push(rest)
  return { stems, endings }
}

function glossFor(stem: string): { en: string; note?: string } | null {
  const direct = DICT.get(stem)
  if (direct) return direct
  // Stems arrive stripped of endings, so rebuild the dictionary form: 먹 → 먹다, 피곤 → 피곤하다.
  for (const suffix of ["다", "하다", "되다", "이다"]) {
    const hit = DICT.get(stem + suffix)
    if (hit) return { en: hit.en + " (stem: " + stem + ")", note: hit.note }
  }
  return null
}

function greedySegment(token: string): Gloss[] {
  const out: Gloss[] = []
  let i = 0
  const maxLen = 4
  while (i < token.length) {
    let matched = false
    for (let len = Math.min(maxLen, token.length - i); len >= 1; len--) {
      const chunk = token.slice(i, i + len)
      const hit = DICT.get(chunk)
      const blocked = chunk.length === 1 && SINGLE_BLOCK.has(chunk) && token.length > 1
      if (hit && !blocked) {
        out.push({ text: chunk, en: hit.en, kind: "word", note: hit.note })
        i += len
        matched = true
        break
      }
    }
    if (!matched) {
      out.push({ text: token[i], en: "", kind: "unknown" })
      i += 1
    }
  }
  return out
}

export function decode(text: string): DecodeResult {
  const tokens: Gloss[] = []
  const unknown: string[] = []
  let known = 0
  let total = 0
  const parts = text.split(/(\s+|[.,!?…"'()\[\]~:;])/)
  for (const part of parts) {
    if (!part) continue
    if (/^\s+$/.test(part) || /^[.,!?…"'()\[\]~:;]$/.test(part)) {
      tokens.push({ text: part, en: "", kind: "word" })
      continue
    }
    total += syllables(part)
    const direct = DICT.get(part)
    if (direct) {
      tokens.push({ text: part, en: direct.en, kind: "word", note: direct.note })
      known += syllables(part)
      continue
    }
    const { stems, endings } = stripEndings(part)
    const stemParts: Gloss[] = []
    for (const stem of stems) {
      const hit = glossFor(stem)
      if (hit) {
        stemParts.push({ text: stem, en: hit.en, kind: "word", note: hit.note })
        known += syllables(stem)
        continue
      }
      // contracted past tense: 왔 → 오다, 갔 → 가다, 기다렸 → 기다리다
      const candidates = pastStemCandidates(stem)
      const pastHit = candidates.map((c) => ({ c, hit: glossFor(c) })).find((x) => x.hit)
      if (pastHit && pastHit.hit) {
        stemParts.push({ text: stem, en: pastHit.hit.en.replace(" (dictionary form " + pastHit.c + "다)", ""), kind: "word", note: "past tense of " + pastHit.c + "다" })
        known += syllables(stem)
        continue
      }
      for (const g of greedySegment(stem)) {
        stemParts.push(g)
        if (g.kind === "word") known += syllables(g.text)
        else unknown.push(g.text)
      }
    }
    tokens.push(...stemParts)
    for (const e of endings) {
      tokens.push({ text: e.text, en: e.en, kind: "ending" })
      known += syllables(e.text)
    }
  }
  const level = detectLevel(text)
  return {
    tokens,
    roman: romanize(text),
    level,
    knownSyllables: known,
    totalSyllables: Math.max(total, 1),
    unknownWords: Array.from(new Set(unknown)),
  }
}

export function detectLevel(text: string): string {
  const t = text.trim()
  if (/습니다|ㅂ니다|십시오|습니까/.test(t)) return "하십시오체 — formal polite (announcements, service, news)"
  if (/(요|죠|까|네요|세요)\s*[.?!…]*$/.test(t)) return "해요체 — polite informal (your default register)"
  if (/(다|냐|니|자|어|아|지|군)\s*[.?!…]*$/.test(t)) return "해체 / 반말 — casual speech (friends, family, screen dialogue)"
  return "Hard to classify — check the verb ending at the very end of the line."
}
