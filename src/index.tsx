'use client'

import { Root as PortalRoot } from '@radix-ui/react-portal';
import React, { forwardRef, useRef, useState, useCallback } from 'react'
import { BottomSheet as _BottomSheet } from './BottomSheet'
import type { Props, RefHandles, SpringEvent } from './types'
import { useLayoutEffect } from './hooks'

export type {
  RefHandles as BottomSheetRef,
  Props as BottomSheetProps,
  SpringConfig as BottomSheetSpringConfig,
} from './types'

/**
 * Main BottomSheet component entry point with SSR support and lifecycle management.
 * 
 * This wrapper component handles server-side rendering compatibility, manages mounting
 * state to prevent hydration mismatches, and controls the initial animation state.
 * It provides a clean API while delegating core functionality to the internal BottomSheet.
 * 
 * @component
 * @example
 * ```tsx
 * import { BottomSheet } from 'react-spring-bottom-sheet'
 * 
 * <BottomSheet
 *   open={isOpen}
 *   onDismiss={() => setIsOpen(false)}
 *   snapPoints={({ maxHeight }) => [maxHeight * 0.4, maxHeight * 0.8]}
 * >
 *   <div>Content here</div>
 * </BottomSheet>
 * ```
 * 
 * @param props - All BottomSheet props
 * @param props.onSpringStart - Optional callback for animation start events
 * @param props.onSpringEnd - Optional callback for animation end events  
 * @param props.skipInitialTransition - Skip opening animation on mount
 * @param ref - Forward ref for imperative API access
 * 
 * @returns Portal-wrapped BottomSheet or null if not mounted (SSR compatibility)
 * 
 * @complexity O(1) - Constant time wrapper operations
 * @callFlow
 * - Manages mounted state for SSR compatibility
 * - Handles initial state determination based on props
 * - Forwards events to user callbacks
 * - Renders internal BottomSheet in Portal when mounted
 */
// Because SSR is annoying to deal with, and all the million complaints about window, navigator and dom elenents!
export const BottomSheet = forwardRef<RefHandles, Props>((
  { onSpringStart, onSpringEnd, skipInitialTransition, ...props },
  ref
) => {
  // Mounted state, helps SSR but also ensures you can't tab into the sheet while it's closed, or nav there in a screen reader
  const [mounted, setMounted] = useState(false)
  const timerRef = useRef<ReturnType<typeof requestAnimationFrame> | undefined>(undefined)
  // The last point that the user snapped to, useful for open/closed toggling and the user defined height is remembered
  const lastSnapRef = useRef(null)
  // @TODO refactor to an initialState: OPEN | CLOSED property as it's much easier to understand
  // And informs what we should animate from. If the sheet is mounted with open = true, then initialState = OPEN.
  // When initialState = CLOSED, then internal sheet must first render with open={false} before setting open={props.open}
  // It's only when initialState = OPEN, then skipInitialTransition = true should be used
  // It's only when initialState and props.open is mismatching that a intial transition should happen
  // If they match then transitions will only happen when a user interaction or resize event happen.
  const initialStateRef = useRef<'OPEN' | 'CLOSED'>(
    skipInitialTransition && props.open ? 'OPEN' : 'CLOSED'
  )

  // Using layout effect to support cases where the bottom sheet have to appear already open, no transition
  useLayoutEffect(() => {
    if (props.open) {
      if (timerRef.current !== undefined) {
        cancelAnimationFrame(timerRef.current)
      }
      setMounted(true)

      // Cleanup defaultOpen state on close
      return () => {
        initialStateRef.current = 'CLOSED'
      }
    }
  }, [props.open])

  /**
   * Handles spring animation start events and manages mounting lifecycle.
   * 
   * This callback processes animation start events, forwards them to user callbacks,
   * and ensures proper mounting behavior during open animations. It prevents race
   * conditions between opening and pending unmount operations.
   * 
   * @param event - Spring event object describing the animation type
   * @param event.type - Type of animation ('OPEN' | 'CLOSE' | 'SNAP' | 'RESIZE')
   * 
   * @returns Promise that resolves when user callback completes
   * 
   * @complexity O(1) - Simple event forwarding and cleanup
   * @callFlow
   * - Forwards event to user onSpringStart callback
   * - Cancels pending unmount timer for OPEN events
   * - Prevents race conditions during open animations
   */
  const handleSpringStart = useCallback(
    async (event: SpringEvent) => {
      // Forward the event
      await onSpringStart?.(event)

      if (event.type === 'OPEN') {
        // Ensures that when it's opening we abort any pending unmount action
        if (timerRef.current !== undefined) {
          cancelAnimationFrame(timerRef.current)
        }
      }
    },
    [onSpringStart]
  )

  /**
   * Handles spring animation end events and manages unmounting lifecycle.
   * 
   * This callback processes animation end events, forwards them to user callbacks,
   * and manages DOM cleanup for accessibility. When close animations complete,
   * it schedules unmounting to prevent tab navigation and screen reader access.
   * 
   * @param event - Spring event object describing the completed animation
   * @param event.type - Type of animation ('OPEN' | 'CLOSE' | 'SNAP' | 'RESIZE')
   * 
   * @returns Promise that resolves when user callback completes
   * 
   * @complexity O(1) - Simple event forwarding and scheduling
   * @callFlow
   * - Forwards event to user onSpringEnd callback
   * - Schedules unmounting via requestAnimationFrame for CLOSE events
   * - Improves accessibility by removing closed sheet from DOM
   */
  const handleSpringEnd = useCallback(
    async (event: SpringEvent) => {
      // Forward the event
      await onSpringEnd?.(event)

      if (event.type === 'CLOSE') {
        // Unmount from the dom to avoid contents being tabbable or visible to screen readers while closed
        timerRef.current = requestAnimationFrame(() => setMounted(false))
      }
    },
    [onSpringEnd]
  )

  // This isn't just a performance optimization, it's also to avoid issues when running a non-browser env like SSR
  if (!mounted) {
    return null
  }

  // React 19 compatibility: Type assertion for PortalRoot JSX component
  const PortalRootComponent = PortalRoot as React.ComponentType<any>

  return (
    <PortalRootComponent {...({ 'data-rsbs-portal': true } as any)}>
      <_BottomSheet
        {...props}
        lastSnapRef={lastSnapRef}
        ref={ref}
        initialState={initialStateRef.current}
        onSpringStart={handleSpringStart}
        onSpringEnd={handleSpringEnd}
      />
    </PortalRootComponent>
  )
})

BottomSheet.displayName = 'BottomSheet'
