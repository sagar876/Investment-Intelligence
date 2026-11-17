import { X } from "lucide-react"
import { SeverityBadge } from "@/components/common/badges"
import { SectionCard } from "@/components/common/section-card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { OVERALL_RISK, RISKS } from "@/data/meridian"
import { CATEGORY_LABEL, SEVERITY_META } from "@/lib/labels"
import { stagger } from "@/lib/stagger"
import { cn } from "@/lib/utils"
import { useReview } from "@/state/review-context"
import { findingCountByCategory } from "@/state/review-reducer"

/** Semi-circular gauge with brand gradient, drawn by a CSS stroke animation. The score is also given as text. */
function RiskGauge({ score }: { score: number }) {
  return (
    <svg aria-hidden width="88" height="50" viewBox="0 0 88 50">
      <defs>
        <linearGradient id="gauge" x1="0" x2="1">
          <stop offset="0%" stopColor="var(--brand-teal)" />
          <stop offset="60%" stopColor="var(--sev-medium)" />
          <stop offset="100%" stopColor="var(--sev-high)" />
        </linearGradient>
      </defs>
      <path d="M10 44 A34 34 0 0 1 78 44" fill="none" stroke="var(--chart-grid)" strokeWidth="8" strokeLinecap="round" />
      <path
        d="M10 44 A34 34 0 0 1 78 44"
        fill="none"
        stroke="url(#gauge)"
        strokeWidth="8"
        strokeLinecap="round"
        pathLength={100}
        strokeDasharray={`${score} 100`}
        className="animate-draw"
        style={stagger(0, 250, { "--len": score })}
      />
    </svg>
  )
}

export function RiskAssessment() {
  const { state, dispatch } = useReview()
  const analysing = state.phase === "analysing"
  const empty = state.scenario.emptyDataRoom
  const active = state.categoryFilter

  return (
    <SectionCard
      id="risk-assessment"
      title="Risk assessment"
      ai
      description="AI-scored by category · select a category to filter findings"
      actions={
        active !== "all" ? (
          <Button size="sm" variant="ghost" onClick={() => dispatch({ type: "set-category-filter", category: "all" })}>
            <X aria-hidden /> Clear
          </Button>
        ) : undefined
      }
    >
      {empty ? (
        <p className="rounded-md border border-dashed border-border-strong bg-background p-4 text-sm text-text-secondary">
          Risk scores appear once documents have been analysed.
        </p>
      ) : analysing ? (
        <div className="space-y-3" aria-hidden>
          <Skeleton className="h-16 w-full" />
          {RISKS.map((r) => (
            <Skeleton key={r.category} className="h-14 w-full" />
          ))}
        </div>
      ) : (
        <>
          <div className="flex items-center gap-4 rounded-md bg-background p-3">
            <RiskGauge score={OVERALL_RISK.score} />
            <div>
              <p className="text-xs text-muted-foreground">Overall risk</p>
              <p className="font-heading text-xl font-semibold text-sev-high">
                {OVERALL_RISK.label} <span className="text-sm font-medium text-text-secondary tabular">· {OVERALL_RISK.score}/100</span>
              </p>
            </div>
          </div>
          <ul className="-mx-2 flex flex-col gap-1" aria-label="Risk categories">
            {RISKS.map((r, i) => {
              const pressed = active === r.category
              const count = findingCountByCategory(state, r.category)
              return (
                <li key={r.category}>
                  <button
                    type="button"
                    aria-pressed={pressed}
                    onClick={() => dispatch({ type: "set-category-filter", category: pressed ? "all" : r.category })}
                    className={cn(
                      "group w-full cursor-pointer rounded-md border p-2.5 text-left transition-colors duration-200",
                      pressed ? "border-ai-border bg-ai-subtle/70" : "border-transparent hover:bg-background",
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <span className="flex-1 text-sm font-medium text-foreground">{CATEGORY_LABEL[r.category]}</span>
                      <SeverityBadge severity={r.severity} />
                    </span>
                    <span aria-hidden className="mt-2 block h-1.5 overflow-hidden rounded-full bg-muted">
                      <span
                        className={cn("block h-full origin-left animate-grow-x rounded-full", SEVERITY_META[r.severity].bar)}
                        style={{ width: `${r.score}%`, ...stagger(i) }}
                      />
                    </span>
                    <span className="mt-1.5 flex items-start gap-3 text-xs">
                      <span className="flex-1 text-text-secondary">{r.summary}</span>
                      <span className="shrink-0 text-muted-foreground tabular">
                        {r.score}/100 · {count} finding{count === 1 ? "" : "s"}
                      </span>
                    </span>
                    <span className="sr-only">{pressed ? "Filtering findings by this category. Press to clear." : "Press to filter findings."}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </>
      )}
    </SectionCard>
  )
}
