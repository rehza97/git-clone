/**
 * Default upload exclusions (gitignore-style).
 * Keep aligned with Firebase Storage rules (node_modules, .env paths).
 */
export const DEFAULT_UPLOAD_IGNORE_PATTERNS = `
# Dependencies
node_modules/
jspm_packages/
bower_components/

# Git
.git/
.git/**

# Python
__pycache__/
*.py[cod]
*$py.class
.Python
.venv/
venv/
env/
ENV/

# JS / TS builds
dist/
build/
.next/
out/
.nuxt/
.turbo/
.parcel-cache/
.svelte-kit/
storybook-static/
coverage/
.nyc_output/

# Java / Kotlin / Android
.gradle/
**/build/
target/
*.class

# Ruby
vendor/bundle/

# Rust
**/target/

# Go
vendor/

# IDE / OS
.idea/
.vscode/
*.swp
.DS_Store
Thumbs.db

# Logs & temp
*.log
*.tmp
*.temp
.cache/

# Large / binary artifacts (source uploads)
*.exe
*.dll
*.dylib
*.so
*.o
*.a
*.zip
*.tar
*.tar.gz
*.tgz
*.rar
*.7z
*.dmg
*.iso

# Media (usually not source)
*.mp4
*.mov
*.avi
*.mkv
*.wav
*.mp3
`
