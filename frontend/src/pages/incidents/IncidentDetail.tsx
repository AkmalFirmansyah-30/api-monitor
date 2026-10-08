import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { AlertCircle, Loader2 } from "lucide-react"

import { getIncident } from "@/services/incidentService"
import type { Incident } from "@/types/api"

function IncidentDetail() {
  const { id } = useParams()
  const [incident, setIncident] = useState<Incident | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError("")

        const data = await getIncident(Number(id))

        if (!data) {
          setError("Incident not found.")
          setLoading(false)
          return
        }

        setIncident(data)
      } catch (err) {
        console.error("Failed to load incident:", err)
        setError("Unable to load incident.")
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      loadData()
    }
  }, [id])

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl">
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-7 w-7 animate-spin" />
            <p className="text-sm">Loading incident...</p>
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
            to="/incidents"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
          >
            ← Back to Incidents
          </Link>
        </div>
      </div>
    )
  }

  if (!incident) {
    return (
      <div className="mx-auto max-w-7xl">
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <AlertCircle className="h-12 w-12 text-slate-400" />
          <p className="text-sm text-slate-500">Incident not found</p>
        </div>
      </div>
    )
  }

  const status = incident.status as "OPEN" | "RESOLVED"
  const isOpen = status === "OPEN"

  // Compute duration text
  let durationText: string | null = null
  if (isOpen) {
    const started = new Date(incident.startedAt)
    const diffMs = Date.now() - started.getTime()
    const diffMins = Math.max(0, Math.floor(diffMs / 60000))
    if (diffMins < 60) {
      durationText = `${diffMins} min`
    } else {
      const diffHours = Math.floor(diffMins / 60)
      const remainingMins = diffMins % 60
      if (diffHours < 24) {
        durationText = `${diffHours}h ${remainingMins}m`
      } else {
        const diffDays = Math.floor(diffHours / 24)
        const remainingHours = diffHours % 24
        durationText = `${diffDays}d ${remainingHours}h`
      }
    }
  } else if (incident.resolvedAt && incident.startedAt) {
    const started = new Date(incident.startedAt)
    const end = new Date(incident.resolvedAt)
    const diffMs = end.getTime() - started.getTime()
    const diffMins = Math.max(0, Math.floor(diffMs / 60000))
    if (diffMins < 60) {
      durationText = `${diffMins} min`
    } else {
      const diffHours = Math.floor(diffMins / 60)
      const remainingMins = diffMins % 60
      if (diffHours < 24) {
        durationText = `${diffHours}h ${remainingMins}m`
      } else {
        const diffDays = Math.floor(diffHours / 24)
        const remainingHours = diffHours % 24
        durationText = `${diffDays}d ${remainingHours}h`
      }
    }
  }

  return (
    <div className="mx-auto max-w-7xl">
      <nav
        aria-label="Incident navigation"
        className="flex flex-col sm:flex-row gap-2 border-b border-slate-200 pb-4 mb-4"
      >
        <Link
          to="/incidents"
          className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
        >
          ← Back to Incidents
        </Link>
        {incident.apiId && incident.apiName && (
          <Link
            to={`/apis/${incident.apiId}`}
            className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
          >
            View API
          </Link>
        )}
      </nav>

      <header className="pt-4">
        <h2 className="text-2xl font-bold text-slate-900">{incident.title}</h2>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
        <div>
          <p className="text-sm text-slate-500">Status</p>
          <span
            className={
              isOpen
                ? "inline-flex items-center gap-1.5 rounded-full bg-red-100 text-red-800 px-2.5 py-0.5 text-xs font-medium"
                : "inline-flex items-center gap-1.5 rounded-bg-emerald-100 text-emerald-800 px-2.5 py-0.5 text-xs font-medium"
            }
          >
            {status}
          </span>
        </div>

        <div>
          <p className="text-sm text-slate-500">API</p>
          <span className="text-slate-600">{incident.apiName || "—"}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
        <div>
          <p className="text-sm text-slate-500">Started</p>
          <p className="mt-1 text-lg text-slate-900">
            {new Date(incident.startedAt).toLocaleString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>

        {!isOpen && incident.resolvedAt && (
          <div>
            <p className="text-sm text-slate-500">Resolved</p>
            <p className="mt-1 text-lg text-slate-900">
              {new Date(incident.resolvedAt).toLocaleString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        )}
      </div>

      <div className="mb-6">
        <p className="text-sm text-slate-500">Duration</p>
        <p className="mt-1 text-lg font-medium text-slate-900">
          {isOpen ? durationText : incident.resolvedAt && incident.startedAt ? durationText : "—"}
        </p>
      </div>

      {incident.description && (
        <div className="mt-6 p-4 bg-slate-50 rounded-lg">
          <p className="text-sm text-slate-700">{incident.description}</p>
        </div>
      )}
    </div>
  )
}

export default IncidentDetail