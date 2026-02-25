import { useEffect, useRef } from "react"
import { Prism } from "@/lib/prismSetup"
import { getLanguage, getLanguageLabel } from "@/lib/codeLanguage"
import { History, Download } from "lucide-react"
import { Button } from "@/components/ui/button"

const CODE_VIEW_BG = "#0d1117"
const BORDER_DARK = "#233648"
const TEXT_MUTED = "#8b949e"

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
    <div className={`flex flex-col min-h-0 rounded-lg border overflow-hidden ${className}`} style={{ borderColor: BORDER_DARK, backgroundColor: CODE_VIEW_BG }}>
      {showToolbar && (
        <div
          className="flex items-center justify-between px-4 py-3 border-b shrink-0 sticky top-0 z-10 backdrop-blur-sm"
          style={{ borderColor: BORDER_DARK, backgroundColor: "rgba(22, 32, 42, 0.7)" }}
        >
          <div className="flex items-center gap-4">
            {showStats && (
              <div className="flex items-center text-sm gap-2" style={{ color: TEXT_MUTED }}>
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
            <div className="flex rounded-lg border p-0.5 bg-[#161b22]" style={{ borderColor: BORDER_DARK }}>
              <span className="px-3 py-1.5 text-xs font-medium rounded-md bg-primary/20 text-primary">Code</span>
              {rawUrl && (
                <a
                  href={rawUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 text-xs font-medium rounded-md transition-colors hover:text-white"
                  style={{ color: TEXT_MUTED }}
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
          style={{ backgroundColor: CODE_VIEW_BG }}
          data-start="1"
        >
          <code className={`language-${lang} line-numbers !text-sm !bg-transparent`}>{code}</code>
        </pre>
      </div>
    </div>
  )
}
