import mongoose from 'mongoose'
import { ApiError } from '../utils/ApiError.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { DailyExpense } from '../models/dailyExpenses.model.js'
import { fetchSelectableCategoricalExpenses } from './monthlyCategoricalExpense.controller.js'
import { MonthlyCategoricalExpense } from '../models/monthlyCategoricalExpenses.model.js'

const createDailyExpense = asyncHandler(async (req, res) => {
  const { description, amount, date } = req.body

  // if (
  //   monthlyCategoricalExpenseId &&
  //   mongoose.Types.ObjectId.isValid(monthlyCategoricalExpenseId)
  // ) {
  //   throw new ApiError(400, 'Missing or invalid monthly categorical expense ID')
  // }

  if (!description?.trim()) {
    throw new ApiError(400, 'Description for daily expense is required')
  }

  if (!date) {
    throw new ApiError(400, 'Date for daily expense is required')
  }

  const dailyExpense = await DailyExpense.create({
    userId: req.user._id,
    // monthlyCategoricalExpenseId: monthlyCategoricalExpenseId,
    description: description.trim(),
    amount: amount,
    date: date,
  })

  return res
    .status(201)
    .json(
      new ApiResponse(201, dailyExpense, 'Daily expense created successfully'),
    )
})

const getExpensesByDateOrMonth = asyncHandler(async (req, res) => {
  const { date, month } = req.query
  let startDate, endDate, selectableCategoricalExpenses

  if (date) {
    startDate = new Date(date)
    startDate.setUTCHours(0, 0, 0, 0)

    endDate = new Date(date)
    endDate.setUTCHours(23, 59, 59, 999)

    selectableCategoricalExpenses = await fetchSelectableCategoricalExpenses({
      userId: req.user._id,
      month: new Date(
        Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth(), 1),
      ),
    })
  } else if (month) {
    const [year, mon] = month.split('-')

    if (isNaN(year) || isNaN(mon)) {
      throw new ApiError(400, 'Invalid month format. Use YYYY-MM')
    }

    startDate = new Date(Date.UTC(year, mon - 1, 1, 0, 0, 0, 0))

    endDate = new Date(Date.UTC(year, mon, 0, 23, 59, 59, 999))
  } else {
    throw new ApiError(400, 'Please provide a date or a month')
  }

  const dailyExpenses = await DailyExpense.find({
    userId: req.user._id,
    date: {
      $gte: startDate,
      $lte: endDate,
    },
  })
    .sort({ date: 1 })
    .lean()
    .exec()

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { selectableCategoricalExpenses, dailyExpenses },
        `Daily Expenses for ${startDate.toISOString()} is fetched successfully`,
      ),
    )
})

const updateDailyExpense = asyncHandler(async (req, res) => {
  const { dailyExpenseId } = req.params
  const { monthlyCategoricalExpenseId, description, amount } = req.body

  if (!mongoose.Types.ObjectId.isValid(dailyExpenseId)) {
    throw new ApiError(400, 'Invalid daily expense ID format')
  }

  const dataToUpdate = buildDailyExpenseUpdateData({
    description,
    amount,
    monthlyCategoricalExpenseId,
  })

  if (Object.keys(dataToUpdate).length === 0) {
    throw new ApiError(400, 'At least one field must be provided to update')
  }

  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    const before = await DailyExpense.findOne({
      _id: dailyExpenseId,
      userId: req.user._id,
    })
      .session(session)
      .lean()

    if (!before) {
      throw new ApiError(404, 'Daily expense not found or unauthorized')
    }

    const after = await DailyExpense.findOneAndUpdate(
      { _id: dailyExpenseId, userId: req.user._id },
      { $set: dataToUpdate },
      { new: true, runValidators: true, session },
    ).lean()

    if (!after) {
      throw new ApiError(404, 'Daily expense not found or unauthorized')
    }

    const oldCat = before.monthlyCategoricalExpenseId?.toString() ?? null
    const newCat = after.monthlyCategoricalExpenseId?.toString() ?? null
    const oldAmt = Number(before.amount) || 0
    const newAmt = Number(after.amount) || 0

    if (oldCat === newCat) {
      await adjustSelectableCategoryActualAmount({
        monthlyCategoricalExpenseId: newCat,
        userId: req.user._id,
        delta: newAmt - oldAmt,
        session,
      })
    } else {
      await adjustSelectableCategoryActualAmount({
        monthlyCategoricalExpenseId: oldCat,
        userId: req.user._id,
        delta: -oldAmt,
        session,
      })
      await adjustSelectableCategoryActualAmount({
        monthlyCategoricalExpenseId: newCat,
        userId: req.user._id,
        delta: newAmt,
        session,
      })
    }

    await session.commitTransaction()

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          after,
          'The daily expense is updated successfully',
        ),
      )
  } catch (error) {
    await session.abortTransaction()
    throw error
  } finally {
    session.endSession()
  }
})

function buildDailyExpenseUpdateData({
  description,
  amount,
  monthlyCategoricalExpenseId,
}) {
  const dataToUpdate = {}

  if (description !== undefined && description !== null) {
    const trimmed = description.trim()
    if (trimmed.length > 0) dataToUpdate.description = trimmed
  }

  if (amount !== undefined && amount !== null) {
    dataToUpdate.amount = amount
  }

  if (
    monthlyCategoricalExpenseId === null ||
    mongoose.Types.ObjectId.isValid(monthlyCategoricalExpenseId)
  ) {
    dataToUpdate.monthlyCategoricalExpenseId = monthlyCategoricalExpenseId
  }

  return dataToUpdate
}

const deleteDailyExpense = asyncHandler(async (req, res) => {
  const { dailyExpenseId } = req.params

  if (!mongoose.Types.ObjectId.isValid(dailyExpenseId)) {
    throw new ApiError(400, 'Invalid daily expense ID format')
  }

  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    const existingRecord = await DailyExpense.findOne({
      _id: dailyExpenseId,
      userId: req.user._id,
    })
      .session(session)
      .lean()

    if (!existingRecord) {
      throw new ApiError(
        404,
        'Daily expense not found or you do not have permission to delete it',
      )
    }

    await adjustSelectableCategoryActualAmount({
      monthlyCategoricalExpenseId: existingRecord.monthlyCategoricalExpenseId,
      userId: req.user._id,
      delta: -(Number(existingRecord.amount) || 0),
      session,
    })

    const deletedRecord = await DailyExpense.findOneAndDelete({
      _id: dailyExpenseId,
      userId: req.user._id,
    }).session(session)

    if (!deletedRecord) {
      throw new ApiError(
        404,
        'Daily expense not found or you do not have permission to delete it',
      )
    }

    await session.commitTransaction()

    return res
      .status(200)
      .json(
        new ApiResponse(200, null, 'The daily expense is deleted successfully'),
      )
  } catch (error) {
    await session.abortTransaction()
    throw error
  } finally {
    session.endSession()
  }
})

const deleteCategoryFromDailyExpenses = async ({
  monthlyCategoricalExpenseId,
  userId,
  month,
  session,
}) => {
  const monthStart = new Date(month)

  const monthEnd = new Date(
    Date.UTC(monthStart.getUTCFullYear(), monthStart.getUTCMonth() + 1, 1),
  )

  return await DailyExpense.updateMany(
    {
      // Filter
      monthlyCategoricalExpenseId,
      userId,
      date: {
        $gte: monthStart,
        $lt: monthEnd,
      },
    },
    {
      $set: {
        monthlyCategoricalExpenseId: null,
      },
    },
    {
      session,
    },
  )
}

async function adjustSelectableCategoryActualAmount({
  monthlyCategoricalExpenseId,
  userId,
  delta,
  session,
}) {
  if (!monthlyCategoricalExpenseId) return

  if (!mongoose.Types.ObjectId.isValid(monthlyCategoricalExpenseId)) {
    throw new ApiError(400, 'Invalid monthly categorical expense ID')
  }

  const inc = Number(delta) || 0
  if (inc === 0) return

  // Only sync when selectable === true (read-only actualAmount)
  await MonthlyCategoricalExpense.updateOne(
    { _id: monthlyCategoricalExpenseId, userId, selectable: true },
    { $inc: { actualAmount: inc } },
    { session, runValidators: true },
  )
}

export {
  createDailyExpense,
  getExpensesByDateOrMonth,
  updateDailyExpense,
  deleteDailyExpense,
  deleteCategoryFromDailyExpenses,
}
