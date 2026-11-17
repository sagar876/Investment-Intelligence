import { MousePointerClick, PanelRight } from "lucide-react"
import { Reserve } from "@/components/common/reserve"
import { SectionCard } from "@/components/common/section-card"
import { Button } from "@/components/ui/button"
import { useReview } from "@/state/review-context"
import { activeFindings } from "@/state/review-reducer"
import { useUi } from "@/state/ui-context"
import { AiRationale, DecisionBar, EvidenceItem, FindingHeading } from "./evidence-parts"

/** Desktop evidence panel beside the findings table (lg+). Below lg the drawer takes this role. */
export function EvidencePanel() {
  const { state } = useReview()
  const { openDrawer } = useUi()
  const finding = activeFindings(state).find((f) => f.id === state.selectedId) ?? null
  // Without a selection the panel keeps the size of a populated finding (rendered invisibly).
  const shown = finding ?? state.findings[0]
  const pending = state.phase !== "ready"

  return (
    <SectionCard
      id="evidence-review"
      title="Evidence review"
      description={finding ? `Selected finding · ${finding.id}` : "No finding selected"}
      className="lg:sticky lg:top-[calc(var(--header-h)+16px)]"
      pending={pending}
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
      <Reserve
        active={!finding}
        overlayClassName="flex"
        ghost={
          // Keyed by finding so the CSS slide-in replays on every selection change.
          <div key={shown.id} className="flex animate-slide-in-right flex-col gap-4">
            <FindingHeading finding={shown} />
            <AiRationale finding={shown} />
            <div className="flex items-center justify-between">
              <h3 className="font-sans text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
                <span className="sk">Supporting evidence</span>
              </h3>
              <span className="sk text-xs text-muted-foreground">
                {shown.evidence.length} source{shown.evidence.length === 1 ? "" : "s"}
              </span>
            </div>
            <div className="flex max-h-[440px] flex-col gap-3 overflow-y-auto pr-1">
              {shown.evidence.map((e, i) => (
                <EvidenceItem key={e.id} evidence={e} index={i} />
              ))}
            </div>
            <div className="border-t border-border pt-4">
              <DecisionBar finding={shown} />
            </div>
          </div>
        }
      >
        <div className="flex w-full flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border-strong bg-background px-4 py-12 text-center">
          <MousePointerClick aria-hidden className="size-6 text-muted-foreground" />
          <p className="text-sm font-medium text-foreground">{state.scenario.emptyDataRoom ? "No evidence yet" : "Select a finding"}</p>
          <p className="max-w-xs text-xs text-muted-foreground">
            {state.scenario.emptyDataRoom
              ? "Evidence appears once documents have been analysed."
              : "Its source excerpts, evidence strength and AI rationale appear here."}
          </p>
        </div>
      </Reserve>
    </SectionCard>
  )
}
