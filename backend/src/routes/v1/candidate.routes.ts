import { Router } from 'express'
import { authenticate } from '../../middleware/auth.middleware.js'
import { requireRole } from '../../middleware/rbac.middleware.js'

import { dashboard } from '../../controllers/candidate.controller.js'

import interviewRoutes from './interview.routes.js'
import sessionRoutes from './session.routes.js'
import resultRoutes from './result.routes.js'
import preparationRoutes from './preparation.routes.js'

const router = Router()

// Every candidate route requires a valid access token and the CANDIDATE role.
router.use(authenticate, requireRole('CANDIDATE'))

router.get('/dashboard', dashboard)

router.use('/interviews', interviewRoutes)
router.use('/interview-sessions', sessionRoutes)
router.use('/results', resultRoutes)
router.use('/preparation', preparationRoutes)

export default router
