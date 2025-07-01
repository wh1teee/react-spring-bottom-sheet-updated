'use client'
// Keeps track of wether everything is good to go or not, in the most efficient way possible

import { useCallback, useEffect, useState } from 'react'

export function useReady() {
  const [ready, setReady] = useState(false)
  const [readyMap, updateReadyMap] = useState<Record<string, boolean>>({})

  const registerReady = useCallback((key: string) => {
    // Register the check we're gonna wait for until it's ready
    updateReadyMap((ready) => ({ ...ready, [key]: false }))

    return () => {
      // Set it to ready
      updateReadyMap((ready) => ({ ...ready, [key]: true }))
    }
  }, [])

  useEffect(() => {
    const states = Object.values(readyMap)

    if (states.length === 0) {
      // No ready checks registered yet
      return
    }

    const isReady = states.every(Boolean)
    if (isReady) {
      setReady(true)
    }
  }, [readyMap])

  return { ready, registerReady }
}
