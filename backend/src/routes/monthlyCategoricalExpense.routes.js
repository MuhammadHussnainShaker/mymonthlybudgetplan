import { Router } from 'express'
import {
  createMonthlyCategoricalExpense,
  toggleMonthlyCategoricalExpenseSelectable,
  getMonthlyCategoricalExpenses,
  updateMonthlyCategoricalExpense,
  deleteMonthlyCategoricalExpense,
} from '../controllers/monthlyCategoricalExpense.controller.js'
import { verifyJWT } from '../middlewares/auth.middleware.js'

const router = Router()
router.use(verifyJWT)

router.route('/').post(createMonthlyCategoricalExpense)
router
  .route('/:monthlyCategoricalExpenseId/toggle-selectable/:month')
  .patch(toggleMonthlyCategoricalExpenseSelectable)
router.route('/:month').get(getMonthlyCategoricalExpenses)
router
  .route('/:monthlyCategoricalExpenseId')
  .patch(updateMonthlyCategoricalExpense)
router
  .route('/:monthlyCategoricalExpenseId')
  .delete(deleteMonthlyCategoricalExpense)

export default router
