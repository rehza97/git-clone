/**
 * One-time script: import public GitHub repos into Firestore + Storage.
 * Mode A: useCategorySearch=true – fetch random repos by category (web, mobile, C++, C#, React, Python).
 * Mode B: githubUsernames – fetch repos from specific users.
 *
 * Users are created automatically: one Firebase Auth user + Firestore users/{uid} and usernames/{login}
 * per distinct repo owner. Every repo is linked to its owner via repos.ownerId.
 *
 * Run: node scripts/import-from-github.js
 */

import { createRequire } from "module"
import { readFileSync, existsSync } from "fs"
import { fileURLToPath } from "url"
import { dirname, join } from "path"
import { randomBytes } from "crypto"

const require = createRequire(import.meta.url)
const __dirname = dirname(fileURLToPath(import.meta.url))

const ADMIN = require("firebase-admin")

const GITHUB_API = "https://api.github.com"
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024 // 10 MB

const IGNORE_FOLDERS = new Set([
  "node_modules", "__pycache__", ".git", "dist", "build", ".next",
  "venv", "env", ".venv", "vendor", "target", ".idea", ".vscode", ".cache",
  "coverage", ".nyc_output", ".turbo",
])
const IGNORE_FILES = new Set([".env", ".ds_store"])
const IGNORE_FILE_PREFIXES = [".env."]
const IGNORE_FILE_SUFFIXES = [".log", ".exe", ".dll", ".dylib", ".so"]
const BLOCKED_EXTENSIONS = new Set([".exe", ".dll", ".bat", ".cmd", ".sh"])

const EXT_TO_LANG = {
  ".js": "JavaScript", ".jsx": "JavaScript", ".ts": "TypeScript", ".tsx": "TypeScript",
  ".py": "Python", ".go": "Go", ".rs": "Rust", ".java": "Java", ".kt": "Kotlin",
  ".md": "Markdown", ".json": "JSON", ".html": "HTML", ".css": "CSS", ".scss": "SCSS",
  ".vue": "Vue", ".svelte": "Svelte",
}
const FILE_TO_LANG = {
  "package.json": "Node", "requirements.txt": "Python", "cargo.toml": "Rust",
  "go.mod": "Go", "pom.xml": "Java",
}

/** When uploadOnlySourceFiles is true, only these extensions (and README) are uploaded. */
const SOURCE_FILE_EXTENSIONS = new Set([
  ".py", ".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs", ".vue", ".svelte",
  ".go", ".rs", ".cpp", ".c", ".h", ".hpp", ".cc", ".cxx", ".cs", ".java", ".kt", ".kts",
  ".rb", ".php", ".swift", ".md", ".html", ".htm", ".css", ".scss", ".sass", ".less",
])
/** Manifest filenames allowed when source-only (for language detection). */
const ALLOWED_MANIFEST_FILES = new Set([
  "package.json", "requirements.txt", "cargo.toml", "go.mod", "pom.xml",
])

/** Default repo categories for search-based import (web, mobile, C++, C#, React, Python). */
const DEFAULT_REPO_CATEGORIES = [
  { name: "Web apps", query: "topic:webapp stars:>20" },
  { name: "React Native", query: "topic:react-native stars:>20" },
  { name: "Flutter", query: "topic:flutter stars:>20" },
  { name: "C++", query: "language:C++ stars:>20" },
  { name: "C#", query: "language:C# stars:>20" },
  { name: "React", query: "topic:react stars:>20" },
  { name: "Python", query: "language:Python stars:>20" },
]

function shouldIgnorePath(path) {
  const normalized = path.replace(/\\/g, "/").toLowerCase()
  const parts = normalized.split("/")
  for (const part of parts) {
    if (IGNORE_FOLDERS.has(part)) return true
  }
  const base = parts[parts.length - 1] ?? ""
  if (IGNORE_FILES.has(base)) return true
  if (IGNORE_FILE_PREFIXES.some((p) => base.startsWith(p))) return true
  const ext = base.includes(".") ? base.slice(base.lastIndexOf(".")) : ""
  if (BLOCKED_EXTENSIONS.has(ext)) return true
  if (IGNORE_FILE_SUFFIXES.some((s) => base.endsWith(s))) return true
  return false
}

/** When uploadOnlySourceFiles is true, only source extensions, README, and manifest files pass. */
function isSourceFile(path, uploadOnlySourceFiles) {
  if (!uploadOnlySourceFiles) return true
  const normalized = path.replace(/\\/g, "/")
  const base = normalized.split("/").pop() ?? ""
  const baseLower = base.toLowerCase()
  if (baseLower === "readme" || baseLower.startsWith("readme.")) return true
  if (ALLOWED_MANIFEST_FILES.has(baseLower)) return true
  const ext = baseLower.includes(".") ? baseLower.slice(baseLower.lastIndexOf(".")) : ""
  return SOURCE_FILE_EXTENSIONS.has(ext)
}

function isFileSizeAllowed(size) {
  return size <= MAX_FILE_SIZE_BYTES
}

function detectLanguagesFromPaths(paths) {
  const set = new Set()
  for (const p of paths) {
    const base = p.split("/").pop()?.toLowerCase() ?? ""
    if (FILE_TO_LANG[base]) set.add(FILE_TO_LANG[base])
    const ext = base.includes(".") ? base.slice(base.lastIndexOf(".")) : ""
    if (EXT_TO_LANG[ext]) set.add(EXT_TO_LANG[ext])
  }
  return Array.from(set)
}

function buildStoragePath(userId, repoId, filePath) {
  const normalized = filePath.replace(/^\//, "")
  return `users/${userId}/repos/${repoId}/${normalized}`
}

function loadConfig() {
  const configPath = join(process.cwd(), "scripts", "import-from-github.config.json")
  const raw = readFileSync(configPath, "utf8")
  const config = JSON.parse(raw)
  if (!config.githubToken) {
    throw new Error("Config must have githubToken")
  }
  if (config.githubToken === "YOUR_GITHUB_PAT" || config.githubToken.length < 20) {
    throw new Error(
      "Invalid githubToken: use a real GitHub Personal Access Token (create at https://github.com/settings/tokens) and set it in scripts/import-from-github.config.json"
    )
  }
  config.useCategorySearch = config.useCategorySearch === true
  if (config.useCategorySearch) {
    config.repoCategories = Array.isArray(config.repoCategories) && config.repoCategories.length > 0
      ? config.repoCategories
      : DEFAULT_REPO_CATEGORIES
  } else {
    if (!Array.isArray(config.githubUsernames) || config.githubUsernames.length === 0) {
      throw new Error("Config must have githubUsernames (or set useCategorySearch: true for category-based import)")
    }
    const placeholders = ["user1", "user2"]
    const allPlaceholders = config.githubUsernames.every((u) => placeholders.includes(u.toLowerCase()))
    if (allPlaceholders) {
      throw new Error(
        "Replace placeholder githubUsernames with real GitHub logins (e.g. [\"vercel\", \"sindresorhus\"]) or set useCategorySearch: true in scripts/import-from-github.config.json"
      )
    }
  }
  config.reposLimit = config.reposLimit ?? 30
  config.uploadOnlySourceFiles = config.uploadOnlySourceFiles === true
  config.numberOfUsers = Math.max(0, parseInt(config.numberOfUsers, 10) || 0)
  const parsedMaxKb = parseInt(config.maxRepoSizeKb, 10)
  config.maxRepoSizeKb =
    config.maxRepoSizeKb == null || config.maxRepoSizeKb === ""
      ? 5120
      : Math.max(0, Number.isNaN(parsedMaxKb) ? 5120 : parsedMaxKb)
  const pathOpt = config.firebaseServiceAccountPath
  const isPlaceholder = !pathOpt || pathOpt.includes("path-to-service-account")
  if (pathOpt && !isPlaceholder) {
    const keyPath = join(process.cwd(), pathOpt)
    if (existsSync(keyPath)) {
      config.serviceAccount = JSON.parse(readFileSync(keyPath, "utf8"))
    }
  }
  if (!config.serviceAccount && !process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    throw new Error(
      "Firebase service account required. This script cannot use local/gcloud credentials.\n" +
        "1. Open Firebase Console → your project → Project settings (gear) → Service accounts.\n" +
        "2. Click 'Generate new private key' and save the JSON file.\n" +
        "3. In scripts/import-from-github.config.json set firebaseServiceAccountPath to that file path (e.g. \"./my-key.json\"),\n" +
        "   OR set env: GOOGLE_APPLICATION_CREDENTIALS=/absolute/path/to/that-file.json"
    )
  }
  if (!config.serviceAccount && process.env.GOOGLE_APPLICATION_CREDENTIALS && !existsSync(process.env.GOOGLE_APPLICATION_CREDENTIALS)) {
    throw new Error("GOOGLE_APPLICATION_CREDENTIALS is set but the file does not exist: " + process.env.GOOGLE_APPLICATION_CREDENTIALS)
  }
  config.firebaseProjectId = config.firebaseProjectId ?? config.serviceAccount?.project_id
  config.firebaseStorageBucket =
    config.firebaseStorageBucket ??
    (config.firebaseProjectId && config.firebaseProjectId + ".firebasestorage.app")
  return config
}

async function ghFetch(token, path, opts = {}) {
  const url = path.startsWith("http") ? path : `${GITHUB_API}${path}`
  const res = await fetch(url, {
    ...opts,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github.v3+json",
      ...opts.headers,
    },
  })
  if (!res.ok) {
    const t = await res.text()
    throw new Error(`GitHub API ${res.status}: ${t}`)
  }
  if (res.headers.get("content-type")?.includes("json")) return res.json()
  return res.text()
}

async function getGitHubUser(token, username) {
  return ghFetch(token, `/users/${encodeURIComponent(username)}`)
}

async function listUserRepos(token, username) {
  return ghFetch(token, `/users/${encodeURIComponent(username)}/repos?per_page=100&sort=updated&type=public`)
}

/** GitHub Search API: returns { total_count, items } where items are repo objects. */
async function searchRepos(token, query, perPage = 15, page = 1) {
  const q = encodeURIComponent(query)
  return ghFetch(
    token,
    `${GITHUB_API}/search/repositories?q=${q}&sort=stars&per_page=${perPage}&page=${page}`
  )
}

function shuffle(arr) {
  const out = [...arr]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

async function getRepoTree(token, owner, repo, branch) {
  const ref = await ghFetch(token, `/repos/${owner}/${repo}/git/ref/heads/${encodeURIComponent(branch)}`)
  const treeSha = ref.object?.sha
  if (!treeSha) throw new Error(`No branch ${branch} for ${owner}/${repo}`)
  const tree = await ghFetch(token, `/repos/${owner}/${repo}/git/trees/${treeSha}?recursive=1`)
  return tree.tree || []
}

async function getFileContent(token, owner, repo, path) {
  const item = await ghFetch(token, `/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}`)
  if (item.content != null) return Buffer.from(item.content, "base64")
  return Buffer.alloc(0)
}

function randomPassword() {
  return randomBytes(24).toString("base64url")
}

const RETRYABLE_NETWORK_CODES = new Set(["ETIMEDOUT", "ECONNRESET", "ENOTFOUND", "EAI_AGAIN"])
const UPLOAD_RETRIES = 3
const UPLOAD_RETRY_DELAY_MS = 3000

async function withRetry(fn, context = "") {
  let lastErr
  for (let attempt = 1; attempt <= UPLOAD_RETRIES; attempt++) {
    try {
      return await fn()
    } catch (e) {
      lastErr = e
      const code = e.code ?? e.errno ?? e.error?.code
      const isRetryable =
        RETRYABLE_NETWORK_CODES.has(code) ||
        (e.message && /timeout|ETIMEDOUT|ECONNRESET/i.test(e.message))
      if (!isRetryable || attempt === UPLOAD_RETRIES) throw e
      if (context) console.warn(`${context}: ${e.message}; retry ${attempt}/${UPLOAD_RETRIES} in ${UPLOAD_RETRY_DELAY_MS}ms`)
      await new Promise((r) => setTimeout(r, UPLOAD_RETRY_DELAY_MS))
    }
  }
  throw lastErr
}

/**
 * Ensures a Firebase user exists for this GitHub user. Creates Auth user + Firestore users/{uid}
 * and usernames/{login} if missing. Repos link to this user via ownerId.
 */
async function ensureFirebaseUser(admin, ghUser) {
  const uid = `github_${ghUser.id}`
  const email = `github-${ghUser.login}@imported.local`
  try {
    await admin.auth().getUser(uid)
    return uid
  } catch {
    // create user and profile
  }
  const password = randomPassword()
  await admin.auth().createUser({
    uid,
    email,
    password,
    displayName: ghUser.name || ghUser.login,
    emailVerified: true,
  })
  const db = admin.firestore()
  const now = admin.firestore.FieldValue.serverTimestamp()
  await db.doc(`users/${uid}`).set({
    username: ghUser.login,
    displayName: ghUser.name || ghUser.login,
    photoURL: ghUser.avatar_url || "",
    bio: ghUser.bio || "",
    createdAt: now,
    updatedAt: now,
  })
  await db.doc(`usernames/${ghUser.login.toLowerCase()}`).set({ userId: uid })
  console.log(`Created user: ${ghUser.login} (${uid})`)
  return uid
}

/** Collect repos from category search; dedupe and shuffle, cap at limit. Logs per-category counts. */
async function collectReposFromCategories(token, categories, limit) {
  const seen = new Set()
  const all = []
  const perCategory = Math.max(5, Math.ceil(limit / categories.length))
  for (const cat of categories) {
    try {
      const page = Math.floor(Math.random() * 3) + 1
      const res = await searchRepos(token, cat.query, Math.min(perCategory + 5, 30), page)
      const items = (res.items || []).filter((r) => !r.private && !seen.has(r.full_name))
      items.forEach((r) => seen.add(r.full_name))
      all.push(...items)
      console.log(`Category "${cat.name}": ${items.length} repos`)
    } catch (e) {
      console.warn(`Category "${cat.name}": ${e.message}`)
    }
  }
  return shuffle(all).slice(0, limit)
}

/** Import a single repo: tree, Firestore repo doc, files to Storage + Firestore. Returns { ok, filesUploaded, filesSkipped }. */
async function importOneRepo(db, bucket, token, repo, uid, summary, uploadOnlySourceFiles) {
  const branch = repo.default_branch || "main"
  let tree
  try {
    tree = await getRepoTree(token, repo.owner.login, repo.name, branch)
  } catch (e) {
    console.warn(`Skip repo ${repo.full_name}: ${e.message}`)
    return { ok: false, filesUploaded: 0, filesSkipped: 0 }
  }
  const blobs = tree.filter((t) => t.type === "blob" && t.path)
  const now = ADMIN.firestore.FieldValue.serverTimestamp()
  const repoRef = await db.collection("repos").add({
    name: repo.name,
    description: (repo.description || "").trim(),
    ownerId: uid, // link repo to user (user created by ensureFirebaseUser above)
    visibility: "public",
    createdAt: now,
    updatedAt: now,
  })
  const repoId = repoRef.id
  summary.repos++
  let fileCount = 0
  let filesSkipped = 0
  const pathsForLang = []
  let readmeContent = null

  for (const blob of blobs) {
    const path = blob.path
    if (shouldIgnorePath(path)) {
      filesSkipped++
      continue
    }
    if (!isSourceFile(path, uploadOnlySourceFiles)) {
      filesSkipped++
      continue
    }
    const size = blob.size ?? 0
    if (!isFileSizeAllowed(size)) {
      filesSkipped++
      continue
    }
    let content
    try {
      content = await getFileContent(token, repo.owner.login, repo.name, path)
    } catch (e) {
      console.warn(`Skip file ${repo.full_name}/${path}: ${e.message}`)
      filesSkipped++
      continue
    }
    const sizeActual = content.length
    if (!isFileSizeAllowed(sizeActual)) {
      filesSkipped++
      continue
    }
    const storagePath = buildStoragePath(uid, repoId, path)
    const file = bucket.file(storagePath)
    try {
      await withRetry(
        () => file.save(content, { contentType: "application/octet-stream" }),
        `Upload ${repo.full_name}/${path}`
      )
    } catch (e) {
      console.warn(`Skip file ${repo.full_name}/${path}: upload failed after retries (${e.message})`)
      filesSkipped++
      continue
    }
    const fileName = path.split("/").pop() || path
    await db.collection("repos").doc(repoId).collection("files").add({
      name: fileName,
      path,
      storagePath,
      size: sizeActual,
      uploadedAt: now,
    })
    fileCount++
    pathsForLang.push(path)
    const lower = path.toLowerCase()
    if (lower === "readme.md" || lower === "readme") readmeContent = content.toString("utf8")
  }

  summary.filesByRepo.push({ repo: repo.full_name, files: fileCount, skipped: filesSkipped })
  const languages = detectLanguagesFromPaths(pathsForLang)
  const update = { updatedAt: now }
  if (languages.length) update.languages = languages
  if (readmeContent) update.readme = readmeContent
  await db.collection("repos").doc(repoId).update(update)
  return { ok: true, filesUploaded: fileCount, filesSkipped }
}

async function run() {
  const config = loadConfig()
  if (!config.firebaseStorageBucket) {
    throw new Error(
      "Firebase storage bucket required. Add firebaseStorageBucket (e.g. 'your-project.firebasestorage.app') or firebaseProjectId to scripts/import-from-github.config.json"
    )
  }
  const initOptions = {
    projectId: config.firebaseProjectId,
    storageBucket: config.firebaseStorageBucket,
  }
  if (config.serviceAccount) {
    ADMIN.initializeApp({ credential: ADMIN.credential.cert(config.serviceAccount), ...initOptions })
  } else {
    ADMIN.initializeApp(initOptions)
  }
  const db = ADMIN.firestore()
  const bucket = ADMIN.storage().bucket(config.firebaseStorageBucket)
  const token = config.githubToken
  const limit = config.reposLimit
  const uploadOnlySourceFiles = config.uploadOnlySourceFiles
  const maxRepoSizeKb = config.maxRepoSizeKb
  const startMs = Date.now()
  let totalRepos = 0
  const summary = { users: 0, repos: 0, totalFilesUploaded: 0, totalFilesSkipped: 0, filesByRepo: [] }

  console.log(`Upload mode: ${uploadOnlySourceFiles ? "source files only" : "all files"}`)
  if (maxRepoSizeKb > 0) console.log(`Max repo size: ${maxRepoSizeKb} KB (repos larger will be skipped)`)

  if (config.useCategorySearch) {
    const categories = config.repoCategories
    console.log("Fetching random repos by category:", categories.map((c) => c.name).join(", "))
    const repos = await collectReposFromCategories(token, categories, limit)
    console.log(`Found ${repos.length} repos to import`)

    const useRandomUsers = config.numberOfUsers > 0
    let ownerUids = []

    if (useRandomUsers) {
      const uniqueLogins = [...new Set(repos.map((r) => r.owner?.login).filter(Boolean))]
      const shuffled = shuffle(uniqueLogins)
      const chosenLogins = shuffled.slice(0, config.numberOfUsers)
      if (chosenLogins.length === 0) throw new Error("No repo owners to create users from")
      console.log(`Creating ${chosenLogins.length} random users; repos will be assigned randomly`)
      for (const login of chosenLogins) {
        try {
          const ghUser = await getGitHubUser(token, login)
          const uid = await ensureFirebaseUser(ADMIN, ghUser)
          ownerUids.push(uid)
          summary.users++
        } catch (e) {
          console.warn(`Skip user ${login}: ${e.message}`)
        }
      }
      if (ownerUids.length === 0) throw new Error("Could not create any users")
    }

    for (let i = 0; i < repos.length; i++) {
      if (totalRepos >= limit) break
      const repo = repos[i]
      if (maxRepoSizeKb > 0 && repo.size != null && repo.size > maxRepoSizeKb) {
        console.warn(`Skip ${repo.full_name}: size ${repo.size} KB exceeds max ${maxRepoSizeKb} KB`)
        continue
      }
      const branch = repo.default_branch || "main"
      let uid
      if (useRandomUsers) {
        uid = ownerUids[Math.floor(Math.random() * ownerUids.length)]
      } else {
        let ghUser
        try {
          ghUser = await getGitHubUser(token, repo.owner.login)
        } catch (e) {
          console.warn(`Skip owner ${repo.owner?.login}: ${e.message}`)
          continue
        }
        uid = await ensureFirebaseUser(ADMIN, ghUser)
        summary.users++
      }
      console.log(`[${totalRepos + 1}/${limit}] Importing ${repo.full_name} (${branch})...`)
      const result = await importOneRepo(db, bucket, token, repo, uid, summary, uploadOnlySourceFiles)
      summary.totalFilesUploaded += result.filesUploaded
      summary.totalFilesSkipped += result.filesSkipped
      if (result.ok) {
        totalRepos++
        console.log(`  → ${result.filesUploaded} files uploaded, ${result.filesSkipped} skipped`)
      }
    }
  } else {
    const usernames = config.githubUsernames
    for (const login of usernames) {
      if (totalRepos >= limit) break
      let ghUser
      try {
        ghUser = await getGitHubUser(token, login)
      } catch (e) {
        console.warn(`Skip user ${login}: ${e.message}`)
        continue
      }
      const uid = await ensureFirebaseUser(ADMIN, ghUser)
      summary.users++
      const repos = await listUserRepos(token, login)
      const publicRepos = repos.filter((r) => !r.private)
      for (const repo of publicRepos) {
        if (totalRepos >= limit) break
        if (maxRepoSizeKb > 0 && repo.size != null && repo.size > maxRepoSizeKb) {
          console.warn(`Skip ${repo.full_name}: size ${repo.size} KB exceeds max ${maxRepoSizeKb} KB`)
          continue
        }
        const branch = repo.default_branch || "main"
        console.log(`[${totalRepos + 1}/${limit}] Importing ${repo.full_name} (${branch})...`)
        const result = await importOneRepo(db, bucket, token, repo, uid, summary, uploadOnlySourceFiles)
        summary.totalFilesUploaded += result.filesUploaded
        summary.totalFilesSkipped += result.filesSkipped
        if (result.ok) {
          totalRepos++
          console.log(`  → ${result.filesUploaded} files uploaded, ${result.filesSkipped} skipped`)
        }
      }
    }
  }

  summary.elapsedMs = Date.now() - startMs
  console.log("Import summary:", JSON.stringify(summary, null, 2))
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
