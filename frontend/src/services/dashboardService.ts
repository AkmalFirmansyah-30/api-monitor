import axios from "axios"
import type { AxiosInstance } from "axios"

const api: AxiosInstance = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
})

// Auth token is automatically attached via the interceptor
// (see api.ts interceptor for Bearer token handling)

export type DashboardSummary = {
  totalApis: number
  up: number
  degraded: number
  down: number
  averageResponseTime: number | null
  averageUptime: number | null
  activeIncidents: number
  totalChecks: number
}

export type RecentCheck = {
  id: number
  apiId: number
  apiName: string
  status: string
  statusCode: number | null
  responseTime: number | null
  errorMessage: string | null
  checkedAt: string
}

export type ResponseTimePoint = {
  timestamp: string
  averageResponseTime: number
}

export type UptimePoint = {
  date: string
  uptime: number | null
}

export type DashboardRange = "24h" | "7d" | "30d"

export type DashboardIncident = {
  id: number
  apiId: number
  apiName: string
  title: string
  status: string
  startedAt: string | null
  resolvedAt: string | null
  description: string | null
  duration: string | null
}

export type DashboardData = {
  summary: DashboardSummary
  recentChecks: RecentCheck[]
  responseTime: ResponseTimePoint[]
  uptime: UptimePoint[]
  incidents: DashboardIncident[]
}

export async function getSummary(): Promise<DashboardSummary> {
  const response = await api.get("/dashboard/summary")
  return response.data
}

export async function getRecentChecks(limit?: number): Promise<RecentCheck[]> {
  const response = await api.get("/dashboard/recent-checks?limit=" + (limit ?? 10))
  return response.data.data
}

export async function getResponseTime(range: DashboardRange = "24h", apiId?: number): Promise<ResponseTimePoint[]> {
  const params = new URLSearchParams()
  params.append("range", range)
  if (apiId !== undefined && apiId !== null) {
    params.append("apiId", apiId.toString())
  }
  const response = await api.get("/dashboard/response-time?" + params.toString())
  return response.data.data
}

export async function getUptime(range: DashboardRange = "24h", apiId?: number): Promise<{ data: UptimePoint[], summary: { totalChecks: number, successfulChecks: number, uptime: number | null } }> {
  const params = new URLSearchParams()
  params.append("range", range)
  if (apiId !== undefined && apiId !== null) {
    params.append("apiId", apiId.toString())
  }
  const response = await api.get("/dashboard/uptime?" + params.toString())
  return response.data
}

export async function getIncidents(): Promise<DashboardIncident[]> {
  const response = await api.get("/dashboard/incidents")
  return response.data.data
}