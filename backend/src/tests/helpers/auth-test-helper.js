import jwt from 'jsonwebtoken'
import { User } from '../../models/user.model.js'

/**
 * Create a test user directly in the database
 * Returns the user object and a JWT token for authentication
 */
export const createTestUserWithToken = async (userData = {}) => {
  const defaultData = {
    firebaseUid: `test-firebase-uid-${Date.now()}-${Math.random()}`,
    email: `testuser${Date.now()}${Math.random()}@example.com`,
    displayName: 'Test User',
    ...userData,
  }

  const user = await User.create(defaultData)
  
  // Generate JWT token for the user (same as what was done in phone auth)
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'test-secret', {
    expiresIn: '350d',
  })

  return { user, token, userId: user._id.toString() }
}

