import { CircleCheck, Info, Lock, Send, Sparkles } from "lucide-react"
import { Reserve } from "@/components/common/reserve"
import { Button } from "@/components/ui/button"
import { stagger } from "@/lib/stagger"
import { COMPANY, DATA_ROOM_TOTAL, RECOMMENDATION } from "@/data/meridian"
import { useReview } from "@/state/review-context"
import { activeFindings, blockingFindings, canSubmit, reviewedCount } from "@/state/review-reducer"
import { useUi } from "@/state/ui-context"

/** Slow-moving brand light behind the hero. Purely decorative; frozen for reduced motion via global CSS. */
export function AmbientBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -top-40 right-[-10%] h-[520px] w-[620px] rounded-full bg-brand-teal/30 blur-[120px] animate-drift" />
      <div className="absolute -bottom-48 left-[-8%] h-[460px] w-[560px] rounded-full bg-brand-blue/50 blur-[110px] animate-drift-slow" />
      <div className="absolute top-10 left-1/2 h-[280px] w-[360px] rounded-full bg-brand-aqua/10 blur-[100px] animate-drift" />
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(rgb(234 242 248) 1px, transparent 1px), linear-gradient(90deg, rgb(234 242 248) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage: "radial-gradient(ellipse 70% 80% at 70% 20%, black 20%, transparent 75%)",
        }}
      />
    </div>
  )
}

function ReviewGate() {
  const { state } = useReview()
  const { setSubmitOpen } = useUi()
  const total = activeFindings(state).length
  const reviewed = reviewedCount(state)
  const blocking = blockingFindings(state).length
  const ready = canSubmit(state)
  const pct = total ? Math.round((reviewed / total) * 100) : 0
  const hintId = "submit-gate-hint"

  if (state.submittedAt) {
    return (
      <div
        className="flex animate-pop items-start gap-3 rounded-md border border-brand-aqua/30 bg-brand-aqua/10 p-3 text-sm text-[#EAF2F8]"
        role="status"
      >
        <CircleCheck aria-hidden className="mt-0.5 size-4 shrink-0 text-brand-aqua" />
        <span>
          Submitted to Investment Committee · {state.submittedAt}. Decisions are locked and included in the IC pack.
        </span>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between gap-3 text-xs">
        <span className="font-medium text-[#EAF2F8]">Human review</span>
        <span className="tabular text-[#A9BDD1]" aria-live="polite">
          {reviewed} of {total} findings reviewed
        </span>
      </div>
      <div
        role="progressbar"
        aria-label="Findings reviewed"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={reviewed}
        className="h-1.5 overflow-hidden rounded-full bg-white/10"
      >
        <div
          className="h-full origin-left animate-grow-x rounded-full bg-[linear-gradient(90deg,var(--brand-sky),var(--brand-aqua))] transition-[width] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{ width: `${pct}%`, ...stagger(0, 500) }}
        />
      </div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 pt-1">
        <Button
          aria-disabled={!ready}
          aria-describedby={ready ? undefined : hintId}
          onClick={() => ready && setSubmitOpen(true)}
          className={
            ready
              ? "bg-brand-aqua text-brand-night hover:bg-[#5BE3D8] animate-pulse-ring"
              : "bg-white/10 text-[#C9D6E3] shadow-none hover:bg-white/10"
          }
        >
          {ready ? <Send aria-hidden /> : <Lock aria-hidden />}
          Submit to IC
        </Button>
        <span id={hintId} className="flex items-center gap-1.5 text-xs text-[#A9BDD1]">
          <Info aria-hidden className="size-3.5 shrink-0" />
          {ready
            ? "All Critical and High findings have a decision."
            : total === 0
              ? "Upload and analyse documents to begin review."
              : `Decide ${blocking} open Critical/High finding${blocking === 1 ? "" : "s"} to enable`}
        </span>
      </div>
    </div>
  )
}

export function CompanyOverview() {
  const { state } = useReview()
  const empty = state.scenario.emptyDataRoom
  return (
    <section aria-labelledby="company-title" className="relative">
      <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-7">
          <div className="animate-fade-up" style={stagger(0)}>
            <p className="text-[11px] font-semibold tracking-[0.12em] text-brand-aqua uppercase">
              Target company · Acquisition assessment
            </p>
          </div>
          <div className="animate-fade-up" style={stagger(1)}>
            <h1 id="company-title" className="mt-3 text-[34px] leading-[1.08] font-semibold tracking-[-0.03em] text-white sm:text-5xl">
              {COMPANY.name}
            </h1>
          </div>
          <div className="animate-fade-up" style={stagger(2)}>
            <dl className="mt-6 grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-4">
              {[
                ["Headquarters", `${COMPANY.city}, ${COMPANY.country}`],
                ["Industry", COMPANY.industry],
                ["Assessment period", COMPANY.period],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt className="text-xs text-[#A9BDD1]">{k}</dt>
                  <dd className="mt-0.5 text-sm font-medium text-[#EAF2F8]">{v}</dd>
                </div>
              ))}
              <div>
                <dt className="text-xs text-[#A9BDD1]">Data room</dt>
                <dd className="mt-0.5 text-sm font-medium text-[#EAF2F8]">
                  <Reserve active={empty} ghost={`${DATA_ROOM_TOTAL} documents · analysed`}>
                    No documents yet
                  </Reserve>
                </dd>
              </div>
            </dl>
          </div>
          <div className="animate-fade-up" style={stagger(3)}>
            <p className="mt-5 max-w-[62ch] text-sm leading-relaxed text-[#A9BDD1]">{COMPANY.description}</p>
            <ul className="mt-4 flex flex-wrap gap-2" aria-label="Deal terms">
              {COMPANY.tags.map((t) => (
                <li key={t} className="rounded-sm border border-white/10 bg-white/5 px-2 py-1 text-xs text-[#C9D6E3]">
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="animate-fade-up lg:col-span-5" style={stagger(2, 80)}>
          <div className="relative overflow-hidden rounded-xl border border-white/12 bg-white/[0.06] p-5 shadow-[0_30px_80px_-30px_rgb(0_0_0/0.6)] backdrop-blur-md sm:p-6">
            <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,var(--brand-aqua),transparent)] opacity-70" />
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-[11px] font-semibold tracking-[0.12em] text-[#A9BDD1] uppercase">Investment recommendation</h2>
              <span className="inline-flex items-center gap-1 rounded-sm border border-brand-aqua/30 bg-brand-aqua/12 px-2 py-0.5 text-xs font-medium text-brand-aqua">
                <Sparkles aria-hidden className="size-3" /> AI-suggested · Demo data
              </span>
            </div>
            {/* Same structure in every state: shimmer bars while loading, empty copy laid over the populated size. */}
            <div data-pending={state.phase !== "ready" || undefined} aria-busy={state.phase !== "ready" || undefined}>
              <Reserve
                active={empty}
                ghost={
                  <>
                    <p className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <span className="sk font-heading text-2xl font-semibold tracking-tight text-white">{RECOMMENDATION.verdict}</span>
                      <span className="sk text-sm text-[#A9BDD1]">Confidence: {RECOMMENDATION.confidence}</span>
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-[#C9D6E3]">
                      <span className="sk">{RECOMMENDATION.rationale}</span>
                    </p>
                  </>
                }
              >
                <p className="mt-3 font-heading text-2xl font-semibold tracking-tight text-white">Awaiting documents</p>
                <p className="mt-2 text-sm leading-relaxed text-[#C9D6E3]">
                  Upload the data room to generate an AI-suggested recommendation for human review.
                </p>
              </Reserve>
            </div>
            <div className="mt-5 border-t border-white/10 pt-4">
              <ReviewGate />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
