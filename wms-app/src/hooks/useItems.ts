import { useEffect, useRef, useState } from 'react'
import { loadItemsFallback, saveItemsCache } from '../services/itemCache'
import { createItem, deleteItem, getItem, getItems, updateItem } from '../services/itemService'
import type { Item, NewItem } from '../types'

export type DataSource = 'server' | 'cache' | 'demo'

// ნივთების მართვა: წამოღება, დამატება, რედაქტირება, წაშლა.
// კომპონენტებმა არ იციან, როგორ ხდება მოთხოვნა სერვერზე — მხოლოდ ამ ფუნქციებს იძახებენ.
export function useItems() {
  const [items, setItems] = useState<Item[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [source, setSource] = useState<DataSource>('server')
  // ყოველ ჩატვირთვას აქვს ნომერი — თუ ძველი მოთხოვნის პასუხი გვიან მოვიდა, მას ვაიგნორებთ (Race Condition)
  const requestIdRef = useRef(0)

  async function load() {
    const requestId = ++requestIdRef.current
    const timerLabel = `⏱ items:load #${requestId}` // უნიკალური სახელი — პარალელური ჩატვირთვები არ ეჯახება
    setIsLoading(true)
    setError(null)
    if (import.meta.env.DEV) console.time(timerLabel) // რამდენ ხანს იტვირთება მონაცემები (მხოლოდ dev)
    try {
      const data = await getItems()
      if (requestId !== requestIdRef.current) return // უფრო ახალი მოთხოვნა უკვე გაიგზავნა
      setItems(data)
      setSource('server')
      saveItemsCache(data)
      if (import.meta.env.DEV) {
        console.table(
          data.map(({ sku, name, quantity, minQuantity }) => ({
            sku,
            name,
            quantity,
            minQuantity,
          })),
        )
      }
    } catch (err) {
      if (requestId !== requestIdRef.current) return
      // სერვერი გათიშულია (500 ან ინტერნეტი არ არის) — გადავდივართ ლოკალურ რეჟიმზე
      if (import.meta.env.DEV) console.warn('სერვერი მიუწვდომელია, ჩაირთო ლოკალური რეჟიმი:', err)
      const fallback = loadItemsFallback()
      setItems(fallback.items)
      setSource(fallback.source)
    } finally {
      if (import.meta.env.DEV) console.timeEnd(timerLabel)
      if (requestId === requestIdRef.current) setIsLoading(false)
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

  // ჩამოწერა — უარყოფითი ნაშთისგან დაცვით.
  // ჩაწერამდე სერვერიდან ვიღებთ უახლეს ნაშთს: თუ სხვამ უკვე ჩამოწერა (Race Condition), ვაჩერებთ.
  async function writeOffItem(id: number, amount: number) {
    const fresh = await getItem(id)
    if (amount > fresh.quantity) {
      throw new Error(`ნაშთი შეიცვალა — ახლა მხოლოდ ${fresh.quantity} ერთეულია`)
    }
    const updated = await updateItem(id, { quantity: fresh.quantity - amount })
    setItems((prev) => prev.map((item) => (item.id === id ? updated : item)))
  }

  async function removeItem(id: number) {
    await deleteItem(id)
    setItems((prev) => prev.filter((item) => item.id !== id))
  }

  return {
    items,
    isLoading,
    error,
    source,
    isOffline: source !== 'server',
    reload: load,
    addItem,
    editItem,
    writeOffItem,
    removeItem,
  }
}
