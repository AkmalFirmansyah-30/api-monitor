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

export type IncidentListResponse = {
  data: Incident[]
  meta: {
    currentPage: number
    lastPage: number
    perPage: number
    total: number
  }
}

export type IncidentFilters = {
  status?: "OPEN" | "RESOLVED"
  apiId?: number
  search?: string
  page?: number
  perPage?: number
}

export type IncidentPagination = {
  currentPage: number
  lastPage: number
  perPage: number
  total: number
}

export type NotificationType =
  | "incident_created"
  | "incident_resolved"

export type Notification = {
  id: number
  type: NotificationType
  incidentId: number
  apiId: number
  apiName: string
  title: string
  message: string
  readAt: string | null
  createdAt: string
}

export type NotificationPagination = {
  currentPage: number
  lastPage: number
  perPage: number
  total: number
}

export type NotificationListResponse = {
  data: Notification[]
  meta: {
    currentPage: number
    lastPage: number
    perPage: number
    total: number
  }
  unreadCount: number
}

export type MonitoringRule = {
  id: number
  monitoredApiId: number
  expected_status_codes: number[]
  body_keyword: string | null
  json_path: string | null
  json_expected_value: string | null
  warning_response_time_ms: number | null
  failure_response_time_ms: number | null
  createdAt: string
  updatedAt: string
}

export type MonitoringRulesState = {
  isLoading: boolean
  rules: MonitoringRule | null
  lastError: string | null
}

export type CheckResult = {
  status: "UP" | "DEGRADED" | "DOWN"
  assertionsPassed: boolean
  failures: string[]
  statusCode: number | null
  responseTime: number | null
}