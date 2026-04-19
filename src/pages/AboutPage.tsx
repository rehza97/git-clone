import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import {
  Database,
  ShieldCheck,
  Scale,
  Lock,
  Link2,
} from "lucide-react"
import { Button } from "@/components/ui/button"

const HERO_BG =
  'linear-gradient(rgba(16, 25, 34, 0.7), rgba(16, 25, 34, 0.9)), url("https://lh3.googleusercontent.com/aida-public/AB6AXuABdHWQVECtsmJrwhGehXU4GTsLnQZKgUpkSPYGdctFuOLJJu01UlmC3QMXTxI8RYQ5jkuZL7le9N0qcdllcFRrw2OrWlNUrlb6-gMJ3ztVe-A_d_Iqs0X8jN91wAMzU3JPFQHZyoIkpaCmcj8-ZeCeK2IXxLQfDz2gDVhORgE1T5CRu5klqNvlsSnqarqn00V2Fh5Ec8qHEpJDNzEh2lwCAFcP0dH8-c0v04cDre2-4SKlynP7MXdU5KZLXPXhfUN-iGLJQBj0Sg")'

const VISION_IMG =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuADfJOq2XdhiVUzGjT8IsB-9hlzGBKA58lTiLq6lTzcmxXMdHqmKstID06igi49TiW6W8LEhIpizARWE091w7nPOuspMMZMM-Xt6acdxnIit66Gk351aPpV2YnsqnNTJKI2Xgvc0a4rJoJU_LTdReisAtAtz2fG6-orfUeSBwPTlYNg3El0GNn1SQndeVAwlqzFVmpU-_2wlw3JAjf6WuLah82O7VF3UfChSnfqoP7j8vcPh_xEslSXpDil_ZtDK_D4JYu5B7ykQQ"

const TEAM_IMAGES = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuC2TZACedqe9WQFiuDOqqqPG4BS-DxfegTWGWLJpeg5qYmnoBAgEPNh5kEudXD5cIKJIAwJ6MbB_zE_0Pi_euIN8gZWN25tFLjVw0RoZYgL0iFMDGilg1nOl_p2IW6nhHTeB5ZHYTCy2Je8_W43-yTiPoH8PhQGWVxd68n5RWoBVcDB-igWUBcFhTTIb90I2jHF85uFOab7F8uHnKOoXrQMGDPgLEbqxYWI92vlIdP-K3mvGpeztzKNzbrd7L86e1xPhKIW_faTxQ",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBJhdcMdb6tp2kYCznSnTEi4oXBv9NZtMQt3Twlhr-VxsgrnSdcIOVn6Fwc7zjRPvYef76zAGKncxidCANwOHwP-tmRwmR22uuaoZz7J8MNrWl5XHgOnO9FOGHCZZnILqtPM9-RsR9AU197jwi9bkJWvN7j9czib3BBjFBD_YSCmVm9KOY2uN_UD1OEIyWdDD8CsrEQtcnwFaRms3DNGAZzoLp1TFhiLYJaYWW_lFMLs179D3RTiZLb6u-XgspZfNyPKb9tKQziZw",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBpaWqy_WnAKY_KXXkP_cH66LGN4VunBsifp5L70X4RoTlhm7PnRZu-yAL_BsR3gYYyumYSxBPzTPqx_4vYUNDgKLl6N4K9_npXqY5y0q2nGTbNF5BaJaobHh-1ZJJ-hVqZghX7XVQmfJ9Kl7yuwrzdY7r5Bzy3kbvqhsjyj8h5gs6BemKDfZtaojXUaHAPJ4FE4jr7FLDWYopyL-4VO00--z8wnXOKX7WuCjjCQZ5zr8zB3vyzN9ElCBqgfN5dcJpfOxBW36ziZA",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCDW4BjymxMpb3d7kqXO6hTLaitC1lB40dRQbwk4WIBt_DAcwOzrkwX9z-4CSAu6OtXzr1Ys0wvl93z1z0qP1UYKpHztdGU34pRsSH0v2GZFdhqpxlBG9QRUBLVXfaXSyY7brJMOJnCGZih90abZMIYbTMN_h0BXGGALkNguWdOFtQCTg5smtWNQBG-7NHK6gE1c83U5g8ddBg70s6t9eYZ6qBi13fFs3nsuPm5OR3h1fb456TnRnU0xdGxZvdW0UncfQMSn2a9Gw",
]

const foundingContacts = [
  {
    nameKey: "about.founder1",
    email: "Abbadnacera1@gmail.com",
    phoneDisplay: "+213 698 19 74 52",
    phoneTel: "+213698197452",
  },
  {
    nameKey: "about.founder2",
    email: "Manel.brikci13@gmail.com",
    phoneDisplay: "+213 670 67 61 31",
    phoneTel: "+213670676131",
  },
]

export function AboutPage() {
  const { t } = useTranslation()
  const projectGoals = t("about.projectGoals", { returnObjects: true }) as string[]
  const projectAspects = t("about.projectAspects", { returnObjects: true }) as string[]

  return (
    <div className="min-h-screen w-full bg-background text-foreground">
      <div className="flex flex-1 flex-col items-center w-full">
        <div className="flex max-w-[960px] flex-col w-full gap-12 px-4 py-8 md:px-10 lg:px-16">
          {/* Hero with background image */}
          <section
            className="relative flex min-h-[400px] items-center justify-center overflow-hidden rounded-2xl p-8 md:p-12"
            style={{
              backgroundImage: HERO_BG,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="relative z-10 flex max-w-2xl flex-col gap-6 text-center">
              <div className="mx-auto inline-flex w-fit items-center justify-center gap-2 rounded-full border border-primary/30 bg-primary/20 px-3 py-1">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <span className="text-xs font-bold uppercase tracking-wider text-primary">
                  {t("about.badge")}
                </span>
              </div>
              <h1 className="text-4xl font-black leading-tight tracking-tight text-foreground md:text-5xl">
                {t("about.heroTitle")}
              </h1>
              <p className="text-lg leading-relaxed text-muted-foreground">
                {t("about.heroDesc")}
              </p>
            </div>
          </section>

          {/* Mission stats / highlights */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/50">
              <Database className="h-10 w-10 text-primary" />
              <h3 className="text-xl font-bold text-foreground">{t("about.centralizedTitle")}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {t("about.centralizedDesc")}
              </p>
            </div>
            <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/50">
              <Scale className="h-10 w-10 text-primary" />
              <h3 className="text-xl font-bold text-foreground">{t("about.decreeTitle")}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {t("about.decreeDesc")}
              </p>
            </div>
            <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/50">
              <Lock className="h-10 w-10 text-primary" />
              <h3 className="text-xl font-bold text-foreground">{t("about.sovereigntyTitle")}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {t("about.sovereigntyDesc")}
              </p>
            </div>
          </div>

          {/* Vision: two columns */}
          <div className="grid grid-cols-1 gap-12 py-8 md:grid-cols-12">
            <div className="flex flex-col gap-6 md:col-span-5">
              <h2 className="text-3xl font-bold leading-tight text-foreground">
                {t("about.heritageTitle")}
              </h2>
              <div className="h-1 w-12 rounded-full bg-primary" />
              <p className="leading-relaxed text-muted-foreground">{t("about.heritageP1")}</p>
              <p className="leading-relaxed text-muted-foreground">{t("about.heritageP2")}</p>
              <div className="mt-4 rounded-r-lg border-l-4 border-primary bg-primary/10 p-4">
                <p className="italic text-foreground">
                  &quot;{t("about.heritageQuote")}&quot;
                </p>
              </div>
            </div>
            <div className="relative min-h-[300px] overflow-hidden rounded-xl md:col-span-7">
              <img
                src={VISION_IMG}
                alt="University students collaborating on laptops in modern library"
                className="absolute inset-0 h-full w-full object-cover opacity-80 transition-transform duration-700 hover:scale-105"
              />
            </div>
          </div>

          {/* Who We Are */}
          <section className="flex flex-col gap-8 py-8">
            <div className="flex flex-col gap-2">
              <h2 className="text-2xl font-bold text-foreground">{t("about.whoWeAreTitle")}</h2>
              <p className="leading-relaxed text-muted-foreground">{t("about.whoWeAreIntro")}</p>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
              <div className="rounded-xl border border-border bg-card p-6">
                <h3 className="mb-4 text-lg font-bold text-foreground">{t("about.projectGoalsTitle")}</h3>
                <ul className="list-disc space-y-3 pl-5 text-sm leading-relaxed text-muted-foreground">
                  {projectGoals.map((goal, index) => (
                    <li key={`goal-${index}`}>{goal}</li>
                  ))}
                </ul>
              </div>

              <div className="rounded-xl border border-border bg-card p-6">
                <h3 className="mb-4 text-lg font-bold text-foreground">{t("about.projectAspectsTitle")}</h3>
                <ul className="list-disc space-y-3 pl-5 text-sm leading-relaxed text-muted-foreground">
                  {projectAspects.map((aspect, index) => (
                    <li key={`aspect-${index}`}>{aspect}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="mb-3 text-lg font-bold text-foreground">{t("about.foundingTeamTitle")}</h3>
              <p className="text-sm font-semibold text-primary">{t("about.foundersLabel")}</p>
              <p className="mt-2 text-sm text-muted-foreground">{t("about.founder1")}</p>
              <p className="text-sm text-muted-foreground">{t("about.founder2")}</p>
              <p className="mt-4 text-sm font-semibold text-primary">{t("about.supervisorLabel")}</p>
              <p className="mt-2 text-sm text-muted-foreground">{t("about.supervisorName")}</p>
              <p className="mt-4 text-sm font-semibold text-primary">{t("about.contactInfoTitle")}</p>
              <div className="mt-2 space-y-2">
                {foundingContacts.map((contact) => (
                  <div key={contact.email} className="text-sm text-muted-foreground">
                    <p className="font-medium text-foreground">{t(contact.nameKey)}</p>
                    <a className="text-primary hover:underline" href={`mailto:${contact.email}`}>
                      {contact.email}
                    </a>
                    <span className="mx-2 text-border">|</span>
                    <a className="text-primary hover:underline" href={`tel:${contact.phoneTel}`}>
                      {contact.phoneDisplay}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Roadmap */}
          <section className="flex flex-col gap-8 py-8">
            <div className="flex flex-col gap-2">
              <h2 className="text-2xl font-bold text-foreground">
                {t("about.roadmapTitle")}
              </h2>
              <p className="text-muted-foreground">{t("about.roadmapSubtitle")}</p>
            </div>
            <div className="relative">
              <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-border-strong md:left-1/2 md:-ml-px" />
              <div className="space-y-8">
                {/* Phase 1 */}
                <div className="relative flex flex-col items-center gap-8 md:flex-row">
                  <div className="order-2 flex-1 md:order-1 md:text-right">
                    <h3 className="text-lg font-bold text-primary">
                      {t("about.phase1Title")}
                    </h3>
                    <p className="font-medium text-white">{t("about.phase1Sub")}</p>
                    <p className="mt-1 text-sm text-subtle-fg">
                      {t("about.phase1Desc")}
                    </p>
                  </div>
                  <div className="order-1 z-10 flex size-8 shrink-0 items-center justify-center rounded-full border-4 border-surface-page bg-primary md:order-2">
                    <span className="text-xs font-bold text-white">1</span>
                  </div>
                  <div className="order-3 flex-1 md:visible md:order-3 invisible" />
                </div>
                {/* Phase 2 */}
                <div className="relative flex flex-col items-center gap-8 md:flex-row">
                  <div className="order-3 flex-1 md:order-1 md:visible invisible" />
                  <div className="order-1 z-10 flex size-8 shrink-0 items-center justify-center rounded-full border border-primary bg-surface-muted text-primary md:order-2">
                    <span className="text-sm font-bold">2</span>
                  </div>
                  <div className="order-2 flex-1 md:order-3">
                    <h3 className="text-lg font-bold text-white">
                      {t("about.phase2Title")}
                    </h3>
                    <p className="font-medium text-white">{t("about.phase2Sub")}</p>
                    <p className="mt-1 text-sm text-subtle-fg">
                      {t("about.phase2Desc")}
                    </p>
                  </div>
                </div>
                {/* Phase 3 */}
                <div className="relative flex flex-col items-center gap-8 md:flex-row">
                  <div className="order-2 flex-1 md:order-1 md:text-right">
                    <h3 className="text-lg font-bold text-white">
                      {t("about.phase3Title")}
                    </h3>
                    <p className="font-medium text-white">{t("about.phase3Sub")}</p>
                    <p className="mt-1 text-sm text-subtle-fg">
                      {t("about.phase3Desc")}
                    </p>
                  </div>
                  <div className="order-1 z-10 flex size-8 shrink-0 items-center justify-center rounded-full border border-border-strong bg-surface-muted text-subtle-fg md:order-2">
                    <span className="text-sm font-bold">3</span>
                  </div>
                  <div className="order-3 flex-1 md:visible md:order-3 invisible" />
                </div>
              </div>
            </div>
          </section>

          {/* Leadership Team */}
          <section className="flex w-full flex-col gap-8 py-8">
            <div className="mb-4 flex flex-col gap-2">
              <h2 className="text-2xl font-bold text-white">
                {t("about.leadershipTitle")}
              </h2>
              <p className="text-subtle-fg">{t("about.leadershipSubtitle")}</p>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4">
              {[
                { nameKey: "about.teamMember1Name", roleKey: "about.teamMember1Role", img: TEAM_IMAGES[0], primaryIcon: true },
                { nameKey: "about.teamMember2Name", roleKey: "about.teamMember2Role", img: TEAM_IMAGES[1], primaryIcon: false },
                { nameKey: "about.teamMember3Name", roleKey: "about.teamMember3Role", img: TEAM_IMAGES[2], primaryIcon: false },
                { nameKey: "about.teamMember4Name", roleKey: "about.teamMember4Role", img: TEAM_IMAGES[3], primaryIcon: false },
              ].map((member) => (
                <div key={member.nameKey} className="group flex flex-col gap-3">
                  <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-surface-muted">
                    <img
                      src={member.img}
                      alt=""
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 opacity-60 bg-gradient-to-t from-surface-page/90 to-transparent" />
                    <div className="absolute bottom-4 left-4">
                      <div
                        className={`flex size-8 items-center justify-center rounded-lg text-white ${
                          member.primaryIcon
                            ? "bg-primary"
                            : "border border-border-strong bg-surface-muted transition-colors hover:border-primary"
                        }`}
                      >
                        <Link2 className="h-4 w-4" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">
                      {t(member.nameKey)}
                    </h3>
                    <p className="text-sm font-medium text-primary">
                      {t(member.roleKey)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <div className="flex w-full flex-col items-center justify-between gap-8 rounded-2xl border border-border-strong bg-gradient-to-r from-primary/20 to-surface-muted p-8 md:flex-row md:p-12">
            <div className="flex max-w-lg flex-col gap-3">
              <h2 className="text-2xl font-bold text-white">
                {t("about.ctaTitle")}
              </h2>
              <p className="text-subtle-fg">
                {t("about.ctaDescStats")}
              </p>
            </div>
            <div className="flex gap-4">
              <Button
                variant="outline"
                className="h-12 rounded-lg border-border-strong bg-surface-muted px-6 text-sm font-bold text-white hover:bg-border-strong"
                asChild
              >
                <Link to="/docs">{t("about.documentation")}</Link>
              </Button>
              <Button
                className="h-12 rounded-lg bg-primary px-6 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:bg-blue-600"
                asChild
              >
                <Link to="/register">{t("about.submitSourceCode")}</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full border-t border-border-strong bg-surface-page py-12">
        <div className="flex flex-col justify-center px-4 md:flex-row md:px-10 lg:px-16">
          <div className="flex w-full max-w-[960px] flex-col justify-between gap-8 md:flex-row">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2 text-white">
                <Database className="h-6 w-6 text-primary" />
                <span className="text-lg font-bold">ASCAP</span>
              </div>
              <p className="max-w-xs text-sm text-subtle-fg">
                {t("about.footerOrg")}
              </p>
            </div>
            <div className="flex gap-8 md:gap-16">
              <div className="flex flex-col gap-3">
                <h4 className="text-sm font-bold text-white">
                  {t("about.footerPlatform")}
                </h4>
                <Link to="/explore" className="text-sm text-subtle-fg hover:text-white">
                  {t("about.footerSearch")}
                </Link>
                <a href="#" className="text-sm text-subtle-fg hover:text-white">
                  {t("about.footerStatistics")}
                </a>
                <Link to="/api" className="text-sm text-subtle-fg hover:text-white">
                  {t("about.footerApi")}
                </Link>
              </div>
              <div className="flex flex-col gap-3">
                <h4 className="text-sm font-bold text-white">
                  {t("about.footerLegal")}
                </h4>
                <a href="#" className="text-sm text-subtle-fg hover:text-white">
                  {t("about.footerTerms")}
                </a>
                <a href="#" className="text-sm text-subtle-fg hover:text-white">
                  {t("about.footerPrivacy")}
                </a>
                <a href="#" className="text-sm text-subtle-fg hover:text-white">
                  {t("about.footerDecree1275")}
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
