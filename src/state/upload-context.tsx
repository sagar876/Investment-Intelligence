import { createContext, use, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import { toast } from "sonner"
import { SAMPLE_UPLOADS, UPLOAD_FINDING } from "@/data/meridian"
import type { SourceDocument } from "@/types/domain"
import { useReview } from "./review-context"

/*
 * Simulated, deterministic upload manager (demo).
 * Only file name and size are kept — File objects and contents are never stored, read or sent anywhere.
 * Uploads advance on a timer that lives here, above every view, so they continue while the dialog is
 * closed, the activity panel is collapsed, or the user works elsewhere on the dashboard.
 */

export const ACCEPTED_EXTENSIONS = [".pdf", ".xlsx", ".docx"]
export const MAX_FILE_MB = 50
const TICK_MS = 120
const BYTES_PER_TICK = 0.32 * 1024 * 1024 // ≈ 2.7 MB/s simulated throughput per file
const PROCESSING_TICKS = 9 // ≈ 1 s "checking file" stage after transfer
const CONCURRENCY = 2

export type UploadStatus = "queued" | "uploading" | "processing" | "completed" | "failed" | "cancelled"

export interface UploadItem {
  id: string
  name: string
  bytes: number
  source: "sample" | "user"
  pages: number
  status: UploadStatus
  /** 0–100 transfer progress. */
  progress: number
  processingTicks: number
  /** Deterministic simulated failure point (percent) for the first attempt, if any. */
  failAt?: number
  attempt: number
  error?: string
  batch: number
}

export interface PendingFile {
  id: string
  name: string
  bytes: number
  source: "sample" | "user"
  pages: number
  failAt?: number
}

export interface Rejection {
  name: string
  reason: string
}

export type PanelMode = "expanded" | "collapsed" | "hidden"

interface UploadContextValue {
  items: UploadItem[]
  panel: PanelMode
  setPanel: (mode: PanelMode) => void
  networkFailureNext: boolean
  setNetworkFailureNext: (on: boolean) => void
  /** Validate a selection against type, size and duplicates. Never reads file contents. */
  validate: (files: Array<{ name: string; size: number }>, alreadySelected: PendingFile[]) => { accepted: PendingFile[]; rejected: Rejection[] }
  samples: () => PendingFile[]
  start: (files: PendingFile[]) => void
  cancel: (id: string) => void
  retry: (id: string) => void
  clearFinished: () => void
  readyCount: number
  runAnalysis: () => void
  analysing: boolean
}

const UploadContext = createContext<UploadContextValue | null>(null)

export const formatBytes = (b: number) => (b >= 1024 * 1024 ? `${(b / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`)
const userDocId = (name: string) => `user-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`
const isActive = (s: UploadStatus) => s === "queued" || s === "uploading" || s === "processing"

export function UploadProvider({ children }: { children: ReactNode }) {
  const { state, dispatch } = useReview()
  const [items, setItems] = useState<UploadItem[]>([])
  const [panel, setPanel] = useState<PanelMode>("hidden")
  const [networkFailureNext, setNetworkFailureNext] = useState(false)
  const batchRef = useRef(0)
  const notifiedBatches = useRef(new Set<number>())
  const addedDocs = useRef(new Set<string>())
  const analysisResult = useRef<null | { docs: number; newFinding: boolean; userOnly: boolean }>(null)

  const active = items.some((i) => isActive(i.status))

  // Simulation clock — runs only while something is in flight.
  useEffect(() => {
    if (!active) return
    const id = window.setInterval(() => {
      setItems((prev) => {
        let slots = CONCURRENCY - prev.filter((i) => i.status === "uploading").length
        return prev.map((i) => {
          if (i.status === "queued" && slots > 0) {
            slots -= 1
            return { ...i, status: "uploading" }
          }
          if (i.status === "uploading") {
            const next = Math.min(100, i.progress + Math.max(1, Math.round((BYTES_PER_TICK / i.bytes) * 100)))
            if (i.failAt !== undefined && i.attempt === 1 && next >= i.failAt) {
              return { ...i, progress: i.failAt, status: "failed", error: "The connection was interrupted. Your other files are still uploading." }
            }
            return next >= 100 ? { ...i, progress: 100, status: "processing" } : { ...i, progress: next }
          }
          if (i.status === "processing") {
            return i.processingTicks + 1 >= PROCESSING_TICKS ? { ...i, status: "completed" } : { ...i, processingTicks: i.processingTicks + 1 }
          }
          return i
        })
      })
    }, TICK_MS)
    return () => window.clearInterval(id)
  }, [active])

  // Each completed file appears in the data room immediately, ready for analysis (exactly once).
  useEffect(() => {
    const fresh = items.filter((i) => i.status === "completed" && !addedDocs.current.has(i.id))
    if (!fresh.length) return
    for (const i of fresh) addedDocs.current.add(i.id)
    const docs: SourceDocument[] = fresh.map((i) => ({
      id: i.id,
      title: i.name,
      shortTitle: i.name.replace(/\.[a-z]+$/i, "").replace(/_/g, " ").slice(0, 18),
      pages: i.pages,
      kind: i.name.toLowerCase().endsWith(".xlsx") ? "xlsx" : i.name.toLowerCase().endsWith(".docx") ? "docx" : "pdf",
      uploadedAt: "17 Nov 2026",
      origin: i.source,
      status: "ready",
    }))
    dispatch({ type: "add-documents", documents: docs, findings: [] })
  }, [items, dispatch])

  // One success notification per batch, only when nothing in that batch is still in flight or failed.
  useEffect(() => {
    const batches = new Set(items.map((i) => i.batch))
    for (const b of batches) {
      if (notifiedBatches.current.has(b)) continue
      const inBatch = items.filter((i) => i.batch === b)
      if (inBatch.some((i) => isActive(i.status) || i.status === "failed")) continue
      const done = inBatch.filter((i) => i.status === "completed").length
      if (done === 0) continue
      notifiedBatches.current.add(b)
      const cancelled = inBatch.filter((i) => i.status === "cancelled").length
      toast.success(done === 1 ? "Document uploaded successfully." : `All ${done} documents uploaded successfully.`, {
        description: `${cancelled ? `${cancelled} cancelled · ` : ""}Ready for the simulated AI analysis.`,
        action: {
          label: "View documents",
          onClick: () => document.getElementById("data-room")?.scrollIntoView({ behavior: "smooth", block: "center" }),
        },
      })
    }
  }, [items])

  // Report the outcome of a simulated analysis run once it finishes.
  useEffect(() => {
    if (state.phase !== "ready" || !analysisResult.current) return
    const r = analysisResult.current
    analysisResult.current = null
    if (r.newFinding) {
      toast.success("Analysis complete — 1 new finding", { description: "F-07 was raised from the sample contracts (scripted demo). It needs a decision." })
    } else {
      toast.success("Analysis complete — no new findings", {
        description: r.userOnly ? "Simulated: the contents of your own files are not read in this demo." : "The new documents did not change existing findings.",
      })
    }
  }, [state.phase])

  const validate = useCallback<UploadContextValue["validate"]>(
    (files, alreadySelected) => {
      const accepted: PendingFile[] = []
      const rejected: Rejection[] = []
      const taken = new Set([
        ...state.documents.map((d) => d.title.toLowerCase()),
        ...items.filter((i) => i.status !== "cancelled").map((i) => i.name.toLowerCase()),
        ...alreadySelected.map((f) => f.name.toLowerCase()),
      ])
      for (const f of files) {
        const ext = f.name.slice(f.name.lastIndexOf(".")).toLowerCase()
        if (!ACCEPTED_EXTENSIONS.includes(ext)) rejected.push({ name: f.name, reason: "This file type isn’t supported. Use PDF, Excel (.xlsx) or Word (.docx)." })
        else if (f.size > MAX_FILE_MB * 1024 * 1024) rejected.push({ name: f.name, reason: `This file is larger than ${MAX_FILE_MB} MB. Try splitting or compressing it.` })
        else if (f.size === 0) rejected.push({ name: f.name, reason: "This file is empty." })
        else if (taken.has(f.name.toLowerCase())) rejected.push({ name: f.name, reason: "A file with this name is already in the data room or uploading." })
        else {
          taken.add(f.name.toLowerCase())
          accepted.push({ id: userDocId(f.name), name: f.name, bytes: f.size, source: "user", pages: 0 })
        }
      }
      return { accepted, rejected }
    },
    [state.documents, items],
  )

  const samples = useCallback(
    () =>
      SAMPLE_UPLOADS.filter((s) => !state.documents.some((d) => d.id === s.id) && !items.some((i) => i.id === s.id && i.status !== "cancelled")).map(
        (s) => ({ id: s.id, name: s.name, bytes: s.bytes, source: "sample" as const, pages: s.pages, failAt: s.failAt }),
      ),
    [state.documents, items],
  )

  const start = useCallback(
    (files: PendingFile[]) => {
      if (!files.length) return
      batchRef.current += 1
      const batch = batchRef.current
      const failFirstUser = networkFailureNext
      let failAssigned = false
      setItems((prev) => [
        ...prev.filter((p) => !(p.status === "cancelled" && files.some((f) => f.id === p.id))),
        ...files.map((f) => {
          let failAt = f.failAt
          if (failFirstUser && !failAssigned) {
            failAt = 55
            failAssigned = true
          }
          return { ...f, failAt, status: "queued" as const, progress: 0, processingTicks: 0, attempt: 1, batch }
        }),
      ])
      if (failFirstUser) setNetworkFailureNext(false)
      setPanel((p) => (p === "hidden" ? "collapsed" : p))
    },
    [networkFailureNext],
  )

  const value = useMemo<UploadContextValue>(
    () => ({
      items,
      panel,
      setPanel,
      networkFailureNext,
      setNetworkFailureNext,
      validate,
      samples,
      start,
      cancel: (id) =>
        setItems((prev) => prev.map((i) => (i.id === id && (i.status === "queued" || i.status === "uploading") ? { ...i, status: "cancelled", error: undefined } : i))),
      retry: (id) =>
        // Only the failed file restarts; completed files are never touched.
        setItems((prev) => prev.map((i) => (i.id === id && i.status === "failed" ? { ...i, status: "queued", attempt: i.attempt + 1, error: undefined } : i))),
      clearFinished: () => setItems((prev) => prev.filter((i) => isActive(i.status) || i.status === "failed")),
      readyCount: state.documents.filter((d) => d.status === "ready").length,
      analysing: state.phase === "analysing",
      runAnalysis: () => {
        const ready = state.documents.filter((d) => d.status === "ready")
        if (!ready.length || state.phase !== "ready") return
        const hasContracts = ready.some((d) => d.id === UPLOAD_FINDING.evidence[0].documentId)
        const newFinding = hasContracts && !state.findings.some((f) => f.id === UPLOAD_FINDING.id)
        analysisResult.current = { docs: ready.length, newFinding, userOnly: ready.every((d) => d.origin === "user") }
        dispatch({ type: "analyse-documents", findings: newFinding ? [UPLOAD_FINDING] : [] })
      },
    }),
    [items, panel, networkFailureNext, validate, samples, start, state.documents, state.phase, state.findings, dispatch],
  )

  return <UploadContext value={value}>{children}</UploadContext>
}

export function useUploads(): UploadContextValue {
  const ctx = use(UploadContext)
  if (!ctx) throw new Error("useUploads must be used inside <UploadProvider>")
  return ctx
}

/** Aggregate view used by the activity panel and header indicator. */
export function summarise(items: UploadItem[]) {
  const visible = items.filter((i) => i.status !== "cancelled")
  const inFlight = visible.filter((i) => isActive(i.status))
  const failed = visible.filter((i) => i.status === "failed")
  const completed = visible.filter((i) => i.status === "completed")
  const totalBytes = visible.reduce((s, i) => s + i.bytes, 0) || 1
  const doneBytes = visible.reduce((s, i) => s + (i.status === "completed" || i.status === "processing" ? i.bytes : (i.bytes * i.progress) / 100), 0)
  const current = visible.find((i) => i.status === "uploading") ?? visible.find((i) => i.status === "processing")
  const phase: "uploading" | "processing" | "failed" | "completed" | "idle" = inFlight.some((i) => i.status === "uploading" || i.status === "queued")
    ? "uploading"
    : inFlight.length
      ? "processing"
      : failed.length
        ? "failed"
        : completed.length
          ? "completed"
          : "idle"
  return { visible, inFlight, failed, completed, percent: Math.round((doneBytes / totalBytes) * 100), current, phase }
}
