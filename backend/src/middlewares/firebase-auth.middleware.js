import { ApiError } from '../utils/ApiError.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { getAuth } from '../config/firebase.js'

export const verifyFirebaseToken = asyncHandler(async (req, res, next) => {
  const authHeader = req.header('Authorization')

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new ApiError(401, 'Unauthorized: Missing or invalid token')
  }

  const token = authHeader.replace('Bearer ', '')

  try {
    const auth = getAuth()
    const decodedToken = await auth.verifyIdToken(token)

    if (!decodedToken.email_verified) {
      throw new ApiError(403, 'Forbidden: Email not verified')
    }

    req.firebaseUser = decodedToken
    next()
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    throw new ApiError(401, 'Unauthorized: Invalid token')
  }
})
