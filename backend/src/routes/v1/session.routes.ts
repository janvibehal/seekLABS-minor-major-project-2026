import { Router } from 'express'

import {
  getSession,
  getMessages,
  sendMessage,
  end,
} from '../../controllers/session.controller.js'

const router = Router()

router.get('/:sessionId', getSession)
router.get('/:sessionId/messages', getMessages)
router.post('/:sessionId/messages', sendMessage)
router.post('/:sessionId/end', end)

export default router
