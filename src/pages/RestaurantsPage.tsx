import { useEffect, useState } from 'react'
import type { Restaurant } from '../types'
import { getRestaurants, deleteRestaurant } from '../api/restaurantsApi'

export const RestaurantsPage = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchRestaurants = async () => {
    try {
      setLoading(true)
      const data = await getRestaurants()
      setRestaurants(data)
    } catch {
      setError('Не удалось загрузить рестораны')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRestaurants()
  }, [])

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Удалить ресторан "${name}"?`)) return
    try {
      await deleteRestaurant(id)
      setRestaurants(prev => prev.filter(r => r.id !== id))
    } catch {
      alert('Ошибка при удалении')
    }
  }

  if (loading) return <div>Загрузка...</div>
  if (error) return <div style={{ color: '#ef4444' }}>{error}</div>

  return (
    <div>
      <h2 style={{ margin: '0 0 24px', fontSize: 24 }}>🍽️ Рестораны</h2>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: 16,
      }}>
        {restaurants.map(r => (
          <div key={r.id} style={{
            background: '#fff',
            borderRadius: 12,
            overflow: 'hidden',
            boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
          }}>
            <img
              src={`http://localhost:3000${r.image}`}
              alt={r.name}
              onError={e => (e.currentTarget.src = 'https://placehold.co/400x200?text=No+Image')}
              style={{ width: '100%', height: 160, objectFit: 'cover' }}
            />
            <div style={{ padding: 16 }}>
              <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 4 }}>{r.name}</div>
              <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 12 }}>
                slug: {r.slug}
              </div>
              <div style={{ fontSize: 13, color: '#64748b', marginBottom: 12 }}>
                Владелец ID: {r.ownerId ?? '—'}
              </div>
              <button
                onClick={() => handleDelete(r.id, r.name)}
                style={{
                  width: '100%',
                  padding: '8px',
                  background: '#fef2f2',
                  color: '#ef4444',
                  border: '1px solid #fecaca',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontWeight: 500,
                }}
              >
                Удалить ресторан
              </button>
            </div>
          </div>
        ))}

        {restaurants.length === 0 && (
          <div style={{ color: '#94a3b8', gridColumn: '1/-1' }}>
            Рестораны не найдены
          </div>
        )}
      </div>
    </div>
  )
}