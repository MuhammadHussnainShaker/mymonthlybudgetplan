import { describe, it, expect, vi } from 'vitest'
import { createKeyDownHandler } from './keyboard'

describe('keyboard', () => {
  describe('createKeyDownHandler', () => {
    it('blurs target element on Enter key', () => {
      const onEscape = vi.fn()
      const handler = createKeyDownHandler(onEscape)

      const mockBlur = vi.fn()
      const event = {
        key: 'Enter',
        target: { blur: mockBlur },
      }

      handler(event)

      expect(mockBlur).toHaveBeenCalledOnce()
      expect(onEscape).not.toHaveBeenCalled()
    })

    it('calls onEscape callback on Escape key', () => {
      const onEscape = vi.fn()
      const handler = createKeyDownHandler(onEscape)

      const mockBlur = vi.fn()
      const event = {
        key: 'Escape',
        target: { blur: mockBlur },
      }

      handler(event)

      expect(onEscape).toHaveBeenCalledOnce()
      expect(mockBlur).not.toHaveBeenCalled()
    })

    it('does nothing for other keys', () => {
      const onEscape = vi.fn()
      const handler = createKeyDownHandler(onEscape)

      const mockBlur = vi.fn()
      const event = {
        key: 'a',
        target: { blur: mockBlur },
      }

      handler(event)

      expect(mockBlur).not.toHaveBeenCalled()
      expect(onEscape).not.toHaveBeenCalled()
    })

    it('handles multiple key presses independently', () => {
      const onEscape = vi.fn()
      const handler = createKeyDownHandler(onEscape)

      const mockBlur1 = vi.fn()
      const event1 = { key: 'Enter', target: { blur: mockBlur1 } }
      handler(event1)

      const mockBlur2 = vi.fn()
      const event2 = { key: 'Escape', target: { blur: mockBlur2 } }
      handler(event2)

      expect(mockBlur1).toHaveBeenCalledOnce()
      expect(mockBlur2).not.toHaveBeenCalled()
      expect(onEscape).toHaveBeenCalledOnce()
    })

    it('handles special keys without side effects', () => {
      const onEscape = vi.fn()
      const handler = createKeyDownHandler(onEscape)

      const mockBlur = vi.fn()
      const specialKeys = ['Tab', 'Shift', 'Control', 'Alt', 'ArrowUp', 'ArrowDown', ' ']

      specialKeys.forEach((key) => {
        handler({ key, target: { blur: mockBlur } })
      })

      expect(mockBlur).not.toHaveBeenCalled()
      expect(onEscape).not.toHaveBeenCalled()
    })

    it('creates new handler function each time', () => {
      const onEscape = vi.fn()
      const handler1 = createKeyDownHandler(onEscape)
      const handler2 = createKeyDownHandler(onEscape)

      expect(handler1).not.toBe(handler2)
      expect(typeof handler1).toBe('function')
      expect(typeof handler2).toBe('function')
    })
  })
})
