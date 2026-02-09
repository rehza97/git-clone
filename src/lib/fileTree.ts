export interface TreeNode {
  name: string
  path: string
  children: TreeNode[]
  isFile: boolean
}

export function buildFileTree(paths: string[]): TreeNode {
  const root: TreeNode = { name: "", path: "", children: [], isFile: false }

  for (const p of paths) {
    const parts = p.split("/").filter(Boolean)
    let current = root
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]
      const isFile = i === parts.length - 1
      const path = parts.slice(0, i + 1).join("/")
      let child = current.children.find((c) => c.name === part)
      if (!child) {
        child = { name: part, path, children: [], isFile }
        current.children.push(child)
      }
      current = child
    }
  }

  root.children.sort((a, b) => {
    if (a.isFile !== b.isFile) return a.isFile ? 1 : -1
    return a.name.localeCompare(b.name)
  })
  return root
}
