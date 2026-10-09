import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import { AuthProvider } from "@/context/AuthContext"
import { ProtectedRoute } from "@/components/common/ProtectedRoute"
import { LoginPage } from "@/pages/auth/Login"
import { RegisterPage } from "@/pages/auth/Register"
import Dashboard from "@/pages/dashboard/Dashboard"
import Apis from "@/pages/apis/Apis"
import ApiDetail from "@/pages/apis/ApiDetail"
import Incidents from "@/pages/incidents/Incidents"
import IncidentDetail from "@/pages/incidents/IncidentDetail"
import { Route, Routes } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import Notifications from "@/pages/Notifications"
import { PublicStatusPage } from "@/pages/status/PublicStatusPage"

function Placeholder({
  title,
}: {
  title: string
}) {
  return (
    <div className="mx-auto max-w-7xl">
      <h1 className="text-2xl font-bold text-slate-900">
        {title}
      </h1>

      <p className="mt-2 text-slate-500">
        This page is under development.
      </p>
    </div>
  )
}

function App() {
  const { isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-500">Loading...</p>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>

          {/* Auth routes (public) */}
          <Route
            path="/login"
            element={<LoginPage />}
          />

          <Route
            path="/register"
            element={<RegisterPage />}
          />

          {/* Public status page route - no authentication required */}
          <Route
            path="/status/:slug"
            element={<PublicStatusPage />}
          />

          {/* Protected routes - only for authenticated users */}
          <Route
            element={<ProtectedRoute />}
            path="/dashboard">
            <Route
              path="/"
              element={<Dashboard />}
            />

            <Route
              path="/apis"
              element={<Apis />}
            />

            <Route
              path="/apis/:id"
              element={<ApiDetail />}
            />

            <Route
              path="/incidents"
              element={<Incidents />}
            />

            <Route
              path="/notifications"
              element={<Notifications />}
            />

            <Route
              path="/incidents/:id"
              element={<IncidentDetail />}
            />

            <Route
              path="/settings"
              element={<Placeholder title="Settings" />}
            />

          </Route>

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default function Root() {
  return (
    <StrictMode>
      <App />
    </StrictMode>
  )
}

createRoot(document.getElementById("root")!).render(
  <Root />
)