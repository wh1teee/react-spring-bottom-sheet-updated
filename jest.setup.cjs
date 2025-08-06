require('@testing-library/jest-dom')
require('resize-observer-polyfill')

// Mock window.matchMedia for useReducedMotion tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock requestAnimationFrame for react-spring tests
global.requestAnimationFrame = (callback) => {
  setTimeout(callback, 0)
}
global.cancelAnimationFrame = (id) => {
  clearTimeout(id)
}

// Mock ResizeObserver for component tests
global.ResizeObserver = class ResizeObserver {
  constructor(callback) {
    this.callback = callback
  }
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Mock focus-trap for accessibility tests
jest.mock('focus-trap', () => ({
  createFocusTrap: jest.fn(() => ({
    activate: jest.fn(),
    deactivate: jest.fn(),
  })),
}))

// Mock CSS custom properties for styling tests
const originalGetComputedStyle = window.getComputedStyle
window.getComputedStyle = jest.fn((element) => {
  const style = originalGetComputedStyle(element)
  return {
    ...style,
    getPropertyValue: jest.fn((prop) => {
      // Mock CSS custom properties values
      const mockValues = {
        '--rsbs-backdrop-bg': 'rgba(0, 0, 0, 0.5)',
        '--rsbs-bg': 'white',
        '--rsbs-handle-bg': 'rgba(0, 0, 0, 0.3)',
        '--rsbs-overlay-rounded': '8px',
      }
      return mockValues[prop] || style.getPropertyValue(prop)
    }),
  }
})

// Suppress console warnings for tests
const originalWarn = console.warn
console.warn = (...args) => {
  // Ignore specific warnings that are expected in tests
  if (
    args[0]?.includes?.('componentWillReceiveProps') ||
    args[0]?.includes?.('useLayoutEffect')
  ) {
    return
  }
  originalWarn(...args)
}

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor(callback) {
    this.callback = callback
  }
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Mock document.elementFromPoint for gesture tests
document.elementFromPoint = jest.fn(() => null)

// Mock touch events
window.TouchEvent = class TouchEvent extends Event {
  constructor(type, eventInitDict) {
    super(type, eventInitDict)
    this.touches = eventInitDict?.touches || []
    this.changedTouches = eventInitDict?.changedTouches || []
  }
}