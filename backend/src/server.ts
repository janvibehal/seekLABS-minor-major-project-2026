import app from './app.js'
import { env } from './config/env.js'
import { startSessionExpirationWorker } from './workers/session-expiration.worker.js'

const server = app.listen(env.PORT, () => {
  console.log(
    `InterviewAI backend running on http://localhost:${env.PORT}`,
  )
})

const stopSessionExpirationWorker = startSessionExpirationWorker()

const shutdown = () => {
  stopSessionExpirationWorker()
  server.close(() => process.exit(0))
}

process.once('SIGINT', shutdown)
process.once('SIGTERM', shutdown)