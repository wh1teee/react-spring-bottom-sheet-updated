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
  // The key issue: if MUI already set overflow:hidden as inline style,
  // we save that and later restore it, causing the freeze
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
    console.log('🔴 Problematic: Saved styles:', {
      inline: this.originalStyles.overflow || '(empty)',
      computed: window.getComputedStyle(body).overflow,
      problem: this.originalStyles.overflow === 'hidden' ? 'YES - will cause freeze!' : 'no'
    })
  }

  // OLD BEHAVIOR: Blindly restores whatever was saved
  private restoreOriginalStyles(): void {
    const { body } = document
    const { documentElement } = document
    
    console.log('🔴 Problematic: Restoring styles:', {
      restoring: this.originalStyles.overflow || '(empty)',
      currentComputed: window.getComputedStyle(body).overflow
    })
    
    body.style.overflow = this.originalStyles.overflow
    body.style.paddingRight = this.originalStyles.paddingRight
    
    body.style.position = this.originalStyles.position || ''
    body.style.top = this.originalStyles.top || ''
    body.style.width = this.originalStyles.width || ''
    documentElement.style.scrollBehavior = this.originalStyles.scrollBehavior || ''
    
    console.log('🔴 Problematic: After restore:', {
      inline: body.style.overflow || '(empty)',
      computed: window.getComputedStyle(body).overflow
    })
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
    activate: () => {},
    deactivate: () => {},
  })

  const scrollLock = ProblematicScrollLock.getInstance()

  useDebugValue(enabled ? 'Enabled (Problematic)' : 'Disabled')

  const activate = useCallback(() => {
    if (!enabled) return
    console.log('🔴 Problematic: Activating scroll lock, saving current styles:', {
      overflow: document.body.style.overflow || '(empty)',
      computed: window.getComputedStyle(document.body).overflow
    })
    if (scrollLock.isScrollLocked()) return
    scrollLock.lock()
  }, [scrollLock, enabled])

  const deactivate = useCallback(() => {
    if (!enabled) return
    console.log('🔴 Problematic: Deactivating scroll lock, restoring saved styles')
    if (!scrollLock.isScrollLocked()) return
    scrollLock.unlock()
  }, [scrollLock, enabled])

  // Don't automatically activate/deactivate based on enabled state
  // Let the parent component control when to activate/deactivate
  useEffect(() => {
    ref.current = {
      activate,
      deactivate,
    }
  }, [activate, deactivate])

  return ref
}