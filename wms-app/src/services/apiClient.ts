// სერვერის მისამართი (json-server)
export const API_URL = 'http://localhost:3000'

type Method = 'GET' | 'POST' | 'PATCH' | 'DELETE'

// ერთი საერთო ფუნქცია ყველა მოთხოვნისთვის (DRY)
async function request<T>(method: Method, path: string, data?: unknown): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers: data ? { 'Content-Type': 'application/json' } : undefined,
    body: data ? JSON.stringify(data) : undefined,
  })

  if (!response.ok) {
    throw new Error(`სერვერის შეცდომა: ${response.status}`)
  }

  return response.json()
}

export const apiGet = <T>(path: string) => request<T>('GET', path)
export const apiPost = <T>(path: string, data: unknown) => request<T>('POST', path, data)
export const apiPatch = <T>(path: string, data: unknown) => request<T>('PATCH', path, data)
export const apiDelete = (path: string) => request<unknown>('DELETE', path)
