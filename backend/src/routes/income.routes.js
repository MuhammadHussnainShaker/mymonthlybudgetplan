import { Router } from 'express'
import {
  createIncome,
  deleteIncome,
  getIncomes,
  updateIncome,
} from '../controllers/income.controller.js'
import { verifyJWT } from '../middlewares/auth.middleware.js'

const router = Router()
router.use(verifyJWT)

router.route('/').post(createIncome)
router.route('/:month').get(getIncomes)
router.route('/:incomeId').patch(updateIncome).delete(deleteIncome)

export default router
