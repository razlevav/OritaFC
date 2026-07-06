export default function ConfirmDialog({ open, title, description, confirmLabel, onConfirm, onCancel }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-dark/50 px-4">
      <div className="bg-white rounded-xl2 shadow-soft max-w-sm w-full p-6">
        <h3 className="text-lg font-bold text-brand-ink mb-2">{title}</h3>
        {description && <p className="text-sm text-brand-ink/70 mb-5">{description}</p>}
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg text-sm font-medium text-brand-ink/70 hover:bg-brand-cream"
          >
            ביטול
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-danger text-white hover:opacity-90"
          >
            {confirmLabel || 'מחיקה'}
          </button>
        </div>
      </div>
    </div>
  )
}
