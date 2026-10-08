import { useEffect, useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { getSummary } from "@/services/dashboardService"

type SummaryStats = {
  totalApis: number
  up: number
  degraded: number
  down: number
  averageResponseTime: number | null
  averageUptime: number | null
  activeIncidents: number
  totalChecks: number
}

type DashboardState = {
  loading: boolean
  error: string | null
  summary: SummaryStats | null
}

const INITIAL_STATE: DashboardState = {
  loading: true,
  error: null,
  summary: null,
}

function Dashboard() {
  const { user } = useAuth()
  const [state, setState] = useState<DashboardState>({
    ...INITIAL_STATE,
  })

  useEffect(() => {
    async function loadDashboard() {
      if (!user) return

      setState({ ...state, loading: true })

      try {
        const summary = await getSummary()

setState({
            loading: false,
            error: null,
            summary,
          })
      } catch (err) {
        setState({
          ...state,
          loading: false,
          error: "Failed to load dashboard",
        })
      }
    }

    loadDashboard()
  }, [user])

  if (state.loading) {
    return <div>Loading dashboard...</div>
  }

  if (state.error) {
    return <div>Error: {state.error}</div>
  }

  return (
    <div>
      <h1>Dashboard</h1>
      {state.summary && (
        <div>
          <p>Total APIs: {state.summary.totalApis}</p>
          <p>Operational: {state.summary.up}</p>
          <p>Degraded: {state.summary.degraded}</p>
          <p>Down: {state.summary.down}</p>
          <p>Average Response Time: {state.summary.averageResponseTime} ms</p>
          <p>Average Uptime: {state.summary.averageUptime}%</p>
          <p>Active Incidents: {state.summary.activeIncidents}</p>
          <p>Total Checks: {state.summary.totalChecks}</p>
        </div>
      )}
    </div>
  )
}

export default Dashboard