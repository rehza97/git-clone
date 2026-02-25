import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import { Check, Server, ShieldCheck, Flag } from "lucide-react"

const HERO_BG_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDOQtgcDHsYls-LYFM_jeMdKHRJyYvAB0vESsdflj_aA0pGX4gHbufPxQZzahgF1o02WtLjkofeZWXZ3EX2ACmkgQoEGxG3DXTLBme_jCPr_QVhD-1kjp7tOA7Hp8l7Hps-JPjBFdEVK7Qe-Sn1Gg0Yqf31iWa-q0Yv5zqe99jYkwhbSwiePjqlV3nmfqPBpq1sDlA_TcziZFDMzphGlmOpjWN151wSmy5fK52lyAKAepEG9abQHWtKfWU0ro_BE0BFZ_MnYjPzvQ"

export function PricingPage() {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <main className="flex flex-col items-center px-4 md:px-10 lg:px-40 py-5">
        <div className="flex flex-col max-w-[1200px] w-full flex-1 gap-12">
          {/* Hero Section */}
          <section className="w-full @container">
            <div className="min-[480px]:p-4">
              <div
                className="relative flex min-h-[400px] flex-col gap-6 overflow-hidden rounded-xl bg-cover bg-center bg-no-repeat min-[480px]:gap-8 items-center justify-center p-8 text-center"
                style={{
                  backgroundImage: `linear-gradient(rgba(16, 25, 34, 0.7) 0%, rgba(16, 25, 34, 0.9) 100%), url("${HERO_BG_IMAGE}")`,
                }}
                aria-label="Digital secure abstract blue code background"
              >
                <div className="flex flex-col gap-3 max-w-[800px]">
                  <h1 className="text-white text-4xl font-black leading-tight tracking-[-0.033em] md:text-5xl lg:text-6xl">
                    {t("pricing.heroTitle")}
                  </h1>
                  <h2 className="text-slate-300 text-lg font-normal leading-relaxed max-w-[600px] mx-auto">
                    {t("pricing.heroSubtitle")}
                  </h2>
                </div>
                <div className="flex gap-4 flex-wrap justify-center">
                  <Button
                    asChild
                    className="flex items-center justify-center rounded-lg h-12 px-6 bg-primary hover:bg-blue-600 text-white text-base font-bold transition-all shadow-lg shadow-primary/20"
                  >
                    <a href="#pricing-plans">{t("pricing.viewPricing")}</a>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="flex items-center justify-center rounded-lg h-12 px-6 bg-slate-800 hover:bg-slate-700 text-white text-base font-bold transition-all border border-slate-700"
                  >
                    <Link to="/docs">{t("pricing.readDocs")}</Link>
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {/* Pricing Section */}
          <section id="pricing-plans" className="flex flex-col gap-6">
            <div className="text-center space-y-2 mb-4">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                {t("pricing.sectionTitle")}
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400">
                {t("pricing.sectionSubtitle")}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Student Plan */}
              <div className="flex flex-col gap-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#192633] p-8 transition-transform hover:-translate-y-1 hover:shadow-xl dark:hover:shadow-primary/5">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-slate-900 dark:text-white text-lg font-bold">
                      {t("pricing.planStudent")}
                    </h3>
                    <span className="text-xs font-semibold uppercase tracking-wider text-primary bg-primary/10 rounded-full px-3 py-1">
                      {t("pricing.planFree")}
                    </span>
                  </div>
                  <p className="flex items-baseline gap-1 text-slate-900 dark:text-white mt-2">
                    <span className="text-4xl font-black tracking-tight">
                      {t("pricing.planStudentPrice")}
                    </span>
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {t("pricing.planStudentDesc")}
                  </p>
                </div>
                <Button
                  asChild
                  className="w-full rounded-lg h-10 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white text-sm font-bold transition-colors"
                >
                  <Link to="/register">{t("pricing.getStarted")}</Link>
                </Button>
                <div className="flex flex-col gap-3 pt-4 border-t border-slate-100 dark:border-slate-700/50">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="flex gap-3 text-sm text-slate-600 dark:text-slate-300"
                    >
                      <Check className="size-5 text-primary shrink-0" />
                      <span>{t(`pricing.featureStudent${i}`)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Startup/Pro Plan */}
              <div className="relative flex flex-col gap-6 rounded-xl border-2 border-primary bg-white dark:bg-[#192633] p-8 shadow-2xl shadow-primary/10">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  {t("pricing.planPopular")}
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-slate-900 dark:text-white text-lg font-bold">
                      {t("pricing.planStartup")}
                    </h3>
                  </div>
                  <p className="flex items-baseline gap-1 text-slate-900 dark:text-white mt-2">
                    <span className="text-4xl font-black tracking-tight">
                      {t("pricing.planStartupPrice")}
                    </span>
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {t("pricing.planStartupDesc")}
                  </p>
                </div>
                <Button
                  asChild
                  className="w-full rounded-lg h-10 px-4 bg-primary hover:bg-blue-600 text-white text-sm font-bold transition-colors shadow-lg shadow-primary/25"
                >
                  <Link to="/register">{t("pricing.subscribeNow")}</Link>
                </Button>
                <div className="flex flex-col gap-3 pt-4 border-t border-slate-100 dark:border-slate-700/50">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="flex gap-3 text-sm text-slate-600 dark:text-slate-300"
                    >
                      <Check className="size-5 text-primary shrink-0" />
                      <span>{t(`pricing.featureStartup${i}`)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Institutional Plan */}
              <div className="flex flex-col gap-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#192633] p-8 transition-transform hover:-translate-y-1 hover:shadow-xl dark:hover:shadow-primary/5">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-slate-900 dark:text-white text-lg font-bold">
                      {t("pricing.planInstitutional")}
                    </h3>
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 bg-slate-100 dark:bg-slate-800 dark:text-slate-400 rounded-full px-3 py-1">
                      {t("pricing.planCustom")}
                    </span>
                  </div>
                  <p className="flex items-baseline gap-1 text-slate-900 dark:text-white mt-2">
                    <span className="text-4xl font-black tracking-tight">
                      {t("pricing.planInstitutionalContact")}
                    </span>
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {t("pricing.planInstitutionalDesc")}
                  </p>
                </div>
                <Button
                  asChild
                  className="w-full rounded-lg h-10 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white text-sm font-bold transition-colors"
                >
                  <Link to="/support">{t("pricing.contactSales")}</Link>
                </Button>
                <div className="flex flex-col gap-3 pt-4 border-t border-slate-100 dark:border-slate-700/50">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="flex gap-3 text-sm text-slate-600 dark:text-slate-300"
                    >
                      <Check className="size-5 text-primary shrink-0" />
                      <span>{t(`pricing.featureInst${i}`)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Why Choose ASCAP */}
          <section className="flex flex-col gap-10 py-10">
            <div className="flex flex-col gap-4 text-center">
              <h2 className="text-slate-900 dark:text-white text-3xl font-bold leading-tight md:text-4xl">
                {t("pricing.whyTitle")}
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto">
                {t("pricing.whySubtitle")}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="group flex flex-col gap-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#192633] p-6 hover:border-primary/50 transition-colors">
                <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                  <Server className="size-8" />
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="text-slate-900 dark:text-white text-lg font-bold">
                    {t("pricing.whyLocalTitle")}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                    {t("pricing.whyLocalDesc")}
                  </p>
                </div>
              </div>
              <div className="group flex flex-col gap-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#192633] p-6 hover:border-primary/50 transition-colors">
                <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                  <ShieldCheck className="size-8" />
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="text-slate-900 dark:text-white text-lg font-bold">
                    {t("pricing.whySecurityTitle")}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                    {t("pricing.whySecurityDesc")}
                  </p>
                </div>
              </div>
              <div className="group flex flex-col gap-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#192633] p-6 hover:border-primary/50 transition-colors">
                <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                  <Flag className="size-8" />
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="text-slate-900 dark:text-white text-lg font-bold">
                    {t("pricing.whySovereigntyTitle")}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                    {t("pricing.whySovereigntyDesc")}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="relative overflow-hidden rounded-2xl bg-primary px-6 py-16 md:px-16 text-center shadow-2xl">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white via-primary to-primary" />
            <div className="relative z-10 flex flex-col items-center gap-6">
              <h2 className="text-3xl font-black text-white md:text-5xl tracking-tight max-w-3xl">
                {t("pricing.ctaTitle")}
              </h2>
              <p className="text-blue-100 text-lg md:text-xl max-w-2xl">
                {t("pricing.ctaSubtitle")}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 w-full justify-center mt-4">
                <Button
                  asChild
                  className="h-12 px-8 rounded-lg bg-white text-primary font-bold hover:bg-blue-50 transition-colors shadow-lg"
                >
                  <Link to="/register">{t("pricing.startFreeTrial")}</Link>
                </Button>
                <Button
                  asChild
                  className="h-12 px-8 rounded-lg bg-[#0e5a9c] text-white font-bold hover:bg-[#0b487d] transition-colors border border-blue-400/30"
                >
                  <Link to="/support">{t("pricing.contactSales")}</Link>
                </Button>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
