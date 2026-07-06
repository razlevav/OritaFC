import express from 'express'
import cors from 'cors'
import { db } from './db.js'

const collections = {
  ingredients: 'ing',
  'prepared-items': 'prep',
  dishes: 'dish',
}

// ראוטר API יחסי-שורש (בלי קידומת /api) - כך שאפשר להרכיב אותו גם מתחת ל-/api
// בשרת עצמאי (server/index.js), וגם ישירות כפונקציית Netlify (netlify/functions/api.js).
export function createApiRouter() {
  const router = express.Router()

  // הגנת סיסמה בסיסית — מופעלת רק אם הוגדרו משתני הסביבה AUTH_USER / AUTH_PASS.
  const AUTH_USER = process.env.AUTH_USER
  const AUTH_PASS = process.env.AUTH_PASS

  if (AUTH_USER && AUTH_PASS) {
    router.use((req, res, next) => {
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

  router.use(cors())
  router.use(express.json())

  router.get('/state', async (req, res) => {
    res.json(await db.getFullState())
  })

  for (const [route, prefix] of Object.entries(collections)) {
    const key = route === 'prepared-items' ? 'preparedItems' : route

    router.get(`/${route}`, async (req, res) => {
      res.json(await db.getAll(key))
    })

    router.get(`/${route}/:id`, async (req, res) => {
      const item = await db.getOne(key, req.params.id)
      if (!item) return res.status(404).json({ error: 'לא נמצא' })
      res.json(item)
    })

    router.post(`/${route}`, async (req, res) => {
      const item = await db.create(key, req.body, prefix)
      res.status(201).json(item)
    })

    router.put(`/${route}/:id`, async (req, res) => {
      const item = await db.update(key, req.params.id, req.body)
      if (!item) return res.status(404).json({ error: 'לא נמצא' })
      res.json(item)
    })

    router.delete(`/${route}/:id`, async (req, res) => {
      const ok = await db.remove(key, req.params.id)
      if (!ok) return res.status(404).json({ error: 'לא נמצא' })
      res.status(204).end()
    })
  }

  return router
}
