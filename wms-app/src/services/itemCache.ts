import { fallbackItems } from '../data/fallbackItems'
import type { Item } from '../types'

const CACHE_KEY = 'wms-items-cache'

// ბოლოს წარმატებით ჩატვირთული მონაცემები ინახება ბრაუზერში
export function saveItemsCache(items: Item[]) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ items, savedAt: new Date().toISOString() }))
  } catch {
    // localStorage შეიძლება იყოს გამორთული — ქეში უბრალოდ არ შეინახება
  }
}

// სერვერის გათიშვისას: ჯერ ქეში, თუ ის არ არის — დემო მონაცემები
export function loadItemsFallback(): { items: Item[]; source: 'cache' | 'demo'; savedAt?: string } {
  try {
    const saved = localStorage.getItem(CACHE_KEY)
    if (saved) {
      const { items, savedAt } = JSON.parse(saved)
      if (Array.isArray(items) && items.length > 0) return { items, source: 'cache', savedAt }
    }
  } catch {
    // დაზიანებული ქეში — გადავდივართ დემო მონაცემებზე
  }
  return { items: fallbackItems, source: 'demo' }
}
