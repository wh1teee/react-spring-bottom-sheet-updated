import { useDebugValue, useEffect, useRef, useCallback } from 'react'

/**
 * Cross-platform scroll lock hook with modern CSS and iOS compatibility
 * 
 * Features:
 * - Prevents layout shift by compensating for scrollbar width
 * - iOS Safari compatibility with position: fixed approach
 * - Support for allowTouchMove areas via data attributes
 * - Proper cleanup and restoration
 */

interface ScrollLockOptions {
  allowTouchMove?: (el: Element) => boolean
  reserveScrollBarGap?: boolean
}

// Detect iOS - more reliable detection
const isIOS = (() => {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !('MSStream' in window)
})()

// Store original styles for restoration
interface OriginalStyles {
  overflow: string
  paddingRight: string
  position?: string
  top?: string
  width?: string
  scrollBehavior?: string
}

class ModernScrollLock {
  private static instance: ModernScrollLock
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
  private touchMoveHandler: ((e: TouchEvent) => void) | null = null

  static getInstance(): ModernScrollLock {
    if (!ModernScrollLock.instance) {
      ModernScrollLock.instance = new ModernScrollLock()
    }
    return ModernScrollLock.instance
  }

  private getScrollbarWidth(): number {
    if (typeof window === 'undefined') return 0
    return window.innerWidth - document.documentElement.clientWidth
  }

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

  private restoreOriginalStyles(): void {
    const { body } = document
    const { documentElement } = document
    
    body.style.overflow = this.originalStyles.overflow
    body.style.paddingRight = this.originalStyles.paddingRight
    
    if (isIOS) {
      body.style.position = this.originalStyles.position || ''
      body.style.top = this.originalStyles.top || ''
      body.style.width = this.originalStyles.width || ''
      documentElement.style.scrollBehavior = this.originalStyles.scrollBehavior || ''
    }
  }

  private createTouchMoveHandler(options: ScrollLockOptions): (e: TouchEvent) => void {
    return (e: TouchEvent) => {
      // Allow touch move for elements with data-body-scroll-lock-ignore attribute
      const target = e.target as Element
      if (target?.closest('[data-body-scroll-lock-ignore]')) {
        return
      }

      // Custom allowTouchMove callback
      if (options.allowTouchMove && options.allowTouchMove(target)) {
        return
      }

      e.preventDefault()
    }
  }

  lock(targetElement: Element | null, options: ScrollLockOptions = {}): void {
    if (this.isLocked || typeof window === 'undefined') return

    this.saveOriginalStyles()
    this.isLocked = true

    const { body } = document
    const { documentElement } = document
    const scrollbarWidth = this.getScrollbarWidth()

    // Apply base scroll lock styles
    body.style.overflow = 'hidden'
    
    // Compensate for scrollbar width if needed
    if (options.reserveScrollBarGap && scrollbarWidth > 0) {
      body.style.paddingRight = `${scrollbarWidth}px`
    }

    // iOS-specific handling
    if (isIOS) {
      this.scrollOffset = window.pageYOffset
      documentElement.style.scrollBehavior = 'unset'
      body.style.position = 'fixed'
      body.style.top = `-${this.scrollOffset}px`
      body.style.width = '100%'
    }

    // Add touch event handler for iOS
    if (isIOS && targetElement) {
      this.touchMoveHandler = this.createTouchMoveHandler(options)
      document.addEventListener('touchmove', this.touchMoveHandler, { passive: false })
    }
  }

  unlock(): void {
    if (!this.isLocked || typeof window === 'undefined') return

    this.isLocked = false

    // Remove touch event listener
    if (this.touchMoveHandler) {
      document.removeEventListener('touchmove', this.touchMoveHandler)
      this.touchMoveHandler = null
    }

    // Restore original styles
    this.restoreOriginalStyles()

    // iOS-specific scroll restoration
    if (isIOS) {
      // Restore scroll position without smooth scrolling
      window.scrollTo(0, this.scrollOffset)
      // Restore smooth scrolling after a frame
      requestAnimationFrame(() => {
        document.documentElement.style.scrollBehavior = this.originalStyles.scrollBehavior || ''
      })
    }
  }

  isScrollLocked(): boolean {
    return this.isLocked
  }
}

/**
 * Handle scroll locking to ensure a good dragging experience on Android and iOS.
 *
 * On iOS the following may happen if scroll isn't locked:
 * - When dragging the sheet the background gets dragged at the same time.
 * - When dragging the page scroll is also affected, causing the drag to feel buggy and "slow".
 *
 * On Android it causes the chrome toolbar to pop down as you drag down, and hide as you drag up.
 * When it's in between two toolbar states it causes the framerate to drop way below 60fps on
 * the bottom sheet drag interaction.
 */
export function useScrollLock({
  targetRef,
  enabled,
  reserveScrollBarGap,
}: {
  targetRef: React.RefObject<Element>
  enabled: boolean
  reserveScrollBarGap: boolean
}) {
  const ref = useRef<{ activate: () => void; deactivate: () => void }>({
    activate: () => {
      throw new TypeError('Tried to activate scroll lock too early')
    },
    deactivate: () => {},
  })

  const scrollLock = ModernScrollLock.getInstance()

  useDebugValue(enabled ? 'Enabled' : 'Disabled')

  const activate = useCallback(() => {
    if (scrollLock.isScrollLocked()) return
    
    scrollLock.lock(targetRef.current, {
      allowTouchMove: (el) => !!el.closest('[data-body-scroll-lock-ignore]'),
      reserveScrollBarGap,
    })
  }, [scrollLock, targetRef, reserveScrollBarGap])

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
