import { PURCHASE_UNITS, computeComponentLine, formatMoney } from '../lib/calc'

let rowIdCounter = 0
function newRowId() {
  rowIdCounter += 1
  return `row-${Date.now().toString(36)}-${rowIdCounter}`
}

export function makeEmptyComponent() {
  return { id: newRowId(), type: 'ingredient', refId: '', quantity: '' }
}

export default function ComponentsEditor({
  components,
  onChange,
  context,
  ingredients,
  preparedItems,
  excludePreparedId,
}) {
  const preparedOptions = excludePreparedId
    ? preparedItems.filter((p) => p.id !== excludePreparedId)
    : preparedItems

  function updateRow(id, patch) {
    onChange(components.map((c) => (c.id === id ? { ...c, ...patch } : c)))
  }

  function removeRow(id) {
    onChange(components.filter((c) => c.id !== id))
  }

  function addRow() {
    onChange([...components, makeEmptyComponent()])
  }

  function handleTypeChange(id, type) {
    if (type === 'manual') {
      const current = components.find((c) => c.id === id)
      updateRow(id, {
        type,
        refId: '',
        name: current?.name || '',
        purchaseQuantity: current?.purchaseQuantity ?? 100,
        purchaseUnit: current?.purchaseUnit || 'גרם',
        purchasePrice: current?.purchasePrice ?? '',
      })
    } else {
      updateRow(id, { type, refId: '' })
    }
  }

  const total = components.reduce((sum, c) => sum + computeComponentLine(c, context).cost, 0)

  return (
    <div>
      <div className="overflow-x-auto scrollbar-thin rounded-xl border border-brand-pinkLight/60">
        <table className="w-full text-sm min-w-[760px]">
          <thead>
            <tr className="bg-brand-pinkLight/40 text-brand-ink/70 text-xs">
              <th className="text-start px-3 py-2 font-medium w-32">סוג</th>
              <th className="text-start px-3 py-2 font-medium">מרכיב</th>
              <th className="text-start px-3 py-2 font-medium w-24">כמות</th>
              <th className="text-start px-3 py-2 font-medium w-24">יחידה</th>
              <th className="text-start px-3 py-2 font-medium w-28">מחיר ליחידה</th>
              <th className="text-start px-3 py-2 font-medium w-24">עלות</th>
              <th className="w-10"></th>
            </tr>
          </thead>
          <tbody>
            {components.length === 0 && (
              <tr>
                <td colSpan={7} className="px-3 py-6 text-center text-brand-ink/40">
                  אין עדיין מרכיבים. לחצו על "הוספת מרכיב" כדי להתחיל.
                </td>
              </tr>
            )}
            {components.map((component) => {
              const line = computeComponentLine(component, context)
              const options = component.type === 'ingredient' ? ingredients : preparedOptions
              const isManual = component.type === 'manual'
              return (
                <tr key={component.id} className="border-t border-brand-pinkLight/50">
                  <td className="px-3 py-2 align-top">
                    <select
                      value={component.type}
                      onChange={(e) => handleTypeChange(component.id, e.target.value)}
                      className="w-full rounded-lg border border-brand-pinkLight bg-white px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-pink"
                    >
                      <option value="ingredient">מרכיב גלם</option>
                      <option value="prepared">פריט מוכן</option>
                      <option value="manual">פריט חד-פעמי (ידני)</option>
                    </select>
                  </td>

                  {isManual ? (
                    <td className="px-3 py-2 align-top" colSpan={4}>
                      <input
                        type="text"
                        placeholder="שם הפריט"
                        value={component.name || ''}
                        onChange={(e) => updateRow(component.id, { name: e.target.value })}
                        className="w-full rounded-lg border border-brand-pinkLight bg-white px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-pink mb-2"
                      />
                      <div className="flex flex-wrap items-center gap-1.5 text-xs">
                        <span className="text-brand-ink/50">עולה</span>
                        <input
                          type="number"
                          step="any"
                          min="0"
                          placeholder="₪"
                          value={component.purchasePrice ?? ''}
                          onChange={(e) => updateRow(component.id, { purchasePrice: e.target.value })}
                          className="w-16 rounded-lg border border-brand-pinkLight bg-white px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-pink"
                        />
                        <span className="text-brand-ink/50">₪ ל-</span>
                        <input
                          type="number"
                          step="any"
                          min="0"
                          value={component.purchaseQuantity ?? ''}
                          onChange={(e) => updateRow(component.id, { purchaseQuantity: e.target.value })}
                          className="w-14 rounded-lg border border-brand-pinkLight bg-white px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-pink"
                        />
                        <select
                          value={component.purchaseUnit || 'גרם'}
                          onChange={(e) => updateRow(component.id, { purchaseUnit: e.target.value })}
                          className="rounded-lg border border-brand-pinkLight bg-white px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-pink"
                        >
                          {PURCHASE_UNITS.map((u) => (
                            <option key={u} value={u}>
                              {u}
                            </option>
                          ))}
                        </select>
                        <span className="text-brand-ink/40 mx-1">|</span>
                        <span className="text-brand-ink/50">בשימוש במנה:</span>
                        <input
                          type="number"
                          step="any"
                          min="0"
                          value={component.quantity}
                          onChange={(e) => updateRow(component.id, { quantity: e.target.value })}
                          className="w-14 rounded-lg border border-brand-pinkLight bg-white px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-pink"
                        />
                        <span className="text-brand-ink/60">{line.baseUnit || '—'}</span>
                        <span className="text-brand-ink/40 mx-1">·</span>
                        <span className="text-brand-ink/50">
                          ({formatMoney(line.baseUnitCost)} / {line.baseUnit || 'יחידה'})
                        </span>
                      </div>
                    </td>
                  ) : (
                    <>
                      <td className="px-3 py-2 align-top">
                        <select
                          value={component.refId}
                          onChange={(e) => updateRow(component.id, { refId: e.target.value })}
                          className="w-full rounded-lg border border-brand-pinkLight bg-white px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-pink"
                        >
                          <option value="">בחירת מרכיב...</option>
                          {options.map((opt) => (
                            <option key={opt.id} value={opt.id}>
                              {opt.name}
                            </option>
                          ))}
                        </select>
                        {line.missing && component.refId && (
                          <p className="text-xs text-danger mt-1">המרכיב שנבחר נמחק</p>
                        )}
                      </td>
                      <td className="px-3 py-2 align-top">
                        <input
                          type="number"
                          step="any"
                          min="0"
                          value={component.quantity}
                          onChange={(e) => updateRow(component.id, { quantity: e.target.value })}
                          className="w-full rounded-lg border border-brand-pinkLight bg-white px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-pink"
                        />
                      </td>
                      <td className="px-3 py-2 align-top text-brand-ink/60">{line.baseUnit || '—'}</td>
                      <td className="px-3 py-2 align-top text-brand-ink/60">{formatMoney(line.baseUnitCost)}</td>
                    </>
                  )}

                  <td className="px-3 py-2 align-top font-medium">{formatMoney(line.cost)}</td>
                  <td className="px-3 py-2 align-top text-center">
                    <button
                      onClick={() => removeRow(component.id)}
                      title="הסרת מרכיב"
                      className="text-brand-ink/40 hover:text-danger text-lg leading-none"
                    >
                      ×
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
          <tfoot>
            <tr className="border-t border-brand-pinkLight/50 bg-brand-pinkLight/20">
              <td colSpan={5} className="px-3 py-2 text-start font-semibold">
                סה"כ עלות חומרי גלם
              </td>
              <td colSpan={2} className="px-3 py-2 font-bold text-brand-pinkDark">
                {formatMoney(total)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
      <button
        onClick={addRow}
        className="mt-3 px-4 py-2 rounded-lg text-sm font-medium bg-brand-pinkLight text-brand-pinkDark hover:bg-brand-pink hover:text-white transition-colors"
      >
        + הוספת מרכיב
      </button>
      <p className="text-xs text-brand-ink/40 mt-2">
        "פריט חד-פעמי" מאפשר להוסיף למנה הזו בלבד מרכיב שלא קיים בטבלת מרכיבי הגלם או ברטבים — מזינים כמה הוא עולה לכמות רכישה (לדוגמה ל-100 גרם, או ליחידת המשקל שרכשתם בה), וכמה נצרך בפועל במנה, והמערכת מחשבת את העלות בהתאם. הוא לא נשמר לספרייה ולא יופיע במנות אחרות.
      </p>
    </div>
  )
}
