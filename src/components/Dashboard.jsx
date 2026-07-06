import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../lib/store.jsx'
import SearchInput from './SearchInput.jsx'
import ConfirmDialog from './ConfirmDialog.jsx'
import { buildContext, computeDishMetrics, formatMoney, formatPercent } from '../lib/calc'

export default function Dashboard() {
  const { dishes, ingredients, preparedItems, dishActions, loading } = useStore()
  const [query, setQuery] = useState('')
  const [pendingDelete, setPendingDelete] = useState(null)
  const navigate = useNavigate()

  const context = useMemo(() => buildContext({ ingredients, preparedItems }), [ingredients, preparedItems])

  const filtered = useMemo(() => {
    const q = query.trim()
    return dishes
      .filter((d) => d.name.includes(q))
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
  }, [dishes, query])

  async function handleDelete(dish) {
    await dishActions.remove(dish.id)
    setPendingDelete(null)
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-brand-ink">מנות שמורות</h1>
          <p className="text-sm text-brand-ink/60">ניהול ותמחור המנות שלכם</p>
        </div>
        <div className="flex items-center gap-3">
          <SearchInput value={query} onChange={setQuery} placeholder="חיפוש מנה..." />
          <button
            onClick={() => navigate('/dish/new')}
            className="whitespace-nowrap px-4 py-2.5 rounded-xl bg-brand-pink text-white font-medium shadow-soft hover:bg-brand-pinkDark transition-colors"
          >
            + מנה חדשה
          </button>
        </div>
      </div>

      {loading && <p className="text-brand-ink/50">טוען נתונים...</p>}

      {!loading && filtered.length === 0 && (
        <div className="bg-white rounded-xl2 shadow-soft p-10 text-center text-brand-ink/50">
          {query ? 'לא נמצאו מנות התואמות לחיפוש' : 'עדיין אין מנות שמורות. צרו מנה חדשה כדי להתחיל'}
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((dish) => {
          const metrics = computeDishMetrics(dish, context)
          const foodCostColor =
            metrics.foodCostPct <= 33 ? 'text-success' : metrics.foodCostPct <= 45 ? 'text-brand-pinkDark' : 'text-danger'
          return (
            <div
              key={dish.id}
              onClick={() => navigate(`/dish/${dish.id}`)}
              className="bg-white rounded-xl2 shadow-soft p-5 cursor-pointer hover:-translate-y-0.5 hover:shadow-lg transition-all group"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-bold text-lg text-brand-ink group-hover:text-brand-pinkDark transition-colors">
                  {dish.name}
                </h3>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setPendingDelete(dish)
                  }}
                  className="text-brand-ink/30 hover:text-danger text-lg leading-none"
                  title="מחיקת מנה"
                >
                  ×
                </button>
              </div>
              <div className="mt-3 flex items-center justify-between text-sm">
                <span className="text-brand-ink/50">מחיר מכירה</span>
                <span className="font-semibold">{formatMoney(dish.sellPrice)}</span>
              </div>
              <div className="mt-1 flex items-center justify-between text-sm">
                <span className="text-brand-ink/50">עלות חומרי גלם</span>
                <span className="font-semibold">{formatMoney(metrics.totalCost)}</span>
              </div>
              <div className="mt-1 flex items-center justify-between text-sm">
                <span className="text-brand-ink/50">רווח</span>
                <span className={`font-semibold ${metrics.profit >= 0 ? 'text-success' : 'text-danger'}`}>
                  {formatMoney(metrics.profit)} ({formatPercent(metrics.profitPct)})
                </span>
              </div>
              <div className="mt-1 flex items-center justify-between text-sm">
                <span className="text-brand-ink/50">Food Cost %</span>
                <span className={`font-semibold ${foodCostColor}`}>{formatPercent(metrics.foodCostPct)}</span>
              </div>
              <div className="mt-3 text-xs text-brand-ink/40">
                עודכן: {new Date(dish.updatedAt).toLocaleDateString('he-IL')}
              </div>
            </div>
          )
        })}
      </div>

      <ConfirmDialog
        open={!!pendingDelete}
        title={`למחוק את "${pendingDelete?.name}"?`}
        description="לא ניתן לשחזר את הפעולה."
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => handleDelete(pendingDelete)}
      />
    </div>
  )
}
