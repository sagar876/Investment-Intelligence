import { zodResolver } from "@hookform/resolvers/zod"
import { CircleAlert, Flag, X } from "lucide-react"
import { useEffect, useId } from "react"
import { Controller, useForm } from "react-hook-form"
import * as z from "zod/mini"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ASSIGNEES } from "@/data/meridian"
import { cn } from "@/lib/utils"
import { useReview } from "@/state/review-context"
import { useUi } from "@/state/ui-context"

const MIN = 10
// zod/mini: tree-shakeable functional API keeps validation out of the bundle's critical path.
const schema = z.object({
  reason: z.string().check(
    z.trim(),
    z.minLength(MIN, { error: (iss) => `Enter at least ${MIN} characters (${String(iss.input ?? "").length}/${MIN}).` }),
    z.maxLength(500, { error: "Keep the reason under 500 characters." }),
  ),
  assignee: z.optional(z.string()),
})
type FormValues = z.infer<typeof schema>

const COPY = {
  reject: {
    title: (id: string) => `Reject finding ${id}?`,
    description: "Rejected findings are excluded from the IC memo. The decision is logged and can be undone.",
    label: "Reason for rejection",
    placeholder: "Explain why this finding is not valid or not material…",
    submit: "Reject finding",
  },
  flag: {
    title: (id: string) => `Flag ${id} for follow-up`,
    description: "Use when the evidence is not yet enough to accept or reject. Flagged Critical/High findings keep IC submission locked.",
    label: "Follow-up note",
    placeholder: "What needs to be checked, and with whom?",
    submit: "Flag finding",
  },
} as const

export function DecisionDialog() {
  const { state } = useReview()
  const { decision, closeDecision, reject, flag, restoreFocus } = useUi()
  const fieldId = useId()
  const errorId = `${fieldId}-error`
  const kind = decision?.kind ?? "reject"
  const copy = COPY[kind]
  const finding = state.findings.find((f) => f.id === decision?.id)

  const { control, register, handleSubmit, reset, formState } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { reason: "", assignee: undefined },
    mode: "onSubmit",
    reValidateMode: "onChange",
    shouldFocusError: true,
  })

  useEffect(() => {
    if (decision) reset({ reason: "", assignee: undefined })
  }, [decision, reset])

  const onSubmit = (v: FormValues) => {
    if (!decision) return
    if (decision.kind === "reject") reject(decision.id, v.reason.trim())
    else flag(decision.id, v.reason.trim(), v.assignee)
    closeDecision()
  }

  const error = formState.errors.reason?.message

  return (
    <Dialog open={Boolean(decision)} onOpenChange={(o) => !o && closeDecision()}>
      <DialogContent className="sm:max-w-[520px]" onCloseAutoFocus={restoreFocus}>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
          <DialogHeader>
            <DialogTitle className="font-heading text-lg">{decision ? copy.title(decision.id) : ""}</DialogTitle>
            <DialogDescription>{copy.description}</DialogDescription>
          </DialogHeader>
          {finding && (
            <p className="rounded-md bg-background px-3 py-2 text-[13px] text-text-secondary">
              <span className="font-mono text-xs text-muted-foreground">{finding.id}</span> · {finding.title}
            </p>
          )}
          <div className="flex flex-col gap-1.5">
            <label htmlFor={fieldId} className="text-xs font-medium text-foreground">
              {copy.label} <span className="text-muted-foreground">(required)</span>
            </label>
            <Textarea
              id={fieldId}
              rows={4}
              placeholder={copy.placeholder}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? errorId : undefined}
              className={cn("resize-none border-input/80 bg-card text-sm", error && "border-sev-critical")}
              {...register("reason")}
            />
            {error && (
              <p id={errorId} role="alert" className="flex items-center gap-1.5 text-xs font-medium text-sev-critical">
                <CircleAlert aria-hidden className="size-3.5" />
                {error}
              </p>
            )}
          </div>
          {kind === "flag" && (
            <div className="flex flex-col gap-1.5">
              <span id={`${fieldId}-owner`} className="text-xs font-medium text-foreground">
                Assign follow-up to <span className="text-muted-foreground">(optional)</span>
              </span>
              <Controller
                control={control}
                name="assignee"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger aria-labelledby={`${fieldId}-owner`} className="h-9 w-full border-input/80 bg-card">
                      <SelectValue placeholder="Choose a team member" />
                    </SelectTrigger>
                    <SelectContent>
                      {ASSIGNEES.map((a) => (
                        <SelectItem key={a} value={a}>
                          {a}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeDecision}>
              Cancel
            </Button>
            {kind === "reject" ? (
              <Button type="submit" variant="destructive">
                <X aria-hidden /> {copy.submit}
              </Button>
            ) : (
              <Button type="submit">
                <Flag aria-hidden /> {copy.submit}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
