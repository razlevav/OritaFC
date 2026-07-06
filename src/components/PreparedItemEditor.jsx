import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useStore } from '../lib/store.jsx'
import ComponentsEditor, { makeEmptyComponent } from './ComponentsEditor.jsx'
import ConfirmDialog from './ConfirmDialog.jsx'
import { BASE_UNITS, buildContext, computeRecipeCost, formatMoney } from '../lib/calc'

export default function PreparedItemEditor() {
  const { id } = useParams()
  const isNew = id === 'new'
  const navigate = useNavigate()
  const { preparedItems, ingredients, preparedItemActions, loading } = useStore()

  const existing = useMemo(() => preparedItems.find((p) => p.id === id), [preparedItems, id])

  const [name, setName] = useState('')
  const [yieldQuantity, setYieldQuantity] = useState(100)
  const [yieldUnit, setYieldUnit] = useState('גרם')
  const [components, setComponents] = useState([makeEmptyComponent()])
  const [loadedId, setLoadedId] = useState(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [savedFlash, setSavedFlash] = useState(false)

  useEffect(() => {
    if (isNew) {
      setName('')
      setYieldQuantity(100)
      setYieldUnit('גרם')
      setComponents([makeEmptyComponent()])
      setLoadedId('new')
    } else if (existing && loadedId !== existing.id) {
      setName(existing.name)
      setYieldQuantity(existing.yieldQuantity)
      setYieldUnit(existing.yieldUnit)
      setComponents(existing.components.length ? existing.components : [makeEmptyComponent()])
      setLoadedId(existing.id)
    }
  }, [isNew, existing, loadedId])

  const context = useMemo(() => buildContext({ ingredients, preparedItems }), [ingredients, preparedItems])
  const { totalCost } = useMemo(() => computeRecipeCost(components, context), [components, context])
  const baseUnitCost = Number(yieldQuantity) > 0 ? totalCost / Number(yieldQuantity) : 0

  async function handleSave() {
    if (!name.trim()) return
    setSaving(true)
    try {
      const payload = {
        name: name.trim(),
        yieldQuantity: Number(yieldQuantity) || 0,
        yieldUnit,
        components,
      }
      if (isNew) {
        const created = await preparedItemActions.create(payload)
        navigate(`/prepared-items/${created.id}`, { replace: true })
      } else {
        await preparedItemActions.update(id, payload)
        setSavedFlash(true)
        setTimeout(() => setSavedFlash(false), 1800)
      }
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    await preparedItemActions.remove(id)
    navigate('/prepared-items')
  }

  if (!isNew && !loading && !existing) {
    return <p className="text-brand-ink/50">הפריט לא נמצא.</p>
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate('/prepared-items')}
          className="text-brand-ink/50 hover:text-brand-pinkDark text-xl"
        >
          →
        </button>
        <h1 className="text-2xl font-extrabold text-brand-ink">{isNew ? 'פריט מוכן חדש' : 'עריכת פריט מוכן'}</h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-xl2 shadow-soft p-5">
            <label className="block text-sm font-medium text-brand-ink/70 mb-1.5">שם הפריט</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder='לדוגמה: רוטב טרטר'
              className="w-full rounded-lg border border-brand-pinkLight bg-white px-3 py-2.5 text-base font-medium focus:outline-none focus:ring-2 focus:ring-brand-pink"
            />
          </div>

          <div className="bg-white rounded-xl2 shadow-soft p-5">
            <h3 className="font-bold text-brand-ink mb-3">מרכיבי המתכון</h3>
            <ComponentsEditor
              components={components}
              onChange={setComponents}
              context={context}
              ingredients={ingredients}
              preparedItems={preparedItems}
              excludePreparedId={isNew ? undefined : id}
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleSave}
              disabled={!name.trim() || saving}
              className="px-5 py-2.5 rounded-xl bg-brand-pink text-white font-medium shadow-soft hover:bg-brand-pinkDark transition-colors disabled:opacity-40"
            >
              שמירה
            </button>
            {!isNew && (
              <button
                onClick={() => setDeleteOpen(true)}
                className="px-5 py-2.5 rounded-xl text-danger font-medium hover:bg-danger/10 transition-colors"
              >
                מחיקת פריט
              </button>
            )}
            {savedFlash && <span className="text-success text-sm font-medium">נשמר ✓</span>}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-white rounded-xl2 shadow-soft p-5 space-y-4">
            <h3 className="font-bold text-brand-ink">תפוקה</h3>
            <div className="flex gap-2">
              <input
                type="number"
                step="any"
                min="0"
                value={yieldQuantity}
                onChange={(e) => setYieldQuantity(e.target.value)}
                className="w-1/2 rounded-lg border border-brand-pinkLight bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-pink"
              />
              <select
                value={yieldUnit}
                onChange={(e) => setYieldUnit(e.target.value)}
                className="w-1/2 rounded-lg border border-brand-pinkLight bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-pink"
              >
                {BASE_UNITS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-xs text-brand-ink/40">
              כמה יוצא בסה"כ מהמתכון הזה (למשל 500 גרם רוטב, או 10 יחידות).
            </p>

            <div className="rounded-xl bg-brand-cream p-3 flex items-center justify-between">
              <span className="text-xs text-brand-ink/50">עלות כוללת</span>
              <span className="font-bold text-brand-ink">{formatMoney(totalCost)}</span>
            </div>
            <div className="rounded-xl bg-brand-cream p-3 flex items-center justify-between">
              <span className="text-xs text-brand-ink/50">עלות ליחידה</span>
              <span className="font-bold text-brand-pinkDark">
                {formatMoney(baseUnitCost)} / {yieldUnit}
              </span>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={deleteOpen}
        title={`למחוק את "${name}"?`}
        description="לא ניתן לשחזר את הפעולה."
        onCancel={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
      />
    </div>
  )
}
