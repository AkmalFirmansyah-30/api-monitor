import { useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { getNotifications } from "@/services/notificationService"

type NotificationDropdownProps = {
  unreadCount: number
  onUnreadCountChange: (count: number) => void
}

export function NotificationDropdown({
  unreadCount,
  onUnreadCountChange,
}: NotificationDropdownProps) {
  // Load notifications when unreadCount prop changes
  useEffect(() => {
    const load = async () => {
      const { user } = useAuth()
      if (!user) return
      try {
        const data = await getNotifications({ page: 1, perPage: 5 })
        onUnreadCountChange(data.unreadCount ?? 0)
      } catch (err) {
        console.error("Failed to load notifications:", err)
      }
    }
    load()
  }, [unreadCount])

  return null
}
export default NotificationDropdown