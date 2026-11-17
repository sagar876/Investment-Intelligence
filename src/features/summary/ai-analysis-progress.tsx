import { Check, LoaderCircle } from "lucide-react"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { ANALYSE_MS } from "@/state/review-context"

const STEPS = ["Reading data-room documents", "Extracting financial statements", "Cross-referencing evidence", "Scoring risk categories", "Drafting executive summary"]

/** Animated AI-analysis indicator. Step changes are announced politely to screen readers. */
export function AiAnalysisProgress({ compact = false }: { compact?: boolean }) {
  const [step, setStep] = useState(0)
  useEffect(() => {
    const id = window.setInterval(() => setStep((s) => Math.min(s + 1, STEPS.length - 1)), ANALYSE_MS / STEPS.length)
    return () => window.clearInterval(id)
  }, [])

  return (
    <div className="relative overflow-hidden rounded-md border border-ai-border/60 bg-ai-subtle/60 p-4">
      <div aria-hidden className="ai-shimmer absolute inset-0 animate-shimmer" />
      <div className="relative flex items-center gap-3">
        <span aria-hidden className="relative grid size-9 place-items-center">
                    <span className="absolute inset-1 animate-spin rounded-full bg-[conic-gradient(from_0deg,var(--brand-blue),var(--brand-teal),var(--brand-aqua),var(--brand-blue))]" />
          <span className="absolute inset-[7px] rounded-full bg-ai-subtle" />
        </span>
        <div className="min-w-0 flex-1" role="status" aria-live="polite">
          <p className="text-sm font-semibold text-ai">AI analysis in progress</p>
          <p key={step} className="animate-fade-in text-xs text-text-secondary">
            {STEPS[step]}…
          </p>
        </div>
      </div>
      {!compact && (
        <ol className="relative mt-4 grid gap-1.5 sm:grid-cols-5" aria-label="Analysis steps">
          {STEPS.map((s, i) => (
            <li key={s} className="flex items-center gap-1.5 text-[11px] text-text-secondary">
              {i < step ? (
                <Check aria-hidden className="size-3 text-ai" />
              ) : i === step ? (
                <LoaderCircle aria-hidden className="size-3 animate-spin text-ai" />
              ) : (
                <span aria-hidden className="size-3 rounded-full border border-ai-border" />
              )}
              <span className={cn(i <= step ? "text-foreground" : "")}>{s}</span>
              <span className="sr-only">{i < step ? "(done)" : i === step ? "(in progress)" : "(pending)"}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}
