import { useEffect, useState } from 'react'
import type { Order } from '../types'
import { getOrders, updateOrderStatus } from '../api/ordersApi'

const STATUSES = ['PENDING', 'PREPARING', 'ON_THE_WAY', 'DELIVERED', 'CANCELLED']

const statusColors: Record<string, string> = {
  PENDING: '#f59e0b',
  PREPARING: '#3b82f6',
  ON_THE_WAY: '#8b5cf6',
  DELIVERED: '#22c55e',
  CANCELLED: '#ef4444',
}

export const OrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const data = await getOrders()
      setOrders(data)
    } catch {
      setError('Не удалось загрузить заказы')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await updateOrderStatus(id, status)
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o))
    } catch {
      alert('Ошибка при смене статуса')
    }
  }

  if (loading) return <div>Загрузка...</div>
  if (error) return <div style={{ color: '#ef4444' }}>{error}</div>

  return (
    <div>
      <h2 style={{ margin: '0 0 24px', fontSize: 24 }}>📦 Заказы</h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {orders.map(order => (
          <div key={order.id} style={{
            background: '#fff',
            borderRadius: 12,
            padding: 20,
            boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
          }}>
            {/* Шапка заказа */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div>
                <span style={{ fontWeight: 700, fontSize: 16 }}>#{order.reference}</span>
                <span style={{ marginLeft: 12, fontSize: 13, color: '#94a3b8' }}>
                  {new Date(order.createdAt).toLocaleString('ru-RU')}
                </span>
              </div>
              <div style={{ fontWeight: 700, fontSize: 16, color: '#6366f1' }}>
                {order.total} ₽
              </div>
            </div>

            {/* Клиент */}
            <div style={{ fontSize: 13, color: '#64748b', marginBottom: 12 }}>
              👤 {order.user?.name ?? 'Аноним'} — {order.user?.email ?? '—'}
            </div>

            {/* Товары */}
            <div style={{ marginBottom: 12 }}>
              {order.items.map(item => (
                <div key={item.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '6px 0',
                  borderBottom: '1px solid #f1f5f9',
                  fontSize: 14,
                }}>
                  <img
                    src={`http://localhost:3000${item.productImage}`}
                    alt={item.productName}
                    onError={e => (e.currentTarget.src = 'https://placehold.co/40x40?text=?')}
                    style={{ width: 40, height: 40, borderRadius: 6, objectFit: 'cover' }}
                  />
                  <span style={{ flex: 1 }}>{item.productName}</span>
                  <span style={{ color: '#94a3b8' }}>x{item.quantity}</span>
                  <span style={{ fontWeight: 600 }}>{item.price} ₽</span>
                </div>
              ))}
            </div>

            {/* Статус */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 13, color: '#64748b' }}>Статус:</span>
              <select
                value={order.status}
                onChange={e => handleStatusChange(order.id, e.target.value)}
                style={{
                  padding: '6px 10px',
                  borderRadius: 6,
                  border: '1px solid #e2e8f0',
                  background: statusColors[order.status] ?? '#64748b',
                  color: '#fff',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {STATUSES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>

              {order.deliveryAddress && (
                <span style={{ fontSize: 13, color: '#64748b' }}>
                  📍 {order.deliveryAddress}
                </span>
              )}
            </div>
          </div>
        ))}

        {orders.length === 0 && (
          <div style={{ color: '#94a3b8' }}>Заказы не найдены</div>
        )}
      </div>
    </div>
  )
}