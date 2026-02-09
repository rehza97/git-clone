const EXT_TO_LANG: Record<string, string> = {
  ".js": "JavaScript",
  ".jsx": "JavaScript",
  ".ts": "TypeScript",
  ".tsx": "TypeScript",
  ".py": "Python",
  ".go": "Go",
  ".rs": "Rust",
  ".java": "Java",
  ".kt": "Kotlin",
  ".md": "Markdown",
  ".json": "JSON",
  ".html": "HTML",
  ".css": "CSS",
  ".scss": "SCSS",
  ".vue": "Vue",
  ".svelte": "Svelte",
}

const FILE_TO_LANG: Record<string, string> = {
  "package.json": "Node",
  "requirements.txt": "Python",
  "cargo.toml": "Rust",
  "go.mod": "Go",
  "pom.xml": "Java",
}

export function detectLanguagesFromPaths(paths: string[]): string[] {
  const set = new Set<string>()
  for (const p of paths) {
    const base = p.split("/").pop()?.toLowerCase() ?? ""
    if (FILE_TO_LANG[base]) set.add(FILE_TO_LANG[base])
    const ext = base.includes(".") ? base.slice(base.lastIndexOf(".")) : ""
    if (EXT_TO_LANG[ext]) set.add(EXT_TO_LANG[ext])
  }
  return Array.from(set)
}
