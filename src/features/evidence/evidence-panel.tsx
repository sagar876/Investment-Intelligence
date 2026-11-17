import { MousePointerClick, PanelRight } from "lucide-react"
import { SectionCard } from "@/components/common/section-card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useReview } from "@/state/review-context"
import { activeFindings } from "@/state/review-reducer"
import { useUi } from "@/state/ui-context"
import { AiRationale, DecisionBar, EvidenceItem, FindingHeading } from "./evidence-parts"

/** Desktop evidence panel beside the findings table (lg+). Below lg the drawer takes this role. */
export function EvidencePanel() {
  const { state } = useReview()
  const { openDrawer } = useUi()
  const finding = activeFindings(state).find((f) => f.id === state.selectedId) ?? null

  return (
    <SectionCard
      id="evidence-review"
      title="Evidence review"
      description={finding ? `Selected finding · ${finding.id}` : "No finding selected"}
      className="lg:sticky lg:top-[calc(var(--header-h)+16px)]"
      actions={
        finding ? (
          <Button variant="ghost" size="sm" onClick={() => openDrawer(finding.id)}>
            <PanelRight aria-hidden /> Open details
          </Button>
        ) : undefined
      }
    >
      <p className="sr-only" aria-live="polite">
        {finding ? `Evidence updated for ${finding.id}: ${finding.title}` : ""}
      </p>
      {state.phase === "analysing" ? (
        <div className="space-y-3" aria-hidden>
          <Skeleton className="h-6 w-2/3" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : !finding ? (
        <div className="flex flex-col items-center gap-2 rounded-md border border-dashed border-border-strong bg-background px-4 py-12 text-center">
          <MousePointerClick aria-hidden className="size-6 text-muted-foreground" />
          <p className="text-sm font-medium text-foreground">Select a finding</p>
          <p className="text-xs text-muted-foreground">Its source excerpts, evidence strength and AI rationale appear here.</p>
        </div>
      ) : (
        // Keyed by finding so the CSS slide-in replays on every selection change.
        <div key={finding.id} className="flex animate-slide-in-right flex-col gap-4">
            <FindingHeading finding={finding} />
            <AiRationale finding={finding} />
            <div className="flex items-center justify-between">
              <h3 className="font-sans text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">Supporting evidence</h3>
              <span className="text-xs text-muted-foreground">
                {finding.evidence.length} source{finding.evidence.length === 1 ? "" : "s"}
              </span>
            </div>
            <div className="flex max-h-[440px] flex-col gap-3 overflow-y-auto pr-1">
              {finding.evidence.map((e, i) => (
                <EvidenceItem key={e.id} evidence={e} index={i} />
              ))}
            </div>
            <div className="border-t border-border pt-4">
              <DecisionBar finding={finding} />
            </div>
        </div>
      )}
    </SectionCard>
  )
}
