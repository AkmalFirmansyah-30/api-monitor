import api from "@/services/api"
import type { Notification, NotificationListResponse } from "@/types/api"

export async function getNotifications(
  params: { page?: number; perPage?: number } = {}
): Promise<NotificationListResponse> {
  const searchParams = new URLSearchParams()

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
    "/api/notifications?" + searchParams.toString()
  )

  const rawData = response.data.data ?? response.data

  if (!Array.isArray(rawData)) {
    console.error("GET /api/notifications rawData is NOT an array:", rawData)
    return {
      data: [],
      meta: {
        currentPage: 1,
        lastPage: 1,
        perPage: 20,
        total: 0,
      },
      unreadCount: 0,
    }
  }

  return {
    data: rawData as Notification[],
    meta: {
      currentPage: response.data.meta.currentPage ?? 1,
      lastPage: response.data.meta.lastPage ?? 1,
      perPage: response.data.meta.perPage ?? 20,
      total: response.data.meta.total ?? 0,
    },
    unreadCount: response.data.unreadCount ?? 0,
  }
}

export async function markAsRead(notificationId: number): Promise<void> {
  const response = await api.patch(
    `/api/notifications/${notificationId}/read`
  )

  if (!response.data) {
    throw new Error("Failed to mark notification as read")
  }
}

export async function markAllAsRead(): Promise<void> {
  const response = await api.post("/api/notifications/read-all")

  if (!response.data) {
    throw new Error("Failed to mark all notifications as read")
  }
}