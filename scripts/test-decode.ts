import { decode } from "../src/lib/decode.ts"
for (const line of ["왜 이제 왔어? 나 혼자 계속 기다렸잖아.", "이거 얼마예요?", "밥 먹었어?", "아이스 아메리카노 한 잔 주세요.", "보고 싶어, 사랑해, 잊지 마."]) {
  const r = decode(line)
  console.log("\n" + line)
  console.log("  " + r.tokens.filter(t=>t.text.trim()).map(t => t.text + (t.kind === "unknown" ? "[?]" : t.kind === "ending" ? "{-}" : "(" + t.en + ")")).join(" "))
  console.log("  level: " + r.level.split(" —")[0] + " | known " + Math.round(r.knownSyllables / r.totalSyllables * 100) + "% | unknown: " + (r.unknownWords.join(",") || "none"))
}
