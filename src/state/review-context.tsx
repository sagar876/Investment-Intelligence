import { createContext, use, useEffect, useMemo, useReducer, type Dispatch, type ReactNode } from "react"
import { createInitialState, reviewReducer, type ReviewAction, type ReviewState } from "./review-reducer"

interface ReviewContextValue {
  state: ReviewState
  dispatch: Dispatch<ReviewAction>
}

const ReviewContext = createContext<ReviewContextValue | null>(null)

/** Simulated timings — deterministic so walkthroughs are repeatable. */
export const LOAD_MS = 650
export const ANALYSE_MS = 2600

export function ReviewProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reviewReducer, undefined, () => createInitialState("loading"))

  // loading → ready on a normal visit (the assessment is already analysed);
  // loading → analysing → ready only when replaying or after new documents.
  useEffect(() => {
    if (state.phase === "ready") return
    const next = state.phase === "loading" && state.analyseAfterLoad ? "analysing" : "ready"
    const t = window.setTimeout(() => dispatch({ type: "set-phase", phase: next }), state.phase === "loading" ? LOAD_MS : ANALYSE_MS)
    return () => window.clearTimeout(t)
  }, [state.phase, state.analyseAfterLoad])

  const value = useMemo(() => ({ state, dispatch }), [state])
  return <ReviewContext value={value}>{children}</ReviewContext>
}

export function useReview(): ReviewContextValue {
  const ctx = use(ReviewContext)
  if (!ctx) throw new Error("useReview must be used inside <ReviewProvider>")
  return ctx
}

export function nowStamp(date = new Date()): string {
  const d = date.toLocaleDateString("en-GB", { day: "numeric", month: "short" })
  const t = date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
  return `${d} · ${t}`
}
