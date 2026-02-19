import mongoose from 'mongoose'
import { ApiError } from './ApiError.js'

export default function validateAndSanitizeInput(
  input = {},
  requiredFields = [],
) {
  const { monthlyCategoricalExpenseId, selectable, month } = input

  // 1. Check for missing required fields
  for (const field of requiredFields) {
    if (input[field] === undefined || input[field] === null) {
      throw new ApiError(400, `${field} is required`)
    }
  }

  const validatedData = {}

  // 2. Validate MongoDB ObjectId (if present)
  if (monthlyCategoricalExpenseId != null) {
    if (!mongoose.Types.ObjectId.isValid(monthlyCategoricalExpenseId)) {
      throw new ApiError(400, 'Invalid monthly categorical expense ID format')
    }
    validatedData.monthlyCategoricalExpenseId = monthlyCategoricalExpenseId
  }

  // 3. Validate Boolean (if present)
  if (selectable != null) {
    if (typeof selectable !== 'boolean') {
      throw new ApiError(400, 'selectable must be a Boolean')
    }
    validatedData.selectable = selectable
  }

  // 4. Validate Date ISO String (if present)
  if (month != null) {
    const d = new Date(month)
    if (Number.isNaN(d.getTime()) || d.toISOString() !== month) {
      throw new ApiError(400, 'Use ISO format (e.g., 2026-01-01T00:00:00.000Z)')
    }
    validatedData.month = month
  }

  return validatedData
}
