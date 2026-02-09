import { Outlet, NavLink } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"
import { useUserProfile } from "@/hooks/useUserProfile"

export function RootLayout() {
  const { user, loading, signOut } = useAuth()
  const profile = useUserProfile()

  return (
    <div className="min-h-svh flex flex-col">
      <header
        className="border-b border-border shadow-sm"
        style={{ backgroundColor: "var(--header-bg)", color: "var(--header-fg)" }}
      >
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <NavLink to="/" className="text-lg font-semibold hover:opacity-90">
            مستضيف الأكواد
          </NavLink>
          <nav className="flex items-center gap-2">
            <NavLink to="/explore">
              {({ isActive }) => (
                <Button variant={isActive ? "secondary" : "ghost"} size="sm">
                  استكشف
                </Button>
              )}
            </NavLink>
            <NavLink to="/users">
              {({ isActive }) => (
                <Button variant={isActive ? "secondary" : "ghost"} size="sm">
                  المستخدمون
                </Button>
              )}
            </NavLink>
            {!loading &&
              (user ? (
                <>
                  <NavLink to="/dashboard">
                    {({ isActive }) => (
                      <Button variant={isActive ? "secondary" : "ghost"} size="sm">
                        لوحة التحكم
                      </Button>
                    )}
                  </NavLink>
                  <NavLink to="/profile">
                    {({ isActive }) => (
                      <Button variant={isActive ? "secondary" : "ghost"} size="sm">
                        الإعدادات
                      </Button>
                    )}
                  </NavLink>
                  {profile?.username && (
                    <span className="text-sm opacity-80">@{profile.username}</span>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => signOut()}>
                    خروج
                  </Button>
                </>
              ) : (
                <>
                  <NavLink to="/login">
                    {({ isActive }) => (
                      <Button variant={isActive ? "secondary" : "ghost"} size="sm">
                        تسجيل الدخول
                      </Button>
                    )}
                  </NavLink>
                  <NavLink to="/register">
                    <Button size="sm" variant="default">إنشاء حساب</Button>
                  </NavLink>
                </>
              ))}
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}
