import { auth } from '@/services/firebase/firebaseClient'

const defaultHeaders = { 'Content-Type': 'application/json' }

function buildFetchOptions(options = {}) {
  return {
    credentials: 'include',
    ...options,
    headers: { ...defaultHeaders, ...(options.headers ?? {}) },
  }
}

function buildFallbackMessage(url) {
  return `Request to ${url} failed`
}

function getContentType(response) {
  return response.headers.get('content-type') || ''
}

function htmlErrorParser(textRes) {
  const parser = new DOMParser()
  const doc = parser.parseFromString(textRes, 'text/html')
  const preTag = doc.querySelector('pre')
  return preTag ? preTag.textContent : 'An unexpected server error occurred.'
}

async function parseErrorMessage(response, contentType, fallback) {
  const text = await response.text()
  if (contentType.includes('text/html')) {
    return htmlErrorParser(text)
  }

  let message = response.statusText || fallback || 'Request failed'
  if (!text) return message

  try {
    const errJson = JSON.parse(text)
    return errJson?.message ?? errJson?.error ?? message
  } catch {
    return text || message
  }
}

async function handleResponse(response, url) {
  const contentType = getContentType(response)

  if (!response.ok) {
    const message = await parseErrorMessage(
      response,
      contentType,
      buildFallbackMessage(url),
    )
    throw new Error(message)
  }

  if (contentType.includes('application/json')) {
    const data = await response.json()
    if (data?.success === false) {
      throw new Error(data?.message || data?.error || buildFallbackMessage(url))
    }
    return data
  }

  return await response.text()
}

async function doFetch(url, options = {}) {
  const opts = buildFetchOptions(options)
  const response = await fetch(url, opts)
  return handleResponse(response, url)
}

function attachAuthHeader(options = {}, token) {
  return {
    credentials: 'include',
    ...options,
    headers: {
      ...(options.headers ?? {}),
      Authorization: `Bearer ${token}`,
    },
  }
}

export async function apiFetch(url, options = {}) {
  return doFetch(url, options)
}

export async function apiAuthFetch(url, options = {}) {
  const currentUser = auth.currentUser
  if (!currentUser) {
    throw new Error('No authenticated user found')
  }

  const idToken = await currentUser.getIdToken()
  const authOptions = attachAuthHeader(options, idToken)
  return doFetch(url, authOptions)
}
