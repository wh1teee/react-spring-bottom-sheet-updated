'use client'

import type React from 'react'
import { useDebugValue, useEffect, useRef } from 'react'

/**
 * Modern hook for managing element interactivity using the `inert` attribute.
 * 
 * The `inert` attribute is a modern standard that makes elements non-interactive
 * and removes them from the accessibility tree. It's more comprehensive than
 * aria-hidden as it also prevents focus, clicks, and text selection.
 * 
 * @param targetRef - Reference to the element whose siblings should become inert
 * @param enabled - Whether the inert behavior should be active
 * 
 * @returns Ref with activate/deactivate methods for imperative control
 */
export function useInert({
  targetRef,
  enabled,
}: {
  targetRef: React.RefObject<Element>
  enabled: boolean
}) {
  const ref = useRef<{ activate: () => void; deactivate: () => void }>({
    activate: () => {
      throw new TypeError('Tried to activate inert too early')
    },
    deactivate: () => {
      // Initial deactivate function - will be replaced when enabled
    },
  })

  useDebugValue(enabled ? 'Enabled' : 'Disabled')

  useEffect(() => {
    if (!enabled) {
      ref.current.deactivate()
      ref.current = { 
        activate: () => {
          // Disabled inert - no action needed
        }, 
        deactivate: () => {
          // Disabled inert - no action needed
        } 
      }
      return
    }

    const target = targetRef.current
    let active = false
    let elementsWithInert = new Set<HTMLElement>()

    ref.current = {
      activate: () => {
        if (active) return
        active = true

        const parentNode = target?.parentNode

        // Make all body children inert except the parent of our target
        document.querySelectorAll('body > *').forEach((node) => {
          if (node === parentNode || !(node instanceof HTMLElement)) {
            return
          }
          
          // Skip if already inert (don't override existing inert state)
          if (node.inert) {
            return
          }
          
          node.inert = true
          elementsWithInert.add(node)
        })
      },
      deactivate: () => {
        if (!active) return
        active = false

        // Remove inert from all elements we made inert
        elementsWithInert.forEach((node) => {
          node.inert = false
        })
        elementsWithInert.clear()
      },
    }
  }, [targetRef, enabled])

  return ref
}