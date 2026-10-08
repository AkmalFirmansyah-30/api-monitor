import axios from "axios"
import api from "@/services/api"
import type { MonitoredApi, ApiCheck, Incident } from "@/types/api"

export type CreateMonitoredApiPayload = {
  name: string
  url: string
  method: MonitoredApi["method"]
  timeout: number
  interval: number
}

export type UpdateMonitoredApiPayload =
  CreateMonitoredApiPayload

/**
 * Get all monitored APIs
 */
export async function getApis(): Promise<MonitoredApi[]> {
  const response = await api.get("/apis")

  console.log("========== GET APIS DEBUG ==========")
  console.log("Axios response:", response)
  console.log("Axios response.data:", response.data)
  console.log("response.data.data:", response.data?.data)
  console.log("Array.isArray(response.data?.data):", Array.isArray(response.data?.data))
  console.log("====================================")

  const rawData = response.data?.data ?? response.data

  if (!Array.isArray(rawData)) {
    console.error("GET /apis rawData is NOT an array:", rawData)
    return []
  }

  console.log("getApis() returning:", rawData)
  console.log("getApis() length:", rawData.length)
  console.log("====================================")

  return rawData as MonitoredApi[]
}

/**
 * Get single monitored API
 */
export async function getApi(
  id: number,
): Promise<MonitoredApi> {
  const response = await api.get(`/apis/${id}`)

  return response.data.data
}

/**
 * Create monitored API
 */
export async function createApi(
  payload: CreateMonitoredApiPayload,
): Promise<MonitoredApi> {
  const response = await api.post("/apis", payload)

  return response.data.data
}

/**
 * Update monitored API
 */
export async function updateApi(
  id: number,
  payload: UpdateMonitoredApiPayload,
): Promise<MonitoredApi> {
  const response = await api.put(`/apis/${id}`, payload)

  return response.data.data
}

/**
 * Delete monitored API
 */
export async function deleteApi(
  id: number,
): Promise<void> {
  await api.delete(`/apis/${id}`)
}

/**
 * Check a monitored API.
 */
export async function checkApi(id: number): Promise<MonitoredApiCheckResult> {
  const response = await api.post(`/apis/${id}/check`)

  return response.data?.data ?? response.data
}

/**
 * Check result type.
 */
export type MonitoredApiCheckResult = {
  apiId: number
  status: string
  statusCode: number | null
  responseTime: number
  checkedAt: string
  errorMessage: string | null
}

/**
 * Get all checks for a monitored API.
 */
export async function getApiChecks(id: number): Promise<ApiCheck[]> {
  const response = await api.get(`/apis/${id}/checks`)

  const rawData = response.data?.data ?? response.data

  if (!Array.isArray(rawData)) {
    console.error("GET /api/apis/{id}/checks rawData is NOT an array:", rawData)
    return []
  }

  return rawData as ApiCheck[]
}

/**
 * Get all incidents for a monitored API.
 */
export async function getIncidents(id: number): Promise<Incident[]> {
  try {
    const response = await api.get(`/incidents?apiId=${id}`)
    console.log("getIncidents response status:", response.status)
    console.log("getIncidents response.data:", response.data)
    console.log("getIncidents response.data.data:", response.data?.data)

    const rawData = response.data?.data ?? response.data

    if (!Array.isArray(rawData)) {
      console.error("GET /api/incidents rawData is NOT an array:", rawData)
      return []
    }

    return rawData as Incident[]
  } catch (error) {
    console.error("getIncidents axios error:")
    if (axios.isAxiosError(error)) {
      console.error("  message:", error.message)
      console.error("  response status:", error.response?.status)
      console.error("  response data:", error.response?.data)
    } else {
      console.error("  non-axios error:", error)
    }
    return []
  }
}

/**
 * Get statistics for a monitored API.
 */
export async function getStats(
  id: number,
): Promise<{
  uptime: number | null
  averageResponseTime: number | null
  totalChecks: number
  upChecks: number
  degradedChecks: number
  downChecks: number
}> {
  const response = await api.get(`/apis/${id}/stats`)

  const rawData = response.data.data ?? response.data

  if (!rawData || typeof rawData !== "object") {
    console.error("GET /apis/{id}/stats rawData is invalid:", rawData)
    return {
      uptime: null,
      averageResponseTime: null,
      totalChecks: 0,
      upChecks: 0,
      degradedChecks: 0,
      downChecks: 0,
    }
  }

  return {
    uptime: rawData.uptime ?? null,
    averageResponseTime: rawData.averageResponseTime ?? null,
    totalChecks: rawData.totalChecks ?? 0,
    upChecks: rawData.upChecks ?? 0,
    degradedChecks: rawData.degradedChecks ?? 0,
    downChecks: rawData.downChecks ?? 0,
  }
}

/**
 * Get response time analytics for a monitored API.
 */
export async function getResponseTime(
  id: number,
  range: "24h" | "7d" | "30d" = "24h",
): Promise<{ data: { timestamp: string; averageResponseTime: number }[] }> {
  const params = new URLSearchParams()
  params.append("range", range)

  const response = await api.get(`/apis/${id}/response-time?` + params.toString())

  const rawData = response.data.data ?? response.data

  if (!Array.isArray(rawData)) {
    console.error("GET /apis/{id}/response-time rawData is NOT an array:", rawData)
    return { data: [] }
  }

  return { data: rawData }
}

/**
 * Get a single incident by ID.
 */
export async function getIncident(id: number): Promise<Incident | null> {
  const response = await api.get(`/api/incidents/${id}`)

  if (!response.data || !response.data.data) {
    return null
  }

  return response.data.data as Incident
}