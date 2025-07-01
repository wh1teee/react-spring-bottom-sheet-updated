import { useDebugValue, useEffect, useRef, useCallback } from 'react'

// Simplified version of old scroll lock behavior that causes conflicts
interface OriginalStyles {
  overflow: string
  paddingRight: string
  position?: string
  top?: string
  width?: string
  scrollBehavior?: string
}

class ProblematicScrollLock {
  private static instance: ProblematicScrollLock
  private isLocked = false
  private scrollOffset = 0
  private originalStyles: OriginalStyles = {
    overflow: '',
    paddingRight: '',
    position: '',
    top: '',
    width: '',
    scrollBehavior: '',
  }

  static getInstance(): ProblematicScrollLock {
    if (!ProblematicScrollLock.instance) {
      ProblematicScrollLock.instance = new ProblematicScrollLock()
    }
    return ProblematicScrollLock.instance
  }

  private getScrollbarWidth(): number {
    if (typeof window === 'undefined') return 0
    return window.innerWidth - document.documentElement.clientWidth
  }

  // OLD BEHAVIOR: Only saves inline styles, not computed styles
  private saveOriginalStyles(): void {
    const { body } = document
    this.originalStyles = {
      overflow: body.style.overflow,
      paddingRight: body.style.paddingRight,
      position: body.style.position,
      top: body.style.top,
      width: body.style.width,
      scrollBehavior: document.documentElement.style.scrollBehavior,
    }
  }

  // OLD BEHAVIOR: Blindly restores whatever was saved
  private restoreOriginalStyles(): void {
    const { body } = document
    const { documentElement } = document
    
    body.style.overflow = this.originalStyles.overflow
    body.style.paddingRight = this.originalStyles.paddingRight
    
    body.style.position = this.originalStyles.position || ''
    body.style.top = this.originalStyles.top || ''
    body.style.width = this.originalStyles.width || ''
    documentElement.style.scrollBehavior = this.originalStyles.scrollBehavior || ''
  }

  lock(): void {
    if (this.isLocked || typeof window === 'undefined') return

    this.saveOriginalStyles()
    this.isLocked = true

    const { body } = document
    const { documentElement } = document
    const scrollbarWidth = this.getScrollbarWidth()

    // Apply base scroll lock styles
    body.style.overflow = 'hidden'
    
    // Compensate for scrollbar width if needed
    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${scrollbarWidth}px`
    }

    // iOS-specific handling
    this.scrollOffset = window.scrollY
    documentElement.style.scrollBehavior = 'unset'
    body.style.position = 'fixed'
    body.style.top = `-${this.scrollOffset}px`
    body.style.width = '100%'
  }

  unlock(): void {
    if (!this.isLocked || typeof window === 'undefined') return

    this.isLocked = false

    // Restore original styles (this is where the problem occurs)
    this.restoreOriginalStyles()

    // iOS-specific scroll restoration
    window.scrollTo(0, this.scrollOffset)
    requestAnimationFrame(() => {
      document.documentElement.style.scrollBehavior = this.originalStyles.scrollBehavior || ''
    })
  }

  isScrollLocked(): boolean {
    return this.isLocked
  }
}

export function useProblematicScrollLock({
  enabled,
}: {
  enabled: boolean
}) {
  const ref = useRef<{ activate: () => void; deactivate: () => void }>({
    activate: () => {
      throw new TypeError('Tried to activate scroll lock too early')
    },
    deactivate: () => {},
  })

  const scrollLock = ProblematicScrollLock.getInstance()

  useDebugValue(enabled ? 'Enabled (Problematic)' : 'Disabled')

  const activate = useCallback(() => {
    if (scrollLock.isScrollLocked()) return
    scrollLock.lock()
  }, [scrollLock])

  const deactivate = useCallback(() => {
    if (!scrollLock.isScrollLocked()) return
    scrollLock.unlock()
  }, [scrollLock])

  useEffect(() => {
    if (!enabled) {
      ref.current.deactivate()
      ref.current = { activate: () => {}, deactivate: () => {} }
      return
    }

    ref.current = {
      activate,
      deactivate,
    }
  }, [enabled, activate, deactivate])

  return ref
}