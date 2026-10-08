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

  const rawData = response.data?.data ?? response.data

  if (!Array.isArray(rawData)) {
    console.error("GET /apis rawData is NOT an array:", rawData)
    return []
  }

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
 * Get incidents with optional filters.
 *
 * Supported query parameters:
 *   - status: "OPEN" or "RESOLVED"
 *   - apiId: filter by API ID (only own API's incidents)
 *   - search: search in title and API name
 *   - page: page number (Laravel pagination)
 *   - perPage: items per page (max 100)
 */
export async function getIncidents(
  id?: number,
  params: {
    status?: "OPEN" | "RESOLVED"
    apiId?: number
    search?: string
    page?: number
    perPage?: number
  } = {}
): Promise<{
  data: Incident[]
  meta: {
    currentPage: number
    lastPage: number
    perPage: number
    total: number
  }
}> {
  const searchParams = new URLSearchParams()

  if (params.status) {
    searchParams.append("status", params.status)
  }
  if (params.apiId !== undefined) {
    searchParams.append("apiId", params.apiId.toString())
  }
  if (params.search) {
    searchParams.append("search", params.search)
  }
  if (params.page !== undefined) {
    searchParams.append("page", params.page.toString())
  } else {
    searchParams.append("page", "1")
  }
  if (params.perPage !== undefined) {
    searchParams.append("perPage", Math.min(params.perPage, 100).toString())
  } else {
    searchParams.append("perPage", "20")
  }

  const base = id !== undefined ? `/apis/${id}/incidents` : "/incidents"
  const response = await api.get(`${base}?${searchParams.toString()}`)

  const rawData = response.data.data ?? response.data

  if (!Array.isArray(rawData)) {
    console.error("GET /incidents rawData is NOT an array:", rawData)
    return {
      data: [],
      meta: {
        currentPage: 1,
        lastPage: 1,
        perPage: 20,
        total: 0,
      },
    }
  }

  return {
    data: rawData as Incident[],
    meta: {
      currentPage: response.data.meta ?? 1,
      lastPage: response.data.meta ?? 1,
      perPage: response.data.perPage ?? 20,
      total: response.data.total ?? 0,
    },
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
  const searchParams = new URLSearchParams()
  searchParams.append("range", range)

  const response = await api.get(`/apis/${id}/response-time?` + searchParams.toString())

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