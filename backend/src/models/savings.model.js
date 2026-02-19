import mongoose from 'mongoose'

const savingSchema = new mongoose.Schema(
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
  },
  {
    timestamps: true,
  },
)

savingSchema.index({ userId: 1, month: 1 })

export const Saving = mongoose.model('Saving', savingSchema)
