import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useAuth } from "@/contexts/AuthContext"
import { Folder, Upload, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function UploadLandingPage() {
  const { t } = useTranslation()
  const { user } = useAuth()

  return (
    <div className="min-h-[60vh] bg-background dark:bg-[#101922] flex flex-col items-center justify-center px-4 py-12">
      <div className="mx-auto flex max-w-lg flex-col items-center gap-6 text-center">
        <div className="flex size-20 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Upload className="h-10 w-10" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white md:text-3xl">
            {t("upload.archiveAndUpload")}
          </h1>
          <p className="text-slate-600 dark:text-[#92adc9]">
            {t("upload.uploadLandingDesc")}
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          {user ? (
            <>
              <Button asChild className="gap-2 shadow-lg shadow-primary/20">
                <Link to="/dashboard">
                  <Folder className="h-4 w-4" />
                  {t("upload.myProjects")}
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/explore">{t("nav.explore")}</Link>
              </Button>
            </>
          ) : (
            <>
              <Button asChild className="gap-2">
                <Link to="/login">
                  {t("nav.login")}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/register">{t("nav.register")}</Link>
              </Button>
            </>
          )}
        </div>
        {user && (
          <p className="text-sm text-slate-500 dark:text-[#92adc9]">
            {t("upload.uploadLandingSteps")}
          </p>
        )}
      </div>
    </div>
  )
}
