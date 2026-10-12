import { useEffect, useState } from "react"
import { useAuth } from "@/context/AuthContext"
import {
  BarChart2,
  Loader2,
  Clipboard,
  Eye,
  TrendingUp,
  AlertCircle,
  Timer,
  Clock,
  XCircle,
  CheckCircle2,
} from "lucide-react"
import { useNavigate } from "react-router-dom"
import { Suspense } from "react"
import { getAvailabilityReport, getApiAvailabilityReport, exportAvailabilityReport } from "@/services/monitoredApiService"
import { AvailabilityReportPeriod } from "@/types/api"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Toggle } from "@/components/ui/toggle"
import { Tooltip } from "@/components/ui/tooltip"
import { Progress } from "@/components/ui/progress"
import { Alert } from "@/components/ui/alert"
import { HStack, VStack, Spacer } from "@/components/ui/hstack"
import { chartColors } from "@/lib/utils"
import Recharts from "recharts"
import { RChart } from "recharts"

/*
 * Types compatible with the backend AvailabilityReport response.
 */

type ReportPeriod = "24h" | "7d" | "30d"

type ReportSummary = {
  totalChecks: number
  upChecks: number
  degradedChecks: number
  downChecks: number
  availability: number | null
  failedCheckPercentage: number | null
  averageResponseTime: number | null
  maxResponseTime: number | null
}

type SLAMetrics = {
  target: number | null
  met: boolean | null
  availability: number | null
}

type IncidentInfo = {
  count: number
  totalObservedDurationMinutes: number
  ongoingDurationMinutes: number | null
}

type ReportData = {
  availability: number | null
  totalChecks: number
  upChecks: number
  degradedChecks: number
  downChecks: number
  averageResponseTime: number | null
  maxResponseTime: number | null
  failedCheckPercentage: number | null
}

type ReportsPageState = {
  loading: boolean
  error: string | null
  period: ReportPeriod
  apiId: number | null
  apiName: string | null
  report: {
    range: string
    startAt: string
    endAt: string
    apiId: number | null
    summary: ReportSummary
    sla: SLAMetrics
    incidents: IncidentInfo
    data: ReportData
  } | null
  availableApis: number[]
  isExporting: boolean
}

const INITIAL_STATE: ReportsPageState = {
  loading: true,
  error: null,
  period: "24h",
  apiId: null,
  apiName: "All APIs",
  report: null,
  availableApis: [],
  isExporting: false,
}

/**
 * Reports page - API Availability Reports & Uptime SLA.
 *
 * Shows availability percentage, SLA compliance, incident analysis,
 * response-time metrics, and CSV export for the authenticated user.
 */
function Reports() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [state, setState] = useState<ReportsPageState>(INITIAL_STATE)

  // Load APIs for the selector (only user's own APIs)
  useEffect(() => {
    async function loadApis() {
      if (!user) return

      setState({ ...state, loading: true })

      try {
        const response = await fetch("/api/auth/me", {
          headers: {
            Authorization: `Bearer ${user?.token ?? ''}`,
          },
        })
        // If we have the user context already, we can get APIs from the
        // monitoredApiService, but that requires the api client with token.
        // For now, we'll rely on the API routes filtering by user_id.
        // The backend already filters by ownership.
        setState({ ...state, availableApis: [], loading: false })
      } catch (err) {
        console.error("Failed to load APIs:", err)
        setState({
          ...state,
          error: "Failed to load your APIs.",
          loading: false,
        })
      }
    }

    if (user) {
      loadApis()
    }
  }, [user])

  // Fetch report data when period or apiId changes
  useEffect(() => {
    async function loadReport() {
      if (!user) return

      setState({ ...state, loading: true, error: null })

      try {
        let report: any

        if (state.apiId !== null) {
          report = await getApiAvailabilityReport(state.apiId, {
            period: state.period,
          })
        } else {
          report = await getAvailabilityReport({
            period: state.period,
          })
        }

        setState({
          ...state,
          report,
          loading: false,
          error: null,
        })
      } catch (err: any) {
        console.error("Failed to load report:", err)
        setState({
          ...state,
          error: err?.response?.data?.message || "Failed to load report.",
          loading: false,
        })
      }
    }

    loadReport()
  }, [user, state.period, state.apiId])

  const handlePeriodChange = (period: ReportPeriod) => {
    setState({ ...state, period, apiId: state.apiId })
  }

  const handleApiChange = (apiId: number | null, apiName: string) => {
    setState({ ...state, apiId, apiName })
  }

  const handleCsvExport = async () => {
    if (!user || !state.report) return

    setState({ ...state, isExporting: true })

    try {
      let blob: Blob

      if (state.apiId !== null) {
        blob = await exportAvailabilityReport({
          period: state.period,
          apiId: state.apiId,
        })
      } else {
        blob = await exportAvailabilityReport({
          period: state.period,
        })
      }

      // Trigger download
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `api-availability-report-${state.period}${
        state.apiId !== null ? `-api-${state.apiId}` : ""
      }-${new Date().toISOString().slice(0, 10)}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err: any) {
      console.error("CSV export failed:", err)
      setState({
        ...state,
        error: "CSV export failed. Please try again.",
        isExporting: false,
      })
    }
  }

  // Render empty state when no report data
  if (!user) {
    return (
      <div className="min-h-screen p-6 text-center">
        <h1 className="text-2xl font-bold text-slate-900">API Monitor</h1>
        <p className="mt-2 text-slate-500">Please login to view reports.</p>
      </div>
    )
  }

  if (state.loading) {
    return (
      <div className="mx-auto max-w-7xl p-8">
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-slate-500">Loading report...</p>
        </div>
      </div>
    )
  }

  if (state.error) {
    return (
      <div className="mx-auto max-w-7xl p-8">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
        <Button onClick={() => {
          setState({ ...state, loading: true, error: null })
          loadReport()
        }}>
          Retry
        </Button>
      </div>
    )
  }

  if (!state.report) {
    return (
      <div className="mx-auto max-w-7xl p-8">
        <Card>
          <CardContent>
            <p className="text-slate-500">
              No report data available for the selected period.
            </p>
            <Button
              onClick={() => setState({
                ...state,
                period: "24h",
                apiId: null,
                apiName: "All APIs",
              })}
            >
              Select a period and API to generate a report
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const {
    range,
    startAt,
    endAt,
    apiId,
    summary,
    sla,
    incidents,
    data,
  } = state.report!

  const {
    totalChecks,
    upChecks,
    degradedChecks,
    downChecks,
    availability,
    failedCheckPercentage,
    averageResponseTime,
    maxResponseTime,
  } = summary

  const { target, met, availability: slaAvailability } = sla

  const { count, totalObservedDurationMinutes, ongoingDurationMinutes } = incidents

  // Render the Reports page
  return (
    <div className="mx-auto max-w-7xl p-6">
      <h1 className="text-3xl font-bold text-slate-900 mb-2">
        API Availability Reports
      </h1>
      <p className="text-slate-500 mb-8">
        Real metrics from your monitored APIs' historical check records.
      </p>

      {/* Period & API Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Report Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Period selector */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Period
            </label>
            <div className="flex gap-2">
              <Select
                value={state.period}
                onValueChange={handlePeriodChange}
                className="w-full"
              >
                <SelectTrigger>
                  <SelectValue className="h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                    placeholderText="Select period"
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24h">24 hours</SelectItem>
                  <SelectItem value="7d">7 days</SelectItem>
                  <SelectItem value="30d">30 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* API selector */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              API
            </label>
            <Select
              value={apiId !== null ? String(apiId) : ""}
              onValueChange={(value) => {
                if (value === "") {
                  handleApiChange(null, "All APIs")
                }
              }}
              className="w-full"
            >
              <SelectTrigger>
                <SelectValue
                  className="h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                  placeholderText="Select API"
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All APIs</SelectItem>
                {state.availableApis.length > 0 ? (
                  state.availableApis.map((api) => (
                    <SelectItem
                      key={api}
                      value={String(api)}
                    >
                      {/* API name would need to be fetched - for now show ID */}
                      API {api}
                    </SelectItem>
                  ))
                ) : (
                  <p className="text-slate-400 text-sm">No APIs found</p>
                )}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Report Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Summary ({range})</CardTitle>
        </Header>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard
              label="Total Checks"
              value={totalChecks}
              icon={Loader2}
            />
            <StatCard
              label="UP"
              value={upChecks}
              icon={CheckCircle2}
              className="bg-emerald-50"
            />
            <StatCard
              label="DEGRADED"
              value={degradedChecks}
              icon={TrendingUp}
              className="bg-amber-50"
            />
            <StatCard
              label="DOWN"
              value={downChecks}
              icon={XCircle}
              className="bg-red-50"
            />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard
              label="Availability"
              value={
                availability !== null
                  ? `${availability}%`
                  : "—"
              }
              icon={TrendingUp}
              className={availability !== null && availability >= (target ?? 100) ? "bg-emerald-50" : availability !== null && availability < (target ?? 0) ? "bg-red-50" : "bg-slate-50"}
            />
            <StatCard
              label="SLA Target"
              value={
                target !== null ? `${target}%` : "—"
              }
              icon={Clock}
            />
            <StatCard
              label="SLA Met"
              value={
                met !== null
                  ? met ? "Yes" : "No"
                  : "—"
              }
              icon={CheckCircle2}
            />
            <StatCard
              label="Failed Check %"
              value={
                failedCheckPercentage !== null
                  ? `${failedCheckPercentage}%`
                  : "—"
              }
              icon={XCircle}
            />
          </div>
        </CardContent>
      </Card>

      {/* Response Time Chart */}
      {averageResponseTime !== null || maxResponseTime !== null ? (
        <Card>
          <CardHeader>
            <CardTitle>Response Time</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mt-1 text-sm text-slate-500">
              Recent response-time performance ({range})
            </p>
            <div className="mt-6 h-64 flex items-end gap-3 border-b border-l border-slate-200 px-4 pb-0">
              {state.report?.data && state.report.data.availability !== null ? (
                // Simplified: show a bar representing availability
                <div className="flex h-full flex-1 items-end gap-1">
                  {/* UP bar */}
                  <div
                    key="up"
                    className="group flex h-full flex-1 items-end rounded-t-md bg-emerald-500/70 transition"
                    style={{ height: `${(upChecks / totalChecks) * 100}%`, width: '33%' }}
                  />
                  {/* DEGRADED bar */}
                  <div
                    key="degraded"
                    className="group flex h-full flex-1 items-end rounded-t-md bg-amber-500/70 transition"
                    style={{ height: `${(degradedChecks / totalChecks) * 100}%`, width: '33%' }}
                  />
                  {/* DOWN bar */}
                  <div
                    key="down"
                    className="group flex h-full flex-1 items-end rounded-t-md bg-red-500/70 transition"
                    style={{ height: `${(downChecks / totalChecks) * 100}%`, width: '33%' }}
                  />
                </div>
              ) : (
                <p className="mt-6 text-sm text-slate-500 text-center">
                  No response-time data available for this period.
                </p>
              )}
              <div className="mt-3 flex justify-between text-xs text-slate-400">
                <span>UP</span>
                <span>DEGRADED</span>
                <span>DOWN</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Response Time</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mt-6 text-sm text-slate-500 text-center">
              No response-time data available for this period.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Incidents */}
      <Card>
        <CardHeader>
          <CardTitle>Incidents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard
              label="Incident Count"
              value={count}
              icon={AlertCircle}
            />
            <StatCard
              label="Downtime Duration"
              value={
                totalObservedDurationMinutes > 0
                  ? `${totalObservedDurationMinutes} min`
                  : "—"
              }
              icon={Clock}
            />
            <StatCard
              label="Ongoing"
              value={
                ongoingDurationMinutes !== null
                  ? `${ongoingDurationMinutes} min`
                  : "—"
              }
              icon={XCircle}
            />
          </div>

          {count > 0 ? (
            <div className="mt-4">
              <p className="text-sm text-slate-500">
                {count} incident{''.repeat(count > 1 ? 's' : '')} observed
                {totalObservedDurationMinutes > 0 ? `over the ${range} period` : ''}.
              </p>
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-500">
              No incidents in the selected period.
            </p>
          )}
        </CardContent>
      </Card>

      {/* CSV Export */}
      <Card>
        <CardHeader>
          <CardTitle>Export</CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleCsvExport}
            disabled={state.isExporting}
            className="w-full justify-center"
          >
            {state.isExporting
              ? <Loader2 className="h-4 w-4 me-2" /> Exporting...
              : <Clipboard className="h-4 w-4 me-2" /> Export as CSV}
          </Button>
          <p className="mt-2 text-xs text-slate-400">
            Download CSV report with availability, SLA, incidents, and response-time metrics.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

/* StatCard component */
function StatCard({
  label,
  value,
  icon,
  className,
}: {
  label: string
  value: string | number
  icon: React.ReactNode
  className?: string
}) {
  return (
    <div className={`rounded-xl border border-slate-200 bg-white p-4 ${className || ''}`}>
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{label}</p>
        <div className="rounded-lg bg-slate-100 p-2">
          <icon className="h-4 w-4 text-slate-600" />
        </div>
      </div>

      <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
    </div>
  )
}

export default Reports