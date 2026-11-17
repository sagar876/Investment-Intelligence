import { Check, CircleAlert, CloudUpload, FileText, Info, LoaderCircle, RefreshCw, Sparkles, X } from "lucide-react"
import { useEffect, useRef, useState, type DragEvent } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { SAMPLE_UPLOADS, UPLOAD_FINDING } from "@/data/meridian"
import { cn } from "@/lib/utils"
import { useReview } from "@/state/review-context"
import { useUi } from "@/state/ui-context"
import type { SourceDocument } from "@/types/domain"

const ACCEPT = [".pdf", ".xlsx", ".docx"]
const MAX_MB = 50

interface QueuedFile {
  /** Stable document id: the sample's id, or derived from the user's file name. */
  id: string
  /** sample = scripted demo document; user = viewer's own file (validated, never read). */
  source: "sample" | "user"
  name: string
  size: string
  pages: number
  failsFirstAttempt: boolean
  progress: number
  attempt: number
  failed: boolean
}

type Stage = "select" | "processing" | "done"

function fileLabel(f: QueuedFile): string {
  if (f.failed) return "Failed"
  if (f.progress === 0) return "Queued"
  if (f.source === "user") return f.progress >= 100 ? "Added · not analysed" : `Uploading · ${f.progress}%`
  if (f.progress >= 100) return "Analysed (scripted)"
  if (f.progress < 45) return `Extracting text · ${f.progress}%`
  if (f.progress < 80) return `Cross-referencing · ${f.progress}%`
  return `Scoring risk · ${f.progress}%`
}

function toQueued(id: string, source: QueuedFile["source"], name: string, size: string, pages: number, fails: boolean): QueuedFile {
  return { id, source, name, size, pages, failsFirstAttempt: fails, progress: 0, attempt: 1, failed: false }
}

const userDocId = (name: string) => `user-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`

export function UploadDialog() {
  const { state, dispatch } = useReview()
  const { uploadOpen, setUploadOpen, openEvidence, restoreFocus } = useUi()
  const [stage, setStage] = useState<Stage>("select")
  const [files, setFiles] = useState<QueuedFile[]>([])
  const [errors, setErrors] = useState<string[]>([])
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Processing keeps running if the dialog is closed ("Run in background"); reopening resumes it.
  const reset = () => {
    setStage("select")
    setFiles([])
    setErrors([])
  }

  // Deterministic simulated processing: files start staggered and advance at fixed rates.
  useEffect(() => {
    if (stage !== "processing") return
    const id = window.setInterval(() => {
      setFiles((prev) =>
        prev.map((f, i) => {
          if (f.failed || f.progress >= 100) return f
          const started = prev.slice(0, i).every((p) => p.progress >= 30 || p.failed)
          if (!started) return f
          const next = Math.min(100, f.progress + 3 + (i % 2))
          if (f.failsFirstAttempt && f.attempt === 1 && next >= 38) return { ...f, progress: 38, failed: true }
          return { ...f, progress: next }
        }),
      )
    }, 90)
    return () => window.clearInterval(id)
  }, [stage])

  const allDone = files.length > 0 && files.every((f) => f.progress >= 100)
  useEffect(() => {
    if (stage === "processing" && allDone) {
      const t = window.setTimeout(() => setStage("done"), 450)
      return () => window.clearTimeout(t)
    }
  }, [stage, allDone])

  const addFiles = (list: FileList | null) => {
    if (!list) return
    const errs: string[] = []
    const ok: QueuedFile[] = []
    for (const file of Array.from(list)) {
      const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase()
      if (!ACCEPT.includes(ext)) errs.push(`${file.name}: unsupported type. Use PDF, XLSX or DOCX.`)
      else if (file.size > MAX_MB * 1024 * 1024) errs.push(`${file.name}: larger than ${MAX_MB} MB.`)
      else
        // A viewer's own file is never failed on purpose — scripted outcomes apply only to sample documents.
        ok.push(toQueued(userDocId(file.name), "user", file.name, `${(file.size / 1024 / 1024).toFixed(1)} MB`, 0, false))
    }
    setErrors(errs)
    setFiles((prev) => [...prev, ...ok.filter((o) => !prev.some((p) => p.name === o.name))])
  }

  const onDrop = (e: DragEvent) => {
    e.preventDefault()
    setDragging(false)
    addFiles(e.dataTransfer.files)
  }

  const retry = (name: string) =>
    setFiles((prev) => prev.map((f) => (f.name === name ? { ...f, failed: false, attempt: f.attempt + 1, progress: 10 } : f)))

  const completed = files.filter((f) => f.progress >= 100)
  const done = completed.length
  const userCount = completed.filter((f) => f.source === "user").length
  const sampleCount = done - userCount
  // F-07 is scripted from the sample contracts file only, and only once.
  const hasSampleContracts = completed.some((f) => f.id === UPLOAD_FINDING.evidence[0].documentId)
  const alreadyHasF07 = state.findings.some((f) => f.id === UPLOAD_FINDING.id)
  const addsFinding = hasSampleContracts && !alreadyHasF07

  const finish = () => {
    const docs: SourceDocument[] = completed.map((f) => ({
      id: f.id,
      title: f.name,
      shortTitle: f.name.replace(/\.[a-z]+$/i, "").replace(/_/g, " ").slice(0, 18),
      pages: f.pages,
      kind: f.name.endsWith(".xlsx") ? "xlsx" : f.name.endsWith(".docx") ? "docx" : "pdf",
      uploadedAt: "17 Nov 2026",
      origin: f.source,
    }))
    dispatch({ type: "add-documents", documents: docs, findings: addsFinding ? [UPLOAD_FINDING] : [] })
    if (addsFinding) dispatch({ type: "set-phase", phase: "analysing" })
    setUploadOpen(false)
    reset()
    if (addsFinding) {
      toast.success(`${done} document${done === 1 ? "" : "s"} added`, {
        description: "Scripted demo analysis raised 1 new High finding (F-07).",
        action: { label: "Review F-07", onClick: () => openEvidence("F-07") },
      })
    } else {
      toast.success(`${done} document${done === 1 ? "" : "s"} added to the data room`, {
        description: userCount ? "Demo: file contents are not analysed, so no findings were created." : "No new findings.",
      })
    }
  }

  const overall = files.length ? Math.round(files.reduce((s, f) => s + f.progress, 0) / files.length) : 0
  const failed = files.filter((f) => f.failed)

  return (
    <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
      <DialogContent className="sm:max-w-[580px]" onCloseAutoFocus={restoreFocus}>
        <DialogHeader>
          <DialogTitle className="font-heading text-lg">
            {stage === "select" ? "Upload documents" : stage === "processing" ? "Processing documents" : "Ready to add"}
          </DialogTitle>
          <DialogDescription>
            {stage === "select"
              ? "Add files to the Meridian data room."
              : stage === "processing"
                ? `${done} of ${files.length} documents processed${failed.length ? ` · ${failed.length} needs attention` : ""}. You can keep working while this runs.`
                : addsFinding
                  ? "The scripted demo analysis cross-referenced the sample contracts against existing findings."
                  : "Your documents are ready to add to the data room."}
          </DialogDescription>
        </DialogHeader>

          {stage === "select" && (
            <div key="select" className="flex animate-fade-up flex-col gap-3">
              <div
                onDragOver={(e) => {
                  e.preventDefault()
                  setDragging(true)
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-lg border border-dashed px-4 py-7 text-center transition-colors",
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
                <p className="text-sm text-foreground">
                  Drag files here or{" "}
                  <button type="button" className="cursor-pointer font-medium text-link underline-offset-4 hover:underline" onClick={() => inputRef.current?.click()}>
                    browse your computer
                  </button>
                </p>
                <p className="text-xs text-muted-foreground">PDF, XLSX, DOCX · up to {MAX_MB} MB each</p>
                <p className="mt-1 flex items-start gap-1.5 text-left text-xs text-text-secondary">
                  <Info aria-hidden className="mt-0.5 size-3.5 shrink-0 text-ai" />
                  Demo: your files are validated and listed but never read — there is no AI backend. Use the sample documents to see a scripted
                  analysis.
                </p>
                <input
                  ref={inputRef}
                  type="file"
                  multiple
                  accept={ACCEPT.join(",")}
                  className="sr-only"
                  tabIndex={-1}
                  aria-hidden
                  onChange={(e) => addFiles(e.target.files)}
                />
              </div>
              {errors.length > 0 && (
                <ul role="alert" className="flex flex-col gap-1 rounded-md bg-sev-critical-subtle p-3 text-xs text-sev-critical">
                  {errors.map((er) => (
                    <li key={er} className="flex items-start gap-1.5">
                      <CircleAlert aria-hidden className="mt-0.5 size-3.5 shrink-0" />
                      {er}
                    </li>
                  ))}
                </ul>
              )}
              {files.length === 0 ? (
                <Button
                  variant="ai"
                  className="self-start"
                  onClick={() => setFiles(SAMPLE_UPLOADS.map((s) => toQueued(s.id, "sample", s.name, s.size, s.pages, s.failsFirstAttempt)))}
                >
                  <Sparkles aria-hidden /> Use 3 sample documents (demo)
                </Button>
              ) : (
                <ul className="flex flex-col gap-2" aria-label="Files to upload">
                  {files.map((f) => (
                    <li key={f.name} className="flex items-center gap-2.5 rounded-md border border-border px-3 py-2.5">
                      <FileText aria-hidden className="size-4 shrink-0 text-text-secondary" />
                      <span className="min-w-0 flex-1 truncate text-[13px]">{f.name}</span>
                      {f.source === "sample" && <span className="text-[11px] font-medium text-ai">Sample</span>}
                      <span className="text-xs text-muted-foreground tabular">{f.size}</span>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        aria-label={`Remove ${f.name}`}
                        onClick={() => setFiles((prev) => prev.filter((p) => p.name !== f.name))}
                      >
                        <X aria-hidden />
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {stage === "processing" && (
            <div key="processing" className="flex animate-fade-up flex-col gap-3">
              <div role="progressbar" aria-label="Overall progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={overall} className="h-1.5 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-[image:var(--gradient-brand)] transition-[width] duration-150 ease-linear" style={{ width: `${overall}%` }} />
              </div>
              <ul className="flex flex-col gap-2" aria-live="polite">
                {files.map((f) => {
                  const ok = f.progress >= 100
                  return (
                    <li
                      key={f.name}
                      className={cn(
                        "flex flex-col gap-2 rounded-md border px-3 py-2.5 transition-colors",
                        f.failed ? "border-sev-critical/50 bg-sev-critical-subtle" : "border-border",
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        {f.failed ? (
                          <CircleAlert aria-hidden className="size-4 shrink-0 text-sev-critical" />
                        ) : ok ? (
                          <span className="grid size-4 animate-pop place-items-center rounded-full bg-positive">
                            <Check aria-hidden className="size-3 text-white" strokeWidth={3} />
                          </span>
                        ) : f.progress > 0 ? (
                          <LoaderCircle aria-hidden className="size-4 shrink-0 animate-spin text-ai-strong" />
                        ) : (
                          <FileText aria-hidden className="size-4 shrink-0 text-muted-foreground" />
                        )}
                        <span className="min-w-0 flex-1 truncate text-[13px]">{f.name}</span>
                        <span
                          className={cn(
                            "text-xs tabular",
                            f.failed ? "font-medium text-sev-critical" : ok && f.source === "sample" ? "text-positive" : "text-muted-foreground",
                          )}
                        >
                          {fileLabel(f)}
                        </span>
                      </div>
                      {!ok && !f.failed && f.progress > 0 && (
                        <div aria-hidden className="relative h-1 overflow-hidden rounded-full bg-muted">
                          <div className="absolute inset-y-0 left-0 rounded-full bg-ai-strong transition-[width] duration-100" style={{ width: `${f.progress}%` }} />
                        </div>
                      )}
                      {f.failed && (
                        <div className="flex items-center gap-2">
                          <p className="flex-1 text-xs text-sev-critical">Scripted demo failure: scanned image with no text layer, so OCR could not read pages 3–9.</p>
                          <Button size="sm" variant="outline" onClick={() => retry(f.name)}>
                            <RefreshCw aria-hidden /> Retry with OCR
                          </Button>
                        </div>
                      )}
                    </li>
                  )
                })}
              </ul>
            </div>
          )}

          {stage === "done" && (
            <div key="done" className="flex animate-pop flex-col gap-3">
              {addsFinding ? (
                <div className="flex items-start gap-3 rounded-md border border-ai-border bg-ai-subtle p-4">
                  <Sparkles aria-hidden className="mt-0.5 size-4 shrink-0 text-ai" />
                  <div className="text-sm">
                    <p className="font-semibold text-foreground">1 new finding from the sample contracts (scripted demo)</p>
                    <p className="mt-1 text-text-secondary">
                      <span className="font-mono text-xs">F-07</span> {UPLOAD_FINDING.title} — <span className="font-medium text-sev-high">High</span>.
                      It will need a decision before IC submission.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3 rounded-md border border-border bg-background p-4">
                  <Info aria-hidden className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  <p className="text-sm text-text-secondary">
                    {hasSampleContracts && alreadyHasF07
                      ? "No new findings — the sample contracts are already covered by F-07."
                      : "No findings were created. This demo has no AI backend, so the contents of your files are not read."}
                  </p>
                </div>
              )}
              {userCount > 0 && sampleCount > 0 && (
                <p className="text-xs text-muted-foreground">
                  {userCount} of your file{userCount === 1 ? "" : "s"} will be listed as “Demo · not analysed”.
                </p>
              )}
            </div>
          )}

        <DialogFooter>
          {stage === "select" && (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  setUploadOpen(false)
                  reset()
                }}
              >
                Cancel
              </Button>
              <Button disabled={files.length === 0} onClick={() => setStage("processing")}>
                <CloudUpload aria-hidden /> Upload {files.length > 0 ? `${files.length} file${files.length === 1 ? "" : "s"}` : ""}
              </Button>
            </>
          )}
          {stage === "processing" && (
            <>
              {failed.length > 0 && done > 0 && done + failed.length === files.length && (
                <Button variant="outline" onClick={() => setStage("done")}>
                  Finish without failed file
                </Button>
              )}
              <Button variant="outline" onClick={() => setUploadOpen(false)}>
                Run in background
              </Button>
            </>
          )}
          {stage === "done" && <Button onClick={finish}>{addsFinding ? "Add to data room & review" : "Add to data room"}</Button>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
