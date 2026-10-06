import {
  CheckCircle2,
  Clock3,
  XCircle,
} from "lucide-react"

import type { ApiStatus } from "@/types/api"


type Props = {
  status: ApiStatus
}


export function ApiStatusBadge({
  status,
}: Props) {
  const config = {
    UP: {
      label: "UP",
      className:
        "bg-emerald-50 text-emerald-700 border-emerald-200",
      icon: CheckCircle2,
    },

    DEGRADED: {
      label: "DEGRADED",
      className:
        "bg-amber-50 text-amber-700 border-amber-200",
      icon: Clock3,
    },

    DOWN: {
      label: "DOWN",
      className:
        "bg-red-50 text-red-700 border-red-200",
      icon: XCircle,
    },
  }[status]

  const Icon = config.icon

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${config.className}`}
    >
      <Icon className="h-3.5 w-3.5" />

      {config.label}
    </span>
  )
}