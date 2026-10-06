import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  Server,
  XCircle,
} from "lucide-react"

const stats = [
  {
    label: "Total APIs",
    value: "8",
    description: "Monitored endpoints",
    icon: Server,
  },
  {
    label: "Operational",
    value: "7",
    description: "Currently healthy",
    icon: CheckCircle2,
  },
  {
    label: "Down",
    value: "1",
    description: "Needs attention",
    icon: XCircle,
  },
  {
    label: "Uptime",
    value: "99.8%",
    description: "Last 30 days",
    icon: Activity,
  },
]

const apiStatuses = [
  {
    name: "Production API",
    url: "api.example.com/health",
    status: "UP",
    response: "124 ms",
    uptime: "99.99%",
  },
  {
    name: "User API",
    url: "api.example.com/users",
    status: "UP",
    response: "87 ms",
    uptime: "99.95%",
  },
  {
    name: "Payment API",
    url: "api.example.com/payment",
    status: "DOWN",
    response: "—",
    uptime: "98.12%",
  },
]

export default function Dashboard() {
  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-medium text-slate-500">
            Overview
          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Good afternoon, Akmal 👋
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Monitor the health and performance of your APIs.
          </p>
        </div>

        <button className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800">
          <Activity className="h-4 w-4" />
          Check all APIs
        </button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon

          return (
            <div
              key={stat.label}
              className="rounded-xl border bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                  <Icon className="h-5 w-5 text-slate-700" />
                </div>

                <span className="text-xs font-medium text-slate-400">
                  30 days
                </span>
              </div>

              <div className="mt-5">
                <p className="text-sm text-slate-500">
                  {stat.label}
                </p>

                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {stat.value}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  {stat.description}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Main grid */}
      <div className="grid gap-6 xl:grid-cols-3">
        {/* API Status */}
        <div className="overflow-hidden rounded-xl border bg-white shadow-sm xl:col-span-2">
          <div className="flex items-center justify-between border-b px-5 py-4">
            <div>
              <h2 className="font-semibold text-slate-900">
                API Status
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Current health of monitored endpoints.
              </p>
            </div>

            <a
              href="/apis"
              className="text-sm font-medium text-slate-900 hover:underline"
            >
              View all
            </a>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-medium">
                    API
                  </th>

                  <th className="px-5 py-3 font-medium">
                    Status
                  </th>

                  <th className="px-5 py-3 font-medium">
                    Response
                  </th>

                  <th className="px-5 py-3 font-medium">
                    Uptime
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {apiStatuses.map((api) => (
                  <tr
                    key={api.name}
                    className="transition hover:bg-slate-50"
                  >
                    <td className="px-5 py-4">
                      <p className="font-medium text-slate-900">
                        {api.name}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        {api.url}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      {api.status === "UP" ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          UP
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700">
                          <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                          DOWN
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {api.response}
                    </td>

                    <td className="px-5 py-4 font-medium text-slate-700">
                      {api.uptime}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent activity */}
        <div className="rounded-xl border bg-white shadow-sm">
          <div className="border-b px-5 py-4">
            <h2 className="font-semibold text-slate-900">
              Recent Activity
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Latest monitoring events.
            </p>
          </div>

          <div className="divide-y">
            <div className="flex gap-3 px-5 py-4">
              <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-500" />

              <div>
                <p className="text-sm font-medium text-slate-800">
                  Production API recovered
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  2 minutes ago
                </p>
              </div>
            </div>

            <div className="flex gap-3 px-5 py-4">
              <Clock3 className="mt-0.5 h-5 w-5 text-slate-400" />

              <div>
                <p className="text-sm font-medium text-slate-800">
                  User API checked
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  5 minutes ago
                </p>
              </div>
            </div>

            <div className="flex gap-3 px-5 py-4">
              <ArrowDownRight className="mt-0.5 h-5 w-5 text-red-500" />

              <div>
                <p className="text-sm font-medium text-slate-800">
                  Payment API is down
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  12 minutes ago
                </p>
              </div>
            </div>

            <div className="flex gap-3 px-5 py-4">
              <ArrowUpRight className="mt-0.5 h-5 w-5 text-emerald-500" />

              <div>
                <p className="text-sm font-medium text-slate-800">
                  API Monitor started
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  18 minutes ago
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}