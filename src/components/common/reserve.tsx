import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface ReserveProps {
  /** When true, `children` (an empty or error state) is shown in the space the populated `ghost` would occupy. */
  active: boolean
  /** The populated content. Rendered invisibly (and inert) while `active`, so the card keeps its real size at every breakpoint. */
  ghost: ReactNode
  children: ReactNode
  className?: string
  overlayClassName?: string
}

/**
 * Layout-stable state swap: stacks the populated content and the alternative state in one grid cell,
 * so switching between populated, empty and error never changes the card's height. No fixed heights needed.
 */
export function Reserve({ active, ghost, children, className, overlayClassName }: ReserveProps) {
  return (
    <div className={cn("grid", className)}>
      <div className={cn("min-w-0 [grid-area:1/1]", active && "invisible")} aria-hidden={active || undefined} inert={active || undefined}>
        {ghost}
      </div>
      {active && <div className={cn("min-w-0 animate-fade-in [grid-area:1/1]", overlayClassName)}>{children}</div>}
    </div>
  )
}
