import { Check, CircleAlert, FileSpreadsheet, FileText, LoaderCircle, RotateCw, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { formatBytes, useUploads, type UploadItem } from "@/state/upload-context"

const STATUS_TEXT: Record<UploadItem["status"], (i: UploadItem) => string> = {
  queued: () => "Waiting to upload",
  uploading: (i) => `Uploading · ${i.progress}%`,
  processing: () => "Checking file…",
  completed: () => "Uploaded",
  failed: () => "Upload interrupted",
  cancelled: () => "Cancelled",
}

/** One file's upload state with its per-file action (cancel while in flight, retry after a failure). */
export function UploadFileRow({ item, compact = false }: { item: UploadItem; compact?: boolean }) {
  const { cancel, retry } = useUploads()
  const Icon = item.name.toLowerCase().endsWith(".xlsx") ? FileSpreadsheet : FileText
  const inFlight = item.status === "queued" || item.status === "uploading"
  const statusId = `upload-status-${item.id}`

  return (
    <li
      className={cn(
        "flex flex-col gap-1.5 rounded-md border px-3 transition-colors duration-300",
        compact ? "py-2" : "py-2.5",
        item.status === "failed" ? "border-sev-critical/40 bg-sev-critical-subtle" : "border-border bg-card",
      )}
    >
      <div className="flex items-center gap-2.5">
        {item.status === "completed" ? (
          <span className="grid size-4 shrink-0 animate-pop place-items-center rounded-full bg-positive">
            <Check aria-hidden className="size-3 text-white" strokeWidth={3} />
          </span>
        ) : item.status === "failed" ? (
          <CircleAlert aria-hidden className="size-4 shrink-0 text-sev-critical" />
        ) : item.status === "uploading" || item.status === "processing" ? (
          <LoaderCircle aria-hidden className="size-4 shrink-0 animate-spin text-ai-strong" />
        ) : (
          <Icon aria-hidden className="size-4 shrink-0 text-muted-foreground" />
        )}
        <span className="min-w-0 flex-1 truncate text-[13px] text-foreground" title={item.name}>
          {item.name}
        </span>
        {item.source === "sample" && <span className="hidden text-[11px] font-medium text-ai sm:inline">Sample</span>}
        <span className="shrink-0 text-xs text-muted-foreground tabular">{formatBytes(item.bytes)}</span>
        {inFlight && (
          <Button variant="ghost" size="icon-xs" aria-label={`Cancel upload of ${item.name}`} onClick={() => cancel(item.id)}>
            <X aria-hidden />
          </Button>
        )}
      </div>
      <div className="flex items-center gap-2">
        <p
          id={statusId}
          className={cn(
            "flex-1 text-xs tabular",
            item.status === "failed" ? "font-medium text-sev-critical" : item.status === "completed" ? "text-positive" : "text-muted-foreground",
          )}
        >
          {STATUS_TEXT[item.status](item)}
          {item.status === "failed" && <span className="block font-normal">{item.error}</span>}
        </p>
        {item.status === "failed" && (
          <Button size="sm" variant="outline" className="bg-card" onClick={() => retry(item.id)} aria-describedby={statusId}>
            <RotateCw aria-hidden /> Retry
          </Button>
        )}
      </div>
      {(item.status === "uploading" || item.status === "queued") && (
        <div aria-hidden className="h-1 overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-ai-strong transition-[width] duration-150 ease-linear" style={{ width: `${item.progress}%` }} />
        </div>
      )}
      {item.status === "processing" && (
        <div aria-hidden className="ai-shimmer h-1 animate-shimmer rounded-full bg-ai-subtle" />
      )}
    </li>
  )
}
