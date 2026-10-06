import { useEffect, useState } from "react"
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Loader2,
  Pencil,
  RefreshCw,
  Server,
  Timer,
  TrendingUp,
  XCircle,
} from "lucide-react"
import { Link, useParams } from "react-router-dom"

import { getApi, getApiChecks, getIncidents } from "@/services/monitoredApiService"

import type { ApiCheck, Incident, IncidentStatus, MonitoredApi } from "@/types/api"

import { ApiStatusBadge } from "@/components/api/ApiStatusBadge"

function ApiDetail() {
  const { id } = useParams()

  const [api, setApi] = useState<MonitoredApi | null>(null)
  const [checks, setChecks] = useState<ApiCheck[]>([])
  // @ts-ignore
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError("")

        const [apiData, checksData, incidentsData] = await Promise.all([
          getApi(Number(id)),
          getApiChecks(Number(id)),
          getIncidents(Number(id)),
        ])

        // Convert incident status from service type to app type
        const convertedIncidents = incidentsData.map((inc) => ({
          ...inc,
          status: inc.status as IncidentStatus,
        }))

        setApi(apiData)
        setChecks(checksData)
        setIncidents(convertedIncidents)
      } catch (err) {
        console.error("Failed to load API detail:", err)
        setError("Failed to load API detail. Please try again.")
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
            <p className="text-sm">Loading API detail...</p>
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

  if (!api) {
    return (
      <div className="mx-auto max-w-7xl">
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <h1 className="text-xl font-semibold text-slate-900">API not found</h1>
          <p className="mt-2 text-sm text-slate-500">The API you're looking for does not exist.</p>
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

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Back */}
      <Link
        to="/apis"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to APIs
      </Link>

      {/* Header */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
                <Server className="h-5 w-5 text-emerald-600" />
              </div>

              <Link
                to={`/apis/${api.id}`}
                className="font-semibold text-slate-900 hover:text-emerald-600"
              >
                {api.name}
              </Link>

              <ApiStatusBadge status={api.status} />
            </div>

            <p className="mt-3 text-sm text-slate-500">
              {api.method} · {api.url}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <Pencil className="h-4 w-4" />
              Edit
            </button>

            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
            >
              <RefreshCw className="h-4 w-4" />
              Check Now
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Current status"
          value={api.status}
          icon={api.status === "UP" ? CheckCircle2 : XCircle}
          description="Latest monitoring result"
        />

        <StatCard
          label="Response time"
          value={
            api.responseTime !== null
              ? `${api.responseTime} ms`
              : "—"
          }
          icon={Timer}
          description="Latest response"
        />

        <StatCard
          label="Uptime"
          value={api.uptime}
          icon={TrendingUp}
          description="Current availability"
        />

        <StatCard
          label="Last checked"
          value={api.lastChecked ?? "Never"}
          icon={Clock3}
          description="Most recent check"
        />
      </div>

      {/* Response chart */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <h2 className="font-semibold text-slate-900">
            Response time
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Recent response-time performance.
          </p>
        </div>

        <div className="mt-6 flex h-64 items-end gap-3 border-b border-l border-slate-200 px-4 pb-0">
          {checks
            .filter(
              (check) =>
                check.responseTime !== null,
            )
            .reverse()
            .map((check) => {
              const height = Math.min(
                Math.max(
                  ((check.responseTime ?? 0) /
                    900) *
                    100,
                  8,
                ),
                100,
              )

              return (
                <div
                  key={check.id}
                  className="group flex h-full flex-1 items-end"
                >
                  <div
                    className="w-full rounded-t-md bg-emerald-500/80 transition hover:bg-emerald-600"
                    style={{
                      height: `${height}%`,
                    }}
                    title={`${check.responseTime} ms`}
                  />
                </div>
              )
            })}
        </div>

        <div className="mt-3 flex justify-between text-xs text-slate-400">
          <span>Older</span>
          <span>Recent</span>
        </div>
      </div>

      {/* History */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="font-semibold text-slate-900">
            Check history
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Recent monitoring results for this endpoint.
          </p>
        </div>

        <div className="divide-y divide-slate-100">
          {checks.map((check) => (
            <div
              key={check.id}
              className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-3">
                {check.status === "UP" ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}

                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {check.status}
                  </p>

                  <p className="text-xs text-slate-500">
                    {check.checkedAt}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-8 text-sm">
                <div>
                  <p className="text-xs text-slate-400">
                    HTTP
                  </p>

                  <p className="mt-1 font-medium text-slate-700">
                    {check.statusCode ?? "—"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">
                    Response
                  </p>

                  <p className="mt-1 font-medium text-slate-700">
                    {check.responseTime !== null
                      ? `${check.responseTime} ms`
                      : "—"}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

type StatCardProps = {
  label: string
  value: string
  icon: typeof CheckCircle2
  description: string
}

function StatCard({
  label,
  value,
  icon: Icon,
  description,
}: StatCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          {label}
        </p>

        <div className="rounded-lg bg-slate-100 p-2">
          <Icon className="h-4 w-4 text-slate-600" />
        </div>
      </div>

      <p className="mt-4 text-2xl font-bold text-slate-900">
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-400">
        {description}
      </p>
    </div>
  )
}

export default ApiDetail