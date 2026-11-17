export type Severity = "critical" | "high" | "medium" | "low"
export type RiskCategory = "regulatory" | "financial" | "market" | "operational"
export type ReviewStatus = "needs-review" | "accepted" | "rejected" | "flagged"
export type EvidenceStrength = "strong" | "moderate" | "limited"
export type Trend = "positive" | "negative" | "neutral"

export interface SourceDocument {
  id: string
  title: string
  shortTitle: string
  pages: number
  kind: "pdf" | "xlsx" | "docx"
  uploadedAt: string
  /**
   * seed = original data room; sample = scripted demo upload;
   * user = a real file the viewer chose — validated, but its contents are never read.
   */
  origin?: "seed" | "sample" | "user"
}

export interface Evidence {
  id: string
  documentId: string
  page: number
  excerpt: string
  strength: EvidenceStrength
  score: number
  rationale: string
}

export interface Decision {
  status: ReviewStatus
  reason?: string
  assignee?: string
  by: string
  at: string
}

export interface AuditEntry {
  at: string
  text: string
}

export interface Finding {
  id: string
  title: string
  severity: Severity
  category: RiskCategory
  /** Short plain-language explanation shown in the table and drawer. */
  explanation: string
  /** Why the AI raised it — shown in the AI rationale block. */
  aiRationale: string
  evidence: Evidence[]
  status: ReviewStatus
  history: AuditEntry[]
  /** Set when the finding came from a later document upload. */
  isNew?: boolean
}

export interface Kpi {
  id: string
  label: string
  value: number
  format: "currency-m" | "percent"
  delta: string
  trend: Trend
  footnote: string
}

export interface YearFinancials {
  year: string
  revenue: number
  ebitda: number
  margin: number
}

export interface KeyMetric {
  label: string
  value: string
  note?: string
  attention?: boolean
}

export interface RiskScore {
  category: RiskCategory
  severity: Severity
  score: number
  summary: string
}

export interface Observation {
  text: string
  cite: string
  findingId?: string
}

export interface Company {
  name: string
  country: string
  city: string
  industry: string
  period: string
  description: string
  tags: string[]
}
