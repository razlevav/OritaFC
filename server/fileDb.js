import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
// DATA_DIR מאפשר להצביע על תיקייה חיצונית (למשל דיסק מתמיד בענן) בלי לשנות קוד.
const DATA_DIR = process.env.DATA_DIR || __dirname
const DATA_FILE = path.join(DATA_DIR, 'data.json')
// קובץ הזרע המגיע יחד עם הקוד (הנתונים המקומיים העדכניים בזמן ה-deploy הראשון).
const SEED_FILE = path.join(__dirname, 'data.json')

const EMPTY_STATE = { ingredients: [], preparedItems: [], dishes: [] }

function ensureDataFile() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
  if (!fs.existsSync(DATA_FILE)) {
    // בפעם הראשונה על דיסק חדש (בענן) — מתחילים מהנתונים שהיו מקומית בזמן ה-deploy, לא מריק.
    if (DATA_FILE !== SEED_FILE && fs.existsSync(SEED_FILE)) {
      fs.copyFileSync(SEED_FILE, DATA_FILE)
    } else {
      fs.writeFileSync(DATA_FILE, JSON.stringify(EMPTY_STATE, null, 2), 'utf-8')
    }
  }
}

ensureDataFile()

function readState() {
  const raw = fs.readFileSync(DATA_FILE, 'utf-8')
  return JSON.parse(raw)
}

function writeState(state) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(state, null, 2), 'utf-8')
}

function genId(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

// כל המתודות async כדי לשמור על ממשק זהה לגרסת ה-MongoDB (server/mongoDb.js).
export const fileDb = {
  async getAll(collection) {
    const state = readState()
    return state[collection] || []
  },

  async getOne(collection, id) {
    const state = readState()
    return (state[collection] || []).find((item) => item.id === id) || null
  },

  async create(collection, data, idPrefix) {
    const state = readState()
    const item = {
      ...data,
      id: genId(idPrefix),
      updatedAt: new Date().toISOString(),
    }
    state[collection] = [...(state[collection] || []), item]
    writeState(state)
    return item
  },

  async update(collection, id, data) {
    const state = readState()
    const list = state[collection] || []
    const idx = list.findIndex((item) => item.id === id)
    if (idx === -1) return null
    const updated = { ...list[idx], ...data, id, updatedAt: new Date().toISOString() }
    list[idx] = updated
    state[collection] = list
    writeState(state)
    return updated
  },

  async remove(collection, id) {
    const state = readState()
    const list = state[collection] || []
    const next = list.filter((item) => item.id !== id)
    state[collection] = next
    writeState(state)
    return next.length !== list.length
  },

  async getFullState() {
    return readState()
  },
}
