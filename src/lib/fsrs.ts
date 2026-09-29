// FSRS-6 style scheduler. Default parameters and the decay constant are the published
// FSRS-6 defaults (open-spaced-repetition); intervals are solved from the power forgetting curve.

export type Grade = 1 | 2 | 3 | 4 // Again, Hard, Good, Easy

export type CardState = {
  phase: "new" | "learning" | "review" | "relearn"
  stability: number // days
  difficulty: number // 1..10
  due: number // epoch ms
  step: number // index into the learning steps
  reps: number
  lapses: number
  last: number | null
}

const W = [
  0.212, 1.2931, 2.3065, 8.2956, 6.4133, 0.8334, 3.0194, 0.001, 1.8722, 0.1666,
  0.796, 1.4835, 0.0614, 0.2629, 1.6483, 0.6014, 1.8729, 0.5425, 0.0912, 0.0658, 0.1542,
]
const DECAY = W[20]
const FACTOR = Math.pow(0.9, 1 / -DECAY) - 1
export const LEARNING_STEPS_MIN = [1, 10] // minutes
export const RELEARN_STEPS_MIN = [5, 10]
export const DESIRED_RETENTION = 0.9

export const MIN_STABILITY = 0.01
const MAX_INTERVAL_DAYS = 3650

export function newCard(now = Date.now()): CardState {
  return { phase: "new", stability: 0, difficulty: 0, due: now, step: 0, reps: 0, lapses: 0, last: null }
}

/** Probability of recall after `elapsedDays` with the given stability. */
export function retrievability(stability: number, elapsedDays: number): number {
  if (stability <= 0) return 0
  return Math.pow(elapsedDays / stability * FACTOR + 1, -DECAY)
}

/** Interval in days that lands exactly on the desired retention. */
export function intervalFor(stability: number, retention = DESIRED_RETENTION): number {
  const days = stability / FACTOR * (Math.pow(retention, 1 / -DECAY) - 1)
  return Math.min(MAX_INTERVAL_DAYS, Math.max(0, days))
}

function initDifficulty(g: Grade): number {
  return clamp(W[4] - Math.exp(W[5] * (g - 1)) + 1, 1, 10)
}
function initStability(g: Grade): number {
  return Math.max(MIN_STABILITY, W[g - 1])
}
function clamp(x: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, x))
}
function nextDifficulty(d: number, g: Grade): number {
  const delta = d - W[6] * (g - 3)
  const meanReversion = W[7] * initDifficulty(4) + (1 - W[7]) * delta
  return clamp(meanReversion, 1, 10)
}

function stabilityAfterRecall(d: number, s: number, r: number, g: Grade): number {
  const hardPenalty = g === 2 ? W[15] : 1
  const easyBonus = g === 4 ? W[16] : 1
  const growth = Math.exp(W[8]) * (11 - d) * Math.pow(s, -W[9]) * (Math.exp(W[10] * (1 - r)) - 1)
  const next = s * (1 + growth * hardPenalty * easyBonus)
  return clamp(next, MIN_STABILITY, 36500)
}

function stabilityAfterLapse(d: number, s: number, r: number): number {
  const next = W[11] * Math.pow(d, -W[12]) * (Math.pow(s + 1, W[13]) - 1) * Math.exp(W[14] * (1 - r))
  return clamp(next, MIN_STABILITY, 36500)
}

export type ScheduleResult = { card: CardState; intervalDays: number; nextDue: number }

/** Apply a review grade and return the updated card plus the new interval. */
export function schedule(card: CardState, grade: Grade, now = Date.now()): ScheduleResult {
  const elapsed = card.last === null ? 0 : Math.max(0, (now - card.last) / 86400000)

  if (card.phase === "new" || card.phase === "learning" || card.phase === "relearn") {
    const steps = card.phase === "relearn" ? RELEARN_STEPS_MIN : LEARNING_STEPS_MIN
    const isFirst = card.phase === "new"
    let stability = card.stability
    let difficulty = card.difficulty

    if (grade === 1) {
      stability = isFirst ? initStability(1) : clamp(stability * 0.5, MIN_STABILITY, 36500)
      difficulty = isFirst ? initDifficulty(1) : nextDifficulty(difficulty, 1)
      if (!isFirst && card.phase !== "relearn") card.lapses += 1
      const step = 0
      const minutes = steps[step]
      const next = {
        phase: "relearn" as const,
        stability, difficulty, step,
        due: now + minutes * 60000,
        reps: card.reps + 1,
        lapses: card.lapses,
        last: now,
      }
      return { card: next, intervalDays: minutes / 1440, nextDue: next.due }
    }

    if (isFirst) {
      stability = initStability(grade)
      difficulty = initDifficulty(grade)
    } else {
      const r = retrievability(stability, Math.max(elapsed, 0.02))
      stability = stabilityAfterRecall(difficulty, stability, r, grade)
      difficulty = nextDifficulty(difficulty, grade)
    }

    const step = grade === 2 ? card.step : card.step + 1
    if (grade === 4 || step >= steps.length) {
      const days = Math.max(1, Math.round(intervalFor(stability)))
      const next = {
        phase: "review" as const,
        stability, difficulty, step: 0,
        due: now + days * 86400000,
        reps: card.reps + 1, lapses: card.lapses, last: now,
      }
      return { card: next, intervalDays: days, nextDue: next.due }
    }
    const minutes = steps[step]
    const next = {
      phase: card.phase,
      stability, difficulty, step,
      due: now + minutes * 60000,
      reps: card.reps + 1, lapses: card.lapses, last: now,
    }
    return { card: next, intervalDays: minutes / 1440, nextDue: next.due }
  }

  // review phase
  const r = retrievability(card.stability, Math.max(elapsed, 0.02))
  if (grade === 1) {
    const stability = stabilityAfterLapse(card.difficulty, card.stability, r)
    const difficulty = nextDifficulty(card.difficulty, 1)
    const minutes = RELEARN_STEPS_MIN[0]
    const next = {
      phase: "relearn" as const,
      stability, difficulty, step: 0,
      due: now + minutes * 60000,
      reps: card.reps + 1, lapses: card.lapses + 1, last: now,
    }
    return { card: next, intervalDays: minutes / 1440, nextDue: next.due }
  }
  const stability = stabilityAfterRecall(card.difficulty, card.stability, r, grade)
  const difficulty = nextDifficulty(card.difficulty, grade)
  const raw = intervalFor(stability)
  const days = Math.max(1, Math.round(raw))
  const next = {
    phase: "review" as const,
    stability, difficulty, step: 0,
    due: now + days * 86400000,
    reps: card.reps + 1, lapses: card.lapses, last: now,
  }
  return { card: next, intervalDays: days, nextDue: next.due }
}

export function formatInterval(days: number): string {
  if (days < 1 / 24) return Math.max(1, Math.round(days * 1440)) + " min"
  if (days < 1) return Math.round(days * 24) + " h"
  if (days < 30) return Math.round(days) + " d"
  if (days < 365) return (days / 30).toFixed(1) + " mo"
  return (days / 365).toFixed(1) + " y"
}

export function previewIntervals(card: CardState, now = Date.now()): Record<Grade, string> {
  const out = {} as Record<Grade, string>
  for (const g of [1, 2, 3, 4] as Grade[]) {
    out[g] = formatInterval(schedule(card, g, now).intervalDays)
  }
  return out
}
