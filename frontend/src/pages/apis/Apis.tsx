import type { FormEvent } from "react"
import {
  useEffect,
  useMemo,
  useState,
} from "react"
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  Clock3,
  Edit3,
  Loader2,
  Plus,
  Search,
  Server,
  Trash2,
  X,
  XCircle,
  Zap,
} from "lucide-react"
import { Link } from "react-router-dom"

import {
  checkApi,
  createApi,
  deleteApi,
  getApis,
  updateApi,
} from "@/services/monitoredApiService"

import type {
  ApiStatus,
  HttpMethod,
  MonitoredApi,
} from "@/types/api"

import { ApiStatusBadge } from "@/components/api/ApiStatusBadge"


type ApiFormData = {
  name: string
  url: string
  method: HttpMethod
  timeout: number
  interval: number
}


const emptyForm: ApiFormData = {
  name: "",
  url: "",
  method: "GET",
  timeout: 10,
  interval: 5,
}


function Apis() {
  /*
  |--------------------------------------------------------------------------
  | State
  |--------------------------------------------------------------------------
  */

  const [apis, setApis] = useState<MonitoredApi[]>([])

  const [loading, setLoading] = useState(true)

  const [error, setError] = useState("")

  const [search, setSearch] = useState("")

  const [statusFilter, setStatusFilter] =
    useState<"ALL" | ApiStatus>("ALL")

  const [showFormModal, setShowFormModal] =
    useState(false)

  const [showDeleteModal, setShowDeleteModal] =
    useState(false)

  const [editingApi, setEditingApi] =
    useState<MonitoredApi | null>(null)

  const [deletingApi, setDeletingApi] =
    useState<MonitoredApi | null>(null)

  const [formData, setFormData] =
    useState<ApiFormData>(emptyForm)

  const [formLoading, setFormLoading] =
    useState(false)

  const [deleteLoading, setDeleteLoading] =
    useState(false)

  const [checkingId, setCheckingId] =
    useState<number | null>(null)


  /*
  |--------------------------------------------------------------------------
  | Load APIs
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    console.log("========== APIS PAGE MOUNTED ==========")
    loadApis()
    console.log("========== loadApis DONE ==========")
  }, [])

  useEffect(() => {
    console.log("========== APIS STATE CHANGED ==========")
    console.log("apis:", apis)
    console.log("apis.length:", apis.length)
    console.log("search:", search)
    console.log("statusFilter:", statusFilter)
    console.log("====================================")
  }, [apis])


  async function loadApis() {
    try {
      console.log("========== LOAD APIS START ==========")

      setLoading(true)
      setError("")

      const data = await getApis()

      console.log("DATA FROM getApis():", data)
      console.log("DATA LENGTH:", data.length)

      setApis(data)

      console.log("setApis() called with:", data)

      console.log("========== AFTER SETSTATE ==========")
      console.log("apis.length:", apis.length)

      console.log("====================================")
    } catch (error) {
      console.error("LOAD APIS ERROR:", error)

      setError("Failed to load APIs.")
      setApis([])
    } finally {
      setLoading(false)
    }
  }


  /*
  |--------------------------------------------------------------------------
  | Filtering
  |--------------------------------------------------------------------------
  */

  const filteredApis = useMemo(() => {
    const normalizedSearch =
      search.trim().toLowerCase()

    return apis.filter((api) => {
      const matchesSearch =
        normalizedSearch === "" ||
        api.name
          .toLowerCase()
          .includes(normalizedSearch) ||
        api.url
          .toLowerCase()
          .includes(normalizedSearch)

      const matchesStatus =
        statusFilter === "ALL" ||
        api.status === statusFilter

      return (
        matchesSearch &&
        matchesStatus
      )
    })
  }, [
    apis,
    search,
    statusFilter,
  ])


  /*
  |--------------------------------------------------------------------------
  | Form modal
  |--------------------------------------------------------------------------
  */

  function openAddModal() {
    setEditingApi(null)
    setFormData(emptyForm)
    setShowFormModal(true)
  }


  function openEditModal(
    monitoredApi: MonitoredApi,
  ) {
    setEditingApi(monitoredApi)

    setFormData({
      name: monitoredApi.name,
      url: monitoredApi.url,
      method: monitoredApi.method,
      timeout: monitoredApi.timeout,
      interval: monitoredApi.interval,
    })

    setShowFormModal(true)
  }


  function closeFormModal() {
    if (formLoading) {
      return
    }

    setShowFormModal(false)
    setEditingApi(null)
    setFormData(emptyForm)
  }


  function handleFormChange(
    field: keyof ApiFormData,
    value: string | number,
  ) {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }))
  }


  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    if (!formData.name.trim()) {
      setError("API name is required.")
      return
    }

    if (!formData.url.trim()) {
      setError("API URL is required.")
      return
    }

    if (formData.timeout < 1) {
      setError(
        "Timeout must be at least 1 second.",
      )
      return
    }

    if (formData.timeout > 120) {
      setError(
        "Timeout cannot exceed 120 seconds.",
      )
      return
    }

    if (formData.interval < 1) {
      setError(
        "Interval must be at least 1 minute.",
      )
      return
    }

    if (formData.interval > 1440) {
      setError(
        "Interval cannot exceed 1440 minutes.",
      )
      return
    }

    try {
      setFormLoading(true)
      setError("")

      if (editingApi) {
        const updatedApi =
          await updateApi(
            editingApi.id,
            formData,
          )

        setApis((current) =>
          current.map((item) =>
            item.id === updatedApi.id
              ? updatedApi
              : item,
          ),
        )
      } else {
        const newApi =
          await createApi(formData)

        setApis((current) => [
          newApi,
          ...current,
        ])
      }

      closeFormModal()

      /*
       * Reload from backend so the UI always
       * reflects the actual database state.
       */
      await loadApis()
    } catch (err) {
      console.error(
        "Failed to save API:",
        err,
      )

      setError(
        "Failed to save API. Please check the form and backend.",
      )
    } finally {
      setFormLoading(false)
    }
  }


  /*
  |--------------------------------------------------------------------------
  | Delete
  |--------------------------------------------------------------------------
  */

  function openDeleteModal(
    monitoredApi: MonitoredApi,
  ) {
    setDeletingApi(monitoredApi)
    setShowDeleteModal(true)
  }


  function closeDeleteModal() {
    if (deleteLoading) {
      return
    }

    setShowDeleteModal(false)
    setDeletingApi(null)
  }


  async function handleDelete() {
    if (!deletingApi) {
      return
    }

    try {
      setDeleteLoading(true)
      setError("")

      await deleteApi(
        deletingApi.id,
      )

      setApis((current) =>
        current.filter(
          (item) =>
            item.id !== deletingApi.id,
        ),
      )

      closeDeleteModal()
    } catch (err) {
      console.error(
        "Failed to delete API:",
        err,
      )

      setError(
        "Failed to delete API.",
      )
    } finally {
      setDeleteLoading(false)
    }
  }


/*
   |--------------------------------------------------------------------------
   | Check Now
   |--------------------------------------------------------------------------
   |
   | Melakukan HTTP request nyata ke target API.
   | Hasil disimpan ke database dan state diperbarui.
   |
   */

  async function handleCheckNow(
    monitoredApi: MonitoredApi,
  ) {
    try {
      setCheckingId(monitoredApi.id)

      /*
       * Jalankan check API ke backend.
       * Request POST /api/apis/{id}/check akan:
       1. Mengirim HTTP request ke target API
       2. Menyimpan record ke api_checks
       3. Memperbarui monitored_apis di database
       */
      await checkApi(monitoredApi.id)

      /*
       * Reload data dari backend sehingga state selalu
       * mencerminkan kondisi aktual di database.
       */
      await loadApis()
    } catch (err) {
      console.error(
        "Check failed:",
        err,
      )
    } finally {
      setCheckingId(null)
    }
  }


  /*
  |--------------------------------------------------------------------------
  | Stats
  |--------------------------------------------------------------------------
  */

  const totalApis = apis.length

  const upApis = apis.filter(
    (api) => api.status === "UP",
  ).length

  const degradedApis = apis.filter(
    (api) =>
      api.status === "DEGRADED",
  ).length

  const downApis = apis.filter(
    (api) => api.status === "DOWN",
  ).length


  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (
    <div className="mx-auto max-w-7xl space-y-6">


      {/* ================================================================
          HEADER
      ================================================================= */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <div className="flex items-center gap-2">
            <Activity
              className="h-6 w-6 text-emerald-600"
            />

            <h1 className="text-2xl font-bold text-slate-900">
              API Management
            </h1>
          </div>

          <p className="mt-1 text-sm text-slate-500">
            Monitor and manage your APIs
          </p>
        </div>


        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          <Plus className="h-4 w-4" />

          Add API
        </button>

      </div>


      {/* ================================================================
          ERROR
      ================================================================= */}

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">

          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

          <div className="flex-1">
            <p className="text-sm font-medium">
              {error}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setError("")}
            className="rounded-md p-1 hover:bg-red-100"
          >
            <X className="h-4 w-4" />
          </button>

        </div>
      )}


      {/* ================================================================
          STATS
      ================================================================= */}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">

        <StatCard
          icon={
            <Server className="h-5 w-5" />
          }
          label="Total APIs"
          value={totalApis}
        />

        <StatCard
          icon={
            <CheckCircle2 className="h-5 w-5" />
          }
          label="Operational"
          value={upApis}
        />

        <StatCard
          icon={
            <Clock3 className="h-5 w-5" />
          }
          label="Degraded"
          value={degradedApis}
        />

        <StatCard
          icon={
            <XCircle className="h-5 w-5" />
          }
          label="Down"
          value={downApis}
        />

      </div>


      {/* ================================================================
          FILTERS
      ================================================================= */}

      <div className="flex flex-col gap-3 sm:flex-row">

        <div className="relative flex-1">

          <Search
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value,
              )
            }
            placeholder="Search APIs..."
            className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
          />

        </div>


        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(
              event.target
                .value as
                | "ALL"
                | ApiStatus,
            )
          }
          className="h-11 rounded-lg border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
        >
          <option value="ALL">
            All Status
          </option>

          <option value="UP">
            UP
          </option>

          <option value="DEGRADED">
            DEGRADED
          </option>

          <option value="DOWN">
            DOWN
          </option>
        </select>

      </div>


      {/* ================================================================
          CONTENT
      ================================================================= */}

      {loading ? (

        <div className="flex min-h-80 items-center justify-center rounded-xl border border-slate-200 bg-white">

          <div className="flex flex-col items-center gap-3 text-slate-500">

            <Loader2 className="h-7 w-7 animate-spin" />

            <p className="text-sm">
              Loading APIs...
            </p>

          </div>

        </div>

      ) : filteredApis.length === 0 ? (

        <div className="flex min-h-80 flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-6 text-center">

          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">

            <Server className="h-6 w-6 text-slate-500" />

          </div>

          <h2 className="mt-4 text-lg font-semibold text-slate-900">
            No APIs found
          </h2>

          <p className="mt-1 max-w-md text-sm text-slate-500">
            {search || statusFilter !== "ALL"
              ? "Try changing your search or status filter."
              : "Add your first API to start monitoring."}
          </p>

          {!search &&
            statusFilter === "ALL" && (
              <button
                type="button"
                onClick={openAddModal}
                className="mt-5 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
              >
                <Plus className="h-4 w-4" />
                Add API
              </button>
            )}

        </div>

      ) : (

        <div className="space-y-3">

          {filteredApis.map(
            (monitoredApi) => (
              <ApiCard
                key={monitoredApi.id}
                api={monitoredApi}
                checking={
                  checkingId ===
                  monitoredApi.id
                }
                onCheck={() =>
                  handleCheckNow(
                    monitoredApi,
                  )
                }
                onEdit={() =>
                  openEditModal(
                    monitoredApi,
                  )
                }
                onDelete={() =>
                  openDeleteModal(
                    monitoredApi,
                  )
                }
              />
            ),
          )}

        </div>

      )}


      {/* ================================================================
          FORM MODAL
      ================================================================= */}

      {showFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">

          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">

            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">

              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  {editingApi
                    ? "Edit API"
                    : "Add API"}
                </h2>

                <p className="mt-0.5 text-sm text-slate-500">
                  {editingApi
                    ? "Update monitoring configuration."
                    : "Add an API to monitor."}
                </p>
              </div>

              <button
                type="button"
                onClick={closeFormModal}
                disabled={formLoading}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>

            </div>


            <form
              onSubmit={handleSubmit}
              className="space-y-5 p-6"
            >

              {/* Name */}

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  API Name
                </label>

                <input
                  type="text"
                  value={formData.name}
                  onChange={(event) =>
                    handleFormChange(
                      "name",
                      event.target.value,
                    )
                  }
                  placeholder="Production API"
                  disabled={formLoading}
                  className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 disabled:bg-slate-50"
                />
              </div>


              {/* URL */}

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  URL
                </label>

                <input
                  type="url"
                  value={formData.url}
                  onChange={(event) =>
                    handleFormChange(
                      "url",
                      event.target.value,
                    )
                  }
                  placeholder="https://api.example.com/health"
                  disabled={formLoading}
                  className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 disabled:bg-slate-50"
                />
              </div>


              {/* Method */}

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  HTTP Method
                </label>

                <select
                  value={formData.method}
                  onChange={(event) =>
                    handleFormChange(
                      "method",
                      event.target.value as HttpMethod,
                    )
                  }
                  disabled={formLoading}
                  className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 disabled:bg-slate-50"
                >
                  <option value="GET">
                    GET
                  </option>

                  <option value="POST">
                    POST
                  </option>

                  <option value="PUT">
                    PUT
                  </option>

                  <option value="PATCH">
                    PATCH
                  </option>

                  <option value="DELETE">
                    DELETE
                  </option>
                </select>
              </div>


              {/* Timeout + Interval */}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Timeout
                    <span className="ml-1 text-xs text-slate-400">
                      (seconds)
                    </span>
                  </label>

                  <input
                    type="number"
                    min={1}
                    max={120}
                    value={formData.timeout}
                    onChange={(event) =>
                      handleFormChange(
                        "timeout",
                        Number(
                          event.target.value,
                        ),
                      )
                    }
                    disabled={formLoading}
                    className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 disabled:bg-slate-50"
                  />
                </div>


                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Check Interval
                    <span className="ml-1 text-xs text-slate-400">
                      (minutes)
                    </span>
                  </label>

                  <input
                    type="number"
                    min={1}
                    max={1440}
                    value={formData.interval}
                    onChange={(event) =>
                      handleFormChange(
                        "interval",
                        Number(
                          event.target.value,
                        ),
                      )
                    }
                    disabled={formLoading}
                    className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 disabled:bg-slate-50"
                  />
                </div>

              </div>


              {/* Buttons */}

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">

                <button
                  type="button"
                  onClick={closeFormModal}
                  disabled={formLoading}
                  className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={formLoading}
                  className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {formLoading && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}

                  {editingApi
                    ? "Save Changes"
                    : "Create API"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}


      {/* ================================================================
          DELETE MODAL
      ================================================================= */}

      {showDeleteModal &&
        deletingApi && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">

            <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">

              <div className="p-6">

                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-50">

                  <Trash2 className="h-5 w-5 text-red-600" />

                </div>

                <h2 className="mt-4 text-lg font-semibold text-slate-900">
                  Delete API?
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Are you sure you want to delete{" "}
                  <span className="font-medium text-slate-700">
                    {deletingApi.name}
                  </span>
                  ? This action cannot be undone.
                </p>

              </div>


              <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4">

                <button
                  type="button"
                  onClick={closeDeleteModal}
                  disabled={deleteLoading}
                  className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleteLoading}
                  className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {deleteLoading && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}

                  Delete API
                </button>

              </div>

            </div>

          </div>
        )}

    </div>
  )
}


/*
|--------------------------------------------------------------------------
| Stat Card
|--------------------------------------------------------------------------
*/

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: number
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">

      <div className="flex items-center gap-3">

        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
          {icon}
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            {label}
          </p>

          <p className="mt-0.5 text-xl font-bold text-slate-900">
            {value}
          </p>
        </div>

      </div>

    </div>
  )
}


/*
|--------------------------------------------------------------------------
| API Card
|--------------------------------------------------------------------------
*/

function ApiCard({
  api,
  checking,
  onCheck,
  onEdit,
  onDelete,
}: {
  api: MonitoredApi
  checking: boolean
  onCheck: () => void
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white transition hover:border-slate-300 hover:shadow-sm">

      <div className="p-5">

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

          {/* Left */}

          <div className="min-w-0 flex-1">

            <div className="flex flex-wrap items-center gap-2">

              <Link
                to={`/apis/${api.id}`}
                className="truncate text-base font-semibold text-slate-900 hover:text-emerald-600"
              >
                {api.name}
              </Link>

              <ApiStatusBadge
                status={api.status}
              />

            </div>


            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500">

              <span className="font-mono text-xs">
                {api.url}
              </span>

              <span className="hidden text-slate-300 sm:inline">
                •
              </span>

              <span className="font-medium">
                {api.method}
              </span>

            </div>

          </div>


          {/* Middle stats */}

          <div className="flex items-center gap-6 text-sm">

            <div>
              <p className="text-xs text-slate-400">
                Response
              </p>

              <p className="mt-1 font-semibold text-slate-800">
                {api.responseTime !== null
                  ? `${api.responseTime} ms`
                  : "—"}
              </p>
            </div>


            <div>
              <p className="text-xs text-slate-400">
                Uptime
              </p>

              <p className="mt-1 font-semibold text-slate-800">
                {api.uptime}%
              </p>
            </div>


            <div className="hidden md:block">
              <p className="text-xs text-slate-400">
                Last checked
              </p>

              <p className="mt-1 font-medium text-slate-700">
                {api.lastChecked ??
                  "Never"}
              </p>
            </div>

          </div>


          {/* Actions */}

          <div className="flex items-center gap-2">

            <button
              type="button"
              onClick={onCheck}
              disabled={checking}
              title="Check now"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {checking ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Zap className="h-4 w-4" />
              )}

              <span className="hidden sm:inline">
                Check Now
              </span>
            </button>


            <button
              type="button"
              onClick={onEdit}
              title="Edit"
              className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50 hover:text-slate-800"
            >
              <Edit3 className="h-4 w-4" />
            </button>


            <button
              type="button"
              onClick={onDelete}
              title="Delete"
              className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600"
            >
              <Trash2 className="h-4 w-4" />
            </button>

          </div>

        </div>

      </div>

    </div>
  )
}


export default Apis