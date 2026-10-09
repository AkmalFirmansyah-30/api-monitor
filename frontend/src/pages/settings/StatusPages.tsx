import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { getStatusPages, createStatusPage, updateStatusPage, deleteStatusPage } from "@/services/statusPageService"
import type { StatusPage } from "@/types/statusPage"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { Loader2 } from "lucide-react"
import { Plus } from "lucide-react"
import { Eye, Copy } from "lucide-react"

function StatusPageTable({ statusPages: pages }: { statusPages: StatusPage[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Slug</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Public</TableHead>
          <TableHead>APIs</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {pages.map((page) => (
          <TableKey key={page.id} page={page} />
        ))}
      </TableBody>
    </Table>
  )
}

function TableKey({ page }: { page: StatusPage }) {
  const apiCount = page.statusPageApis?.length || 0

  return (
    <TableRow>
      <TableCell>
        <div className="font-medium text-slate-900">{page.name}</div>
        <div className="text-slate-500 text-xs">{page.slug}</div>
      </TableCell>
      <TableCell>{page.slug}</TableCell>
      <TableCell>{page.description || "—"}</TableCell>
      <TableCell>
        <span
          className={`inline-flex items-center gap-1 rounded bg-${page.is_public ? "emerald-100" : "red-100"} px-2.5 py-1 text-emerald-600 text-xs ${page.is_public ? "text-emerald-600" : "text-red-600"}`}
        >
          {page.is_public ? "Public" : "Private"}
        </span>
      </TableCell>
      <TableCell>{apiCount}</TableCell>
      <TableCell className="text-sm">
        <Button variant="link" size="icon" onClick={() => window.open(`/status/${page.slug}`, "_blank")}>
          <Eye className="h-4 w-4" />
        </Button>
        <Button variant="link" size="icon" onClick={() => window.open(`/status/${page.slug}/copy`, "_blank")}>
          <Copy className="h-4 w-4" />
        </Button>
      </TableCell>
    </TableRow>
  )
}

export function StatusPages() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [statusPages, setStatusPages] = useState<StatusPage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [editingPage, setEditingPage] = useState<StatusPage | null>(null)
  const [deletingPage, setDeletingPage] = useState<StatusPage | null>(null)
  const [copyUrl, setCopyUrl] = useState<string | null>(null)

  const load = async () => {
    if (!user) return
    try {
      setLoading(true)
      setError(null)
      const data = await getStatusPages()
      setStatusPages(data)
    } catch (err) {
      console.error("Failed to load status pages:", err)
      setError("Failed to load status pages.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [user])

  function openCreateModal() {
    setEditingPage(null)
    setShowCreateModal(true)
  }

  function openEditModal(page: StatusPage) {
    setEditingPage(page)
    setShowCreateModal(true)
  }

  function openDeleteModal(page: StatusPage) {
    setDeletingPage(page)
    setShowDeleteModal(true)
  }

  async function handleFormSubmit(data: {
    name: string
    slug: string
    description: string | null
    isPublic: boolean
    apiIds: number[]
  }) {
    try {
      setError(null)
      if (editingPage) {
        await updateStatusPage(editingPage.id, {
          name: data.name,
          slug: data.slug,
          description: data.description,
          isPublic: data.isPublic,
          apiIds: data.apiIds,
        })
        setEditingPage(null)
      } else {
        await createStatusPage({
          name: data.name,
          slug: data.slug,
          description: data.description,
          isPublic: data.isPublic,
          apiIds: data.apiIds,
        })
      }
      setShowCreateModal(false)
      await load()
    } catch (err) {
      console.error("Failed to save status page:", err)
      setError("Failed to save status page.")
    }
  }

  async function handleDelete() {
    if (!deletingPage) return
    try {
      setError(null)
      await deleteStatusPage(deletingPage.id)
      setShowDeleteModal(false)
      await load()
    } catch (err) {
      console.error("Failed to delete status page:", err)
      setError("Failed to delete status page.")
    }
  }

  async function handleCopyUrl(slug: string) {
    try {
      setCopyUrl(`/status/${slug}`)
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(`/status/${slug}`)
      }
    } catch (err) {
      setCopyUrl(`/status/${slug}`)
    }
  }

  if (!user) {
    return <div className="min-h-screen p-6"><p className="text-slate-500">Please login to view status pages.</p></div>
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-7 w-7 animate-spin" />
          <p className="text-slate-500">Loading status pages...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md mb-4">
        <p className="text-red-700">{error}</p>
      </div>
    )
  }

  const filteredPages = useMemo(() => statusPages, [statusPages])

  return (
    <div className="min-h-screen bg-slate-50 p-6 sm:p:8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">Status Pages</h1>
          <p className="text-slate-500 mt-1">Manage your public status pages</p>
        </div>

        {showCreateModal && (
          <Dialog open={true} onOpenChange={(v) => setShowCreateModal(v)}>
            <DialogContent className="sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingPage ? "Edit Status Page" : "Create Status Page"}
                </DialogTitle>
              </DialogHeader>
              <DialogDescription>
                {editingPage ? (
                  `Update "${editingPage.name}" status page`
                ) : (
                  "Create a new status page with selected monitored APIs."
                )}
              </DialogDescription>

              <form
                onSubmit={async (event) => {
                  event.preventDefault()
                  const nameInput = event.target.elements.namedItem("name") as HTMLInputElement
                  const slugInput = event.target.elements.namedItem("slug") as HTMLInputElement
                  const descInput = event.target.elements.namedItem("description") as HTMLInputElement
                  const isInput = event.target.elements.namedItem("isPublic") as HTMLInputElement
                  const apiIdsInput = event.target.elements.namedItem("apiIds") as HTMLInputElement

                  const rawIds = apiIdsInput
                    ? apiIdsInput.value
                        .split(",")
                        .map((v) => parseInt(v.trim(), 10))
                        .filter((v) => !isNaN(v))
                    : []

                  const data = {
                    name: nameInput.value.trim(),
                    slug: slugInput.value.trim(),
                    description: descInput.value.trim() || null,
                    isPublic: isInput.checked,
                    apiIds: rawIds,
                  }

                  if (!data.name || !data.slug) {
                    alert("Name and slug are required.")
                    return
                  }
                  if (!/^[a-z0-9]+(?:[._-]?[a-z0-9]+)*$/.test(data.slug)) {
                    alert("Slug must be lowercase URL-safe format without spaces.")
                    return
                  }
                  await handleFormSubmit(data)
                }}
              >
                <div className="grid gap-4 pb-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                    <Input
                      type="text"
                      name="name"
                      defaultValue={editingPage?.name || ""}
                      required
                      className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Slug</label>
                    <Input
                      type="text"
                      name="slug"
                      defaultValue={editingPage?.slug || ""}
                      required
                      placeholder="acme-api"
                      className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                    <Input
                      type="text"
                      name="description"
                      defaultValue={editingPage?.description || ""}
                      placeholder="Current status of Acme APIs"
                      className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Public</label>
                    <Input
                      type="checkbox"
                      name="isPublic"
                      checked={editingPage?.is_public ?? true}
                      className="rounded border-slate-300 bg-slate-0 py-1.5 focus:ring-slate-500"
                    />
                    <span className="ml-2 text-sm text-slate-500">
                      Make this status page publicly accessible
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Selected APIs</label>
                    <Input
                      type="text"
                      name="apiIds"
                      defaultValue={
                        editingPage?.statusPageApis
                          ?.map((pa) => pa.monitoredApi?.id.toString())
                          .join(",")
                          || ""
                      }
                      placeholder="1, 2, 3"
                      className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                      disabled
                    />
                    <p className="mt-1 text-xs text-slate-400">
                      API IDs are auto-populated from owned monitored APIs.
                    </p>
                  </div>
                </div>

                <DialogFooter className="justify-end gap-3">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setShowCreateModal(false)
                      setEditingPage(null)
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">{editingPage ? "Update" : "Create"}</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}

        {showDeleteModal && deletingPage && (
          <Dialog open={true} onOpenChange={(v) => setShowDeleteModal(v)}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Delete Status Page</DialogTitle>
              </DialogHeader>
              <DialogDescription>
                Are you sure you want to delete "{deletingPage.name}"?
                This will remove the status page but keep all monitored APIs and checks.
              </DialogDescription>
              <DialogFooter className="justify-end gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancel
                </Button>
                <Button onClick={() => { handleDelete(); setShowDeleteModal(false) }}>Delete</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        <div className="bg-white rounded-xl overflow-hidden shadow-sm">
          {filteredPages.length === 0 ? (
            <div className="p-8 text-center">
              <Loader2 className="h-6 w-6 mx-auto mb-4 animate-spin text-slate-400" />
              <p className="text-slate-500">No status pages found.</p>
              <p className="mt-2 text-sm text-slate-400">
                Create your first status page to get started.
              </p>
              <Button
                onClick={openCreateModal}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
              >
                <Plus className="h-4 w-4" />
                Create Status Page
              </Button>
            </div>
          ) : (
            <StatusPageTable statusPages={filteredPages} />
          )}
        </div>

        {copyUrl && (
          <div className="mt-4 flex items-center gap-2 rounded bg-emerald-100 px-4 py-2 text-emerald-600 text-sm">
            <Copy className="h-4 w-4" />
            <span>Public URL copied: {copyUrl}</span>
          </div>
        )}
      </div>
    </div>
  )
}