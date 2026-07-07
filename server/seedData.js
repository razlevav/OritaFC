// אותם נתונים כמו server/data.json, אבל כמודול JS רגיל (לא קריאת קובץ בזמן ריצה).
// זה נחוץ כדי שזריעת הנתונים תעבוד גם בתוך פונקציית Netlify, שם ה-bundler ממיר
// את הקוד ל-CommonJS ו-import.meta.url (הדרך הרגילה לאתר קבצים לפי __dirname) לא עובד.
export const seedData = {
  ingredients: [
    { id: 'ing-rice', name: 'אורז לסושי', purchaseQuantity: 1, purchaseUnit: 'ק"ג', purchasePrice: 14, note: 'יבואן אורז כהן', updatedAt: '2026-07-06T14:12:08.387Z' },
    { id: 'ing-nori', name: 'אצות נורי', purchaseQuantity: 40, purchaseUnit: 'יחידה', purchasePrice: 32, note: 'חבילת 40 יחידות', updatedAt: '2026-07-01T00:00:00.000Z' },
    { id: 'ing-salmon', name: 'סלמון טרי', purchaseQuantity: 1, purchaseUnit: 'ק"ג', purchasePrice: 89, note: '', updatedAt: '2026-07-01T00:00:00.000Z' },
    { id: 'ing-avocado', name: 'אבוקדו', purchaseQuantity: 1, purchaseUnit: 'יחידה', purchasePrice: 4.5, note: '', updatedAt: '2026-07-01T00:00:00.000Z' },
    { id: 'ing-cucumber', name: 'מלפפון', purchaseQuantity: 1, purchaseUnit: 'יחידה', purchasePrice: 2, note: '', updatedAt: '2026-07-01T00:00:00.000Z' },
    { id: 'ing-mayo', name: 'מיונז יפני', purchaseQuantity: 1, purchaseUnit: 'ק"ג', purchasePrice: 22, note: '', updatedAt: '2026-07-01T00:00:00.000Z' },
    { id: 'ing-soy', name: 'רוטב סויה', purchaseQuantity: 1, purchaseUnit: 'ליטר', purchasePrice: 12, note: '', updatedAt: '2026-07-01T00:00:00.000Z' },
  ],
  preparedItems: [
    {
      id: 'prep-tartar',
      name: 'רוטב טרטר',
      yieldQuantity: 500,
      yieldUnit: 'גרם',
      components: [
        { id: 'c1', type: 'ingredient', refId: 'ing-mayo', quantity: 450 },
        { id: 'c2', type: 'ingredient', refId: 'ing-soy', quantity: 50 },
      ],
      updatedAt: '2026-07-01T00:00:00.000Z',
    },
    {
      id: 'prep-mr9armhv-szx1yq',
      name: 'רוטב פונזו',
      yieldQuantity: 100,
      yieldUnit: 'גרם',
      components: [{ id: 'row-mr9aqydo-23', type: 'ingredient', refId: 'ing-soy', quantity: '300' }],
      updatedAt: '2026-07-06T14:10:13.795Z',
    },
  ],
  dishes: [
    {
      id: 'dish-sample-roll',
      name: 'רול סלמון אבוקדו',
      sellPrice: 58,
      components: [
        { id: 'd1', type: 'ingredient', refId: 'ing-rice', quantity: 150 },
        { id: 'd2', type: 'ingredient', refId: 'ing-nori', quantity: 1 },
        { id: 'd3', type: 'ingredient', refId: 'ing-salmon', quantity: 80 },
        { id: 'd4', type: 'ingredient', refId: 'ing-avocado', quantity: 0.5 },
        { id: 'd5', type: 'prepared', refId: 'prep-tartar', quantity: 30 },
      ],
      updatedAt: '2026-07-06T14:17:33.415Z',
    },
  ],
}
