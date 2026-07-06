import { NavLink, Outlet } from 'react-router-dom'

const navItems = [
  { to: '/', label: 'מנות', end: true },
  { to: '/ingredients', label: 'מרכיבי גלם' },
  { to: '/prepared-items', label: 'רטבים ופריטים מוכנים' },
]

export default function Layout() {
  return (
    <div className="min-h-full flex flex-col">
      <header className="bg-brand-dark text-white sticky top-0 z-20 shadow-soft">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-4">
          <img
            src="/branding/orita-mark.png"
            alt="ORITA"
            className="h-11 w-11 rounded-full object-cover border-2 border-brand-pink/60"
          />
          <div className="flex flex-col leading-tight">
            <span className="font-bold text-lg tracking-wide">ORITA</span>
            <span className="text-xs text-brand-pinkLight/80">מערכת תמחור מנות</span>
          </div>
          <nav className="me-auto flex items-center gap-1 sm:gap-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg text-sm sm:text-base font-medium transition-colors ${
                    isActive
                      ? 'bg-brand-pink text-white'
                      : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6">
        <Outlet />
      </main>
      <footer className="text-center text-xs text-brand-ink/50 py-4">
        ORITA · מערכת תמחור פנימית · הנתונים נשמרים מקומית במחשב
      </footer>
    </div>
  )
}
