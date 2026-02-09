import { useEffect, useRef } from "react"
import Prism from "prismjs"
import "prismjs/themes/prism.css"
import "prismjs/components/prism-javascript"
import "prismjs/components/prism-jsx"
import "prismjs/components/prism-typescript"
import "prismjs/components/prism-tsx"
import "prismjs/components/prism-python"
import "prismjs/components/prism-json"
import "prismjs/components/prism-markdown"
import "prismjs/components/prism-markup"
import "prismjs/components/prism-css"

const EXT_TO_LANG: Record<string, string> = {
  js: "javascript",
  jsx: "jsx",
  ts: "typescript",
  tsx: "tsx",
  py: "python",
  json: "json",
  md: "markdown",
  html: "markup",
  css: "css",
}

function getLanguage(path: string): string {
  const ext = path.includes(".") ? path.slice(path.lastIndexOf(".") + 1).toLowerCase() : ""
  return EXT_TO_LANG[ext] ?? "text"
}

interface CodeBlockProps {
  code: string
  filePath: string
}

export function CodeBlock({ code, filePath }: CodeBlockProps) {
  const ref = useRef<HTMLElement>(null)
  const lang = getLanguage(filePath)

  useEffect(() => {
    if (ref.current) Prism.highlightElement(ref.current)
  }, [code, lang])

  return (
    <pre className="!m-0 overflow-auto rounded-md bg-muted/40 p-4 text-sm leading-relaxed">
      <code ref={ref} className={`language-${lang} !text-sm`}>
        {code}
      </code>
    </pre>
  )
}
