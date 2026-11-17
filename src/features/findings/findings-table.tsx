import { createColumnHelper, tableFeatures, useTable } from "@tanstack/react-table"
import { PanelRight, SearchX, Sparkles } from "lucide-react"
import { useMemo } from "react"
import { CitationChip, SeverityBadge, StatusBadge } from "@/components/common/badges"
import { Reserve } from "@/components/common/reserve"
import { SectionCard } from "@/components/common/section-card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { CATEGORY_LABEL, findDocument } from "@/lib/labels"
import { stagger } from "@/lib/stagger"
import { cn } from "@/lib/utils"
import { useReview } from "@/state/review-context"
import { activeFindings, needsReviewCount, SEVERITY_ORDER, visibleFindings, type CategoryFilter, type StatusFilter } from "@/state/review-reducer"
import { useUi } from "@/state/ui-context"
import type { Finding, RiskCategory } from "@/types/domain"

const features = tableFeatures({})
const col = createColumnHelper<typeof features, Finding>()

function sourceLabel(f: Finding, docs: ReturnType<typeof useReview>["state"]["documents"]) {
  const ev = f.evidence[0]
  const doc = findDocument(ev.documentId, docs)
  return `${doc?.shortTitle ?? "Upload"} p.${ev.page}`
}

function FindingTitle({ f, compact }: { f: Finding; compact?: boolean }) {
  const { state } = useReview()
  const { openEvidence } = useUi()
  const selected = state.selectedId === f.id
  return (
    <div className="min-w-0">
      <button
        type="button"
        disabled={state.phase !== "ready"}
        onClick={() => openEvidence(f.id)}
        aria-current={selected ? "true" : undefined}
        className="cursor-pointer text-left text-sm leading-5 font-medium text-foreground after:absolute after:inset-0 after:content-[''] focus-visible:outline-none disabled:cursor-default"
      >
        <span className={cn(!compact && "line-clamp-2")} title={f.title}>
          <span className="sk">{f.title}</span>
        </span>
        {f.isNew && (
          <span className="ml-1.5 inline-flex translate-y-[-1px] items-center gap-0.5 rounded-sm bg-ai-subtle px-1.5 text-[10px] font-semibold tracking-wide text-ai uppercase">
            <Sparkles aria-hidden className="size-2.5" /> New
          </span>
        )}
      </button>
      <div className="relative z-10 mt-1.5 w-fit">
        <CitationChip className="sk" label={sourceLabel(f, state.documents)} />
      </div>
    </div>
  )
}

function OpenDetails({ id }: { id: string }) {
  const { openDrawer } = useUi()
  const { state } = useReview()
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          className="sk-hide relative z-10"
          disabled={state.phase !== "ready"}
          onClick={() => openDrawer(id)} aria-label={`Open details for ${id}`}>
          <PanelRight aria-hidden />
        </Button>
      </TooltipTrigger>
      <TooltipContent>Open details</TooltipContent>
    </Tooltip>
  )
}

const columns = col.columns([
  col.accessor("id", {
    header: "ID",
    cell: (info) => <span className="sk font-mono text-xs text-muted-foreground">{info.getValue()}</span>,
  }),
  col.accessor("title", { header: "Finding", cell: (info) => <FindingTitle f={info.row.original} /> }),
  col.accessor("severity", { header: "Severity", cell: (info) => <SeverityBadge className="sk" severity={info.getValue()} /> }),
  col.accessor("category", {
    header: "Category",
    cell: (info) => <span className="sk text-[13px] text-text-secondary">{CATEGORY_LABEL[info.getValue()]}</span>,
  }),
  col.accessor("status", { header: "Status", cell: (info) => <StatusBadge className="sk" status={info.getValue()} /> }),
  col.display({ id: "actions", header: () => <span className="sr-only">Actions</span>, cell: (info) => <OpenDetails id={info.row.original.id} /> }),
])

const COL_CLASS: Record<string, string> = {
  id: "w-[76px] pl-5 whitespace-nowrap",
  title: "",
  severity: "w-[104px]",
  category: "hidden w-[104px] xl:table-cell",
  status: "w-[132px]",
  actions: "w-12 pr-3",
}

function FilterChip({ value, label, count }: { value: StatusFilter; label: string; count: number }) {
  const { state, dispatch } = useReview()
  const on = state.statusFilter === value
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={() => dispatch({ type: "set-status-filter", filter: value })}
      className={cn(
        "inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full border px-3 text-xs font-medium transition-colors",
        on ? "border-brand-ink bg-brand-ink text-white" : "border-border-strong bg-card text-text-secondary hover:border-input hover:text-foreground",
      )}
    >
      {label}
      <span className={cn("tabular", on ? "text-white/80" : "text-muted-foreground")}>{count}</span>
    </button>
  )
}

export function FindingsTable() {
  const { state, dispatch } = useReview()
  const rows = useMemo(() => visibleFindings(state), [state])
  const empty = state.scenario.emptyDataRoom
  // Empty data room: the populated table renders invisibly underneath so the card keeps its size.
  const ghostRows = useMemo(
    () => (empty ? [...state.findings].sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]) : rows),
    [empty, state.findings, rows],
  )
  const all = activeFindings(state)
  const table = useTable({ features, columns, data: ghostRows, getRowId: (r) => r.id })
  const pending = state.phase !== "ready"
  const critHigh = all.filter((f) => f.severity === "critical" || f.severity === "high").length

  return (
    <SectionCard
      id="key-findings"
      title="Key findings"
      ai
      description={empty ? "No findings yet" : `${all.length} AI-identified findings · ${needsReviewCount(state)} need human review`}
      pending={pending}
      bodyClassName="px-0 sm:px-0 pb-3 sm:pb-3 gap-3"
    >
      <div className="flex flex-wrap items-center gap-2 px-5 sm:px-6" role="group" aria-label="Filter findings">
        <FilterChip value="all" label="All" count={all.length} />
        <FilterChip value="needs-review" label="Needs review" count={needsReviewCount(state)} />
        <FilterChip value="critical-high" label="Critical & High" count={critHigh} />
        <div className="ml-auto">
          <Select value={state.categoryFilter} onValueChange={(v) => dispatch({ type: "set-category-filter", category: v as CategoryFilter })}>
            <SelectTrigger aria-label="Filter by category" className="h-8 min-w-36 border-input/70 bg-card text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="end">
              <SelectItem value="all">All categories</SelectItem>
              {(Object.keys(CATEGORY_LABEL) as RiskCategory[]).map((c) => (
                <SelectItem key={c} value={c}>
                  {CATEGORY_LABEL[c]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {!empty && rows.length === 0 ? (
        <div className="mx-5 flex flex-col items-center gap-3 rounded-md border border-dashed border-border-strong bg-background px-4 py-10 text-center sm:mx-6">
          <SearchX aria-hidden className="size-6 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium text-foreground">No findings match these filters</p>
            <p className="mt-0.5 text-xs text-muted-foreground">Try a different status or category.</p>
          </div>
          <Button size="sm" variant="outline" onClick={() => dispatch({ type: "clear-filters" })}>
            Clear filters
          </Button>
        </div>
      ) : (
        <Reserve
          active={empty}
          overlayClassName="flex px-5 sm:px-6"
          ghost={
        <>
          {/* Tablet & desktop: semantic table */}
          <div className="hidden md:block">
            <table className="w-full table-fixed border-collapse text-left">
              <caption className="sr-only">Key findings, sorted by severity. Select a finding title to review its evidence.</caption>
              <thead className="bg-muted/70">
                {table.getHeaderGroups().map((hg) => (
                  <tr key={hg.id} className="border-y border-border">
                    {hg.headers.map((h) => (
                      <th
                        key={h.id}
                        scope="col"
                        className={cn("px-3 py-2 text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase", COL_CLASS[h.column.id])}
                      >
                        <table.FlexRender header={h} />
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map((row, i) => {
                    const selected = state.selectedId === row.id
                    return (
                      <tr
                        key={row.id}
                        style={stagger(i)}
                        className={cn(
                          "relative animate-fade-in border-b border-border align-middle transition-colors focus-within:bg-accent/60",
                          selected ? "bg-accent shadow-[inset_3px_0_0_var(--brand-teal)]" : "hover:bg-background",
                        )}
                      >
                        {row.getAllCells().map((cell) => (
                          <td key={cell.id} className={cn("px-3 py-3", COL_CLASS[cell.column.id])}>
                            <table.FlexRender cell={cell} />
                          </td>
                        ))}
                      </tr>
                    )
                  })}
              </tbody>
            </table>
          </div>

          {/* Mobile: stacked cards from the same row model */}
          <ul className="flex flex-col gap-2 px-4 md:hidden">
            {table.getRowModel().rows.map((row) => {
              const f = row.original
              return (
                <li
                  key={row.id}
                  className={cn(
                    "relative rounded-md border p-3.5 transition-colors",
                    state.selectedId === f.id ? "border-ai-border bg-accent" : "border-border bg-card",
                  )}
                >
                  <div className="mb-2 flex items-center gap-2">
                    <SeverityBadge className="sk" severity={f.severity} />
                    <span className="sk text-xs text-text-secondary">{CATEGORY_LABEL[f.category]}</span>
                    <span className="sk ml-auto font-mono text-xs text-muted-foreground">{f.id}</span>
                  </div>
                  <FindingTitle f={f} compact />
                  <div className="relative z-10 mt-2.5">
                    <StatusBadge className="sk" status={f.status} />
                  </div>
                </li>
              )
            })}
          </ul>
          <p className="px-5 pt-1 text-xs text-muted-foreground sm:px-6" aria-live="polite">
            Showing {ghostRows.length} of {all.length || ghostRows.length} · sorted by severity
            {state.categoryFilter !== "all" && ` · ${CATEGORY_LABEL[state.categoryFilter]} only`}
          </p>
        </>
          }
        >
          <div className="flex w-full flex-col items-center justify-center gap-3 rounded-md border border-dashed border-border-strong bg-background px-4 py-10 text-center">
            <SearchX aria-hidden className="size-6 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-foreground">No findings yet</p>
              <p className="mt-0.5 text-xs text-muted-foreground">Findings appear here after the data room has been analysed.</p>
            </div>
          </div>
        </Reserve>
      )}
    </SectionCard>
  )
}
