import axios from "axios"

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
})

export type LoginRequest = {
  email: string
  password: string
}

export type RegisterRequest = {
  name: string
  email: string
  password: string
  password_confirmation: string
}

export type AuthResponse = {
  user: {
    id: number
    name: string
    email: string
  }
  token: string
}

export type User = {
  id: number
  name: string
  email: string
  token?: string
}

export async function register(request: RegisterRequest): Promise<AuthResponse> {
  const response = await api.post("/auth/register", request)
  return response.data
}

export async function login(request: LoginRequest): Promise<AuthResponse> {
  const response = await api.post("/auth/login", request)
  return response.data
}

export async function logout(): Promise<void> {
  await api.post("/auth/logout")
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const response = await api.get("/auth/me")
    return response.data.user
  } catch (error) {
    return null
  }
}