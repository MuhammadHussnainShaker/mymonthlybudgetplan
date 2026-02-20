import { Router } from 'express'
import { verifyFirebaseToken } from '../middlewares/firebase-auth.middleware.js'
import { bootstrap, logout } from '../controllers/auth.controller.js'

const router = Router()

router.route('/bootstrap').post(verifyFirebaseToken, bootstrap)
router.route('/logout').post(logout)

export default router
