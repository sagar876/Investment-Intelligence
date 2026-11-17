import type { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { AiLabel } from "./badges"

interface SectionCardProps {
  id: string
  title: string
  description?: ReactNode
  ai?: boolean
  actions?: ReactNode
  children: ReactNode
  className?: string
  bodyClassName?: string
  /** Loading/analysing: real structure renders with `.sk` text as shimmer bars (no layout change). */
  pending?: boolean
}

/** Every dashboard region shares this frame: H2 title, one-line purpose, optional AI marker, actions slot. */
export function SectionCard({ id, title, description, ai, actions, children, className, bodyClassName, pending }: SectionCardProps) {
  const headingId = `${id}-title`
  return (
    <section
      id={id}
      aria-labelledby={headingId}
      aria-busy={pending || undefined}
      className={cn(
        "group/card relative flex flex-col rounded-lg border border-border bg-card shadow-card transition-shadow duration-300 hover:shadow-lift",
        className,
      )}
    >
      <header className="flex flex-wrap items-start gap-3 px-5 pt-5 sm:px-6">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 id={headingId} className="text-base font-semibold text-foreground">
              {title}
            </h2>
            {ai && <AiLabel />}
          </div>
          {description && <div className="mt-0.5 text-[13px] text-muted-foreground">{description}</div>}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </header>
      <div data-pending={pending || undefined} className={cn("flex flex-1 flex-col gap-4 px-5 pt-4 pb-5 sm:px-6 sm:pb-6", bodyClassName)}>
        {children}
      </div>
    </section>
  )
}
