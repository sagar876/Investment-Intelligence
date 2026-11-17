import { Check, ChevronDown, CircleAlert, CloudUpload, LoaderCircle, Sparkles, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { summarise, useUploads } from "@/state/upload-context"
import { UploadFileRow } from "./upload-file-row"

const TITLE = {
  uploading: (n: number) => `Uploading ${n} document${n === 1 ? "" : "s"}`,
  processing: () => "Checking uploaded files",
  failed: (n: number) => `${n} upload${n === 1 ? "" : "s"} need${n === 1 ? "s" : ""} attention`,
  completed: (n: number) => `${n} document${n === 1 ? "" : "s"} uploaded`,
  idle: () => "Uploads",
}

/**
 * Docked, non-blocking upload activity. Collapsed by default; expands to per-file detail.
 * Hiding it never stops uploads — a compact pill stays available to reopen it.
 */
export function UploadActivityPanel() {
  const { items, panel, setPanel, readyCount, runAnalysis, analysing, clearFinished } = useUploads()
  const s = summarise(items)
  if (s.phase === "idle" && readyCount === 0) return null

  const expanded = panel === "expanded"
  const busy = s.phase === "uploading" || s.phase === "processing"
  const title = s.phase === "failed" ? TITLE.failed(s.failed.length) : s.phase === "uploading" ? TITLE.uploading(s.inFlight.length) : TITLE[s.phase](s.completed.length)
  const Icon = busy ? LoaderCircle : s.phase === "failed" ? CircleAlert : Check

  if (panel === "hidden") {
    return (
      <button
        type="button"
        onClick={() => setPanel("collapsed")}
        className="fixed bottom-4 left-4 z-40 flex animate-pop cursor-pointer items-center gap-2 rounded-full border border-border bg-card px-3.5 py-2 text-xs font-medium text-foreground shadow-lift transition-[box-shadow,transform] hover:-translate-y-0.5 hover:shadow-overlay"
        aria-label={`Show upload activity: ${title}${busy ? `, ${s.percent}%` : ""}`}
      >
        <Icon aria-hidden className={cn("size-3.5", busy && "animate-spin text-ai-strong", s.phase === "failed" && "text-sev-critical", s.phase === "completed" && "text-positive")} />
        {busy ? `Uploading · ${s.percent}%` : s.phase === "failed" ? "Upload needs attention" : readyCount ? `${readyCount} ready for analysis` : "Uploads complete"}
      </button>
    )
  }

  return (
    <section
      aria-label="Upload activity"
      className="fixed inset-x-3 bottom-3 z-40 flex animate-fade-up flex-col overflow-hidden rounded-xl border border-border bg-card shadow-overlay sm:inset-x-auto sm:bottom-4 sm:left-4 sm:w-[380px]"
    >
      <div className="flex items-start gap-3 p-3.5">
        <span
          aria-hidden
          className={cn(
            "mt-0.5 grid size-8 shrink-0 place-items-center rounded-full",
            busy ? "bg-ai-subtle" : s.phase === "failed" ? "bg-sev-critical-subtle" : "bg-positive-subtle",
          )}
        >
          {busy ? (
            <CloudUpload className="size-4 text-ai" />
          ) : (
            <Icon className={cn("size-4", s.phase === "failed" ? "text-sev-critical" : "text-positive")} />
          )}
        </span>
        <div className="min-w-0 flex-1" aria-live="polite">
          <p className="text-sm font-semibold text-foreground">{title}</p>
          <p className="truncate text-xs text-muted-foreground">
            {busy && s.current
              ? `${s.current.status === "processing" ? "Checking" : "Now"}: ${s.current.name}`
              : s.phase === "failed"
                ? "Other files keep uploading. Retry the interrupted file."
                : readyCount
                  ? `${readyCount} document${readyCount === 1 ? "" : "s"} ready for analysis`
                  : "All done"}
          </p>
        </div>
        <span className="pt-0.5 text-sm font-semibold text-foreground tabular" aria-label={`${s.percent} percent`}>
          {s.percent}%
        </span>
        <div className="-mt-0.5 -mr-1 flex">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-expanded={expanded}
            aria-controls="upload-activity-files"
            aria-label={expanded ? "Collapse file details" : "Show file details"}
            onClick={() => setPanel(expanded ? "collapsed" : "expanded")}
          >
            <ChevronDown aria-hidden className={cn("transition-transform duration-200", expanded && "rotate-180")} />
          </Button>
          <Button variant="ghost" size="icon-sm" aria-label="Hide upload activity (uploads continue)" onClick={() => setPanel("hidden")}>
            <X aria-hidden />
          </Button>
        </div>
      </div>

      <div className="px-3.5 pb-3">
        <div
          role="progressbar"
          aria-label="Overall upload progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={s.percent}
          className="h-1.5 overflow-hidden rounded-full bg-muted"
        >
          <div
            className={cn(
              "h-full rounded-full transition-[width] duration-200 ease-linear",
              s.phase === "failed" ? "bg-sev-high" : s.phase === "completed" ? "bg-positive" : "bg-[image:var(--gradient-brand)]",
            )}
            style={{ width: `${s.percent}%` }}
          />
        </div>
      </div>

      {/* Grid-rows trick animates height with CSS only. */}
      <div
        id="upload-activity-files"
        className={cn("grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]", expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}
        inert={!expanded}
      >
        <div className="min-h-0 overflow-hidden">
          <ul className="flex max-h-[38dvh] flex-col gap-2 overflow-y-auto border-t border-border bg-background p-3" aria-label="Files">
            {s.visible.map((i) => (
              <UploadFileRow key={i.id} item={i} compact />
            ))}
          </ul>
        </div>
      </div>

      {(readyCount > 0 || (!busy && s.completed.length > 0)) && (
        <div className="flex flex-wrap items-center gap-2 border-t border-border px-3.5 py-2.5">
          {readyCount > 0 && (
            <Button size="sm" variant="ai" onClick={runAnalysis} disabled={analysing || busy} aria-describedby="analysis-note">
              <Sparkles aria-hidden /> {analysing ? "Analysing…" : `Run AI analysis (${readyCount})`}
            </Button>
          )}
          {!busy && s.failed.length === 0 && (
            <Button size="sm" variant="ghost" onClick={clearFinished} className="ml-auto">
              Clear list
            </Button>
          )}
          <p id="analysis-note" className="w-full text-[11px] text-muted-foreground">
            Simulated demo — uploads and analysis are mocked; file contents are never read.
          </p>
        </div>
      )}
    </section>
  )
}
