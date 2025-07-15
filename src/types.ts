/**
 * Layout measurement properties for snap point calculations.
 * 
 * Contains all the necessary dimensions for computing valid snap points
 * based on content size, viewport constraints, and layout components.
 * Used by snap point functions to determine available positions.
 */
export type SnapPointProps = {
  /**
   * The height of the sticky header, if there's one
   */
  headerHeight: number
  /**
   * The height of the sticky footer, if there's one
   */
  footerHeight: number
  /**
   * If the bottom sheet is animating to a snap point the height will match the destination height, not the height the bottom sheet might have in the middle of the animation. It includes the header and footer heights.
   */
  height: number
  /**
   * Minimum height needed to avoid scroll overflow in the content area, if possible.
   */
  minHeight: number
  /**
   * Max height the sheet can be, your snap points are capped to this value. It's window.innerHeight by default but can be overriden using the maxHeight prop.
   */
  maxHeight: number
}

/**
 * Function type for calculating dynamic snap points based on layout measurements.
 * 
 * This function receives current layout properties and returns either a single
 * snap point or an array of multiple snap points. Enables responsive behavior
 * based on content size and viewport dimensions.
 * 
 * @param props - Layout measurements including heights and constraints
 * @returns Single snap point number or array of snap points in pixels
 * 
 * @example
 * ```typescript
 * const snapPoints: SnapPointsFunction = ({ maxHeight }) => [
 *   maxHeight * 0.4,  // 40% of screen height
 *   maxHeight * 0.8   // 80% of screen height
 * ]
 * ```
 */
export type SnapPointsFunction = (props: SnapPointProps) => number[] | number

/**
 * Source identifier for resize events to track what triggered the resize.
 * 
 * Helps differentiate between different types of resize events for proper
 * handling and animation behavior. Each source may require different
 * response strategies for optimal user experience.
 * 
 * - `window`: Triggered by window.onresize (viewport changes)
 * - `maxheightprop`: Triggered when maxHeight prop is updated
 * - `element`: Triggered by ResizeObserver on header, footer, or content area
 */
export type ResizeSource = 'window' | 'maxheightprop' | 'element'

/**
 * Configuration object for default snap point calculation.
 * 
 * Combines current snap point state with layout measurements to enable
 * intelligent default positioning. Used by defaultSnap functions to
 * determine appropriate initial height based on user interaction history.
 */
export type defaultSnapProps = {
  /** The snap points currently in use, this can be controlled by providing a `snapPoints` function on the bottom sheet. */
  snapPoints: number[]
  /** The last snap point the user dragged to, if any. 0 if the user haven't interacted */
  lastSnap: number | null
} & SnapPointProps

// React Spring configuration type
export type SpringConfig = {
  /**
   * Animation duration in milliseconds
   */
  duration?: number
  /**
   * Easing function
   */
  easing?: (t: number) => number
  /**
   * Mass of the object
   * @default 1
   */
  mass?: number
  /**
   * Tension controls the speed of the spring
   * @default 170
   */
  tension?: number
  /**
   * Friction controls the damping
   * @default 26
   */
  friction?: number
  /**
   * Whether to clamp the spring value
   * @default true
   */
  clamp?: boolean
  /**
   * Precision of the animation
   * @default 0.01
   */
  precision?: number
  /**
   * Initial velocity
   * @default 0
   */
  velocity?: number
  /**
   * Whether to limit the animation to the bounds
   * @default false
   */
  bounce?: number
  /**
   * Damping ratio
   * @default 1
   */
  damping?: number
  /**
   * Rest velocity
   * @default 0.001
   */
  restVelocity?: number
  /**
   * Rest displacement
   * @default 0.001
   */
  restDisplacement?: number
}

/**
 * Spring animation event types for tracking bottom sheet state changes.
 * 
 * These events are fired during different animation phases to enable
 * external coordination and lifecycle management. Each event type provides
 * relevant context for the specific animation being performed.
 * 
 * @example
 * ```typescript
 * const handleSpringStart = (event: SpringEvent) => {
 *   switch (event.type) {
 *     case 'OPEN':
 *       console.log('Sheet is opening')
 *       break
 *     case 'SNAP':
 *       console.log('Snapping from:', event.source)
 *       break
 *   }
 * }
 * ```
 */
/* Might make sense to expose a preventDefault method here */
export type SpringEvent =
  | { type: 'OPEN' }
  | { type: 'CLOSE' }
  | { type: 'RESIZE'; source: ResizeSource }
  | { type: 'SNAP'; source: 'dragging' | 'custom' | string }

export type Props = {
  /**
   * Ensure that whatever you put in here have at least 1px height, or else the bottom sheet won't open
   */
  children: React.ReactNode

  /**
   * Similar to children, but renders next to the overlay element rather than inside it.
   * Useful for things that are position:fixed and need to overlay the backdrop and still be interactive
   * in blocking mode.
   */
  sibling?: React.ReactNode

  /**
   * Start a transition from closed to open, open to closed, or snap to snap.
   * Return a promise or async to delay the start of the transition, just remember it can be cancelled.
   */
  onSpringStart?: (event: SpringEvent) => void
  /**
   * A running transition didn't finish or got stopped, this event isn't awaited on and might happen
   * after the sheet is unmounted (if it were in the middle of something).
   */
  onSpringCancel?: (event: SpringEvent) => void
  /**
   * The transition ended successfully. Handy to know when it's safe to unmount
   * the sheet without interrupting the closing animation.
   * Return a promise or async to delay the start of the transition, just remember it can be cancelled.
   */
  onSpringEnd?: (event: SpringEvent) => void

  /** Whether the bottom sheet is open or not. */
  open: boolean

  /**
   * Additional CSS class for the container.
   */
  className?: string

  /**
   * Renders a sticky footer at the bottom of the sheet.
   */
  footer?: React.ReactNode

  /**
   * Renders below the drag handle, set to `false` to disable the drag handle
   * @default true
   */
  header?: React.ReactNode | false

  /**
   * A reference to the element that should be focused. By default it'll be the first interactive element.
   * Set to false to disable keyboard focus when opening.
   */
  initialFocusRef?: React.RefObject<HTMLElement> | false

  /**
   * Handler that is called when the user presses *esc*, clicks outside the dialog or drags the sheet to the bottom of the display.
   */
  onDismiss?: () => void

  /**
   * Whether the bottom sheet should block interactions with the rest of the page or not.
   * @default true
   */
  blocking?: boolean

  /**
   * By default the maxHeight is set to window.innerHeight to match 100vh, and responds to window resize events.
   * You can override it by giving maxHeight a number, just make sure you handle things like resize events when needed.
   */
  maxHeight?: number

  /**
   * Ensures that drag interactions works properly on iOS and Android.
   * If setting this to `false`make sure you test on real iOS and Android devices to ensure the dragging interactions don't break.
   * @default true
   */
  scrollLocking?: boolean

  /**
   * Handler that is called to get the height values that the bottom sheet can *snap* to when the user stops dragging.
   * @default ({ minHeight }) => minHeight
   */
  snapPoints?: SnapPointsFunction

  /**
   * Handler that is called to get the initial height of the bottom sheet when it's opened (or when the viewport is resized).
   * @default ({ snapPoints, lastSnap }) => lastSnap ?? Math.min(...snapPoints)
   */
  defaultSnap?: number | ((props: defaultSnapProps) => number)

  /**
   * Configures body-scroll-lock to reserve scrollbar gap by setting padding on <body>, clears when closing the bottom sheet.
   * If blocking is true, then reserveScrollBarGap is true by default
   * @default blocking === true
   */
  reserveScrollBarGap?: boolean

  /**
   * Open immediatly instead of initially animating from a closed => open state, useful if the bottom sheet is visible by default and the animation would be distracting
   */
  skipInitialTransition?: boolean,

  /**
   * Expand the bottom sheet on the content dragging. By default user can expand the bottom sheet only by dragging the header or overlay. This option enables expanding on dragging the content.
   * @default expandOnContentDrag === false
   */
  expandOnContentDrag?: boolean,

  /**
   * Prevent expanding the bottom sheet on the content dragging if event.target.classNames contains in disableExpandList array.
   * @default disableExpandList === []
   */
  disableExpandList?: string[],

  /**
   * Prevent pull up if modal is fully open.
   * @default preventPullUp === false
   */
  preventPullUp?: boolean,

  /**
   * Custom React Spring configuration to override default animation settings.
   * This config will be merged with the default configuration, allowing for fine-tuned control
   * over the animation behavior including timing, easing, and physics properties.
   * 
   * @example
   * // Slower, bouncy animation
   * springConfig={{
   *   tension: 100,
   *   friction: 50,
   *   mass: 2
   * }}
   * 
   * @example
   * // Fast, snappy animation
   * springConfig={{
   *   tension: 300,
   *   friction: 30
   * }}
   * 
   * @default { mass: 1, tension: 170, friction: 26, clamp: true }
   */
  springConfig?: Partial<SpringConfig>

  /**
   * Controls the swipe-to-close gesture logic.
   * 
   * @default 'distance'
   * 
   * - 'distance': Pure distance-based closing - most reliable for mobile devices
   * - 'movement': Distance + cumulative movement validation
   * - 'original': Distance + direction tolerance - handles imperfect mobile swipes
   */
  closeLogic?: 'original' | 'distance' | 'movement'

  /**
   * Threshold for swipe-to-close as a percentage from the top of modal height.
   * Higher values make it easier to close, lower values require more swipe distance.
   * 
   * @default 0.4 (must swipe past 40% from top to close)
   * 
   * @example
   * // Easier closing for quick interactions
   * closeThreshold={0.3}
   * 
   * // More conservative for forms/critical content
   * closeThreshold={0.5}
   */
  closeThreshold?: number

} & Omit<React.ComponentProps<'div'>, 'children'>

export interface RefHandles {
  /**
   * When given a number it'll find the closest snap point, so you don't need to know the exact value,
   * Use the callback method to access what snap points you can choose from.
   *
   * Use the second argument for advanced settings like:
   * `source: string` which is passed to onSpring events, and is 'custom' by default
   * `velocity: number` which is 1 by default, adjust it to control the speed of the spring transition to the new snap point
   */
  snapTo: (
    numberOrCallback: number | ((state: defaultSnapProps) => number),
    options?: { source?: string; velocity?: number }
  ) => void

  /**
   * Returns the current snap point, in other words the height.
   * It's update lifecycle with events are onSpringStart and onSpringCancel will give you the old value, while onSpringEnd will give you the current one.
   */
  height: number
}
