// Local stand-in for the Netlify Function, for `npm run dev`. Same contract, JSON file store.
// Production uses netlify/functions/api.mjs with Netlify Blobs; this exists so the sync button
// can be exercised offline. Run: node scripts/dev-api.mjs (defaults to port 8787).
import { createServer } from "node:http"
import { readFileSync, writeFileSync, existsSync } from "node:fs"

const FILE = new URL("./.dev-store.json", import.meta.url).pathname
const PORT = Number(process.env.PORT || 8787)
const CODE_RE = /^[A-Z0-9-]{6,24}$/

function load() {
  try { return existsSync(FILE) ? JSON.parse(readFileSync(FILE, "utf8")) : {} } catch { return {} }
}
function save(db) { writeFileSync(FILE, JSON.stringify(db)) }

createServer((req, res) => {
  const url = new URL(req.url, "http://localhost")
  const code = (url.searchParams.get("code") || "").trim().toUpperCase()
  const send = (status, body) => {
    res.writeHead(status, { "content-type": "application/json" })
    res.end(JSON.stringify(body))
  }
  if (!url.pathname.startsWith("/api/state")) return send(404, { error: "not found" })
  if (!code) return send(400, { error: "missing code" })
  if (!CODE_RE.test(code)) return send(400, { error: "bad code" })
  const db = load()
  if (req.method === "GET") return send(200, { code, state: db[code] ?? null })
  if (req.method === "DELETE") { delete db[code]; save(db); return send(200, { ok: true }) }
  if (req.method === "POST") {
    let raw = ""
    req.on("data", (c) => { raw += c })
    req.on("end", () => {
      try {
        const parsed = JSON.parse(raw)
        if (!parsed.state) return send(400, { error: "missing state" })
        if (raw.length > 2_000_000) return send(413, { error: "state too large" })
        db[code] = parsed.state
        save(db)
        send(200, { ok: true, bytes: raw.length })
      } catch {
        send(400, { error: "invalid json" })
      }
    })
    return
  }
  send(405, { error: "method not allowed" })
}).listen(PORT, () => console.log("dev API on http://localhost:" + PORT))
