import { CircleCheck, FileSpreadsheet, FileText, FolderOpen } from "lucide-react"
import { SectionCard } from "@/components/common/section-card"
import { Button } from "@/components/ui/button"
import { DATA_ROOM_TOTAL, DOCUMENTS } from "@/data/meridian"
import { useReview } from "@/state/review-context"
import { useUi } from "@/state/ui-context"

export function DataRoom() {
  const { state } = useReview()
  const { setUploadOpen } = useUi()
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
    >
      {empty ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-md border border-dashed border-border-strong bg-background px-4 py-8 text-center">
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
      ) : (
        <>
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
                      {d.title}
                    </span>
                    {d.origin === "user" ? (
                      <span
                        className="shrink-0 rounded-sm border border-border-strong px-1.5 py-0.5 text-[11px] text-muted-foreground"
                        title="Demo: the file was validated and listed, but its contents were not read or analysed."
                      >
                        Demo · not analysed
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
          <Button variant="link" size="sm" className="self-start">
            View all {total} documents
          </Button>
        </>
      )}
    </SectionCard>
  )
}
