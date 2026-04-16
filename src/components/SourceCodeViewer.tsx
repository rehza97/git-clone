import { useEffect, useRef } from "react"
import { Prism } from "@/lib/prismSetup"
import { getLanguage, getLanguageLabel } from "@/lib/codeLanguage"
import { History, Download } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SourceCodeViewerProps {
  code: string
  filePath: string
  rawUrl?: string | null
  downloadUrl?: string | null
  /** Show Code / Raw / Download toolbar (default true) */
  showToolbar?: boolean
  /** Show line count and size in toolbar (default true) */
  showStats?: boolean
  className?: string
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function SourceCodeViewer({
  code,
  filePath,
  rawUrl,
  downloadUrl,
  showToolbar = true,
  showStats = true,
  className = "",
}: SourceCodeViewerProps) {
  const preRef = useRef<HTMLPreElement>(null)
  const lang = getLanguage(filePath)
  const langLabel = getLanguageLabel(filePath)
  const lineCount = code.split(/\n/).length
  const sizeBytes = new TextEncoder().encode(code).length
  const sizeStr = formatBytes(sizeBytes)

  useEffect(() => {
    if (!preRef.current) return
    Prism.highlightElement(preRef.current.querySelector("code")!)
  }, [code, lang])

  return (
    <div className={`flex min-h-0 flex-col overflow-hidden rounded-lg border border-border-strong bg-code-bg ${className}`}>
      {showToolbar && (
        <div
          className="sticky top-0 z-10 flex shrink-0 items-center justify-between border-b border-border-strong px-4 py-3 backdrop-blur-sm"
          style={{ backgroundColor: "rgba(22, 32, 42, 0.7)" }}
        >
          <div className="flex items-center gap-4">
            {showStats && (
              <div className="flex items-center gap-2 text-sm text-subtle-fg">
                <History className="size-5" />
                <span>{lineCount} lines</span>
                <span className="opacity-70">•</span>
                <span>{sizeStr}</span>
                <span className="opacity-70">•</span>
                <span className="font-medium text-slate-200">{langLabel}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg border border-border-strong bg-surface p-0.5">
              <span className="px-3 py-1.5 text-xs font-medium rounded-md bg-primary/20 text-primary">Code</span>
              {rawUrl && (
                <a
                  href={rawUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-md px-3 py-1.5 text-xs font-medium text-subtle-fg transition-colors hover:text-white"
                >
                  Raw
                </a>
              )}
            </div>
            {downloadUrl && (
              <Button size="sm" className="gap-2 rounded-lg bg-primary hover:bg-primary/90 text-white text-xs font-medium" asChild>
                <a href={downloadUrl} download>
                  <Download className="size-4" />
                  Download
                </a>
              </Button>
            )}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-auto font-mono text-sm leading-relaxed min-h-0">
        <pre
          ref={preRef}
          className="line-numbers !m-0 !rounded-none !bg-transparent p-0 text-left"
          style={{ backgroundColor: "var(--code-bg)" }}
          data-start="1"
        >
          <code className={`language-${lang} line-numbers !text-sm !bg-transparent`}>{code}</code>
        </pre>
      </div>
    </div>
  )
}
