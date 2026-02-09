# Scripts

## GitHub import (`import-from-github.js`)

Imports public repos from GitHub into the app (Firestore + Storage). Creates one Firebase user per GitHub user and uploads repo files as-is (only ignores node_modules, .git, build artifacts, etc.). Optionally set `uploadOnlySourceFiles: true` to upload only source files. The script logs progress per category, per repo (e.g. `[3/30] Importing owner/repo (main)...` and `→ N files uploaded, M skipped`), and a final summary with total files and elapsed time.

### Run once (manual)

From the project root:

```bash
npm run import:github
```

### Prerequisites

1. **Config:** `scripts/import-from-github.config.json` with:
   - `githubToken` – your GitHub PAT (from https://github.com/settings/tokens)
   - **Mode A – by category (random repos):** set `"useCategorySearch": true`. The script will search GitHub for random repos in: web apps, mobile apps (React Native/Flutter), C++, C#, React, Python. Optional `repoCategories` can override the default list (e.g. `[{"name":"Web apps","query":"topic:webapp stars:>20"}]`).
   - **Random users (category mode only):** set `numberOfUsers` (e.g. `10`) to create that many Firebase users from randomly chosen repo owners and assign each repo to a random one of those users (so each user gets a random number of repos). Omit or set to `0` to keep one user per repo owner.
   - **Mode B – by usernames:** set `githubUsernames` – e.g. `["vercel", "sindresorhus"]` (do not set `useCategorySearch`).
   - `uploadOnlySourceFiles` – when `false` (default), the repo is uploaded as-is (all files except ignored folders like node_modules, .git). Set to `true` to upload only source files.
   - `maxRepoSizeKb` – max repo size in KB (GitHub’s `size` field). Repos larger than this are skipped so only small/basic apps are imported. Default `5120` (5 MB). Set to `0` for no limit.
   - `reposLimit` – e.g. `30`
   - `firebaseProjectId` and `firebaseStorageBucket` – your Firebase project
   - `firebaseServiceAccountPath` – **required**: path to your Firebase service account JSON (see below)

2. **Firebase service account (required):** The script cannot use gcloud/local credentials. You must use a service account key:
   - Firebase Console → your project → **Project settings** (gear) → **Service accounts** → **Generate new private key** → save the JSON.
   - In config set `"firebaseServiceAccountPath": "./path/to/that-file.json"` (relative to project root),  
     **or** run with:  
     `GOOGLE_APPLICATION_CREDENTIALS=/absolute/path/to/that-file.json npm run import:github`

### Run automatically (optional)

- **Cron (e.g. daily):**  
  `0 2 * * * cd /path/to/gitclone && GOOGLE_APPLICATION_CREDENTIALS=/path/to/key.json npm run import:github`

- **GitHub Actions / CI:** Add a workflow that runs `npm run import:github` with secrets `GITHUB_TOKEN` and `FIREBASE_SERVICE_ACCOUNT` (write the key to a temp file and set `GOOGLE_APPLICATION_CREDENTIALS`).

- **One-time after clone:** Run the command above once; no need to automate unless you want periodic re-imports.
