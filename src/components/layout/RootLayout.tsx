import { Outlet, NavLink, Link, useLocation } from "react-router-dom"
import { ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"
import { useUserProfile } from "@/hooks/useUserProfile"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { useTranslation } from "react-i18next"
import { persistLanguage } from "@/i18n"

export function RootLayout() {
  const { user, loading, signOut } = useAuth()
  const profile = useUserProfile()
  const { t } = useTranslation()
  const location = useLocation()
  const isStandalone = location.pathname === "/" || location.pathname === "/login" || location.pathname === "/register" || location.pathname === "/create-project"

  if (isStandalone) {
    return <Outlet />
  }

  return (
    <div className="min-h-svh flex flex-col">
      <header
        className="border-b border-border shadow-sm"
        style={{ backgroundColor: "var(--header-bg)", color: "var(--header-fg)" }}
      >
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <NavLink to="/" className="text-lg font-semibold hover:opacity-90 shrink-0">
            ASCAP
          </NavLink>
          <nav className="flex items-center gap-1 flex-wrap justify-end">
            <NavLink to="/explore">
              {({ isActive }) => (
                <Button variant={isActive ? "secondary" : "ghost"} size="sm">
                  {t("nav.explore")}
                </Button>
              )}
            </NavLink>
            {user && !loading && (
              <>
                <NavLink to="/dashboard">
                  {({ isActive }) => (
                    <Button variant={isActive ? "secondary" : "ghost"} size="sm">
                      {t("nav.dashboard")}
                    </Button>
                  )}
                </NavLink>
                <NavLink to="/certificates">
                  {({ isActive }) => (
                    <Button variant={isActive ? "secondary" : "ghost"} size="sm">
                      {t("nav.certificates")}
                    </Button>
                  )}
                </NavLink>
                <NavLink to="/notifications">
                  {({ isActive }) => (
                    <Button variant={isActive ? "secondary" : "ghost"} size="sm">
                      {t("profile.notifications")}
                    </Button>
                  )}
                </NavLink>
              </>
            )}
            <NavLink to="/about">
              {({ isActive }) => (
                <Button variant={isActive ? "secondary" : "ghost"} size="sm">
                  {t("nav.about")}
                </Button>
              )}
            </NavLink>
            <NavLink to="/support">
              {({ isActive }) => (
                <Button variant={isActive ? "secondary" : "ghost"} size="sm">
                  {t("nav.support")}
                </Button>
              )}
            </NavLink>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <span>Resources</span>
                  <ChevronDown className="ml-1 h-3.5 w-3.5 opacity-80" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Resources</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/institutions">{t("nav.institutions")}</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/docs">{t("nav.docs")}</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/api">{t("nav.api")}</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/training">{t("nav.training")}</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <NavLink to="/pricing">
              {({ isActive }) => (
                <Button variant={isActive ? "secondary" : "ghost"} size="sm">
                  {t("nav.pricing")}
                </Button>
              )}
            </NavLink>
            <ThemeToggle />
            {/* Language switcher placeholder - wired in i18n phase */}
            <LanguageSwitcher />
            {!loading &&
              (user ? (
                <>
                  {profile?.username && (
                    <NavLink to={`/${profile.username}`}>
                      <span className="text-sm opacity-90 hover:opacity-100">@{profile.username}</span>
                    </NavLink>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        {t("nav.account")}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link to="/users">{t("nav.users")}</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/profile">{t("nav.settings")}</Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => signOut()}>
                        {t("nav.signOut")}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <>
                  <NavLink to="/login">
                    {({ isActive }) => (
                      <Button variant={isActive ? "secondary" : "ghost"} size="sm">
                        {t("nav.login")}
                      </Button>
                    )}
                  </NavLink>
                  <NavLink to="/register">
                    <Button size="sm" variant="default">{t("nav.register")}</Button>
                  </NavLink>
                </>
              ))}
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-border py-6 mt-auto" style={{ backgroundColor: "var(--header-bg)", color: "var(--header-fg)" }}>
        <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm">
            <span className="font-semibold">{t("footer.appName")}</span>
            <span className="opacity-80 ml-1">— {t("footer.tagline")}</span>
          </div>
          <nav className="flex items-center gap-4 text-sm">
            <NavLink to="/about" className="opacity-80 hover:opacity-100">{t("nav.about")}</NavLink>
            <NavLink to="/support" className="opacity-80 hover:opacity-100">{t("nav.support")}</NavLink>
            <NavLink to="/institutions" className="opacity-80 hover:opacity-100">{t("nav.institutions")}</NavLink>
            <NavLink to="/training" className="opacity-80 hover:opacity-100">{t("nav.training")}</NavLink>
          </nav>
        </div>
      </footer>
    </div>
  )
}

function LanguageSwitcher() {
  const { i18n, t } = useTranslation()
  const lang = i18n.language || "en"
  const label = lang === "ar" ? "AR" : lang === "fr" ? "FR" : "EN"
  function setLang(lng: string) {
    i18n.changeLanguage(lng)
    persistLanguage(lng)
  }
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="text-muted-foreground">
          {label}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setLang("en")}>{t("language.en")}</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLang("fr")}>{t("language.fr")}</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLang("ar")}>{t("language.ar")}</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
