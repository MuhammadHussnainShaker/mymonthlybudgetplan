import { Router } from 'express'
import {
  createParentCategory,
  getParentCategories,
  updateParentCategory,
  deleteParentCategory,
} from '../controllers/parentCategory.controller.js'
import { verifyJWT } from '../middlewares/auth.middleware.js'

const router = Router()
router.use(verifyJWT)

router.route('/').post(createParentCategory)
router.route('/:month').get(getParentCategories)
router
  .route('/:parentCategoryId')
  .patch(updateParentCategory)
  .delete(deleteParentCategory)

export default router
