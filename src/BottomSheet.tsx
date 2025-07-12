'use client'
//
// In order to greatly reduce complexity this component is designed to always transition to open on mount, and then
// transition to a closed state later. This ensures that all memory used to keep track of animation and gesture state
// can be reclaimed after the sheet is closed and then unmounted.
// It also ensures that when transitioning to open on mount the state is always clean, not affected by previous states that could
// cause race conditions.

import { useMachine } from '@xstate/react'
import { fromPromise } from 'xstate'
import React, {
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useMemo,
  forwardRef,
  type RefObject,
} from 'react'
import { animated, config } from '@react-spring/web'
import { rubberbandIfOutOfBounds, useDrag } from '@use-gesture/react'
import {
  useAriaHider,
  useFocusTrap,
  useLayoutEffect,
  useReady,
  useReducedMotion,
  useScrollLock,
  useSnapPoints,
  useSpring,
  useSpringInterpolations,
} from './hooks'
import { overlayMachine } from './machines/overlay'
import type {
  defaultSnapProps,
  Props,
  RefHandles,
  ResizeSource,
  SnapPointProps,
  SpringConfig,
} from './types'

// Default spring configuration that can be overridden by user
// Uses React Spring's official defaults as base, adds only critical parameters
const defaultSpringConfig: SpringConfig = {
  ...config.default,
  mass: 1,
  clamp: true,     // Critical: prevents animation from going out of bounds
  precision: 0.01, // Important: controls animation smoothness and completion
  velocity: 0,
}

// @TODO implement AbortController to deal with race conditions

// @TODO rename to SpringBottomSheet and allow userland to import it directly, for those who want maximum control and minimal bundlesize
export const BottomSheet = forwardRef<
  RefHandles,
  {
    initialState: 'OPEN' | 'CLOSED'
    lastSnapRef: RefObject<number | null>
  } & Props
>((
  {
    children,
    sibling,
    className,
    footer,
    header,
    open: _open,
    initialState,
    lastSnapRef: lastSnapRefProp,
    initialFocusRef,
    onDismiss,
    maxHeight: controlledMaxHeight,
    defaultSnap: getDefaultSnap = _defaultSnap,
    snapPoints: getSnapPoints = _snapPoints,
    blocking = true,
    scrollLocking = true,
    style,
    onSpringStart,
    onSpringCancel,
    onSpringEnd,
    reserveScrollBarGap = blocking,
    expandOnContentDrag = false,
    disableExpandList = [],
    preventPullUp = false,
    springConfig: customSpringConfig,
    ...props
  },
  forwardRef
) => {
  // Merge custom config with default config
  const springConfig = useMemo(() => ({
    ...defaultSpringConfig,
    ...customSpringConfig,
  }), [customSpringConfig])

  // Before any animations can start we need to measure a few things, like the viewport and the dimensions of content, and header + footer if they exist
  // @TODO make ready its own state perhaps, before open or closed
  const { ready, registerReady } = useReady()
  const lastSnapRef = useRef(lastSnapRefProp?.current ?? null)
  // Controls the drag handler, used by spring operations that happen outside the render loop in React
  const canDragRef = useRef(false)

  // Add cleanup for any pending setTimeout from handleDrag
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // This way apps don't have to remember to wrap their callbacks in useCallback to avoid breaking the sheet
  const onSpringStartRef = useRef(onSpringStart)
  const onSpringCancelRef = useRef(onSpringCancel)
  const onSpringEndRef = useRef(onSpringEnd)
  useEffect(() => {
    onSpringStartRef.current = onSpringStart
    onSpringCancelRef.current = onSpringCancel
    onSpringEndRef.current = onSpringEnd
  }, [onSpringCancel, onSpringStart, onSpringEnd])

  // Behold, the engine of it all!
  const [spring, set] = useSpring()

  const containerRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const footerRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement | null>(null)

  // Keeps track of the current height, or the height transitioning to
  const heightRef = useRef(0)
  const resizeSourceRef = useRef<ResizeSource>('window')
  const preventScrollingRef = useRef(false)

  const prefersReducedMotion = useReducedMotion()

  // "Plugins" huhuhu
  const scrollLockRef = useScrollLock({
    targetRef: scrollRef as React.RefObject<Element>,
    enabled: ready && scrollLocking,
    reserveScrollBarGap,
  })
  const ariaHiderRef = useAriaHider({
    targetRef: containerRef as React.RefObject<Element>,
    enabled: ready && blocking,
  })
  const focusTrapRef = useFocusTrap({
    targetRef: containerRef as React.RefObject<HTMLElement>,
    fallbackRef: overlayRef as React.RefObject<HTMLElement>,
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- Must convert false to undefined for focus trap
    initialFocusRef: initialFocusRef || undefined,
    enabled: ready && blocking && initialFocusRef !== false,
  })

  const { minSnap, maxSnap, maxHeight, findSnap } = useSnapPoints({
    contentRef: contentRef as React.RefObject<Element>,
    controlledMaxHeight,
    footerEnabled: !!footer,
    footerRef: footerRef as React.RefObject<Element>,
    getSnapPoints,
    headerEnabled: header !== false,
    headerRef: headerRef as React.RefObject<Element>,
    heightRef,
    lastSnapRef: lastSnapRef as React.RefObject<number>,
    ready,
    registerReady,
    resizeSourceRef,
  })

  // Setup refs that are used in cases where full control is needed over when a side effect is executed
  const maxHeightRef = useRef(maxHeight)
  const minSnapRef = useRef(minSnap)
  const maxSnapRef = useRef(maxSnap)
  const findSnapRef = useRef(findSnap)
  const defaultSnapRef = useRef(0)
  // Sync the refs with current state, giving the spring full control over when to respond to changes
  useLayoutEffect(() => {
    maxHeightRef.current = maxHeight
    maxSnapRef.current = maxSnap
    minSnapRef.current = minSnap
    findSnapRef.current = findSnap
    defaultSnapRef.current = findSnap(getDefaultSnap)
  }, [findSnap, getDefaultSnap, maxHeight, maxSnap, minSnap])

  // New utility for using events safely
  const asyncSet = useCallback<typeof set>(
    // @ts-expect-error - Temporary type override for spring callback parameters
    ({ onRest, config: configOverride, ...opts }) =>
      // @ts-expect-error
      new Promise((resolve) =>
        set.start({
          ...opts,
          config: {
            // Use merged spring config as base
            ...springConfig,
            // Allow per-call config overrides
            ...configOverride,
          },
          onRest: (...args) => {
            // @ts-expect-error
            resolve(...args)
            onRest?.(...args)
          },
        })
      ),
    [set, springConfig]
  )
  const [current, send] = useMachine(overlayMachine.provide({
    actions: {
      onOpenCancel: useCallback(
        () => onSpringCancelRef.current?.({ type: 'OPEN' }),
        []
      ),
      onSnapCancel: useCallback(
        ({ context }) =>
          onSpringCancelRef.current?.({
            type: 'SNAP',
            source: context.snapSource,
          }),
        []
      ),
      onCloseCancel: useCallback(
        () => onSpringCancelRef.current?.({ type: 'CLOSE' }),
        []
      ),
      onResizeCancel: useCallback(
        () =>
          onSpringCancelRef.current?.({
            type: 'RESIZE',
            source: resizeSourceRef.current,
          }),
        []
      ),
      onOpenEnd: useCallback(
        () => onSpringEndRef.current?.({ type: 'OPEN' }),
        []
      ),
      onSnapEnd: useCallback(
        ({ context }, _event) =>
          onSpringEndRef.current?.({
            type: 'SNAP',
            source: context.snapSource,
          }),
        []
      ),
      onResizeEnd: useCallback(
        () =>
          onSpringEndRef.current?.({
            type: 'RESIZE',
            source: resizeSourceRef.current,
          }),
        []
      ),
    },
    actors: {
      onSnapStart: fromPromise(async ({ input }) => {
        return onSpringStartRef.current?.({
          type: 'SNAP',
          source: input?.source ?? 'custom',
        })
      }),
      onOpenStart: fromPromise(async () => {
        return onSpringStartRef.current?.({ type: 'OPEN' })
      }),
      onCloseStart: fromPromise(async () => {
        return onSpringStartRef.current?.({ type: 'CLOSE' })
      }),
      onResizeStart: fromPromise(async () => {
        return onSpringStartRef.current?.({
          type: 'RESIZE',
          source: resizeSourceRef.current,
        })
      }),
      onSnapEnd: fromPromise(async ({ input }) => {
        return onSpringEndRef.current?.({
          type: 'SNAP',
          source: input?.snapSource ?? 'custom',
        })
      }),
      onOpenEnd: fromPromise(async () => {
        return onSpringEndRef.current?.({ type: 'OPEN' })
      }),
      onCloseEnd: fromPromise(async () => {
        return onSpringEndRef.current?.({ type: 'CLOSE' })
      }),
      onResizeEnd: fromPromise(async () => {
        return onSpringEndRef.current?.({
          type: 'RESIZE',
          source: resizeSourceRef.current,
        })
      }),
      renderVisuallyHidden: fromPromise(async () => {
        await asyncSet({
          y: defaultSnapRef.current,
          ready: 0,
          maxHeight: maxHeightRef.current,
          maxSnap: maxSnapRef.current,
          // Using defaultSnapRef instead of minSnapRef to avoid animating `height` on open
          minSnap: defaultSnapRef.current,
          immediate: true,
        })
      }),
      activate: fromPromise(async () => {
        canDragRef.current = true
        await Promise.all([
          scrollLockRef.current.activate(),
          focusTrapRef.current.activate(),
          ariaHiderRef.current.activate(),
        ])
      }),
      deactivate: fromPromise(async () => {
        scrollLockRef.current.deactivate()
        focusTrapRef.current.deactivate()
        ariaHiderRef.current.deactivate()
        canDragRef.current = false
      }),
      openImmediately: fromPromise(async () => {
        heightRef.current = defaultSnapRef.current
        await asyncSet({
          y: defaultSnapRef.current,
          ready: 1,
          maxHeight: maxHeightRef.current,
          maxSnap: maxSnapRef.current,
          // Using defaultSnapRef instead of minSnapRef to avoid animating `height` on open
          minSnap: defaultSnapRef.current,
          immediate: true,
        })
      }),
      openSmoothly: fromPromise(async () => {
        await asyncSet({
          y: 0,
          ready: 1,
          maxHeight: maxHeightRef.current,
          maxSnap: maxSnapRef.current,
          // Using defaultSnapRef instead of minSnapRef to avoid animating `height` on open
          minSnap: defaultSnapRef.current,
          immediate: true,
        })

        heightRef.current = defaultSnapRef.current

        await asyncSet({
          y: defaultSnapRef.current,
          ready: 1,
          maxHeight: maxHeightRef.current,
          maxSnap: maxSnapRef.current,
          // Using defaultSnapRef instead of minSnapRef to avoid animating `height` on open
          minSnap: defaultSnapRef.current,
          immediate: prefersReducedMotion.current,
        })
      }),
      snapSmoothly: fromPromise(async ({ input }) => {
        const snap = findSnapRef.current(input?.y ?? 0)
        heightRef.current = snap
        lastSnapRef.current = snap
        await asyncSet({
          y: snap,
          ready: 1,
          maxHeight: maxHeightRef.current,
          maxSnap: maxSnapRef.current,
          minSnap: minSnapRef.current,
          immediate: prefersReducedMotion.current,
        })
      }),
      resizeSmoothly: fromPromise(async () => {
        const snap = findSnapRef.current(heightRef.current)
        heightRef.current = snap
        lastSnapRef.current = snap
        await asyncSet({
          y: snap,
          ready: 1,
          maxHeight: maxHeightRef.current,
          maxSnap: maxSnapRef.current,
          minSnap: minSnapRef.current,
          immediate:
            resizeSourceRef.current === 'element'
              ? prefersReducedMotion.current
              : true,
        })
      }),
      closeSmoothly: fromPromise(async () => {
        // Avoid animating the height property on close and stay within FLIP bounds by upping the minSnap
        asyncSet({
          minSnap: heightRef.current,
          immediate: true,
        })

        heightRef.current = 0

        await asyncSet({
          y: 0,
          maxHeight: maxHeightRef.current,
          maxSnap: maxSnapRef.current,
          immediate: prefersReducedMotion.current,
        })

        await asyncSet({ ready: 0, immediate: true })
      }),
    },
  }), {
    input: { initialState }
  })

  useEffect(() => {
    if (!ready) return

    if (_open) {
      send({ type: 'OPEN' })
    } else {
      send({ type: 'CLOSE' })
    }
  }, [_open, send, ready])
  useLayoutEffect(() => {
    // Adjust the height whenever the snap points are changed due to resize events
    if (maxHeight || maxSnap || minSnap) {
      send({ type: 'RESIZE' })
    }
  }, [maxHeight, maxSnap, minSnap, send])
  useEffect(
    () => () => {
      try {
        set.stop()
      } catch {
        // Spring cleanup failed - this is expected during component unmounting
      }
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
      
      scrollLockRef.current.deactivate()
      focusTrapRef.current.deactivate()
      ariaHiderRef.current.deactivate()
    },
    [set, ariaHiderRef, focusTrapRef, scrollLockRef]
  )

  useImperativeHandle(
    forwardRef,
    () => ({
      snapTo: (numberOrCallback, { velocity = 1, source = 'custom' } = {}) => {
        send({
          type: 'SNAP',
          payload: {
            y: findSnapRef.current(numberOrCallback),
            velocity,
            source,
          },
        })
      },
      get height() {
        return heightRef.current
      },
    }),
    [send]
  )

  useEffect(() => {
    const elem = scrollRef.current
    if (!elem) return

    const preventScrolling = e => {
      if (containerRef.current) {
        const disableExpandListNodes = disableExpandList.map(selector => containerRef.current!.querySelector(selector)).filter(Boolean);
        if (disableExpandListNodes.length && disableExpandListNodes.some(disableNode => disableNode && disableNode.contains(e.target))) {
          return true
        }
      }
      if (preventScrollingRef.current && elem.scrollTop <= 0) {
        e.preventDefault()
      }
    }

    let prevValue = 0;
    const preventSafariOverscrollOnStart = _e => {
      if (elem.scrollTop < 0) {
        prevValue = elem.scrollTop;
      }
    }
  
    const preventSafariOverscrollOnMove = (e) => {
      if (elem.scrollTop < 0 && elem.scrollTop < prevValue) {
        e.preventDefault();
      }
    };

    if (expandOnContentDrag) {
      elem.addEventListener('scroll', preventScrolling)
      elem.addEventListener('touchmove', preventScrolling)
      elem.addEventListener('touchmove', preventSafariOverscrollOnMove);
      elem.addEventListener('touchstart', preventSafariOverscrollOnStart, {
        passive: true
      });
    }
    return () => {
      if (elem) {
        elem.removeEventListener('scroll', preventScrolling)
        elem.removeEventListener('touchmove', preventScrolling)
        elem.removeEventListener('touchmove', preventSafariOverscrollOnMove);
        elem.removeEventListener('touchstart', preventSafariOverscrollOnStart);
      }
    }
  }, [expandOnContentDrag, scrollRef, disableExpandList])

  const handleDrag = ({
    args: [{ closeOnTap = false, isContentDragging = false } = {}] = [],
    cancel,
    direction: [, direction],
    down,
    first,
    last,
    memo = spring.y.get(),
    movement: [, _my],
    tap,
    velocity,
    event,
  }) => {
    // Ensure all values are finite numbers to prevent NaN calculations
    const my = Number.isFinite(_my) ? _my * -1 : 0
    const safeVelocity = Number.isFinite(velocity) ? velocity : 0
    const safeMemo = Number.isFinite(memo) ? memo : 0
    
    if (!scrollRef.current) {
      cancel()
      return memo
    }
    
    const hasScroll = scrollRef.current.scrollHeight > scrollRef.current.clientHeight;
    if (containerRef.current && disableExpandList.length) {
      const disableExpandListNodes = disableExpandList.map(selector => containerRef.current!.querySelector(selector)).filter(Boolean);
      if (disableExpandListNodes.length && disableExpandListNodes.some(disableNode => disableNode && disableNode.contains(event.target))) {
        cancel()
        return memo
      }
    }
    
    // Cancel the drag operation if the canDrag state changed
    if (!canDragRef.current) {
      cancel()
      return memo
    }

    if (onDismiss && closeOnTap && tap) {
      cancel()
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      
      timeoutRef.current = setTimeout(() => {
        onDismiss()
        timeoutRef.current = null
      }, 10)
      return memo
    }

    // Filter out taps
    if (tap) {
      return memo
    }

    const rawY = safeMemo + my
    const predictedDistance = my * safeVelocity
    const predictedY = Math.max(
      minSnapRef.current,
      Math.min(maxSnapRef.current, rawY + predictedDistance * 2)
    )

    if (
      !down &&
      onDismiss &&
      direction >= 0 &&
      rawY + predictedDistance < minSnapRef.current / 2
      && (!hasScroll || scrollRef.current.scrollTop <= 0)
    ) {
      cancel()
      onDismiss()
      return memo
    }

    let newY = down
      ? // @TODO figure out a better way to deal with rubberband overshooting if min and max have the same value
        !onDismiss && minSnapRef.current === maxSnapRef.current
        ? rawY < minSnapRef.current
          ? rubberbandIfOutOfBounds(
              rawY,
              minSnapRef.current,
              maxSnapRef.current * 2,
              0.55
            )
          : rubberbandIfOutOfBounds(
              rawY,
              minSnapRef.current / 2,
              maxSnapRef.current,
              0.55
            )
        : rubberbandIfOutOfBounds(
            rawY,
            onDismiss ? 0 : minSnapRef.current,
            maxSnapRef.current,
            0.55
          )
      : predictedY
    
    if (preventPullUp) {
      if (direction === 0) {
        return memo
      }
      if ((direction < 0 && newY > maxSnap && _my <= 0) || (direction > 0 && newY > maxSnap && _my <= 0)) {
        // realize feature: all pop-ups shouldn't be pulled up by certain if it is fully open
        // if direction up, and newY coordinate >= maxSnap, and distance Y from start point to current point (_my) <= 0 don't change height modal
        // or if direction down, and newY coordinate >= maxSnap, and distance Y from start point to current point (_my) <= 0 don't change height modal
        return memo;
      }
    }

    if (expandOnContentDrag && isContentDragging) {
      if (newY >= maxSnapRef.current) {
        newY = maxSnapRef.current
      }

      if (memo === maxSnapRef.current && scrollRef.current.scrollTop > 0) {
        newY = maxSnapRef.current
      }

      preventScrollingRef.current = newY < maxSnapRef.current;
    } else {
      preventScrollingRef.current = false
    }

    if (first) {
      send({ type: 'DRAG' })
    }

    if (last) {
      send({
        type: 'SNAP',
        payload: {
          y: newY,
          velocity: safeVelocity > 0.05 ? safeVelocity : 1,
          source: 'dragging',
        },
      })

      return memo
    }

    // Ensure newY is valid before setting spring values
    const safeY = Number.isFinite(newY) ? newY : safeMemo
    set.start({
      y: safeY,
      ready: 1,
      maxHeight: maxHeightRef.current,
      maxSnap: maxSnapRef.current,
      minSnap: minSnapRef.current,
      immediate: true,
      config: { velocity: safeVelocity },
    })

    return memo
  }

  const bind = useDrag(handleDrag, {
    filterTaps: true,
  })

  if (Number.isNaN(maxSnapRef.current)) {
    throw new TypeError('maxSnapRef is NaN!!')
  }
  if (Number.isNaN(minSnapRef.current)) {
    throw new TypeError('minSnapRef is NaN!!')
  }

  const interpolations = useSpringInterpolations({ spring })

  return (
    <animated.div
      {...({
        ...props,
        'data-rsbs-root': true,
        'data-rsbs-state': publicStates.find(state => current.matches(state)),
        'data-rsbs-is-blocking': blocking,
        'data-rsbs-is-dismissable': !!onDismiss,
        'data-rsbs-has-header': !!header,
        'data-rsbs-has-footer': !!footer,
        className: className,
        ref: containerRef,
        style: {
          // spread in the interpolations yeees
          ...interpolations,
          // but allow overriding them/disabling them
          ...style,
          // Not overridable as the "focus lock with opacity 0" trick rely on it
          // @TODO the line below only fails on TS <4
          // Spring type compatibility for opacity property
          opacity: spring.ready,
        }
      } as any)}
    >
      {sibling}
      {blocking && (
        <div
          // This component needs to be placed outside bottom-sheet, as bottom-sheet uses transform and thus creates a new context
          // that clips this element to the container, not allowing it to cover the full page.
          key="backdrop"
          data-rsbs-backdrop
          {...bind({ closeOnTap: true })}
        />
      )}
      <div
        key="overlay"
        aria-modal="true"
        role="dialog"
        data-rsbs-overlay
        tabIndex={-1}
        ref={overlayRef}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            // Always stop propagation, to avoid weirdness for bottom sheets inside other bottom sheets
            event.stopPropagation()
            if (onDismiss) onDismiss()
          }
        }}
      >
        {header !== false && (
          <div key="header" data-rsbs-header ref={headerRef} {...bind()}>
            {header}
          </div>
        )}
        <div 
          key="scroll" 
          data-rsbs-scroll 
          data-body-scroll-lock-ignore
          ref={scrollRef} 
          {...(expandOnContentDrag ? bind({ isContentDragging: true }) : {})}
        >
          <div data-rsbs-content ref={contentRef}>
            {children}
          </div>
        </div>
        {footer && (
          <div key="footer" ref={footerRef} data-rsbs-footer {...bind()}>
            {footer}
          </div>
        )}
      </div>
    </animated.div>
  )
})

BottomSheet.displayName = 'BottomSheet'

// Used for the data attribute, list over states available to CSS selectors
const publicStates = [
  'closed',
  'opening',
  'open',
  'closing',
  'dragging',
  'snapping',
  'resizing',
]

// Default prop values that are callbacks, and it's nice to save some memory and reuse their instances since they're pure
function _defaultSnap({ snapPoints, lastSnap }: defaultSnapProps) {
  if (Number.isFinite(lastSnap) && lastSnap !== null) {
    return lastSnap
  }
  const validSnapPoints = snapPoints.filter(point => Number.isFinite(point))
  return validSnapPoints.length > 0 ? Math.min(...validSnapPoints) : 0
}
function _snapPoints({ minHeight }: SnapPointProps) {
  return Number.isFinite(minHeight) ? minHeight : 0
}
