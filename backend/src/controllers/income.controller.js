import mongoose from 'mongoose'
import { Income } from '../models/incomes.model.js'
import { ApiError } from '../utils/ApiError.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import { asyncHandler } from '../utils/asyncHandler.js'

const createIncome = asyncHandler(async (req, res) => {
  const { description, projectedAmount, actualAmount, month } = req.body

  if (!description?.trim()) {
    throw new ApiError(400, 'Description for income record is required')
  }

  if (!month) {
    throw new ApiError(400, 'Month for income record is required')
  }

  const income = await Income.create({
    userId: req.user._id,
    description: description.trim(),
    projectedAmount: projectedAmount ?? 0,
    actualAmount: actualAmount ?? 0,
    month,
  })

  return res
    .status(201)
    .json(new ApiResponse(201, income, 'Income record created successfully'))
})

const getIncomes = asyncHandler(async (req, res) => {
  const { month } = req.params

  if (!month) {
    throw new ApiError(400, 'Month is required to get income records')
  }

  const monthStart = new Date(month)

  const monthEnd = new Date(
    Date.UTC(monthStart.getUTCFullYear(), monthStart.getUTCMonth() + 1, 1),
  )

  const incomes = await Income.find({
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
        incomes,
        `Incomes for ${monthStart.toISOString().slice(0, 7)} is fetched successfully`,
      ),
    )
})

const updateIncome = asyncHandler(async (req, res) => {
  const { incomeId } = req.params
  const { description, projectedAmount, actualAmount } = req.body

  if (!mongoose.Types.ObjectId.isValid(incomeId)) {
    throw new ApiError(400, 'Invalid Income ID format')
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

  const updatedIncomeRecord = await Income.findOneAndUpdate(
    { _id: incomeId, userId: req.user._id },
    { $set: dataToUpdate },
    {
      new: true,
      runValidators: true,
    },
  )
    .lean()
    .exec()

  if (!updatedIncomeRecord) {
    throw new ApiError(404, 'Income record not found or unauthorized')
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedIncomeRecord,
        'The income record is updated successfully',
      ),
    )
})

const deleteIncome = asyncHandler(async (req, res) => {
  const { incomeId } = req.params

  if (!mongoose.Types.ObjectId.isValid(incomeId)) {
    throw new ApiError(400, 'Invalid Income ID format')
  }

  const deletedRecord = await Income.findOneAndDelete({
    _id: incomeId,
    userId: req.user._id,
  }).exec()

  if (!deletedRecord) {
    throw new ApiError(
      404,
      'Income record not found or you do not have permission to delete it',
    )
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, null, 'The income record is deleted successfully'),
    )
})

export { createIncome, updateIncome, getIncomes, deleteIncome }
