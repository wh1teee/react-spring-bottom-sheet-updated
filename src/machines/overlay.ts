import { createMachine, assign } from 'xstate'

// This is the root machine, composing all the other machines and is the brain of the bottom sheet

type OverlayEvent =
  | { type: 'OPEN' }
  | {
      type: 'SNAP'
      payload: {
        y: number
        velocity: number
        source: 'dragging' | 'custom' | string
      }
    }
  | { type: 'CLOSE' }
  | { type: 'DRAG' }
  | { type: 'RESIZE' }

// The context (extended state) of the machine
interface OverlayContext {
  initialState: 'OPEN' | 'CLOSED'
  y?: number
  velocity?: number
  snapSource?: string
}


const cancelOpen = {
  CLOSE: { target: '#overlay.closing', actions: 'onOpenCancel' },
}
const openToDrag = {
  DRAG: { target: '#overlay.dragging', actions: 'onOpenEnd' },
}
const openToResize = {
  RESIZE: { target: '#overlay.resizing', actions: 'onOpenEnd' },
}

const initiallyOpen = ({ context }: { context: { initialState: string } }) => context.initialState === 'OPEN'
const initiallyClosed = ({ context }: { context: { initialState: string } }) => context.initialState === 'CLOSED'

// Copy paste the machine into https://xstate.js.org/viz/ to make sense of what's going on in here ;)

export const overlayMachine = createMachine({
  types: {} as {
    context: OverlayContext;
    events: OverlayEvent;
    input: { initialState: 'OPEN' | 'CLOSED' };
  },
  id: 'overlay',
  initial: 'closed',
  context: ({ input }) => ({ 
    initialState: input?.initialState || 'CLOSED' 
  }),
  states: {
    closed: { on: { OPEN: 'opening', CLOSE: undefined } },
    opening: {
      initial: 'start',
      states: {
        start: {
          invoke: {
            src: 'onOpenStart',
            onDone: 'transition',
          },
        },
        transition: {
          always: [
            { target: 'immediately', guard: 'initiallyOpen' },
            { target: 'smoothly', guard: 'initiallyClosed' },
          ],
        },
        immediately: {
          initial: 'open',
          states: {
            open: {
              invoke: { src: 'openImmediately', onDone: 'activating' },
            },
            activating: {
              invoke: { src: 'activate', onDone: '#overlay.opening.end' },
              on: { ...openToDrag, ...openToResize },
            },
          },
        },
        smoothly: {
          initial: 'visuallyHidden',
          states: {
            visuallyHidden: {
              invoke: { src: 'renderVisuallyHidden', onDone: 'activating' },
            },
            activating: {
              invoke: { src: 'activate', onDone: 'open' },
            },
            open: {
              invoke: { src: 'openSmoothly', onDone: '#overlay.opening.end' },
              on: { ...openToDrag, ...openToResize },
            },
          },
        },
        end: {
          invoke: { src: 'onOpenEnd', onDone: 'done' },
          on: { CLOSE: '#overlay.closing', DRAG: '#overlay.dragging' },
        },
        done: {
          type: 'final',
        },
      },
      on: { ...cancelOpen },
      onDone: 'open',
    },
    open: {
      on: { DRAG: '#overlay.dragging', SNAP: 'snapping', RESIZE: 'resizing' },
    },
    dragging: {
      on: { SNAP: 'snapping' },
    },
    snapping: {
      initial: 'start',
      states: {
        start: {
          invoke: {
            src: 'onSnapStart',
            input: ({ context }) => ({
              source: context.snapSource
            }),
            onDone: 'snappingSmoothly',
          },
          entry: [
            assign({
              y: ({ event }) => (event as any).payload?.y,
              velocity: ({ event }) => (event as any).payload?.velocity,
              snapSource: ({ event }) => (event as any).payload?.source || 'custom',
            }),
          ],
        },
        snappingSmoothly: {
          invoke: { 
            src: 'snapSmoothly',
            input: ({ context }) => ({
              y: context.y,
              velocity: context.velocity,
              snapSource: context.snapSource
            }),
            onDone: 'end' 
          },
        },
        end: {
          invoke: { 
            src: 'onSnapEnd',
            input: ({ context }) => ({
              snapSource: context.snapSource
            }),
            onDone: 'done' 
          },
          on: {
            RESIZE: '#overlay.resizing',
            SNAP: '#overlay.snapping',
            CLOSE: '#overlay.closing',
            DRAG: '#overlay.dragging',
          },
        },
        done: { type: 'final' },
      },
      on: {
        SNAP: { target: 'snapping', actions: 'onSnapEnd' },
        RESIZE: { target: '#overlay.resizing', actions: 'onSnapCancel' },
        DRAG: { target: '#overlay.dragging', actions: 'onSnapCancel' },
        CLOSE: { target: '#overlay.closing', actions: 'onSnapCancel' },
      },
      onDone: 'open',
    },
    resizing: {
      initial: 'start',
      states: {
        start: {
          invoke: {
            src: 'onResizeStart',
            onDone: 'resizingSmoothly',
          },
        },
        resizingSmoothly: {
          invoke: { src: 'resizeSmoothly', onDone: 'end' },
        },
        end: {
          invoke: { src: 'onResizeEnd', onDone: 'done' },
          on: {
            SNAP: '#overlay.snapping',
            CLOSE: '#overlay.closing',
            DRAG: '#overlay.dragging',
          },
        },
        done: { type: 'final' },
      },
      on: {
        RESIZE: { target: 'resizing', actions: 'onResizeEnd' },
        SNAP: { target: 'snapping', actions: 'onResizeCancel' },
        DRAG: { target: '#overlay.dragging', actions: 'onResizeCancel' },
        CLOSE: { target: '#overlay.closing', actions: 'onResizeCancel' },
      },
      onDone: 'open',
    },
    closing: {
      initial: 'start',
      states: {
        start: {
          invoke: {
            src: 'onCloseStart',
            onDone: 'deactivating',
          },
          on: { OPEN: { target: '#overlay.open', actions: 'onCloseCancel' } },
        },
        deactivating: {
          invoke: { src: 'deactivate', onDone: 'closingSmoothly' },
        },
        closingSmoothly: {
          invoke: { src: 'closeSmoothly', onDone: 'end' },
        },
        end: {
          invoke: { src: 'onCloseEnd', onDone: 'done' },
          on: {
            OPEN: { target: '#overlay.opening', actions: 'onCloseCancel' },
          },
        },
        done: { type: 'final' },
      },
      on: {
        CLOSE: undefined,
        OPEN: { target: '#overlay.opening', actions: 'onCloseCancel' },
      },
      onDone: 'closed',
    },
  },
  on: {
    CLOSE: '.closing',
  },
}, {
  guards: { initiallyClosed, initiallyOpen }
})

// Export the machine with guards only - actions and actors will be provided by React component
export const overlayMachineWithProviders = overlayMachine.provide({
  guards: { initiallyClosed, initiallyOpen }
})