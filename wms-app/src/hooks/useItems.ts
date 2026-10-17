import { useEffect, useState } from 'react'
import { createItem, deleteItem, getItems, updateItem } from '../services/itemService'
import type { Item, NewItem } from '../types'

// ნივთების მართვა: წამოღება, დამატება, რედაქტირება, წაშლა.
// კომპონენტებმა არ იციან, როგორ ხდება მოთხოვნა სერვერზე — მხოლოდ ამ ფუნქციებს იძახებენ.
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

  // სერვერზე შენახვის შემდეგ სიას ვანახლებთ state-ში — გვერდის Refresh არ სჭირდება
  async function addItem(data: NewItem) {
    const created = await createItem(data)
    setItems((prev) => [...prev, created])
  }

  async function editItem(id: number, data: NewItem) {
    const updated = await updateItem(id, data)
    setItems((prev) => prev.map((item) => (item.id === id ? updated : item)))
  }

  async function removeItem(id: number) {
    await deleteItem(id)
    setItems((prev) => prev.filter((item) => item.id !== id))
  }

  return { items, isLoading, error, reload: load, addItem, editItem, removeItem }
}
