import { CheckCircle2, XCircle } from "lucide-react"

import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { getPublicStatusPage } from "@/services/statusPageService"
import type { PublicStatusPage } from "@/types/statusPage"
import { ApiStatusBadge } from "@/components/api/ApiStatusBadge"

export function PublicStatusPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [page, setPage] = useState<PublicStatusPage | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchPage() {
      setError(null)
      try {
        const data = await getPublicStatusPage(slug!)
        if (data) {
          setPage(data)
        } else {
          setError("Status page not found.")
          navigate("/login", { replace: true })
        }
      } catch (err) {
        console.error("Failed to fetch status page:", err)
        setError("Failed to load status page.")
      }
    }

    fetchPage()

    const interval = setInterval(fetchPage, 60000)

    return () => clearInterval(interval)
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 rounded-full bg-slate-200 animate-spin" />
          <p className="text-slate-600">Loading status page...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-md mx-auto rounded-xl border border-slate-200 bg-white p-8 text-center">
          <XCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">Status page not found</h2>
          <p className="text-slate-500">
            The status page could not be found. It may be private or does not exist.
          </p>
          <button
            onClick={() => navigate("/login", { replace: true })}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            Login
          </button>
        </div>
      </div>
    )
  }

  if (!page) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <p className="text-slate-500">Loading status page...</p>
      </div>
    )
  }

  const overallStatus = page.data.overallStatus
  const apis = page.data.apis
  const name = page.data.name
  const description = page.data.description

  const statusColor = {
    OPERATIONAL: "bg-emerald-500",
    DEGRADED: "bg-amber-500",
    OUTAGE: "bg-red-500",
  }[overallStatus] || "bg-slate-500"

  return (
    <div className="min-h-screen bg-slate-50 p-6 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            {name}
          </h1>
          {description && (
            <p className="text-slate-500">{description}</p>
          )}
          <p className="text-slate-400 text-sm">
            Overall Status:
            <span className={`inline-flex items-center gap-2 rounded px-3 py-1.5 text-xs font-medium ${statusColor} text-white`}>
              {overallStatus}
            </span>
          </p>
        </div>

        {apis.length === 0 ? (
          <div className="bg-white rounded-xl p-6 text-center">
            <div className="h-12 w-12 rounded-full bg-slate-100 mx-auto mb-4">
              <CheckCircle2 className="h-6 w-6 text-slate-400" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900">No services configured yet.</h2>
            <p className="text-slate-500">
              This status page has no APIs selected. Add APIs from the management page.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {apis.map((api) => (
              <div
                key={api.id}
                className="bg-white rounded-xl p-5 flex flex-col lg:flex-row gap-4 border-l-4"
                style={{ borderColor: statusColor }}
              >
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-medium text-slate-900">
                    {api.name}
                  </h3>
                  <ApiStatusBadge status={api.status as "UP" | "DEGRADED" | "DOWN"} />
                </div>

                <div className="flex-1 min-w-0 text-sm">
                  <p className="text-slate-400">Status</p>
                  <p className="mt-1 font-medium text-slate-900">{api.status}</p>
                </div>

                <div className="flex-1 min-w-0 text-sm">
                  <p className="text-slate-400">Response time</p>
                  <p className="mt-1 font-medium text-slate-900">
                    {api.responseTime !== null ? `${api.responseTime} ms` : "—"}
                  </p>
                </div>

                <div className="flex-1 min-w-0 text-sm">
                  <p className="text-slate-400">Uptime</p>
                  <p className="mt-1 font-medium text-slate-900">{api.uptime}%</p>
                </div>

                <div className="flex-1 min-w-0 text-sm">
                  <p className="text-slate-400">Last checked</p>
                  <p className="mt-1 font-medium text-slate-700">
                    {api.lastCheckedAt || "—"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 pt-8 border-t border-slate-200 text-center">
          <p className="text-slate-500 text-sm">
            Last updated {page.data.updatedAt ? new Date(page.data.updatedAt).toLocaleTimeString() : "just now"}
          </p>
        </div>
      </div>
    </div>
  )
}