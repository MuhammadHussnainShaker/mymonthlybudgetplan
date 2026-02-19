import { describe, it, expect } from 'vitest'
import { addItemToList, updateItemInList, removeItemFromList } from './listStateUpdaters'

describe('listStateUpdaters', () => {
  describe('addItemToList', () => {
    it('adds item to the end of list', () => {
      const list = [{ _id: '1', name: 'A' }, { _id: '2', name: 'B' }]
      const newItem = { _id: '3', name: 'C' }
      const result = addItemToList(list, newItem)

      expect(result).toHaveLength(3)
      expect(result[2]).toEqual(newItem)
    })

    it('does not mutate original list', () => {
      const list = [{ _id: '1', name: 'A' }]
      const newItem = { _id: '2', name: 'B' }
      const result = addItemToList(list, newItem)

      expect(result).not.toBe(list)
      expect(list).toHaveLength(1)
      expect(result).toHaveLength(2)
    })

    it('adds to empty list', () => {
      const newItem = { _id: '1', name: 'A' }
      const result = addItemToList([], newItem)

      expect(result).toHaveLength(1)
      expect(result[0]).toEqual(newItem)
    })

    it('allows adding duplicates', () => {
      const list = [{ _id: '1', name: 'A' }]
      const duplicate = { _id: '1', name: 'A' }
      const result = addItemToList(list, duplicate)

      expect(result).toHaveLength(2)
    })
  })

  describe('updateItemInList', () => {
    it('updates existing item by default _id field', () => {
      const list = [
        { _id: '1', name: 'A', value: 10 },
        { _id: '2', name: 'B', value: 20 },
        { _id: '3', name: 'C', value: 30 },
      ]
      const updated = { _id: '2', name: 'B-Updated', value: 25 }
      const result = updateItemInList(list, updated)

      expect(result).toHaveLength(3)
      expect(result[1]).toEqual(updated)
      expect(result[0].name).toBe('A')
      expect(result[2].name).toBe('C')
    })

    it('updates existing item by custom id field', () => {
      const list = [
        { id: '1', name: 'A' },
        { id: '2', name: 'B' },
      ]
      const updated = { id: '2', name: 'B-Updated' }
      const result = updateItemInList(list, updated, 'id')

      expect(result).toHaveLength(2)
      expect(result[1]).toEqual(updated)
    })

    it('adds item to beginning if not found in list', () => {
      const list = [
        { _id: '1', name: 'A' },
        { _id: '2', name: 'B' },
      ]
      const newItem = { _id: '3', name: 'C' }
      const result = updateItemInList(list, newItem)

      expect(result).toHaveLength(3)
      expect(result[0]).toEqual(newItem)
      expect(result[1].name).toBe('A')
      expect(result[2].name).toBe('B')
    })

    it('does not mutate original list', () => {
      const list = [
        { _id: '1', name: 'A' },
        { _id: '2', name: 'B' },
      ]
      const updated = { _id: '1', name: 'A-Updated' }
      const result = updateItemInList(list, updated)

      expect(result).not.toBe(list)
      expect(list[0].name).toBe('A')
      expect(result[0].name).toBe('A-Updated')
    })

    it('handles empty list by adding item', () => {
      const newItem = { _id: '1', name: 'A' }
      const result = updateItemInList([], newItem)

      expect(result).toHaveLength(1)
      expect(result[0]).toEqual(newItem)
    })

    it('handles null/undefined item gracefully', () => {
      const list = [{ _id: '1', name: 'A' }]
      const result = updateItemInList(list, null)

      expect(result).toHaveLength(2)
      expect(result[0]).toBeNull()
    })

    it('handles items with missing id field', () => {
      const list = [
        { _id: '1', name: 'A' },
        { _id: '2', name: 'B' },
      ]
      const itemWithoutId = { name: 'C' }
      const result = updateItemInList(list, itemWithoutId)

      // Item without matching id is added to beginning
      expect(result).toHaveLength(3)
      expect(result[0]).toEqual(itemWithoutId)
    })
  })

  describe('removeItemFromList', () => {
    it('removes item by default _id field', () => {
      const list = [
        { _id: '1', name: 'A' },
        { _id: '2', name: 'B' },
        { _id: '3', name: 'C' },
      ]
      const result = removeItemFromList(list, '2')

      expect(result).toHaveLength(2)
      expect(result[0]._id).toBe('1')
      expect(result[1]._id).toBe('3')
      expect(result.find((item) => item._id === '2')).toBeUndefined()
    })

    it('removes item by custom id field', () => {
      const list = [
        { id: '1', name: 'A' },
        { id: '2', name: 'B' },
        { id: '3', name: 'C' },
      ]
      const result = removeItemFromList(list, '2', 'id')

      expect(result).toHaveLength(2)
      expect(result.find((item) => item.id === '2')).toBeUndefined()
    })

    it('does not mutate original list', () => {
      const list = [
        { _id: '1', name: 'A' },
        { _id: '2', name: 'B' },
      ]
      const result = removeItemFromList(list, '1')

      expect(result).not.toBe(list)
      expect(list).toHaveLength(2)
      expect(result).toHaveLength(1)
    })

    it('returns same length list if item not found', () => {
      const list = [
        { _id: '1', name: 'A' },
        { _id: '2', name: 'B' },
      ]
      const result = removeItemFromList(list, '999')

      expect(result).toHaveLength(2)
    })

    it('handles empty list', () => {
      const result = removeItemFromList([], '1')
      expect(result).toHaveLength(0)
    })

    it('removes all items with matching id', () => {
      const list = [
        { _id: '1', name: 'A' },
        { _id: '2', name: 'B' },
        { _id: '1', name: 'A-duplicate' },
      ]
      const result = removeItemFromList(list, '1')

      expect(result).toHaveLength(1)
      expect(result[0]._id).toBe('2')
    })

    it('handles null itemId', () => {
      const list = [
        { _id: '1', name: 'A' },
        { _id: null, name: 'B' },
      ]
      const result = removeItemFromList(list, null)

      expect(result).toHaveLength(1)
      expect(result[0]._id).toBe('1')
    })
  })
})
