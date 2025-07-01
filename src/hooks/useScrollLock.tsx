'use client'

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

// Track external style changes for properties we modify
interface ExternalStyleTracker {
  observer: MutationObserver | null
  originalStyles: {
    overflow: string
    paddingRight: string
    position: string
    top: string
    width: string
  } | null
  // Track which properties were changed by external libraries while we were active
  externallyModified: Set<string>
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
  private externalTracker: ExternalStyleTracker = {
    observer: null,
    originalStyles: null,
    externallyModified: new Set(),
  }

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
    const computedStyles = window.getComputedStyle(body)
    
    // Save the current state of ALL properties we're about to modify
    // This includes both inline and computed values
    this.externalTracker.originalStyles = {
      overflow: body.style.overflow || computedStyles.overflow,
      paddingRight: body.style.paddingRight || computedStyles.paddingRight,
      position: body.style.position || computedStyles.position,
      top: body.style.top || computedStyles.top,
      width: body.style.width || computedStyles.width,
    }
    
    // Also save inline styles for our own restoration logic
    this.originalStyles = {
      overflow: body.style.overflow,
      paddingRight: body.style.paddingRight,
      position: body.style.position,
      top: body.style.top,
      width: body.style.width,
      scrollBehavior: document.documentElement.style.scrollBehavior,
    }
    
    // Reset tracking
    this.externalTracker.externallyModified.clear()
  }

  private restoreOriginalStyles(): void {
    const { body } = document
    const { documentElement } = document
    
    if (!this.externalTracker.originalStyles) return
    
    // Special handling for overflow - if external library removed it, don't restore to hidden
    if (this.externalTracker.externallyModified.has('overflow')) {
      // External library wanted to remove overflow, so we remove our inline style
      // allowing their intention to take effect
      body.style.removeProperty('overflow')
    } else {
      // Normal restoration for overflow
      const originalValue = this.externalTracker.originalStyles!.overflow
      if (this.originalStyles.overflow === '') {
        body.style.removeProperty('overflow')
      } else {
        body.style.overflow = originalValue
      }
    }
    
    // Handle other properties normally
    const otherProperties = ['paddingRight', 'position', 'top', 'width'] as const
    
    otherProperties.forEach(prop => {
      if (!this.externalTracker.externallyModified.has(prop)) {
        const originalValue = this.externalTracker.originalStyles![prop]
        
        // If original value was from computed styles (not inline), remove the inline property
        if (this.originalStyles[prop] === '') {
          body.style.removeProperty(prop === 'paddingRight' ? 'padding-right' : prop)
        } else {
          // Restore the original inline value
          ;(body.style as any)[prop] = originalValue
        }
      }
    })
    
    // Always restore scroll behavior on documentElement
    if (isIOS) {
      documentElement.style.scrollBehavior = this.originalStyles.scrollBehavior || ''
      
      // Restore scroll position
      window.scrollTo(0, this.scrollOffset)
      requestAnimationFrame(() => {
        documentElement.style.scrollBehavior = this.originalStyles.scrollBehavior || ''
      })
    }
  }

  private startTrackingExternalChanges(): void {
    if (typeof window === 'undefined' || this.externalTracker.observer) return
    
    this.externalTracker.observer = new MutationObserver((mutations) => {
      if (!this.isLocked || !this.externalTracker.originalStyles) return
      
      mutations.forEach(mutation => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
          const { body } = document
          
          // If external library removed our overflow: hidden, reapply it immediately
          // But mark that external library wanted to remove it (for proper restoration)
          if (body.style.overflow !== 'hidden') {
            this.externalTracker.externallyModified.add('overflow')
            body.style.overflow = 'hidden'
          }
          
          // Track changes for other properties
          const currentStyles = window.getComputedStyle(body)
          const otherProperties = ['paddingRight', 'position', 'top', 'width'] as const
          
          otherProperties.forEach(prop => {
            const currentValue = prop === 'paddingRight' ? 
              currentStyles.paddingRight : 
              (currentStyles as any)[prop]
            const originalValue = this.externalTracker.originalStyles![prop]
            
            if (currentValue !== originalValue) {
              // Don't track our own changes as external
              const isOurChange = (prop === 'paddingRight' && body.style.paddingRight !== '') ||
                                (prop === 'position' && body.style.position === 'fixed') ||
                                (prop === 'top' && body.style.top && body.style.top.includes('-')) ||
                                (prop === 'width' && body.style.width === '100%')
              
              if (!isOurChange) {
                this.externalTracker.externallyModified.add(prop)
              }
            }
          })
        }
      })
    })
    
    this.externalTracker.observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['style'],
      subtree: false,
    })
  }
  
  private stopTrackingExternalChanges(): void {
    if (this.externalTracker.observer) {
      this.externalTracker.observer.disconnect()
      this.externalTracker.observer = null
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
    this.startTrackingExternalChanges()
    this.isLocked = true

    const { body } = document
    const { documentElement } = document
    const scrollbarWidth = this.getScrollbarWidth()

    // Apply scroll lock styles
    body.style.overflow = 'hidden'
    
    // Compensate for scrollbar width if needed
    if (options.reserveScrollBarGap && scrollbarWidth > 0) {
      body.style.paddingRight = `${scrollbarWidth}px`
    }

    // iOS-specific handling
    if (isIOS) {
      this.scrollOffset = window.scrollY
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

    // Stop tracking external changes
    this.stopTrackingExternalChanges()

    // Restore original styles
    this.restoreOriginalStyles()

    // Reset tracker
    this.externalTracker.originalStyles = null
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
