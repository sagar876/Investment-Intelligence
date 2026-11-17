import { createContext, use, useCallback, useMemo, useRef, useState, type ReactNode } from "react"
import { toast } from "sonner"
import { ANALYST } from "@/data/meridian"
import { DESKTOP_QUERY, useMediaQuery } from "@/hooks/use-media-query"
import { nowStamp, useReview } from "./review-context"

export type DecisionKind = "reject" | "flag"

interface UiContextValue {
  drawerId: string | null
  decision: { id: string; kind: DecisionKind } | null
  uploadOpen: boolean
  submitOpen: boolean
  isDesktop: boolean
  /** Returns focus to the control that opened an overlay (Radix only does this for its own Trigger). */
  restoreFocus: (event: Event) => void
  /** Select a finding and bring its evidence into view (panel on desktop, drawer below lg). */
  openEvidence: (id: string) => void
  openDrawer: (id: string) => void
  closeDrawer: () => void
  requestDecision: (id: string, kind: DecisionKind) => void
  closeDecision: () => void
  accept: (id: string) => void
  reject: (id: string, reason: string) => void
  flag: (id: string, note: string, assignee?: string) => void
  setUploadOpen: (open: boolean) => void
  setSubmitOpen: (open: boolean) => void
}

const UiContext = createContext<UiContextValue | null>(null)

export function UiProvider({ children }: { children: ReactNode }) {
  const { state, dispatch } = useReview()
  const isDesktop = useMediaQuery(DESKTOP_QUERY)
  const [drawerId, setDrawerId] = useState<string | null>(null)
  const [decision, setDecision] = useState<UiContextValue["decision"]>(null)
  const [uploadOpen, setUploadOpen] = useState(false)
  const [submitOpen, setSubmitOpen] = useState(false)
  const opener = useRef<HTMLElement | null>(null)
  const rememberOpener = () => {
    if (document.activeElement instanceof HTMLElement && document.activeElement !== document.body) opener.current = document.activeElement
  }
  const restoreFocus = useCallback((event: Event) => {
    const el = opener.current
    if (el && el.isConnected) {
      event.preventDefault()
      el.focus()
    }
  }, [])

  const openDrawer = useCallback(
    (id: string) => {
      rememberOpener()
      dispatch({ type: "select", id })
      setDrawerId(id)
    },
    [dispatch],
  )

  const openEvidence = useCallback(
    (id: string) => {
      dispatch({ type: "select", id })
      if (!isDesktop) {
        rememberOpener()
        setDrawerId(id)
        return
      }
      requestAnimationFrame(() => {
        const heading = document.getElementById("evidence-review-title")
        heading?.closest("section")?.scrollIntoView({ behavior: "smooth", block: "nearest" })
      })
    },
    [dispatch, isDesktop],
  )

  /** Apply a decision with an Undo toast that restores the exact prior finding. */
  const decide = useCallback(
    (id: string, status: "accepted" | "rejected" | "flagged", message: string, extra?: { reason?: string; assignee?: string }) => {
      const previous = state.findings.find((f) => f.id === id)
      if (!previous) return
      dispatch({ type: "decide", id, status, by: ANALYST.name, at: nowStamp(), ...extra })
      toast.success(message, {
        description: "Logged to the IC audit trail.",
        action: { label: "Undo", onClick: () => dispatch({ type: "restore-finding", finding: previous }) },
      })
    },
    [dispatch, state.findings],
  )

  const value = useMemo<UiContextValue>(
    () => ({
      drawerId,
      decision,
      uploadOpen,
      submitOpen,
      isDesktop,
      restoreFocus,
      openEvidence,
      openDrawer,
      closeDrawer: () => setDrawerId(null),
      requestDecision: (id, kind) => {
        rememberOpener()
        setDecision({ id, kind })
      },
      closeDecision: () => setDecision(null),
      accept: (id) => decide(id, "accepted", `${id} accepted`),
      reject: (id, reason) => decide(id, "rejected", `${id} rejected`, { reason }),
      flag: (id, note, assignee) => decide(id, "flagged", `${id} flagged for follow-up`, { reason: note, assignee }),
      setUploadOpen: (open) => {
        if (open) rememberOpener()
        setUploadOpen(open)
      },
      setSubmitOpen: (open) => {
        if (open) rememberOpener()
        setSubmitOpen(open)
      },
    }),
    [drawerId, decision, uploadOpen, submitOpen, isDesktop, restoreFocus, openEvidence, openDrawer, decide],
  )

  return <UiContext value={value}>{children}</UiContext>
}

export function useUi(): UiContextValue {
  const ctx = use(UiContext)
  if (!ctx) throw new Error("useUi must be used inside <UiProvider>")
  return ctx
}
