import express from 'express'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createApiRouter } from './app.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()

app.use('/api', createApiRouter())

// בפרודקשן השרת הזה גם מגיש את קובצי ה-build של React (תהליך אחד, פורט אחד).
// רלוונטי לפריסה עצמאית (כמו Railway/Render) - לא נדרש בפריסת Netlify (שם ה-build מוגש בנפרד).
if (process.env.NODE_ENV === 'production') {
  const distDir = path.join(__dirname, '..', 'dist')
  app.use(express.static(distDir))
  app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(distDir, 'index.html'))
  })
}

const PORT = process.env.PORT || 4000
app.listen(PORT, () => {
  console.log(`ORITA API רץ על http://localhost:${PORT}`)
})
