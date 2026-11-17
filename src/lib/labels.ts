import { CircleAlert, CircleDot, CircleMinus, Clock, Check, Flag, TriangleAlert, X, type LucideIcon } from "lucide-react"
import { DOCUMENTS } from "@/data/meridian"
import type { EvidenceStrength, ReviewStatus, RiskCategory, Severity, SourceDocument } from "@/types/domain"

export const SEVERITY_META: Record<Severity, { label: string; icon: LucideIcon; text: string; bg: string; bar: string }> = {
  critical: { label: "Critical", icon: CircleAlert, text: "text-sev-critical", bg: "bg-sev-critical-subtle", bar: "bg-sev-critical" },
  high: { label: "High", icon: TriangleAlert, text: "text-sev-high", bg: "bg-sev-high-subtle", bar: "bg-sev-high" },
  medium: { label: "Medium", icon: CircleDot, text: "text-sev-medium", bg: "bg-sev-medium-subtle", bar: "bg-sev-medium" },
  low: { label: "Low", icon: CircleMinus, text: "text-sev-low", bg: "bg-sev-low-subtle", bar: "bg-sev-low" },
}

export const STATUS_META: Record<ReviewStatus, { label: string; icon: LucideIcon; className: string }> = {
  "needs-review": { label: "Needs review", icon: Clock, className: "border-border-strong bg-card text-text-secondary" },
  accepted: { label: "Accepted", icon: Check, className: "border-transparent bg-positive-subtle text-positive" },
  rejected: { label: "Rejected", icon: X, className: "border-transparent bg-muted text-muted-foreground" },
  flagged: { label: "Flagged", icon: Flag, className: "border-transparent bg-accent text-primary" },
}

export const CATEGORY_LABEL: Record<RiskCategory, string> = {
  regulatory: "Regulatory",
  financial: "Financial",
  market: "Market",
  operational: "Operational",
}

export const STRENGTH_META: Record<EvidenceStrength, { label: string; bars: number }> = {
  strong: { label: "Strong", bars: 3 },
  moderate: { label: "Moderate", bars: 2 },
  limited: { label: "Limited", bars: 1 },
}

export function findDocument(id: string, docs: SourceDocument[] = DOCUMENTS): SourceDocument | undefined {
  return docs.find((d) => d.id === id)
}

export function citeLabel(findingId: string, docShort: string, page: number): string {
  return `${findingId} · ${docShort} p.${page}`
}
