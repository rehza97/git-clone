import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import {
  Code2,
  Check,
  ArrowLeft,
  ArrowRight,
  Rocket,
  GraduationCap,
  User,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAuth } from "@/contexts/AuthContext"
import { useUserProfile } from "@/hooks/useUserProfile"
import { createRepo } from "@/lib/repos"
import type { RepoProjectType, RepoVisibility } from "@/types/schema"
import { ThemeToggle } from "@/components/ui/theme-toggle"

const PRIMARY = "#1173d4"

const PROJECT_TYPES: { value: RepoProjectType; icon: React.ElementType; titleKey: string; descKey: string; recommended?: boolean }[] = [
  { value: "startup", icon: Rocket, titleKey: "createProject.startupProject", descKey: "createProject.startupProjectDesc", recommended: true },
  { value: "research", icon: GraduationCap, titleKey: "createProject.research", descKey: "createProject.researchDesc" },
  { value: "personal", icon: User, titleKey: "createProject.personal", descKey: "createProject.personalDesc" },
]

export function CreateProjectPage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const profile = useUserProfile()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [projectType, setProjectType] = useState<RepoProjectType>("startup")
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [visibility, setVisibility] = useState<RepoVisibility>("private")
  const [creating, setCreating] = useState(false)

  const progressPercent = step === 1 ? 0 : step === 2 ? 50 : 100

  async function handleCreate() {
    if (!user || !name.trim()) return
    setCreating(true)
    try {
      const repoId = await createRepo(user.uid, {
        name: name.trim(),
        description: description.trim() || undefined,
        visibility,
        projectType,
      })
      navigate(`/repo/${repoId}/upload`)
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col font-sans text-foreground antialiased bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/90 px-6 backdrop-blur-md lg:px-12">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded bg-[#1173d4]/20 text-[#1173d4]">
              <Code2 className="h-5 w-5" />
            </div>
            <h1 className="text-lg font-bold tracking-tight text-foreground">
              ASCAP <span className="font-normal text-muted-foreground">Onboarding</span>
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/support" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              {t("createProject.helpCenter")}
            </Link>
            <ThemeToggle className="rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground" />
            <div className="h-6 w-px bg-border" />
            <div className="flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-semibold leading-none text-foreground">{profile?.displayName || profile?.username || "User"}</p>
                <p className="mt-1 text-xs text-muted-foreground">New User</p>
              </div>
              <div className="size-9 overflow-hidden rounded-full border border-border bg-muted bg-cover bg-center">
                {profile?.photoURL ? <img src={profile.photoURL} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">{(profile?.displayName || profile?.username || "?")[0]}</div>}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-6 py-12 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-black tracking-tight text-foreground md:text-4xl">
            {t("createProject.welcomeTitle")}
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            {t("createProject.welcomeSubtitle")}
          </p>
        </div>

        {/* Step indicator */}
        <div className="relative mb-12 w-full max-w-3xl mx-auto">
          <div className="absolute top-1/2 left-0 h-0.5 w-full -translate-y-1/2 bg-border -z-10" />
          <div
            className="absolute top-1/2 left-0 h-0.5 -translate-y-1/2 -z-10 transition-all duration-500"
            style={{ width: `${progressPercent}%`, backgroundColor: PRIMARY }}
          />
          <div className="flex w-full justify-between">
            <button type="button" onClick={() => setStep(1)} className="flex flex-col items-center gap-2 cursor-pointer group">
              <div className={`flex size-10 items-center justify-center rounded-full font-bold ring-4 ring-background shadow-sm ${step > 1 ? "bg-[#1173d4] text-white" : step === 1 ? "bg-[#1173d4] text-white" : "bg-muted text-muted-foreground"}`}>
                {step > 1 ? <Check className="h-5 w-5" /> : "1"}
              </div>
              <span className={`text-sm font-semibold ${step >= 1 ? "text-[#1173d4]" : "text-muted-foreground"}`}>{t("createProject.stepUniversity")}</span>
            </button>
            <button type="button" onClick={() => step >= 2 && setStep(2)} className="flex flex-col items-center gap-2 cursor-pointer group">
              <div className={`relative z-10 flex size-10 items-center justify-center rounded-full font-bold ring-4 ring-background shadow-sm ${step > 2 ? "bg-[#1173d4] text-white" : step === 2 ? "border-2 border-[#1173d4] bg-card text-[#1173d4]" : "bg-muted text-muted-foreground opacity-50"}`}>
                {step === 2 && <span className="absolute inset-0 rounded-full bg-[#1173d4]/20 animate-ping" />}
                {step > 2 ? <Check className="h-5 w-5" /> : "2"}
              </div>
              <span className={`text-sm font-semibold ${step >= 2 ? "text-foreground" : "text-muted-foreground"}`}>{t("createProject.stepProjectType")}</span>
            </button>
            <button type="button" onClick={() => step >= 3 && setStep(3)} className={`flex flex-col items-center gap-2 cursor-pointer group ${step >= 3 ? "" : "opacity-50"}`}>
              <div className={`flex size-10 items-center justify-center rounded-full font-bold ring-4 ring-background shadow-sm ${step === 3 ? "border-2 border-[#1173d4] bg-card text-[#1173d4]" : "bg-muted text-muted-foreground"}`}>
                3
              </div>
              <span className={`text-sm font-medium ${step >= 3 ? "text-foreground" : "text-muted-foreground"}`}>{t("createProject.stepArchiveSettings")}</span>
            </button>
          </div>
        </div>

        {/* Card */}
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
          <div className="p-8 md:p-10">
            {/* Step 1 */}
            {step === 1 && (
              <div className="animate-in fade-in duration-200">
                <div className="mb-8">
                  <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#1173d4]/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#1173d4]">
                    {t("createProject.stepOf", { current: 1 })}
                  </div>
                  <h3 className="mb-2 text-2xl font-bold text-foreground">{t("createProject.step1Title")}</h3>
                  <p className="text-muted-foreground">{t("createProject.step1Subtitle")}</p>
                </div>
                <div className="flex flex-wrap gap-4">
                  <Button onClick={() => { setStep(2) }} className="rounded-lg bg-[#1173d4] px-6 py-3 font-semibold text-white shadow-lg hover:bg-[#0d5fb0]" style={{ boxShadow: "0 10px 15px -3px rgba(17,115,212,0.25)" }}>
                    {t("createProject.linkAccount")}
                  </Button>
                  <Button variant="outline" onClick={() => setStep(2)} className="rounded-lg border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground">
                    {t("createProject.skipForNow")}
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <div className="animate-in fade-in duration-200">
                <div className="mb-8">
                  <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#1173d4]/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#1173d4]">
                    {t("createProject.stepOf", { current: 2 })}
                  </div>
                  <h3 className="mb-2 text-2xl font-bold text-foreground">{t("createProject.step2Title")}</h3>
                  <p className="text-muted-foreground">{t("createProject.step2Subtitle")}</p>
                </div>
                <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
                  {PROJECT_TYPES.map(({ value, icon: Icon, titleKey, descKey, recommended }) => (
                    <label key={value} className="group relative cursor-pointer">
                      <input type="radio" name="project_type" value={value} checked={projectType === value} onChange={() => setProjectType(value)} className="peer sr-only" />
                      <div className="h-full rounded-xl border-2 border-border bg-muted/60 p-6 transition-all duration-200 hover:border-[#1173d4] hover:bg-card peer-checked:border-[#1173d4] peer-checked:bg-[#1173d4]/10">
                        <div className={`mb-4 flex size-12 items-center justify-center rounded-lg transition-transform group-hover:scale-110 ${value === "startup" ? "bg-orange-500/20 text-orange-400" : value === "research" ? "bg-blue-500/20 text-blue-400" : "bg-purple-500/20 text-purple-400"}`}>
                          <Icon className="h-7 w-7" />
                        </div>
                        <h4 className="mb-2 text-lg font-bold text-foreground">{t(titleKey)}</h4>
                        <p className="mb-4 text-sm leading-relaxed text-muted-foreground">{t(descKey)}</p>
                        <div className={`flex items-center gap-2 text-xs font-medium text-[#1173d4] transition-opacity ${projectType === value ? "opacity-100" : "opacity-0"}`}>
                          <Check className="h-4 w-4" />
                          {recommended ? t("createProject.recommended") : t("createProject.selected")}
                        </div>
                      </div>
                      <div className={`absolute right-4 top-4 text-[#1173d4] transition-opacity ${projectType === value ? "opacity-100" : "opacity-0"}`}>
                        <Check className="h-6 w-6" />
                      </div>
                    </label>
                  ))}
                </div>
                <div className="flex items-center justify-between border-t border-border pt-8">
                  <Button variant="ghost" onClick={() => setStep(1)} className="flex items-center gap-2 rounded-lg px-4 py-2 font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground">
                    <ArrowLeft className="h-[18px] w-[18px]" />
                    {t("createProject.back")}
                  </Button>
                  <Button onClick={() => setStep(3)} className="flex items-center gap-2 rounded-lg bg-[#1173d4] px-8 py-3 font-semibold text-white shadow-lg transition-all hover:scale-[1.02] hover:bg-[#0d5fb0]" style={{ boxShadow: "0 10px 15px -3px rgba(17,115,212,0.25)" }}>
                    {t("createProject.continueToSettings")}
                    <ArrowRight className="h-[18px] w-[18px]" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3 */}
            {step === 3 && (
              <div className="animate-in fade-in duration-200">
                <div className="mb-8">
                  <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#1173d4]/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#1173d4]">
                    {t("createProject.stepOf", { current: 3 })}
                  </div>
                  <h3 className="mb-2 text-2xl font-bold text-foreground">{t("createProject.step3Title")}</h3>
                  <p className="text-muted-foreground">{t("createProject.step3Subtitle")}</p>
                </div>
                <div className="space-y-4 mb-8">
                  <div className="space-y-2">
                    <Label htmlFor="repo-name" className="text-foreground">{t("dashboard.repoName")}</Label>
                    <Input id="repo-name" value={name} onChange={(e) => setName(e.target.value)} placeholder={t("dashboard.repoNamePlaceholder")} required className="rounded-lg border-input bg-background text-foreground placeholder:text-muted-foreground" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="repo-desc" className="text-foreground">{t("dashboard.repoDesc")}</Label>
                    <Textarea id="repo-desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t("dashboard.repoDescPlaceholder")} rows={2} className="rounded-lg border-input bg-background text-foreground placeholder:text-muted-foreground" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground">{t("dashboard.visibility")}</Label>
                    <Select value={visibility} onValueChange={(v) => setVisibility(v as RepoVisibility)}>
                      <SelectTrigger className="rounded-lg border-input bg-background text-foreground">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">{t("common.public")}</SelectItem>
                        <SelectItem value="private">{t("common.private")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center justify-between border-t border-border pt-8">
                  <Button variant="ghost" onClick={() => setStep(2)} className="flex items-center gap-2 rounded-lg px-4 py-2 font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground">
                    <ArrowLeft className="h-[18px] w-[18px]" />
                    {t("createProject.back")}
                  </Button>
                  <Button onClick={handleCreate} disabled={creating || !name.trim()} className="flex items-center gap-2 rounded-lg bg-[#1173d4] px-8 py-3 font-semibold text-white shadow-lg transition-all hover:scale-[1.02] hover:bg-[#0d5fb0] disabled:opacity-50" style={{ boxShadow: "0 10px 15px -3px rgba(17,115,212,0.25)" }}>
                    {creating ? t("common.creating") : t("createProject.createProject")}
                    <ArrowRight className="h-[18px] w-[18px]" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          {t("createProject.needHelp")}{" "}
          <Link to="/docs" className="text-[#1173d4] hover:underline">{t("createProject.readGuidelines")}</Link>{" "}
          {t("createProject.orContactSupport")}
        </p>
      </main>

      <footer className="border-t border-border bg-card py-6">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 px-6 text-sm text-muted-foreground md:flex-row">
          <div>
            <p>{t("createProject.footerCopyright")}</p>
            <p className="mt-1 text-xs">
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
          <div className="flex gap-6">
            <a href="#" className="transition-colors hover:text-foreground" onClick={(e) => e.preventDefault()}>Privacy</a>
            <a href="#" className="transition-colors hover:text-foreground" onClick={(e) => e.preventDefault()}>Terms</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
