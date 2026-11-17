import { Building2, Check, ChevronDown } from "lucide-react"
import { DropdownMenu as DropdownMenuPrimitive } from "radix-ui"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { COMPANY, OTHER_COMPANIES } from "@/data/meridian"
import { cn } from "@/lib/utils"

const ITEMS = [
  { value: COMPANY.name, name: COMPANY.name, country: COMPANY.country, disabled: false },
  ...OTHER_COMPANIES.map((c) => ({ value: c.name, name: c.name, country: c.country, disabled: true })),
]

/**
 * Company switcher — a non-modal popover menu.
 * - modal={false}: the page stays interactive and scrollable; nothing is dimmed. Outside click and Esc dismiss.
 * - Compact single-line rows keep the menu short so it clears the hero heading below the header.
 * - Radix supplies roving focus (↑/↓/Home/End, typeahead), focus return to the trigger and menuitemradio semantics.
 */
export function CompanySelector() {
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "group/company ml-1 hidden max-w-[300px] border-white/15 bg-white/5 text-[#EAF2F8] sm:inline-flex",
            "hover:border-white/30 hover:bg-white/10 hover:text-white",
            // Open state stays on-brand: dark surface, light text (overrides the outline variant's light fill).
            "aria-expanded:border-brand-aqua/60 aria-expanded:bg-white/10 aria-expanded:text-white",
          )}
        >
          <Building2 aria-hidden className="text-[#A9BDD1]" />
          <span className="sr-only">Company: </span>
          <span className="truncate font-medium">{COMPANY.name}</span>
          <span className="text-xs text-[#C9D6E3]">{COMPANY.country}</span>
          <ChevronDown
            aria-hidden
            className="text-[#A9BDD1] transition-transform duration-200 group-aria-expanded/company:rotate-180"
          />
          <span className="sr-only">, change company</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        sideOffset={6}
        aria-label="Switch assessment"
        className="w-72 rounded-lg border border-[#D5E2E9] bg-white p-1 text-brand-ink shadow-[0_12px_32px_-12px_rgb(7_20_42/0.35),0_2px_6px_rgb(7_20_42/0.08)] ring-0"
      >
        <DropdownMenuRadioGroup value={COMPANY.name}>
          {ITEMS.map((c) => (
            <DropdownMenuPrimitive.RadioItem
              key={c.value}
              value={c.value}
              disabled={c.disabled}
              className={cn(
                "group/item relative flex h-8 cursor-pointer items-center gap-2 rounded-md px-2.5 text-sm text-brand-ink outline-none select-none",
                // keyboard/pointer highlight vs. selected are visually distinct
                "data-highlighted:bg-[#EAF3F7]",
                "data-[state=checked]:bg-[#E9F2F6] data-[state=checked]:font-medium data-[state=checked]:shadow-[inset_2px_0_0_var(--brand-blue)]",
                "data-highlighted:data-[state=checked]:bg-[#DDEBF3]",
                "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring",
                "data-disabled:cursor-not-allowed data-disabled:text-[#5B6E86]",
              )}
            >
              <span className="min-w-0 flex-1 truncate">{c.name}</span>
              <span className="text-xs text-[#455A73]">{c.country}</span>
              {c.disabled ? (
                <span className="rounded-sm bg-[#EAF3F7] px-1.5 py-0.5 text-[10px] font-medium text-[#455A73]">Demo only</span>
              ) : (
                <DropdownMenuPrimitive.ItemIndicator className="flex">
                  <Check aria-hidden className="size-4 text-brand-blue" strokeWidth={2.5} />
                </DropdownMenuPrimitive.ItemIndicator>
              )}
            </DropdownMenuPrimitive.RadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
