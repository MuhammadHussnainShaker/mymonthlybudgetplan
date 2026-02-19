import { Router } from 'express'
import { verifyFirebaseToken } from '../middlewares/firebase-auth.middleware.js'
import { bootstrap } from '../controllers/auth.controller.js'

const router = Router()

router.route('/bootstrap').post(verifyFirebaseToken, bootstrap)

export default router
