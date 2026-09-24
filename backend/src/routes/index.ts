import { Router } from 'express'

import authRoutes from './v1/auth.routes.js'
import candidateRoutes from './v1/candidate.routes.js'
import recruiterRoutes from './v1/recruiter.routes.js'
import adminRoutes from './v1/admin.routes.js'

const router = Router()

router.use('/api/v1/auth', authRoutes)
router.use('/api/v1/candidate', candidateRoutes)
router.use('/api/v1/recruiter', recruiterRoutes)
router.use('/api/v1/admin', adminRoutes)

export default router