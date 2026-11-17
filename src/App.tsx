import { Toaster } from "sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { DashboardPage } from "@/features/dashboard/dashboard-page"
import { ReviewProvider } from "@/state/review-context"
import { UiProvider } from "@/state/ui-context"
import { UploadProvider } from "@/state/upload-context"
import { DESKTOP_QUERY, useMediaQuery } from "@/hooks/use-media-query"

export default function App() {
  // Toasts sit top-centre below lg so they never collide with the docked upload panel.
  const wide = useMediaQuery(DESKTOP_QUERY)
  return (
    <TooltipProvider delayDuration={250}>
          <ReviewProvider>
            <UiProvider>
              <UploadProvider>
              <DashboardPage />
              <Toaster
                position={wide ? "bottom-right" : "top-center"}
                closeButton
                toastOptions={{
                  classNames: {
                    toast: "!rounded-lg !border-border !bg-card !text-foreground !shadow-overlay !font-sans",
                    description: "!text-muted-foreground",
                    actionButton: "!bg-primary !text-primary-foreground !rounded-md !font-medium",
                  },
                }}
              />
              </UploadProvider>
            </UiProvider>
          </ReviewProvider>
    </TooltipProvider>
  )
}
