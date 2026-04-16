import { useState, type ReactNode } from "react"
import { NavLink, Link, useLocation } from "react-router-dom"
import {
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  UserCircle,
  UserRound,
  Users,
} from "lucide-react"
import type { User } from "firebase/auth"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { useTranslation } from "react-i18next"
import { persistLanguage } from "@/i18n"
import { AscapLogo } from "@/components/branding/AscapLogo"

type Profile = { username?: string } | null

type AppShellNavProps = {
  user: User | null
  loading: boolean
  profile: Profile
  signOut: () => void
}

function pathMatchesGroup(pathname: string, prefixes: string[]) {
  return prefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`))
}

export function AppShellNav({ user, loading, profile, signOut }: AppShellNavProps) {
  const { t } = useTranslation()
  const { pathname } = useLocation()
  const [sheetOpen, setSheetOpen] = useState(false)

  function closeSheet() {
    setSheetOpen(false)
  }

  const workspaceActive =
    Boolean(user) &&
    !loading &&
    pathMatchesGroup(pathname, ["/dashboard", "/certificates", "/notifications"])
  const helpMenuActive = pathMatchesGroup(pathname, ["/about", "/support", "/pricing"])
  const resourcesActive = pathMatchesGroup(pathname, ["/institutions", "/docs", "/api", "/training"])

  return (
    <>
      {/* Desktop: Explore + grouped menus + theme/lang/auth */}
      <nav className="hidden min-w-0 flex-1 flex-wrap items-center justify-end gap-1 md:flex">
        <NavLink to="/explore">
          {({ isActive }) => (
            <Button variant={isActive ? "secondary" : "ghost"} size="sm">
              {t("nav.explore")}
            </Button>
          )}
        </NavLink>
        {user && !loading && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant={workspaceActive ? "secondary" : "ghost"} size="sm">
                <span>{t("nav.workspace")}</span>
                <ChevronDown className="ml-1 h-3.5 w-3.5 opacity-80" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel>{t("nav.workspace")}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/dashboard">{t("nav.dashboard")}</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/certificates">{t("nav.certificates")}</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/notifications">{t("profile.notifications")}</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant={helpMenuActive ? "secondary" : "ghost"} size="sm">
              <span>{t("nav.helpAndAbout")}</span>
              <ChevronDown className="ml-1 h-3.5 w-3.5 opacity-80" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>{t("nav.helpAndAbout")}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/about">{t("nav.about")}</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/support">{t("nav.support")}</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/pricing">{t("nav.pricing")}</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant={resourcesActive ? "secondary" : "ghost"} size="sm">
              <span>{t("nav.resources")}</span>
              <ChevronDown className="ml-1 h-3.5 w-3.5 opacity-80" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel>{t("nav.resources")}</DropdownMenuLabel>
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
        <ThemeToggle />
        <LanguageSwitcher />
        {!loading &&
          (user ? (
            <>
              {profile?.username && (
                <NavLink to={`/${profile.username}`}>
                  <span className="text-sm opacity-90 hover:opacity-100">
                    @{profile.username}
                  </span>
                </NavLink>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="touch-manipulation"
                    aria-label={t("nav.account")}
                    title={t("nav.account")}
                  >
                    <UserCircle className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-[10rem]">
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" className="flex items-center gap-2">
                      <LayoutDashboard className="h-4 w-4 shrink-0 opacity-70" />
                      {t("nav.myDashboard")}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      to={profile?.username ? `/${profile.username}` : "/profile"}
                      className="flex items-center gap-2"
                    >
                      <UserRound className="h-4 w-4 shrink-0 opacity-70" />
                      {t("nav.myProfile")}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/users" className="flex items-center gap-2">
                      <Users className="h-4 w-4 shrink-0 opacity-70" />
                      {t("nav.users")}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center gap-2">
                      <Settings className="h-4 w-4 shrink-0 opacity-70" />
                      {t("nav.settings")}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => signOut()}
                    className="flex cursor-pointer items-center gap-2"
                  >
                    <LogOut className="h-4 w-4 shrink-0 opacity-70" />
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
                <Button size="sm" variant="default">
                  {t("nav.register")}
                </Button>
              </NavLink>
            </>
          ))}
      </nav>

      {/* Mobile: compact controls + sheet */}
      <div className="flex min-w-0 shrink-0 items-center gap-1 md:hidden">
        <ThemeToggle />
        <LanguageSwitcher />
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="touch-manipulation"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="flex w-[min(100vw-2rem,20rem)] flex-col gap-0 p-0 sm:max-w-sm">
            <SheetHeader className="border-b border-border px-4 py-4 text-left">
              <SheetTitle className="flex items-center gap-3">
                <AscapLogo variant="sheet" />
                <span className="sr-only">{t("footer.appName")}</span>
              </SheetTitle>
            </SheetHeader>
            <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-4 touch-manipulation">
              <MobileNavLink to="/explore" onNavigate={closeSheet}>
                {t("nav.explore")}
              </MobileNavLink>
              {user && !loading && (
                <>
                  <p className="px-3 pt-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {t("nav.workspace")}
                  </p>
                  <MobileNavLink to="/dashboard" onNavigate={closeSheet}>
                    {t("nav.dashboard")}
                  </MobileNavLink>
                  <MobileNavLink to="/certificates" onNavigate={closeSheet}>
                    {t("nav.certificates")}
                  </MobileNavLink>
                  <MobileNavLink to="/notifications" onNavigate={closeSheet}>
                    {t("profile.notifications")}
                  </MobileNavLink>
                </>
              )}
              <p className="px-3 pt-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t("nav.helpAndAbout")}
              </p>
              <MobileNavLink to="/about" onNavigate={closeSheet}>
                {t("nav.about")}
              </MobileNavLink>
              <MobileNavLink to="/support" onNavigate={closeSheet}>
                {t("nav.support")}
              </MobileNavLink>
              <MobileNavLink to="/pricing" onNavigate={closeSheet}>
                {t("nav.pricing")}
              </MobileNavLink>
              <p className="px-3 pt-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t("nav.resources")}
              </p>
              <MobileNavLink to="/institutions" onNavigate={closeSheet}>
                {t("nav.institutions")}
              </MobileNavLink>
              <MobileNavLink to="/docs" onNavigate={closeSheet}>
                {t("nav.docs")}
              </MobileNavLink>
              <MobileNavLink to="/api" onNavigate={closeSheet}>
                {t("nav.api")}
              </MobileNavLink>
              <MobileNavLink to="/training" onNavigate={closeSheet}>
                {t("nav.training")}
              </MobileNavLink>
              {!loading &&
                (user ? (
                  <>
                    {profile?.username && (
                      <MobileNavLink to={`/${profile.username}`} onNavigate={closeSheet}>
                        @{profile.username}
                      </MobileNavLink>
                    )}
                    <MobileNavLink to="/dashboard" onNavigate={closeSheet}>
                      <LayoutDashboard className="h-4 w-4 shrink-0 opacity-70" />
                      {t("nav.myDashboard")}
                    </MobileNavLink>
                    <MobileNavLink
                      to={profile?.username ? `/${profile.username}` : "/profile"}
                      onNavigate={closeSheet}
                    >
                      <UserRound className="h-4 w-4 shrink-0 opacity-70" />
                      {t("nav.myProfile")}
                    </MobileNavLink>
                    <MobileNavLink to="/users" onNavigate={closeSheet}>
                      <Users className="h-4 w-4 shrink-0 opacity-70" />
                      {t("nav.users")}
                    </MobileNavLink>
                    <MobileNavLink to="/profile" onNavigate={closeSheet}>
                      <Settings className="h-4 w-4 shrink-0 opacity-70" />
                      {t("nav.settings")}
                    </MobileNavLink>
                    <Button
                      variant="ghost"
                      className="h-11 w-full justify-start gap-2 px-3 text-base font-normal"
                      onClick={() => {
                        signOut()
                        closeSheet()
                      }}
                    >
                      <LogOut className="h-4 w-4 shrink-0 opacity-70" />
                      {t("nav.signOut")}
                    </Button>
                  </>
                ) : (
                  <>
                    <MobileNavLink to="/login" onNavigate={closeSheet}>
                      {t("nav.login")}
                    </MobileNavLink>
                    <div className="pt-2">
                      <Button asChild className="w-full" size="lg">
                        <Link to="/register" onClick={closeSheet}>
                          {t("nav.register")}
                        </Link>
                      </Button>
                    </div>
                  </>
                ))}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}

function MobileNavLink({
  to,
  children,
  onNavigate,
}: {
  to: string
  children: ReactNode
  onNavigate: () => void
}) {
  return (
    <NavLink
      to={to}
      onClick={onNavigate}
      className={({ isActive }) =>
        `flex min-h-11 items-center gap-2 rounded-md px-3 text-base transition-colors ${
          isActive
            ? "bg-secondary font-medium text-secondary-foreground"
            : "text-foreground hover:bg-accent hover:text-accent-foreground"
        }`
      }
    >
      {children}
    </NavLink>
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
        <Button variant="ghost" size="sm" className="text-muted-foreground touch-manipulation">
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
