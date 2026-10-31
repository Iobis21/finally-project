import { useCallback, useEffect, useState } from 'react'

// სიის ჩატვირთვა სერვერიდან (შეკვეთები, მიწოდებები, მომწოდებლები).
// setData — სიის ლოკალურად განახლება შენახვის შემდეგ, თავიდან ჩატვირთვის გარეშე
export function useFetch<T>(loader: () => Promise<T[]>, errorText: string) {
  const [data, setData] = useState<T[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      setData(await loader())
    } catch {
      setError(errorText)
    } finally {
      setIsLoading(false)
    }
  }, [loader, errorText])

  useEffect(() => {
    load()
  }, [load])

  return { data, setData, isLoading, error, reload: load }
}
