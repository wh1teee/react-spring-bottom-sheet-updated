import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useReducedMotion } from '../useReducedMotion'

describe('useReducedMotion', () => {
  beforeEach(() => {
    // Reset matchMedia mock
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('returns false by default when reduced motion is not preferred', () => {
    const { result } = renderHook(() => useReducedMotion())
    expect(result.current).toBe(false)
  })

  it('returns true when reduced motion is preferred', () => {
    // Mock matchMedia to return true for reduced motion
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })

    const { result } = renderHook(() => useReducedMotion())
    expect(result.current).toBe(true)
  })

  it('calls matchMedia with correct query', () => {
    const matchMediaSpy = vi.fn().mockReturnValue({
      matches: false,
      media: '',
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: matchMediaSpy,
    })

    renderHook(() => useReducedMotion())
    
    expect(matchMediaSpy).toHaveBeenCalledWith('(prefers-reduced-motion: reduce)')
  })

  it('sets up event listener for media query changes', () => {
    const addEventListenerSpy = vi.fn()
    const removeEventListenerSpy = vi.fn()

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockReturnValue({
        matches: false,
        media: '',
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: addEventListenerSpy,
        removeEventListener: removeEventListenerSpy,
        dispatchEvent: vi.fn(),
      }),
    })

    const { unmount } = renderHook(() => useReducedMotion())
    
    expect(addEventListenerSpy).toHaveBeenCalledWith('change', expect.any(Function))
    
    unmount()
    
    expect(removeEventListenerSpy).toHaveBeenCalledWith('change', expect.any(Function))
  })

  it('handles environment without matchMedia gracefully', () => {
    // Remove matchMedia from window
    const originalMatchMedia = window.matchMedia
    // @ts-expect-error - Intentionally removing matchMedia for testing
    delete window.matchMedia

    const { result } = renderHook(() => useReducedMotion())
    
    // Should default to false when matchMedia is not available
    expect(result.current).toBe(false)

    // Restore matchMedia
    window.matchMedia = originalMatchMedia
  })
})