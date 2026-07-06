import { formatMoney, formatPercent } from '../lib/calc'

export default function PriceSlider({ sellPrice, totalCost, profit, profitPct, foodCostPct, onChange }) {
  const maxPrice = Math.max(totalCost * 3, sellPrice * 1.5, 50)

  const profitColor = profit >= 0 ? 'text-success' : 'text-danger'
  const foodCostColor = foodCostPct <= 33 ? 'text-success' : foodCostPct <= 45 ? 'text-brand-pinkDark' : 'text-danger'

  return (
    <div className="bg-white rounded-xl2 shadow-soft p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-brand-ink">מחיר מכירה</h3>
        <span className="text-2xl font-extrabold text-brand-pinkDark">{formatMoney(sellPrice)}</span>
      </div>
      <input
        type="range"
        className="brand-slider w-full"
        min={0}
        max={maxPrice}
        step={0.5}
        value={sellPrice}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <div className="flex items-center justify-between mt-2 text-xs text-brand-ink/50">
        <span>₪0</span>
        <span>{formatMoney(maxPrice)}</span>
      </div>
      <input
        type="number"
        step="0.5"
        min="0"
        value={sellPrice}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-3 w-full rounded-lg border border-brand-pinkLight bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-pink"
      />

      <div className="grid grid-cols-3 gap-3 mt-5 text-center">
        <div className="rounded-xl bg-brand-cream p-3">
          <div className="text-xs text-brand-ink/50 mb-1">עלות חומרי גלם</div>
          <div className="font-bold text-brand-ink">{formatMoney(totalCost)}</div>
        </div>
        <div className="rounded-xl bg-brand-cream p-3">
          <div className="text-xs text-brand-ink/50 mb-1">רווח בש"ח</div>
          <div className={`font-bold ${profitColor}`}>{formatMoney(profit)}</div>
        </div>
        <div className="rounded-xl bg-brand-cream p-3">
          <div className="text-xs text-brand-ink/50 mb-1">רווח באחוזים</div>
          <div className={`font-bold ${profitColor}`}>{formatPercent(profitPct)}</div>
        </div>
      </div>
      <div className="mt-3 rounded-xl bg-brand-cream p-3 flex items-center justify-between">
        <span className="text-xs text-brand-ink/50">Food Cost %</span>
        <span className={`font-bold ${foodCostColor}`}>{formatPercent(foodCostPct)}</span>
      </div>
    </div>
  )
}
