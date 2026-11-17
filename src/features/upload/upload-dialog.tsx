import { CircleAlert, CloudUpload, FileText, Info, Sparkles, X } from "lucide-react"
import { useRef, useState, type DragEvent } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { ACCEPTED_EXTENSIONS, formatBytes, MAX_FILE_MB, summarise, useUploads, type PendingFile, type Rejection } from "@/state/upload-context"
import { useUi } from "@/state/ui-context"
import { UploadFileRow } from "./upload-file-row"

/**
 * Two steps: choose files (validated locally, contents never read) → watch progress.
 * Uploads are owned by UploadProvider, so "Run in background" (or closing) never cancels or restarts them.
 */
export function UploadDialog() {
  const { uploadOpen, setUploadOpen, restoreFocus } = useUi()
  const { validate, samples, start, items, setPanel } = useUploads()
  const [pending, setPending] = useState<PendingFile[]>([])
  const [rejected, setRejected] = useState<Rejection[]>([])
  const [batchIds, setBatchIds] = useState<string[] | null>(null)
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const batchItems = batchIds ? items.filter((i) => batchIds.includes(i.id) && i.status !== "cancelled") : []
  const batch = summarise(batchItems)

  const reset = () => {
    setPending([])
    setRejected([])
    setBatchIds(null)
  }

  /** Close the dialog. Any running upload moves to the docked activity panel and keeps going. */
  const close = () => {
    setUploadOpen(false)
    if (batchIds && batch.inFlight.length) setPanel("collapsed")
    reset()
  }

  const add = (list: FileList | null) => {
    if (!list) return
    const { accepted, rejected: bad } = validate(
      Array.from(list).map((f) => ({ name: f.name, size: f.size })),
      pending,
    )
    setPending((p) => [...p, ...accepted])
    setRejected(bad)
    if (inputRef.current) inputRef.current.value = "" // nothing from the File object is retained
  }

  const onDrop = (e: DragEvent) => {
    e.preventDefault()
    setDragging(false)
    add(e.dataTransfer.files)
  }

  const begin = () => {
    if (!pending.length) return
    start(pending)
    setBatchIds(pending.map((p) => p.id))
    setPending([])
    setRejected([])
  }

  const sampleFiles = samples()
  const totalBytes = pending.reduce((s, f) => s + f.bytes, 0)

  return (
    <Dialog open={uploadOpen} onOpenChange={(o) => (o ? setUploadOpen(true) : close())}>
      <DialogContent className="sm:max-w-[580px]" onCloseAutoFocus={restoreFocus}>
        <DialogHeader>
          <DialogTitle className="font-heading text-lg">{batchIds ? "Uploading documents" : "Upload documents"}</DialogTitle>
          <DialogDescription>
            {batchIds
              ? batch.inFlight.length
                ? `${batch.completed.length} of ${batch.visible.length} uploaded · ${batch.percent}%. You can keep working — uploads continue in the background.`
                : batch.failed.length
                  ? `${batch.completed.length} of ${batch.visible.length} uploaded. Retry the interrupted file — the others are safe.`
                  : "All files uploaded. They’re ready for the simulated AI analysis."
              : "Add files to the Meridian data room. They’ll be ready for the simulated AI analysis once uploaded."}
          </DialogDescription>
        </DialogHeader>

        {!batchIds ? (
          <div key="select" className="flex animate-fade-up flex-col gap-3">
            <div
              onDragOver={(e) => {
                e.preventDefault()
                setDragging(true)
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              className={cn(
                "flex min-w-0 flex-col items-center gap-2 rounded-lg border border-dashed px-3 py-4 text-center transition-colors duration-200 sm:px-4 sm:py-6",
                dragging ? "border-ai-strong bg-ai-subtle" : "border-input bg-background",
              )}
            >
              <span
                className={cn(
                  "grid size-11 place-items-center rounded-full bg-accent transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
                  dragging && "-translate-y-1 scale-110",
                )}
              >
                <CloudUpload aria-hidden className="size-5 text-primary" />
              </span>
              {/* Touch devices get a real button (native file picker); drag-and-drop copy only where a fine pointer exists. */}
              <p className="hidden text-sm text-foreground pointer-fine:block">
                Drag files here or{" "}
                <button
                  type="button"
                  className="inline-flex min-h-6 cursor-pointer items-center rounded-sm font-medium text-link underline-offset-4 hover:underline"
                  onClick={() => inputRef.current?.click()}
                >
                  browse your computer
                </button>
              </p>
              <Button type="button" variant="outline" className="h-11 w-full max-w-xs pointer-fine:hidden" onClick={() => inputRef.current?.click()}>
                Choose files
              </Button>
              <p className="text-xs text-muted-foreground">PDF, Excel or Word · up to {MAX_FILE_MB} MB each</p>
              <input
                ref={inputRef}
                type="file"
                multiple
                accept={ACCEPTED_EXTENSIONS.join(",")}
                className="sr-only"
                tabIndex={-1}
                aria-hidden
                onChange={(e) => add(e.target.files)}
              />
            </div>

            <p className="flex items-start gap-1.5 text-xs text-text-secondary">
              <Info aria-hidden className="mt-0.5 size-3.5 shrink-0 text-ai" />
              Simulated demo: uploads are mocked in your browser. File contents are never read, stored or sent anywhere.
            </p>

            {rejected.length > 0 && (
              <ul role="alert" className="flex flex-col gap-1.5 rounded-md border border-sev-critical/30 bg-sev-critical-subtle p-3">
                {rejected.map((r) => (
                  <li key={r.name} className="flex items-start gap-1.5 text-xs text-sev-critical">
                    <CircleAlert aria-hidden className="mt-0.5 size-3.5 shrink-0" />
                    <span>
                      <span className="font-medium">{r.name}</span> — {r.reason}
                    </span>
                  </li>
                ))}
              </ul>
            )}

            {pending.length > 0 ? (
              <>
                <ul className="flex min-w-0 flex-col gap-2" aria-label="Files selected for upload">
                  {pending.map((f) => (
                    <li key={f.id} className="flex min-w-0 animate-fade-in items-center gap-2 rounded-md border border-border py-1.5 pr-1.5 pl-3">
                      <FileText aria-hidden className="size-4 shrink-0 text-text-secondary" />
                      <span className="min-w-0 flex-1 truncate text-[13px]" title={f.name}>
                        {f.name}
                      </span>
                      {f.source === "sample" && <span className="text-[11px] font-medium text-ai">Sample</span>}
                      <span className="text-xs text-muted-foreground tabular">{formatBytes(f.bytes)}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-9 shrink-0"
                        aria-label={`Remove ${f.name}`}
                        onClick={() => setPending((p) => p.filter((x) => x.id !== f.id))}
                      >
                        <X aria-hidden />
                      </Button>
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-muted-foreground tabular">
                  {pending.length} file{pending.length === 1 ? "" : "s"} · {formatBytes(totalBytes)} total
                </p>
              </>
            ) : (
              sampleFiles.length > 0 && (
                <Button variant="ai" className="self-start" onClick={() => setPending(sampleFiles)}>
                  <Sparkles aria-hidden /> Use {sampleFiles.length} sample document{sampleFiles.length === 1 ? "" : "s"} (demo)
                </Button>
              )
            )}
          </div>
        ) : (
          <div key="progress" className="flex animate-fade-up flex-col gap-3">
            <div
              role="progressbar"
              aria-label="Overall upload progress"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={batch.percent}
              className="h-1.5 overflow-hidden rounded-full bg-muted"
            >
              <div
                className="h-full rounded-full bg-[image:var(--gradient-brand)] transition-[width] duration-200 ease-linear"
                style={{ width: `${batch.percent}%` }}
              />
            </div>
            <ul className="flex min-w-0 flex-col gap-2" aria-label="Upload progress by file">
              {batch.visible.map((i) => (
                <UploadFileRow key={i.id} item={i} />
              ))}
            </ul>
          </div>
        )}

        <DialogFooter>
          {!batchIds ? (
            <>
              <Button variant="outline" onClick={close}>
                Cancel
              </Button>
              <Button disabled={pending.length === 0} onClick={begin}>
                <CloudUpload aria-hidden /> Start upload{pending.length ? ` (${pending.length})` : ""}
              </Button>
            </>
          ) : batch.inFlight.length ? (
            <Button onClick={close}>Run in background</Button>
          ) : (
            <Button onClick={close}>Done</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
