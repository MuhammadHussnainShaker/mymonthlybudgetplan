import { describe, it, expect } from 'vitest'
import { createTestUserWithToken } from './helpers/auth-test-helper.js'
import { User } from '../models/user.model.js'

describe('Test Helper Integration Tests', () => {
  describe('createTestUserWithToken - Database Integration', () => {
    it('should persist user in database', async () => {
      const result = await createTestUserWithToken({
        displayName: 'Persistent Test User',
      })

      // Verify user exists in database
      const dbUser = await User.findById(result.userId)
      expect(dbUser).toBeDefined()
      expect(dbUser.firebaseUid).toBe(result.user.firebaseUid)
      expect(dbUser.email).toBe(result.user.email)
      expect(dbUser.displayName).toBe('Persistent Test User')
    })

    it('should create users with unique firebaseUid', async () => {
      const user1 = await createTestUserWithToken()
      const user2 = await createTestUserWithToken()

      const count = await User.countDocuments({
        firebaseUid: { $in: [user1.user.firebaseUid, user2.user.firebaseUid] },
      })

      expect(count).toBe(2)
    })

    it('should generate tokens that contain userId', async () => {
      const result = await createTestUserWithToken({
        displayName: 'Token Test User',
      })

      // Decode JWT token (without verification for testing)
      const tokenParts = result.token.split('.')
      const payload = JSON.parse(
        Buffer.from(tokenParts[1], 'base64').toString(),
      )

      expect(payload.userId).toBe(result.userId)
    })

    it('should handle concurrent user creation', async () => {
      const promises = Array.from({ length: 5 }, (_, i) =>
        createTestUserWithToken({
          displayName: `Concurrent User ${i}`,
        }),
      )

      const results = await Promise.all(promises)

      // All should succeed
      expect(results).toHaveLength(5)

      // All should have unique firebaseUids
      const firebaseUids = results.map((r) => r.user.firebaseUid)
      const uniqueFirebaseUids = new Set(firebaseUids)
      expect(uniqueFirebaseUids.size).toBe(5)

      // All should have unique emails
      const emails = results.map((r) => r.user.email)
      const uniqueEmails = new Set(emails)
      expect(uniqueEmails.size).toBe(5)
    })
  })

  describe('User Model - Firebase UID Format', () => {
    it('should accept various firebaseUid formats', async () => {
      const formats = [
        'abc123',
        'firebase-uid-with-hyphens',
        'uid_with_underscores',
        'UID123CAPS',
        '1234567890',
        'very-long-firebase-uid-string-that-represents-a-real-firebase-user-id',
      ]

      for (const uid of formats) {
        const user = await User.create({
          firebaseUid: uid,
          email: `test-${uid}@example.com`,
          displayName: 'Test User',
        })

        expect(user.firebaseUid).toBe(uid)
      }
    })

    it('should accept various email formats', async () => {
      const emails = [
        'simple@example.com',
        'with.dot@example.com',
        'with+plus@example.com',
        'with-dash@example.com',
        'numbers123@example.com',
        'subdomain@mail.example.com',
      ]

      for (let i = 0; i < emails.length; i++) {
        const user = await User.create({
          firebaseUid: `uid-${i}`,
          email: emails[i],
          displayName: 'Test User',
        })

        expect(user.email).toBe(emails[i].toLowerCase())
      }
    })
  })

  describe('User Timestamps', () => {
    it('should automatically add createdAt and updatedAt', async () => {
      const result = await createTestUserWithToken({
        displayName: 'Timestamp Test User',
      })

      expect(result.user.createdAt).toBeDefined()
      expect(result.user.updatedAt).toBeDefined()
      expect(result.user.createdAt).toBeInstanceOf(Date)
      expect(result.user.updatedAt).toBeInstanceOf(Date)
    })

    it('should update updatedAt on user modification', async () => {
      const result = await createTestUserWithToken({
        displayName: 'Update Test User',
      })

      const originalUpdatedAt = result.user.updatedAt

      // Wait a bit to ensure timestamp difference
      await new Promise((resolve) => setTimeout(resolve, 10))

      // Update user
      const user = await User.findById(result.userId)
      user.displayName = 'Modified Name'
      await user.save()

      expect(user.updatedAt.getTime()).toBeGreaterThan(
        originalUpdatedAt.getTime(),
      )
    })
  })

  describe('User isActive Field', () => {
    it('should default isActive to true', async () => {
      const user = await User.create({
        firebaseUid: 'active-test-uid',
        email: 'active@example.com',
        displayName: 'Active User',
      })

      expect(user.isActive).toBe(true)
    })

    it('should allow setting isActive to false', async () => {
      const user = await User.create({
        firebaseUid: 'inactive-test-uid',
        email: 'inactive@example.com',
        displayName: 'Inactive User',
        isActive: false,
      })

      expect(user.isActive).toBe(false)
    })

    it('should allow toggling isActive status', async () => {
      const result = await createTestUserWithToken({
        displayName: 'Toggle Test User',
      })

      const user = await User.findById(result.userId)
      expect(user.isActive).toBe(true)

      user.isActive = false
      await user.save()

      const updatedUser = await User.findById(result.userId)
      expect(updatedUser.isActive).toBe(false)
    })
  })

  describe('User Query Operations', () => {
    it('should find user by firebaseUid', async () => {
      const result = await createTestUserWithToken({
        displayName: 'Find by UID User',
      })

      const foundUser = await User.findOne({
        firebaseUid: result.user.firebaseUid,
      })

      expect(foundUser).toBeDefined()
      expect(foundUser._id.toString()).toBe(result.userId)
    })

    it('should find user by email', async () => {
      const result = await createTestUserWithToken({
        displayName: 'Find by Email User',
      })

      const foundUser = await User.findOne({ email: result.user.email })

      expect(foundUser).toBeDefined()
      expect(foundUser._id.toString()).toBe(result.userId)
    })

    it('should find user by email case-insensitively', async () => {
      const result = await createTestUserWithToken({
        email: 'test@example.com',
        displayName: 'Case Test User',
      })

      const foundUser = await User.findOne({ email: 'TEST@EXAMPLE.COM' })

      expect(foundUser).toBeDefined()
      expect(foundUser._id.toString()).toBe(result.userId)
    })

    it('should find active users only', async () => {
      await createTestUserWithToken({ displayName: 'Active User 1' })
      await createTestUserWithToken({ displayName: 'Active User 2' })
      
      const inactiveUser = await User.create({
        firebaseUid: 'inactive-uid',
        email: 'inactive@example.com',
        displayName: 'Inactive User',
        isActive: false,
      })

      const activeUsers = await User.find({ isActive: true })
      const inactiveUsers = await User.find({ isActive: false })

      expect(activeUsers.length).toBeGreaterThanOrEqual(2)
      expect(inactiveUsers.length).toBeGreaterThanOrEqual(1)
      expect(inactiveUsers[0]._id.toString()).toBe(inactiveUser._id.toString())
    })
  })

  describe('User Deletion', () => {
    it('should allow deleting user', async () => {
      const result = await createTestUserWithToken({
        displayName: 'Delete Test User',
      })

      await User.findByIdAndDelete(result.userId)

      const deletedUser = await User.findById(result.userId)
      expect(deletedUser).toBeNull()
    })

    it('should allow deleting user by firebaseUid', async () => {
      const result = await createTestUserWithToken({
        displayName: 'Delete by UID User',
      })

      await User.deleteOne({ firebaseUid: result.user.firebaseUid })

      const deletedUser = await User.findOne({
        firebaseUid: result.user.firebaseUid,
      })
      expect(deletedUser).toBeNull()
    })
  })

  describe('User Update Operations', () => {
    it('should allow updating displayName', async () => {
      const result = await createTestUserWithToken({
        displayName: 'Original Name',
      })

      await User.findByIdAndUpdate(result.userId, {
        displayName: 'Updated Name',
      })

      const updatedUser = await User.findById(result.userId)
      expect(updatedUser.displayName).toBe('Updated Name')
    })

    it('should allow updating email', async () => {
      const result = await createTestUserWithToken({
        email: 'original@example.com',
        displayName: 'Email Update User',
      })

      await User.findByIdAndUpdate(result.userId, {
        email: 'updated@example.com',
      })

      const updatedUser = await User.findById(result.userId)
      expect(updatedUser.email).toBe('updated@example.com')
    })

    it('should not allow updating to duplicate email', async () => {
      const user1 = await createTestUserWithToken({
        email: 'user1@example.com',
        displayName: 'User 1',
      })
      
      const user2 = await createTestUserWithToken({
        email: 'user2@example.com',
        displayName: 'User 2',
      })

      try {
        await User.findByIdAndUpdate(
          user2.userId,
          { email: 'user1@example.com' },
          { runValidators: true },
        )
        expect.fail('Should have thrown duplicate key error')
      } catch (error) {
        expect(error.code).toBe(11000)
      }
    })

    it('should not allow updating to duplicate firebaseUid', async () => {
      const user1 = await createTestUserWithToken({
        firebaseUid: 'uid-1',
        email: 'user1@example.com',
        displayName: 'User 1',
      })
      
      const user2 = await createTestUserWithToken({
        firebaseUid: 'uid-2',
        email: 'user2@example.com',
        displayName: 'User 2',
      })

      try {
        await User.findByIdAndUpdate(
          user2.userId,
          { firebaseUid: 'uid-1' },
          { runValidators: true },
        )
        expect.fail('Should have thrown duplicate key error')
      } catch (error) {
        expect(error.code).toBe(11000)
      }
    })
  })
})
