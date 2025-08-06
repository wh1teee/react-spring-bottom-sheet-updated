'use client'
// Keeps track of whether everything is good to go or not, in the most efficient way possible

import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Hook for managing multiple asynchronous ready states efficiently.
 * 
 * Uses a Map internally for O(1) operations instead of object spread,
 * and only triggers state updates when all registered items are ready.
 * This avoids unnecessary re-renders during the registration phase.
 * 
 * @returns {ready: boolean, registerReady: (key: string) => () => void}
 */
export function useReady() {
  const [ready, setReady] = useState(false)
  const readyMapRef = useRef(new Map<string, boolean>())
  const [updateTrigger, setUpdateTrigger] = useState(0)

  const registerReady = useCallback((key: string) => {
    // Register the check we're gonna wait for until it's ready
    readyMapRef.current.set(key, false)
    
    return () => {
      // Set it to ready and trigger an update
      readyMapRef.current.set(key, true)
      setUpdateTrigger((prev) => prev + 1)
    }
  }, [])

  useEffect(() => {
    const map = readyMapRef.current
    
    if (map.size === 0) {
      // No ready checks registered yet
      return
    }

    // Check if all registered items are ready
    const isReady = Array.from(map.values()).every(Boolean)
    
    // Only update if the ready state has changed to true
    if (isReady && !ready) {
      setReady(true)
    }
  }, [updateTrigger, ready])

  return { ready, registerReady }
}
