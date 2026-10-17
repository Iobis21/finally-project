// სერვერის მისამართი (json-server + json-server-auth)
export const API_URL = 'http://localhost:3000'
export const TOKEN_KEY = 'wms-token'

type Method = 'GET' | 'POST' | 'PATCH' | 'DELETE'

// სერვერის შეცდომა სტატუსის კოდით (მაგ. 400 — არასწორი პაროლი)
export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

// ერთი საერთო ფუნქცია ყველა მოთხოვნისთვის (DRY).
// თუ მომხმარებელი შესულია, JWT ტოკენი ავტომატურად ემატება ჰედერში.
async function request<T>(method: Method, path: string, data?: unknown): Promise<T> {
  const token = localStorage.getItem(TOKEN_KEY)
  const headers: Record<string, string> = {}
  if (data) headers['Content-Type'] = 'application/json'
  if (token) headers.Authorization = `Bearer ${token}`

  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
  })

  if (!response.ok) {
    const text = await response.text()
    throw new ApiError(response.status, text.replace(/"/g, ''))
  }

  return response.json()
}

export const apiGet = <T>(path: string) => request<T>('GET', path)
export const apiPost = <T>(path: string, data: unknown) => request<T>('POST', path, data)
export const apiPatch = <T>(path: string, data: unknown) => request<T>('PATCH', path, data)
export const apiDelete = (path: string) => request<unknown>('DELETE', path)
