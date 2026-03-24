import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import {
  Code2,
  Archive,
  Search,
  Shield,
  Server,
  GraduationCap,
  Network,
  ThumbsUp,
  Share2,
  Mail,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { persistLanguage } from "@/i18n"

const LANDING_BG = "#0f172a"
const LANDING_SURFACE = "#1e293b"
const LANDING_SURFACE_HL = "#334155"
const LANDING_PRIMARY = "#10b981"

const AVATARS = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAd4eBdpky71-5KIqBLN5YdE-EATFaLopXIbDY1O7cA-XESIGDxx18Njt-Oz8DOWAPBqDbgPCe9u53DsfnIMe0mxWyRYREGFZfNUVC9UyNwby0sO0RzbrnEjizjqUNI4Oq8C3qwseLZzjtRV75sLnnd4fz4cj8W-5VYxdkCQN8fvaposvLYnBk0Jh6BJDgh6FCIWWkXWhAfFpNKdPzAEqhh7ciy_J85hynokMHbKh7T3vsDld44aJyDmkfUGUoz8gzr69urUaFBjQ",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAfVFb03yyk6SJUhrs-4EmkHoa5pmzGYpUMgrJ0wGQhsOOOFAqSMLdAAZhEz0MijZvn67QyZv0DcHVXDypswFvDUOEfJ65ZHuG2Eksen3TIWC8zO-wkEQCDbeScu6DsReOdwi6sEFYEXB7g4bEWHcroF81aM6IX087wOmF4YQ8zvkZSGqWjsxJVD2bMT-NJQnCEBeu9OTZJTMPKlpLTmKuSBb4PX9-N1eu6RMNQ7Zzu_dttMQ_gOUXWxI2cL7tPbA5rXapxnTSuZg",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBk1OnJxBNXSzHEyyAKNfF7XPwDuNH6l4CEqqxP3VTeqZ3OdzLKMQS9g5H5Df0X0Zyiy2OfKhea-o1AxEwmqA04gOBYCx8sBsq-Nz-zuDm3IY55zx8waG2t5sXdNV4q4kOneDPAzKmULsPibyyZtHz2HgO45mc2pXEeR7gZa7OlLvIkILBaA8qriY15FkX_OXDlTMMyrGqIEB6jdwizRodrj44XbQanbUNWns31bEQzSUgRaAVPMFnDUsWcRcK6fX8Rv30dplu45A",
]

export function LandingPage() {
  const { t } = useTranslation()

  return (
    <div
      className="relative flex min-h-screen w-full flex-col overflow-x-hidden text-slate-100 antialiased selection:bg-[#10b981] selection:text-white"
      style={{ backgroundColor: LANDING_BG }}
    >
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#0f172a]/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2">
            <div
              className="flex size-8 items-center justify-center rounded text-white"
              style={{ backgroundColor: LANDING_PRIMARY }}
            >
              <Code2 className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              ASCAP
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <Link
              to="/explore"
              className="text-sm font-medium text-slate-300 transition-colors hover:text-[#10b981]"
            >
              {t("landing.explore")}
            </Link>
            <Link
              to="/docs"
              className="text-sm font-medium text-slate-300 transition-colors hover:text-[#10b981]"
            >
              {t("nav.docs")}
            </Link>
            <Link
              to="/about"
              className="text-sm font-medium text-slate-300 transition-colors hover:text-[#10b981]"
            >
              {t("landing.navAboutUs")}
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="hidden sm:flex h-9 items-center justify-center rounded-lg px-4 text-sm font-medium text-slate-300 transition-colors hover:bg-[#1e293b]"
            >
              {t("landing.login")}
            </Link>
            <Link
              to="/register"
              className="flex h-9 items-center justify-center rounded-lg px-4 text-sm font-medium text-white shadow-lg transition-colors hover:opacity-90"
              style={{
                backgroundColor: LANDING_PRIMARY,
                boxShadow: "0 10px 15px -3px rgba(16, 185, 129, 0.2)",
              }}
            >
              {t("landing.register")}
            </Link>
            <ThemeToggle className="text-slate-300 hover:bg-[#1e293b] hover:text-white" />
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden pt-16 pb-20 lg:pt-24 lg:pb-28">
          <div className="absolute left-1/2 top-0 h-full w-full max-w-7xl -translate-x-1/2 pointer-events-none">
            <div className="absolute right-0 top-20 h-[500px] w-[500px] rounded-full bg-[#10b981]/10 blur-[100px]" />
            <div className="absolute bottom-0 left-0 h-[300px] w-[300px] rounded-full bg-blue-500/10 blur-[80px]" />
          </div>
          <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div className="flex flex-col gap-6 text-center lg:text-left">
                <div
                  className="inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium mx-auto lg:mx-0"
                  style={{
                    borderColor: `${LANDING_PRIMARY}4D`,
                    backgroundColor: `${LANDING_PRIMARY}1A`,
                    color: LANDING_PRIMARY,
                  }}
                >
                  <span className="relative flex h-2 w-2">
                    <span
                      className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
                      style={{ backgroundColor: LANDING_PRIMARY }}
                    />
                    <span
                      className="relative inline-flex h-2 w-2 rounded-full"
                      style={{ backgroundColor: LANDING_PRIMARY }}
                    />
                  </span>
                  {t("landing.badge1275")}
                </div>
                <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
                  {t("landing.heroTitle")} <br />
                  <span
                    className="bg-gradient-to-r from-[#10b981] to-blue-500 bg-clip-text text-transparent"
                  >
                    {t("landing.heroTitleHighlight")}
                  </span>
                </h1>
                <p className="mx-auto max-w-2xl text-lg text-slate-400 lg:mx-0">
                  {t("landing.heroSubtitle")}
                </p>
                <div className="flex flex-col justify-center gap-4 pt-4 sm:flex-row lg:justify-start">
                  <Link to="/register">
                    <Button
                      className="h-12 gap-2 rounded-lg px-8 font-bold text-white shadow-lg transition-all hover:opacity-90"
                      style={{
                        backgroundColor: LANDING_PRIMARY,
                        boxShadow: "0 10px 15px -3px rgba(16, 185, 129, 0.25)",
                      }}
                    >
                      <Archive className="h-5 w-5" />
                      {t("landing.startArchiving")}
                    </Button>
                  </Link>
                  <Link to="/explore">
                    <Button
                      variant="outline"
                      className="h-12 gap-2 rounded-lg border-[#334155] bg-[#1e293b]/50 px-8 font-bold text-white backdrop-blur-sm transition-all hover:bg-[#1e293b]"
                    >
                      <Search className="h-5 w-5" />
                      {t("landing.exploreRepos")}
                    </Button>
                  </Link>
                </div>
                <div className="flex items-center justify-center gap-4 pt-8 text-sm text-slate-500 lg:justify-start">
                  <div className="flex -space-x-2">
                    {AVATARS.map((src, i) => (
                      <div
                        key={i}
                        className="h-8 w-8 overflow-hidden rounded-full border-2 border-[#0f172a] bg-slate-700"
                      >
                        <img src={src} alt="" className="h-full w-full object-cover" />
                      </div>
                    ))}
                  </div>
                  <p>
                    {t("landing.trustedBy")}{" "}
                    <span className="font-semibold text-white">
                      {t("landing.trustedByCount")}
                    </span>{" "}
                    {t("landing.trustedBySuffix")}
                  </p>
                </div>
              </div>
              {/* Code mockup */}
              <div className="relative">
                <div
                  className="absolute -inset-1 rounded-2xl opacity-20 blur"
                  style={{
                    background: "linear-gradient(to right, #10b981, #2563eb)",
                  }}
                />
                <div
                  className="relative overflow-hidden rounded-2xl border shadow-2xl"
                  style={{
                    backgroundColor: LANDING_SURFACE,
                    borderColor: LANDING_SURFACE_HL,
                  }}
                >
                  <div
                    className="flex items-center gap-2 border-b px-4 py-3"
                    style={{ borderColor: LANDING_SURFACE_HL, backgroundColor: LANDING_BG }}
                  >
                    <div className="flex gap-1.5">
                      <div className="h-3 w-3 rounded-full bg-red-500" />
                      <div className="h-3 w-3 rounded-full bg-yellow-500" />
                      <div className="h-3 w-3 rounded-full bg-green-500" />
                    </div>
                    <div className="mx-auto font-mono text-xs text-slate-500">
                      main.py — ASCAP
                    </div>
                  </div>
                  <div className="relative overflow-hidden p-6 font-mono text-sm" style={{ backgroundColor: LANDING_BG }}>
                    <div className="absolute right-0 top-0 p-6 opacity-20">
                      <Code2 className="h-24 w-24 text-[#10b981]" />
                    </div>
                    <div className="relative space-y-2 text-slate-300">
                      <p><span className="text-purple-400">import</span> ascap_core</p>
                      <p><span className="text-purple-400">from</span> sovereignty <span className="text-purple-400">import</span> LocalStorage</p>
                      <br />
                      <p><span className="text-slate-500"># Initialize National Archive Node</span></p>
                      <p><span className="text-blue-400">class</span> <span className="text-yellow-300">AlgerianRepository</span>:</p>
                      <p className="pl-4">def <span className="text-blue-400">__init__</span>(self):</p>
                      <p className="pl-8">self.location = <span className="text-green-400">&quot;Algiers/DataCenter_01&quot;</span></p>
                      <p className="pl-8">self.security = <span className="text-green-400">&quot;High&quot;</span></p>
                      <p className="pl-8">self.compliance = <span className="text-orange-400">Decision.1275</span></p>
                      <br />
                      <p className="pl-4">def <span className="text-blue-400">archive_project</span>(self, code):</p>
                      <p className="pl-8"><span className="text-purple-400">return</span> ascap_core.secure(code)</p>
                    </div>
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-[#10b981]/5 to-transparent animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section
          className="border-y py-12"
          style={{ borderColor: LANDING_SURFACE_HL, backgroundColor: `${LANDING_SURFACE}4D` }}
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <dl className="grid grid-cols-2 gap-8 md:grid-cols-4">
              <div className="flex flex-col gap-1">
                <dt className="text-sm font-medium text-slate-400">{t("landing.statRepos")}</dt>
                <dd className="text-3xl font-bold tracking-tight text-white">{t("landing.statReposCount")}</dd>
              </div>
              <div className="flex flex-col gap-1">
                <dt className="text-sm font-medium text-slate-400">{t("landing.statPartners")}</dt>
                <dd className="text-3xl font-bold tracking-tight text-white">{t("landing.statPartnersCount")}</dd>
              </div>
              <div className="flex flex-col gap-1">
                <dt className="text-sm font-medium text-slate-400">{t("landing.statDevelopers")}</dt>
                <dd className="text-3xl font-bold tracking-tight text-white">{t("landing.statDevelopersCount")}</dd>
              </div>
              <div className="flex flex-col gap-1">
                <dt className="text-sm font-medium text-slate-400">{t("landing.statLoc")}</dt>
                <dd className="text-3xl font-bold tracking-tight text-white">{t("landing.statLocCount")}</dd>
              </div>
            </dl>
          </div>
        </section>

        {/* Why ASCAP */}
        <section className="relative py-20" style={{ backgroundColor: LANDING_BG }}>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-16 flex flex-col items-start gap-12 md:flex-row md:items-end md:gap-8 md:justify-between">
              <div className="max-w-2xl">
                <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-[#10b981]">
                  {t("landing.whyAscap")}
                </h2>
                <h3 className="text-3xl font-bold text-white sm:text-4xl">
                  {t("landing.whyAscapTitle")}
                </h3>
              </div>
              <p className="max-w-md text-lg text-slate-400">
                {t("landing.whyAscapSubtitle")}
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {[
                {
                  icon: Shield,
                  titleKey: "landing.featureSovereignty",
                  descKey: "landing.featureSovereigntyDesc",
                },
                {
                  icon: Server,
                  titleKey: "landing.featureLocalInfra",
                  descKey: "landing.featureLocalInfraDesc",
                },
                {
                  icon: GraduationCap,
                  titleKey: "landing.featureAcademic",
                  descKey: "landing.featureAcademicDesc",
                },
              ].map(({ icon: Icon, titleKey, descKey }) => (
                <div
                  key={titleKey}
                  className="group relative rounded-2xl border p-8 transition-all hover:border-[#10b981]/50 hover:shadow-lg hover:shadow-[#10b981]/10"
                  style={{
                    borderColor: LANDING_SURFACE_HL,
                    backgroundColor: LANDING_SURFACE,
                  }}
                >
                  <div
                    className="mb-6 inline-flex size-12 items-center justify-center rounded-lg text-[#10b981] transition-colors group-hover:bg-[#10b981] group-hover:text-white"
                    style={{ backgroundColor: `${LANDING_PRIMARY}1A` }}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <h4 className="mb-3 text-xl font-bold text-white">
                    {t(titleKey)}
                  </h4>
                  <p className="leading-relaxed text-slate-400">
                    {t(descKey)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Network section */}
        <section
          className="border-t py-20"
          style={{ borderColor: LANDING_SURFACE_HL, backgroundColor: `${LANDING_SURFACE}33` }}
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div
              className="relative h-[400px] overflow-hidden rounded-3xl border"
              style={{ borderColor: LANDING_SURFACE_HL, backgroundColor: LANDING_SURFACE }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-[#1e293b] via-transparent to-transparent" />
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 text-center">
                <Network
                  className="mb-4 h-12 w-12 animate-pulse text-[#10b981]"
                />
                <h3 className="mb-2 text-2xl font-bold text-white md:text-3xl">
                  {t("landing.networkTitle")}
                </h3>
                <p className="max-w-lg text-slate-300">
                  {t("landing.networkSubtitle")}
                </p>
              </div>
              <div
                className="absolute top-1/3 left-1/3 h-3 w-3 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.8)]"
                style={{ backgroundColor: LANDING_PRIMARY }}
              />
              <div
                className="absolute top-1/4 left-1/2 h-3 w-3 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.8)]"
                style={{ backgroundColor: LANDING_PRIMARY }}
              />
              <div
                className="absolute top-1/2 right-1/3 h-3 w-3 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.8)]"
                style={{ backgroundColor: LANDING_PRIMARY }}
              />
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="relative overflow-hidden py-24" style={{ backgroundColor: `${LANDING_PRIMARY}0D` }}>
          <div className="relative z-10 mx-auto max-w-3xl px-4 text-center">
            <h2 className="mb-6 text-3xl font-black text-white sm:text-4xl lg:text-5xl">
              {t("landing.ctaTitle")} <br />
              {t("landing.ctaTitleLine2")}
            </h2>
            <p className="mb-10 text-lg text-slate-400">
              {t("landing.ctaSubtitle")}
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Link to="/register">
                <Button
                  className="h-14 rounded-xl px-8 text-lg font-bold text-white shadow-xl transition-all hover:opacity-90"
                  style={{
                    backgroundColor: LANDING_PRIMARY,
                    boxShadow: "0 20px 25px -5px rgba(16, 185, 129, 0.2)",
                  }}
                >
                  {t("landing.createFreeAccount")}
                </Button>
              </Link>
              <Link to="/institutions">
                <Button
                  variant="outline"
                  className="h-14 rounded-xl border px-8 text-lg font-bold text-white transition-all hover:bg-[#334155]"
                  style={{
                    borderColor: LANDING_SURFACE_HL,
                    backgroundColor: LANDING_SURFACE,
                  }}
                >
                  {t("landing.contactSales")}
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer
        className="border-t pt-16 pb-8"
        style={{ borderColor: LANDING_SURFACE_HL, backgroundColor: LANDING_BG }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
            <div className="col-span-2 lg:col-span-2">
              <div className="mb-4 flex items-center gap-2">
                <div
                  className="flex size-6 items-center justify-center rounded text-white"
                  style={{ backgroundColor: LANDING_PRIMARY }}
                >
                  <Code2 className="h-3 w-3" />
                </div>
                <span className="text-lg font-bold text-white">ASCAP</span>
              </div>
              <p className="mb-6 max-w-xs text-sm text-slate-400">
                {t("landing.footerTagline")}
              </p>
              <div className="flex gap-4">
                <a href="#" className="text-slate-400 transition-colors hover:text-white" aria-label="Like">
                  <ThumbsUp className="h-5 w-5" />
                </a>
                <a href="#" className="text-slate-400 transition-colors hover:text-white" aria-label="Share">
                  <Share2 className="h-5 w-5" />
                </a>
                <a href="#" className="text-slate-400 transition-colors hover:text-white" aria-label="Contact">
                  <Mail className="h-5 w-5" />
                </a>
              </div>
            </div>
            <div>
              <h4 className="mb-4 font-semibold text-white">{t("landing.footerPlatform")}</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><Link to="/explore" className="transition-colors hover:text-[#10b981]">{t("landing.footerExplore")}</Link></li>
                <li><Link to="/docs" className="transition-colors hover:text-[#10b981]">{t("landing.footerHowItWorks")}</Link></li>
                <li><Link to="/pricing" className="transition-colors hover:text-[#10b981]">{t("landing.footerPricing")}</Link></li>
                <li><Link to="/about" className="transition-colors hover:text-[#10b981]">{t("landing.footerSecurity")}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 font-semibold text-white">{t("landing.footerResources")}</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><Link to="/docs" className="transition-colors hover:text-[#10b981]">{t("landing.footerDocs")}</Link></li>
                <li><Link to="/api" className="transition-colors hover:text-[#10b981]">{t("landing.footerApi")}</Link></li>
                <li><Link to="/about" className="transition-colors hover:text-[#10b981]">{t("landing.footer1275")}</Link></li>
                <li><Link to="/explore" className="transition-colors hover:text-[#10b981]">{t("landing.footerCommunity")}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 font-semibold text-white">{t("landing.footerCompany")}</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><Link to="/about" className="transition-colors hover:text-[#10b981]">{t("landing.footerAbout")}</Link></li>
                <li><a href="#" className="transition-colors hover:text-[#10b981]">{t("landing.footerBlog")}</a></li>
                <li><Link to="/institutions" className="transition-colors hover:text-[#10b981]">{t("landing.footerPartners")}</Link></li>
                <li><Link to="/support" className="transition-colors hover:text-[#10b981]">{t("landing.footerContact")}</Link></li>
              </ul>
            </div>
          </div>
          <div
            className="flex flex-col items-center justify-between gap-4 border-t pt-8 md:flex-row"
            style={{ borderColor: LANDING_SURFACE_HL }}
          >
            <p className="text-xs text-slate-500">
              {t("landing.footerCopyright")}
            </p>
            <div className="flex gap-6 text-xs text-slate-500">
              <a href="#" className="transition-colors hover:text-slate-300">{t("landing.footerPrivacy")}</a>
              <a href="#" className="transition-colors hover:text-slate-300">{t("landing.footerTerms")}</a>
            </div>
          </div>
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
        <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
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
