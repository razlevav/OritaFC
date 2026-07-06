// יחידות רכישה אפשריות למרכיבי גלם, וההמרה שלהן ליחידת הבסיס שבה מתבצע כל חישוב.
export const PURCHASE_UNITS = ['ק"ג', 'גרם', 'ליטר', 'מ"ל', 'יחידה']

export const BASE_UNIT_BY_PURCHASE_UNIT = {
  'ק"ג': 'גרם',
  'גרם': 'גרם',
  'ליטר': 'מ"ל',
  'מ"ל': 'מ"ל',
  'יחידה': 'יחידה',
}

const CONVERSION_TO_BASE = {
  'ק"ג': 1000,
  'גרם': 1,
  'ליטר': 1000,
  'מ"ל': 1,
  'יחידה': 1,
}

// יחידות הבסיס האפשריות לתפוקת פריט מוכן/רוטב (זהות ליחידות הבסיס של מרכיבי גלם).
export const BASE_UNITS = ['גרם', 'מ"ל', 'יחידה']

export function baseUnitForPurchaseUnit(purchaseUnit) {
  return BASE_UNIT_BY_PURCHASE_UNIT[purchaseUnit] || purchaseUnit
}

// עלות ליחידת בסיס בודדת (₪ לגרם / ₪ למ"ל / ₪ ליחידה) עבור מרכיב גלם.
export function computeIngredientDerived(ingredient) {
  const factor = CONVERSION_TO_BASE[ingredient.purchaseUnit] ?? 1
  const baseQuantity = (Number(ingredient.purchaseQuantity) || 0) * factor
  const baseUnit = baseUnitForPurchaseUnit(ingredient.purchaseUnit)
  const baseUnitCost = baseQuantity > 0 ? (Number(ingredient.purchasePrice) || 0) / baseQuantity : 0
  return { baseUnit, baseUnitCost }
}

// פותר את העלות ליחידת בסיס עבור רכיב בתוך מתכון (מרכיב גלם, פריט מוכן/רוטב, או פריט ידני חד-פעמי).
export function resolveComponentUnit(component, context) {
  if (component.type === 'manual') {
    // פריט ידני חד-פעמי מחושב באותו אופן כמו מרכיב גלם: מחיר לכמות רכישה → עלות ליחידת בסיס.
    const { baseUnit, baseUnitCost } = computeIngredientDerived(component)
    return {
      name: component.name || '(פריט ידני ללא שם)',
      baseUnit,
      baseUnitCost,
      missing: false,
    }
  }
  if (component.type === 'ingredient') {
    const ingredient = context.ingredientsById[component.refId]
    if (!ingredient) return { name: '(מרכיב נמחק)', baseUnit: '', baseUnitCost: 0, missing: true }
    const { baseUnit, baseUnitCost } = computeIngredientDerived(ingredient)
    return { name: ingredient.name, baseUnit, baseUnitCost, missing: false }
  }
  const prepared = context.preparedItemsById[component.refId]
  if (!prepared) return { name: '(פריט נמחק)', baseUnit: '', baseUnitCost: 0, missing: true }
  const { baseUnitCost } = computePreparedItemCost(prepared, context)
  return { name: prepared.name, baseUnit: prepared.yieldUnit, baseUnitCost, missing: false }
}

export function computeComponentLine(component, context) {
  const resolved = resolveComponentUnit(component, context)
  const quantity = Number(component.quantity) || 0
  const cost = quantity * resolved.baseUnitCost
  return { ...resolved, quantity, cost }
}

export function computeRecipeCost(components, context) {
  const lines = (components || []).map((component) => ({
    component,
    ...computeComponentLine(component, context),
  }))
  const totalCost = lines.reduce((sum, line) => sum + line.cost, 0)
  return { lines, totalCost }
}

// עלות כוללת ועלות ליחידת בסיס עבור פריט מוכן/רוטב (יכול לשמש כמרכיב במנות אחרות).
export function computePreparedItemCost(preparedItem, context, _depth = 0) {
  if (_depth > 8) return { totalCost: 0, baseUnitCost: 0 } // הגנה מפני הפניה מעגלית
  const safeContext = { ...context, _depth: _depth + 1 }
  const { totalCost } = computeRecipeCost(preparedItem.components, {
    ingredientsById: context.ingredientsById,
    preparedItemsById: context.preparedItemsById,
  })
  const yieldQuantity = Number(preparedItem.yieldQuantity) || 0
  const baseUnitCost = yieldQuantity > 0 ? totalCost / yieldQuantity : 0
  return { totalCost, baseUnitCost }
}

export function computeDishMetrics(dish, context) {
  const { lines, totalCost } = computeRecipeCost(dish.components, context)
  const sellPrice = Number(dish.sellPrice) || 0
  const profit = sellPrice - totalCost
  const profitPct = sellPrice > 0 ? (profit / sellPrice) * 100 : 0
  const foodCostPct = sellPrice > 0 ? (totalCost / sellPrice) * 100 : 0
  return { lines, totalCost, sellPrice, profit, profitPct, foodCostPct }
}

export function buildContext({ ingredients, preparedItems }) {
  return {
    ingredientsById: Object.fromEntries((ingredients || []).map((i) => [i.id, i])),
    preparedItemsById: Object.fromEntries((preparedItems || []).map((p) => [p.id, p])),
  }
}

export function formatMoney(value) {
  const n = Number(value) || 0
  return `₪${n.toLocaleString('he-IL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function formatPercent(value) {
  const n = Number(value) || 0
  return `${n.toLocaleString('he-IL', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`
}
