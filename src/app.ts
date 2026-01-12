import express, {
  type NextFunction,
  type Request,
  type Response,
} from 'express'
import type { HttpError } from 'http-errors'
import logger from './config/logger.js'

const app = express()

// app.get('/', async(req, res, next) => {
//   const error = createHttpError(401, 'You can not access this route');
//   next (error);
//   // res.send('Welcome to auth service')
// })

app.get('/', (req, res) => {
  res.send('Welcome to auth service')
})

// global error handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
  logger.error(err.message)
  const statusCode = err.statusCode || 500

  res.status(statusCode).json({
    error: [
      {
        type: err.name,
        msg: err.message,
        path: '',
        location: '',
      },
    ],
  })
})

export default app
