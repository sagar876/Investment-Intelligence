import { Building2, Check, ChevronDown, Clock, FlaskConical, Upload } from "lucide-react"
import logoUrl from "@/assets/aurello-mark.png"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { ANALYST, COMPANY, LAST_UPDATED, OTHER_COMPANIES } from "@/data/meridian"
import { useReview } from "@/state/review-context"
import { useUi } from "@/state/ui-context"

export function BrandLogo() {
  return (
    <span className="flex items-center gap-2.5">
      <span className="grid size-8 place-items-center rounded-md bg-brand-chip">
        <img src={logoUrl} alt="" width={22} height={17} className="h-[17px] w-[22px]" />
      </span>
      <span className="font-heading text-[17px] font-semibold tracking-tight text-white">
        Aurello <span className="text-brand-aqua">AI</span>
      </span>
    </span>
  )
}

function AssessmentStatus() {
  const { state } = useReview()
  const submitted = Boolean(state.submittedAt)
  return (
      <span
        key={submitted ? "submitted" : "review"}
        className={
          submitted
            ? "inline-flex animate-pop items-center gap-1.5 rounded-full bg-brand-aqua/15 px-2.5 py-1 text-xs font-medium whitespace-nowrap text-brand-aqua"
            : "inline-flex items-center gap-1.5 rounded-full bg-[#FDF6DD]/12 px-2.5 py-1 text-xs font-medium whitespace-nowrap text-[#F5D78A]"
        }
      >
        {submitted ? (
          <Check aria-hidden className="size-3" />
        ) : (
          <span aria-hidden className="size-1.5 rounded-full bg-[#F5D78A]" />
        )}
        <span className="sr-only">Assessment status: </span>
        {submitted ? "Submitted to IC" : "In review"}
      </span>
  )
}

function DemoMenu() {
  const { state, dispatch } = useReview()
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="text-[#A9BDD1] hover:bg-white/8 hover:text-white">
          <FlaskConical aria-hidden />
          <span className="hidden xl:inline">Demo states</span>
          <span className="sr-only xl:hidden">Demo states</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>Walkthrough scenarios</DropdownMenuLabel>
        <DropdownMenuItem onSelect={() => dispatch({ type: "replay-analysis" })}>
          Replay loading &amp; AI analysis
        </DropdownMenuItem>
        <DropdownMenuCheckboxItem
          checked={state.scenario.emptyDataRoom}
          onCheckedChange={(v) => dispatch({ type: "set-scenario", scenario: { emptyDataRoom: Boolean(v) } })}
        >
          Empty data room
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={state.scenario.chartError}
          onCheckedChange={(v) => dispatch({ type: "set-scenario", scenario: { chartError: Boolean(v) } })}
        >
          Chart data error
        </DropdownMenuCheckboxItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onSelect={() => dispatch({ type: "reset" })}>
          Reset all review decisions
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function AppHeader() {
  const { setUploadOpen } = useUi()
  return (
    <header className="on-dark sticky top-0 z-40 h-[var(--header-h)] border-b border-white/10 bg-brand-night">
      <div className="mx-auto flex h-full max-w-[1440px] items-center gap-3 px-4 sm:px-8 xl:px-16">
        <a href="#top" className="shrink-0 rounded-md" aria-label="Aurello AI — Investment Intelligence home">
          <BrandLogo />
        </a>
        <span aria-hidden className="hidden h-5 w-px bg-white/15 xl:block" />
        <span className="hidden text-sm whitespace-nowrap text-[#A9BDD1] xl:block">Investment Intelligence</span>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="ml-1 hidden max-w-[300px] border-white/15 bg-white/5 text-[#EAF2F8] hover:border-white/30 hover:bg-white/10 hover:text-white sm:inline-flex"
            >
              <span className="sr-only">Company: </span>
              <Building2 aria-hidden className="text-[#A9BDD1]" />
              <span className="font-medium">{COMPANY.name}</span>
              <span className="text-xs text-[#A9BDD1]">{COMPANY.country}</span>
              <ChevronDown aria-hidden className="text-[#A9BDD1]" />
              <span className="sr-only">, change company</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-64">
            <DropdownMenuLabel>Assessments</DropdownMenuLabel>
            <DropdownMenuItem>
              <Check aria-hidden /> {COMPANY.name} · {COMPANY.country}
            </DropdownMenuItem>
            {OTHER_COMPANIES.map((c) => (
              <DropdownMenuItem key={c.name} disabled>
                <span className="size-4" /> {c.name} · {c.country}
                <span className="ml-auto text-xs">Demo only</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="flex-1" />

        <div className="flex items-center gap-2 sm:gap-3">
          <AssessmentStatus />
          <Tooltip>
            <TooltipTrigger asChild>
              <span tabIndex={0} className="hidden items-center gap-1.5 rounded-sm text-xs text-[#A9BDD1] lg:flex">
                <Clock aria-hidden className="size-3.5" />
                <span className="hidden xl:inline">Updated {LAST_UPDATED}</span>
                <span className="xl:hidden">Updated 09:42</span>
              </span>
            </TooltipTrigger>
            <TooltipContent>Last data-room sync: {LAST_UPDATED}</TooltipContent>
          </Tooltip>
          <DemoMenu />
          <Button
            onClick={() => setUploadOpen(true)}
            className="bg-brand-aqua text-brand-night shadow-[0_0_0_1px_rgb(34_211_197/0.4),0_8px_24px_-8px_rgb(34_211_197/0.6)] hover:bg-[#5BE3D8] hover:shadow-[0_0_0_1px_rgb(34_211_197/0.6),0_10px_30px_-8px_rgb(34_211_197/0.8)]"
          >
            <Upload aria-hidden />
            <span className="hidden lg:inline">Upload documents</span>
            <span className="sr-only lg:hidden">Upload documents</span>
          </Button>
          <div className="hidden items-center gap-2.5 pl-1 sm:flex">
            <span
              aria-hidden
              className="grid size-8 place-items-center rounded-full bg-gradient-to-br from-brand-blue to-brand-teal text-xs font-semibold text-white ring-1 ring-white/20"
            >
              {ANALYST.initials}
            </span>
            <span className="hidden flex-col leading-tight 2xl:flex">
              <span className="text-sm font-medium text-white">{ANALYST.name}</span>
              <span className="text-xs text-[#A9BDD1]">{ANALYST.role}</span>
            </span>
            <span className="sr-only">Signed in as {ANALYST.name}, {ANALYST.role}</span>
          </div>
        </div>
      </div>
    </header>
  )
}
