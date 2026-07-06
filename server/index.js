import express from 'express'
import cors from 'cors'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { db } from './db.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()

// הגנת סיסמה בסיסית — מופעלת רק אם הוגדרו משתני הסביבה AUTH_USER / AUTH_PASS.
// בפיתוח מקומי (בלי משתנים אלו) האפליקציה נשארת פתוחה כרגיל.
const AUTH_USER = process.env.AUTH_USER
const AUTH_PASS = process.env.AUTH_PASS

if (AUTH_USER && AUTH_PASS) {
  app.use((req, res, next) => {
    const header = req.headers.authorization || ''
    const [scheme, encoded] = header.split(' ')
    if (scheme === 'Basic' && encoded) {
      const [user, pass] = Buffer.from(encoded, 'base64').toString().split(':')
      if (user === AUTH_USER && pass === AUTH_PASS) return next()
    }
    res.set('WWW-Authenticate', 'Basic realm="ORITA"')
    res.status(401).send('נדרשת התחברות')
  })
}

app.use(cors())
app.use(express.json())

const collections = {
  ingredients: 'ing',
  'prepared-items': 'prep',
  dishes: 'dish',
}

app.get('/api/state', (req, res) => {
  res.json(db.getFullState())
})

for (const [route, prefix] of Object.entries(collections)) {
  const key = route === 'prepared-items' ? 'preparedItems' : route

  app.get(`/api/${route}`, (req, res) => {
    res.json(db.getAll(key))
  })

  app.get(`/api/${route}/:id`, (req, res) => {
    const item = db.getOne(key, req.params.id)
    if (!item) return res.status(404).json({ error: 'לא נמצא' })
    res.json(item)
  })

  app.post(`/api/${route}`, (req, res) => {
    const item = db.create(key, req.body, prefix)
    res.status(201).json(item)
  })

  app.put(`/api/${route}/:id`, (req, res) => {
    const item = db.update(key, req.params.id, req.body)
    if (!item) return res.status(404).json({ error: 'לא נמצא' })
    res.json(item)
  })

  app.delete(`/api/${route}/:id`, (req, res) => {
    const ok = db.remove(key, req.params.id)
    if (!ok) return res.status(404).json({ error: 'לא נמצא' })
    res.status(204).end()
  })
}

// בפרודקשן השרת הזה גם מגיש את קובצי ה-build של React (תהליך אחד, פורט אחד).
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
