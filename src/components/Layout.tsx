import { useEffect, useState } from 'react'
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Layout.css'

const NAV_ITEMS = [
  { to: '/dashboard', label: '📊 Дашборд' },
  { to: '/users', label: '👥 Пользователи' },
  { to: '/restaurants', label: '🍽️ Рестораны' },
  { to: '/orders', label: '📦 Заказы' },
  { to: '/categories', label: '🏷️ Категории' },
  { to: '/settings', label: '⚙️ Настройки' },
] as const

export const Layout = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!sidebarOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [sidebarOpen])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="admin-layout">
      {sidebarOpen && (
        <button
          type="button"
          className="admin-sidebar-backdrop"
          aria-label="Закрыть меню"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`admin-sidebar${sidebarOpen ? ' admin-sidebar--open' : ''}`}>
        <div className="admin-sidebar__brand">🛵 Admin Panel</div>

        {NAV_ITEMS.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `admin-nav-link${isActive ? ' admin-nav-link--active' : ''}`
            }
            onClick={() => setSidebarOpen(false)}
          >
            {label}
          </NavLink>
        ))}

        <div className="admin-sidebar__footer">
          <div className="admin-sidebar__email">{user?.email}</div>
          <button type="button" className="admin-sidebar__logout" onClick={handleLogout}>
            Выйти
          </button>
        </div>
      </aside>

      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <header className="admin-mobile-header">
          <button
            type="button"
            className="admin-menu-btn"
            aria-label="Открыть меню"
            aria-expanded={sidebarOpen}
            onClick={() => setSidebarOpen(open => !open)}
          >
            ☰
          </button>
          <span className="admin-mobile-header__title">🛵 Admin Panel</span>
        </header>

        <main className="admin-main">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
