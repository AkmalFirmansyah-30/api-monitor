import axios, { type AxiosInstance, type AxiosRequestConfig } from "axios"

const api: AxiosInstance = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
})

// Attach Bearer token from auth state to all requests
let currentToken: string | null = null

api.interceptors.request.use(
  (config) => {
    if (currentToken) {
      config.headers.Authorization = `Bearer ${currentToken}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Update global token when auth state changes
export const setAuthToken = (token: string | null) => {
  currentToken = token
}

api.interceptors.response.use(
  (response) => response,
  (error: any) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      setAuthToken(null)

      return Promise.reject(error)
    }

    return Promise.reject(error)
  },
)

export default api