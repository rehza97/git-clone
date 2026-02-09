import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useUserProfile } from "@/hooks/useUserProfile"
import { updateUserProfile, isUsernameAvailable } from "@/lib/users"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function ProfileSettingsPage() {
  const { user } = useAuth()
  const profile = useUserProfile()
  const [displayName, setDisplayName] = useState("")
  const [username, setUsername] = useState("")
  const [bio, setBio] = useState("")
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [usernameError, setUsernameError] = useState<string | null>(null)

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName ?? "")
      setUsername(profile.username ?? "")
      setBio(profile.bio ?? "")
    }
  }, [profile])

  async function checkUsername() {
    if (!username.trim()) {
      setUsernameError("اسم المستخدم مطلوب.")
      return false
    }
    const available = await isUsernameAvailable(username.trim(), user?.uid ?? undefined)
    if (!available) {
      setUsernameError("اسم المستخدم مستخدم مسبقاً.")
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
      setMessage({ type: "success", text: "تم حفظ التغييرات." })
    } catch {
      setMessage({ type: "error", text: "حدث خطأ أثناء الحفظ." })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="container mx-auto max-w-md px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">الإعدادات</h1>
      <form className="space-y-4" onSubmit={handleSubmit}>
        {message && (
          <Alert variant={message.type === "error" ? "destructive" : "default"}>
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}
        <div className="space-y-2">
          <Label htmlFor="displayName">الاسم المعروض</Label>
          <Input
            id="displayName"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="الاسم المعروض"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="username">اسم المستخدم (في الرابط)</Label>
          <Input
            id="username"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value)
              setUsernameError(null)
            }}
            onBlur={checkUsername}
            placeholder="username"
            className="font-mono"
          />
          {usernameError && (
            <p className="text-destructive text-sm">{usernameError}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="bio">نبذة</Label>
          <Textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="نبذة قصيرة عنك"
            rows={3}
          />
        </div>
        <Button type="submit" disabled={saving}>
          {saving ? "جاري الحفظ..." : "حفظ"}
        </Button>
      </form>
    </div>
  )
}
