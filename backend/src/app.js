import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

const app = express()

app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }))
app.use(express.json({ limit: '16kb' }))
app.use(express.urlencoded({ extended: true, limit: '16kb' }))
app.use(cookieParser())

// routes import
import authRouter from './routes/auth.routes.js'
import userRouter from './routes/user.routes.js'
import incomeRouter from './routes/income.routes.js'
import savingRouter from './routes/saving.routes.js'
import parentCategoryRouter from './routes/parentCategory.routes.js'
import monthlyCategoricalExpenseRouter from './routes/monthlyCategoricalExpense.routes.js'
import dailyExpenseRouter from './routes/dailyExpense.routes.js'
import errorHandler from './middlewares/errorhandler.js'

// routes declaration
app.use('/api/v1/auth', authRouter)
app.use('/api/v1/users', userRouter)
app.use('/api/v1/incomes', incomeRouter)
app.use('/api/v1/savings', savingRouter)
app.use('/api/v1/parent-categories', parentCategoryRouter)
app.use('/api/v1/monthly-categorical-expenses', monthlyCategoricalExpenseRouter)
app.use('/api/v1/daily-expense', dailyExpenseRouter)

const testArray = [
  { id: 1, name: 'Item 1' },
  { id: 2, name: 'Item 2' },
]

app.get('/test', (req, res) => {
  console.log(`HomeBudgeting API hit at: ${new Date().toLocaleTimeString()}`)
  res.json(testArray)
})

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Not Found' })
})
app.use(errorHandler)

export { app }
