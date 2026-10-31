import type { Message } from '../types'
import { apiGet, apiPost } from './apiClient'

export function getMessages() {
  return apiGet<Message[]>('/messages')
}

export function createMessage(message: Omit<Message, 'id'>) {
  return apiPost<Message>('/messages', message)
}

// რომელი შეტყობინებაა წაკითხული — თითო მომხმარებლისთვის ბოლო ნახვის დრო (localStorage)
const seenKey = (userId: number) => `wms-messages-seen-${userId}`

export function getLastSeen(userId: number) {
  try {
    return localStorage.getItem(seenKey(userId)) ?? ''
  } catch {
    return ''
  }
}

export function markSeen(userId: number) {
  try {
    localStorage.setItem(seenKey(userId), new Date().toISOString())
  } catch {
    // შენახვა ვერ მოხერხდა — უბრალოდ წაუკითხავად დარჩება
  }
}

// წაუკითხავი = სხვისი დაწერილი და ბოლო ნახვის შემდეგ
export function countUnread(messages: Message[], userId: number) {
  const seen = getLastSeen(userId)
  return messages.filter((m) => m.userId !== userId && m.createdAt > seen).length
}
