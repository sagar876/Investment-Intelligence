import { DOCUMENTS, FINDINGS } from "@/data/meridian"
import type { Finding, ReviewStatus, RiskCategory, Severity, SourceDocument } from "@/types/domain"

export type StatusFilter = "all" | "needs-review" | "critical-high"
export type CategoryFilter = RiskCategory | "all"
export type Phase = "loading" | "analysing" | "ready"

export interface Scenario {
  chartError: boolean
  emptyDataRoom: boolean
}

export interface ReviewState {
  phase: Phase
  /** When true, the loading phase is followed by a visible AI-analysis phase (replay / after upload). */
  analyseAfterLoad: boolean
  findings: Finding[]
  documents: SourceDocument[]
  selectedId: string | null
  statusFilter: StatusFilter
  categoryFilter: CategoryFilter
  scenario: Scenario
  submittedAt: string | null
}

export type ReviewAction =
  | { type: "set-phase"; phase: Phase }
  | { type: "replay-analysis" }
  | { type: "select"; id: string | null }
  | { type: "set-status-filter"; filter: StatusFilter }
  | { type: "set-category-filter"; category: CategoryFilter }
  | { type: "clear-filters" }
  | { type: "decide"; id: string; status: ReviewStatus; reason?: string; assignee?: string; by: string; at: string }
  | { type: "restore-finding"; finding: Finding }
  | { type: "add-documents"; documents: SourceDocument[]; findings: Finding[] }
  | { type: "analyse-documents"; findings: Finding[] }
  | { type: "submit"; at: string }
  | { type: "set-scenario"; scenario: Partial<Scenario> }
  | { type: "reset" }

export const SEVERITY_ORDER: Record<Severity, number> = { critical: 0, high: 1, medium: 2, low: 3 }

export function createInitialState(phase: Phase = "loading"): ReviewState {
  return {
    phase,
    analyseAfterLoad: false,
    findings: FINDINGS.map((f) => ({ ...f, history: [...f.history] })),
    documents: [...DOCUMENTS].reverse(), // newest first
    selectedId: "F-01",
    statusFilter: "all",
    categoryFilter: "all",
    scenario: { chartError: false, emptyDataRoom: false },
    submittedAt: null,
  }
}

const STATUS_VERB: Record<ReviewStatus, string> = {
  accepted: "Accepted",
  rejected: "Rejected",
  flagged: "Flagged",
  "needs-review": "Reopened",
}

export function reviewReducer(state: ReviewState, action: ReviewAction): ReviewState {
  switch (action.type) {
    case "set-phase":
      return { ...state, phase: action.phase, analyseAfterLoad: action.phase === "ready" ? false : state.analyseAfterLoad }
    case "replay-analysis":
      return { ...state, phase: "loading", analyseAfterLoad: true }
    case "select":
      return { ...state, selectedId: action.id }
    case "set-status-filter":
      return { ...state, statusFilter: action.filter }
    case "set-category-filter":
      return { ...state, categoryFilter: action.category }
    case "clear-filters":
      return { ...state, statusFilter: "all", categoryFilter: "all" }
    case "decide": {
      if (state.submittedAt) return state
      return {
        ...state,
        findings: state.findings.map((f) => {
          if (f.id !== action.id) return f
          const detail = action.reason ? ` — ${action.reason}` : ""
          const owner = action.assignee ? ` (owner: ${action.assignee})` : ""
          return {
            ...f,
            status: action.status,
            isNew: false,
            history: [...f.history, { at: action.at, text: `${STATUS_VERB[action.status]} by ${action.by}${detail}${owner}` }],
          }
        }),
      }
    }
    case "restore-finding":
      return {
        ...state,
        findings: state.findings.map((f) => (f.id === action.finding.id ? action.finding : f)),
      }
    case "add-documents": {
      const existing = new Set(state.findings.map((f) => f.id))
      const fresh = action.findings.filter((f) => !existing.has(f.id))
      const knownDocs = new Set(state.documents.map((d) => d.id))
      return {
        ...state,
        documents: [...action.documents.filter((d) => !knownDocs.has(d.id)), ...state.documents],
        findings: [...state.findings, ...fresh],
        scenario: { ...state.scenario, emptyDataRoom: false },
        selectedId: fresh[0]?.id ?? state.selectedId,
      }
    }
    case "analyse-documents": {
      // Simulated analysis of every uploaded document that is waiting. Sample documents become "analysed";
      // a viewer's own files are marked "not-read" because their contents are never parsed in this demo.
      const waiting = state.documents.some((d) => d.status === "ready")
      if (!waiting) return state
      const existing = new Set(state.findings.map((f) => f.id))
      const fresh = action.findings.filter((f) => !existing.has(f.id))
      return {
        ...state,
        phase: "analysing",
        documents: state.documents.map((d) =>
          d.status === "ready" ? { ...d, status: d.origin === "user" ? ("not-read" as const) : ("analysed" as const) } : d,
        ),
        findings: [...state.findings, ...fresh],
        selectedId: fresh[0]?.id ?? state.selectedId,
      }
    }
    case "submit":
      return canSubmit(state) ? { ...state, submittedAt: action.at } : state
    case "set-scenario": {
      const scenario = { ...state.scenario, ...action.scenario }
      return {
        ...state,
        scenario,
        selectedId: scenario.emptyDataRoom ? null : state.selectedId ?? "F-01",
      }
    }
    case "reset":
      return createInitialState("analysing")
  }
}

/* ---------- Selectors (pure, unit-tested) ---------- */

export function visibleFindings(state: ReviewState): Finding[] {
  if (state.scenario.emptyDataRoom) return []
  return state.findings
    .filter((f) => (state.categoryFilter === "all" ? true : f.category === state.categoryFilter))
    .filter((f) => {
      if (state.statusFilter === "needs-review") return f.status === "needs-review"
      if (state.statusFilter === "critical-high") return f.severity === "critical" || f.severity === "high"
      return true
    })
    .sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity] || a.id.localeCompare(b.id))
}

export function activeFindings(state: ReviewState): Finding[] {
  return state.scenario.emptyDataRoom ? [] : state.findings
}

/** A finding counts as reviewed once a human accepted or rejected it. Flagged stays open. */
export function reviewedCount(state: ReviewState): number {
  return activeFindings(state).filter((f) => f.status === "accepted" || f.status === "rejected").length
}

export function needsReviewCount(state: ReviewState): number {
  return activeFindings(state).filter((f) => f.status === "needs-review").length
}

/** Critical/High findings without a final human decision block IC submission. */
export function blockingFindings(state: ReviewState): Finding[] {
  return activeFindings(state).filter(
    (f) => (f.severity === "critical" || f.severity === "high") && (f.status === "needs-review" || f.status === "flagged"),
  )
}

export function canSubmit(state: ReviewState): boolean {
  return !state.submittedAt && activeFindings(state).length > 0 && blockingFindings(state).length === 0
}

export function statusCounts(state: ReviewState): Record<ReviewStatus, number> {
  const counts: Record<ReviewStatus, number> = { "needs-review": 0, accepted: 0, rejected: 0, flagged: 0 }
  for (const f of activeFindings(state)) counts[f.status] += 1
  return counts
}

export function findingCountByCategory(state: ReviewState, category: RiskCategory): number {
  return activeFindings(state).filter((f) => f.category === category).length
}
