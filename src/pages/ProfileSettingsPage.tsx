import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { useAuth } from "@/contexts/AuthContext"
import { useUserProfile } from "@/hooks/useUserProfile"
import { updateUserProfile, isUsernameAvailable } from "@/lib/users"
import {
  User,
  Shield,
  Bell,
  CreditCard,
  Link2,
  Building2,
  MapPin,
  Mail,
  GraduationCap,
  Terminal,
  Save,
  Pencil,
  Key,
  Plus,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"

type TabId = "profile" | "security" | "notifications" | "billing"

const TABS: { id: TabId; labelKey: string; icon: React.ElementType }[] = [
  { id: "profile", labelKey: "profile.profileInformation", icon: User },
  { id: "security", labelKey: "profile.securitySsh", icon: Shield },
  { id: "notifications", labelKey: "profile.notifications", icon: Bell },
  { id: "billing", labelKey: "profile.billing", icon: CreditCard },
]

export function ProfileSettingsPage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const profile = useUserProfile()
  const [activeTab, setActiveTab] = useState<TabId>("profile")

  const [displayName, setDisplayName] = useState("")
  const [username, setUsername] = useState("")
  const [bio, setBio] = useState("")
  const [url, setUrl] = useState("")
  const [company, setCompany] = useState("")
  const [location, setLocation] = useState("")
  const [fullName, setFullName] = useState("")
  const [displayEmailPublic, setDisplayEmailPublic] = useState(false)
  const [showPrivateContributions, setShowPrivateContributions] = useState(true)

  const [notifyRepoUpdates, setNotifyRepoUpdates] = useState(true)
  const [notifySecurityAlerts, setNotifySecurityAlerts] = useState(true)
  const [notifyMarketing, setNotifyMarketing] = useState(false)
  const [notifyInApp, setNotifyInApp] = useState(true)

  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [usernameError, setUsernameError] = useState<string | null>(null)
  const [lastSaved, setLastSaved] = useState<string | null>(null)

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName ?? "")
      setUsername(profile.username ?? "")
      setBio(profile.bio ?? "")
      setFullName(profile.displayName ?? "")
    }
  }, [profile])

  const email = user?.email ?? ""
  const avatarUrl = profile?.photoURL ?? (user as { photoURL?: string } | null)?.photoURL ?? ""

  async function checkUsername() {
    if (!username.trim()) {
      setUsernameError(t("profile.usernameRequired"))
      return false
    }
    const available = await isUsernameAvailable(username.trim(), user?.uid ?? undefined)
    if (!available) {
      setUsernameError(t("profile.usernameTaken"))
      return false
    }
    setUsernameError(null)
    return true
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setMessage(null)
    if (!user) return
    const ok = await checkUsername()
    if (!ok) return
    setSaving(true)
    try {
      await updateUserProfile(user.uid, {
        displayName: displayName.trim() || undefined,
        username: username.trim().toLowerCase(),
        bio: bio.trim() || undefined,
      })
      setMessage({ type: "success", text: t("profile.changesSaved") })
      setLastSaved(t("profile.lastSavedAgo"))
    } catch {
      setMessage({ type: "error", text: t("profile.errorSaving") })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-background dark:bg-[#101922] text-slate-900 dark:text-slate-100">
      <div className="mx-auto flex max-w-[960px] flex-1 flex-col px-4 py-8 sm:px-6 lg:px-8">
        {/* Page header */}
        <div className="mb-8 flex flex-wrap justify-between gap-3">
          <div className="flex min-w-72 flex-col gap-2">
            <h1 className="text-3xl font-bold leading-tight tracking-tight text-slate-900 dark:text-white">
              {t("profile.accountSettings")}
            </h1>
            <p className="text-base font-normal text-slate-500 dark:text-[#92adc9]">
              {t("profile.accountSettingsDesc")}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8 overflow-x-auto">
          <div className="flex min-w-max border-b border-slate-200 dark:border-[#233648]">
            {TABS.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center justify-center border-b-2 px-6 pb-3 pt-2 transition-colors",
                    isActive
                      ? "border-primary text-primary"
                      : "border-transparent text-slate-500 dark:text-[#92adc9] hover:border-slate-300 dark:hover:border-slate-600 hover:text-slate-700 dark:hover:text-slate-300"
                  )}
                >
                  <Icon className="mr-2 h-5 w-5" />
                  <span className={cn("text-sm", isActive ? "font-bold" : "font-medium")}>
                    {t(tab.labelKey)}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        <form id="profile-settings-form" onSubmit={handleSubmit} className="flex flex-col">
          {message && (
            <Alert variant={message.type === "error" ? "destructive" : "default"} className="mb-6">
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          )}

          {activeTab === "profile" && (
            <>
              {/* Profile header card */}
              <div className="mb-8 flex flex-col gap-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-[#233648] dark:bg-[#182635] md:flex-row md:items-center">
                <div className="group relative cursor-pointer">
                  <div
                    className="h-24 w-24 rounded-full bg-cover bg-center ring-4 ring-slate-100 dark:ring-[#233648]/50"
                    style={{
                      backgroundImage: avatarUrl
                        ? `url("${avatarUrl}")`
                        : "none",
                      backgroundColor: avatarUrl ? "transparent" : "var(--muted)",
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                    <Pencil className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="mb-1 text-xl font-bold text-slate-900 dark:text-white">
                    {displayName || user?.displayName || "—"}
                  </h3>
                  <p className="mb-4 text-sm text-slate-500 dark:text-[#92adc9]">
                    {profile?.username ? `@${profile.username}` : ""} • {location || t("profile.locationPlaceholder")}
                  </p>
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="secondary"
                      className="h-9 rounded-lg bg-slate-100 px-4 text-sm font-medium text-slate-700 dark:bg-[#233648] dark:text-white dark:hover:bg-[#233648]/80"
                    >
                      {t("profile.changeAvatar")}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="h-9 rounded-lg border-red-200 px-4 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-900/30 dark:text-red-400 dark:hover:bg-red-900/10"
                    >
                      {t("profile.removeAvatar")}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Form grid */}
              <div className="mb-20 grid grid-cols-1 gap-8 lg:grid-cols-3">
                {/* Left column */}
                <div className="space-y-8 lg:col-span-2">
                  {/* Public Profile */}
                  <div className="space-y-6">
                    <div className="border-b border-slate-200 pb-2 dark:border-[#233648]">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        {t("profile.publicProfile")}
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 gap-6">
                      <div className="block space-y-2">
                        <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                          {t("profile.displayName")}
                        </Label>
                        <Input
                          className="h-11 w-full rounded-lg border-slate-200 bg-white px-4 focus:border-primary focus:ring-primary dark:border-[#233648] dark:bg-[#182635] dark:text-white"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          placeholder={t("profile.displayNamePlaceholder")}
                        />
                        <p className="text-xs text-slate-500 dark:text-[#92adc9]">
                          {t("profile.displayNameHint")}
                        </p>
                      </div>
                      <div className="block space-y-2">
                        <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                          {t("profile.bio")}
                        </Label>
                        <Textarea
                          className="min-h-[120px] w-full resize-y rounded-lg border-slate-200 p-4 focus:border-primary focus:ring-primary dark:border-[#233648] dark:bg-[#182635] dark:text-white"
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          placeholder={t("profile.bioPlaceholder")}
                        />
                        <p className="text-xs text-slate-500 dark:text-[#92adc9]">
                          {t("profile.bioHint")}
                        </p>
                      </div>
                      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div className="block space-y-2">
                          <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                            {t("profile.url")}
                          </Label>
                          <div className="relative flex items-center">
                            <Link2 className="absolute left-4 h-5 w-5 text-slate-400 dark:text-slate-500" />
                            <Input
                              className="h-11 w-full rounded-lg border-slate-200 bg-white pl-11 pr-4 focus:border-primary focus:ring-primary dark:border-[#233648] dark:bg-[#182635] dark:text-white"
                              type="url"
                              value={url}
                              onChange={(e) => setUrl(e.target.value)}
                              placeholder={t("profile.urlPlaceholder")}
                            />
                          </div>
                        </div>
                        <div className="block space-y-2">
                          <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                            {t("profile.company")}
                          </Label>
                          <div className="relative flex items-center">
                            <Building2 className="absolute left-4 h-5 w-5 text-slate-400 dark:text-slate-500" />
                            <Input
                              className="h-11 w-full rounded-lg border-slate-200 bg-white pl-11 pr-4 focus:border-primary focus:ring-primary dark:border-[#233648] dark:bg-[#182635] dark:text-white"
                              value={company}
                              onChange={(e) => setCompany(e.target.value)}
                              placeholder={t("profile.companyPlaceholder")}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="block space-y-2">
                        <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                          {t("profile.location")}
                        </Label>
                        <div className="relative flex items-center">
                          <MapPin className="absolute left-4 h-5 w-5 text-slate-400 dark:text-slate-500" />
                          <Input
                            className="h-11 w-full rounded-lg border-slate-200 bg-white pl-11 pr-4 focus:border-primary focus:ring-primary dark:border-[#233648] dark:bg-[#182635] dark:text-white"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder={t("profile.locationPlaceholder")}
                          />
                        </div>
                      </div>
                      <div className="mt-2 flex items-center gap-3">
                        <Checkbox
                          id="email-public"
                          checked={displayEmailPublic}
                          onCheckedChange={(v) => setDisplayEmailPublic(v === true)}
                          className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary dark:border-slate-600"
                        />
                        <Label
                          htmlFor="email-public"
                          className="text-sm text-slate-700 dark:text-slate-300"
                        >
                          {t("profile.displayEmailPublic")}
                        </Label>
                      </div>
                    </div>
                  </div>

                  {/* Private Information */}
                  <div className="space-y-6 pt-4">
                    <div className="border-b border-slate-200 pb-2 dark:border-[#233648]">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        {t("profile.privateInformation")}
                      </h3>
                      <p className="mt-1 text-sm text-slate-500 dark:text-[#92adc9]">
                        {t("profile.privateInformationDesc")}
                      </p>
                    </div>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <div className="block space-y-2">
                        <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                          {t("profile.fullName")}
                        </Label>
                        <Input
                          className="h-11 w-full rounded-lg border-slate-200 bg-white px-4 focus:border-primary focus:ring-primary dark:border-[#233648] dark:bg-[#182635] dark:text-white"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                        />
                      </div>
                      <div className="block space-y-2">
                        <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                          {t("profile.emailAddress")}
                        </Label>
                        <div className="relative flex items-center">
                          <Mail className="absolute left-4 h-5 w-5 text-slate-400 dark:text-slate-500" />
                          <Input
                            className="h-11 w-full rounded-lg border-slate-200 bg-white pl-11 pr-16 focus:border-primary focus:ring-primary dark:border-[#233648] dark:bg-[#182635] dark:text-white"
                            type="email"
                            value={email}
                            disabled
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            className="absolute right-2 text-xs font-bold text-primary hover:text-primary/80"
                          >
                            {t("profile.changeEmail")}
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className="block space-y-2">
                      <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        {t("profile.username")}
                      </Label>
                      <Input
                        className="h-11 w-full rounded-lg border-slate-200 bg-white px-4 font-mono focus:border-primary focus:ring-primary dark:border-[#233648] dark:bg-[#182635] dark:text-white"
                        value={username}
                        onChange={(e) => {
                          setUsername(e.target.value)
                          setUsernameError(null)
                        }}
                        onBlur={checkUsername}
                        placeholder={t("profile.usernamePlaceholder")}
                      />
                      {usernameError && (
                        <p className="text-sm text-destructive">{usernameError}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right column sidebar */}
                <div className="space-y-6 lg:col-span-1">
                  <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-[#233648] dark:bg-[#182635]">
                    <h4 className="mb-4 flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                      <GraduationCap className="h-5 w-5 text-primary" />
                      {t("profile.academicStatus")}
                    </h4>
                    <p className="mb-4 text-sm text-slate-500 dark:text-[#92adc9]">
                      {t("profile.academicStatusDesc")}
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full rounded-lg border-slate-300 py-2 text-sm font-medium text-slate-700 dark:border-[#233648] dark:text-slate-300 dark:hover:bg-[#233648]/50"
                    >
                      {t("profile.verifyStatus")}
                    </Button>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-[#233648] dark:bg-[#182635]">
                    <h4 className="mb-4 flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                      <Terminal className="h-5 w-5 text-green-500" />
                      {t("profile.contributionGraph")}
                    </h4>
                    <div className="mb-4 flex items-center gap-3">
                      <div className="h-4 w-4 rounded-sm bg-green-500" />
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        {t("profile.showPrivateContributions")}
                      </span>
                      <div className="ml-auto">
                        <Checkbox
                          checked={showPrivateContributions}
                          onCheckedChange={(v) => setShowPrivateContributions(v === true)}
                          className="h-4 w-4 rounded border-slate-300 text-green-500 focus:ring-green-500 dark:border-slate-600"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-[#92adc9]">
                      {t("profile.contributionGraphDesc")}
                    </p>
                  </div>
                  <div className="rounded-xl border border-red-100 bg-red-50 p-6 dark:border-red-900/30 dark:bg-red-900/10">
                    <h4 className="mb-2 font-bold text-red-800 dark:text-red-400">
                      {t("profile.deleteAccount")}
                    </h4>
                    <p className="mb-4 text-sm text-red-600 dark:text-red-400/80">
                      {t("profile.deleteAccountDesc")}
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full rounded-lg border-red-200 py-2 text-sm font-bold text-red-600 hover:bg-red-50 dark:border-red-900/30 dark:text-red-500 dark:hover:bg-red-900/20"
                    >
                      {t("profile.deleteAccountButton")}
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Security & SSH Keys tab */}
          {activeTab === "security" && (
            <div className="mb-20 grid grid-cols-1 gap-8 lg:grid-cols-3">
              <div className="space-y-8 lg:col-span-2">
                <div className="space-y-6">
                  <div className="border-b border-slate-200 pb-2 dark:border-[#233648]">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      {t("profile.securityPassword")}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500 dark:text-[#92adc9]">
                      {t("profile.securityPasswordDesc")}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 gap-6">
                    <div className="block space-y-2">
                      <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        {t("profile.securityCurrentPassword")}
                      </Label>
                      <Input
                        type="password"
                        className="h-11 w-full rounded-lg border-slate-200 bg-white px-4 focus:border-primary focus:ring-primary dark:border-[#233648] dark:bg-[#182635] dark:text-white"
                        placeholder="••••••••"
                      />
                    </div>
                    <div className="block space-y-2">
                      <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        {t("profile.securityNewPassword")}
                      </Label>
                      <Input
                        type="password"
                        className="h-11 w-full rounded-lg border-slate-200 bg-white px-4 focus:border-primary focus:ring-primary dark:border-[#233648] dark:bg-[#182635] dark:text-white"
                        placeholder="••••••••"
                      />
                    </div>
                    <div className="block space-y-2">
                      <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        {t("profile.securityConfirmPassword")}
                      </Label>
                      <Input
                        type="password"
                        className="h-11 w-full rounded-lg border-slate-200 bg-white px-4 focus:border-primary focus:ring-primary dark:border-[#233648] dark:bg-[#182635] dark:text-white"
                        placeholder="••••••••"
                      />
                    </div>
                    <Button
                      type="button"
                      className="h-9 rounded-lg bg-primary px-4 text-sm font-medium text-white hover:bg-primary/90"
                    >
                      {t("profile.securityChangePassword")}
                    </Button>
                  </div>
                </div>
                <div className="space-y-6 pt-4">
                  <div className="border-b border-slate-200 pb-2 dark:border-[#233648]">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      {t("profile.securityTwoFactor")}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500 dark:text-[#92adc9]">
                      {t("profile.securityTwoFactorDesc")}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-lg border-slate-300 py-2 text-sm font-medium dark:border-[#233648] dark:text-slate-300 dark:hover:bg-[#233648]/50"
                  >
                    {t("profile.securityTwoFactorEnable")}
                  </Button>
                </div>
                <div className="space-y-6 pt-4">
                  <div className="border-b border-slate-200 pb-2 dark:border-[#233648]">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      {t("profile.securitySshKeys")}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500 dark:text-[#92adc9]">
                      {t("profile.securitySshKeysDesc")}
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-[#233648] dark:bg-[#182635]">
                    <p className="mb-4 text-sm text-slate-500 dark:text-[#92adc9]">
                      {t("profile.securitySshKeysEmpty")}
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      className="flex items-center gap-2 rounded-lg border-slate-300 py-2 text-sm dark:border-[#233648] dark:text-slate-300"
                    >
                      <Plus className="h-4 w-4" />
                      {t("profile.securitySshKeysAdd")}
                    </Button>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-1">
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-[#233648] dark:bg-[#182635]">
                  <h4 className="mb-4 flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                    <Key className="h-5 w-5 text-primary" />
                    {t("profile.securitySshKeys")}
                  </h4>
                  <p className="text-sm text-slate-500 dark:text-[#92adc9]">
                    {t("profile.securitySshKeysDesc")}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Notifications tab */}
          {activeTab === "notifications" && (
            <div className="mb-20 grid grid-cols-1 gap-8 lg:grid-cols-3">
              <div className="space-y-8 lg:col-span-2">
                <div className="space-y-6">
                  <div className="border-b border-slate-200 pb-2 dark:border-[#233648]">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      {t("profile.notificationsEmail")}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500 dark:text-[#92adc9]">
                      {t("profile.notificationsEmailDesc")}
                    </p>
                  </div>
                  <div className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 dark:border-[#233648] dark:bg-[#182635]">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                          {t("profile.notificationsRepoUpdates")}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500 dark:text-[#92adc9]">
                          {t("profile.notificationsRepoUpdatesDesc")}
                        </p>
                      </div>
                      <Checkbox
                        checked={notifyRepoUpdates}
                        onCheckedChange={(v) => setNotifyRepoUpdates(v === true)}
                        className="h-4 w-4 rounded border-slate-300 text-primary dark:border-slate-600"
                      />
                    </div>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                          {t("profile.notificationsSecurityAlerts")}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500 dark:text-[#92adc9]">
                          {t("profile.notificationsSecurityAlertsDesc")}
                        </p>
                      </div>
                      <Checkbox
                        checked={notifySecurityAlerts}
                        onCheckedChange={(v) => setNotifySecurityAlerts(v === true)}
                        className="h-4 w-4 rounded border-slate-300 text-primary dark:border-slate-600"
                      />
                    </div>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                          {t("profile.notificationsMarketing")}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500 dark:text-[#92adc9]">
                          {t("profile.notificationsMarketingDesc")}
                        </p>
                      </div>
                      <Checkbox
                        checked={notifyMarketing}
                        onCheckedChange={(v) => setNotifyMarketing(v === true)}
                        className="h-4 w-4 rounded border-slate-300 text-primary dark:border-slate-600"
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-6 pt-4">
                  <div className="border-b border-slate-200 pb-2 dark:border-[#233648]">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      {t("profile.notificationsInApp")}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500 dark:text-[#92adc9]">
                      {t("profile.notificationsInAppDesc")}
                    </p>
                  </div>
                  <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 dark:border-[#233648] dark:bg-[#182635]">
                    <span className="text-sm text-slate-900 dark:text-white">
                      {t("profile.notificationsInApp")}
                    </span>
                    <Checkbox
                      checked={notifyInApp}
                      onCheckedChange={(v) => setNotifyInApp(v === true)}
                      className="h-4 w-4 rounded border-slate-300 text-primary dark:border-slate-600"
                    />
                  </div>
                </div>
              </div>
              <div className="lg:col-span-1">
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-[#233648] dark:bg-[#182635]">
                  <h4 className="mb-4 flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                    <Bell className="h-5 w-5 text-primary" />
                    {t("profile.notifications")}
                  </h4>
                  <p className="text-sm text-slate-500 dark:text-[#92adc9]">
                    {t("profile.notificationsEmailDesc")}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Billing tab */}
          {activeTab === "billing" && (
            <div className="mb-20 grid grid-cols-1 gap-8 lg:grid-cols-3">
              <div className="space-y-8 lg:col-span-2">
                <div className="space-y-6">
                  <div className="border-b border-slate-200 pb-2 dark:border-[#233648]">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      {t("profile.billingPlan")}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500 dark:text-[#92adc9]">
                      {t("profile.billingPlanDesc")}
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-[#233648] dark:bg-[#182635]">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {t("profile.billingPlanFree")}
                        </p>
                        <p className="mt-1 text-sm text-slate-500 dark:text-[#92adc9]">
                          {t("profile.billingPlanDesc")}
                        </p>
                      </div>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700 dark:bg-[#233648] dark:text-slate-300">
                        {t("profile.billingPlanFree")}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="space-y-6 pt-4">
                  <div className="border-b border-slate-200 pb-2 dark:border-[#233648]">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      {t("profile.billingPaymentMethod")}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500 dark:text-[#92adc9]">
                      {t("profile.billingPaymentMethodDesc")}
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-[#233648] dark:bg-[#182635]">
                    <p className="mb-4 text-sm text-slate-500 dark:text-[#92adc9]">
                      {t("profile.billingPaymentMethodNone")}
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      className="rounded-lg border-slate-300 py-2 text-sm dark:border-[#233648] dark:text-slate-300 dark:hover:bg-[#233648]/50"
                    >
                      {t("profile.billingAddPayment")}
                    </Button>
                  </div>
                </div>
                <div className="space-y-6 pt-4">
                  <div className="border-b border-slate-200 pb-2 dark:border-[#233648]">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      {t("profile.billingHistory")}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500 dark:text-[#92adc9]">
                      {t("profile.billingHistoryDesc")}
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-[#233648] dark:bg-[#182635]">
                    <p className="text-sm text-slate-500 dark:text-[#92adc9]">
                      {t("profile.billingHistoryEmpty")}
                    </p>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-1">
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-[#233648] dark:bg-[#182635]">
                  <h4 className="mb-4 flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                    <CreditCard className="h-5 w-5 text-primary" />
                    {t("profile.billing")}
                  </h4>
                  <p className="text-sm text-slate-500 dark:text-[#92adc9]">
                    {t("profile.billingPaymentMethodDesc")}
                  </p>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>

      {/* Sticky footer */}
      <div className="sticky bottom-0 z-40 w-full border-t border-slate-200 bg-white py-4 dark:border-[#233648] dark:bg-[#182635]">
        <div className="mx-auto flex w-full max-w-[960px] items-center justify-between px-4 sm:px-10">
          <span className="hidden text-sm text-slate-500 dark:text-[#92adc9] sm:inline-block">
            {lastSaved ? t("profile.lastSaved", { time: lastSaved }) : ""}
          </span>
          <div className="ml-auto flex gap-4">
            <Button
              type="button"
              variant="ghost"
              className="rounded-lg px-6 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-[#233648]"
            >
              {t("common.cancel")}
            </Button>
            {activeTab === "profile" ? (
              <Button
                type="submit"
                form="profile-settings-form"
                disabled={saving}
                className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-primary/20 transition-all hover:bg-primary/90"
              >
                <Save className="h-[18px] w-[18px]" />
                {saving ? t("common.saving") : t("profile.saveChanges")}
              </Button>
            ) : (
              <Button
                type="button"
                onClick={() => {
                  setMessage({ type: "success", text: t("profile.changesSaved") })
                  setLastSaved(t("profile.lastSavedAgo"))
                }}
                className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-primary/20 transition-all hover:bg-primary/90"
              >
                <Save className="h-[18px] w-[18px]" />
                {t("profile.saveChanges")}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
