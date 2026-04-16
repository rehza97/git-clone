import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { GraduationCap, Mail, Lock, EyeOff, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/AuthContext"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"

const LOGIN_BG = "var(--background)"
const LOGIN_PATTERN = "radial-gradient(#1c2a38 1px, transparent 1px)"
const LOGIN_PATTERN_SIZE = "30px 30px"

export function LoginPage() {
  const { t } = useTranslation()
  const { signIn, signInWithGoogle } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (typeof localStorage !== "undefined") {
      const saved = localStorage.getItem("ascap-remember-email")
      if (saved) {
        setEmail(saved)
        setRememberMe(true)
      }
    }
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await signIn(email, password)
      if (rememberMe && typeof localStorage !== "undefined") {
        localStorage.setItem("ascap-remember-email", email)
      }
      navigate("/dashboard")
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "code" in err
          ? (err as { code: string }).code === "auth/invalid-credential"
            ? t("login.invalidCredentials")
            : t("login.errorSignIn")
          : t("login.errorSignIn")
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  async function handleUniversityLogin() {
    setError(null)
    setLoading(true)
    try {
      await signInWithGoogle()
      navigate("/dashboard")
    } catch (err: unknown) {
      setError(t("login.errorGoogle"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="flex min-h-screen flex-col font-sans text-foreground bg-background"
      style={{
        backgroundColor: LOGIN_BG,
        backgroundImage: LOGIN_PATTERN,
        backgroundSize: LOGIN_PATTERN_SIZE,
      }}
    >
      <main className="relative flex flex-1 items-center justify-center overflow-hidden px-4 py-12 sm:px-6 lg:px-8">
        {/* Decorative blurs */}
        <div className="pointer-events-none absolute -left-40 -top-40 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-[500px] w-[500px] rounded-full bg-primary/[0.05] blur-3xl" />

        <div className="relative z-10 w-full max-w-md space-y-8 rounded-2xl border border-border bg-card p-8 shadow-xl">
          {/* Welcome */}
          <div className="text-center">
            <h1 className="text-3xl font-black tracking-tight text-foreground">
              {t("login.welcomeBack")}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {t("login.welcomeSubtitle")}
            </p>
          </div>

          {/* University Login */}
          <div className="space-y-6">
            <button
              type="button"
              onClick={handleUniversityLogin}
              disabled={loading}
              className="group relative flex w-full items-center justify-center gap-3 rounded-lg bg-white px-4 py-3.5 text-sm font-semibold text-slate-900 shadow-sm transition-colors hover:bg-slate-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-600 disabled:opacity-50"
            >
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <GraduationCap className="h-5 w-5 text-slate-500 transition-colors group-hover:text-slate-900" />
              </span>
              {t("login.loginWithUniversityEmail")}
            </button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-card px-2 text-muted-foreground">
                  {t("login.orContinueWithCredentials")}
                </span>
              </div>
            </div>

            {/* Form */}
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <Alert variant="destructive" className="border-red-900/50 bg-red-950/30 text-red-200">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div>
                <Label htmlFor="email" className="block text-sm font-medium leading-6 text-foreground">
                  {t("login.emailAddress")}
                </Label>
                <div className="relative mt-2 rounded-md shadow-sm">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder={t("login.emailPlaceholder")}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="block w-full rounded-lg border border-input py-3 pl-10 text-foreground placeholder:text-muted-foreground focus-visible:ring-ring/50 sm:text-sm sm:leading-6 bg-background"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="password" className="block text-sm font-medium leading-6 text-foreground">
                  {t("login.password")}
                </Label>
                <div className="relative mt-2 rounded-md shadow-sm">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Lock className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder={t("login.passwordPlaceholder")}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="block w-full rounded-lg border border-input py-3 pl-10 pr-10 text-foreground placeholder:text-muted-foreground focus-visible:ring-ring/50 sm:text-sm sm:leading-6 bg-background"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex cursor-pointer items-center pr-3 text-muted-foreground transition-colors hover:text-primary"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Checkbox
                    id="remember-me"
                    checked={rememberMe}
                    onCheckedChange={(v) => setRememberMe(v === true)}
                    className="h-4 w-4 rounded border-input bg-background text-primary focus:ring-primary"
                  />
                  <Label htmlFor="remember-me" className="ml-2 block text-sm text-muted-foreground">
                    {t("login.rememberMe")}
                  </Label>
                </div>
                <div className="text-sm">
                  <a
                    href="#"
                    className="font-medium text-primary transition-colors hover:opacity-80"
                    onClick={(e) => e.preventDefault()}
                  >
                    {t("login.forgotPassword")}
                  </a>
                </div>
              </div>
              <div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex w-full justify-center rounded-lg bg-primary px-3 py-3.5 text-sm font-bold leading-6 text-primary-foreground shadow-sm transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50"
                >
                  {loading ? t("login.signingIn") : t("login.signIn")}
                </Button>
              </div>
            </form>
          </div>

          <p className="mt-10 text-center text-sm text-muted-foreground">
            {t("login.noAccount")}{" "}
            <Link
              to="/register"
              className="font-semibold leading-6 text-primary transition-colors hover:opacity-80"
            >
              {t("login.registerForAccount")}
            </Link>
          </p>
        </div>
      </main>

    </div>
  )
}
