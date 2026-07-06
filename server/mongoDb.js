import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { MongoClient } from 'mongodb'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SEED_FILE = path.join(__dirname, 'data.json')
const SEED_COLLECTIONS = ['ingredients', 'preparedItems', 'dishes']

let clientPromise = null
let seedPromise = null

function getClient() {
  if (!clientPromise) {
    const client = new MongoClient(process.env.MONGODB_URI)
    clientPromise = client.connect()
  }
  return clientPromise
}

// בפעם הראשונה שמסד הנתונים בענן ריק לגמרי - טוענים אליו את הנתונים המקומיים
// שהיו קיימים בזמן ה-deploy (אותו server/data.json), כדי לא להתחיל מריק.
// כל הקריאות המקבילות מחכות לאותו Promise, כדי שקריאות קריאה לא ירוצו לפני שהזריעה הסתיימה.
function ensureSeeded(rawDb) {
  if (!seedPromise) {
    seedPromise = (async () => {
      const counts = await Promise.all(SEED_COLLECTIONS.map((c) => rawDb.collection(c).countDocuments()))
      const isEmpty = counts.every((c) => c === 0)
      if (!isEmpty || !fs.existsSync(SEED_FILE)) return

      const seed = JSON.parse(fs.readFileSync(SEED_FILE, 'utf-8'))
      for (const key of SEED_COLLECTIONS) {
        const docs = (seed[key] || []).map((item) => ({ ...item, _id: item.id }))
        if (docs.length) await rawDb.collection(key).insertMany(docs)
      }
    })()
  }
  return seedPromise
}

async function getDb() {
  const client = await getClient()
  const rawDb = client.db('orita')
  await ensureSeeded(rawDb)
  return rawDb
}

function genId(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

const NO_ID = { projection: { _id: 0 } }

export const mongoDb = {
  async getAll(collection) {
    const db = await getDb()
    return db.collection(collection).find({}, NO_ID).toArray()
  },

  async getOne(collection, id) {
    const db = await getDb()
    return db.collection(collection).findOne({ id }, NO_ID)
  },

  async create(collection, data, idPrefix) {
    const db = await getDb()
    const id = genId(idPrefix)
    const item = { ...data, id, updatedAt: new Date().toISOString() }
    await db.collection(collection).insertOne({ ...item, _id: id })
    return item
  },

  async update(collection, id, data) {
    const db = await getDb()
    const updated = { ...data, id, updatedAt: new Date().toISOString() }
    const result = await db
      .collection(collection)
      .findOneAndUpdate({ id }, { $set: updated }, { returnDocument: 'after', ...NO_ID })
    return result && result.value !== undefined ? result.value : result
  },

  async remove(collection, id) {
    const db = await getDb()
    const result = await db.collection(collection).deleteOne({ id })
    return result.deletedCount > 0
  },

  async getFullState() {
    const [ingredients, preparedItems, dishes] = await Promise.all([
      this.getAll('ingredients'),
      this.getAll('preparedItems'),
      this.getAll('dishes'),
    ])
    return { ingredients, preparedItems, dishes }
  },
}
