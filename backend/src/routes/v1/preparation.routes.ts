import { Router } from 'express'

import { preparation } from '../../controllers/candidate.controller.js'

const router = Router()

router.get('/', preparation)

export default router
