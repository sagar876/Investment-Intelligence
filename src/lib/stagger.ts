import type { CSSProperties } from "react"

/**
 * Inline custom properties consumed by the CSS motion utilities in index.css
 * (animate-fade-up, animate-fade-in, animate-grow-x, animate-pop, animate-draw).
 * `i` = stagger index (×70ms), `delay` = base delay in ms.
 */
export function stagger(i: number, delay = 0, extra?: Record<string, string | number>): CSSProperties {
  return { "--i": i, "--d": `${delay}ms`, ...extra } as CSSProperties
}
