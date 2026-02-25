import { Link, useParams, useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"
import { useRepo } from "@/hooks/useRepo"
import { getUserProfile } from "@/lib/users"
import { useEffect, useState } from "react"
import type { UserProfile } from "@/types/schema"

export function CertificatePage() {
  const { t } = useTranslation()
  const { repoId } = useParams<{ repoId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { repo, loading, error } = useRepo(repoId)
  const [ownerProfile, setOwnerProfile] = useState<UserProfile | null>(null)

  useEffect(() => {
    if (!repo?.ownerId) return
    getUserProfile(repo.ownerId).then(setOwnerProfile).catch(() => setOwnerProfile(null))
  }, [repo?.ownerId])

  useEffect(() => {
    if (repo && repo.visibility === "private" && user?.uid !== repo.ownerId) {
      navigate("/login")
    }
  }, [repo, user?.uid, navigate])

  if (loading || !repoId) {
    return (
      <div className="container mx-auto px-4 py-8 print:hidden">
        <p className="text-muted-foreground">{t("certificate.loading")}</p>
      </div>
    )
  }
  if (error || !repo) {
    return (
      <div className="container mx-auto px-4 py-8 print:hidden">
        <p className="text-destructive">{t("certificate.repoNotFound")}</p>
        <Button variant="link" asChild><Link to="/">{t("common.backToHome")}</Link></Button>
      </div>
    )
  }

  const ownerName = ownerProfile?.displayName || ownerProfile?.username || "—"
  const snapshotDate = new Date().toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })

  return (
    <div className="min-h-svh">
      <div className="container mx-auto px-4 py-8 max-w-2xl print:py-4">
        <div className="print:hidden flex items-center justify-between mb-6">
          <Button variant="outline" size="sm" asChild>
            <Link to={`/repo/${repoId}`}>{t("certificate.backToRepo")}</Link>
          </Button>
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            {t("certificate.print")}
          </Button>
        </div>

        <article className="rounded-xl border border-border bg-card p-8 md:p-12 print:border print:shadow-none print:bg-white print:text-black">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-primary mb-1">{t("footer.appName")}</h1>
            <p className="text-sm text-muted-foreground">{t("certificate.title")}</p>
          </div>

          <div className="border-t border-b border-border py-6 space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("certificate.repository")}</p>
              <p className="text-xl font-bold">{repo.name}</p>
            </div>
            {repo.description && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("certificate.description")}</p>
                <p className="text-sm">{repo.description}</p>
              </div>
            )}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("certificate.owner")}</p>
              <p className="font-medium">{ownerName}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("certificate.snapshotDate")}</p>
              <p className="font-medium">{snapshotDate}</p>
            </div>
          </div>

          <div className="mt-8 p-4 bg-muted/30 rounded-lg print:bg-gray-100">
            <p className="text-sm leading-relaxed">
              {t("certificate.certifyText")}
            </p>
          </div>

          <p className="mt-8 text-center text-xs text-muted-foreground print:text-gray-600">
            {t("certificate.footerTagline")}
          </p>
        </article>
      </div>
    </div>
  )
}
