export type ApiStatus =
  | "UP"
  | "DEGRADED"
  | "DOWN"

export type HttpMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "PATCH"
  | "DELETE"

export type IncidentStatus = "OPEN" | "RESOLVED"

export type Incident = {
  id: number
  apiId: number
  apiName: string
  title: string
  status: IncidentStatus
  startedAt: string
  resolvedAt: string | null
  description: string | null
}

export type MonitoredApi = {
  id: number
  name: string
  url: string
  method: HttpMethod
  status: ApiStatus
  responseTime: number | null
  uptime: string
  lastChecked: string | null
  lastCheckedAt: string | null
  timeout: number
  interval: number
  checksCount?: number
  createdAt?: string
  updatedAt?: string
}

export type ApiCheck = {
  id: number
  apiId: number
  status: string
  statusCode: number | null
  responseTime: number | null
  errorMessage: string | null
  checkedAt: string
}