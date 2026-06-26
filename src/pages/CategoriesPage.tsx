import { useState, useEffect } from 'react'
import api from '../api/axios'

interface Category {
  id: string
  name: string
  emoji: string
  slug: string
  _count?: { products: number }
}

export const CategoriesPage = () => {
  const [categories, setCategories] = useState<Category[]>([])
  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchCategories = async () => {
    const res = await api.get('/categories')
    setCategories(res.data)
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const handleCreate = async () => {
    if (!name) return setError('Введите название')
    try {
      setIsLoading(true)
      setError(null)
      await api.post('/categories', { name, emoji: emoji || '🍽️' })
      setName('')
      setEmoji('')
      await fetchCategories()
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Ошибка')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить категорию?')) return
    await api.delete(`/categories/${id}`)
    await fetchCategories()
  }

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>Категории</h1>

      {/* Форма создания */}
      <div style={{
        background: '#fff',
        borderRadius: 12,
        padding: 24,
        marginBottom: 24,
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Добавить категорию</h2>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <input
            placeholder="Название (например: Пицца)"
            value={name}
            onChange={e => setName(e.target.value)}
            style={{
              flex: 1, minWidth: 200,
              padding: '10px 12px',
              border: '1px solid #e2e8f0',
              borderRadius: 8,
              fontSize: 14,
            }}
          />
          <input
            placeholder="Эмодзи (например: 🍕)"
            value={emoji}
            onChange={e => setEmoji(e.target.value)}
            style={{
              width: 160,
              padding: '10px 12px',
              border: '1px solid #e2e8f0',
              borderRadius: 8,
              fontSize: 14,
            }}
          />
          <button
            onClick={handleCreate}
            disabled={isLoading}
            style={{
              padding: '10px 20px',
              background: '#6366f1',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              fontWeight: 500,
              opacity: isLoading ? 0.6 : 1,
            }}
          >
            Добавить
          </button>
        </div>
        {error && <p style={{ color: '#ef4444', marginTop: 8, fontSize: 14 }}>{error}</p>}
      </div>

      {/* Список категорий */}
      <div style={{
        background: '#fff',
        borderRadius: 12,
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        overflow: 'hidden',
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, color: '#64748b' }}>Эмодзи</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, color: '#64748b' }}>Название</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, color: '#64748b' }}>Slug</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, color: '#64748b' }}>Товаров</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, color: '#64748b' }}>Действия</th>
            </tr>
          </thead>
          <tbody>
            {categories.map(cat => (
              <tr key={cat.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '12px 16px', fontSize: 20 }}>{cat.emoji}</td>
                <td style={{ padding: '12px 16px', fontWeight: 500 }}>{cat.name}</td>
                <td style={{ padding: '12px 16px', color: '#64748b', fontSize: 13 }}>{cat.slug}</td>
                <td style={{ padding: '12px 16px', color: '#64748b' }}>{cat._count?.products ?? 0}</td>
                <td style={{ padding: '12px 16px' }}>
                  <button
                    onClick={() => handleDelete(cat.id)}
                    style={{
                      padding: '6px 12px',
                      background: '#fee2e2',
                      color: '#ef4444',
                      border: 'none',
                      borderRadius: 6,
                      cursor: 'pointer',
                      fontSize: 13,
                    }}
                  >
                    Удалить
                  </button>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: 32, textAlign: 'center', color: '#94a3b8' }}>
                  Категорий пока нет
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}