import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import helmet from 'helmet'
import morgan from 'morgan'

import { env } from './config/env.js'
import routes from './routes/index.js'
import { errorHandler } from './middleware/error.middleware.js'

const app = express()

app.use(helmet())

app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
  }),
)

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

if (env.NODE_ENV !== 'test') {
  app.use(morgan('dev'))
}

app.get('/health', (_req, res) => {
  return res.status(200).json({
    success: true,
    message: 'InterviewAI backend is running',
  })
})

app.use(routes)

app.use(errorHandler)


export default app