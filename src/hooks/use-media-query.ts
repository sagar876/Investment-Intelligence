import { useSyncExternalStore } from "react"

export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query)
      mql.addEventListener("change", onChange)
      return () => mql.removeEventListener("change", onChange)
    },
    () => window.matchMedia(query).matches,
    () => false,
  )
}

/** Matches the layout breakpoint where the evidence panel sits beside the findings table. */
export const DESKTOP_QUERY = "(min-width: 1024px)"
