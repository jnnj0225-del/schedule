import { useEffect, useState } from 'react'

export function useLocalStorageState<T>(key: string, initial: () => T) {
  const [state, setState] = useState<T>(() => {
    const raw = localStorage.getItem(key)
    if (raw) {
      try {
        return JSON.parse(raw) as T
      } catch {
        // fall through to initial value on corrupt data
      }
    }
    return initial()
  })

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(state))
  }, [key, state])

  return [state, setState] as const
}

export function newId(): string {
  return Math.random().toString(36).slice(2, 10)
}
