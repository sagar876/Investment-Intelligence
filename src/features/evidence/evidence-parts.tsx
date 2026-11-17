import { Check, FileText, Flag, Lock, Sparkles, X } from "lucide-react"
import { EvidenceStrengthMeter, SeverityBadge, StatusBadge } from "@/components/common/badges"
import { Button } from "@/components/ui/button"
import { CATEGORY_LABEL, findDocument } from "@/lib/labels"
import { stagger } from "@/lib/stagger"
import { useReview } from "@/state/review-context"
import { useUi } from "@/state/ui-context"
import type { Evidence, Finding } from "@/types/domain"

export function FindingHeading({ finding, as: Tag = "h3" }: { finding: Finding; as?: "h2" | "h3" }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <SeverityBadge severity={finding.severity} />
        <span className="text-text-secondary">{CATEGORY_LABEL[finding.category]}</span>
        <span aria-hidden className="text-muted-foreground">·</span>
        <span className="font-mono text-muted-foreground">{finding.id}</span>
        <span className="ml-auto">
          <StatusBadge status={finding.status} />
        </span>
      </div>
      <Tag className="font-heading text-lg leading-snug font-semibold text-foreground">{finding.title}</Tag>
    </div>
  )
}

export function AiRationale({ finding }: { finding: Finding }) {
  return (
    <div className="relative overflow-hidden rounded-md border border-ai-border/60 bg-ai-subtle/70 p-3.5">
      <div aria-hidden className="absolute inset-y-0 left-0 w-[3px] bg-[linear-gradient(180deg,var(--brand-blue),var(--brand-aqua))]" />
      <p className="flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.08em] text-ai uppercase">
        <Sparkles aria-hidden className="size-3" /> Why the AI flagged this
        <span className="font-normal tracking-normal normal-case text-ai/90">· AI-generated · Demo data</span>
      </p>
      <p className="mt-1.5 text-[13px] leading-5 text-foreground">{finding.aiRationale}</p>
    </div>
  )
}

export function EvidenceItem({ evidence, index }: { evidence: Evidence; index: number }) {
  const { state } = useReview()
  const doc = findDocument(evidence.documentId, state.documents)
  return (
    <article
      style={stagger(index, 80)}
      className="animate-fade-up rounded-md border border-border bg-card p-3.5 transition-shadow hover:shadow-card"
      aria-label={`Evidence ${index + 1}: ${doc?.title ?? "Uploaded document"}, page ${evidence.page}`}
    >
      <header className="flex items-start gap-2">
        <FileText aria-hidden className="mt-0.5 size-4 shrink-0 text-text-secondary" />
        <p className="flex-1 text-[13px] font-medium text-foreground">{doc?.title ?? "Unknown document"}</p>
        <span className="font-mono text-xs text-muted-foreground">p.{evidence.page}</span>
      </header>
      <blockquote className="mt-2.5 border-l-[3px] border-border-strong bg-background px-3 py-2 text-[13px] leading-5 text-text-secondary">
        “{evidence.excerpt}”
      </blockquote>
      <footer className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1">
        <EvidenceStrengthMeter strength={evidence.strength} score={evidence.score} />
        <span className="text-xs text-muted-foreground">{evidence.rationale}</span>
      </footer>
    </article>
  )
}

export function DecisionBar({ finding, layout = "panel" }: { finding: Finding; layout?: "panel" | "drawer" }) {
  const { state } = useReview()
  const { accept, requestDecision } = useUi()
  const locked = Boolean(state.submittedAt)

  if (locked) {
    return (
      <p className="flex items-center gap-2 rounded-md bg-muted p-3 text-xs text-text-secondary">
        <Lock aria-hidden className="size-3.5" /> Submitted to IC — decisions are locked.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-2.5">
      {layout === "panel" && <p className="text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">Your decision</p>}
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => accept(finding.id)} disabled={finding.status === "accepted"}>
          <Check aria-hidden /> {finding.status === "accepted" ? "Accepted" : "Accept finding"}
        </Button>
        <Button variant="destructive" onClick={() => requestDecision(finding.id, "reject")} disabled={finding.status === "rejected"}>
          <X aria-hidden /> Reject
        </Button>
        <Button variant="outline" onClick={() => requestDecision(finding.id, "flag")}>
          <Flag aria-hidden /> {finding.status === "flagged" ? "Update flag" : "Flag for follow-up"}
        </Button>
      </div>
      {layout === "panel" && (
        <p className="text-xs text-muted-foreground">
          Reject and Flag require a written reason. Every decision is logged with your name and time for the IC audit trail.
        </p>
      )}
    </div>
  )
}
