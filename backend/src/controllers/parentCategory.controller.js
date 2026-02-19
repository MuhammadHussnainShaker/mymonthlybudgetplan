import mongoose from 'mongoose'
import { ApiError } from '../utils/ApiError.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { ParentCategory } from '../models/parentCategories.model.js'
import { MonthlyCategoricalExpense } from '../models/monthlyCategoricalExpenses.model.js'

const createParentCategory = asyncHandler(async (req, res) => {
  const { description, month } = req.body

  if (!description?.trim()) {
    throw new ApiError(
      400,
      'Description for parent category record is required',
    )
  }

  if (!month) {
    throw new ApiError(400, 'Month for parent category record is required')
  }

  const parentCategory = await ParentCategory.create({
    userId: req.user._id,
    description: description.trim(),
    month: month,
  })

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        parentCategory,
        'Parent Category created successfully',
      ),
    )
})

const getParentCategories = asyncHandler(async (req, res) => {
  const { month } = req.params

  if (!month) {
    throw new ApiError(400, 'Month is required to get Parent Categories')
  }

  const monthStart = new Date(month)

  const monthEnd = new Date(
    Date.UTC(monthStart.getUTCFullYear(), monthStart.getUTCMonth() + 1, 1),
  )

  const parentCategories = await ParentCategory.find({
    userId: req.user._id,
    month: {
      $gte: monthStart,
      $lt: monthEnd,
    },
  })
    .sort({ month: 1 })
    .lean() // Returns plain JS objects instead of heavy Mongoose documents for better speed and memory.
    .exec() //Returns a proper Promise for better error tracking and consistent async/await behavior.

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        parentCategories,
        `Parent Categories for ${monthStart.toISOString().slice(0, 7)} is fetched successfully`,
      ),
    )
})

const updateParentCategory = asyncHandler(async (req, res) => {
  const { parentCategoryId } = req.params
  const { description } = req.body

  if (!mongoose.Types.ObjectId.isValid(parentCategoryId)) {
    throw new ApiError(400, 'Invalid parent category ID format')
  }

  const dataToUpdate = {}
  if (description !== undefined && description !== null) {
    const trimmed = description.trim()
    if (trimmed.length > 0) {
      dataToUpdate.description = trimmed
    }
  }

  if (Object.keys(dataToUpdate).length === 0) {
    throw new ApiError(400, 'At least one field must be provided to update')
  }

  const updatedParentCategory = await ParentCategory.findOneAndUpdate(
    { _id: parentCategoryId, userId: req.user._id },
    { $set: dataToUpdate },
    {
      new: true,
      runValidators: true,
    },
  )
    .lean()
    .exec()

  if (!updatedParentCategory) {
    throw new ApiError(404, 'Parent category not found or unauthorized')
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedParentCategory,
        'The parent category is updated successfully',
      ),
    )
})

const deleteParentCategory = asyncHandler(async (req, res) => {
  const { parentCategoryId } = req.params

  if (!mongoose.Types.ObjectId.isValid(parentCategoryId)) {
    throw new ApiError(400, 'Invalid parent category ID format')
  }

  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    const deletedParentCategory = await ParentCategory.findOneAndDelete({
      _id: parentCategoryId,
      userId: req.user._id,
    })
      .session(session)
      .exec()

    if (!deletedParentCategory) {
      throw new ApiError(
        404,
        'Parent category not found or you do not have permission to delete it',
      )
    }

    await MonthlyCategoricalExpense.deleteMany({
      parentId: parentCategoryId,
      userId: req.user._id,
    })
      .session(session)
      .exec()

    await session.commitTransaction()

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          null,
          'The parent category record is deleted successfully',
        ),
      )
  } catch (error) {
    await session.abortTransaction()
    throw error
  } finally {
    session.endSession()
  }
})

export {
  createParentCategory,
  getParentCategories,
  updateParentCategory,
  deleteParentCategory,
}
