import { useEffect, useState } from 'react'

export default function PromptDialog({ open, title, description, initialValue, confirmLabel, onConfirm, onCancel }) {
  const [value, setValue] = useState(initialValue || '')

  useEffect(() => {
    if (open) setValue(initialValue || '')
  }, [open, initialValue])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-dark/50 px-4">
      <div className="bg-white rounded-xl2 shadow-soft max-w-sm w-full p-6">
        <h3 className="text-lg font-bold text-brand-ink mb-2">{title}</h3>
        {description && <p className="text-sm text-brand-ink/70 mb-3">{description}</p>}
        <input
          autoFocus
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && value.trim()) onConfirm(value.trim())
          }}
          className="w-full rounded-lg border border-brand-pinkLight bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-pink mb-5"
        />
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg text-sm font-medium text-brand-ink/70 hover:bg-brand-cream"
          >
            ביטול
          </button>
          <button
            onClick={() => value.trim() && onConfirm(value.trim())}
            disabled={!value.trim()}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-brand-pink text-white hover:bg-brand-pinkDark disabled:opacity-40"
          >
            {confirmLabel || 'אישור'}
          </button>
        </div>
      </div>
    </div>
  )
}
