import { Info, TrendingDown, TrendingUp } from "lucide-react"
import { stagger } from "@/lib/stagger"
import { FINANCIALS, KPIS } from "@/data/meridian"
import { cn } from "@/lib/utils"
import { useReview } from "@/state/review-context"
import type { Kpi } from "@/types/domain"

const TREND = {
  positive: { icon: TrendingUp, cls: "text-positive" },
  negative: { icon: TrendingDown, cls: "text-sev-critical" },
  neutral: { icon: Info, cls: "text-muted-foreground" },
} as const

const SERIES: Record<string, number[]> = {
  revenue: FINANCIALS.map((f) => f.revenue),
  growth: [31.2, 27.6, 21.6],
  margin: FINANCIALS.map((f) => f.margin),
}

function format(kpi: Kpi) {
  return (n: number) => (kpi.format === "percent" ? `${n.toFixed(1)}%` : n >= 100 ? `$${Math.round(n)}m` : `$${n.toFixed(1)}m`)
}

/** Three-point trend line, drawn with a CSS stroke animation. Decorative — the delta text carries the meaning. */
function Sparkline({ values, tone }: { values: number[]; tone: "positive" | "negative" }) {
  const w = 72
  const h = 28
  const min = Math.min(...values)
  const max = Math.max(...values)
  const pts = values.map((v, i) => [(i / (values.length - 1)) * (w - 4) + 2, h - 4 - ((v - min) / (max - min || 1)) * (h - 8)])
  const d = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ")
  const stroke = tone === "positive" ? "var(--brand-teal)" : "var(--sev-critical)"
  const last = pts[pts.length - 1]
  return (
    <svg aria-hidden width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
      <path
        d={d}
        fill="none"
        stroke={stroke}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={1}
        strokeDasharray={1}
        className="animate-draw"
        style={stagger(0, 450, { "--len": 1 })}
      />
      <circle cx={last[0]} cy={last[1]} r={3} fill={stroke} className="origin-center animate-pop [transform-box:fill-box]" style={stagger(0, 1300)} />
    </svg>
  )
}

function KpiTile({ kpi, index, empty }: { kpi: Kpi; index: number; empty: boolean }) {
  const t = TREND[kpi.trend]
  const Icon = t.icon
  const series = SERIES[kpi.id]
  return (
    <div className="h-full animate-fade-up" style={stagger(index, 120)}>
      <article
        aria-labelledby={`kpi-${kpi.id}`}
        className="group relative h-full overflow-hidden rounded-lg border border-border bg-card p-4 shadow-card transition-[box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:shadow-lift sm:p-5"
      >
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-[2px] origin-left scale-x-0 bg-[image:var(--gradient-brand)] transition-transform duration-500 group-hover:scale-x-100"
        />
        <h3 id={`kpi-${kpi.id}`} className="font-sans text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
          {kpi.label}
        </h3>
        <div className="mt-1 flex items-end justify-between gap-2">
          <p className="font-heading text-[28px] leading-9 font-semibold tracking-tight text-foreground tabular">
            {empty ? <span className="text-muted-foreground">—</span> : format(kpi)(kpi.value)}
          </p>
          {series && !empty && <Sparkline values={series} tone={kpi.trend === "positive" ? "positive" : "negative"} />}
        </div>
        {empty ? (
          <p className="mt-1 text-xs text-muted-foreground">Awaiting financial statements</p>
        ) : (
          <>
            <p className={cn("mt-1 flex items-center gap-1 text-xs font-medium", t.cls)}>
              <Icon aria-hidden className="size-3.5" />
              {kpi.delta}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{kpi.footnote}</p>
          </>
        )}
      </article>
    </div>
  )
}

export function FinancialSnapshot() {
  const { state } = useReview()
  const empty = state.scenario.emptyDataRoom
  return (
    <section aria-labelledby="snapshot-title">
      <h2 id="snapshot-title" className="sr-only">
        Financial snapshot
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4 xl:gap-6">
        {KPIS.map((k, i) => (
          <KpiTile key={k.id} kpi={k} index={i} empty={empty} />
        ))}
      </div>
    </section>
  )
}
