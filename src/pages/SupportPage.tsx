import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { Code2, Mail, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { MobileDocSidebarSheet } from "@/components/layout/MobileDocSidebarSheet"

const docNavSections = [
  { titleKey: "nav.docs", href: "/docs" },
  { titleKey: "nav.api", href: "/api" },
  { titleKey: "nav.support", href: "/support", active: true },
  { titleKey: "nav.training", href: "/training" },
]

function SupportSidebarNav() {
  const { t } = useTranslation()
  return (
    <nav className="space-y-1">
      <h5 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Help
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
        to="/training"
        className="block rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
      >
        {t("nav.training")}
      </Link>
    </nav>
  )
}

export function SupportPage() {
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
              ASCAP <span className="font-normal text-muted-foreground">Support</span>
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
          <SupportSidebarNav />
        </aside>

        <main className="min-w-0 flex-1 px-4 py-8 lg:px-12">
          <MobileDocSidebarSheet title={t("docs.sidebarSheet")}>
            <SupportSidebarNav />
          </MobileDocSidebarSheet>
          <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/docs" className="hover:text-foreground transition-colors">
              Docs
            </Link>
            <span className="text-border">/</span>
            <span className="font-medium text-foreground">{t("support.title")}</span>
          </nav>

          <div className="max-w-2xl">
            <h1 className="mb-2 text-4xl font-extrabold tracking-tight">
              {t("support.title")}
            </h1>
            <p className="mb-10 text-xl text-muted-foreground">
              {t("support.subtitle")}
            </p>

            <Card className="mb-8">
              <CardHeader>
                <h2 className="flex items-center gap-2 text-xl font-semibold">
                  <Mail className="h-5 w-5 text-primary" />
                  {t("support.contact")}
                </h2>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground text-sm">
                  {t("support.contactDesc")}
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <Button asChild>
                    <a href="mailto:support@ascap.dz">support@ascap.dz</a>
                  </Button>
                  <span className="text-sm text-muted-foreground">or use the form below</span>
                </div>
                <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
                  <Input placeholder={t("login.email")} type="email" className="max-w-md" />
                  <Input placeholder="Subject" className="max-w-md" />
                  <textarea
                    className="flex min-h-[120px] w-full max-w-md rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Your message..."
                  />
                  <Button>Send message</Button>
                </div>
              </CardContent>
            </Card>

            <div className="rounded-lg border border-border bg-muted/30 p-6">
              <h3 className="mb-2 font-semibold">FAQ & Documentation</h3>
              <p className="mb-4 text-sm text-muted-foreground">
                Browse our documentation for archiving, API usage, and compliance with Decision 1275.
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

      <Link
        to="/support"
        className="fixed bottom-4 right-4 z-50 flex max-w-[calc(100vw-2rem)] items-center gap-2 rounded-full bg-primary px-3 py-3 text-sm text-white shadow-lg transition-all hover:gap-3 hover:shadow-xl sm:bottom-8 sm:right-8 sm:px-4 sm:py-4 sm:text-base"
      >
        <MessageCircle className="h-5 w-5 shrink-0 sm:h-6 sm:w-6" />
        <span className="truncate font-medium">{t("docs.contactSupport")}</span>
      </Link>
    </div>
  )
}
