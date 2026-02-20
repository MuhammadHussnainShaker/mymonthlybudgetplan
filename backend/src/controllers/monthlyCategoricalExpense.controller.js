import mongoose from 'mongoose'
import {
  ApiError,
  ApiResponse,
  asyncHandler,
  validateAndSanitizeInput,
} from '../utils/index.js'
import { MonthlyCategoricalExpense } from '../models/monthlyCategoricalExpenses.model.js'
import { deleteCategoryFromDailyExpenses } from './dailyExpense.controller.js'

const createMonthlyCategoricalExpense = asyncHandler(async (req, res) => {
  const { parentId, description, projectedAmount, actualAmount, month } =
    req.body

  if (!description?.trim()) {
    throw new ApiError(
      400,
      'Description for monthly categorical expense is required',
    )
  }

  if (!month) {
    throw new ApiError(400, 'Month for monthly categorical expense is required')
  }

  if (!parentId || !mongoose.Types.ObjectId.isValid(parentId)) {
    throw new ApiError(400, 'Missing or invalid Parent ID')
  }

  const monthlyCategoricalExpense = await MonthlyCategoricalExpense.create({
    userId: req.user._id,
    parentId: parentId,
    description: description.trim(),
    projectedAmount: projectedAmount ?? 0,
    actualAmount: actualAmount ?? 0,
    month,
  })

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        monthlyCategoricalExpense,
        'Monthly categorical expense created successfully',
      ),
    )
})

const getMonthlyCategoricalExpenses = asyncHandler(async (req, res) => {
  const { month } = req.params

  if (!month) {
    throw new ApiError(
      400,
      'Month is required to get monthly categorical expense records',
    )
  }

  const monthStart = new Date(month)

  const monthEnd = new Date(
    Date.UTC(monthStart.getUTCFullYear(), monthStart.getUTCMonth() + 1, 1),
  )

  const monthlyCategoricalExpenses = await MonthlyCategoricalExpense.find({
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
        monthlyCategoricalExpenses,
        `Monthly categorical expense records for ${monthStart.toISOString().slice(0, 7)} is fetched successfully`,
      ),
    )
})

const updateMonthlyCategoricalExpense = asyncHandler(async (req, res) => {
  const { monthlyCategoricalExpenseId } = req.params
  const { description, projectedAmount, actualAmount } = req.body

  if (!mongoose.Types.ObjectId.isValid(monthlyCategoricalExpenseId)) {
    throw new ApiError(400, 'Invalid monthly categorical expense ID format')
  }

  const existingMonthlyCategoricalExpense =
    await MonthlyCategoricalExpense.findOne({
      _id: monthlyCategoricalExpenseId,
      userId: req.user._id,
    })
      .lean()
      .exec()

  if (!existingMonthlyCategoricalExpense) {
    throw new ApiError(
      404,
      'Monthly categorical expense record not found or unauthorized',
    )
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

  // only allow manual actualAmount update when selectable is false (not auto-managed by daily expenses)
  if (
    existingMonthlyCategoricalExpense?.selectable === false &&
    actualAmount !== undefined &&
    actualAmount !== null
  )
    dataToUpdate.actualAmount = actualAmount

  if (Object.keys(dataToUpdate).length === 0) {
    throw new ApiError(400, 'At least one field must be provided to update')
  }

  const updatedMonthlyCategoricalExpense =
    await MonthlyCategoricalExpense.findOneAndUpdate(
      { _id: monthlyCategoricalExpenseId, userId: req.user._id },
      { $set: dataToUpdate },
      {
        new: true,
        runValidators: true,
      },
    )
      .lean()
      .exec()

  if (!updatedMonthlyCategoricalExpense) {
    throw new ApiError(
      404,
      'Monthly categorical expense record not found or unauthorized',
    )
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedMonthlyCategoricalExpense,
        'The monthly categorical expense record is updated successfully',
      ),
    )
})

const deleteMonthlyCategoricalExpense = asyncHandler(async (req, res) => {
  const { monthlyCategoricalExpenseId } = req.params

  if (!mongoose.Types.ObjectId.isValid(monthlyCategoricalExpenseId)) {
    throw new ApiError(400, 'Invalid monthly categorical expense ID format')
  }

  const deletedRecord = await MonthlyCategoricalExpense.findOneAndDelete({
    _id: monthlyCategoricalExpenseId,
    userId: req.user._id,
  }).exec()

  if (!deletedRecord) {
    throw new ApiError(
      404,
      'Monthly categorical expense record not found or you do not have permission to delete it',
    )
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        null,
        'The monthly categorical expense record is deleted successfully',
      ),
    )
})

const toggleMonthlyCategoricalExpenseSelectable = asyncHandler(
  async (req, res) => {
    const { monthlyCategoricalExpenseId, month } = req.params
    const { selectable } = req.body
    console.log('month', month)

    const validated = validateAndSanitizeInput(
      { monthlyCategoricalExpenseId, month, selectable },
      ['monthlyCategoricalExpenseId', 'month', 'selectable'],
    )

    const session = await mongoose.startSession()
    session.startTransaction()

    try {
      const updatedRecord = await MonthlyCategoricalExpense.findOneAndUpdate(
        { _id: monthlyCategoricalExpenseId, userId: req.user._id },
        { $set: { selectable: validated.selectable, actualAmount: 0 } },
        { new: true, runValidators: true, session },
      ).lean()

      if (!updatedRecord) {
        throw new ApiError(404, 'Record not found or unauthorized')
      }

      let modifiedCount = 0

      if (selectable === false) {
        const updateStats = await deleteCategoryFromDailyExpenses({
          monthlyCategoricalExpenseId,
          userId: req.user._id,
          month,
          session,
        })
        modifiedCount = updateStats.modifiedCount ?? updateStats.nModified ?? 0
      }

      await session.commitTransaction()

      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            { record: updatedRecord, unlinkedCount: modifiedCount },
            'Updated successfully',
          ),
        )
    } catch (error) {
      await session.abortTransaction()
      throw error
    } finally {
      session.endSession()
    }
  },
)

const fetchSelectableCategoricalExpenses = async ({ userId, month }) => {
  if (!month) {
    throw new ApiError(
      400,
      'Month is required to fetch selectable categorical expenses',
    )
  }

  const monthStart = new Date(month)

  const monthEnd = new Date(
    Date.UTC(monthStart.getUTCFullYear(), monthStart.getUTCMonth() + 1, 1),
  )

  const selectableCategoricalExpenses = await MonthlyCategoricalExpense.find({
    userId: userId,
    month: {
      $gte: monthStart,
      $lt: monthEnd,
    },
    selectable: true,
  })
    .select('description')
    .sort({ month: 1 })
    .lean()

  return selectableCategoricalExpenses
}

export {
  createMonthlyCategoricalExpense,
  getMonthlyCategoricalExpenses,
  updateMonthlyCategoricalExpense,
  deleteMonthlyCategoricalExpense,
  toggleMonthlyCategoricalExpenseSelectable,
  fetchSelectableCategoricalExpenses,
}
