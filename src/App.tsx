import { Toaster } from "sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { DashboardPage } from "@/features/dashboard/dashboard-page"
import { ReviewProvider } from "@/state/review-context"
import { UiProvider } from "@/state/ui-context"

export default function App() {
  return (
    <TooltipProvider delayDuration={250}>
          <ReviewProvider>
            <UiProvider>
              <DashboardPage />
              <Toaster
                position="bottom-right"
                closeButton
                toastOptions={{
                  classNames: {
                    toast: "!rounded-lg !border-border !bg-card !text-foreground !shadow-overlay !font-sans",
                    description: "!text-muted-foreground",
                    actionButton: "!bg-primary !text-primary-foreground !rounded-md !font-medium",
                  },
                }}
              />
            </UiProvider>
          </ReviewProvider>
    </TooltipProvider>
  )
}
