import { describe, it, expect } from 'vitest'
import { deleteNaN, roundAndCheckForNaN, processSnapPoints } from '../utils'

describe('utils', () => {
  describe('deleteNaN', () => {
    it('removes NaN values from array', () => {
      const input = [1, NaN, 2, NaN, 3]
      const result = deleteNaN(input)
      expect(result).toEqual([1, 2, 3])
    })

    it('returns empty array when all values are NaN', () => {
      const input = [NaN, NaN, NaN]
      const result = deleteNaN(input)
      expect(result).toEqual([])
    })

    it('returns original array when no NaN values', () => {
      const input = [1, 2, 3, 4, 5]
      const result = deleteNaN(input)
      expect(result).toEqual([1, 2, 3, 4, 5])
    })

    it('handles empty array', () => {
      const input: number[] = []
      const result = deleteNaN(input)
      expect(result).toEqual([])
    })
  })

  describe('roundAndCheckForNaN', () => {
    it('rounds valid numbers', () => {
      expect(roundAndCheckForNaN(1.234)).toBe(1)
      expect(roundAndCheckForNaN(5.678)).toBe(6)
      expect(roundAndCheckForNaN(-2.345)).toBe(-2)
    })

    it('throws error for NaN values', () => {
      expect(() => roundAndCheckForNaN(NaN)).toThrow('Found a NaN!')
    })

    it('handles Infinity values', () => {
      expect(roundAndCheckForNaN(Infinity)).toBe(Infinity)
      expect(roundAndCheckForNaN(-Infinity)).toBe(-Infinity)
    })

    it('handles zero correctly', () => {
      expect(roundAndCheckForNaN(0)).toBe(0)
      expect(Math.sign(roundAndCheckForNaN(-0))).toBe(-0)
    })
  })

  describe('processSnapPoints', () => {
    const maxHeight = 800

    it('processes array snap points correctly', () => {
      const snapPointsArray = [100, 400, 800]
      const result = processSnapPoints(snapPointsArray, maxHeight)
      expect(result).toEqual({
        snapPoints: [100, 400, 800],
        minSnap: 100,
        maxSnap: 800,
      })
    })

    it('processes single snap point correctly', () => {
      const snapPoint = 400
      const result = processSnapPoints(snapPoint, maxHeight)
      expect(result).toEqual({
        snapPoints: [400],
        minSnap: 400,
        maxSnap: 400,
      })
    })

    it('clamps snap points to maxHeight', () => {
      const snapPointsArray = [100, 400, 1000] // 1000 > maxHeight
      const result = processSnapPoints(snapPointsArray, maxHeight)
      expect(result).toEqual({
        snapPoints: [100, 400, 800],
        minSnap: 100,
        maxSnap: 800,
      })
    })

    it('clamps snap points to minimum 0', () => {
      const snapPointsArray = [-100, 100, 400] // -100 < 0
      const result = processSnapPoints(snapPointsArray, maxHeight)
      expect(result).toEqual({
        snapPoints: [0, 100, 400],
        minSnap: 0,
        maxSnap: 400,
      })
    })

    it('throws error when snap points contain NaN', () => {
      const snapPointsArray = [100, NaN, 400]
      expect(() => processSnapPoints(snapPointsArray, maxHeight)).toThrow('Found a NaN!')
    })

    it('handles empty snap points array', () => {
      const result = processSnapPoints([], maxHeight)
      expect(result).toEqual({
        snapPoints: [],
        minSnap: Infinity,
        maxSnap: -Infinity,
      })
    })

    it('deduplicates identical snap points', () => {
      const snapPointsArray = [100, 100, 400, 400, 800]
      const result = processSnapPoints(snapPointsArray, maxHeight)
      expect(result).toEqual({
        snapPoints: [100, 400, 800],
        minSnap: 100,
        maxSnap: 800,
      })
    })

    it('handles decimal snap points by rounding', () => {
      const snapPointsArray = [100.7, 399.2, 800.9]
      const result = processSnapPoints(snapPointsArray, maxHeight)
      expect(result).toEqual({
        snapPoints: [101, 399, 800], // 800.9 gets clamped to maxHeight (800)
        minSnap: 101,
        maxSnap: 800,
      })
    })
  })
})