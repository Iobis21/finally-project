import { useEffect, useState } from 'react'

// Debounce: მნიშვნელობა განახლდება მხოლოდ მაშინ, როცა მომხმარებელი `delay` მილიწამით შეწყვეტს ბეჭდვას.
// ყოველ ახალ ასოზე წინა ტაიმერი უქმდება და ახალი იწყება.
export function useDebounce<T>(value: T, delay = 300): T {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}
