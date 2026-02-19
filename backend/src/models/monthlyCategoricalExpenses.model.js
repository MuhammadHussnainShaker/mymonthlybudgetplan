import mongoose from 'mongoose'

const monthlyCategoricalExpenseSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ParentCategory',
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    projectedAmount: {
      type: Number,
    },
    actualAmount: {
      type: Number,
    },
    month: {
      // store as first day of month (e.g. new Date(Date.UTC(year, monthIndex, 1)))
      type: Date,
      required: true,
    },
    selectable: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
)

monthlyCategoricalExpenseSchema.index({ userId: 1, month: 1 })

export const MonthlyCategoricalExpense = mongoose.model(
  'MonthlyCategoricalExpense',
  monthlyCategoricalExpenseSchema,
)
