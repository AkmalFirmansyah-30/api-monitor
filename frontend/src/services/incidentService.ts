import api from "@/services/api"
import type { Incident } from "@/types/api"

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

export async function getIncidents(
  params: IncidentFilters = {}
): Promise<IncidentListResponse> {
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
    searchParams.append(
      "perPage",
      Math.min(params.perPage, 100).toString()
    )
  } else {
    searchParams.append("perPage", "20")
  }

  const response = await api.get(
    "/incidents?" + searchParams.toString()
  )

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

export async function getIncident(
  id: number
): Promise<Incident | null> {
  const response = await api.get(`/api/incidents/${id}`)

  if (!response.data || !response.data.data) {
    return null
  }

  return response.data.data as Incident
}