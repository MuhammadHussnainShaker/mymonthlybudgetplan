import { describe, it, expect } from 'vitest'
import {
  toNumber,
  sumBy,
  calculateDifference,
  calculateProjectedActualTotals,
  calculateParentTotals,
} from './calculations'

describe('calculations', () => {
  describe('toNumber', () => {
    it('converts valid numeric strings to numbers', () => {
      expect(toNumber('42')).toBe(42)
      expect(toNumber('3.14')).toBe(3.14)
      expect(toNumber('-10')).toBe(-10)
    })

    it('converts numeric values to numbers', () => {
      expect(toNumber(42)).toBe(42)
      expect(toNumber(3.14)).toBe(3.14)
      expect(toNumber(-10)).toBe(-10)
    })

    it('returns 0 for invalid values', () => {
      expect(toNumber('invalid')).toBe(0)
      expect(toNumber(null)).toBe(0)
      expect(toNumber(undefined)).toBe(0)
      expect(toNumber('')).toBe(0)
      expect(toNumber(NaN)).toBe(0)
      expect(toNumber(Infinity)).toBe(0)
    })

    it('handles edge cases', () => {
      expect(toNumber('0')).toBe(0)
      expect(toNumber(0)).toBe(0)
      expect(toNumber('-0')).toBe(-0) // parseFloat('-0') returns -0
    })
  })

  describe('sumBy', () => {
    it('sums numeric values from array of objects', () => {
      const items = [
        { amount: 10 },
        { amount: 20 },
        { amount: 30 },
      ]
      expect(sumBy(items, 'amount')).toBe(60)
    })

    it('handles empty arrays', () => {
      expect(sumBy([], 'amount')).toBe(0)
    })

    it('handles missing keys', () => {
      const items = [
        { amount: 10 },
        { other: 20 },
        { amount: 30 },
      ]
      expect(sumBy(items, 'amount')).toBe(40)
    })

    it('handles invalid numeric values', () => {
      const items = [
        { amount: 10 },
        { amount: 'invalid' },
        { amount: null },
        { amount: undefined },
        { amount: 20 },
      ]
      expect(sumBy(items, 'amount')).toBe(30)
    })

    it('handles string numbers', () => {
      const items = [
        { amount: '10' },
        { amount: '20.5' },
        { amount: '15' },
      ]
      expect(sumBy(items, 'amount')).toBe(45.5)
    })

    it('handles null/undefined items', () => {
      const items = [
        { amount: 10 },
        null,
        undefined,
        { amount: 20 },
      ]
      expect(sumBy(items, 'amount')).toBe(30)
    })
  })

  describe('calculateDifference', () => {
    it('calculates projected minus actual by default', () => {
      expect(calculateDifference(100, 80, true)).toBe(20)
      expect(calculateDifference(100, 120, true)).toBe(-20)
    })

    it('calculates actual minus projected when flag is false', () => {
      expect(calculateDifference(100, 80, false)).toBe(-20)
      expect(calculateDifference(100, 120, false)).toBe(20)
    })

    it('handles string numbers', () => {
      expect(calculateDifference('100', '80', true)).toBe(20)
      expect(calculateDifference('100', '120', false)).toBe(20)
    })

    it('handles invalid values', () => {
      expect(calculateDifference('invalid', 80, true)).toBe(-80)
      expect(calculateDifference(100, 'invalid', true)).toBe(100)
      expect(calculateDifference('invalid', 'invalid', true)).toBe(0)
    })
  })

  describe('calculateProjectedActualTotals', () => {
    it('calculates totals with default keys and mode', () => {
      const items = [
        { projectedAmount: 100, actualAmount: 80 },
        { projectedAmount: 200, actualAmount: 150 },
        { projectedAmount: 50, actualAmount: 60 },
      ]
      const result = calculateProjectedActualTotals(items)
      expect(result.projectedTotal).toBe(350)
      expect(result.actualTotal).toBe(290)
      expect(result.difference).toBe(-60) // actualMinusProjected is default
    })

    it('calculates difference with projectedMinusActual mode', () => {
      const items = [
        { projectedAmount: 100, actualAmount: 80 },
        { projectedAmount: 200, actualAmount: 150 },
      ]
      const result = calculateProjectedActualTotals(items, {
        differenceMode: 'projectedMinusActual',
      })
      expect(result.projectedTotal).toBe(300)
      expect(result.actualTotal).toBe(230)
      expect(result.difference).toBe(70)
    })

    it('uses custom keys', () => {
      const items = [
        { planned: 100, spent: 80 },
        { planned: 200, spent: 150 },
      ]
      const result = calculateProjectedActualTotals(items, {
        projectedKey: 'planned',
        actualKey: 'spent',
      })
      expect(result.projectedTotal).toBe(300)
      expect(result.actualTotal).toBe(230)
    })

    it('handles empty arrays', () => {
      const result = calculateProjectedActualTotals([])
      expect(result.projectedTotal).toBe(0)
      expect(result.actualTotal).toBe(0)
      expect(result.difference).toBe(0)
    })

    it('handles items with missing values', () => {
      const items = [
        { projectedAmount: 100, actualAmount: 80 },
        { projectedAmount: null, actualAmount: undefined },
        { projectedAmount: 50, actualAmount: 60 },
      ]
      const result = calculateProjectedActualTotals(items)
      expect(result.projectedTotal).toBe(150)
      expect(result.actualTotal).toBe(140)
    })
  })

  describe('calculateParentTotals', () => {
    it('calculates totals grouped by parent', () => {
      const items = [
        { parentId: '1', projectedAmount: 100, actualAmount: 80 },
        { parentId: '1', projectedAmount: 50, actualAmount: 40 },
        { parentId: '2', projectedAmount: 200, actualAmount: 150 },
      ]
      const result = calculateParentTotals(items)

      expect(result.byParent['1'].projectedTotal).toBe(150)
      expect(result.byParent['1'].actualTotal).toBe(120)
      expect(result.byParent['1'].difference).toBe(30)

      expect(result.byParent['2'].projectedTotal).toBe(200)
      expect(result.byParent['2'].actualTotal).toBe(150)
      expect(result.byParent['2'].difference).toBe(50)

      expect(result.grand.projectedTotal).toBe(350)
      expect(result.grand.actualTotal).toBe(270)
      expect(result.grand.difference).toBe(80)
    })

    it('uses custom keys', () => {
      const items = [
        { categoryId: 'A', planned: 100, spent: 80 },
        { categoryId: 'A', planned: 50, spent: 40 },
      ]
      const result = calculateParentTotals(items, {
        parentIdKey: 'categoryId',
        projectedKey: 'planned',
        actualKey: 'spent',
      })

      expect(result.byParent['A'].projectedTotal).toBe(150)
      expect(result.byParent['A'].actualTotal).toBe(120)
    })

    it('handles empty arrays', () => {
      const result = calculateParentTotals([])
      expect(result.byParent).toEqual({})
      expect(result.grand.projectedTotal).toBe(0)
      expect(result.grand.actualTotal).toBe(0)
      expect(result.grand.difference).toBe(0)
    })

    it('handles items with null/undefined parentId', () => {
      const items = [
        { parentId: null, projectedAmount: 100, actualAmount: 80 },
        { parentId: undefined, projectedAmount: 50, actualAmount: 40 },
        { parentId: '1', projectedAmount: 200, actualAmount: 150 },
      ]
      const result = calculateParentTotals(items)

      // null and undefined are converted to empty string
      expect(result.byParent['']).toBeDefined()
      expect(result.byParent['1']).toBeDefined()
      expect(result.grand.projectedTotal).toBe(350)
    })

    it('handles items with missing amounts', () => {
      const items = [
        { parentId: '1', projectedAmount: 100, actualAmount: 80 },
        { parentId: '1', projectedAmount: null, actualAmount: undefined },
        { parentId: '1', projectedAmount: 50, actualAmount: 60 },
      ]
      const result = calculateParentTotals(items)

      expect(result.byParent['1'].projectedTotal).toBe(150)
      expect(result.byParent['1'].actualTotal).toBe(140)
    })

    it('converts numeric parentId to string', () => {
      const items = [
        { parentId: 1, projectedAmount: 100, actualAmount: 80 },
        { parentId: 1, projectedAmount: 50, actualAmount: 40 },
      ]
      const result = calculateParentTotals(items)

      expect(result.byParent['1']).toBeDefined()
      expect(result.byParent['1'].projectedTotal).toBe(150)
    })
  })
})
