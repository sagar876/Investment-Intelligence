import { ChartColumn, RefreshCw, Table2, TriangleAlert } from "lucide-react"
import { lazy, Suspense, useState } from "react"
import { Reserve } from "@/components/common/reserve"
import { SectionCard } from "@/components/common/section-card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FINANCIALS, KEY_METRICS } from "@/data/meridian"
import { cn } from "@/lib/utils"
import { useReview } from "@/state/review-context"

const FinancialChart = lazy(() => import("./financial-chart"))

function FinancialTable() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm tabular">
        <caption className="sr-only">Revenue, EBITDA and EBITDA margin by fiscal year, USD millions</caption>
        <thead>
          <tr className="border-b border-border text-left text-[11px] tracking-[0.08em] text-muted-foreground uppercase">
            <th scope="col" className="py-2 pr-4 font-semibold">Metric</th>
            {FINANCIALS.map((f) => (
              <th key={f.year} scope="col" className="py-2 pl-4 text-right font-semibold">{f.year}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {(
            [
              ["Revenue ($m)", (f) => f.revenue.toFixed(1)],
              ["EBITDA ($m)", (f) => f.ebitda.toFixed(1)],
              ["EBITDA margin", (f) => `${f.margin.toFixed(1)}%`],
              ["Revenue growth", (_f, i) => (i === 0 ? "—" : `${(((FINANCIALS[i].revenue / FINANCIALS[i - 1].revenue) - 1) * 100).toFixed(1)}%`)],
            ] as const satisfies ReadonlyArray<readonly [string, (f: (typeof FINANCIALS)[number], i: number) => string]>
          ).map(([label, fn]) => (
            <tr key={label} className="border-b border-border last:border-0">
              <th scope="row" className="py-2.5 pr-4 text-left font-normal text-text-secondary">{label}</th>
              {FINANCIALS.map((f, i) => (
                <td key={f.year} className="py-2.5 pl-4 text-right font-medium text-foreground">{fn(f, i)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function ChartError({ onShowTable }: { onShowTable: () => void }) {
  const { dispatch } = useReview()
  return (
    <Alert className="self-center border-sev-high/30 bg-sev-high-subtle text-foreground">
      <TriangleAlert aria-hidden className="text-sev-high" />
      <AlertTitle>Chart data could not be loaded</AlertTitle>
      <AlertDescription className="text-text-secondary">
        <p>The management-accounts feed returned an incomplete series. Audited figures are still available as a table.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={onShowTable}>
            <Table2 aria-hidden /> View as table
          </Button>
          <Button size="sm" variant="ghost" onClick={() => dispatch({ type: "set-scenario", scenario: { chartError: false } })}>
            <RefreshCw aria-hidden /> Retry
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  )
}

export function FinancialPerformance() {
  const { state } = useReview()
  const [view, setView] = useState<"chart" | "table">("chart")
  const pending = state.phase !== "ready"

  return (
    <Tabs value={view} onValueChange={(v) => setView(v as "chart" | "table")} className="contents">
      <SectionCard
        id="financial-performance"
        title="Financial performance"
        description="FY2022 – FY2024 · USD millions · Audited (FY24 management-adjusted EBITDA)"
        pending={pending}
        actions={
          <TabsList aria-label="Financial performance view">
            <TabsTrigger value="chart" className="px-2.5">
              <ChartColumn aria-hidden /> Chart
            </TabsTrigger>
            <TabsTrigger value="table" className="px-2.5">
              <Table2 aria-hidden /> Table
            </TabsTrigger>
          </TabsList>
        }
      >
        <Reserve
          active={state.scenario.emptyDataRoom}
          overlayClassName="flex"
          ghost={
        <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_240px] lg:grid-cols-[minmax(0,1fr)_260px] md:gap-8">
          <div className="min-w-0">
            <TabsContent value="chart" className="mt-0">
              {/* Legend (24px) + chart (260px): error and loading states render inside this same area. */}
              <div className="flex min-h-[284px] flex-col">
                {state.scenario.chartError ? (
                  <ChartError onShowTable={() => setView("table")} />
                ) : (
                  <>
                    <ul className="mb-2 flex gap-4 text-xs text-text-secondary" aria-label="Legend">
                      <li className="flex items-center gap-1.5"><span aria-hidden className="size-2.5 rounded-[2px] bg-chart-1" />Revenue</li>
                      <li className="flex items-center gap-1.5"><span aria-hidden className="size-2.5 rounded-[2px] bg-chart-2" />EBITDA</li>
                    </ul>
                    {pending ? (
                      <Skeleton className="h-[260px] w-full" />
                    ) : (
                      <Suspense fallback={<Skeleton className="h-[260px] w-full" />}>
                        <FinancialChart />
                      </Suspense>
                    )}
                  </>
                )}
              </div>
            </TabsContent>
            <TabsContent value="table" className="mt-0">
              <FinancialTable />
            </TabsContent>
          </div>
          <div>
            <h3 className="font-sans text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">Key metrics · FY2024</h3>
            <dl className="mt-1">
              {KEY_METRICS.map((m) => (
                <div key={m.label} className="flex items-center gap-2 border-b border-border py-2.5 last:border-0">
                  <dt className="flex-1 text-[13px] text-text-secondary">
                    <span className="sk">{m.label}</span>
                  </dt>
                  <dd className="flex items-center gap-2">
                    {m.note && (
                      <span className={cn("sk text-xs", m.attention ? "font-medium text-sev-medium" : "text-muted-foreground")}>
                        {m.note}
                        {m.attention && <span className="sr-only"> (needs attention)</span>}
                      </span>
                    )}
                    <span className="sk text-sm font-semibold text-foreground tabular">{m.value}</span>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
          }
        >
          <div className="flex w-full items-center justify-center rounded-md border border-dashed border-border-strong bg-background p-6 text-center">
            <p className="max-w-sm text-sm text-text-secondary">
              Financial performance appears once audited or management accounts are in the data room.
            </p>
          </div>
        </Reserve>
      </SectionCard>
    </Tabs>
  )
}
