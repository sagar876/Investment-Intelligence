import { Info, ShieldCheck, TrendingUp, TriangleAlert } from "lucide-react"
import { CitationChip } from "@/components/common/badges"
import { SectionCard } from "@/components/common/section-card"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { CONCERNS, DATA_ROOM_TOTAL, POSITIVES, SUMMARY } from "@/data/meridian"
import { stagger } from "@/lib/stagger"
import { cn } from "@/lib/utils"
import { useReview } from "@/state/review-context"
import { useUi } from "@/state/ui-context"
import type { Observation } from "@/types/domain"
import { AiAnalysisProgress } from "./ai-analysis-progress"

function ObservationList({ title, items, tone }: { title: string; items: Observation[]; tone: "positive" | "concern" }) {
  const { openEvidence } = useUi()
  const Icon = tone === "positive" ? TrendingUp : TriangleAlert
  return (
    <div className="flex-1">
      <h3 className="flex items-center gap-1.5 font-sans text-sm font-semibold text-foreground">
        <Icon aria-hidden className={cn("size-4", tone === "positive" ? "text-positive" : "text-sev-critical")} />
        {title}
      </h3>
      <ul className="mt-3 space-y-3">
        {items.map((o, i) => (
          <li
            key={o.text}
            style={stagger(i, 200)}
            className={cn("animate-fade-up border-l-2 pl-3", tone === "positive" ? "border-positive/60" : "border-sev-critical/60")}
          >
            <p className="text-[13px] leading-5 text-foreground">{o.text}</p>
            <CitationChip
              className="mt-1.5"
              label={o.cite}
              onClick={o.findingId ? () => openEvidence(o.findingId!) : undefined}
            />
          </li>
        ))}
      </ul>
    </div>
  )
}

export function AiSummary() {
  const { state } = useReview()
  const { openEvidence, setUploadOpen } = useUi()
  const analysing = state.phase === "analysing"
  const empty = state.scenario.emptyDataRoom

  return (
    <SectionCard
      id="ai-summary"
      title="AI executive summary"
      ai
      description={empty ? "Waiting for documents" : `Synthesised from ${DATA_ROOM_TOTAL} data-room documents · generated ${SUMMARY.generatedAt}`}
      actions={
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="sm">
              <Info aria-hidden /> How this was generated
            </Button>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            Demo simulation: every sentence is linked to a page-level source. Findings are proposals — an analyst decides
            each one before anything reaches the IC.
          </TooltipContent>
        </Tooltip>
      }
    >
      {empty ? (
        <div className="flex flex-col items-start gap-3 rounded-md border border-dashed border-border-strong bg-background p-5">
          <p className="text-sm text-text-secondary">No documents have been analysed, so there is nothing to summarise yet.</p>
          <Button variant="outline" size="sm" onClick={() => setUploadOpen(true)}>
            Upload documents
          </Button>
        </div>
      ) : analysing ? (
        <AiAnalysisProgress />
      ) : (
        <>
          <div
            className="relative animate-fade-up overflow-hidden rounded-md border border-ai-border/60 bg-[linear-gradient(135deg,var(--ai-subtle),#f3fbfb_60%,#eef5fb)] p-4"
          >
            <div aria-hidden className="absolute top-0 left-0 h-full w-[3px] bg-[linear-gradient(180deg,var(--brand-blue),var(--brand-aqua))]" />
            <p className="text-[15px] leading-6 text-foreground">{SUMMARY.text}</p>
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              <span className="text-xs text-muted-foreground">Sources</span>
              {SUMMARY.sources.map((s) => (
                <CitationChip
                  key={s.label}
                  label={s.label}
                  onClick={s.findingId ? () => openEvidence(s.findingId!) : undefined}
                />
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-6 md:flex-row">
            <ObservationList title="Positive observations" items={POSITIVES} tone="positive" />
            <ObservationList title="Critical concerns" items={CONCERNS} tone="concern" />
          </div>
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck aria-hidden className="size-3.5" />
            AI output is a starting point. Verify each claim against its cited evidence before relying on it.
          </p>
        </>
      )}
    </SectionCard>
  )
}
