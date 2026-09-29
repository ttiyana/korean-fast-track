// Hangul plumbing: jamo tables, syllable composition, an approximate Revised-Romanisation
// romaniser (with linking, nasalisation, ㅎ-weakening, liquidisation and aspiration), plus facts.

export const CHOSEONG = ["ㄱ","ㄲ","ㄴ","ㄷ","ㄸ","ㄹ","ㅁ","ㅂ","ㅃ","ㅅ","ㅆ","ㅇ","ㅈ","ㅉ","ㅊ","ㅋ","ㅌ","ㅍ","ㅎ"]
export const JUNGSEONG = ["ㅏ","ㅐ","ㅑ","ㅒ","ㅓ","ㅔ","ㅕ","ㅖ","ㅗ","ㅘ","ㅙ","ㅚ","ㅛ","ㅜ","ㅝ","ㅞ","ㅟ","ㅠ","ㅡ","ㅢ","ㅣ"]
export const JONGSEONG = ["","ㄱ","ㄲ","ㄳ","ㄴ","ㄵ","ㄶ","ㄷ","ㄹ","ㄺ","ㄻ","ㄼ","ㄽ","ㄾ","ㄿ","ㅀ","ㅁ","ㅂ","ㅄ","ㅅ","ㅆ","ㅇ","ㅈ","ㅊ","ㅋ","ㅌ","ㅍ","ㅎ"]

export const CONSONANT_INFO = [
  { jamo: "ㄱ", name: "기역", rom: "g / k", tip: "Soft g between vowels, clipped k at the end of a syllable." },
  { jamo: "ㄲ", name: "쌍기역", rom: "kk", tip: "Tense: tightened throat, no puff of air. 쌍 = 'twin'." },
  { jamo: "ㄴ", name: "니은", rom: "n", tip: "Tongue tip behind the top teeth." },
  { jamo: "ㄷ", name: "디귿", rom: "d / t", tip: "Soft d between vowels, clipped t at the end." },
  { jamo: "ㄸ", name: "쌍디귿", rom: "tt", tip: "Tense d — a hard stop with no breath." },
  { jamo: "ㄹ", name: "리을", rom: "r / l", tip: "A flap, like the t in American 'butter' — r between vowels, l at the end." },
  { jamo: "ㅁ", name: "미음", rom: "m", tip: "The letter shape is a mouth." },
  { jamo: "ㅂ", name: "비읍", rom: "b / p", tip: "Soft b between vowels, clipped p at the end." },
  { jamo: "ㅃ", name: "쌍비읍", rom: "pp", tip: "Tense p, no air." },
  { jamo: "ㅅ", name: "시옷", rom: "s", tip: "Aspirated s; softens towards sh before ㅣ." },
  { jamo: "ㅆ", name: "쌍시옷", rom: "ss", tip: "Tense s." },
  { jamo: "ㅇ", name: "이응", rom: "silent / ng", tip: "Silent at the start of a syllable, ng at the end. It holds the vowel." },
  { jamo: "ㅈ", name: "지읒", rom: "j", tip: "Soft j, halfway to a light ch." },
  { jamo: "ㅉ", name: "쌍지읒", rom: "jj", tip: "Tense j, no breath." },
  { jamo: "ㅊ", name: "치읓", rom: "ch", tip: "Aspirated ch, with a puff." },
  { jamo: "ㅋ", name: "키읔", rom: "k", tip: "Aspirated k — the extra stroke signals escaping air." },
  { jamo: "ㅌ", name: "티읕", rom: "t", tip: "Aspirated t." },
  { jamo: "ㅍ", name: "피읖", rom: "p", tip: "Aspirated p." },
  { jamo: "ㅎ", name: "히읗", rom: "h", tip: "A soft breath that often vanishes into the next sound." },
]

export const VOWEL_INFO = [
  { jamo: "ㅏ", name: "아", rom: "a", tip: "a as in father." },
  { jamo: "ㅓ", name: "어", rom: "eo", tip: "The tricky one: the u of 'sun', with a relaxed wide mouth." },
  { jamo: "ㅗ", name: "오", rom: "o", tip: "o as in more; the stroke points up." },
  { jamo: "ㅜ", name: "우", rom: "u", tip: "oo as in moon; the stroke points down." },
  { jamo: "ㅡ", name: "으", rom: "eu", tip: "Flat unrounded u — say 'oo' while smiling." },
  { jamo: "ㅣ", name: "이", rom: "i", tip: "ee as in see." },
  { jamo: "ㅐ", name: "애", rom: "ae", tip: "Open e. It is literally ㅏ + ㅣ." },
  { jamo: "ㅔ", name: "에", rom: "e", tip: "In modern speech ㅐ and ㅔ sound the same; ㅔ is ㅓ + ㅣ." },
  { jamo: "ㅑ", name: "야", rom: "ya", tip: "y + a, written with a doubled stroke." },
  { jamo: "ㅕ", name: "여", rom: "yeo", tip: "y + eo." },
  { jamo: "ㅛ", name: "요", rom: "yo", tip: "y + o." },
  { jamo: "ㅠ", name: "유", rom: "yu", tip: "y + u." },
  { jamo: "ㅒ", name: "얘", rom: "yae", tip: "y + ae." },
  { jamo: "ㅖ", name: "예", rom: "ye", tip: "y + e, as in 예 ('yes')." },
  { jamo: "ㅘ", name: "와", rom: "wa", tip: "o + a in one glide." },
  { jamo: "ㅙ", name: "왜", rom: "wae", tip: "o + ae. 왜 means 'why'." },
  { jamo: "ㅚ", name: "외", rom: "oe", tip: "Modern speakers say it like 왜." },
  { jamo: "ㅝ", name: "워", rom: "wo", tip: "u + eo, the sound in 워 (wow)." },
  { jamo: "ㅞ", name: "웨", rom: "we", tip: "u + e, said like we." },
  { jamo: "ㅟ", name: "위", rom: "wi", tip: "u + i, said like wee." },
  { jamo: "ㅢ", name: "의", rom: "ui", tip: "eu + i; as the particle 의 ('of') most people just say 에." },
]

export const BATCHIM_RULES = [
  { rule: "Seven sounds only", example: "꽃 · 옷 · 낮", reads: "꼳 · 옫 · 낟", note: "Every 받침 ends up as one of seven sounds: ㄱ, ㄴ, ㄷ, ㄹ, ㅁ, ㅂ, ㅇ. The written letter often lies — ㅅ, ㅆ, ㅈ, ㅊ, ㅌ, ㅎ all collapse to a 'd' sound at the end." },
  { rule: "Linking (연음)", example: "한국어", reads: "한구거 · hangugeo", note: "A 받침 followed by a vowel moves into the next syllable. This is why Korean speech sounds like one continuous river." },
  { rule: "ㅎ disappears", example: "좋아요", reads: "조아요 · joayo", note: "Between vowels, ㅎ drops out. 좋아요 is [조아요], not [조하요]." },
  { rule: "Nasalisation", example: "감사합니다", reads: "감사함니다 · gamsahamnida", note: "ㄱ/ㄷ/ㅂ before ㄴ or ㅁ become ng/n/m: 합니다 → 함니다, 받는다 → 반는다, 국물 → 궁물." },
  { rule: "Liquidisation", example: "연락 · 실내", reads: "열락 · 실래 · yeollak · sillae", note: "ㄴ + ㄹ or ㄹ + ㄴ becomes a double l." },
  { rule: "ㄱ/ㅂ + ㄹ", example: "종로 · 독립", reads: "종노 · 동닙 · Jongno · dongnip", note: "The ㄹ turns into n and the consonant before it nasalises." },
  { rule: "Aspiration (거센소리)", example: "축하 · 좋다", reads: "추카 · 조타 · chuka · jota", note: "ㅎ meeting ㄱ/ㄷ/ㅂ/ㅈ fuses into an aspirated sound." },
  { rule: "Tensification (경음화)", example: "학교 · 식당", reads: "학꾜 · 식땅 · hakkyo · sikttang", note: "After a stopped 받침 the next consonant tightens. Listen for the tightness — Romanisation stays simple." },
]

export const HANGUL_FACTS = [
  "한글 is featural: each consonant shape is a drawing of the mouth or tongue position that makes the sound.",
  "14 basic consonants + 5 doubled = 19; 10 basic vowels + 11 combinations = 21. That is the whole system.",
  "Syllables sit in square blocks: initial + vowel, plus an optional final consonant (받침, 'support').",
  "No upper case, no cursive, no silent-letter chaos — reading is deduction, not memorisation.",
  "King Sejong's 1443 preface said the letters were made so that 'a wise man can learn them in a morning'.",
]

export function decompose(ch: string): [string, string, string] | null {
  const code = ch.codePointAt(0)
  if (code === undefined || code < 0xac00 || code > 0xd7a3) return null
  const i = code - 0xac00
  return [CHOSEONG[Math.floor(i / 588)], JUNGSEONG[Math.floor((i % 588) / 28)], JONGSEONG[i % 28]]
}

export function compose(cho: string, jung: string, jong = ""): string {
  const ci = CHOSEONG.indexOf(cho), ji = JUNGSEONG.indexOf(jung), ki = JONGSEONG.indexOf(jong)
  if (ci < 0 || ji < 0 || ki < 0) return ""
  return String.fromCharCode(0xac00 + ci * 588 + ji * 28 + ki)
}

export function isHangul(ch: string): boolean {
  const c = ch.codePointAt(0)
  return c !== undefined && c >= 0xac00 && c <= 0xd7a3
}

const CHO_ROM: Record<string, string> = { "ㄱ": "g", "ㄲ": "kk", "ㄴ": "n", "ㄷ": "d", "ㄸ": "tt", "ㄹ": "r", "ㅁ": "m", "ㅂ": "b", "ㅃ": "pp", "ㅅ": "s", "ㅆ": "ss", "ㅇ": "", "ㅈ": "j", "ㅉ": "jj", "ㅊ": "ch", "ㅋ": "k", "ㅌ": "t", "ㅍ": "p", "ㅎ": "h" }
const JUNG_ROM: Record<string, string> = { "ㅏ": "a", "ㅐ": "ae", "ㅑ": "ya", "ㅒ": "yae", "ㅓ": "eo", "ㅔ": "e", "ㅕ": "yeo", "ㅖ": "ye", "ㅗ": "o", "ㅘ": "wa", "ㅙ": "wae", "ㅚ": "oe", "ㅛ": "yo", "ㅜ": "u", "ㅝ": "wo", "ㅞ": "we", "ㅟ": "wi", "ㅠ": "yu", "ㅡ": "eu", "ㅢ": "ui", "ㅣ": "i" }
const JONG_ROM: Record<string, string> = { "": "", "ㄱ": "k", "ㄲ": "k", "ㄳ": "k", "ㄴ": "n", "ㄵ": "n", "ㄶ": "n", "ㄷ": "t", "ㄹ": "l", "ㄺ": "k", "ㄻ": "m", "ㄼ": "l", "ㄽ": "l", "ㄾ": "l", "ㄿ": "p", "ㅀ": "l", "ㅁ": "m", "ㅂ": "p", "ㅄ": "p", "ㅅ": "t", "ㅆ": "t", "ㅇ": "ng", "ㅈ": "t", "ㅊ": "t", "ㅋ": "k", "ㅌ": "t", "ㅍ": "p", "ㅎ": "t" }
const JONG_TO_ONSET: Record<string, string> = { "ㄱ": "g", "ㄲ": "kk", "ㄳ": "k", "ㄴ": "n", "ㄵ": "n", "ㄶ": "n", "ㄷ": "d", "ㄹ": "r", "ㄺ": "k", "ㄻ": "m", "ㄼ": "l", "ㄽ": "l", "ㄾ": "l", "ㄿ": "p", "ㅀ": "l", "ㅁ": "m", "ㅂ": "b", "ㅄ": "p", "ㅅ": "s", "ㅆ": "ss", "ㅇ": "ng", "ㅈ": "j", "ㅊ": "ch", "ㅋ": "k", "ㅌ": "t", "ㅍ": "p", "ㅎ": "h" }
const NASAL_STOP = new Set(["ㄷ", "ㅅ", "ㅆ", "ㅈ", "ㅊ", "ㅌ", "ㅎ", "ㄵ", "ㄶ", "ㄳ"])
const NASAL_VELAR = new Set(["ㄱ", "ㄲ", "ㅋ", "ㄺ"])
const NASAL_LABIAL = new Set(["ㅂ", "ㅍ", "ㅄ", "ㄼ", "ㄿ"])
const ASPIRATE: Record<string, string> = { g: "k", d: "t", b: "p", j: "ch", s: "ss" }

type Syl = { cho: string; jung: string; jong: string }

function romToken(token: string): string {
  const syls: Syl[] = []
  for (const ch of token) {
    const d = decompose(ch)
    if (d) syls.push({ cho: d[0], jung: d[1], jong: d[2] })
  }
  if (!syls.length) return token
  const onset: string[] = syls.map((s) => CHO_ROM[s.cho])
  const coda: string[] = syls.map((s) => JONG_ROM[s.jong])
  for (let i = 0; i < syls.length - 1; i++) {
    const pf = syls[i].jong
    const no = syls[i + 1].cho
    if (pf === "") {
      if (no === "ㄹ" && syls[i].cho === "ㄹ") onset[i + 1] = "l"            // 빨리 → ppalli
      continue
    }
    if (no === "ㅇ") {                                                        // linking / ㅎ loss
      coda[i] = ""
      onset[i + 1] = pf === "ㅎ" ? "" : pf === "ㄶ" ? "n" : pf === "ㅀ" ? "r" : (JONG_TO_ONSET[pf] ?? "")
      continue
    }
    if (no === "ㄴ" || no === "ㅁ") {                                         // nasalisation
      if (pf === "ㅎ") coda[i] = no === "ㄴ" ? "n" : "m"
      else if (pf === "ㄶ") coda[i] = "n"
      else if (pf === "ㅀ") coda[i] = "l"
      else if (NASAL_VELAR.has(pf)) coda[i] = "ng"
      else if (NASAL_LABIAL.has(pf)) coda[i] = "m"
      else if (NASAL_STOP.has(pf)) coda[i] = "n"
      else if (pf === "ㄹ" && no === "ㄴ") onset[i + 1] = "l"                  // 실내 → sillae
      continue
    }
    if (no === "ㄹ") {                                                        // liquidisation
      if (pf === "ㄹ" || pf === "ㄴ") { coda[i] = "l"; onset[i + 1] = "l" }
      else if (pf === "ㅇ" || NASAL_VELAR.has(pf)) { coda[i] = "ng"; onset[i + 1] = "n" }  // 종로 → Jongno
      else if (NASAL_LABIAL.has(pf)) { coda[i] = "m"; onset[i + 1] = "n" }    // 협력 → hyeomnyeok
      else if (pf === "ㅁ") { coda[i] = "m"; onset[i + 1] = "n" }
      else { coda[i] = "n"; onset[i + 1] = "n" }
      continue
    }
    if (no === "ㅎ") {                                                        // aspiration from the coda
      if (pf === "ㄱ" || pf === "ㄲ" || pf === "ㅋ" || pf === "ㄺ") onset[i + 1] = ""
      else if (pf === "ㄷ" || pf === "ㅅ" || pf === "ㅆ" || pf === "ㅌ") { coda[i] = "t"; onset[i + 1] = "" }
      else if (pf === "ㅂ" || pf === "ㅍ" || pf === "ㅄ" || pf === "ㄼ" || pf === "ㄿ") onset[i + 1] = ""
      else if (pf === "ㅈ" || pf === "ㅊ") { coda[i] = ""; onset[i + 1] = "ch" }
      else if (pf === "ㄶ") { coda[i] = "n"; onset[i + 1] = "" }
      else if (pf === "ㅀ") { coda[i] = "l"; onset[i + 1] = "" }
      continue
    }
    if (pf === "ㅎ" || pf === "ㄶ" || pf === "ㅀ") {                          // ㅎ coda meets a consonant
      if (pf === "ㅎ") {
        coda[i] = ""
        onset[i + 1] = no === "ㅅ" ? "s" : (ASPIRATE[onset[i + 1]] ?? onset[i + 1])   // 좋다 → jota, 좋습니다 → joseumnida
      } else if (pf === "ㄶ") {
        coda[i] = no === "ㅅ" ? "n" : "n"
      } else {
        coda[i] = "l"
      }
      continue
    }
    if ((no === "ㅅ" || no === "ㅆ") && (pf === "ㄷ" || pf === "ㅅ" || pf === "ㅆ" || pf === "ㅌ")) {
      coda[i] = "s"                                                           // 있습니다 → isseumnida
      continue
    }
  }
  return syls.map((s, i) => onset[i] + JUNG_ROM[s.jung] + coda[i]).join("")
}

/** Approximate Revised Romanisation. Non-Hangul text passes through untouched. */
export function romanize(text: string): string {
  return text
    .split(/(\s+)/)
    .map((part) => (/\s/.test(part) ? part : romToken(part)))
    .join("")
}

/** Tokens of Hangul syllables split into jamo, for the syllable builder. */
export function jamoSpell(text: string): string[] {
  const out: string[] = []
  for (const ch of text) {
    const d = decompose(ch)
    if (!d) continue
    out.push(d[0] + d[1] + d[2])
  }
  return out
}

export function randomSyllables(n: number): string[] {
  const { CHOSEONG: C, JUNGSEONG: V, JONGSEONG: J } = { CHOSEONG, JUNGSEONG, JONGSEONG }
  const out: string[] = []
  while (out.length < n) {
    const cho = C[Math.floor(Math.random() * C.length)]
    const jung = V[Math.floor(Math.random() * V.length)]
    const jong = J[Math.floor(Math.random() * J.length)]
    const ch = compose(cho, jung, jong)
    if (ch) out.push(ch)
  }
  return out
}
