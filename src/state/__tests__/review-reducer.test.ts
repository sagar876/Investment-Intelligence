import { describe, expect, it } from "vitest"
import { UPLOAD_FINDING } from "@/data/meridian"
import {
  blockingFindings,
  canSubmit,
  createInitialState,
  reviewReducer,
  reviewedCount,
  visibleFindings,
  type ReviewAction,
  type ReviewState,
} from "../review-reducer"

const by = { by: "Test Analyst", at: "17 Nov · 10:00" }
const run = (s: ReviewState, ...actions: ReviewAction[]) => actions.reduce(reviewReducer, s)
const accept = (id: string): ReviewAction => ({ type: "decide", id, status: "accepted", ...by })

describe("review gate (human-in-the-loop)", () => {
  it("starts with 2 of 6 reviewed and 3 blocking Critical/High findings", () => {
    const s = createInitialState("ready")
    expect(reviewedCount(s)).toBe(2)
    expect(blockingFindings(s).map((f) => f.id)).toEqual(["F-01", "F-02", "F-03"])
    expect(canSubmit(s)).toBe(false)
  })

  it("treats Flagged as unresolved — flagging a High finding keeps IC submission locked", () => {
    const s = run(createInitialState("ready"), accept("F-01"), accept("F-02"))
    expect(blockingFindings(s).map((f) => f.id)).toEqual(["F-03"])
    expect(canSubmit(s)).toBe(false)
  })

  it("unlocks submission once every Critical/High finding is accepted or rejected", () => {
    const s = run(
      createInitialState("ready"),
      accept("F-01"),
      accept("F-02"),
      { type: "decide", id: "F-03", status: "rejected", reason: "Renewals already contracted", ...by },
    )
    expect(canSubmit(s)).toBe(true)
  })

  it("replay runs loading → analysing; a normal load skips analysis", () => {
    const s = reviewReducer(createInitialState("ready"), { type: "replay-analysis" })
    expect(s.phase).toBe("loading")
    expect(s.analyseAfterLoad).toBe(true)
    expect(createInitialState().analyseAfterLoad).toBe(false)
  })

  it("ignores a submit action while the gate is closed", () => {
    const s = run(createInitialState("ready"), { type: "submit", at: "now" })
    expect(s.submittedAt).toBeNull()
  })

  it("locks decisions after submission", () => {
    const ready = run(createInitialState("ready"), accept("F-01"), accept("F-02"), accept("F-03"), { type: "submit", at: "now" })
    expect(ready.submittedAt).toBe("now")
    const after = reviewReducer(ready, { type: "decide", id: "F-05", status: "rejected", reason: "late change", ...by })
    expect(after.findings.find((f) => f.id === "F-05")?.status).toBe("needs-review")
  })

  it("re-locks the gate when analysis of new documents adds a High finding", () => {
    const unlocked = run(createInitialState("ready"), accept("F-01"), accept("F-02"), accept("F-03"))
    expect(canSubmit(unlocked)).toBe(true)
    const s = reviewReducer(unlocked, { type: "add-documents", documents: [], findings: [UPLOAD_FINDING] })
    expect(canSubmit(s)).toBe(false)
    expect(s.selectedId).toBe("F-07")
  })
})

describe("audit trail & undo", () => {
  it("records who decided, when and why", () => {
    const s = reviewReducer(createInitialState("ready"), { type: "decide", id: "F-05", status: "flagged", reason: "Check retention plan", assignee: "Omar", ...by })
    const last = s.findings.find((f) => f.id === "F-05")!.history.at(-1)
    expect(last).toEqual({ at: by.at, text: "Flagged by Test Analyst — Check retention plan (owner: Omar)" })
  })

  it("undo restores the exact prior finding, including history", () => {
    const initial = createInitialState("ready")
    const before = initial.findings.find((f) => f.id === "F-02")!
    const s = run(initial, accept("F-02"), { type: "restore-finding", finding: before })
    expect(s.findings.find((f) => f.id === "F-02")).toEqual(before)
  })
})

describe("uploads", () => {
  const userDoc = { id: "user-board-pack-pdf", title: "board pack.pdf", shortTitle: "board pack", pages: 0, kind: "pdf" as const, uploadedAt: "17 Nov 2026", origin: "user" as const }

  it("adds a user's own document without inventing findings", () => {
    const before = createInitialState("ready")
    const s = reviewReducer(before, { type: "add-documents", documents: [userDoc], findings: [] })
    expect(s.documents[0]).toEqual(userDoc)
    expect(s.findings).toHaveLength(before.findings.length)
    expect(s.selectedId).toBe(before.selectedId)
  })

  it("does not duplicate documents or findings on a repeat upload", () => {
    const once = reviewReducer(createInitialState("ready"), { type: "add-documents", documents: [userDoc], findings: [UPLOAD_FINDING] })
    const twice = reviewReducer(once, { type: "add-documents", documents: [userDoc], findings: [UPLOAD_FINDING] })
    expect(twice.documents.filter((d) => d.id === userDoc.id)).toHaveLength(1)
    expect(twice.findings.filter((f) => f.id === "F-07")).toHaveLength(1)
  })

  it("scripted F-07 cites the sample contracts document, never a user file", () => {
    expect(UPLOAD_FINDING.evidence.every((e) => e.documentId.startsWith("sample-"))).toBe(true)
  })
})

describe("filters", () => {
  it("sorts by severity and combines status + category filters", () => {
    const base = createInitialState("ready")
    expect(visibleFindings(base).map((f) => f.severity)).toEqual(["critical", "high", "high", "medium", "medium", "low"])
    const s = run(base, { type: "set-status-filter", filter: "needs-review" }, { type: "set-category-filter", category: "financial" })
    expect(visibleFindings(s).map((f) => f.id)).toEqual(["F-02"])
  })

  it("returns nothing for an empty data room", () => {
    const s = reviewReducer(createInitialState("ready"), { type: "set-scenario", scenario: { emptyDataRoom: true } })
    expect(visibleFindings(s)).toEqual([])
    expect(canSubmit(s)).toBe(false)
  })
})
