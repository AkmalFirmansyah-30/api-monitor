import { useEffect, useState } from "react"
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react"
import { Link } from "react-router-dom"

import { getIncidents, type IncidentFilters } from "@/services/incidentService"
import type { Incident } from "@/types/api"
import { getApis } from "@/services/monitoredApiService"

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

function formatLiveDuration(startedAt: string): string {
  const started = new Date(startedAt)
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
}

function formatResolvedDuration(startedAt: string, resolvedAt: string): string {
  const started = new Date(startedAt)
  const end = new Date(resolvedAt)
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

interface IncidentsPageProps {
  apiId?: string
}

function Incidents({ apiId }: IncidentsPageProps = {}) {
  useEffect(() => {
    if (apiId !== undefined) {
      setApiFilter(Number(apiId))
    }
  }, [apiId])

  const [incidents, setIncidents] = useState<Incident[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [apiFilter, setApiFilter] = useState<number | null>(null)

  const [apis, setApis] = useState<Array<{ id: number; name: string }>>([])
  const [meta, setMeta] = useState({
    currentPage: 1,
    lastPage: 1,
    perPage: 20,
    total: 0,
  })

  const [hasFilters, setHasFilters] = useState(false)

  // Debounce search
  const [debounceSearch, setDebounceSearch] = useState("")
  useEffect(() => {
    const timer = setTimeout(() => setDebounceSearch(search), 300)
    return () => clearTimeout(timer)
  }, [search])

  useEffect(() => {
    const loadApis = async () => {
      try {
        const apiList = await getApis()
        setApis(apiList.map((api) => ({ id: api.id, name: api.name })))
      } catch (err) {
        console.error("Failed to load APIs:", err)
      }
    }

    loadApis()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError("")

      const params: IncidentFilters = {
        status:
          statusFilter !== null ? (statusFilter === "OPEN" ? "OPEN" : "RESOLVED")
            : undefined,
        apiId: apiFilter || undefined,
        search: debounceSearch.trim() || undefined,
        page: 1,
        perPage: 20,
      }

      const data = await getIncidents(params)

      setIncidents(data.data)
      setMeta({
        currentPage: data.meta.currentPage,
        lastPage: data.meta.lastPage,
        perPage: data.meta.perPage,
        total: data.meta.total,
      })

      setHasFilters(
        data.meta.total === 0 ||
          !!debounceSearch ||
          !!statusFilter ||
          !!apiFilter
      )
    } catch (err) {
      console.error("Failed to load incidents:", err)
      setError("Unable to load incidents.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [statusFilter, debounceSearch, apiFilter])

  /** @ts-ignore */
  const clearFilters = () => {
    setSearch("")
    setStatusFilter(null)
    setApiFilter(null)
    setDebounceSearch("")
    setHasFilters(false)
  }

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
          <div className="mt-6 flex flex-col sm:flex-row gap-2 justify-center">
            <button
              onClick={loadData}
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

  const openCount = incidents.filter((inc) => inc.status === "OPEN").length
  const resolvedCount = incidents.filter((inc) => inc.status === "RESOLVED").length

  if (meta.total === 0 && !hasFilters) {
    return (
      <div className="mx-auto max-w-7xl">
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <div className="flex flex-col items-center gap-3">
            <AlertCircle className="h-12 w-12 text-slate-400" />
            <p className="text-sm text-slate-500">No incidents found.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl">
      <header className="pb-2 border-b border-slate-200">
        <div className="flex flex-col sm:flex-row gap-4 sm:items-center pt-2">
          <div className="flex-1">
            <nav
              aria-label="Incidents navigation"
              className="flex flex-col sm:flex-row gap-2"
            >
              <Link
                to="/incidents"
                className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
                aria-current="page"
              >
                All Incidents
              </Link>
              {apiFilter && (
                <Link
                  to={`/apis/${apiFilter}`}
                  className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
                >
                  Back to API
                </Link>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500">
              {openCount} OPEN
            </span>
            <span className="text-sm text-slate-500">
              {resolvedCount} RESOLVED
            </span>
            <span className="text-sm font-medium text-slate-700">
              / {meta.total} Total
            </span>
          </div>
        </div>
      </header>

      <section className="mt-4">
        <form
          className="mb-4 rounded-lg bg-slate-50 p-4 sm:p-6 border border-slate-200"
        >
          <div className="grid sm:grid-cols-3 gap-3 sm:gap-4">
            <div>
              <label
                className="block text-sm text-slate-600 mb-1.5 font-medium"
              >
                Status
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setStatusFilter(null)
                    setHasFilters(false)
                  }}
                  className={
                    `rounded-lg border ${
                      statusFilter === null
                        ? "border-slate-400 text-slate-700"
                        : statusFilter === "OPEN"
                        ? "border-red-500 text-red-800 bg-red-100"
                        : "border-emerald-500 text-emerald-800 bg-emerald-100"
                    } px-3 py-1.5 text-xs font-medium transition focus:outline-none focus:ring-2 focus:ring-slate-400`
                  }
                >
                  [All]
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter("OPEN")}
                  className={
                    `rounded-lg border ${
                      statusFilter === "OPEN"
                        ? "border-red-500 text-red-800 bg-red-100"
                        : "border-slate-400 text-slate-500 hover:border-red-500 hover:bg-red-100"
                    } px-3 py-1.5 text-xs font-medium transition focus:outline-none focus:ring-2 focus:ring-slate-400`
                  }
                >
                  Open
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter("RESOLVED")}
                  className={
                    `rounded-lg border ${
                      statusFilter === "RESOLVED"
                        ? "border-emerald-500 text-emerald-800 bg-emerald-100"
                        : "border-slate-400 text-slate-500 hover:border-emerald-500 hover:bg-emerald-100"
                    } px-3 py-1.5 text-xs font-medium transition focus:outline-none focus:ring-2 focus:ring-slate-400`
                  }
                >
                  Resolved
                </button>
              </div>
            </div>

            <div>
              <label
                className="block text-sm text-slate-600 mb-1.5 font-medium"
              >
                API
              </label>
              <div className="relative">
                <select
                  value={apiFilter !== null ? String(apiFilter) : ""}
                  onChange={(e) => {
                    const val = e.target.value
                    setApiFilter(val ? Number(val) : null)
                    setHasFilters(true)
                  }}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                >
                  <option value="">All APIs ▼</option>
                  {apis.map((api) => (
                    <option key={api.id} value={api.id.toString()}>
                      {api.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label
                className="block text-sm text-slate-600 mb-1.5 font-medium"
              >
                Search
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={debounceSearch}
                  onChange={(e) => setSearch(e.target.value)}
                  onFocus={() => setDebounceSearch(debounceSearch)}
                  placeholder="Search incidents..."
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-slate-400 focus:outline-none"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  disabled={loading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-sm text-slate-400 hover:text-slate-500"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      d="M9.7 9.7L6.5 6.5a1.998 1.998 0 0 1 2.828 0l3.314 3.314c.39.39.39 1.02 0 1.414L12.828 15.314a1.998 1.998 0 0 1-2.828 0L9.7 9.7zM10 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0-2a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </form>

        <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
          <div className="border-b border-slate-200 px-6 py-4">
            <h2 className="font-semibold text-slate-900">Incidents</h2>
          </div>

          <div className="divide-y divide-slate-100">
            {incidents.map((incident) => (
              <div
                key={incident.id}
                className={
                  `flex flex-col gap-2 px-6 py-4 sm:flex-row sm:items-center sm:justify-between ${
                    incident.status === "OPEN"
                      ? "border-b border-red-500/20"
                      : "border-b border-emerald-500/20"
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl">
                    <CheckCircle2
                      className={
                        incident.status === "OPEN"
                          ? "text-red-600 bg-red-50"
                          : "text-emerald-600 bg-emerald-50"
                      }
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
                  <span className={incident.status === "OPEN" ? "text-red-600" : "text-emerald-500"}>
                    {incident.status}
                  </span>
                  <span className="text-slate-400">
                    {formatTimestamp(incident.startedAt)}
                  </span>
                  <span className="ml-2">
                    {incident.status === "OPEN"
                      ? formatLiveDuration(incident.startedAt)
                      : incident.resolvedAt
                      ? formatResolvedDuration(incident.startedAt, incident.resolvedAt)
                      : "—"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default Incidents