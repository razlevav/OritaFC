import { useMemo, useState } from 'react'
import { useStore } from '../lib/store.jsx'
import SearchInput from './SearchInput.jsx'
import ConfirmDialog from './ConfirmDialog.jsx'
import { PURCHASE_UNITS, computeIngredientDerived, formatMoney } from '../lib/calc'

const emptyDraft = { name: '', purchaseQuantity: 1, purchaseUnit: 'ק"ג', purchasePrice: '', note: '' }

export default function IngredientsManager() {
  const { ingredients, ingredientActions, loading } = useStore()
  const [query, setQuery] = useState('')
  const [draft, setDraft] = useState(emptyDraft)
  const [pendingDelete, setPendingDelete] = useState(null)

  const filtered = useMemo(() => {
    const q = query.trim()
    return [...ingredients].filter((i) => i.name.includes(q)).sort((a, b) => a.name.localeCompare(b.name, 'he'))
  }, [ingredients, query])

  async function handleFieldUpdate(ingredient, field, value) {
    await ingredientActions.update(ingredient.id, { ...ingredient, [field]: value })
  }

  async function handleAdd() {
    if (!draft.name.trim() || draft.purchasePrice === '') return
    await ingredientActions.create({
      name: draft.name.trim(),
      purchaseQuantity: Number(draft.purchaseQuantity) || 1,
      purchaseUnit: draft.purchaseUnit,
      purchasePrice: Number(draft.purchasePrice) || 0,
      note: draft.note.trim(),
    })
    setDraft(emptyDraft)
  }

  async function handleDelete(ingredient) {
    await ingredientActions.remove(ingredient.id)
    setPendingDelete(null)
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-brand-ink">מרכיבי גלם</h1>
          <p className="text-sm text-brand-ink/60">
            טבלת מחירים ראשית — שינוי כאן ישפיע אוטומטית על כל המנות שמשתמשות במרכיב
          </p>
        </div>
        <SearchInput value={query} onChange={setQuery} placeholder="חיפוש מרכיב..." />
      </div>

      <div className="bg-white rounded-xl2 shadow-soft overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-sm min-w-[820px]">
            <thead>
              <tr className="bg-brand-pinkLight/40 text-brand-ink/70 text-xs">
                <th className="text-start px-4 py-3 font-medium">שם המרכיב</th>
                <th className="text-start px-4 py-3 font-medium w-28">כמות רכישה</th>
                <th className="text-start px-4 py-3 font-medium w-28">יחידת רכישה</th>
                <th className="text-start px-4 py-3 font-medium w-28">מחיר (₪)</th>
                <th className="text-start px-4 py-3 font-medium w-36">עלות ליחידת בסיס</th>
                <th className="text-start px-4 py-3 font-medium">הערות / ספק</th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-brand-ink/40">
                    טוען נתונים...
                  </td>
                </tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-brand-ink/40">
                    לא נמצאו מרכיבים
                  </td>
                </tr>
              )}
              {filtered.map((ingredient) => {
                const derived = computeIngredientDerived(ingredient)
                return (
                  <tr key={ingredient.id} className="border-t border-brand-pinkLight/40">
                    <td className="px-4 py-2">
                      <input
                        defaultValue={ingredient.name}
                        onBlur={(e) => e.target.value.trim() && handleFieldUpdate(ingredient, 'name', e.target.value.trim())}
                        className="w-full rounded-lg border border-transparent hover:border-brand-pinkLight focus:border-brand-pink bg-transparent px-2 py-1.5 focus:outline-none"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="number"
                        step="any"
                        min="0"
                        defaultValue={ingredient.purchaseQuantity}
                        onBlur={(e) => handleFieldUpdate(ingredient, 'purchaseQuantity', Number(e.target.value) || 0)}
                        className="w-full rounded-lg border border-transparent hover:border-brand-pinkLight focus:border-brand-pink bg-transparent px-2 py-1.5 focus:outline-none"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <select
                        defaultValue={ingredient.purchaseUnit}
                        onChange={(e) => handleFieldUpdate(ingredient, 'purchaseUnit', e.target.value)}
                        className="w-full rounded-lg border border-transparent hover:border-brand-pinkLight focus:border-brand-pink bg-transparent px-2 py-1.5 focus:outline-none"
                      >
                        {PURCHASE_UNITS.map((u) => (
                          <option key={u} value={u}>
                            {u}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="number"
                        step="any"
                        min="0"
                        defaultValue={ingredient.purchasePrice}
                        onBlur={(e) => handleFieldUpdate(ingredient, 'purchasePrice', Number(e.target.value) || 0)}
                        className="w-full rounded-lg border border-transparent hover:border-brand-pinkLight focus:border-brand-pink bg-transparent px-2 py-1.5 focus:outline-none"
                      />
                    </td>
                    <td className="px-4 py-2 font-medium text-brand-pinkDark">
                      {formatMoney(derived.baseUnitCost)} / {derived.baseUnit}
                    </td>
                    <td className="px-4 py-2">
                      <input
                        defaultValue={ingredient.note}
                        onBlur={(e) => handleFieldUpdate(ingredient, 'note', e.target.value)}
                        className="w-full rounded-lg border border-transparent hover:border-brand-pinkLight focus:border-brand-pink bg-transparent px-2 py-1.5 focus:outline-none text-brand-ink/60"
                      />
                    </td>
                    <td className="px-4 py-2 text-center">
                      <button
                        onClick={() => setPendingDelete(ingredient)}
                        className="text-brand-ink/30 hover:text-danger text-lg leading-none"
                        title="מחיקה"
                      >
                        ×
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-xl2 shadow-soft p-5 mt-5">
        <h3 className="font-bold text-brand-ink mb-3">הוספת מרכיב חדש</h3>
        <div className="grid sm:grid-cols-5 gap-3">
          <input
            placeholder="שם המרכיב"
            value={draft.name}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            className="rounded-lg border border-brand-pinkLight bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-pink sm:col-span-2"
          />
          <input
            type="number"
            step="any"
            min="0"
            placeholder="כמות רכישה"
            value={draft.purchaseQuantity}
            onChange={(e) => setDraft({ ...draft, purchaseQuantity: e.target.value })}
            className="rounded-lg border border-brand-pinkLight bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-pink"
          />
          <select
            value={draft.purchaseUnit}
            onChange={(e) => setDraft({ ...draft, purchaseUnit: e.target.value })}
            className="rounded-lg border border-brand-pinkLight bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-pink"
          >
            {PURCHASE_UNITS.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
          <input
            type="number"
            step="any"
            min="0"
            placeholder="מחיר (₪)"
            value={draft.purchasePrice}
            onChange={(e) => setDraft({ ...draft, purchasePrice: e.target.value })}
            className="rounded-lg border border-brand-pinkLight bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-pink"
          />
          <input
            placeholder="הערות / ספק (אופציונלי)"
            value={draft.note}
            onChange={(e) => setDraft({ ...draft, note: e.target.value })}
            className="rounded-lg border border-brand-pinkLight bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-pink sm:col-span-3"
          />
          <button
            onClick={handleAdd}
            className="rounded-lg bg-brand-pink text-white font-medium px-4 py-2 text-sm hover:bg-brand-pinkDark transition-colors sm:col-span-2"
          >
            + הוספת מרכיב
          </button>
        </div>
        <p className="text-xs text-brand-ink/40 mt-2">
          לדוגמה: חבילת 40 אצות נורי ב-32 ₪ → כמות רכישה 40, יחידה "יחידה", מחיר 32.
        </p>
      </div>

      <ConfirmDialog
        open={!!pendingDelete}
        title={`למחוק את "${pendingDelete?.name}"?`}
        description="מנות שמשתמשות במרכיב זה יראו אותו כחסר עד להסרתו מהמתכון."
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => handleDelete(pendingDelete)}
      />
    </div>
  )
}
