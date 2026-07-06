import { fileDb } from './fileDb.js'
import { mongoDb } from './mongoDb.js'

// אם הוגדר MONGODB_URI (בענן) - אחסון ב-MongoDB Atlas.
// אחרת (מקומי, בלי אינטרנט) - קובץ JSON מקומי, בדיוק כמו עד היום.
export const db = process.env.MONGODB_URI ? mongoDb : fileDb
