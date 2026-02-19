import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { apiFetch } from './apiFetch'

describe('apiFetch', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  describe('successful JSON responses', () => {
    it('returns JSON data when response is ok and content-type is application/json', async () => {
      const mockData = { success: true, data: { id: 1, name: 'Test' } }
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        headers: {
          get: vi.fn().mockReturnValue('application/json'),
        },
        json: vi.fn().mockResolvedValue(mockData),
      })
      vi.stubGlobal('fetch', fetchMock)

      const result = await apiFetch('/api/test')

      expect(result).toEqual(mockData)
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/test',
        expect.objectContaining({
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        }),
      )
    })

    it('returns JSON data when content-type includes charset', async () => {
      const mockData = { success: true, data: { id: 1 } }
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        headers: {
          get: vi.fn().mockReturnValue('application/json; charset=utf-8'),
        },
        json: vi.fn().mockResolvedValue(mockData),
      })
      vi.stubGlobal('fetch', fetchMock)

      const result = await apiFetch('/api/test')

      expect(result).toEqual(mockData)
    })
  })

  describe('successful text responses', () => {
    it('returns text data when content-type is not application/json', async () => {
      const mockText = 'Plain text response'
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        headers: {
          get: vi.fn().mockReturnValue('text/plain'),
        },
        text: vi.fn().mockResolvedValue(mockText),
      })
      vi.stubGlobal('fetch', fetchMock)

      const result = await apiFetch('/api/test')

      expect(result).toBe(mockText)
    })

    it('returns text data when content-type is null', async () => {
      const mockText = 'Response without content-type'
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        headers: {
          get: vi.fn().mockReturnValue(null),
        },
        text: vi.fn().mockResolvedValue(mockText),
      })
      vi.stubGlobal('fetch', fetchMock)

      const result = await apiFetch('/api/test')

      expect(result).toBe(mockText)
    })
  })

  describe('error handling - JSON responses', () => {
    it('throws error with message from JSON response when response is not ok', async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        headers: {
          get: vi.fn().mockReturnValue('application/json'),
        },
        text: vi.fn().mockResolvedValue(JSON.stringify({
          message: 'Invalid input data',
        })),
      })
      vi.stubGlobal('fetch', fetchMock)

      await expect(apiFetch('/api/test')).rejects.toThrow('Invalid input data')
    })

    it('throws error with error field from JSON response', async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        headers: {
          get: vi.fn().mockReturnValue('application/json'),
        },
        text: vi.fn().mockResolvedValue(JSON.stringify({
          error: 'Database connection failed',
        })),
      })
      vi.stubGlobal('fetch', fetchMock)

      await expect(apiFetch('/api/test')).rejects.toThrow(
        'Database connection failed',
      )
    })

    it('throws error with statusText when JSON has no message or error', async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        headers: {
          get: vi.fn().mockReturnValue('application/json'),
        },
        text: vi.fn().mockResolvedValue(JSON.stringify({})),
      })
      vi.stubGlobal('fetch', fetchMock)

      await expect(apiFetch('/api/test')).rejects.toThrow('Not Found')
    })

    it('throws error when JSON response has success: false', async () => {
      const mockData = { success: false, message: 'Operation failed' }
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        headers: {
          get: vi.fn().mockReturnValue('application/json'),
        },
        json: vi.fn().mockResolvedValue(mockData),
      })
      vi.stubGlobal('fetch', fetchMock)

      await expect(apiFetch('/api/test')).rejects.toThrow('Operation failed')
    })

    it('uses error field when success: false and no message', async () => {
      const mockData = { success: false, error: 'Validation error' }
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        headers: {
          get: vi.fn().mockReturnValue('application/json'),
        },
        json: vi.fn().mockResolvedValue(mockData),
      })
      vi.stubGlobal('fetch', fetchMock)

      await expect(apiFetch('/api/test')).rejects.toThrow('Validation error')
    })

    it('uses fallback message when success: false with no message or error', async () => {
      const mockData = { success: false }
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        headers: {
          get: vi.fn().mockReturnValue('application/json'),
        },
        json: vi.fn().mockResolvedValue(mockData),
      })
      vi.stubGlobal('fetch', fetchMock)

      await expect(apiFetch('/api/test')).rejects.toThrow(
        'Request to /api/test failed',
      )
    })
  })

  describe('error handling - HTML responses', () => {
    it('extracts error from HTML pre tag when response is not ok', async () => {
      const htmlError = '<html><body><pre>Error: Something went wrong</pre></body></html>'
      const fetchMock = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        headers: {
          get: vi.fn().mockReturnValue('text/html'),
        },
        text: vi.fn().mockResolvedValue(htmlError),
      })
      vi.stubGlobal('fetch', fetchMock)

      await expect(apiFetch('/api/test')).rejects.toThrow(
        'Error: Something went wrong',
      )
    })

    it('uses fallback message when HTML has no pre tag', async () => {
      const htmlError = '<html><body><h1>Error Page</h1></body></html>'
      const fetchMock = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        headers: {
          get: vi.fn().mockReturnValue('text/html'),
        },
        text: vi.fn().mockResolvedValue(htmlError),
      })
      vi.stubGlobal('fetch', fetchMock)

      await expect(apiFetch('/api/test')).rejects.toThrow(
        'An unexpected server error occurred.',
      )
    })

    it('handles HTML content-type with charset', async () => {
      const htmlError = '<html><body><pre>Server Error</pre></body></html>'
      const fetchMock = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        headers: {
          get: vi.fn().mockReturnValue('text/html; charset=utf-8'),
        },
        text: vi.fn().mockResolvedValue(htmlError),
      })
      vi.stubGlobal('fetch', fetchMock)

      await expect(apiFetch('/api/test')).rejects.toThrow('Server Error')
    })
  })

  describe('error handling - text responses', () => {
    it('throws error with text response when not ok and no content-type', async () => {
      const errorText = 'Plain text error message'
      const fetchMock = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        headers: {
          get: vi.fn().mockReturnValue(null),
        },
        text: vi.fn().mockResolvedValue(errorText),
      })
      vi.stubGlobal('fetch', fetchMock)

      await expect(apiFetch('/api/test')).rejects.toThrow(errorText)
    })

    it('uses statusText when text response is empty', async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: false,
        status: 502,
        statusText: 'Bad Gateway',
        headers: {
          get: vi.fn().mockReturnValue(null),
        },
        text: vi.fn().mockResolvedValue(''),
      })
      vi.stubGlobal('fetch', fetchMock)

      await expect(apiFetch('/api/test')).rejects.toThrow('Bad Gateway')
    })

    it('uses fallback message when statusText and text are empty', async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: '',
        headers: {
          get: vi.fn().mockReturnValue(null),
        },
        text: vi.fn().mockResolvedValue(''),
      })
      vi.stubGlobal('fetch', fetchMock)

      await expect(apiFetch('/api/test')).rejects.toThrow(
        'Request to /api/test failed',
      )
    })
  })

  describe('request options', () => {
    it('merges custom headers with default headers', async () => {
      const mockData = { success: true }
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        headers: {
          get: vi.fn().mockReturnValue('application/json'),
        },
        json: vi.fn().mockResolvedValue(mockData),
      })
      vi.stubGlobal('fetch', fetchMock)

      await apiFetch('/api/test', {
        headers: { Authorization: 'Bearer token123' },
      })

      expect(fetchMock).toHaveBeenCalledWith(
        '/api/test',
        expect.objectContaining({
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer token123',
          },
        }),
      )
    })

    it('allows overriding Content-Type header', async () => {
      const mockData = { success: true }
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        headers: {
          get: vi.fn().mockReturnValue('application/json'),
        },
        json: vi.fn().mockResolvedValue(mockData),
      })
      vi.stubGlobal('fetch', fetchMock)

      await apiFetch('/api/test', {
        headers: { 'Content-Type': 'text/plain' },
      })

      expect(fetchMock).toHaveBeenCalledWith(
        '/api/test',
        expect.objectContaining({
          headers: { 'Content-Type': 'text/plain' },
        }),
      )
    })

    it('includes credentials: include by default', async () => {
      const mockData = { success: true }
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        headers: {
          get: vi.fn().mockReturnValue('application/json'),
        },
        json: vi.fn().mockResolvedValue(mockData),
      })
      vi.stubGlobal('fetch', fetchMock)

      await apiFetch('/api/test')

      expect(fetchMock).toHaveBeenCalledWith(
        '/api/test',
        expect.objectContaining({ credentials: 'include' }),
      )
    })

    it('passes through HTTP method and body', async () => {
      const mockData = { success: true, data: { id: 1 } }
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        headers: {
          get: vi.fn().mockReturnValue('application/json'),
        },
        json: vi.fn().mockResolvedValue(mockData),
      })
      vi.stubGlobal('fetch', fetchMock)

      const body = JSON.stringify({ name: 'Test' })
      await apiFetch('/api/test', { method: 'POST', body })

      expect(fetchMock).toHaveBeenCalledWith(
        '/api/test',
        expect.objectContaining({
          method: 'POST',
          body,
          credentials: 'include',
        }),
      )
    })
  })
})
