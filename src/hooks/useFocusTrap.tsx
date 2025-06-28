'use client'

import { createFocusTrap } from 'focus-trap'
import { useDebugValue, useEffect, useRef } from 'react'

export function useFocusTrap({
  targetRef,
  fallbackRef,
  initialFocusRef,
  enabled,
}: {
  targetRef: React.RefObject<HTMLElement>
  fallbackRef: React.RefObject<HTMLElement>
  initialFocusRef?: React.RefObject<HTMLElement>
  enabled: boolean
}) {
  const ref = useRef<{ activate: () => void; deactivate: () => void }>({
    activate: () => {
      throw new TypeError('Tried to activate focus trap too early')
    },
    deactivate: () => {},
  })

  useDebugValue(enabled ? 'Enabled' : 'Disabled')

  useEffect(() => {
    if (!enabled) {
      ref.current.deactivate()
      ref.current = { activate: () => {}, deactivate: () => {} }
      return
    }

    const fallback = fallbackRef.current
    const focusTrapOptions: any = {
      fallbackFocus: fallback,
      escapeDeactivates: false,
      clickOutsideDeactivates: false,
    }

    if (process.env.NODE_ENV !== 'production') {
      focusTrapOptions.onActivate = () => {
        console.log('focus activate')
      }
    }

    if (initialFocusRef) {
      focusTrapOptions.initialFocus = () => initialFocusRef?.current || fallback
    }

    const trap = createFocusTrap(targetRef.current, focusTrapOptions)
    let active = false

    ref.current = {
      activate: async () => {
        if (active) return
        active = true

        await trap.activate()
        // it's difficult to know exactly when focus is udpated https://github.com/focus-trap/focus-trap/blob/036a72ec48b85414dda00ec0c40d631c8f0ae5ce/index.js#L369-L371
        // This timeout is attempting to compromise between a reasonable guess, as well as not delaying the open transition more than necessary
        await new Promise((resolve) => setTimeout(() => resolve(void 1), 0))
      },
      deactivate: () => {
        if (!active) return
        active = false

        trap.deactivate()
      },
    }
  }, [enabled, fallbackRef, initialFocusRef, targetRef])

  return ref
}
