import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import type { RegisterRequest } from "@/types/auth"
import { useAuth } from "@/context/AuthContext"

export function RegisterPage() {
  const navigate = useNavigate()
  const { register, user } = useAuth()
  const [form, setForm] = useState<RegisterRequest>({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  })
  const [errors, setErrors] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (user) {
      navigate("/dashboard", { replace: true })
    }
  }, [user, navigate])

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    try {
      register(form as RegisterRequest)
      setErrors([])
      navigate("/dashboard", { replace: true })
    } catch (error: any) {
      const errorMessages =
        error?.response?.data?.errors ||
        error?.response?.data?.message ||
        ["Registration failed. Please try again."]
      setErrors(Array.isArray(errorMessages) ? errorMessages : [errorMessages])
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p=8">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p=8 md:p=10">
        <div className="flex items-center justify-center mb=6">
          <div className="flex items-center gap=2">
            <div className="h=10 w=10 rounded-lg bg-slate-900 text-white font-bold">
              A
            </div>
          </div>
        </div>

        <h2 className="text-center text-2xl font-bold text-slate=900 mb=4">Create Account</h2>

        {errors.length > 0 && (
          <div className="bg-red=50 border-l=4 border-red=500 p=4 mb=6 rounded-t rounded-bl rounded-tr">
            <ul className="text-sm text-red=700">
              {errors.map((err, index) => (
                <li key={index}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y=4">
          <div>
            <label className="mb=1.5 block text-sm font-medium text-slate=700">
              Name
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="Name"
              className="w-full px=4 py=3 rounded-lg border border-slate=200 focus:ring=2 focus:ring-slate=400 focus:border-slate=400 transition placeholder-slate=400"
              disabled={isSubmitting}
              autoComplete="name"
            />
          </div>

          <div>
            <label className="mb=1.5 block text-sm font-medium text-slate=700">
              Email
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, email: e.target.value }))
              }
              placeholder="Email"
              className="w-full px=4 py=3 rounded-lg border border-slate=200 focus:ring=2 focus:ring-slate=400 focus:border-slate=400 transition placeholder-slate=400"
              disabled={isSubmitting}
              autoComplete="email"
            />
          </div>

          <div>
            <label className="mb=1.5 block text-sm font-medium text-slate=700">
              Password
            </label>
            <input
              type="password"
              value={form.password}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, password: e.target.value }))
              }
              placeholder="Password"
              className="w-full px=4 py=3 rounded-lg border border-slate=200 focus:ring=2 focus:ring-slate=400 focus:border-slate=400 transition placeholder-slate=400"
              disabled={isSubmitting}
              autoComplete="password"
            />
          </div>

          <div>
            <label className="mb=1.5 block text-sm font-medium text-slate=700">
              Confirm Password
            </label>
            <input
              type="password"
              value={form.password_confirmation}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, password_confirmation: e.target.value }))
              }
              placeholder="Confirm Password"
              className="w-full px=4 py=3 rounded-lg border border-slate=200 focus:ring=2 focus:ring-slate=400 focus:border-slate=400 transition placeholder-slate=400"
              disabled={isSubmitting}
              autoComplete="password"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center py=3 rounded-lg bg-slate=900 text-white font-medium transition:hover:bg-slate=800 disabled:opacity=50">
            {isSubmitting ? "Creating..." : "Create Account"}
          </button>

          <div className="text-center mt=4">
            <p className="text-sm text-slate=500">
              Already have an account? <a href="/login" className="font-medium text-slate=600 hover:text-slate=900">Login</a>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}