export const AUTH_URL = "https://functions.poehali.dev/f53ec6b3-3efc-418d-a138-9d6235d3f56c"
export const ADMIN_URL = "https://functions.poehali.dev/5137baa4-984c-416f-a0ef-743441b55d1f"

export interface User {
  id: number
  email: string
  name: string
  role: string
  status: string
  subscription?: string
}

export function saveAuth(token: string, user: User) {
  localStorage.setItem("auth_token", token)
  localStorage.setItem("auth_user", JSON.stringify(user))
}

export function getToken(): string | null {
  return localStorage.getItem("auth_token")
}

export function getUser(): User | null {
  const u = localStorage.getItem("auth_user")
  if (!u) return null
  try { return JSON.parse(u) } catch { return null }
}

export function clearAuth() {
  localStorage.removeItem("auth_token")
  localStorage.removeItem("auth_user")
}

export function isAdmin(user: User | null): boolean {
  return !!user && (user.role === "admin" || user.role === "owner")
}

export function authHeaders(): Record<string, string> {
  const token = getToken()
  return token ? { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" } : { "Content-Type": "application/json" }
}

export async function apiFetch(url: string, options: RequestInit = {}) {
  const token = getToken()
  const headers: Record<string, string> = { "Content-Type": "application/json" }
  if (token) headers["Authorization"] = `Bearer ${token}`
  return fetch(url, { ...options, headers: { ...headers, ...(options.headers as Record<string, string> || {}) } })
}

export async function saveGeneration(data: {
  type: "music" | "jingle" | "video" | "photo" | "text"
  title?: string
  prompt?: string
  result_url?: string
  preview_url?: string
  duration?: number
}) {
  const token = getToken()
  if (!token) return
  fetch(`${AUTH_URL}/generation`, {
    method: "POST",
    headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).catch(() => {})
}