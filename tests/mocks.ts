import { vi } from 'vitest'

// Complete react-spring mock
export const reactSpringMock = {
  useSpring: vi.fn(() => [
    {
      transform: 'translateY(0px)',
      opacity: 1,
      y: 0,
      maxHeight: 800,
    },
    vi.fn(),
  ]),
  useSpringRef: vi.fn(() => ({ current: null })),
  to: vi.fn((deps, fn) => {
    // Mock interpolation function
    return 'mocked-interpolation'
  }),
  config: {
    default: { tension: 300, friction: 30 },
  },
}

// Use-gesture mock  
export const useGestureMock = {
  useDrag: vi.fn(() => vi.fn()),
}

// XState mock
export const xstateMock = {
  useMachine: vi.fn(() => [
    {
      value: 'closed',
      context: {},
      can: vi.fn(() => true),
      send: vi.fn(),
    },
    vi.fn(),
  ]),
}

// Portal mock
export const portalMock = {
  Portal: ({ children }: { children: React.ReactNode }) => children,
}

// Apply all mocks
vi.mock('@react-spring/web', () => reactSpringMock)
vi.mock('@use-gesture/react', () => useGestureMock)
vi.mock('@xstate/react', () => xstateMock)
vi.mock('@radix-ui/react-portal', () => portalMock)