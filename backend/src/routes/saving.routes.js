import { Router } from 'express'
import {
  createSaving,
  getSavings,
  updateSaving,
  deleteSaving,
} from '../controllers/saving.controller.js'
import { verifyJWT } from '../middlewares/auth.middleware.js'

const router = Router()
router.use(verifyJWT)

router.route('/').post(createSaving)
router.route('/:month').get(getSavings)
router.route('/:savingId').patch(updateSaving).delete(deleteSaving)

export default router
