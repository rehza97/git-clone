import { Outlet, NavLink, useLocation } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { useUserProfile } from "@/hooks/useUserProfile"
import { useTranslation } from "react-i18next"
import { AppShellNav } from "@/components/layout/AppShellNav"
import { AscapLogo } from "@/components/branding/AscapLogo"

export function RootLayout() {
  const { user, loading, signOut } = useAuth()
  const profile = useUserProfile()
  const { t } = useTranslation()
  const location = useLocation()
  const showAppFooter = location.pathname !== "/"

  return (
    <div className="min-h-svh flex min-w-0 flex-col overflow-x-hidden">
      <header
        className="border-b border-border shadow-sm"
        style={{ backgroundColor: "var(--header-bg)", color: "var(--header-fg)" }}
      >
        <div className="container mx-auto flex h-14 min-w-0 items-center justify-between gap-2 px-4">
          <NavLink
            to="/"
            className="flex min-w-0 shrink items-center hover:opacity-90"
            aria-label="ASCAP home"
          >
            <AscapLogo variant="navbar" />
          </NavLink>
          <AppShellNav user={user} loading={loading} profile={profile} signOut={signOut} />
        </div>
      </header>
      <main className="min-w-0 flex-1">
        <Outlet />
      </main>
      {showAppFooter && (
        <footer
          className="mt-auto border-t border-border py-6"
          style={{ backgroundColor: "var(--header-bg)", color: "var(--header-fg)" }}
        >
          <div className="container mx-auto flex max-w-full flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:items-start">
            <div className="flex max-w-full flex-col items-center gap-3 text-center text-sm text-balance sm:flex-row sm:items-center sm:text-left">
              <AscapLogo variant="footer" className="sm:shrink-0" />
              <div>
              <span className="font-semibold">{t("footer.appName")}</span>
              <span className="ml-1 opacity-80">— {t("footer.tagline")}</span>
              <span className="mt-1 block opacity-80 sm:ml-0 sm:inline">
                Developed by{" "}
                <a
                  href="https://dataforgestack.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:opacity-100"
                >
                  dataforgestack.com
                </a>
              </span>
              </div>
            </div>
            <nav className="flex max-w-full flex-wrap justify-center gap-x-4 gap-y-1 text-sm sm:min-h-11 sm:justify-end sm:items-center">
              <NavLink
                to="/about"
                className="inline-flex min-h-11 items-center px-1 opacity-80 hover:opacity-100 touch-manipulation"
              >
                {t("nav.about")}
              </NavLink>
              <NavLink
                to="/support"
                className="inline-flex min-h-11 items-center px-1 opacity-80 hover:opacity-100 touch-manipulation"
              >
                {t("nav.support")}
              </NavLink>
              <NavLink
                to="/institutions"
                className="inline-flex min-h-11 items-center px-1 opacity-80 hover:opacity-100 touch-manipulation"
              >
                {t("nav.institutions")}
              </NavLink>
              <NavLink
                to="/training"
                className="inline-flex min-h-11 items-center px-1 opacity-80 hover:opacity-100 touch-manipulation"
              >
                {t("nav.training")}
              </NavLink>
            </nav>
          </div>
        </footer>
      )}
    </div>
  )
}
