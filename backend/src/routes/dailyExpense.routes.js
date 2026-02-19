import { Router } from 'express'
import {
  createDailyExpense,
  getExpensesByDateOrMonth,
  updateDailyExpense,
  deleteDailyExpense,
} from '../controllers/dailyExpense.controller.js'
import { verifyJWT } from '../middlewares/auth.middleware.js'

const router = Router()
router.use(verifyJWT)

router.route('/').post(createDailyExpense)
router.route('/').get(getExpensesByDateOrMonth)
router
  .route('/:dailyExpenseId')
  .patch(updateDailyExpense)
  .delete(deleteDailyExpense)

export default router
