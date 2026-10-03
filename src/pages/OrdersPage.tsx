import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { Order, OrderStatus, Restaurant } from '../types'
import { cancelOrder, getOrders, updateOrderStatus } from '../api/ordersApi'
import { getRestaurants } from '../api/restaurantsApi'
import { assetUrl } from '../config'
import {
  buildProductRestaurantMap,
  buildRestaurantNameMap,
  enrichOrdersWithRestaurants,
  getItemRestaurantLabel,
  getOrderRestaurantLabel,
} from '../utils/restaurantNames'

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string }> = {
  PENDING: { label: '🕐 Новый', color: '#f59e0b' },
  ACCEPTED: { label: '✅ Принят', color: '#3b82f6' },
  READY: { label: '📦 Готов', color: '#059669' },
  DELIVERING: { label: '🚴 В пути', color: '#8b5cf6' },
  DELIVERED: { label: '✔️ Доставлен', color: '#22c55e' },
  CANCELLED: { label: '❌ Отменён', color: '#ef4444' },
}

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  PENDING: 'ACCEPTED',
  ACCEPTED: 'READY',
}

const NEXT_LABEL: Partial<Record<OrderStatus, string>> = {
  PENDING: 'Принять заказ',
  ACCEPTED: 'Готов к выдаче',
}

const FILTER_STATUSES: { value: '' | OrderStatus; label: string }[] = [
  { value: '', label: 'Все статусы' },
  { value: 'PENDING', label: 'Новые' },
  { value: 'ACCEPTED', label: 'Принятые' },
  { value: 'READY', label: 'Готовы' },
  { value: 'DELIVERING', label: 'В пути' },
  { value: 'DELIVERED', label: 'Доставлены' },
  { value: 'CANCELLED', label: 'Отменены' },
]

const canCancel = (status: OrderStatus) =>
  ['PENDING', 'ACCEPTED', 'READY', 'DELIVERING'].includes(status)

export const OrdersPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [orders, setOrders] = useState<Order[]>([])
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const restaurantId = searchParams.get('restaurantId') ?? ''
  const statusFilter = (searchParams.get('status') ?? '') as '' | OrderStatus
  const restaurantNameById = useMemo(
    () => buildRestaurantNameMap(restaurants),
    [restaurants],
  )
  const productRestaurantMap = useMemo(
    () => buildProductRestaurantMap(restaurants),
    [restaurants],
  )

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const [restaurantList, data] = await Promise.all([
        getRestaurants(),
        getOrders({
          restaurantId: restaurantId || undefined,
          status: statusFilter || undefined,
        }),
      ])
      setRestaurants(restaurantList)
      setOrders(enrichOrdersWithRestaurants(data, restaurantList))
    } catch {
      setError('Не удалось загрузить заказы')
    } finally {
      setLoading(false)
    }
  }, [restaurantId, statusFilter])

  useEffect(() => {
    fetchOrders()
    const interval = setInterval(fetchOrders, 15000)
    return () => clearInterval(interval)
  }, [fetchOrders])

  const setFilter = (key: 'restaurantId' | 'status', value: string) => {
    const next = new URLSearchParams(searchParams)
    if (value) next.set(key, value)
    else next.delete(key)
    setSearchParams(next)
  }

  const handleNextStatus = async (order: Order) => {
    const next = NEXT_STATUS[order.status]
    if (!next) return
    try {
      setUpdatingId(order.id)
      const updated = await updateOrderStatus(order.id, next)
      setOrders(prev =>
        prev.map(o =>
          o.id === updated.id
            ? enrichOrdersWithRestaurants([updated], restaurants)[0]
            : o,
        ),
      )
    } catch {
      alert('Не удалось обновить статус')
    } finally {
      setUpdatingId(null)
    }
  }

  const handleCancel = async (order: Order) => {
    if (!window.confirm(`Отменить заказ #${order.reference}?`)) return
    try {
      setUpdatingId(order.id)
      const updated = await cancelOrder(order.id)
      setOrders(prev =>
        prev.map(o =>
          o.id === updated.id
            ? enrichOrdersWithRestaurants([updated], restaurants)[0]
            : o,
        ),
      )
    } catch {
      alert('Не удалось отменить заказ')
    } finally {
      setUpdatingId(null)
    }
  }

  if (loading && orders.length === 0) return <div>Загрузка...</div>

  return (
    <div>
      <h2 className="admin-page-title" style={{ margin: '0 0 16px', fontSize: 24 }}>📦 Заказы</h2>

      <div
        className="admin-order-filters"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 12,
          marginBottom: 20,
          alignItems: 'center',
        }}
      >
        <select
          value={restaurantId}
          onChange={e => setFilter('restaurantId', e.target.value)}
          style={filterSelectStyle}
        >
          <option value="">Все рестораны</option>
          {restaurants.map(r => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={e => setFilter('status', e.target.value)}
          style={filterSelectStyle}
        >
          {FILTER_STATUSES.map(s => (
            <option key={s.value || 'all'} value={s.value}>{s.label}</option>
          ))}
        </select>

        <button type="button" onClick={fetchOrders} style={refreshBtnStyle}>
          Обновить
        </button>

        <span style={{ fontSize: 13, color: '#64748b' }}>
          {orders.length} заказ(ов) · автообновление 15 с
        </span>
      </div>

      {error && <div style={{ color: '#ef4444', marginBottom: 16 }}>{error}</div>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {orders.map(order => {
          const cfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.PENDING
          const next = NEXT_STATUS[order.status]
          const busy = updatingId === order.id

          return (
            <div
              key={order.id}
              style={{
                background: '#fff',
                borderRadius: 12,
                padding: 20,
                boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                borderLeft: `4px solid ${cfg.color}`,
              }}
            >
              <div className="admin-order-card__header">
                <div className="admin-order-card__meta">
                  <span style={{ fontWeight: 700, fontSize: 16 }}>#{order.reference}</span>
                  <span style={{ fontSize: 13, color: '#94a3b8' }}>
                    {new Date(order.createdAt).toLocaleString('ru-RU')}
                  </span>
                </div>
                <div style={{ fontWeight: 700, fontSize: 16, color: '#6366f1' }}>
                  {order.total} ₽
                </div>
              </div>

              <div style={{ fontSize: 14, color: '#1e293b', marginBottom: 8, fontWeight: 600 }}>
                🍽️ {getOrderRestaurantLabel(order, restaurantNameById, productRestaurantMap)}
              </div>

              <div style={{ fontSize: 13, color: '#64748b', marginBottom: 8 }}>
                👤 {order.user?.name ?? 'Аноним'}
                {order.user?.phone ? ` · ${order.user.phone}` : ''}
                {order.user?.email ? ` · ${order.user.email}` : ''}
              </div>

              {(order.deliveryAddress || order.user?.address) && (
                <div style={{ fontSize: 13, color: '#64748b', marginBottom: 12 }}>
                  📍 {order.deliveryAddress || order.user?.address}
                </div>
              )}

              {order.comment && (
                <div style={{ fontSize: 13, color: '#64748b', marginBottom: 12 }}>
                  💬 {order.comment}
                </div>
              )}

              <div style={{ marginBottom: 12 }}>
                {order.items.map(item => {
                  const itemRestaurant = getItemRestaurantLabel(
                    item,
                    restaurantNameById,
                    productRestaurantMap,
                  )
                  return (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '6px 0',
                      borderBottom: '1px solid #f1f5f9',
                      fontSize: 14,
                    }}
                  >
                    <img
                      src={assetUrl(item.productImage)}
                      alt={item.productName}
                      onError={e => {
                        e.currentTarget.src = 'https://placehold.co/40x40?text=?'
                      }}
                      style={{ width: 40, height: 40, borderRadius: 6, objectFit: 'cover' }}
                    />
                    <span style={{ flex: 1 }}>{item.productName}</span>
                    {itemRestaurant && (
                      <span style={{ fontSize: 12, color: '#94a3b8' }}>
                        {itemRestaurant}
                      </span>
                    )}
                    <span style={{ color: '#94a3b8' }}>x{item.quantity}</span>
                    <span style={{ fontWeight: 600 }}>{item.price * item.quantity} ₽</span>
                  </div>
                  )
                })}
              </div>

              <div
                className="admin-order-card__status-row"
                style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}
              >
                <span
                  style={{
                    padding: '6px 12px',
                    borderRadius: 6,
                    background: cfg.color,
                    color: '#fff',
                    fontWeight: 600,
                    fontSize: 13,
                  }}
                >
                  {cfg.label}
                </span>

                {next && (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => handleNextStatus(order)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: 8,
                      border: 'none',
                      background: cfg.color,
                      color: '#fff',
                      fontWeight: 600,
                      cursor: busy ? 'wait' : 'pointer',
                      opacity: busy ? 0.7 : 1,
                    }}
                  >
                    {busy ? '…' : NEXT_LABEL[order.status]}
                  </button>
                )}

                {canCancel(order.status) && (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => handleCancel(order)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: 8,
                      border: '1px solid #fecaca',
                      background: '#fef2f2',
                      color: '#ef4444',
                      fontWeight: 600,
                      cursor: busy ? 'wait' : 'pointer',
                    }}
                  >
                    Отменить
                  </button>
                )}

                {order.status === 'READY' && (
                  <span style={{ fontSize: 13, color: '#64748b' }}>
                    Дальше заказ забирает курьер
                  </span>
                )}
              </div>
            </div>
          )
        })}

        {orders.length === 0 && !loading && (
          <div style={{ color: '#94a3b8' }}>Заказы не найдены</div>
        )}
      </div>
    </div>
  )
}

const filterSelectStyle: React.CSSProperties = {
  padding: '8px 12px',
  borderRadius: 8,
  border: '1px solid #e2e8f0',
  minWidth: 180,
  fontSize: 14,
}

const refreshBtnStyle: React.CSSProperties = {
  padding: '8px 16px',
  borderRadius: 8,
  border: '1px solid #e2e8f0',
  background: '#fff',
  cursor: 'pointer',
  fontWeight: 500,
}
