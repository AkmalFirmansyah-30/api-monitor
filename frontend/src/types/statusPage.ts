export type MonitoredApi = {
  id: number
  name: string
  url?: string
  method?: string
  status?: string
  responseTime?: number | null
  uptime?: string
  lastChecked?: string | null
  lastCheckedAt?: string | null
  timeout?: number
  interval?: number
  checksCount?: number
  createdAt?: string
  updatedAt?: string
}

export type StatusPage = {
  id: number
  name: string
  slug: string
  description: string | null
  is_public: boolean
  created_at: string
  updated_at: string
  statusPageApis: Array<{
    monitoredApi: {
      id: number
      name: string
    }
    pivot: {
      sort_order: number
    }
  }>
}

export type StatusPageApi = {
  id: number
  name: string
  status: string
  response_time: number | null
  uptime: string
  last_checked_at: string | null
  sort_order: number
}

export type PublicStatusPage = {
  data: {
    name: string
    slug: string
    description: string | null
    overallStatus: "OPERATIONAL" | "DEGRADED" | "OUTAGE"
    apis: PublicStatusApi[]
    updatedAt: string
  }
}

export type PublicStatusApi = {
  id: number
  name: string
  status: "UP" | "DEGRADED" | "DOWN"
  responseTime: number | null
  uptime: string
  lastCheckedAt: string | null
}

export type StatusPageStatus =
  | "OPERATIONAL"
  | "DEGRADED"
  | "OUTAGE"

export type StatusPageFormData = {
  name: string
  slug: string
  description?: string | null
  isPublic?: boolean
  apiIds?: number[]
}

export type StatusPageSortUpdate = {
  sort_order: number
}