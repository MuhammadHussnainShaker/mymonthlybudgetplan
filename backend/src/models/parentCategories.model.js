import mongoose from 'mongoose'

const parentCategorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    month: {
      // store as first day of month (e.g. new Date(Date.UTC(year, monthIndex, 1)))
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  },
)

parentCategorySchema.index({ userId: 1, month: 1 })

export const ParentCategory = mongoose.model(
  'ParentCategory',
  parentCategorySchema,
)
