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
  HelpCircle,
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

const PRIMARY = "#1173d4"
const PRIMARY_DARK = "#0d5fb0"
const BG_DARK = "#0f172a"
const SURFACE_DARK = "#1e293b"

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
  const [universityLinked, setUniversityLinked] = useState(false)
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
    <div className="flex min-h-screen flex-col font-sans text-slate-100 antialiased" style={{ backgroundColor: BG_DARK }}>
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-[#1e293b]/90 px-6 backdrop-blur-md lg:px-12">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded bg-[#1173d4]/20 text-[#1173d4]">
              <Code2 className="h-5 w-5" />
            </div>
            <h1 className="text-lg font-bold tracking-tight text-white">
              ASCAP <span className="font-normal text-slate-400">Onboarding</span>
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/support" className="text-sm font-medium text-slate-500 transition-colors hover:text-white">
              {t("createProject.helpCenter")}
            </Link>
            <div className="h-6 w-px bg-slate-700" />
            <div className="flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-semibold leading-none text-white">{profile?.displayName || profile?.username || "User"}</p>
                <p className="mt-1 text-xs text-slate-400">New User</p>
              </div>
              <div className="size-9 rounded-full border border-slate-700 bg-slate-800 bg-cover bg-center overflow-hidden">
                {profile?.photoURL ? <img src={profile.photoURL} alt="" className="h-full w-full object-cover" /> : <div className="h-full w-full flex items-center justify-center text-slate-400 text-sm">{(profile?.displayName || profile?.username || "?")[0]}</div>}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-6 py-12 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-black tracking-tight text-white md:text-4xl">
            {t("createProject.welcomeTitle")}
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-slate-400">
            {t("createProject.welcomeSubtitle")}
          </p>
        </div>

        {/* Step indicator */}
        <div className="relative mb-12 w-full max-w-3xl mx-auto">
          <div className="absolute top-1/2 left-0 h-0.5 w-full -translate-y-1/2 bg-slate-700 -z-10" />
          <div
            className="absolute top-1/2 left-0 h-0.5 -translate-y-1/2 -z-10 transition-all duration-500"
            style={{ width: `${progressPercent}%`, backgroundColor: PRIMARY }}
          />
          <div className="flex w-full justify-between">
            <button type="button" onClick={() => setStep(1)} className="flex flex-col items-center gap-2 cursor-pointer group">
              <div className={`flex size-10 items-center justify-center rounded-full font-bold ring-4 ring-[#0f172a] shadow-sm ${step > 1 ? "bg-[#1173d4] text-white" : step === 1 ? "bg-[#1173d4] text-white" : "bg-slate-700 text-slate-400"}`}>
                {step > 1 ? <Check className="h-5 w-5" /> : "1"}
              </div>
              <span className={`text-sm font-semibold ${step >= 1 ? "text-[#1173d4]" : "text-slate-500"}`}>{t("createProject.stepUniversity")}</span>
            </button>
            <button type="button" onClick={() => step >= 2 && setStep(2)} className="flex flex-col items-center gap-2 cursor-pointer group">
              <div className={`relative flex size-10 items-center justify-center rounded-full font-bold ring-4 ring-[#0f172a] shadow-sm z-10 ${step > 2 ? "bg-[#1173d4] text-white" : step === 2 ? "border-2 border-[#1173d4] bg-[#1e293b] text-[#1173d4]" : "bg-slate-700 text-slate-400 opacity-50"}`}>
                {step === 2 && <span className="absolute inset-0 rounded-full bg-[#1173d4]/20 animate-ping" />}
                {step > 2 ? <Check className="h-5 w-5" /> : "2"}
              </div>
              <span className={`text-sm font-semibold ${step >= 2 ? "text-white" : "text-slate-500"}`}>{t("createProject.stepProjectType")}</span>
            </button>
            <button type="button" onClick={() => step >= 3 && setStep(3)} className={`flex flex-col items-center gap-2 cursor-pointer group ${step >= 3 ? "" : "opacity-50"}`}>
              <div className={`flex size-10 items-center justify-center rounded-full font-bold ring-4 ring-[#0f172a] shadow-sm ${step === 3 ? "border-2 border-[#1173d4] bg-[#1e293b] text-[#1173d4]" : "bg-slate-700 text-slate-400"}`}>
                3
              </div>
              <span className={`text-sm font-medium ${step >= 3 ? "text-white" : "text-slate-500"}`}>{t("createProject.stepArchiveSettings")}</span>
            </button>
          </div>
        </div>

        {/* Card */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-[#1e293b] shadow-xl">
          <div className="p-8 md:p-10">
            {/* Step 1 */}
            {step === 1 && (
              <div className="animate-in fade-in duration-200">
                <div className="mb-8">
                  <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#1173d4]/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#1173d4]">
                    {t("createProject.stepOf", { current: 1 })}
                  </div>
                  <h3 className="mb-2 text-2xl font-bold text-white">{t("createProject.step1Title")}</h3>
                  <p className="text-slate-400">{t("createProject.step1Subtitle")}</p>
                </div>
                <div className="flex flex-wrap gap-4">
                  <Button onClick={() => { setUniversityLinked(true); setStep(2) }} className="rounded-lg bg-[#1173d4] px-6 py-3 font-semibold text-white shadow-lg hover:bg-[#0d5fb0]" style={{ boxShadow: "0 10px 15px -3px rgba(17,115,212,0.25)" }}>
                    {t("createProject.linkAccount")}
                  </Button>
                  <Button variant="outline" onClick={() => setStep(2)} className="rounded-lg border-slate-700 text-slate-300 hover:bg-slate-800">
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
                  <h3 className="mb-2 text-2xl font-bold text-white">{t("createProject.step2Title")}</h3>
                  <p className="text-slate-400">{t("createProject.step2Subtitle")}</p>
                </div>
                <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
                  {PROJECT_TYPES.map(({ value, icon: Icon, titleKey, descKey, recommended }) => (
                    <label key={value} className="group relative cursor-pointer">
                      <input type="radio" name="project_type" value={value} checked={projectType === value} onChange={() => setProjectType(value)} className="peer sr-only" />
                      <div className="h-full rounded-xl border-2 border-slate-700 bg-slate-800/50 p-6 transition-all duration-200 hover:border-[#1173d4] hover:bg-[#1e293b] peer-checked:border-[#1173d4] peer-checked:bg-[#1173d4]/10">
                        <div className={`mb-4 flex size-12 items-center justify-center rounded-lg transition-transform group-hover:scale-110 ${value === "startup" ? "bg-orange-500/20 text-orange-400" : value === "research" ? "bg-blue-500/20 text-blue-400" : "bg-purple-500/20 text-purple-400"}`}>
                          <Icon className="h-7 w-7" />
                        </div>
                        <h4 className="mb-2 text-lg font-bold text-white">{t(titleKey)}</h4>
                        <p className="mb-4 text-sm leading-relaxed text-slate-400">{t(descKey)}</p>
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
                <div className="flex items-center justify-between border-t border-slate-800 pt-8">
                  <Button variant="ghost" onClick={() => setStep(1)} className="flex items-center gap-2 rounded-lg px-4 py-2 font-medium text-slate-400 hover:bg-slate-800 hover:text-white">
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
                  <h3 className="mb-2 text-2xl font-bold text-white">{t("createProject.step3Title")}</h3>
                  <p className="text-slate-400">{t("createProject.step3Subtitle")}</p>
                </div>
                <div className="space-y-4 mb-8">
                  <div className="space-y-2">
                    <Label htmlFor="repo-name" className="text-slate-200">{t("dashboard.repoName")}</Label>
                    <Input id="repo-name" value={name} onChange={(e) => setName(e.target.value)} placeholder={t("dashboard.repoNamePlaceholder")} required className="rounded-lg border-slate-700 bg-slate-800/50 text-white placeholder:text-slate-500" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="repo-desc" className="text-slate-200">{t("dashboard.repoDesc")}</Label>
                    <Textarea id="repo-desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t("dashboard.repoDescPlaceholder")} rows={2} className="rounded-lg border-slate-700 bg-slate-800/50 text-white placeholder:text-slate-500" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-200">{t("dashboard.visibility")}</Label>
                    <Select value={visibility} onValueChange={(v) => setVisibility(v as RepoVisibility)}>
                      <SelectTrigger className="rounded-lg border-slate-700 bg-slate-800/50 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">{t("common.public")}</SelectItem>
                        <SelectItem value="private">{t("common.private")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center justify-between border-t border-slate-800 pt-8">
                  <Button variant="ghost" onClick={() => setStep(2)} className="flex items-center gap-2 rounded-lg px-4 py-2 font-medium text-slate-400 hover:bg-slate-800 hover:text-white">
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

        <p className="mt-8 text-center text-sm text-slate-400">
          {t("createProject.needHelp")}{" "}
          <Link to="/docs" className="text-[#1173d4] hover:underline">{t("createProject.readGuidelines")}</Link>{" "}
          {t("createProject.orContactSupport")}
        </p>
      </main>

      <footer className="border-t border-slate-800 bg-[#1e293b] py-6">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 px-6 text-sm text-slate-500 md:flex-row">
          <p>{t("createProject.footerCopyright")}</p>
          <div className="flex gap-6">
            <a href="#" className="transition-colors hover:text-white" onClick={(e) => e.preventDefault()}>Privacy</a>
            <a href="#" className="transition-colors hover:text-white" onClick={(e) => e.preventDefault()}>Terms</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
