import { cn } from "@/lib/utils"

/** Brand mark served from `public/ascap-logo.png` (cache-bust when asset changes). */
const LOGO_SRC = "/ascap-logo.png?v=2"

const variantClass: Record<
  "navbar" | "footer" | "hero" | "sheet" | "landingFooter" | "watermark",
  string
> = {
  navbar: "h-9 w-auto max-h-9 max-w-[7rem] sm:max-w-[8.5rem]",
  footer: "h-11 w-auto max-w-[10rem] sm:h-12 sm:max-w-[11rem]",
  hero: "mx-auto h-24 w-auto max-w-[min(100%,11rem)] object-contain sm:h-32",
  sheet: "h-9 w-auto max-w-[7rem]",
  landingFooter: "h-12 w-auto max-w-[10rem] sm:h-14",
  watermark: "h-24 w-auto max-w-[8rem] opacity-25 sm:h-28 sm:max-w-[10rem]",
}

type AscapLogoProps = {
  variant?: keyof typeof variantClass
  className?: string
}

export function AscapLogo({ variant = "navbar", className }: AscapLogoProps) {
  /** Dark UI surfaces: keep dark artwork visible (see theme --header-bg). */
  const darkVisible =
    variant === "hero" || variant === "watermark" ? "" : "dark:invert"

  return (
    <img
      src={LOGO_SRC}
      alt="ASCAP"
      className={cn(
        "shrink-0 object-contain object-left",
        darkVisible,
        variantClass[variant],
        className
      )}
      loading="lazy"
      decoding="async"
    />
  )
}
