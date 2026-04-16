import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import {
  Lock,
  GraduationCap,
  FlaskConical,
  Terminal,
  Building2,
  Search,
  ArrowRight,
  Mail,
  User,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/AuthContext"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
const STEPS = [
  { key: "step1Name", id: "identity" },
  { key: "step2Name", id: "contact" },
  { key: "step3Name", id: "security" },
  { key: "step4Name", id: "review" },
] as const

type Role = "student" | "researcher" | "developer" | "institution"

const ROLES: { value: Role; icon: React.ElementType; titleKey: string; descKey: string }[] = [
  { value: "student", icon: GraduationCap, titleKey: "register.roleStudent", descKey: "register.roleStudentDesc" },
  { value: "researcher", icon: FlaskConical, titleKey: "register.roleResearcher", descKey: "register.roleResearcherDesc" },
  { value: "developer", icon: Terminal, titleKey: "register.roleDeveloper", descKey: "register.roleDeveloperDesc" },
  { value: "institution", icon: Building2, titleKey: "register.roleInstitution", descKey: "register.roleInstitutionDesc" },
]

export function RegisterPage() {
  const { t } = useTranslation()
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [role, setRole] = useState<Role>("student")
  const [affiliation, setAffiliation] = useState("")
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const percent = step * 25
  const stepNameKey = STEPS[step - 1].key

  function handleCancel() {
    if (step === 1) navigate("/")
    else setStep((s) => s - 1)
  }

  function handleContinue() {
    setError(null)
    if (step < 4) {
      setStep((s) => s + 1)
      return
    }
    handleSubmitFinal()
  }

  async function handleSubmitFinal() {
    if (password !== confirmPassword) {
      setError(t("register.passwordsMismatch"))
      return
    }
    if (password.length < 6) {
      setError(t("register.passwordTooShort"))
      return
    }
    if (!acceptTerms) {
      setError(t("register.acceptTermsError"))
      return
    }
    setLoading(true)
    try {
      await signUp(email, password)
      navigate("/dashboard")
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "code" in err
          ? (err as { code: string }).code === "auth/email-already-in-use"
            ? t("register.emailInUse")
            : t("register.errorCreate")
          : t("register.errorCreate")
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const canContinue =
    (step === 1) ||
    (step === 2 && email.trim().length > 0) ||
    (step === 3 && password.length >= 6 && password === confirmPassword) ||
    (step === 4 && acceptTerms)

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden font-sans text-foreground antialiased bg-background">
      <main className="flex flex-1 justify-center px-4 py-8 md:px-6 lg:px-8">
        <div className="flex w-full max-w-[800px] flex-col gap-8">
          {/* Hero */}
          <div className="flex flex-col gap-2 pt-4">
            <div className="mb-2 flex items-center gap-2 text-primary">
              <Lock className="h-4 w-4" />
              <span className="text-xs font-bold uppercase tracking-wider">{t("register.secureRegistration")}</span>
            </div>
            <h1 className="text-3xl font-black leading-tight tracking-tight text-foreground md:text-4xl" style={{ letterSpacing: "-0.033em" }}>
              {t("register.title")}
            </h1>
            <p className="text-base font-normal leading-relaxed text-muted-foreground md:text-lg">
              {t("register.subtitle")}
            </p>
          </div>

          {/* Progress */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
              <p className="text-base font-bold leading-normal text-foreground">
                {t("register.stepOf", { current: step, stepName: t(stepNameKey) })}
              </p>
              <span className="shrink-0 text-sm font-medium text-muted-foreground">
                {t("register.percentCompleted", { percent })}
              </span>
            </div>
            <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary shadow-[0_0_10px] shadow-primary/50 transition-all duration-500 ease-in-out"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>

          {/* Form */}
          <form
            className="flex flex-col gap-6"
            onSubmit={(e) => { e.preventDefault(); handleContinue(); }}
          >
            {error && (
              <Alert variant="destructive" className="border-red-900/50 bg-red-950/30 text-red-200">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Step 1: Identity */}
            {step === 1 && (
              <>
                <div className="flex flex-col gap-4">
                  <h3 className="text-lg font-bold text-foreground">{t("register.selectRole")}</h3>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {ROLES.map(({ value, icon: Icon, titleKey, descKey }) => (
                      <label
                        key={value}
                        className="group relative flex cursor-pointer items-start gap-4 rounded-xl border border-border bg-card p-5 transition-all hover:border-primary hover:shadow-md"
                      >
                        <input
                          type="radio"
                          name="role"
                          value={value}
                          checked={role === value}
                          onChange={() => setRole(value)}
                          className="mt-1 h-5 w-5 shrink-0 border-2 border-input bg-transparent accent-primary text-primary focus:ring-primary focus:ring-offset-0"
                        />
                        <div className="flex min-w-0 flex-1 flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <Icon className="h-5 w-5 shrink-0 text-primary" />
                            <p className="text-base font-bold leading-normal text-foreground">{t(titleKey)}</p>
                          </div>
                          <p className="text-sm font-normal leading-normal text-muted-foreground">{t(descKey)}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-4 pt-2">
                  <Label className="text-sm font-semibold leading-normal text-foreground">
                    {t("register.affiliationLabel")}
                  </Label>
                  <div className="relative">
                    <Input
                      value={affiliation}
                      onChange={(e) => setAffiliation(e.target.value)}
                      placeholder={t("register.affiliationPlaceholder")}
                      className="h-14 resize-none overflow-hidden rounded-lg border-input bg-background p-4 pr-12 text-base font-normal text-foreground shadow-sm transition-shadow placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/50"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                      <Search className="h-5 w-5" />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">{t("register.affiliationHint")}</p>
                </div>
              </>
            )}

            {/* Step 2: Contact */}
            {step === 2 && (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="fullName" className="text-sm font-semibold text-foreground">{t("register.fullName")}</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder={t("register.fullNamePlaceholder")}
                      className="h-14 rounded-lg border-input bg-background pl-10 text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="email" className="text-sm font-semibold text-foreground">{t("register.email")}</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t("register.emailPlaceholder")}
                      className="h-14 rounded-lg border-input bg-background pl-10 text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Security */}
            {step === 3 && (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="password" className="text-sm font-semibold text-foreground">{t("register.password")}</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    minLength={6}
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t("register.passwordPlaceholder")}
                    className="h-14 rounded-lg border-input bg-background text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-semibold text-foreground">{t("register.confirmPassword")}</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    required
                    minLength={6}
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={t("register.confirmPasswordPlaceholder")}
                    className="h-14 rounded-lg border-input bg-background text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/50"
                  />
                  {confirmPassword && password !== confirmPassword && (
                    <p className="text-xs text-amber-400">{t("register.passwordsMismatch")}</p>
                  )}
                </div>
              </div>
            )}

            {/* Step 4: Review & Terms */}
            {step === 4 && (
              <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6">
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">{t("register.email")}:</span> {email}
                </p>
                {fullName && (
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">{t("register.fullName")}:</span> {fullName}
                  </p>
                )}
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">{t("register.selectRole")}:</span> {t(ROLES.find((r) => r.value === role)?.titleKey ?? "")}
                </p>
                {affiliation && (
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">{t("register.affiliationLabel")}:</span> {affiliation}
                  </p>
                )}
                <div className="flex items-center gap-3 pt-2">
                  <Checkbox
                    id="accept-terms"
                    checked={acceptTerms}
                    onCheckedChange={(v) => setAcceptTerms(v === true)}
                    className="h-4 w-4 rounded border-input bg-background text-primary focus:ring-primary"
                  />
                  <Label htmlFor="accept-terms" className="text-sm text-muted-foreground">
                    {t("register.acceptTerms")}
                  </Label>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="mt-2 flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-end sm:gap-4">
              <Button
                type="button"
                variant="ghost"
                onClick={handleCancel}
                className="h-12 w-full rounded-lg px-6 font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground sm:w-auto"
              >
                {step === 1 ? t("register.cancel") : t("register.back")}
              </Button>
              <Button
                type="submit"
                disabled={!canContinue || loading}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary px-8 font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 sm:w-auto"
              >
                {step < 4 ? (
                  <>
                    {t("register.continue")}
                    <ArrowRight className="h-4 w-4" />
                  </>
                ) : loading ? (
                  t("register.creatingAccount")
                ) : (
                  t("register.submit")
                )}
              </Button>
            </div>
          </form>

          {/* Footer links */}
          <div className="mt-4 flex flex-wrap justify-center gap-x-6 gap-y-2">
            <a href="#" className="text-xs text-muted-foreground transition-colors hover:text-primary" onClick={(e) => e.preventDefault()}>
              {t("register.privacyPolicy")}
            </a>
            <a href="#" className="text-xs text-muted-foreground transition-colors hover:text-primary" onClick={(e) => e.preventDefault()}>
              {t("register.termsOfService")}
            </a>
            <Link to="/support" className="text-xs text-muted-foreground transition-colors hover:text-primary">
              {t("register.helpCenter")}
            </Link>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            {t("register.hasAccount")}{" "}
            <Link to="/login" className="font-semibold text-primary transition-colors hover:opacity-80">
              {t("nav.login")}
            </Link>
          </p>
          <p className="text-center text-xs text-muted-foreground">
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
      </main>
    </div>
  )
}
