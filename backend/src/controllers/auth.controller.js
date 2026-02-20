import { User } from '../models/user.model.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import jwt from 'jsonwebtoken'

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
}

export const bootstrap = asyncHandler(async (req, res) => {
  const { uid, email, name } = req.firebaseUser

  let user = await User.findOne({ firebaseUid: uid })

  if (user) {
    if (user.email !== email) {
      user.email = email
      await user.save()
    }
  } else {
    user = await User.create({
      firebaseUid: uid,
      email: email,
      displayName: name || email.split('@')[0],
    })
  }

  const token = jwt.sign(
    { userId: user._id, firebaseUid: uid },
    process.env.JWT_SECRET,
    {
      expiresIn: '30d',
    },
  )

  return res
    .status(200)
    .cookie('accessToken', token, cookieOptions)
    .json(
      new ApiResponse(200, { user, token }, 'User bootstrapped successfully'),
    )
})

export const logout = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .clearCookie('accessToken', cookieOptions)
    .json(new ApiResponse(200, null, 'Logged out successfully'))
})
