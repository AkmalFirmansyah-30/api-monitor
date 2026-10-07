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