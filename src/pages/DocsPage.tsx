import { useState } from "react"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { Code2, Search, ThumbsUp, ThumbsDown, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

const docSections = [
  {
    titleKey: "docs.gettingStarted",
    links: [
      { href: "#", labelKey: "docs.introduction" },
      { href: "#", labelKey: "docs.accountSetup" },
      { href: "#", labelKey: "docs.platformOverview" },
    ],
  },
  {
    titleKey: "docs.sourceCodeArchiving",
    links: [
      { href: "#archiving-1275", labelKey: "docs.archiving1275", active: true },
      { href: "#", labelKey: "docs.gettingStartedWithGit" },
      { href: "#", labelKey: "docs.remoteRepoUrl" },
      { href: "#", labelKey: "docs.verificationProcess" },
    ],
  },
  {
    titleKey: "docs.apiReference",
    links: [
      { href: "/api", labelKey: "docs.authentication" },
      { href: "/api", labelKey: "docs.endpoints" },
      { href: "/api", labelKey: "docs.rateLimits" },
      { href: "/api", labelKey: "docs.sdks" },
    ],
  },
  {
    titleKey: "docs.legalPrivacy",
    links: [
      { href: "#", labelKey: "docs.dataSovereignty" },
      { href: "#", labelKey: "docs.termsOfService" },
    ],
  },
]

const onThisPageLinks = [
  "docs.prerequisites",
  "docs.complianceNotice",
  "docs.step1Title",
  "docs.step2Title",
  "docs.step3Title",
]

export function DocsPage() {
  const { t } = useTranslation()
  const [search, setSearch] = useState("")

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] w-full flex-1 flex-col">
      <div className="sticky top-0 z-10 border-b border-border bg-background/95 px-4 py-4 backdrop-blur supports-backdrop-filter:bg-background/60 lg:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="flex size-8 items-center justify-center rounded bg-primary/20 text-primary">
                <Code2 className="h-5 w-5" />
              </div>
              <h1 className="text-lg font-bold tracking-tight">
                ASCAP <span className="font-normal text-muted-foreground">Docs</span>
              </h1>
            </div>
            <div className="relative hidden w-96 md:block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder={t("docs.searchPlaceholder")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-20"
              />
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
                Ctrl K
              </kbd>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/dashboard">
              <Button variant="ghost" size="sm">
                {t("nav.dashboard")}
              </Button>
            </Link>
            <Link to="/api">
              <Button variant="ghost" size="sm">
                {t("nav.api")}
              </Button>
            </Link>
            <Link to="/support">
              <Button variant="ghost" size="sm">
                {t("nav.support")}
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-7xl flex-1 items-start">
        <aside className="hidden w-64 shrink-0 overflow-y-auto border-r border-border py-8 pr-6 lg:block">
          <nav className="space-y-8">
            {docSections.map((section) => (
              <div key={section.titleKey}>
                <h5 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t(section.titleKey)}
                </h5>
                <ul className="space-y-1">
                  {section.links.map((link) => (
                    <li key={link.labelKey}>
                      {link.href.startsWith("/") ? (
                        <Link
                          to={link.href}
                          className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                            link.active
                              ? "bg-primary/10 text-primary"
                              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                          }`}
                        >
                          {t(link.labelKey)}
                        </Link>
                      ) : (
                        <a
                          href={link.href}
                          className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                            link.active
                              ? "bg-primary/10 text-primary"
                              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                          }`}
                        >
                          {t(link.labelKey)}
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </aside>

        <main className="min-w-0 flex-1 py-8 px-4 lg:px-12">
          <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/docs" className="hover:text-foreground transition-colors">
              Docs
            </Link>
            <span className="text-border">/</span>
            <Link to="/docs" className="hover:text-foreground transition-colors">
              {t("docs.sourceCodeArchiving")}
            </Link>
            <span className="text-border">/</span>
            <span className="font-medium text-foreground">{t("docs.archiving1275")}</span>
          </nav>

          <article className="prose prose-slate dark:prose-invert max-w-none">
            <div className="mb-10 border-b border-border pb-8">
              <h1 className="mb-4 text-4xl font-extrabold tracking-tight">
                {t("docs.archiving1275Title")}
              </h1>
              <p className="text-xl text-muted-foreground">{t("docs.archiving1275Desc")}</p>
              <div className="mt-6 flex flex-wrap items-center gap-4">
                <Badge variant="secondary">{t("docs.updatedAgo")}</Badge>
                <Badge variant="outline">{t("docs.minRead")}</Badge>
              </div>
            </div>

            <h2 className="mb-4 mt-8 text-2xl font-bold">{t("docs.prerequisites")}</h2>
            <p className="mb-4 text-muted-foreground">{t("docs.prerequisitesDesc")}</p>
            <ul className="mb-6 list-disc space-y-2 pl-6 text-muted-foreground">
              <li>{t("docs.prereq1")}</li>
              <li>{t("docs.prereq2")}</li>
              <li>
                {t("docs.prereq3")}{" "}
                <Link to="/explore" className="text-primary hover:underline">
                  README.md
                </Link>
              </li>
            </ul>

            <div className="my-8 rounded-r-lg border-l-4 border-amber-500 bg-amber-50 p-4 dark:bg-amber-500/10 dark:border-amber-500">
              <div className="flex gap-3">
                <div className="shrink-0 text-amber-600 dark:text-amber-400">⚠</div>
                <div>
                  <h3 className="mb-1 text-sm font-medium text-amber-800 dark:text-amber-200">
                    {t("docs.complianceNotice")}
                  </h3>
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    {t("docs.complianceNoticeDesc")}
                  </p>
                </div>
              </div>
            </div>

            <h2 className="mb-4 mt-8 text-2xl font-bold">{t("docs.step1Title")}</h2>
            <p className="mb-4 text-muted-foreground">{t("docs.step1Desc")}</p>
            <h3 className="mb-3 text-xl font-semibold">Standard .gitignore configuration</h3>
            <pre className="mb-6 overflow-x-auto rounded-lg border border-border bg-muted p-4 font-mono text-sm">
              <code>{`# Node.js
node_modules/
dist/
.env
# Python
__pycache__/
*.pyc
venv/
# IDEs
.vscode/
.idea/`}</code>
            </pre>

            <h2 className="mb-4 mt-8 text-2xl font-bold">{t("docs.step2Title")}</h2>
            <p className="mb-4 text-muted-foreground">{t("docs.step2Desc")}</p>
            <pre className="mb-6 overflow-x-auto rounded-lg border border-border bg-muted p-4 font-mono text-sm">
              <code>{`# Initialize git if you haven't already
git init
git add .
git commit -m "Initial submission for Decision 1275"
# Add ASCAP remote (replace with your unique URL)
git remote add ascap https://git.ascap.dz/username/project-slug.git
git push -u ascap main`}</code>
            </pre>

            <h2 className="mb-4 mt-8 text-2xl font-bold">{t("docs.step3Title")}</h2>
            <p className="text-muted-foreground">{t("docs.step3Desc")}</p>
          </article>

          <div className="mt-16 grid grid-cols-1 gap-4 border-t border-border pt-8 sm:grid-cols-2">
            <div className="rounded-xl border border-border p-4 transition-colors hover:border-primary/50 hover:bg-muted/50">
              <span className="text-xs font-medium text-muted-foreground">{t("docs.previous")}</span>
              <p className="mt-1 text-sm font-semibold">{t("docs.platformOverview")}</p>
            </div>
            <Link
              to="/api"
              className="rounded-xl border border-border p-4 text-right transition-colors hover:border-primary/50 hover:bg-muted/50"
            >
              <span className="text-xs font-medium text-muted-foreground">{t("docs.next")}</span>
              <p className="mt-1 text-sm font-semibold">{t("docs.gettingStartedWithGit")}</p>
            </Link>
          </div>

          <div className="mt-12 text-center">
            <p className="mb-4 text-sm text-muted-foreground">{t("docs.didThisHelp")}</p>
            <div className="flex items-center justify-center gap-2">
              <Button variant="outline" size="sm">
                <ThumbsUp className="mr-2 h-4 w-4" />
                {t("docs.yes")}
              </Button>
              <Button variant="outline" size="sm">
                <ThumbsDown className="mr-2 h-4 w-4" />
                {t("docs.no")}
              </Button>
            </div>
          </div>
        </main>

        <aside className="hidden xl:block w-64 shrink-0 overflow-y-auto border-l border-border py-8 pl-6">
          <h5 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {t("docs.onThisPage")}
          </h5>
          <ul className="space-y-3 border-l border-border text-sm">
            {onThisPageLinks.map((key, i) => (
              <li key={key}>
                <a
                  href={`#step-${i + 1}`}
                  className={`block border-l-2 pl-4 -ml-px transition-colors ${
                    i === 0 ? "border-primary font-medium text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t(key)}
                </a>
              </li>
            ))}
          </ul>
        </aside>
      </div>

      <Link
        to="/support"
        className="fixed bottom-8 right-8 z-50 flex items-center gap-2 rounded-full bg-primary px-4 py-4 text-white shadow-lg transition-all hover:gap-3 hover:shadow-xl"
      >
        <MessageCircle className="h-6 w-6" />
        <span className="font-medium">{t("docs.contactSupport")}</span>
      </Link>
    </div>
  )
}
