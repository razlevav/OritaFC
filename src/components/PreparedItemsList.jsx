import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../lib/store.jsx'
import SearchInput from './SearchInput.jsx'
import ConfirmDialog from './ConfirmDialog.jsx'
import { buildContext, computePreparedItemCost, formatMoney } from '../lib/calc'

export default function PreparedItemsList() {
  const { preparedItems, ingredients, preparedItemActions, loading } = useStore()
  const [query, setQuery] = useState('')
  const [pendingDelete, setPendingDelete] = useState(null)
  const navigate = useNavigate()

  const context = useMemo(() => buildContext({ ingredients, preparedItems }), [ingredients, preparedItems])

  const filtered = useMemo(() => {
    const q = query.trim()
    return [...preparedItems]
      .filter((p) => p.name.includes(q))
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
  }, [preparedItems, query])

  async function handleDelete(item) {
    await preparedItemActions.remove(item.id)
    setPendingDelete(null)
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-brand-ink">רטבים ופריטים מוכנים</h1>
          <p className="text-sm text-brand-ink/60">
            פריט מוכן מחושב כמו מנה, ולאחר שמירה זמין לבחירה כמרכיב בתוך מנות אחרות
          </p>
        </div>
        <div className="flex items-center gap-3">
          <SearchInput value={query} onChange={setQuery} placeholder="חיפוש פריט..." />
          <button
            onClick={() => navigate('/prepared-items/new')}
            className="whitespace-nowrap px-4 py-2.5 rounded-xl bg-brand-pink text-white font-medium shadow-soft hover:bg-brand-pinkDark transition-colors"
          >
            + פריט חדש
          </button>
        </div>
      </div>

      {loading && <p className="text-brand-ink/50">טוען נתונים...</p>}

      {!loading && filtered.length === 0 && (
        <div className="bg-white rounded-xl2 shadow-soft p-10 text-center text-brand-ink/50">
          {query ? 'לא נמצאו פריטים התואמים לחיפוש' : 'עדיין אין פריטים מוכנים. צרו פריט חדש כדי להתחיל'}
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((item) => {
          const { totalCost, baseUnitCost } = computePreparedItemCost(item, context)
          return (
            <div
              key={item.id}
              onClick={() => navigate(`/prepared-items/${item.id}`)}
              className="bg-white rounded-xl2 shadow-soft p-5 cursor-pointer hover:-translate-y-0.5 hover:shadow-lg transition-all group"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-bold text-lg text-brand-ink group-hover:text-brand-pinkDark transition-colors">
                  {item.name}
                </h3>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setPendingDelete(item)
                  }}
                  className="text-brand-ink/30 hover:text-danger text-lg leading-none"
                  title="מחיקה"
                >
                  ×
                </button>
              </div>
              <div className="mt-3 flex items-center justify-between text-sm">
                <span className="text-brand-ink/50">תפוקה</span>
                <span className="font-semibold">
                  {item.yieldQuantity} {item.yieldUnit}
                </span>
              </div>
              <div className="mt-1 flex items-center justify-between text-sm">
                <span className="text-brand-ink/50">עלות כוללת</span>
                <span className="font-semibold">{formatMoney(totalCost)}</span>
              </div>
              <div className="mt-1 flex items-center justify-between text-sm">
                <span className="text-brand-ink/50">עלות ליחידה</span>
                <span className="font-semibold text-brand-pinkDark">
                  {formatMoney(baseUnitCost)} / {item.yieldUnit}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      <ConfirmDialog
        open={!!pendingDelete}
        title={`למחוק את "${pendingDelete?.name}"?`}
        description="מנות שמשתמשות בפריט זה יראו אותו כחסר עד להסרתו מהמתכון."
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => handleDelete(pendingDelete)}
      />
    </div>
  )
}
