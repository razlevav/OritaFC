export default function SearchInput({ value, onChange, placeholder }) {
  return (
    <div className="relative w-full sm:w-72">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || 'חיפוש...'}
        className="w-full rounded-xl border border-brand-pinkLight bg-white px-4 py-2.5 pe-10 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-pink"
      />
      <span className="absolute inset-y-0 end-3 flex items-center text-brand-ink/40">
        ⌕
      </span>
    </div>
  )
}
