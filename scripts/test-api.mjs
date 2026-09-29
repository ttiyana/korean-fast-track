// Verifies the function's contract with a fake store — the same calls Netlify Blobs gets.
import { handleRequest } from "../netlify/functions/api.mjs"

function fakeStore() {
  const m = new Map()
  return {
    async get(k) { return m.has(k) ? JSON.parse(m.get(k)) : null },
    async setJSON(k, v) { m.set(k, JSON.stringify(v)) },
    async delete(k) { m.delete(k) },
    _dump: () => m,
  }
}

let failures = 0
function check(name, cond, extra = "") {
  console.log((cond ? "ok   " : "FAIL ") + name + (extra ? "  " + extra : ""))
  if (!cond) failures++
}

const store = fakeStore()
const base = "https://site.netlify.app/api/state"
const code = "TEST-CODE1"

let res = await handleRequest(new Request(base + "?code=" + code), store)
let body = await res.json()
check("GET on an empty code returns null state", res.status === 200 && body.state === null, JSON.stringify(body))

const state = { version: 1, cards: { "w:밥|recognise": { phase: "review", stability: 4.2, difficulty: 5.1, due: 123, reps: 3 } }, days: { "2026-09-29": { reviewed: 20 } } }
res = await handleRequest(new Request(base + "?code=" + code, { method: "POST", body: JSON.stringify({ state }) }), store)
body = await res.json()
check("POST stores the state", res.status === 200 && body.ok === true, JSON.stringify(body))

res = await handleRequest(new Request(base + "?code=" + code), store)
body = await res.json()
check("GET returns what was stored", body.state?.cards["w:밥|recognise"]?.stability === 4.2)

res = await handleRequest(new Request(base + "?code=lower-case"), store)
check("codes are normalised to upper case", res.status === 200)

res = await handleRequest(new Request(base + "?code=x"), store)
check("too-short codes are rejected", res.status === 400)

res = await handleRequest(new Request(base + "?code=" + code, { method: "POST", body: "not json" }), store)
check("invalid JSON is rejected", res.status === 400)

res = await handleRequest(new Request(base + "?code=" + code + "&x=1", { method: "PUT" }), store)
check("unsupported methods are rejected", res.status === 405)

res = await handleRequest(new Request("https://site.netlify.app/other?code=" + code), store)
check("other paths 404", res.status === 404)

res = await handleRequest(new Request(base + "?code=" + code, { method: "DELETE" }), store)
check("DELETE removes the record", res.status === 200 && store._dump().size === 0)

console.log(failures === 0 ? "\nALL API TESTS PASSED" : "\n" + failures + " FAILURES")
process.exit(failures === 0 ? 0 : 1)
