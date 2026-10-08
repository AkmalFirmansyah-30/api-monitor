import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Bell, CheckCircle2 } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { getNotifications, markAllAsRead } from "@/services/notificationService"
import type { Notification } from "@/types/api"

function formatTimestamp(isoString: string): string {
  const date = new Date(isoString)
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

function formatAge(isoString: string): string {
  const date = new Date(isoString)
  const diffMs = Date.now() - date.getTime()
  const diffMins = Math.max(0, Math.floor(diffMs / 60000))
  if (diffMins < 60) {
    return `${diffMins} min`
  }
  const diffHours = Math.floor(diffMins / 60)
  const remainingMins = diffMins % 60
  if (diffHours < 24) {
    return `${diffHours}h ${remainingMins}m`
  }
  const diffDays = Math.floor(diffHours / 24)
  const remainingHours = diffHours % 24
  return `${diffDays}d ${remainingHours}h`
}

interface NotificationsPageProps {
}

function NotificationsPage({}: NotificationsPageProps) {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [page, setPage] = useState(1)

  useEffect(() => {
    async function loadNotifications() {
      if (!user) return

      setLoading(true)
      setError("")

      try {
        const data = await getNotifications({ page, perPage: 20 })
        setNotifications(data.data)
      } catch (err) {
        console.error("Failed to load notifications:", err)
        setError("Failed to load notifications.")
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      loadNotifications()
    }
  }, [user, page])

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead()
      setNotifications(
        notifications.map((n) => ({ ...n, readAt: new Date().toISOString() }))
      )
    } catch (err) {
      console.error("Failed to mark all as read:", err)
    }
  }

  const unreadNotifications = notifications.filter((n) => !n.readAt)
  const readNotifications = notifications.filter((n) => n.readAt)

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl">
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <div className="flex flex-col items-center gap-3">
            <i className="loader h-7 w-7 animate-spin text-slate-400" />
            <p className="text-sm">Loading notifications...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-7xl">
        <div className="rounded-xl border border-red-200 bg-red-50 p-10 text-center shadow-sm">
          <h1 className="text-xl font-semibold text-slate-900">Error</h1>
          <p className="text-sm text-slate-500">{error}</p>
          <div className="mt-6 flex flex-col sm:flex-row gap-2 justify-center">
            <button
              onClick={() => setPage(1)}
              className="rounded-lg bg-slate-600 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 transition"
            >
              Retry
            </button>
            <Link
              to="/incidents"
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
            >
              Back to Incidents
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (notifications.length === 0 && !loading) {
    return (
      <div className="mx-auto max-w-7xl">
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <div className="flex flex-col items-center gap-3">
            <Bell className="h-12 w-12 text-slate-400" />
            <p className="text-sm text-slate-500">No notifications found.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl">
      <header className="pb-2 border-b border-slate-200">
        <div className="flex flex-col sm:flex-row gap-4 sm:items-center pt-2">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Notifications</h2>
            <p className="text-sm text-slate-500">API monitoring alerts</p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500">
              {notifications.length} total
            </span>
            <span className="text-sm font-medium text-slate-700">
              / {notifications.length} Total
            </span>
          </div>
        </div>
      </header>

      <section className="mt-4">
        <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
          {/* Unread notifications */}
          {unreadNotifications.length > 0 && (
            <div className="divide-y divide-slate-100">
              {unreadNotifications.map((notif) => (
                <div
                  key={notif.id}
                  className={
                    "flex flex-col gap-2 px-6 py-4 sm:flex-row sm:items-center sm:justify-between border-b border-red-500/20"
                  }
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl">
                      <Bell className="text-red-600 bg-red-50" style={{ width: "20", height: "20" }} />
                    </div>

                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {notif.title}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {notif.message}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-red-600">
                      {formatAge(notif.createdAt)}
                    </span>
                    <span className="text-slate-400">
                      {formatTimestamp(notif.createdAt)}
                    </span>
                    <span className="ml-2 cursor-pointer text-slate-500 hover:underline" onClick={() => window.location.href = `/incidents/${notif.incidentId}`}>
                      View
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Read notifications */}
          {readNotifications.length > 0 && (
            <div className="divide-y divide-slate-100">
              {readNotifications.map((notif) => (
                <div
                  key={notif.id}
                  className={
                    "flex flex-col gap-2 px-6 py-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/50"
                  }
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl">
                      <CheckCircle2 className="text-emerald-600 bg-emerald-50" style={{ width: "20", height: "20" }} />
                    </div>

                    <div>
                      <p className="text-sm font-medium text-slate-600">
                        {notif.title}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        {notif.message}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-slate-400">
                      {formatAge(notif.createdAt)}
                    </span>
                    <span className="text-slate-400">
                      {formatTimestamp(notif.createdAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <footer className="mt-6 pt-6 border-t border-slate-200">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <button
            type="button"
            onClick={() => handleMarkAllAsRead()}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 text-white px-4 py-2 text-sm font-medium hover:bg-slate-800 transition"
          >
            <Bell className="h-4 w-4" /> Mark all as read
          </button>

          <Link
            to="/incidents"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
          >
            <i data-lucide="arrow-left" className="h-4 w-4" /> Back to Incidents
          </Link>
        </div>
      </footer>
    </div>
  )
}

export default NotificationsPage