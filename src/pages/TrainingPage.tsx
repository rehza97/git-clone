import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { Code2, BookOpen, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { MobileDocSidebarSheet } from "@/components/layout/MobileDocSidebarSheet"

const docNavSections = [
  { titleKey: "nav.docs", href: "/docs" },
  { titleKey: "nav.api", href: "/api" },
  { titleKey: "nav.support", href: "/support" },
  { titleKey: "nav.training", href: "/training", active: true },
]

const topicKeys = [
  "training.topic1",
  "training.topic2",
  "training.topic3",
  "training.topic4",
] as const

function TrainingSidebarNav() {
  const { t } = useTranslation()
  return (
    <nav className="space-y-1">
      <h5 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Resources
      </h5>
      <Link
        to="/docs"
        className="block rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
      >
        {t("nav.docs")}
      </Link>
      <Link
        to="/api"
        className="block rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
      >
        {t("nav.api")}
      </Link>
      <Link
        to="/support"
        className="block rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
      >
        {t("nav.support")}
      </Link>
    </nav>
  )
}

export function TrainingPage() {
  const { t } = useTranslation()

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] w-full min-w-0 flex-1 flex-col">
      <div className="sticky top-0 z-10 border-b border-border bg-background/95 px-4 py-3 backdrop-blur supports-backdrop-filter:bg-background/60 lg:px-8">
        <div className="mx-auto flex max-w-7xl min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex size-8 shrink-0 items-center justify-center rounded bg-primary/20 text-primary">
              <Code2 className="h-5 w-5" />
            </div>
            <h1 className="truncate text-lg font-bold tracking-tight">
              ASCAP <span className="font-normal text-muted-foreground">Training</span>
            </h1>
          </div>
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            {docNavSections.map((item) => (
              <Link key={item.href} to={item.href}>
                <Button
                  variant={item.active ? "secondary" : "ghost"}
                  size="sm"
                  className="touch-manipulation"
                >
                  {t(item.titleKey)}
                </Button>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-7xl min-w-0 flex-1 items-start">
        <aside className="hidden w-64 shrink-0 overflow-y-auto border-r border-border py-8 pr-6 lg:block">
          <TrainingSidebarNav />
        </aside>

        <main className="min-w-0 flex-1 px-4 py-8 lg:px-12">
          <MobileDocSidebarSheet title={t("docs.sidebarSheet")}>
            <TrainingSidebarNav />
          </MobileDocSidebarSheet>
          <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/docs" className="hover:text-foreground transition-colors">
              Docs
            </Link>
            <span className="text-border">/</span>
            <span className="font-medium text-foreground">{t("training.title")}</span>
          </nav>

          <div className="max-w-3xl">
            <h1 className="mb-2 text-4xl font-extrabold tracking-tight">
              {t("training.title")}
            </h1>
            <p className="mb-10 text-xl text-muted-foreground">
              {t("training.subtitle")}
            </p>

            <Card className="mb-8">
              <CardHeader>
                <h2 className="flex items-center gap-2 text-xl font-semibold">
                  <BookOpen className="h-5 w-5 text-primary" />
                  {t("training.topicsTitle")}
                </h2>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {topicKeys.map((key) => (
                    <li key={key} className="flex items-start gap-3 text-muted-foreground">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                      <span>{t(key)}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="mb-8">
              <CardHeader>
                <h2 className="text-xl font-semibold">{t("training.requestTitle")}</h2>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground text-sm">
                  {t("training.requestDesc")}
                </p>
                <Button asChild>
                  <Link to="/support">{t("training.requestButton")}</Link>
                </Button>
              </CardContent>
            </Card>

            <div className="rounded-lg border border-border bg-muted/30 p-6">
              <h3 className="mb-2 font-semibold">Documentation & API</h3>
              <p className="mb-4 text-sm text-muted-foreground">
                Learn how to archive code, use the API, and comply with Decision 1275.
              </p>
              <div className="flex gap-2">
                <Button variant="outline" asChild>
                  <Link to="/docs">{t("nav.docs")}</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/api">{t("nav.api")}</Link>
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
