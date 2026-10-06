import { useEffect, useState } from "react"
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  ArrowLeft,
} from "lucide-react"
import { Link, useParams } from "react-router-dom"

import { getIncidents } from "@/services/monitoredApiService"
import type { Incident } from "@/types/api"

function Incidents() {
  const { id: apiId } = useParams()

  const [incidents, setIncidents] = useState<Incident[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError("")

        const data = await getIncidents(Number(apiId) || 0)
        const converted = data.map((inc) => ({
          ...inc,
          status: inc.status as Incident["status"],
        }))
        setIncidents(converted)
      } catch (err) {
        console.error("Failed to load incidents:", err)
        setError("Failed to load incidents. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [apiId])

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl">
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-7 w-7 animate-spin" />
            <p className="text-sm">Loading incidents...</p>
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
          <Link
            to="/apis"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
          >
            <ArrowLeft className="h-4 w-4" /> Back to APIs
          </Link>
        </div>
      </div>
    )
  }

  const openIncidents = incidents.filter(
    (inc) => inc.status === "OPEN",
  )
  const resolvedIncidents = incidents.filter(
    (inc) => inc.status === "RESOLVED",
  )

  const totalIncidents = incidents.length

  const getStatusClass = (status: Incident["status"]): string => {
    if (status === "OPEN") {
      return "text-red-600 bg-red-50"
    }
    return "text-emerald-600 bg-emerald-50"
  }

  const formatTimestamp = (isoString: string): string => {
    const date = new Date(isoString)
    return new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  const formatDuration = (incident: Incident): string => {
    const started = new Date(incident.startedAt)
    const isOpen = incident.status === "OPEN"

    if (isOpen) {
      const diffMs = Date.now() - started.getTime()
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
    } else if (incident.resolvedAt && incident.startedAt) {
      const end = new Date(incident.resolvedAt)
      const diffMs = end.getTime() - started.getTime()
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
    return "—"
  }

  if (totalIncidents === 0) {
    return (
      <div className="mx-auto max-w-7xl">
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <div className="flex flex-col items-center gap-3">
            <AlertCircle className="h-12 w-12 text-slate-400" />
            <p className="text-sm text-slate-500">No incidents</p>
            <p className="text-sm">No incidents found for this API.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl">
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center pt-4">
        <div className="flex-1">
          <nav aria-label="Incidents navigation" className="flex flex-col sm:flex-row gap-2">
            <Link
              to="/incidents"
              className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
            >
              All Incidents
            </Link>
            {apiId && (
              <Link
                to={`/apis/${apiId}`}
                className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
              >
                Back to API
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">
            {openIncidents.length} OPEN
          </span>
          <span className="text-sm text-slate-500">
            {resolvedIncidents.length} RESOLVED
          </span>
          <span className="text-sm font-medium text-slate-700">
            / {totalIncidents} Total
          </span>
        </div>
      </div>

      <div className="mt-6 rounded-xl border bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="font-semibold text-slate-900">Incidents</h2>
        </div>

        <div className="divide-y divide-slate-100">
          {incidents.map((incident) => {
            const isOpen = incident.status === "OPEN"
            const StatusClass = getStatusClass(incident.status)
            const statusText = incident.status
            const duration = formatDuration(incident)
            const startedHuman = formatTimestamp(incident.startedAt)

            return (
              <div
                key={incident.id}
                className={`
                  flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between
                  ${isOpen ? "border-b border-red-500/20" : "border-b border-emerald-500/20"}
                `}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl">
                    <CheckCircle2
                      className={StatusClass}
                      style={{ width: "20", height: "20" }}
                    />
                  </div>

                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {incident.apiName}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {incident.title}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <span className={StatusClass}>
                    {statusText}
                  </span>
                  <span className="text-slate-400">
                    {startedHuman}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <span className="text-slate-400">{isOpen ? "Ongoing" : "Resolved"}</span>
                  <span className="ml-2">
                    {duration}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default Incidents