import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function InstitutionsPage() {
  const { t } = useTranslation()
  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-2">{t("institutions.title")}</h1>
      <p className="text-muted-foreground mb-8">
        {t("institutions.subtitle")}
      </p>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">{t("institutions.eduTitle")}</h2>
          </CardHeader>
          <CardContent className="text-muted-foreground text-sm space-y-2">
            <p>{t("institutions.eduDesc")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">{t("institutions.apiTitle")}</h2>
          </CardHeader>
          <CardContent className="text-muted-foreground text-sm space-y-2">
            <p>{t("institutions.apiDesc")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">{t("institutions.trainingTitle")}</h2>
          </CardHeader>
          <CardContent className="text-muted-foreground text-sm space-y-2">
            <p>{t("institutions.trainingDesc")}</p>
          </CardContent>
        </Card>
        <div className="flex gap-4 pt-4">
          <Button asChild>
            <Link to="/support">{t("institutions.contactPartnership")}</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/training">{t("institutions.trainingLink")}</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
