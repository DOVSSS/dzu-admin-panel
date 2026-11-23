import { useCallback, useEffect, useState } from 'react'
import {
  getDebts,
  getRevenue,
  settleCourier,
  type CourierDebt,
  type RevenueSettlement,
} from '../api/revenueApi'

function todayIso() {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}

function localDayBound(date: string, end: boolean) {
  const [year, month, day] = date.split('-').map(Number)
  const bound = end
    ? new Date(year, month - 1, day, 23, 59, 59, 999)
    : new Date(year, month - 1, day, 0, 0, 0, 0)
  return bound.toISOString()
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export const RevenuePage = () => {
  const [from, setFrom] = useState(todayIso())
  const [to, setTo] = useState(todayIso())
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [settlements, setSettlements] = useState<RevenueSettlement[]>([])
  const [debts, setDebts] = useState<CourierDebt[]>([])
  const [loading, setLoading] = useState(true)
  const [settlingId, setSettlingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setError(null)
      const [revenue, debtList] = await Promise.all([
        getRevenue(
          from ? localDayBound(from, false) : undefined,
          to ? localDayBound(to, true) : undefined,
        ),
        getDebts(),
      ])
      setTotalRevenue(revenue.totalRevenue)
      setSettlements(revenue.settlements)
      setDebts(debtList)
    } catch {
      setError('Не удалось загрузить выручку')
    } finally {
      setLoading(false)
    }
  }, [from, to])

  useEffect(() => {
    setLoading(true)
    load()
  }, [load])

  const handleSettle = async (courierId: string) => {
    try {
      setSettlingId(courierId)
      setError(null)
      await settleCourier(courierId)
      await load()
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Не удалось подтвердить сдачу')
    } finally {
      setSettlingId(null)
    }
  }

  if (loading) return <div>Загрузка...</div>

  return (
    <div>
      <h2 className="admin-page-title" style={{ margin: '0 0 24px', fontSize: 24 }}>
        Выручка
      </h2>

      {error && (
        <div style={{
          marginBottom: 16,
          padding: '12px 16px',
          background: '#fef2f2',
          color: '#b91c1c',
          borderRadius: 8,
        }}>
          {error}
        </div>
      )}

      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 12,
        alignItems: 'flex-end',
        marginBottom: 24,
      }}>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 14 }}>
          С
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid #cbd5e1' }}
          />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 14 }}>
          По
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid #cbd5e1' }}
          />
        </label>
      </div>

      <div style={{
        background: '#fff',
        borderRadius: 12,
        padding: 24,
        marginBottom: 24,
        boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
        borderLeft: '4px solid #22c55e',
      }}>
        <div style={{ fontSize: 14, color: '#64748b', marginBottom: 4 }}>
          Выручка за период (сервисный сбор)
        </div>
        <div style={{ fontSize: 32, fontWeight: 700, color: '#22c55e' }}>
          {totalRevenue} ₽
        </div>
      </div>

      <section style={{ marginBottom: 32 }}>
        <h3 style={{ margin: '0 0 12px', fontSize: 18 }}>К сдаче</h3>
        {debts.length === 0 ? (
          <div style={{ color: '#64748b' }}>Нет несданного сервисного сбора</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 12 }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: 12 }}>Курьер</th>
                  <th style={{ padding: 12 }}>Заказов</th>
                  <th style={{ padding: 12 }}>Долг</th>
                  <th style={{ padding: 12 }} />
                </tr>
              </thead>
              <tbody>
                {debts.map((d) => (
                  <tr key={d.courierId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: 12 }}>
                      <div style={{ fontWeight: 600 }}>{d.name}</div>
                      <div style={{ fontSize: 13, color: '#64748b' }}>{d.email}</div>
                    </td>
                    <td style={{ padding: 12 }}>{d.orderCount}</td>
                    <td style={{ padding: 12, fontWeight: 700 }}>{d.owed} ₽</td>
                    <td style={{ padding: 12, textAlign: 'right' }}>
                      <button
                        type="button"
                        disabled={settlingId === d.courierId}
                        onClick={() => handleSettle(d.courierId)}
                        style={{
                          background: '#22c55e',
                          color: '#fff',
                          border: 'none',
                          borderRadius: 8,
                          padding: '8px 16px',
                          cursor: settlingId === d.courierId ? 'wait' : 'pointer',
                          opacity: settlingId === d.courierId ? 0.7 : 1,
                          fontWeight: 600,
                        }}
                      >
                        {settlingId === d.courierId ? '...' : 'Сдал'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section>
        <h3 style={{ margin: '0 0 12px', fontSize: 18 }}>Сдачи за период</h3>
        {settlements.length === 0 ? (
          <div style={{ color: '#64748b' }}>За выбранные даты сдач нет</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 12 }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: 12 }}>Дата</th>
                  <th style={{ padding: 12 }}>Курьер</th>
                  <th style={{ padding: 12 }}>Заказов</th>
                  <th style={{ padding: 12 }}>Сумма</th>
                </tr>
              </thead>
              <tbody>
                {settlements.map((s) => (
                  <tr key={s.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: 12 }}>{formatDateTime(s.createdAt)}</td>
                    <td style={{ padding: 12 }}>
                      <div style={{ fontWeight: 600 }}>{s.courierName}</div>
                      <div style={{ fontSize: 13, color: '#64748b' }}>{s.courierEmail}</div>
                    </td>
                    <td style={{ padding: 12 }}>{s.orderCount}</td>
                    <td style={{ padding: 12, fontWeight: 700, color: '#16a34a' }}>{s.amount} ₽</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
