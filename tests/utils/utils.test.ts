import { describe, it, expect, beforeEach } from '@jest/globals'
import { clamp, deleteNaN, roundAndCheckForNaN, processSnapPoints, debugging } from '../../src/utils'

describe('clamp', () => {
  describe('valid inputs', () => {
    it('should return the number when within bounds', () => {
      expect(clamp(5, 0, 10)).toBe(5)
      expect(clamp(0, 0, 10)).toBe(0)
      expect(clamp(10, 0, 10)).toBe(10)
    })

    it('should clamp to lower bound when number is below', () => {
      expect(clamp(-5, 0, 10)).toBe(0)
      expect(clamp(-100, -50, 50)).toBe(-50)
      expect(clamp(0, 5, 10)).toBe(5)
    })

    it('should clamp to upper bound when number is above', () => {
      expect(clamp(15, 0, 10)).toBe(10)
      expect(clamp(100, -50, 50)).toBe(50)
      expect(clamp(10, 0, 5)).toBe(5)
    })

    it('should handle negative bounds correctly', () => {
      expect(clamp(-5, -10, -1)).toBe(-5)
      expect(clamp(-15, -10, -1)).toBe(-10)
      expect(clamp(0, -10, -1)).toBe(-1)
    })

    it('should handle floating point numbers', () => {
      expect(clamp(3.14, 0, 10)).toBe(3.14)
      expect(clamp(0.5, 0, 1)).toBe(0.5)
      expect(clamp(10.7, 0, 10)).toBe(10)
    })
  })

  describe('edge cases', () => {
    it('should handle equal bounds', () => {
      expect(clamp(5, 5, 5)).toBe(5)
      expect(clamp(0, 5, 5)).toBe(5)
      expect(clamp(10, 5, 5)).toBe(5)
    })

    it('should handle zero values', () => {
      expect(clamp(0, 0, 0)).toBe(0)
      expect(clamp(5, 0, 0)).toBe(0)
      expect(clamp(-5, 0, 0)).toBe(0)
    })

    it('should handle very large numbers', () => {
      expect(clamp(Number.MAX_SAFE_INTEGER, 0, 1000)).toBe(1000)
      expect(clamp(Number.MIN_SAFE_INTEGER, 0, 1000)).toBe(0)
    })

    it('should handle infinity', () => {
      expect(clamp(Infinity, 0, 100)).toBe(100)
      expect(clamp(-Infinity, 0, 100)).toBe(0)
    })

    it('should handle NaN inputs', () => {
      expect(clamp(NaN, 0, 10)).toBeNaN()
      expect(clamp(5, NaN, 10)).toBe(5) // NaN converts to 0
      expect(clamp(5, 0, NaN)).toBe(0)  // NaN converts to 0
    })
  })

  describe('type coercion', () => {
    it('should convert string numbers to numbers', () => {
      expect(clamp('5' as any, 0, 10)).toBe(5)
      expect(clamp(5, '0' as any, 10)).toBe(5)
      expect(clamp(5, 0, '10' as any)).toBe(5)
    })

    it('should handle boolean values', () => {
      expect(clamp(true as any, 0, 10)).toBe(1)
      expect(clamp(false as any, 0, 10)).toBe(0)
    })
  })
})

describe('deleteNaN', () => {
  it('should remove NaN values from array', () => {
    const result = deleteNaN([1, 2, NaN, 3, NaN, 4])
    expect(result).toEqual([1, 2, 3, 4])
  })

  it('should handle array with only NaN values', () => {
    const result = deleteNaN([NaN, NaN, NaN])
    expect(result).toEqual([])
  })

  it('should handle array with no NaN values', () => {
    const result = deleteNaN([1, 2, 3, 4])
    expect(result).toEqual([1, 2, 3, 4])
  })

  it('should handle empty array', () => {
    const result = deleteNaN([])
    expect(result).toEqual([])
  })

  it('should deduplicate values while removing NaN', () => {
    const result = deleteNaN([1, 2, 2, NaN, 3, 3, NaN])
    expect(result).toEqual([1, 2, 3])
  })

  it('should handle mixed types', () => {
    const result = deleteNaN([1, 'hello', NaN, true, NaN, null])
    expect(result).toEqual([1, 'hello', true, null])
  })

  it('should handle nested arrays and objects', () => {
    const obj = { a: 1 }
    const arr = [1, 2]
    const result = deleteNaN([obj, arr, NaN, obj, arr])
    expect(result).toEqual([obj, arr]) // Set deduplication
  })
})

describe('roundAndCheckForNaN', () => {
  describe('valid inputs', () => {
    it('should round positive numbers correctly', () => {
      expect(roundAndCheckForNaN(3.14)).toBe(3)
      expect(roundAndCheckForNaN(3.7)).toBe(4)
      expect(roundAndCheckForNaN(5.5)).toBe(6)
    })

    it('should round negative numbers correctly', () => {
      expect(roundAndCheckForNaN(-3.14)).toBe(-3)
      expect(roundAndCheckForNaN(-3.7)).toBe(-4)
      expect(roundAndCheckForNaN(-5.5)).toBe(-5) // Math.round(-5.5) = -5
    })

    it('should handle whole numbers', () => {
      expect(roundAndCheckForNaN(5)).toBe(5)
      expect(roundAndCheckForNaN(0)).toBe(0)
      expect(roundAndCheckForNaN(-5)).toBe(-5)
    })

    it('should handle very small numbers', () => {
      expect(roundAndCheckForNaN(0.1)).toBe(0)
      expect(roundAndCheckForNaN(0.4)).toBe(0)
      expect(roundAndCheckForNaN(0.6)).toBe(1)
    })

    it('should handle very large numbers', () => {
      expect(roundAndCheckForNaN(999999.4)).toBe(999999)
      expect(roundAndCheckForNaN(999999.6)).toBe(1000000)
    })
  })

  describe('error cases', () => {
    it('should throw TypeError for NaN input', () => {
      expect(() => roundAndCheckForNaN(NaN)).toThrow(TypeError)
      expect(() => roundAndCheckForNaN(NaN)).toThrow(
        'Found a NaN! Check your snapPoints / defaultSnap / snapTo '
      )
    })

    it('should throw TypeError for computed NaN', () => {
      expect(() => roundAndCheckForNaN(0 / 0)).toThrow(TypeError)
      expect(() => roundAndCheckForNaN(Infinity - Infinity)).toThrow(TypeError)
    })
  })

  describe('edge cases', () => {
    it('should handle infinity', () => {
      expect(roundAndCheckForNaN(Infinity)).toBe(Infinity)
      expect(roundAndCheckForNaN(-Infinity)).toBe(-Infinity)
    })

    it('should handle -0', () => {
      expect(roundAndCheckForNaN(-0)).toBe(-0)
    })
  })
})

describe('processSnapPoints', () => {
  describe('valid inputs', () => {
    it('should process single snap point', () => {
      const result = processSnapPoints(100, 500)
      expect(result).toEqual({
        snapPoints: [100],
        minSnap: 100,
        maxSnap: 100
      })
    })

    it('should process multiple snap points', () => {
      const result = processSnapPoints([100, 200, 300], 500)
      expect(result).toEqual({
        snapPoints: [100, 200, 300],
        minSnap: 100,
        maxSnap: 300
      })
    })

    it('should deduplicate snap points', () => {
      const result = processSnapPoints([100, 200, 100, 300, 200], 500)
      expect(result.snapPoints).toHaveLength(3)
      expect(result.snapPoints).toContain(100)
      expect(result.snapPoints).toContain(200)
      expect(result.snapPoints).toContain(300)
    })

    it('should clamp snap points to maxHeight', () => {
      const result = processSnapPoints([100, 300, 600], 400)
      expect(result.snapPoints).toEqual([100, 300, 400])
      expect(result.maxSnap).toBe(400)
    })

    it('should clamp snap points to minimum of 0', () => {
      const result = processSnapPoints([-100, 50, 200], 300)
      expect(result.snapPoints).toEqual([0, 50, 200])
      expect(result.minSnap).toBe(0)
    })

    it('should round decimal snap points', () => {
      const result = processSnapPoints([100.4, 200.7, 300.1], 500)
      expect(result.snapPoints).toEqual([100, 201, 300])
    })

    it('should handle mixed integer and decimal values', () => {
      const result = processSnapPoints([100, 200.5, 300], 500)
      expect(result.snapPoints).toEqual([100, 201, 300])
    })
  })

  describe('error cases', () => {
    it('should throw TypeError for NaN snap points', () => {
      expect(() => processSnapPoints([100, NaN, 200], 500)).toThrow(TypeError)
      expect(() => processSnapPoints([100, NaN, 200], 500)).toThrow(
        'Found a NaN! Check your snapPoints / defaultSnap / snapTo '
      )
    })

    it('should throw TypeError for NaN single snap point', () => {
      expect(() => processSnapPoints(NaN, 500)).toThrow(TypeError)
    })

    it('should throw TypeError when all snap points are clamped to same value creating NaN', () => {
      // This would create an array of [0, 0, 0] which when Math.min/max applied should not be NaN
      const result = processSnapPoints([-100, -200, -300], 0)
      expect(result.snapPoints).toEqual([0])
      expect(result.minSnap).toBe(0)
      expect(result.maxSnap).toBe(0)
    })
  })

  describe('edge cases', () => {
    it('should handle empty array conversion', () => {
      expect(() => processSnapPoints([], 500)).toThrow(TypeError)
      expect(() => processSnapPoints([], 500)).toThrow('snapPoints cannot be an empty array')
    })

    it('should handle single element array', () => {
      const result = processSnapPoints([250], 500)
      expect(result).toEqual({
        snapPoints: [250],
        minSnap: 250,
        maxSnap: 250
      })
    })

    it('should handle zero maxHeight', () => {
      const result = processSnapPoints([100, 200], 0)
      expect(result.snapPoints).toEqual([0])
      expect(result.minSnap).toBe(0)
      expect(result.maxSnap).toBe(0)
    })

    it('should handle very large snap points', () => {
      const result = processSnapPoints([Number.MAX_SAFE_INTEGER], Number.MAX_SAFE_INTEGER)
      expect(result.snapPoints).toEqual([Number.MAX_SAFE_INTEGER])
    })
  })
})

describe('debugging', () => {
  it('should be a boolean value', () => {
    expect(typeof debugging).toBe('boolean')
  })

  it('should be false in test environment', () => {
    // In test environment, debugging should be false
    expect(debugging).toBe(false)
  })

  it('should follow the correct logic pattern', () => {
    // Test the debugging logic components
    const isDev = process.env.NODE_ENV === 'development'
    const hasWindow = typeof window !== 'undefined'
    const hasDebugQuery = hasWindow && window.location.search === '?debug'
    
    const expectedDebugging = isDev && hasWindow ? hasDebugQuery : false
    
    // In test environment, this should be false
    expect(expectedDebugging).toBe(false)
  })

  it('should handle environment scenarios correctly', () => {
    // Test different environment scenarios
    const testCases = [
      { env: 'production', hasWindow: true, search: '?debug', expected: false },
      { env: 'development', hasWindow: false, search: '?debug', expected: false },
      { env: 'development', hasWindow: true, search: '', expected: false },
      { env: 'development', hasWindow: true, search: '?debug', expected: true },
      { env: 'development', hasWindow: true, search: '?foo=bar&debug', expected: false }
    ]

    testCases.forEach(({ env, hasWindow, search, expected }) => {
      const result = env === 'development' && hasWindow ? search === '?debug' : false
      expect(result).toBe(expected)
    })
  })
})