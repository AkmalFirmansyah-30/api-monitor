import {
  Activity,
  AlertTriangle,
  LayoutDashboard,
  Menu,
  Settings,
  Bell,
  X,
} from "lucide-react"
import { useEffect, useState } from "react"
import { NavLink, Outlet } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { getNotifications } from "@/services/notificationService"
import { NotificationDropdown } from "@/components/common/NotificationDropdown"

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "APIs",
    href: "/apis",
    icon: Activity,
  },
  {
    name: "Incidents",
    href: "/incidents",
    icon: AlertTriangle,
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
  },
  {
    name: "Notifications",
    href: "/notifications",
    icon: Bell,
  },
]

export default function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user } = useAuth()
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    async function loadNotifications() {
      if (!user) return

      try {
        const data = await getNotifications({ page: 1, perPage: 20 })
        setUnreadCount(data.unreadCount ?? 0)
      } catch (err) {
        console.error("Failed to load notifications:", err)
      }
    }

    loadNotifications()
  }, [user])

  useEffect(() => {
    const interval = setInterval(async () => {
      if (!user) return

      try {
        const data = await getNotifications({ page: 1, perPage: 20 })
        setUnreadCount(data.unreadCount ?? 0)
      } catch (err) {
        console.error("Failed to refresh notifications:", err)
      }
    }, 60000)

    return () => clearInterval(interval)
  }, [user])

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile header */}
      <header className="sticky top-0 z-40 flex h-16 items-center border-b bg-white px-4 lg:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="rounded-lg p-2 hover:bg-slate-100"
          aria-label="Open navigation"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="ml-3 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-sm font-bold text-white">
            A
          </div>

          <span className="font-semibold text-slate-900">
            API Monitor
          </span>
        </div>
      </header>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 border-r bg-white transition-transform duration-200 lg:translate-x-0`}
      >
        <div className="flex h-16 items-center justify-between border-b px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 font-bold text-white">
              A
            </div>

            <div>
              <p className="font-semibold text-slate-900">
                API Monitor
              </p>
              <p className="text-xs text-slate-500">
                API observability
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="rounded-lg p-2 hover:bg-slate-100 lg:hidden"
            aria-label="Close navigation"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="space-y-1 p-3">
          <p className="mb-2 px-3 pt-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Workspace
          </p>

          {navigation.map((item) => {
            const Icon = item.icon

            return (
              <NavLink
                key={item.href}
                to={item.href}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition " + (isActive ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900")
                }
              >
                <Icon className="h-4 w-4" />
                {item.name}
              </NavLink>
            )
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 border-t p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-700">
              AF
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-slate-900">
                Akmal Firmansyah
              </p>
              <p className="truncate text-xs text-slate-500">
                Developer
              </p>
            </div>

            <button
              type="button"
              className="rounded-lg p-2 hover:bg-slate-100 lg:hidden"
              aria-label="Open notifications"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 bg-red-600 text-xs text-white rounded-full h-3 w-3">
                {unreadCount > 0 ? unreadCount : ""}
              </span>
            </button>
          </div>

<NotificationDropdown
            unreadCount={unreadCount}
            onUnreadCountChange={setUnreadCount}
/>
        </div>
      </aside>

      {/* Main */}
      <div className="lg:pl-64">
        <main className="min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}