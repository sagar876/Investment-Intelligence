import { Send } from "lucide-react"
import { useId, useState } from "react"
import { toast } from "sonner"
import { StatusBadge } from "@/components/common/badges"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { RECOMMENDATION } from "@/data/meridian"
import { nowStamp, useReview } from "@/state/review-context"
import { activeFindings, canSubmit, statusCounts } from "@/state/review-reducer"
import { useUi } from "@/state/ui-context"
import type { ReviewStatus } from "@/types/domain"

const ORDER: ReviewStatus[] = ["accepted", "rejected", "flagged", "needs-review"]

/** Final human sign-off. Requires explicit attestation — the AI never submits on the analyst's behalf. */
export function SubmitDialog() {
  const { state, dispatch } = useReview()
  const { submitOpen, setSubmitOpen, restoreFocus } = useUi()
  const [confirmed, setConfirmed] = useState(false)
  const checkId = useId()
  const counts = statusCounts(state)

  const setOpen = (open: boolean) => {
    if (!open) setConfirmed(false)
    setSubmitOpen(open)
  }

  const submit = () => {
    if (!confirmed || !canSubmit(state)) return
    dispatch({ type: "submit", at: nowStamp() })
    setOpen(false)
    toast.success("Submitted to Investment Committee", { description: "Decisions are locked and the audit trail is attached." })
  }

  return (
    <Dialog open={submitOpen} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[540px]" onCloseAutoFocus={restoreFocus}>
        <DialogHeader>
          <DialogTitle className="font-heading text-lg">Submit Meridian Technologies to IC?</DialogTitle>
          <DialogDescription>
            The IC pack will contain the recommendation, every finding with its decision, cited evidence and the audit trail.
          </DialogDescription>
        </DialogHeader>
        <div className="rounded-md border border-border bg-background p-4">
          <p className="text-xs text-muted-foreground">AI-suggested recommendation</p>
          <p className="font-heading text-lg font-semibold">{RECOMMENDATION.verdict}</p>
          <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {ORDER.map((s) => (
              <li key={s} className="flex flex-col items-start gap-1">
                <StatusBadge status={s} />
                <span className="font-heading text-xl font-semibold tabular">{counts[s]}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-muted-foreground">
            {activeFindings(state).length} findings · Medium and Low findings may remain open as noted items.
          </p>
        </div>
        <label htmlFor={checkId} className="flex cursor-pointer items-start gap-3 text-sm text-foreground">
          <input
            id={checkId}
            type="checkbox"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
            className="mt-0.5 size-4 shrink-0 cursor-pointer accent-[var(--brand-blue)]"
          />
          I have reviewed the cited evidence for every Critical and High finding and take responsibility for these decisions.
        </label>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={submit} aria-disabled={!confirmed} className={!confirmed ? "opacity-55" : ""}>
            <Send aria-hidden /> Submit to IC
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
