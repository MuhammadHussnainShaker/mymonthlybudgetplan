import { ApiError } from '../utils/ApiError.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import jwt from 'jsonwebtoken'
import { User } from '../models/user.model.js'

export const verifyJWT = asyncHandler(async (req, res, next) => {
  const token =
    req.cookies?.token ||
    req.cookies?.accessToken ||
    req.header('Authorization')?.replace('Bearer ', '')

  if (!token) throw new ApiError(401, 'Unauthorized request')

  let decodedToken
  try {
    decodedToken = jwt.verify(token, process.env.JWT_SECRET)
  } catch (err) {
    throw new ApiError(401, 'Invalid access token')
  }

  const userId = decodedToken?.userId || decodedToken?._id
  const user = await User.findById(userId).select('-__v')

  if (!user) throw new ApiError(401, 'Invalid access token')

  req.user = user
  next()
})
