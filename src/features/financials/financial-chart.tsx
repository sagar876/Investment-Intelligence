import { useMediaQuery } from "@/hooks/use-media-query"
import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis, type TooltipContentProps } from "recharts"
import type { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent"
import { FINANCIALS } from "@/data/meridian"

function YearTick({ x, y, payload }: { x?: number; y?: number; payload?: { value: string } }) {
  const row = FINANCIALS.find((f) => f.year === payload?.value)
  const last = row?.year === FINANCIALS[FINANCIALS.length - 1].year
  return (
    <g transform={`translate(${x},${y})`}>
      <text dy={14} textAnchor="middle" fontSize={12} fill="var(--text-secondary)" fontWeight={500}>
        {payload?.value}
      </text>
      <text dy={31} textAnchor="middle" fontSize={11} fill={last ? "var(--sev-critical)" : "var(--muted-foreground)"}>
        Margin {row?.margin.toFixed(1)}%
      </text>
    </g>
  )
}

function ChartTooltip({ active, payload, label }: TooltipContentProps<ValueType, NameType>) {
  if (!active || !payload?.length) return null
  const row = FINANCIALS.find((f) => f.year === label)
  return (
    <div className="rounded-md border border-border bg-card/95 px-3 py-2 text-xs shadow-overlay backdrop-blur">
      <p className="font-semibold text-foreground">{label}</p>
      {payload.map((p) => (
        <p key={String(p.dataKey)} className="mt-1 flex items-center gap-2 tabular text-text-secondary">
          <span aria-hidden className="size-2 rounded-[2px]" style={{ background: p.color }} />
          {p.name}: <span className="font-medium text-foreground">${Number(p.value).toFixed(1)}m</span>
        </p>
      ))}
      {row && <p className="mt-1 tabular text-muted-foreground">EBITDA margin {row.margin.toFixed(1)}%</p>}
    </div>
  )
}

/** Recharts implementation — lazy-loaded so the charting bundle is off the critical path. */
export default function FinancialChart() {
  // Recharts animates bars natively; switch it off when the user prefers reduced motion.
  const reduce = useMediaQuery("(prefers-reduced-motion: reduce)")
  return (
    <div className="h-[260px] w-full" role="img" aria-label="Bar chart of revenue and EBITDA, FY2022 to FY2024. Revenue 48.2, 61.5 and 74.8 million dollars; EBITDA 8.7, 12.3 and 13.5 million; margin 18.0%, 20.0% and 18.0%. Switch to Table for exact values.">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={FINANCIALS} margin={{ top: 22, right: 8, left: -12, bottom: 18 }} barGap={6} barCategoryGap="28%">
          <defs>
            <linearGradient id="grad-revenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#174a93" />
              <stop offset="100%" stopColor="var(--brand-blue)" />
            </linearGradient>
            <linearGradient id="grad-ebitda" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0f9ea9" />
              <stop offset="100%" stopColor="var(--brand-teal)" />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="var(--chart-grid)" />
          <XAxis dataKey="year" tickLine={false} axisLine={{ stroke: "var(--border-strong)" }} tick={<YearTick />} interval={0} height={44} />
          <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} domain={[0, 80]} ticks={[0, 20, 40, 60, 80]} />
          <Tooltip content={ChartTooltip} cursor={{ fill: "var(--accent)", opacity: 0.6 }} />
          <Bar name="Revenue" dataKey="revenue" fill="url(#grad-revenue)" radius={[4, 4, 0, 0]} maxBarSize={56} isAnimationActive={!reduce} animationDuration={1100} animationEasing="ease-out">
            <LabelList dataKey="revenue" position="top" offset={6} fontSize={12} fontWeight={600} fill="var(--foreground)" formatter={(v) => Number(v).toFixed(1)} />
          </Bar>
          <Bar name="EBITDA" dataKey="ebitda" fill="url(#grad-ebitda)" radius={[4, 4, 0, 0]} maxBarSize={56} isAnimationActive={!reduce} animationBegin={250} animationDuration={1100} animationEasing="ease-out">
            <LabelList dataKey="ebitda" position="top" offset={6} fontSize={12} fontWeight={600} fill="var(--foreground)" formatter={(v) => Number(v).toFixed(1)} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
