import { useState, type ReactNode } from "react"
import { PanelLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

/**
 * Shows a trigger on viewports below `lg`; same `children` as desktop sidebar nav.
 */
export function MobileDocSidebarSheet({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  const [open, setOpen] = useState(false)

  function handleContentClick(e: React.MouseEvent<HTMLDivElement>) {
    if ((e.target as HTMLElement).closest("a")) setOpen(false)
  }

  return (
    <div className="mb-4 lg:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2 touch-manipulation">
            <PanelLeft className="size-4 shrink-0" />
            {title}
          </Button>
        </SheetTrigger>
        <SheetContent
          side="left"
          className="flex h-full w-[min(100vw-1rem,20rem)] max-w-sm flex-col gap-0 border-r p-0 sm:max-w-sm"
        >
          <SheetHeader className="border-b border-border px-4 py-3 text-left">
            <SheetTitle className="text-base font-semibold">{title}</SheetTitle>
          </SheetHeader>
          <div
            className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 touch-manipulation"
            onClick={handleContentClick}
          >
            {children}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
