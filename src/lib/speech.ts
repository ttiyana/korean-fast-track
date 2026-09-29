// Korean text-to-speech through the browser's own speech engine (ko-KR voice when present).
export type VoiceInfo = { name: string; lang: string; local: boolean }

let cached: SpeechSynthesisVoice[] = []

export function listVoices(): SpeechSynthesisVoice[] {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return []
  const all = window.speechSynthesis.getVoices()
  if (all.length) cached = all
  return cached
}

export function koreanVoices(): SpeechSynthesisVoice[] {
  return listVoices().filter((v) => v.lang.toLowerCase().startsWith("ko"))
}

export function hasKoreanVoice(): boolean {
  return koreanVoices().length > 0
}

export function speak(text: string, opts: { rate?: number; voiceName?: string } = {}): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return
  const synth = window.speechSynthesis
  synth.cancel()
  const clean = text.replace(/[\[\]()"'…]/g, " ").trim()
  if (!clean) return
  const u = new SpeechSynthesisUtterance(clean)
  u.lang = "ko-KR"
  const ko = koreanVoices()
  const chosen = ko.find((v) => v.name === opts.voiceName) ?? ko[0]
  if (chosen) u.voice = chosen
  u.rate = opts.rate ?? 0.95
  u.pitch = 1
  synth.speak(u)
}

export function stopSpeaking(): void {
  if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel()
}
