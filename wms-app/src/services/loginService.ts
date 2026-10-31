import type { LoginRecord, User } from '../types'
import { apiGet, apiPost } from './apiClient'

export function getLogins() {
  return apiGet<LoginRecord[]>('/visits')
}

// მოწყობილობა, სისტემა და ბრაუზერი — ბრაუზერის userAgent სტრიქონიდან
export function detectDevice(ua = navigator.userAgent) {
  const device = /iPad|Tablet/i.test(ua)
    ? 'პლანშეტი'
    : /Mobi|Android|iPhone/i.test(ua)
      ? 'მობილური'
      : 'კომპიუტერი'
  const os = /Windows NT 10/.test(ua)
    ? 'Windows'
    : /Android/.test(ua)
      ? 'Android'
      : /iPhone|iPad/.test(ua)
        ? 'iOS'
        : /Mac OS/.test(ua)
          ? 'macOS'
          : /Linux/.test(ua)
            ? 'Linux'
            : 'სხვა'
  // თანმიმდევრობა მნიშვნელოვანია: Edge-ის და Opera-ს სტრიქონშიც წერია "Chrome"
  const browser = /Edg\//.test(ua)
    ? 'Edge'
    : /OPR\//.test(ua)
      ? 'Opera'
      : /Firefox\//.test(ua)
        ? 'Firefox'
        : /Chrome\//.test(ua)
          ? 'Chrome'
          : /Safari\//.test(ua)
            ? 'Safari'
            : 'სხვა'
  return { device, os, browser }
}

// შესვლის ჩაწერა — თუ ვერ მოხერხდა, შესვლას არ ვაჩერებთ
export async function logLogin(user: User) {
  try {
    await apiPost<LoginRecord>('/visits', {
      userId: user.id,
      name: `${user.firstName} ${user.lastName}`,
      role: user.role,
      at: new Date().toISOString(),
      ...detectDevice(),
    })
  } catch {
    // ჟურნალი არ არის კრიტიკული
  }
}
