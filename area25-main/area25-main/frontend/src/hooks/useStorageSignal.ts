import { useEffect, useState } from 'react'

export function useStorageSignal(eventName: string, getValue: () => number) {
  const [value, setValue] = useState<number>(() => getValue())

  useEffect(() => {
    function update() { setValue(getValue()) }
    window.addEventListener('storage', update)
    window.addEventListener(eventName, update as EventListener)
    return () => {
      window.removeEventListener('storage', update)
      window.removeEventListener(eventName, update as EventListener)
    }
  }, [eventName, getValue])

  return value
}


