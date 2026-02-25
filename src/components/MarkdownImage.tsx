import { useState } from "react"
import type { ComponentPropsWithoutRef } from "react"

/**
 * Image component for use with ReactMarkdown. Handles CORS-blocked or
 * broken external images (e.g. from GitHub) by showing a placeholder on error.
 */
export function MarkdownImage({ src, alt, ...props }: ComponentPropsWithoutRef<"img">) {
  const [failed, setFailed] = useState(false)

  if (failed) {
    return (
      <span className="inline-flex items-center py-2 px-3 rounded bg-muted/50 text-muted-foreground text-sm border border-border">
        {alt || "Image unavailable"}
      </span>
    )
  }

  return (
    <img
      src={src}
      alt={alt ?? ""}
      referrerPolicy="no-referrer"
      loading="lazy"
      onError={() => setFailed(true)}
      {...props}
    />
  )
}

/** Pass as components={{ img: MarkdownImage }} to ReactMarkdown */
export const markdownComponents = {
  img: MarkdownImage,
}
