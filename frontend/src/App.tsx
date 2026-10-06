import { Navigate, Route, Routes } from "react-router-dom"

import DashboardLayout from "@/layouts/DashboardLayout"

import Dashboard from "@/pages/dashboard/Dashboard"
import Apis from "@/pages/apis/Apis"
import ApiDetail from "@/pages/apis/ApiDetail"
import Incidents from "@/pages/incidents/Incidents"

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
  return (
    <Routes>

      <Route
        element={<DashboardLayout />}
      >

        <Route
          path="/"
          element={
            <Navigate
              to="/dashboard"
              replace
            />
          }
        />

        <Route
          path="/dashboard"
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
          path="/settings"
          element={<Placeholder title="Settings" />}
        />

      </Route>

    </Routes>
  )
}


export default App