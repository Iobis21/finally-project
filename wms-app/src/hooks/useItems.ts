import { useEffect, useState } from 'react'
import { getItems } from '../services/itemService'
import type { Item } from '../types'

// ნივთების წამოღება სერვერიდან + ჩატვირთვის და შეცდომის მდგომარეობები
export function useItems() {
  const [items, setItems] = useState<Item[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    setIsLoading(true)
    setError(null)
    try {
      setItems(await getItems())
    } catch {
      setError('მონაცემები ვერ ჩაიტვირთა. შეამოწმეთ, გაშვებულია თუ არა სერვერი.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  return { items, isLoading, error, reload: load }
}
