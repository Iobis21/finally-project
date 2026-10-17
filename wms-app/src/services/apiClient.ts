// სერვერის მისამართი (json-server)
export const API_URL = 'http://localhost:3000'

// საერთო ფუნქცია GET მოთხოვნებისთვის
export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(`${API_URL}${path}`)

  if (!response.ok) {
    throw new Error(`სერვერის შეცდომა: ${response.status}`)
  }

  return response.json()
}

// საერთო ფუნქცია PATCH მოთხოვნებისთვის (ჩანაწერის ნაწილობრივი შეცვლა)
export async function apiPatch<T>(path: string, data: Partial<T>): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    throw new Error(`სერვერის შეცდომა: ${response.status}`)
  }

  return response.json()
}
