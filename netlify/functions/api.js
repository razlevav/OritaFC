import express from 'express'
import serverless from 'serverless-http'
import { createApiRouter } from '../../server/app.js'

const app = express()
app.use(createApiRouter())

export const handler = serverless(app)
