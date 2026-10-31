import { useEffect, useState } from 'react'

export type Theme = 'light' | 'dark'

const THEME_KEY = 'wms-theme'

// საწყისი თემა: შენახული არჩევანი, თუ არა — სისტემის (ტელეფონის / Windows-ის) პარამეტრი
function getInitialTheme(): Theme {
  try {
    const saved = localStorage.getItem(THEME_KEY)
    if (saved === 'light' || saved === 'dark') return saved
  } catch {
    // localStorage შეიძლება დაბლოკილი იყოს (პირადი რეჟიმი)
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

// მუქი / ღია თემა: <html>-ს ემატება კლასი .dark, არჩევანი ინახება localStorage-ში
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    try {
      localStorage.setItem(THEME_KEY, theme)
    } catch {
      // შენახვა ვერ მოხერხდა — თემა მაინც მუშაობს ამ სესიაში
    }
  }, [theme])

  const toggleTheme = () => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))

  return { theme, toggleTheme }
}
