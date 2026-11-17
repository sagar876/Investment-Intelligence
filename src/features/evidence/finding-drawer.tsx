import { History } from "lucide-react"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DESKTOP_QUERY, useMediaQuery } from "@/hooks/use-media-query"
import { CATEGORY_LABEL } from "@/lib/labels"
import { useReview } from "@/state/review-context"
import { useUi } from "@/state/ui-context"
import { AiRationale, DecisionBar, EvidenceItem, FindingHeading } from "./evidence-parts"

/**
 * Finding details drawer. Right sheet on tablet/desktop, bottom sheet on phones.
 * Radix handles focus trap, Esc and focus restoration to the triggering control.
 */
export function FindingDrawer() {
  const { state } = useReview()
  const { drawerId, closeDrawer, restoreFocus } = useUi()
  const isPhone = !useMediaQuery("(min-width: 640px)")
  const isDesktop = useMediaQuery(DESKTOP_QUERY)
  const finding = state.findings.find((f) => f.id === drawerId)

  return (
    <Sheet open={Boolean(finding)} onOpenChange={(o) => !o && closeDrawer()}>
      <SheetContent
        side={isPhone ? "bottom" : "right"}
        onCloseAutoFocus={restoreFocus}
        className={
          isPhone
            ? "max-h-[92dvh] rounded-t-2xl border-border p-0"
            : "w-full gap-0 border-border p-0 data-[side=right]:w-full data-[side=right]:sm:max-w-[520px]"
        }
      >
        {finding && (
          <>
            <SheetHeader className="gap-3 border-b border-border px-5 pt-5 pr-12 pb-4">
              {isPhone && <span aria-hidden className="mx-auto -mt-2 mb-1 h-1 w-10 rounded-full bg-border-strong" />}
              <SheetTitle className="sr-only">{finding.title}</SheetTitle>
              <SheetDescription className="sr-only">
                {CATEGORY_LABEL[finding.category]} finding {finding.id}. Review evidence, AI rationale and audit history, then decide.
              </SheetDescription>
              <FindingHeading finding={finding} as="h2" />
              <p className="text-[13px] text-text-secondary">{finding.explanation}</p>
            </SheetHeader>
            <Tabs defaultValue="evidence" className="min-h-0 flex-1 gap-0">
              <TabsList variant="line" className="w-full justify-start gap-4 border-b border-border px-5">
                <TabsTrigger value="evidence" className="flex-none px-0">Evidence ({finding.evidence.length})</TabsTrigger>
                <TabsTrigger value="rationale" className="flex-none px-0">AI rationale</TabsTrigger>
                <TabsTrigger value="history" className="flex-none px-0">History</TabsTrigger>
              </TabsList>
              <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
                <TabsContent value="evidence" className="mt-0 flex flex-col gap-3">
                  {finding.evidence.map((e, i) => (
                    <EvidenceItem key={e.id} evidence={e} index={i} />
                  ))}
                </TabsContent>
                <TabsContent value="rationale" className="mt-0 flex flex-col gap-3">
                  <AiRationale finding={finding} />
                  <p className="text-xs text-muted-foreground">
                    Evidence strength reflects how many independent sources corroborate the claim — it is not model certainty.
                  </p>
                </TabsContent>
                <TabsContent value="history" className="mt-0">
                  <ol className="relative flex flex-col gap-4 border-l border-border pl-4">
                    {finding.history.map((h, i) => (
                      <li key={`${h.at}-${i}`} className="relative">
                        <span aria-hidden className="absolute top-1.5 -left-[21px] size-2.5 rounded-full border-2 border-card bg-ai-strong" />
                        <p className="font-mono text-[11px] text-muted-foreground">{h.at}</p>
                        <p className="text-[13px] text-foreground">{h.text}</p>
                      </li>
                    ))}
                  </ol>
                  <p className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <History aria-hidden className="size-3.5" /> Audit trail is included in the IC pack.
                  </p>
                </TabsContent>
              </div>
            </Tabs>
            <SheetFooter className="border-t border-border bg-background/80 px-5 py-4">
              <DecisionBar finding={finding} layout="drawer" />
              {!isDesktop && (
                <p className="text-xs text-muted-foreground">Reject and Flag require a written reason.</p>
              )}
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
