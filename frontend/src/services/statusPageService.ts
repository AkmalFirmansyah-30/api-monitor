import api from "@/services/api"

/**
 * Status page types
 */
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

export type StatusPageStatus = "OPERATIONAL" | "DEGRADED" | "OUTAGE"

/**
 * Get all status pages for the authenticated user.
 */
export async function getStatusPages(): Promise<StatusPage[]> {
  const response = await api.get("/status-pages")

  const rawData = response.data.data ?? response.data

  if (!Array.isArray(rawData)) {
    console.error("GET /status-pages rawData is NOT an array:", rawData)
    return []
  }

  return rawData as StatusPage[]
}

/**
 * Get a single status page by ID.
 */
export async function getStatusPage(id: number): Promise<StatusPage | null> {
  try {
    const response = await api.get(`/status-pages/${id}`)

    return response.data.data
  } catch (error) {
    console.error('GET /status-pages/' + id + ' error:', error)
    return null
  }
}

/**
 * Create a new status page.
 */
export async function createStatusPage(
  data: {
    name: string
    slug: string
    description?: string | null
    isPublic?: boolean
    apiIds?: number[]
  },
): Promise<StatusPage> {
  const response = await api.post("/status-pages", data)

  return response.data.data
}

/**
 * Update a status page.
 */
export async function updateStatusPage(
  id: number,
  data: {
    name?: string
    slug?: string
    description?: string | null
    isPublic?: boolean
    apiIds?: number[]
    removeApiIds?: number[],
  },
): Promise<StatusPage> {
  const response = await api.put(`/status-pages/${id}`, data)

  return response.data.data
}

/**
 * Delete a status page.
 */
export async function deleteStatusPage(
  id: number,
): Promise<void> {
  await api.delete(`/status-pages/${id}`)
}

/**
 * Get a public status page by slug (no authentication required).
 */
export async function getPublicStatusPage(
  slug: string,
): Promise<PublicStatusPage | null> {
  try {
    const response = await api.get(`/public/status-pages/${slug}`)

    return response.data
  } catch (error) {
    // 404 or other error - return null
    console.error('GET /public/status-pages/' + slug + ' error:', error)
    return null
  }
}