import { Info } from "lucide-react"
import { lazy, Suspense } from "react"
import { AppHeader } from "@/features/header/app-header"
import { AiSummary } from "@/features/summary/ai-summary"
import { AmbientBackdrop, CompanyOverview } from "@/features/overview/company-overview"
import { DataRoom } from "@/features/dataroom/data-room"
import { EvidencePanel } from "@/features/evidence/evidence-panel"
import { FindingsTable } from "@/features/findings/findings-table"
import { FinancialPerformance } from "@/features/financials/financial-performance"
import { FinancialSnapshot } from "@/features/kpis/financial-snapshot"
import { RiskAssessment } from "@/features/risk/risk-assessment"
import { stagger } from "@/lib/stagger"
import { useReview } from "@/state/review-context"
import { BodySkeleton } from "./dashboard-skeleton"

// Overlays are only needed after interaction — split them (and react-hook-form/zod) out of the critical bundle.
const FindingDrawer = lazy(() => import("@/features/evidence/finding-drawer").then((m) => ({ default: m.FindingDrawer })))
const DecisionDialog = lazy(() => import("@/features/review/decision-dialog").then((m) => ({ default: m.DecisionDialog })))
const SubmitDialog = lazy(() => import("@/features/review/submit-dialog").then((m) => ({ default: m.SubmitDialog })))
const UploadDialog = lazy(() => import("@/features/upload/upload-dialog").then((m) => ({ default: m.UploadDialog })))

const container = "mx-auto w-full max-w-[1440px] px-4 sm:px-8 xl:px-16"

export function DashboardPage() {
  const { state } = useReview()
  const loading = state.phase === "loading"

  return (
    <div className="min-h-dvh">
      <a
        href="#main"
        className="sr-only z-50 rounded-md bg-card px-3 py-2 text-sm font-medium text-foreground shadow-overlay focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to main content
      </a>
      <AppHeader />

      <div id="top" className="on-dark relative isolate overflow-hidden bg-hero">
        <AmbientBackdrop />
        <aside aria-label="Demo data notice" className="relative border-b border-white/8 bg-white/[0.03]">
          <p className={`${container} flex items-center gap-2 py-2 text-xs text-[#A9BDD1]`}>
            <Info aria-hidden className="size-3.5 shrink-0 text-brand-aqua" />
            Illustrative demo — Meridian Technologies and all financials, AI summaries and findings are fictional. No real AI or client data is used.
          </p>
        </aside>
        <div className={`${container} relative pt-8 pb-24 sm:pt-10 lg:pb-28`}>
          <CompanyOverview />
        </div>
      </div>

      <main id="main" tabIndex={-1} className={`${container} relative z-10 -mt-14 pb-16 outline-none lg:-mt-16`} aria-busy={loading}>
        {loading ? (
          <div key="skeleton">
            <p className="sr-only" role="status">Loading assessment…</p>
            <BodySkeleton />
          </div>
        ) : (
          <div key="content" className="flex flex-col gap-6">
              <FinancialSnapshot />

              <div className="grid gap-6 lg:grid-cols-12">
                <div className="flex min-w-0 animate-fade-up flex-col gap-6 lg:col-span-8" style={stagger(0, 360)}>
                  <AiSummary />
                  <FinancialPerformance />
                </div>
                <div className="grid min-w-0 animate-fade-up gap-6 md:grid-cols-2 lg:col-span-4 lg:flex lg:flex-col" style={stagger(1, 360)}>
                  <RiskAssessment />
                  <DataRoom />
                </div>
              </div>

              <div className="grid animate-fade-up items-start gap-6 lg:grid-cols-12" style={stagger(2, 360)}>
                <div className="min-w-0 lg:col-span-7">
                  <FindingsTable />
                </div>
                <div className="hidden min-w-0 lg:col-span-5 lg:block">
                  <EvidencePanel />
                </div>
              </div>
          </div>
        )}
      </main>

      <footer className="border-t border-border bg-card">
        <div className={`${container} flex flex-col gap-1 py-6 text-xs text-muted-foreground sm:flex-row sm:justify-between`}>
          <p>Aurello AI · Investment Intelligence — frontend MVP for demonstration.</p>
          <p>All data is fictional. AI outputs are simulated and must be verified by a human reviewer.</p>
        </div>
      </footer>

      <Suspense fallback={null}>
        <FindingDrawer />
        <DecisionDialog />
        <SubmitDialog />
        <UploadDialog />
      </Suspense>
    </div>
  )
}
