import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export const Layout = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const linkStyle = ({ isActive }: { isActive: boolean }): React.CSSProperties => ({
    display: 'block',
    padding: '10px 16px',
    borderRadius: 8,
    textDecoration: 'none',
    fontWeight: 500,
    background: isActive ? '#6366f1' : 'transparent',
    color: isActive ? '#fff' : '#cbd5e1',
  })

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      {/* Сайдбар */}
      <aside style={{
        width: 220,
        background: '#1e293b',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 12px',
        gap: 4,
      }}>
        <div style={{ color: '#fff', fontWeight: 700, fontSize: 18, padding: '0 8px 24px' }}>
          🛵 Admin Panel
        </div>

        <NavLink to="/dashboard" style={linkStyle}>📊 Дашборд</NavLink>
        <NavLink to="/users" style={linkStyle}>👥 Пользователи</NavLink>
        <NavLink to="/restaurants" style={linkStyle}>🍽️ Рестораны</NavLink>
        <NavLink to="/orders" style={linkStyle}>📦 Заказы</NavLink>

        <div style={{ marginTop: 'auto' }}>
          <div style={{ color: '#94a3b8', fontSize: 13, padding: '0 8px 8px' }}>
            {user?.email}
          </div>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: '10px 16px',
              background: '#ef4444',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            Выйти
          </button>
        </div>
      </aside>

      {/* Контент */}
      <main style={{ flex: 1, padding: 32, overflowY: 'auto' }}>
        <Outlet />
      </main>
    </div>
  )
}