import { FileText, Sparkles } from "lucide-react"
import type { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { SEVERITY_META, STATUS_META, STRENGTH_META } from "@/lib/labels"
import type { EvidenceStrength, ReviewStatus, Severity } from "@/types/domain"

const pill = "inline-flex items-center gap-1 rounded-sm px-2 py-0.5 text-xs font-medium leading-4 whitespace-nowrap"

export function SeverityBadge({ severity, className }: { severity: Severity; className?: string }) {
  const meta = SEVERITY_META[severity]
  const Icon = meta.icon
  return (
    <span className={cn(pill, meta.bg, meta.text, className)}>
      <Icon aria-hidden className="size-3" strokeWidth={2.25} />
      {meta.label}
      <span className="sr-only"> severity</span>
    </span>
  )
}

/** Status pill that pops when the human decision changes. */
export function StatusBadge({ status, className }: { status: ReviewStatus; className?: string }) {
  const meta = STATUS_META[status]
  const Icon = meta.icon
  return (
    // `key` remounts the pill on change so the CSS pop runs only when the decision changes.
    <span key={status} className={cn(pill, "animate-pop border", meta.className, className)}>
      <Icon aria-hidden className="size-3" strokeWidth={2.25} />
      {meta.label}
    </span>
  )
}

/** Marks AI-generated content. Teal is reserved for AI so it never reads as brand UI. */
export function AiLabel({ children = "AI-generated · Demo data", className }: { children?: ReactNode; className?: string }) {
  return (
    <span className={cn(pill, "border border-ai-border/70 bg-ai-subtle text-ai", className)}>
      <Sparkles aria-hidden className="size-3" strokeWidth={2.25} />
      {children}
    </span>
  )
}

interface CitationChipProps {
  label: string
  onClick?: () => void
  className?: string
}

/** Inline source reference. Interactive when it can open the cited evidence. */
export function CitationChip({ label, onClick, className }: CitationChipProps) {
  const cls = cn(
    "inline-flex min-h-6 max-w-full items-center gap-1 rounded-sm border border-border bg-card px-1.5 py-0.5 font-mono text-[11px] leading-4 text-link",
    onClick && "cursor-pointer transition-colors hover:border-link/50 hover:bg-accent",
    className,
  )
  const content = (
    <>
      <FileText aria-hidden className="size-3" />
      {label}
    </>
  )
  return onClick ? (
    <button type="button" className={cls} onClick={onClick} aria-label={`Open evidence for ${label}`}>
      {content}
    </button>
  ) : (
    <span className={cls}>{content}</span>
  )
}

export function EvidenceStrengthMeter({ strength, score, className }: { strength: EvidenceStrength; score: number; className?: string }) {
  const meta = STRENGTH_META[strength]
  return (
    <span className={cn("inline-flex items-center gap-2 text-xs font-medium text-text-secondary", className)}>
      <span aria-hidden className="flex items-end gap-0.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className={cn("w-1 rounded-[1px]", i < meta.bars ? "bg-ai-strong" : "bg-border-strong")}
            style={{ height: 6 + i * 3 }}
          />
        ))}
      </span>
      <span>
        {meta.label} · <span className="tabular">{score}%</span>
        <span className="sr-only"> evidence strength</span>
      </span>
    </span>
  )
}
