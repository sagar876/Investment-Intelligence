import { CircleCheck, FileSpreadsheet, FileText, FolderOpen, Sparkles } from "lucide-react"
import { Reserve } from "@/components/common/reserve"
import { SectionCard } from "@/components/common/section-card"
import { Button } from "@/components/ui/button"
import { DATA_ROOM_TOTAL, DOCUMENTS } from "@/data/meridian"
import { useReview } from "@/state/review-context"
import { useUi } from "@/state/ui-context"
import { useUploads } from "@/state/upload-context"

export function DataRoom() {
  const { state } = useReview()
  const { setUploadOpen } = useUi()
  const { readyCount, runAnalysis, analysing } = useUploads()
  const empty = state.scenario.emptyDataRoom
  const extra = state.documents.length - DOCUMENTS.length
  const total = DATA_ROOM_TOTAL + extra
  const latest = state.documents[0]

  return (
    <SectionCard
      id="data-room"
      title="Data room"
      description={empty ? "No documents uploaded" : `${total} documents · last upload ${latest?.uploadedAt}`}
      className="flex-1"
      pending={state.phase === "loading"}
    >
      <Reserve
        active={empty}
        overlayClassName="flex"
        ghost={
          <div className="flex flex-col gap-4">
          <ul className="-mt-1">
            {state.documents.slice(0, 5).map((d) => {
                const Icon = d.kind === "xlsx" ? FileSpreadsheet : FileText
                return (
                  <li
                    key={d.id}
                    className="flex animate-fade-in items-center gap-2.5 border-b border-border py-2.5 last:border-0"
                  >
                    <Icon aria-hidden className="size-4 shrink-0 text-muted-foreground" />
                    <span className="min-w-0 flex-1 truncate text-[13px] text-foreground" title={d.title}>
                      <span className="sk">{d.title}</span>
                    </span>
                    {d.status === "ready" ? (
                      <span className="shrink-0 rounded-sm border border-ai-border bg-ai-subtle px-1.5 py-0.5 text-[11px] font-medium text-ai">
                        Ready for analysis
                      </span>
                    ) : d.status === "not-read" ? (
                      <span
                        className="shrink-0 rounded-sm border border-border-strong px-1.5 py-0.5 text-[11px] text-text-secondary"
                        title="Simulated demo: the file was uploaded and included in the mock analysis, but its contents are never read."
                      >
                        Demo · contents not read
                      </span>
                    ) : (
                      <>
                        <span className="text-xs text-muted-foreground tabular">{d.pages} pp</span>
                        <CircleCheck aria-label="Analysed" className="size-3.5 text-positive" />
                      </>
                    )}
                  </li>
                )
              })}
          </ul>
          {readyCount > 0 && (
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-md border border-ai-border/70 bg-ai-subtle/60 p-3">
              <p className="flex-1 text-xs text-text-secondary">
                <span className="font-medium text-foreground">
                  {readyCount} new document{readyCount === 1 ? "" : "s"} ready.
                </span>{" "}
                Run the simulated AI analysis to cross-reference {readyCount === 1 ? "it" : "them"} with existing findings.
              </p>
              <Button size="sm" variant="ai" onClick={runAnalysis} disabled={analysing}>
                <Sparkles aria-hidden /> {analysing ? "Analysing…" : "Run AI analysis"}
              </Button>
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            <span className="sk">Showing the 5 most recent of {total} documents.</span>
          </p>
          </div>
        }
      >
        <div className="flex w-full flex-col items-center justify-center gap-3 rounded-md border border-dashed border-border-strong bg-background px-4 py-6 text-center">
          <span className="grid size-11 place-items-center rounded-full bg-accent">
            <FolderOpen aria-hidden className="size-5 text-primary" />
          </span>
          <div>
            <p className="text-sm font-medium text-foreground">No documents yet</p>
            <p className="mt-0.5 text-xs text-muted-foreground">Add audited accounts, legal DD and contracts to start the AI analysis.</p>
          </div>
          <Button size="sm" onClick={() => setUploadOpen(true)}>
            Upload documents
          </Button>
        </div>
      </Reserve>
    </SectionCard>
  )
}
