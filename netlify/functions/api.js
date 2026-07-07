import express from 'express'
import serverless from 'serverless-http'
import { createApiRouter } from '../../server/app.js'

const app = express()
const router = createApiRouter()

// Netlify's redirect rewrite can hand the function either the full original
// path, the function-relative path, or the stripped remainder - depending on
// version/config. Mount the same router at every plausible prefix so whichever
// shape arrives, it matches.
app.use('/api', router)
app.use('/.netlify/functions/api', router)
app.use(router)

export const handler = serverless(app)
