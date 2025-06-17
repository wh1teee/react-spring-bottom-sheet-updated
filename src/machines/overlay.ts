import { assign, fromCallback, fromPromise, setup } from 'xstate'

// This is the root machine, composing all the other machines and is the brain of the bottom sheet

interface OverlayStateSchema {
  states: {
    // the overlay usually starts in the closed position
    closed: {}
    opening: {
      states: {
        // Used to fire off the springStart event
        start: {}
        // Decide how to transition to the open state based on what the initialState is
        transition: {}
        // Fast enter animation, sheet is open by default
        immediately: {
          states: {
            open: {}
            activating: {}
          }
        }
        smoothly: {
          states: {
            // This state only happens when the overlay should start in an open state, instead of animating from the bottom
            // openImmediately: {}
            // visuallyHidden will render the overlay in the open state, but with opacity 0
            // doing this solves two problems:
            // on Android focusing an input element will trigger the softkeyboard to show up, which will change the viewport height
            // on iOS the focus event will break the view by triggering a scrollIntoView event if focus happens while the overlay is below the viewport and body got overflow:hidden
            // by rendering things with opacity 0 we ensure keyboards and scrollIntoView all happen in a way that match up with what the sheet will look like.
            // we can then move it to the opening position below the viewport, and animate it into view without worrying about height changes or scrolling overflow:hidden events
            visuallyHidden: {}
            // In this state we're activating focus traps, scroll locks and more, this will sometimes trigger soft keyboards and scrollIntoView
            // @TODO we might want to add a delay here before proceeding to open, to give android and iOS enough time to adjust the viewport when focusing an interactive element
            activating: {}
            // Animates from the bottom
            open: {}
          }
        }
        // Used to fire off the springEnd event
        end: {}
        // And finally we're ready to transition to open
        done: {}
      }
    }
    open: {}
    // dragging responds to user gestures, which may interrupt the opening state, closing state or snapping
    // when interrupting an opening event, it fires onSpringEnd(OPEN) before onSpringStart(DRAG)
    // when interrupting a closing event, it fires onSpringCancel(CLOSE) before onSpringStart(DRAG)
    // when interrupting a dragging event, it fires onSpringCancel(SNAP) before onSpringStart(DRAG)
    dragging: {}
    // snapping happens whenever transitioning to a new snap point, often after dragging
    snapping: {
      states: {
        start: {}
        snappingSmoothly: {}
        end: {}
        done: {}
      }
    }
    resizing: {
      states: {
        start: {}
        resizingSmoothly: {}
        end: {}
        done: {}
      }
    }
    closing: {
      states: {
        start: {}
        deactivating: {}
        closingSmoothly: {}
        end: {}
        done: {}
      }
    }
  }
}

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
  snapSource?: string
  y?: number
  velocity?: number
}
function sleep(ms = 1000) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

const cancelOpen = {
  CLOSE: { target: '#overlay.closing', reenter: true, actions: 'onOpenCancel' },
}
const openToDrag = {
  DRAG: { target: '#overlay.dragging', reenter: true, actions: 'onOpenEnd' },
}
const openToResize = {
  RESIZE: { target: '#overlay.resizing', reenter: true, actions: 'onOpenEnd' },
}

const initiallyOpen = ({ context }) => context.initialState === 'OPEN'
const initiallyClosed = ({ context }) => context.initialState === 'CLOSED'

// Copy paste the machine into https://xstate.js.org/viz/ to make sense of what's going on in here ;)
export const newOverlayMachine = setup({
  types: {
    context: {} as OverlayContext,
    events: {} as OverlayEvent,
  },
  actions: {
    onOpenCancel: (context, event) => {
      console.log('onOpenCancel', { context, event })
    },
    onSnapCancel: (context, event) => {
      console.log('onSnapCancel', { context, event })
    },
    onResizeCancel: (context, event) => {
      console.log('onResizeCancel', { context, event })
    },
    onCloseCancel: (context, event) => {
      console.log('onCloseCancel', { context, event })
    },
    onOpenEnd: (context, event) => {
      console.log('onOpenCancel', { context, event })
    },
    onSnapEnd: (context, event) => {
      console.log('onSnapEnd', { context, event })
    },
    onResizeEnd: (context, event) => {
      console.log('onResizeEnd', { context, event })
    },
  },
  actors: {
    onSnapStart: fromPromise(async ({ input }) => {
      console.group('onSnapStart')
      console.log({ input })
      await sleep()
      console.groupEnd()
    }),
    onOpenStart: fromPromise(async ({ input }) => {
      await sleep()
    }),
    onCloseStart: fromPromise(async ({ input }) => {
      await sleep()
    }),
    onResizeStart: fromPromise(async ({ input }) => {
      await sleep()
    }),
    onSnapEnd: fromPromise(async ({ input }) => {
      await sleep()
    }),
    onOpenEnd: fromPromise(async ({ input }) => {
      await sleep()
    }),
    onCloseEnd: fromPromise(async ({ input }) => {
      await sleep()
    }),
    onResizeEnd: fromPromise(async ({ input }) => {
      await sleep()
    }),
    renderVisuallyHidden: fromPromise(async ({ input, system, self }) => {
      console.group('renderVisuallyHidden')
      console.log({ system, input, self })
      await sleep()
      console.groupEnd()
    }),
    activate: fromPromise(async ({ input, system, self }) => {
      console.group('activate')
      console.log({ system, input, self })
      await sleep()
      console.groupEnd()
    }),
    deactivate: fromPromise(async ({ input, system, self }) => {
      console.group('deactivate')
      console.log({ system, input, self })
      await sleep()
      console.groupEnd()
    }),
    openSmoothly: fromPromise(async ({ input, system, self }) => {
      console.group('openSmoothly')
      console.log({ system, input, self })
      await sleep()
      console.groupEnd()
    }),
    openImmediately: fromPromise(async ({ input, system, self }) => {
      console.group('openImmediately')
      console.log({ system, input, self })
      await sleep()
      console.groupEnd()
    }),
    snapSmoothly: fromPromise(async ({ input, system, self }) => {
      console.group('snapSmoothly')
      console.log({ system, input, self })
      await sleep()
      console.groupEnd()
    }),
    resizeSmoothly: fromPromise(async ({ input, system, self }) => {
      console.group('resizeSmoothly')
      console.log({ system, input, self })
      await sleep()
      console.groupEnd()
    }),
    closeSmoothly: fromPromise(async ({ input, system, self }) => {
      console.group('closeSmoothly')
      console.log({ system, input, self })
      await sleep()
      console.groupEnd()
    }),
  },
  guards: { initiallyClosed, initiallyOpen },
}).createMachine(
  {
    id: 'overlay',
    initial: 'closed',
    context: { initialState: 'CLOSED' },
    on: {
      CLOSE: '#overlay.closing',
    },
    states: {
      closed: { on: { OPEN: 'opening', CLOSE: undefined } },
      opening: {
        initial: 'start',
        states: {
          start: {
            invoke: {
              src: 'onOpenStart',
              input: ({ context }) => ({ initialState: context.initialState }),
              onDone: 'transition',
            },
          },
          transition: {
            always: [
              { target: 'immediately', reenter: true, guard: 'initiallyOpen' },
              { target: 'smoothly', reenter: true, guard: 'initiallyClosed' },
            ],
          },
          immediately: {
            initial: 'open',
            states: {
              open: {
                invoke: { 
                  src: 'openImmediately',
                  input: ({ context }) => ({ initialState: context.initialState }), 
                  onDone: 'activating' 
                },
              },
              activating: {
                invoke: { 
                  src: 'activate',
                  input: ({ context }) => ({ initialState: context.initialState }), 
                  onDone: '#overlay.opening.end' 
                },
                on: { ...openToDrag, ...openToResize },
              },
            },
          },
          smoothly: {
            initial: 'visuallyHidden',
            states: {
              visuallyHidden: {
                invoke: { 
                  src: 'renderVisuallyHidden',
                  input: ({ context }) => ({ initialState: context.initialState }), 
                  onDone: 'activating' 
                },
              },
              activating: {
                invoke: { 
                  src: 'activate',
                  input: ({ context }) => ({ initialState: context.initialState }), 
                  onDone: 'open' 
                },
              },
              open: {
                invoke: { 
                  src: 'openSmoothly',
                  input: ({ context }) => ({ initialState: context.initialState }), 
                  onDone: '#overlay.opening.end' 
                },
                on: { ...openToDrag, ...openToResize },
              },
            },
          },
          end: {
            invoke: { 
              src: 'onOpenEnd',
              input: ({ context }) => ({ initialState: context.initialState }),
              onDone: 'done' 
            },
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
              input: ({ event }) => {
                console.log('Input mapper for onSnapStart received event:', event);
                
                if (event.type === 'SNAP' && 'payload' in event) {
                  return {
                    source: event.payload.source,
                    y: event.payload.y,
                    velocity: event.payload.velocity
                  };
                }
                console.warn('Event has no payload or is not SNAP type:', event);
                return {};
              },
              onDone: 'snappingSmoothly',
            },
            entry: [
              assign({
                y: (context, event) => {
                  console.log('assign y received event:', event);
                  
                  if (event.type === 'SNAP' && 'payload' in event) {
                    return event.payload.y;
                  }
                  console.warn('assign y: Event has no payload or is not SNAP type:', event);
                  return context.y;
                },
                velocity: (context, event) => {
                  if (event.type === 'SNAP' && 'payload' in event) {
                    return event.payload.velocity;
                  }
                  return context.velocity;
                },
                snapSource: (context, event) => {
                  if (event.type === 'SNAP' && 'payload' in event) {
                    return event.payload.source || 'custom';
                  }
                  return context.snapSource || 'custom';
                }
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
              input: ({ context }) => ({ snapSource: context.snapSource }),
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
          SNAP: { target: 'snapping', reenter: true, actions: 'onSnapEnd' },
          RESIZE: { target: '#overlay.resizing', reenter: true, actions: 'onSnapCancel' },
          DRAG: { target: '#overlay.dragging', reenter: true, actions: 'onSnapCancel' },
          CLOSE: { target: '#overlay.closing', reenter: true, actions: 'onSnapCancel' },
        },
        onDone: 'open',
      },
      resizing: {
        initial: 'start',
        states: {
          start: {
            invoke: {
              src: 'onResizeStart',
              input: ({ context }) => ({}),
              onDone: 'resizingSmoothly',
            },
          },
          resizingSmoothly: {
            invoke: { 
              src: 'resizeSmoothly',
              input: ({ context }) => ({}),
              onDone: 'end' 
            },
          },
          end: {
            invoke: { 
              src: 'onResizeEnd',
              input: ({ context }) => ({}),
              onDone: 'done' 
            },
            on: {
              SNAP: '#overlay.snapping',
              CLOSE: '#overlay.closing',
              DRAG: '#overlay.dragging',
            },
          },
          done: { type: 'final' },
        },
        on: {
          RESIZE: { target: 'resizing', reenter: true, actions: 'onResizeEnd' },
          SNAP: { target: 'snapping', reenter: true, actions: 'onResizeCancel' },
          DRAG: { target: '#overlay.dragging', reenter: true, actions: 'onResizeCancel' },
          CLOSE: { target: '#overlay.closing', reenter: true, actions: 'onResizeCancel' },
        },
        onDone: 'open',
      },
      closing: {
        initial: 'start',
        states: {
          start: {
            invoke: {
              src: 'onCloseStart',
              input: ({ context }) => ({}),
              onDone: 'deactivating',
            },
            on: { OPEN: { target: '#overlay.open', reenter: true, actions: 'onCloseCancel' } },
          },
          deactivating: {
            invoke: { 
              src: 'deactivate',
              input: ({ context }) => ({}),
              onDone: 'closingSmoothly' 
            },
          },
          closingSmoothly: {
            invoke: { 
              src: 'closeSmoothly',
              input: ({ context }) => ({}),
              onDone: 'end' 
            },
          },
          end: {
            invoke: { 
              src: 'onCloseEnd',
              input: ({ context }) => ({}),
              onDone: 'done' 
            },
            on: {
              OPEN: { target: '#overlay.opening', reenter: true, actions: 'onCloseCancel' },
            },
          },
          done: { type: 'final' },
        },
        on: {
          CLOSE: undefined,
          OPEN: { target: '#overlay.opening', reenter: true, actions: 'onCloseCancel' },
        },
        onDone: 'closed',
      },
    }
    // as OverlayStateSchema['states'],
  }
)
