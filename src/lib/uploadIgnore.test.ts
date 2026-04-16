import { describe, expect, it } from "vitest"
import {
  extractRootGitignoreText,
  pathWithinUploadRoot,
  securityAlwaysIgnorePath,
  shouldIgnorePath,
} from "@/lib/uploadIgnore"

describe("pathWithinUploadRoot", () => {
  it("strips first folder segment", () => {
    expect(pathWithinUploadRoot("MyApp/src/index.ts")).toBe("src/index.ts")
  })
  it("returns single-segment path as-is", () => {
    expect(pathWithinUploadRoot("readme.md")).toBe("readme.md")
  })
})

describe("securityAlwaysIgnorePath", () => {
  it("blocks .env segments", () => {
    expect(securityAlwaysIgnorePath("app/.env")).toBe(true)
    expect(securityAlwaysIgnorePath("app/.env.local")).toBe(true)
  })
  it("blocks risky extensions", () => {
    expect(securityAlwaysIgnorePath("x/setup.sh")).toBe(true)
    expect(securityAlwaysIgnorePath("bin/run.bat")).toBe(true)
  })
})

describe("shouldIgnorePath", () => {
  it("ignores node_modules under project root", () => {
    expect(shouldIgnorePath("proj/node_modules/foo/index.js")).toBe(true)
  })
  it("ignores .git", () => {
    expect(shouldIgnorePath("proj/.git/HEAD")).toBe(true)
  })
  it("ignores dist output", () => {
    expect(shouldIgnorePath("proj/dist/bundle.js")).toBe(true)
  })
  it("allows normal source files", () => {
    expect(shouldIgnorePath("proj/src/main.ts")).toBe(false)
  })
  it("applies root .gitignore when provided", () => {
    const extra = "custom-build/\n"
    expect(shouldIgnorePath("proj/custom-build/out.js", extra)).toBe(true)
    expect(shouldIgnorePath("proj/src/main.ts", extra)).toBe(false)
  })
})

describe("extractRootGitignoreText", () => {
  it("reads root .gitignore from File list", async () => {
    const f = new File(["*.log\n"], ".gitignore", { type: "text/plain" })
    Object.defineProperty(f, "webkitRelativePath", {
      value: "repo/.gitignore",
      configurable: true,
    })
    const text = await extractRootGitignoreText([f])
    expect(text).toBe("*.log\n")
  })
})
