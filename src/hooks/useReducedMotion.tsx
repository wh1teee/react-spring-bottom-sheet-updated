'use client'

import { type RefObject, useDebugValue, useEffect, useRef } from 'react'

/**
 * Hook to detect user's prefers-reduced-motion browser setting
 * @returns RefObject<boolean> - ref.current is true if user prefers reduced motion
 */
export function useReducedMotion(): RefObject<boolean> {
  const prefersReducedMotionRef = useRef<boolean>(
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false
  )

  useDebugValue(prefersReducedMotionRef.current ? 'reduce' : 'no-preference')

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const mediaQueryList = window.matchMedia('(prefers-reduced-motion: reduce)')
    
    const handleChange = (event: MediaQueryListEvent) => {
      prefersReducedMotionRef.current = event.matches
    }

    prefersReducedMotionRef.current = mediaQueryList.matches

    mediaQueryList.addEventListener('change', handleChange)

    return () => {
      mediaQueryList.removeEventListener('change', handleChange)
    }
  }, [])

  return prefersReducedMotionRef
}
