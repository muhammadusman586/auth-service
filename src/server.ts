import app from './app.js'
import { Config } from './config/index.js'
import logger from './config/logger.js'

const startServer = () => {
  const PORT = Config.PORT
  try {
    app.listen(PORT, () => {
      logger.warn('testing logger warn')
      logger.error('testing logger error')
      logger.info('Server listening on port', { port: PORT })
    })
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}

startServer()
