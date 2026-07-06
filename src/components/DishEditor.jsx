import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useStore } from '../lib/store.jsx'
import ComponentsEditor, { makeEmptyComponent } from './ComponentsEditor.jsx'
import PriceSlider from './PriceSlider.jsx'
import PromptDialog from './PromptDialog.jsx'
import ConfirmDialog from './ConfirmDialog.jsx'
import { buildContext, computeDishMetrics } from '../lib/calc'

export default function DishEditor() {
  const { id } = useParams()
  const isNew = id === 'new'
  const navigate = useNavigate()
  const { dishes, ingredients, preparedItems, dishActions, loading } = useStore()

  const existingDish = useMemo(() => dishes.find((d) => d.id === id), [dishes, id])

  const [name, setName] = useState('')
  const [sellPrice, setSellPrice] = useState(0)
  const [components, setComponents] = useState([makeEmptyComponent()])
  const [loadedId, setLoadedId] = useState(null)
  const [saveAsOpen, setSaveAsOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [savedFlash, setSavedFlash] = useState(false)

  useEffect(() => {
    if (isNew) {
      setName('')
      setSellPrice(0)
      setComponents([makeEmptyComponent()])
      setLoadedId('new')
    } else if (existingDish && loadedId !== existingDish.id) {
      setName(existingDish.name)
      setSellPrice(existingDish.sellPrice)
      setComponents(existingDish.components.length ? existingDish.components : [makeEmptyComponent()])
      setLoadedId(existingDish.id)
    }
  }, [isNew, existingDish, loadedId])

  const context = useMemo(() => buildContext({ ingredients, preparedItems }), [ingredients, preparedItems])
  const metrics = useMemo(
    () => computeDishMetrics({ sellPrice, components }, context),
    [sellPrice, components, context]
  )

  const validComponents = components.filter((c) => c.refId && Number(c.quantity) > 0)

  async function handleSave() {
    if (!name.trim()) return
    setSaving(true)
    try {
      const payload = { name: name.trim(), sellPrice: Number(sellPrice) || 0, components }
      if (isNew) {
        const created = await dishActions.create(payload)
        navigate(`/dish/${created.id}`, { replace: true })
      } else {
        await dishActions.update(id, payload)
        setSavedFlash(true)
        setTimeout(() => setSavedFlash(false), 1800)
      }
    } finally {
      setSaving(false)
    }
  }

  async function handleSaveAs(newName) {
    setSaveAsOpen(false)
    setSaving(true)
    try {
      const created = await dishActions.create({
        name: newName,
        sellPrice: Number(sellPrice) || 0,
        components,
      })
      navigate(`/dish/${created.id}`, { replace: true })
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    await dishActions.remove(id)
    navigate('/')
  }

  if (!isNew && !loading && !existingDish) {
    return <p className="text-brand-ink/50">המנה לא נמצאה.</p>
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/')} className="text-brand-ink/50 hover:text-brand-pinkDark text-xl">
          →
        </button>
        <h1 className="text-2xl font-extrabold text-brand-ink">{isNew ? 'מנה חדשה' : 'עריכת מנה'}</h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-xl2 shadow-soft p-5">
            <label className="block text-sm font-medium text-brand-ink/70 mb-1.5">שם המנה</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder='לדוגמה: רול סלמון אבוקדו'
              className="w-full rounded-lg border border-brand-pinkLight bg-white px-3 py-2.5 text-base font-medium focus:outline-none focus:ring-2 focus:ring-brand-pink"
            />
          </div>

          <div className="bg-white rounded-xl2 shadow-soft p-5">
            <h3 className="font-bold text-brand-ink mb-3">מרכיבי המנה</h3>
            <ComponentsEditor
              components={components}
              onChange={setComponents}
              context={context}
              ingredients={ingredients}
              preparedItems={preparedItems}
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
            <button
              onClick={() => setSaveAsOpen(true)}
              disabled={!name.trim() || validComponents.length === 0}
              className="px-5 py-2.5 rounded-xl bg-brand-pinkLight text-brand-pinkDark font-medium hover:bg-brand-pink hover:text-white transition-colors disabled:opacity-40"
            >
              שמור בשם...
            </button>
            {!isNew && (
              <button
                onClick={() => setDeleteOpen(true)}
                className="px-5 py-2.5 rounded-xl text-danger font-medium hover:bg-danger/10 transition-colors"
              >
                מחיקת מנה
              </button>
            )}
            {savedFlash && <span className="text-success text-sm font-medium">נשמר ✓</span>}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <PriceSlider
              sellPrice={Number(sellPrice) || 0}
              totalCost={metrics.totalCost}
              profit={metrics.profit}
              profitPct={metrics.profitPct}
              foodCostPct={metrics.foodCostPct}
              onChange={setSellPrice}
            />
          </div>
        </div>
      </div>

      <PromptDialog
        open={saveAsOpen}
        title='שמירה בשם חדש'
        description="המנה המקורית תישאר ללא שינוי, ותיווצר מנה חדשה עם השם שתבחרו."
        initialValue={`${name} (עותק)`}
        confirmLabel="שמירה"
        onConfirm={handleSaveAs}
        onCancel={() => setSaveAsOpen(false)}
      />

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
