import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function LandingPage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="border-b border-border bg-muted/30 py-16 md:py-20">
        <div className="container mx-auto flex flex-col items-center gap-8 px-4 text-center">
          <h1 className="text-4xl font-bold text-foreground md:text-5xl">
            مستضيف الأكواد
          </h1>
          <p className="max-w-lg text-lg text-muted-foreground">
            انشر مشاريعك وشارك الكود مع الآخرين في مكان واحد.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button asChild size="lg">
              <Link to="/explore">استكشف</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/login">تسجيل الدخول</Link>
            </Button>
            <Button variant="secondary" size="lg" asChild>
              <Link to="/register">إنشاء حساب</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* What it is */}
      <section className="container mx-auto max-w-2xl px-4 py-12">
        <h2 className="mb-4 text-2xl font-bold text-foreground">ما هو مستضيف الأكواد؟</h2>
        <p className="text-muted-foreground leading-relaxed">
          منصة شبيهة بـ GitHub تستضيف كودك وتُظهره للآخرين. أنشئ مستودعات عامة أو خاصة، ارفع ملفاتك ومجلداتك، واستعرض الكود مع تلوين الصياغة. يمكنك استكشاف مستودعات المستخدمين الآخرين والبحث عنها، أو مشاركة رابط مستودعك بعد جعله عاماً.
        </p>
      </section>

      {/* Features */}
      <section className="border-t border-border bg-muted/20 py-12">
        <div className="container mx-auto px-4">
          <h2 className="mb-8 text-center text-2xl font-bold text-foreground">
            المميزات
          </h2>
          <ul className="mx-auto grid max-w-4xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <li>
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardHeader>
                  <CardTitle className="text-base">مستودعات عامة وخاصة</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground">
                    اختر أن يكون المستودع مرئياً للجميع أو لك فقط.
                  </p>
                </CardContent>
              </Card>
            </li>
            <li>
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardHeader>
                  <CardTitle className="text-base">رفع ملفات ومجلدات</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground">
                    ارفع أي لغة برمجة؛ يتم استبعاد node_modules و .env تلقائياً.
                  </p>
                </CardContent>
              </Card>
            </li>
            <li>
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardHeader>
                  <CardTitle className="text-base">تلوين الصياغة</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground">
                    عرض الكود مع تمييز بناء الجملة لعدة لغات.
                  </p>
                </CardContent>
              </Card>
            </li>
            <li>
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardHeader>
                  <CardTitle className="text-base">استكشف والبحث</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground">
                    تصفح المستودعات العامة والبحث بالاسم أو الوصف.
                  </p>
                </CardContent>
              </Card>
            </li>
            <li>
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardHeader>
                  <CardTitle className="text-base">ملف شخصي عام</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground">
                    صفحة عامة لكل مستخدم تعرض مستودعاته العامة.
                  </p>
                </CardContent>
              </Card>
            </li>
            <li>
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardHeader>
                  <CardTitle className="text-base">README وشجرة الملفات</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground">
                    عرض README وشجرة المجلدات مع روابط للعرض الخام والتنزيل.
                  </p>
                </CardContent>
              </Card>
            </li>
          </ul>
        </div>
      </section>

      {/* How it works */}
      <section className="container mx-auto max-w-2xl px-4 py-12">
        <h2 className="mb-6 text-2xl font-bold text-foreground">كيف تبدأ؟</h2>
        <ol className="space-y-4 text-muted-foreground">
          <li className="flex gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
              1
            </span>
            <span>إنشاء حساب ثم تسجيل الدخول.</span>
          </li>
          <li className="flex gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
              2
            </span>
            <span>من لوحة التحكم أنشئ مستودعاً وارفع ملفاتك أو مجلداتك.</span>
          </li>
          <li className="flex gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
              3
            </span>
            <span>شارك الرابط أو اجعل المستودع عاماً ليظهر في الاستكشف.</span>
          </li>
        </ol>
      </section>

      {/* Tech */}
      <section className="border-t border-border py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            مبني بـ React و Firebase (المصادقة، Firestore، التخزين).
          </p>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="border-t border-border bg-muted/30 py-12">
        <div className="container mx-auto flex flex-col items-center gap-4 px-4 text-center">
          <p className="text-muted-foreground">
            جاهز لمشاركة كودك؟
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button asChild size="lg">
              <Link to="/explore">استكشف المستودعات</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/register">إنشاء حساب</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
