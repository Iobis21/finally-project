import { useEffect, useRef, type RefObject } from 'react'

// Event Delegation: ერთი click მსმენელი მშობელ ელემენტზე (table / ul),
// ნაცვლად იმისა, რომ ყველა ღილაკს თავისი მსმენელი ჰქონდეს.
// event.target-ით ვარკვევთ, რომელ ღილაკს დააჭირეს (data-action და data-id ატრიბუტებით).
export function useEventDelegation<T extends HTMLElement>(
  onAction: (action: string, id: number) => void,
): RefObject<T | null> {
  const containerRef = useRef<T>(null)
  const handlerRef = useRef(onAction)
  handlerRef.current = onAction

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    function handleClick(event: MouseEvent) {
      const button = (event.target as HTMLElement).closest<HTMLElement>('[data-action]')
      if (!button || !container?.contains(button)) return

      handlerRef.current(button.dataset.action!, Number(button.dataset.id))
    }

    container.addEventListener('click', handleClick)
    return () => container.removeEventListener('click', handleClick)
  }, [])

  return containerRef
}
