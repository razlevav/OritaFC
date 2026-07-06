import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
// DATA_DIR מאפשר להצביע על תיקייה חיצונית (למשל דיסק מתמיד בענן) בלי לשנות קוד.
const DATA_DIR = process.env.DATA_DIR || __dirname
const DATA_FILE = path.join(DATA_DIR, 'data.json')

const EMPTY_STATE = { ingredients: [], preparedItems: [], dishes: [] }

function ensureDataFile() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(EMPTY_STATE, null, 2), 'utf-8')
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

export const db = {
  getAll(collection) {
    const state = readState()
    return state[collection] || []
  },

  getOne(collection, id) {
    const state = readState()
    return (state[collection] || []).find((item) => item.id === id) || null
  },

  create(collection, data, idPrefix) {
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

  update(collection, id, data) {
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

  remove(collection, id) {
    const state = readState()
    const list = state[collection] || []
    const next = list.filter((item) => item.id !== id)
    state[collection] = next
    writeState(state)
    return next.length !== list.length
  },

  getFullState() {
    return readState()
  },
}
