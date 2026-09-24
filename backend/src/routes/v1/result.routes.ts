import { Router } from 'express'

import { listResults, getResultDetail } from '../../controllers/candidate.controller.js'

const router = Router()

router.get('/', listResults)
router.get('/:interviewId', getResultDetail)

export default router
