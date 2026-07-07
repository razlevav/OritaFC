import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { seedData } from './seedData.js'

// כל חישוב הנתיבים נעשה בעצלנות (רק כשבאמת קוראים/כותבים קובץ), לא בטעינת המודול -
// כך ש-import של הקובץ הזה לא יקרוס בסביבות שבהן import.meta.url לא זמין
// (כמו פונקציית Netlify, גם אם ה-backend הנבחר בפועל הוא MongoDB ולא זה).
let dataFile = null

function getDataFile() {
  if (dataFile) return dataFile
  const fileDbDir = path.dirname(fileURLToPath(import.meta.url))
  const dataDir = process.env.DATA_DIR || fileDbDir
  dataFile = path.join(dataDir, 'data.json')

  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true })
  if (!fs.existsSync(dataFile)) {
    fs.writeFileSync(dataFile, JSON.stringify(seedData, null, 2), 'utf-8')
  }
  return dataFile
}

function readState() {
  const raw = fs.readFileSync(getDataFile(), 'utf-8')
  return JSON.parse(raw)
}

function writeState(state) {
  fs.writeFileSync(getDataFile(), JSON.stringify(state, null, 2), 'utf-8')
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
