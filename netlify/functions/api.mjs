// Netlify Function: the progress store for Korean Fast Track.
// Key-value backend = Netlify Blobs. Progress is keyed by a short "sync code" the learner
// owns, so the same code on any device pulls the same data. No accounts, no PII.
import { getStore } from "@netlify/blobs"

const MAX_BYTES = 2_000_000 // 2 MB per sync code — far above any realistic deck state
const CODE_RE = /^[A-Z0-9-]{6,24}$/

const CORS = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store",
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: CORS })
}

/** Pure request handler so it can be unit-tested with a fake store (see scripts/test-api.mjs). */
export async function handleRequest(req, store) {
  const url = new URL(req.url)
  if (!url.pathname.endsWith("/api/state") && url.pathname !== "/api/state") {
    return json({ error: "not found" }, 404)
  }
  const code = (url.searchParams.get("code") || "").trim().toUpperCase()
  if (!code) return json({ error: "missing code" }, 400)
  if (!CODE_RE.test(code)) return json({ error: "bad code" }, 400)
  const key = "progress/" + code

  if (req.method === "GET") {
    const state = await store.get(key, { type: "json" })
    return json({ code, state: state || null })
  }

  if (req.method === "POST") {
    let body
    try {
      body = await req.json()
    } catch {
      return json({ error: "invalid json" }, 400)
    }
    if (!body || typeof body !== "object" || !body.state) return json({ error: "missing state" }, 400)
    const payload = JSON.stringify(body.state)
    if (payload.length > MAX_BYTES) return json({ error: "state too large" }, 413)
    await store.setJSON(key, body.state)
    return json({ ok: true, bytes: payload.length, savedAt: new Date().toISOString() })
  }

  if (req.method === "DELETE") {
    await store.delete(key)
    return json({ ok: true, deleted: code })
  }

  return json({ error: "method not allowed" }, 405)
}

export default async (req) => {
  const store = getStore({ name: "korean-fast-track", consistency: "strong" })
  return handleRequest(req, store)
}

export const config = { path: "/api/state" }
