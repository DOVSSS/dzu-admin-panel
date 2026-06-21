import { useEffect, useState } from 'react'
import { getUsers } from '../api/usersApi'
import { getRestaurants } from '../api/restaurantsApi'
import { getOrders } from '../api/ordersApi'

export const DashboardPage = () => {
  const [stats, setStats] = useState({
    users: 0,
    restaurants: 0,
    orders: 0,
    revenue: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [users, restaurants, orders] = await Promise.all([
          getUsers(),
          getRestaurants(),
          getOrders(),
        ])
        setStats({
          users: users.length,
          restaurants: restaurants.length,
          orders: orders.length,
          revenue: orders.reduce((sum, o) => sum + o.total, 0),
        })
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (loading) return <div>Загрузка...</div>

  const cards = [
    { label: 'Пользователи', value: stats.users, icon: '👥', color: '#6366f1' },
    { label: 'Рестораны', value: stats.restaurants, icon: '🍽️', color: '#f59e0b' },
    { label: 'Заказы', value: stats.orders, icon: '📦', color: '#3b82f6' },
    { label: 'Выручка', value: `${stats.revenue} ₽`, icon: '💰', color: '#22c55e' },
  ]

  return (
    <div>
      <h2 style={{ margin: '0 0 24px', fontSize: 24 }}>📊 Дашборд</h2>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: 16,
      }}>
        {cards.map(card => (
          <div key={card.label} style={{
            background: '#fff',
            borderRadius: 12,
            padding: 24,
            boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
            borderLeft: `4px solid ${card.color}`,
          }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>{card.icon}</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: card.color }}>
              {card.value}
            </div>
            <div style={{ fontSize: 14, color: '#64748b', marginTop: 4 }}>
              {card.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}