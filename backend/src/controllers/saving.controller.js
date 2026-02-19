import mongoose from 'mongoose'
import { ApiError } from '../utils/ApiError.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { Saving } from '../models/savings.model.js'

const createSaving = asyncHandler(async (req, res) => {
  const { description, projectedAmount, actualAmount, month } = req.body

  if (!description?.trim()) {
    throw new ApiError(400, 'Description for income record is required')
  }

  if (!month) {
    throw new ApiError(400, 'Month for income record is required')
  }

  const savingRecord = await Saving.create({
    userId: req.user._id,
    description: description.trim(),
    projectedAmount: projectedAmount ?? 0,
    actualAmount: actualAmount ?? 0,
    month,
  })

  return res
    .status(201)
    .json(
      new ApiResponse(201, savingRecord, 'Saving record created successfully'),
    )
})

const getSavings = asyncHandler(async (req, res) => {
  const { month } = req.params

  if (!month) {
    throw new ApiError(400, 'Month is required to get income records')
  }

  const monthStart = new Date(month)

  const monthEnd = new Date(
    Date.UTC(monthStart.getUTCFullYear(), monthStart.getUTCMonth() + 1, 1),
  )

  const savings = await Saving.find({
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
        savings,
        `Savings for ${monthStart.toISOString().slice(0, 7)} is fetched successfully`,
      ),
    )
})

const updateSaving = asyncHandler(async (req, res) => {
  const { savingId } = req.params
  const { description, projectedAmount, actualAmount } = req.body

  if (!mongoose.Types.ObjectId.isValid(savingId)) {
    throw new ApiError(400, 'Invalid Saving ID format')
  }

  const dataToUpdate = {}
  if (description !== undefined && description !== null) {
    const trimmed = description.trim()
    if (trimmed.length > 0) {
      dataToUpdate.description = trimmed
    }
  }
  if (projectedAmount !== undefined && projectedAmount !== null)
    dataToUpdate.projectedAmount = projectedAmount
  if (actualAmount !== undefined && actualAmount !== null)
    dataToUpdate.actualAmount = actualAmount

  if (Object.keys(dataToUpdate).length === 0) {
    throw new ApiError(400, 'At least one field must be provided to update')
  }

  const updatedSavingRecord = await Saving.findOneAndUpdate(
    { _id: savingId, userId: req.user._id },
    { $set: dataToUpdate },
    {
      new: true,
      runValidators: true,
    },
  )
    .lean()
    .exec()

  if (!updatedSavingRecord) {
    throw new ApiError(404, 'Saving record not found or unauthorized')
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedSavingRecord,
        'The saving record is updated successfully',
      ),
    )
})

const deleteSaving = asyncHandler(async (req, res) => {
  const { savingId } = req.params

  if (!mongoose.Types.ObjectId.isValid(savingId)) {
    throw new ApiError(400, 'Invalid Saving ID format')
  }

  const deletedRecord = await Saving.findOneAndDelete({
    _id: savingId,
    userId: req.user._id,
  }).exec()

  if (!deletedRecord) {
    throw new ApiError(
      404,
      'Saving record not found or you do not have permission to delete it',
    )
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, null, 'The saving record is deleted successfully'),
    )
})

export { createSaving, getSavings, updateSaving, deleteSaving }
