import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import {
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
import { AscapLogo } from "@/components/branding/AscapLogo"

const LANDING_BG = "var(--background)"
const LANDING_SURFACE = "var(--card)"
const LANDING_SURFACE_HL = "var(--border)"

const AVATARS = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAd4eBdpky71-5KIqBLN5YdE-EATFaLopXIbDY1O7cA-XESIGDxx18Njt-Oz8DOWAPBqDbgPCe9u53DsfnIMe0mxWyRYREGFZfNUVC9UyNwby0sO0RzbrnEjizjqUNI4Oq8C3qwseLZzjtRV75sLnnd4fz4cj8W-5VYxdkCQN8fvaposvLYnBk0Jh6BJDgh6FCIWWkXWhAfFpNKdPzAEqhh7ciy_J85hynokMHbKh7T3vsDld44aJyDmkfUGUoz8gzr69urUaFBjQ",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAfVFb03yyk6SJUhrs-4EmkHoa5pmzGYpUMgrJ0wGQhsOOOFAqSMLdAAZhEz0MijZvn67QyZv0DcHVXDypswFvDUOEfJ65ZHuG2Eksen3TIWC8zO-wkEQCDbeScu6DsReOdwi6sEFYEXB7g4bEWHcroF81aM6IX087wOmF4YQ8zvkZSGqWjsxJVD2bMT-NJQnCEBeu9OTZJTMPKlpLTmKuSBb4PX9-N1eu6RMNQ7Zzu_dttMQ_gOUXWxI2cL7tPbA5rXapxnTSuZg",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBk1OnJxBNXSzHEyyAKNfF7XPwDuNH6l4CEqqxP3VTeqZ3OdzLKMQS9g5H5Df0X0Zyiy2OfKhea-o1AxEwmqA04gOBYCx8sBsq-Nz-zuDm3IY55zx8waG2t5sXdNV4q4kOneDPAzKmULsPibyyZtHz2HgO45mc2pXEeR7gZa7OlLvIkILBaA8qriY15FkX_OXDlTMMyrGqIEB6jdwizRodrj44XbQanbUNWns31bEQzSUgRaAVPMFnDUsWcRcK6fX8Rv30dplu45A",
]

export function LandingPage() {
  const { t } = useTranslation()

  return (
    <div className="relative flex w-full flex-col overflow-x-hidden bg-background text-foreground antialiased selection:bg-primary selection:text-primary-foreground">
      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden pb-20 pt-12 lg:pb-28 lg:pt-20">
          <div className="absolute left-1/2 top-0 h-full w-full max-w-7xl -translate-x-1/2 pointer-events-none">
            <div className="absolute right-0 top-20 h-[500px] w-[500px] rounded-full bg-primary/10 blur-[100px]" />
            <div className="absolute bottom-0 left-0 h-[300px] w-[300px] rounded-full bg-blue-500/10 blur-[80px]" />
          </div>
          <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div className="flex flex-col gap-6 text-center lg:text-left">
                <div className="mx-auto flex justify-center lg:mx-0 lg:justify-start">
                  <AscapLogo variant="hero" />
                </div>
                <div className="mx-auto inline-flex w-fit items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-medium text-primary lg:mx-0">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                  </span>
                  {t("landing.badge1275")}
                </div>
                <h1 className="text-4xl font-black tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                  {t("landing.heroTitle")} <br />
                  <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                    {t("landing.heroTitleHighlight")}
                  </span>
                </h1>
                <p className="mx-auto max-w-2xl text-lg text-muted-foreground lg:mx-0">
                  {t("landing.heroSubtitle")}
                </p>
                <div className="flex flex-col justify-center gap-4 pt-4 sm:flex-row lg:justify-start">
                  <Link to="/register">
                    <Button className="h-12 gap-2 rounded-lg bg-primary px-8 font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:opacity-90">
                      <Archive className="h-5 w-5" />
                      {t("landing.startArchiving")}
                    </Button>
                  </Link>
                  <Link to="/explore">
                    <Button
                      variant="outline"
                      className="h-12 gap-2 rounded-lg border-border bg-card/60 px-8 font-bold text-foreground backdrop-blur-sm transition-all hover:bg-accent"
                    >
                      <Search className="h-5 w-5" />
                      {t("landing.exploreRepos")}
                    </Button>
                  </Link>
                </div>
                <div className="flex items-center justify-center gap-4 pt-8 text-sm text-muted-foreground lg:justify-start">
                  <div className="flex -space-x-2">
                    {AVATARS.map((src, i) => (
                      <div
                        key={i}
                        className="h-8 w-8 overflow-hidden rounded-full border-2 border-background bg-muted"
                      >
                        <img src={src} alt="" className="h-full w-full object-cover" />
                      </div>
                    ))}
                  </div>
                  <p>
                    {t("landing.trustedBy")}{" "}
                    <span className="font-semibold text-foreground">
                      {t("landing.trustedByCount")}
                    </span>{" "}
                    {t("landing.trustedBySuffix")}
                  </p>
                </div>
              </div>
              {/* Code mockup */}
              <div className="relative">
                <div
                  className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-primary to-blue-600 opacity-20 blur"
                />
                <div
                  className="relative overflow-hidden rounded-2xl border shadow-2xl"
                  style={{
                    backgroundColor: "var(--card)",
                    borderColor: "var(--border)",
                  }}
                >
                  <div
                    className="flex items-center gap-2 border-b px-4 py-3"
                    style={{ borderColor: "var(--border)", backgroundColor: "var(--background)" }}
                  >
                    <div className="flex gap-1.5">
                      <div className="h-3 w-3 rounded-full bg-red-500" />
                      <div className="h-3 w-3 rounded-full bg-yellow-500" />
                      <div className="h-3 w-3 rounded-full bg-green-500" />
                    </div>
                    <div className="mx-auto font-mono text-xs text-muted-foreground">
                      main.py — ASCAP
                    </div>
                  </div>
                  <div className="relative overflow-hidden p-6 font-mono text-sm bg-background">
                    <div className="pointer-events-none absolute right-0 top-0 p-4 sm:p-6">
                      <AscapLogo variant="watermark" />
                    </div>
                    <div className="relative space-y-2 text-muted-foreground">
                      <p><span className="text-purple-400">import</span> ascap_core</p>
                      <p><span className="text-purple-400">from</span> sovereignty <span className="text-purple-400">import</span> LocalStorage</p>
                      <br />
                      <p><span className="text-muted-foreground"># Initialize National Archive Node</span></p>
                      <p><span className="text-blue-400">class</span> <span className="text-yellow-300">AlgerianRepository</span>:</p>
                      <p className="pl-4">def <span className="text-blue-400">__init__</span>(self):</p>
                      <p className="pl-8">self.location = <span className="text-green-400">&quot;Algiers/DataCenter_01&quot;</span></p>
                      <p className="pl-8">self.security = <span className="text-green-400">&quot;High&quot;</span></p>
                      <p className="pl-8">self.compliance = <span className="text-orange-400">Decision.1275</span></p>
                      <br />
                      <p className="pl-4">def <span className="text-blue-400">archive_project</span>(self, code):</p>
                      <p className="pl-8"><span className="text-purple-400">return</span> ascap_core.secure(code)</p>
                    </div>
                    <div className="pointer-events-none absolute inset-0 animate-pulse bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
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
                <dt className="text-sm font-medium text-muted-foreground">{t("landing.statRepos")}</dt>
                <dd className="text-3xl font-bold tracking-tight text-white">{t("landing.statReposCount")}</dd>
              </div>
              <div className="flex flex-col gap-1">
                <dt className="text-sm font-medium text-muted-foreground">{t("landing.statPartners")}</dt>
                <dd className="text-3xl font-bold tracking-tight text-white">{t("landing.statPartnersCount")}</dd>
              </div>
              <div className="flex flex-col gap-1">
                <dt className="text-sm font-medium text-muted-foreground">{t("landing.statDevelopers")}</dt>
                <dd className="text-3xl font-bold tracking-tight text-white">{t("landing.statDevelopersCount")}</dd>
              </div>
              <div className="flex flex-col gap-1">
                <dt className="text-sm font-medium text-muted-foreground">{t("landing.statLoc")}</dt>
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
                <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-primary">
                  {t("landing.whyAscap")}
                </h2>
                <h3 className="text-3xl font-bold text-white sm:text-4xl">
                  {t("landing.whyAscapTitle")}
                </h3>
              </div>
              <p className="max-w-md text-lg text-muted-foreground">
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
                  className="group relative rounded-2xl border p-8 transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10"
                  style={{
                    borderColor: LANDING_SURFACE_HL,
                    backgroundColor: LANDING_SURFACE,
                  }}
                >
                  <div className="mb-6 inline-flex size-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h4 className="mb-3 text-xl font-bold text-white">
                    {t(titleKey)}
                  </h4>
                  <p className="leading-relaxed text-muted-foreground">
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
                <Network className="mb-4 h-12 w-12 animate-pulse text-primary" />
                <h3 className="mb-2 text-2xl font-bold text-white md:text-3xl">
                  {t("landing.networkTitle")}
                </h3>
                <p className="max-w-lg text-muted-foreground">
                  {t("landing.networkSubtitle")}
                </p>
              </div>
              <div className="absolute left-1/3 top-1/3 h-3 w-3 rounded-full bg-primary shadow-[0_0_15px_rgba(17,115,212,0.75)]" />
              <div className="absolute left-1/2 top-1/4 h-3 w-3 rounded-full bg-primary shadow-[0_0_15px_rgba(17,115,212,0.75)]" />
              <div className="absolute right-1/3 top-1/2 h-3 w-3 rounded-full bg-primary shadow-[0_0_15px_rgba(17,115,212,0.75)]" />
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="relative overflow-hidden bg-primary/[0.06] py-24">
          <div className="relative z-10 mx-auto max-w-3xl px-4 text-center">
            <h2 className="mb-6 text-3xl font-black text-white sm:text-4xl lg:text-5xl">
              {t("landing.ctaTitle")} <br />
              {t("landing.ctaTitleLine2")}
            </h2>
            <p className="mb-10 text-lg text-muted-foreground">
              {t("landing.ctaSubtitle")}
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Link to="/register">
                <Button className="h-14 rounded-xl bg-primary px-8 text-lg font-bold text-primary-foreground shadow-xl shadow-primary/20 transition-all hover:opacity-90">
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
          <div className="mb-12 grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5">
            <div className="sm:col-span-2 lg:col-span-2">
              <div className="mb-4 flex items-center gap-3">
                <AscapLogo variant="landingFooter" />
              </div>
              <p className="mb-6 max-w-xs text-sm text-muted-foreground">
                {t("landing.footerTagline")}
              </p>
              <div className="flex gap-4">
                <a href="#" className="text-muted-foreground transition-colors hover:text-foreground" aria-label="Like">
                  <ThumbsUp className="h-5 w-5" />
                </a>
                <a href="#" className="text-muted-foreground transition-colors hover:text-foreground" aria-label="Share">
                  <Share2 className="h-5 w-5" />
                </a>
                <a href="#" className="text-muted-foreground transition-colors hover:text-foreground" aria-label="Contact">
                  <Mail className="h-5 w-5" />
                </a>
              </div>
            </div>
            <div>
              <h4 className="mb-4 font-semibold text-white">{t("landing.footerPlatform")}</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/explore" className="transition-colors hover:text-primary">{t("landing.footerExplore")}</Link></li>
                <li><Link to="/docs" className="transition-colors hover:text-primary">{t("landing.footerHowItWorks")}</Link></li>
                <li><Link to="/pricing" className="transition-colors hover:text-primary">{t("landing.footerPricing")}</Link></li>
                <li><Link to="/about" className="transition-colors hover:text-primary">{t("landing.footerSecurity")}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 font-semibold text-white">{t("landing.footerResources")}</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/docs" className="transition-colors hover:text-primary">{t("landing.footerDocs")}</Link></li>
                <li><Link to="/api" className="transition-colors hover:text-primary">{t("landing.footerApi")}</Link></li>
                <li><Link to="/about" className="transition-colors hover:text-primary">{t("landing.footer1275")}</Link></li>
                <li><Link to="/explore" className="transition-colors hover:text-primary">{t("landing.footerCommunity")}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 font-semibold text-white">{t("landing.footerCompany")}</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/about" className="transition-colors hover:text-primary">{t("landing.footerAbout")}</Link></li>
                <li><a href="#" className="transition-colors hover:text-primary">{t("landing.footerBlog")}</a></li>
                <li><Link to="/institutions" className="transition-colors hover:text-primary">{t("landing.footerPartners")}</Link></li>
                <li><Link to="/support" className="transition-colors hover:text-primary">{t("landing.footerContact")}</Link></li>
              </ul>
            </div>
          </div>
          <div
            className="flex flex-col items-center justify-between gap-4 border-t pt-8 md:flex-row"
            style={{ borderColor: LANDING_SURFACE_HL }}
          >
            <div className="text-xs text-muted-foreground">
              <p>{t("landing.footerCopyright")}</p>
              <p className="mt-1">
                Developed by{" "}
                <a
                  href="http://dataforgestack.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-foreground"
                >
                  dataforgestack.com
                </a>
              </p>
            </div>
            <div className="flex gap-6 text-xs text-muted-foreground">
              <a href="#" className="transition-colors hover:text-foreground">{t("landing.footerPrivacy")}</a>
              <a href="#" className="transition-colors hover:text-foreground">{t("landing.footerTerms")}</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
