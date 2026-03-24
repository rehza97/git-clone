import { useState } from "react"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import {
  ChevronRight,
  CheckCheck,
  Settings,
  Search,
  Package,
  Shield,
  MessageSquareQuote,
  Award,
  Cloud,
  CheckCircle,
  Trash2,
  MessageCircle,
  ChevronLeft,
  ArrowRight,
  Download,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"


type FilterId = "all" | "unread" | "archives" | "security" | "mentions"

interface NotificationItem {
  id: string
  section: "today" | "yesterday"
  read: boolean
  timeLabel: string
  titleKey: string
  bodyKey: string
  bodyParams?: Record<string, string>
  actionLabelKey?: string
  actionHref?: string
  leftBorder: "primary" | "amber" | "blue" | "none"
  icon: "emerald" | "amber" | "blue" | "purple" | "slate"
}

const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "1",
    section: "today",
    read: false,
    timeLabel: "2 hours ago",
    titleKey: "notificationsPage.projectArchivedTitle",
    bodyKey: "notificationsPage.projectArchivedBody",
    bodyParams: { name: "AI Traffic Control System" },
    actionLabelKey: "notificationsPage.viewCertificate",
    actionHref: "/certificates",
    leftBorder: "primary",
    icon: "emerald",
  },
  {
    id: "2",
    section: "today",
    read: false,
    timeLabel: "5 hours ago",
    titleKey: "notificationsPage.vulnerabilityTitle",
    bodyKey: "notificationsPage.vulnerabilityBody",
    bodyParams: { package: "lodash 4.17.15", project: "Smart Irrigation API" },
    actionLabelKey: "notificationsPage.viewDetails",
    leftBorder: "amber",
    icon: "amber",
  },
  {
    id: "3",
    section: "today",
    read: false,
    timeLabel: "8 hours ago",
    titleKey: "notificationsPage.reviewerFeedbackTitle",
    bodyKey: "notificationsPage.reviewerFeedbackBody",
    bodyParams: { user: "@karim_dev", project: "Distributed Ledger Algier", comment: "Please update the README to comply with Decision 1275 section 3..." },
    leftBorder: "blue",
    icon: "blue",
  },
  {
    id: "4",
    section: "yesterday",
    read: true,
    timeLabel: "Oct 23, 10:30 AM",
    titleKey: "notificationsPage.certificateGeneratedTitle",
    bodyKey: "notificationsPage.certificateGeneratedBody",
    bodyParams: { name: "Smart Home IoT", ref: "ASCAP-2023-892" },
    actionLabelKey: "notificationsPage.downloadPdf",
    leftBorder: "none",
    icon: "purple",
  },
  {
    id: "5",
    section: "yesterday",
    read: true,
    timeLabel: "Oct 23, 09:00 AM",
    titleKey: "notificationsPage.maintenanceTitle",
    bodyKey: "notificationsPage.maintenanceBody",
    leftBorder: "none",
    icon: "slate",
  },
]

export function NotificationsPage() {
  const { t } = useTranslation()
  const [filter, setFilter] = useState<FilterId>("all")
  const [search, setSearch] = useState("")
  const [items, setItems] = useState(MOCK_NOTIFICATIONS)
  const [, setPage] = useState(1)

  const unreadCount = items.filter((n) => !n.read).length

  function markAsRead(id: string) {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }
  function markAsUnread(id: string) {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: false } : n)))
  }
  function remove(id: string) {
    setItems((prev) => prev.filter((n) => n.id !== id))
  }
  function markAllAsRead() {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const borderClass = (leftBorder: NotificationItem["leftBorder"]) =>
    leftBorder === "primary"
      ? "border-l-[#1173d4]"
      : leftBorder === "amber"
        ? "border-l-amber-500"
        : leftBorder === "blue"
          ? "border-l-blue-500"
          : ""

  const iconConfig = (icon: NotificationItem["icon"]) => {
    switch (icon) {
      case "emerald":
        return { bg: "bg-emerald-100 dark:bg-emerald-900/30", text: "text-emerald-600 dark:text-emerald-400", dot: "bg-emerald-500", Icon: Package }
      case "amber":
        return { bg: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-600 dark:text-amber-400", dot: "bg-amber-500", Icon: Shield }
      case "blue":
        return { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-600 dark:text-blue-400", dot: "bg-blue-500", Icon: MessageSquareQuote }
      case "purple":
        return { bg: "bg-purple-100 dark:bg-purple-900/20", text: "text-purple-600 dark:text-purple-400", dot: "", Icon: Award }
      default:
        return { bg: "bg-slate-200 dark:bg-slate-700", text: "text-slate-600 dark:text-slate-300", dot: "", Icon: Cloud }
    }
  }

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-8 lg:px-12 bg-background text-foreground">
      {/* Breadcrumb + Title */}
      <section className="mb-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/dashboard" className="hover:text-[#1173d4]">
              {t("nav.dashboard")}
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="font-medium text-white">{t("notificationsPage.title")}</span>
          </div>
          <h2 className="mb-2 text-3xl font-black tracking-tight text-white">
            {t("notificationsPage.title")}
          </h2>
          <p className="text-lg text-muted-foreground">
            {t("notificationsPage.subtitle")}
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex items-center gap-2 rounded-lg border-slate-700 bg-[#1a2634] px-4 py-2.5 text-sm font-medium text-slate-200 shadow-sm hover:bg-slate-800"
            onClick={markAllAsRead}
          >
            <CheckCheck className="h-[18px] w-[18px]" />
            {t("notificationsPage.markAllAsRead")}
          </Button>
          <Link to="/profile">
            <Button
              variant="outline"
              className="flex items-center gap-2 rounded-lg border-slate-700 bg-[#1a2634] px-4 py-2.5 text-sm font-medium text-slate-200 shadow-sm hover:bg-slate-800"
            >
              <Settings className="h-[18px] w-[18px]" />
              {t("notificationsPage.settings")}
            </Button>
          </Link>
        </div>
      </section>

      {/* Filters + Search */}
      <div className="mb-6 flex flex-col gap-4 p-1 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex w-full items-center gap-2 overflow-x-auto pb-2 sm:w-auto sm:pb-0">
          {(["all", "unread", "archives", "security", "mentions"] as const).map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => setFilter(id)}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                filter === id
                  ? "bg-[#1173d4] text-white shadow-sm"
                  : "bg-slate-800 text-slate-400 hover:bg-slate-700"
              }`}
            >
              {id === "all" && t("notificationsPage.allActivity")}
              {id === "unread" && (
                <>
                  {t("notificationsPage.unread")}
                  <span className="ml-1 rounded-md bg-slate-700 px-1.5 py-0.5 text-xs">{unreadCount}</span>
                </>
              )}
              {id === "archives" && t("notificationsPage.archives")}
              {id === "security" && t("notificationsPage.security")}
              {id === "mentions" && t("notificationsPage.mentions")}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("notificationsPage.searchPlaceholder")}
            className="w-full rounded-lg border-slate-700 bg-[#1a2634] pl-10 pr-4 py-2 text-sm text-white placeholder:text-slate-500 focus:border-[#1173d4] focus:ring-2 focus:ring-[#1173d4]/50"
          />
        </div>
      </div>

      {/* Today */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="h-px flex-1 bg-slate-800" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{t("notificationsPage.today")}</span>
          <div className="h-px flex-1 bg-slate-800" />
        </div>

        {items.filter((n) => n.section === "today").map((n) => {
          const { bg, text, dot, Icon } = iconConfig(n.icon)
          return (
            <div
              key={n.id}
              className={`group relative flex gap-4 rounded-xl border border-slate-800 border-l-4 p-5 shadow-sm transition-all hover:shadow-md ${borderClass(n.leftBorder)} bg-[#1a2634]`}
            >
              <div className="absolute right-4 top-4 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                {n.read ? (
                  <button type="button" onClick={() => markAsUnread(n.id)} className="p-1 text-slate-400 hover:text-[#1173d4]" title={t("notificationsPage.markAsUnread")}>
                    <MessageCircle className="h-[18px] w-[18px]" />
                  </button>
                ) : (
                  <button type="button" onClick={() => markAsRead(n.id)} className="p-1 text-slate-400 hover:text-[#1173d4]" title={t("notificationsPage.markAsRead")}>
                    <CheckCircle className="h-[18px] w-[18px]" />
                  </button>
                )}
                <button type="button" onClick={() => remove(n.id)} className="p-1 text-slate-400 hover:text-red-500" title={t("notificationsPage.delete")}>
                  <Trash2 className="h-[18px] w-[18px]" />
                </button>
              </div>
              <div className="relative">
                <div className={`flex size-10 shrink-0 items-center justify-center rounded-full ${bg} ${text}`}>
                  <Icon className="h-5 w-5" />
                </div>
                {dot && !n.read && (
                  <span className="absolute -bottom-1 -right-1 flex size-4 items-center justify-center rounded-full bg-[#1a2634]">
                    <span className={`size-2.5 rounded-full border border-[#1a2634] ${dot}`} />
                  </span>
                )}
              </div>
              <div className="flex-1 pr-12">
                <div className="mb-1 flex items-baseline justify-between">
                  <h4 className="text-sm font-bold text-white">{t(n.titleKey)}</h4>
                  <span className="text-xs font-medium text-slate-500">{n.timeLabel}</span>
                </div>
                <p className="mb-2 text-sm text-slate-400">
                  {t(n.bodyKey, n.bodyParams ?? {})}
                </p>
                {n.actionLabelKey && (
                  <div className="flex gap-2">
                    {n.actionHref ? (
                      <Link to={n.actionHref} className="flex items-center gap-1 text-xs font-semibold text-[#1173d4] hover:opacity-80">
                        {t(n.actionLabelKey)}
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    ) : (
                      <button type="button" className="flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-white">
                        {t(n.actionLabelKey)}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )
        })}

        {/* Yesterday */}
        <div className="flex items-center gap-4 pt-4">
          <div className="h-px flex-1 bg-slate-800" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{t("notificationsPage.yesterday")}</span>
          <div className="h-px flex-1 bg-slate-800" />
        </div>

        {items.filter((n) => n.section === "yesterday").map((n) => {
          const { bg, text, Icon } = iconConfig(n.icon)
          return (
            <div
              key={n.id}
              className="group relative flex gap-4 rounded-xl border border-slate-800 bg-[#151f2b] p-5 opacity-75 transition-all hover:opacity-100"
            >
              <div className="absolute right-4 top-4 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                <button type="button" onClick={() => markAsUnread(n.id)} className="p-1 text-slate-400 hover:text-[#1173d4]" title={t("notificationsPage.markAsUnread")}>
                  <MessageCircle className="h-[18px] w-[18px]" />
                </button>
                <button type="button" onClick={() => remove(n.id)} className="p-1 text-slate-400 hover:text-red-500" title={t("notificationsPage.delete")}>
                  <Trash2 className="h-[18px] w-[18px]" />
                </button>
              </div>
              <div className={`flex size-10 shrink-0 items-center justify-center rounded-full ${bg} ${text}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1 pr-12">
                <div className="mb-1 flex items-baseline justify-between">
                  <h4 className="text-sm font-medium text-white">{t(n.titleKey)}</h4>
                  <span className="text-xs text-slate-500">{n.timeLabel}</span>
                </div>
                <p className="mb-2 text-sm text-slate-500">{t(n.bodyKey, n.bodyParams ?? {})}</p>
                {n.actionLabelKey && (
                  <div className="flex gap-2">
                    <button type="button" className="flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-white">
                      <Download className="h-3.5 w-3.5" />
                      {t(n.actionLabelKey)}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Pagination */}
      <div className="mt-8 flex items-center justify-center gap-2">
        <Button variant="outline" size="icon" className="rounded-lg border-slate-800 text-slate-500 hover:bg-slate-800" onClick={() => setPage((p) => Math.max(1, p - 1))}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <button type="button" className="flex size-9 items-center justify-center rounded-lg bg-[#1173d4] text-sm font-medium text-white">
          1
        </button>
        <button type="button" className="flex size-9 items-center justify-center rounded-lg border border-slate-800 text-sm font-medium text-slate-400 hover:bg-slate-800" onClick={() => setPage(2)}>
          2
        </button>
        <button type="button" className="flex size-9 items-center justify-center rounded-lg border border-slate-800 text-sm font-medium text-slate-400 hover:bg-slate-800" onClick={() => setPage(3)}>
          3
        </button>
        <span className="px-1 text-slate-400">...</span>
        <Button variant="outline" size="icon" className="rounded-lg border-slate-800 text-slate-500 hover:bg-slate-800" onClick={() => setPage((p) => p + 1)}>
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
    </main>
  )
}
