import { Router } from 'express'

import { listInterviews, getInterview, start } from '../../controllers/interview.controller.js'

const router = Router()

router.get('/', listInterviews)
router.get('/:interviewId', getInterview)
router.post('/:interviewId/start', start)

export default router
