import mongoose from 'mongoose'

const dailyExpenseSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    monthlyCategoricalExpenseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MonthlyCategoricalExpense',
      default: null,
    },
    description: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount cannot be negative. You entered: {VALUE}'],
      default: 0,
    },
    date: {
      // exact day/time of expense — store as JS Date (normalize to UTC when creating)
      type: Date,
      required: true,
    },
  },
  { timestamps: true },
)

dailyExpenseSchema.index({ userId: 1, monthlyCategoricalExpenseId: 1, date: 1 })

export const DailyExpense = mongoose.model('DailyExpense', dailyExpenseSchema)
