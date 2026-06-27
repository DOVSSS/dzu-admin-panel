import { useState, useEffect } from 'react'
import api from '../api/axios'

interface Settings {
  deliveryFee: number
  serviceFee: number
}

export const SettingsPage = () => {
  const [settings, setSettings] = useState<Settings>({ deliveryFee: 150, serviceFee: 50 })
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setIsLoading(true)
    api.get('/settings')
      .then(res => setSettings(res.data))
      .catch(() => setError('Не удалось загрузить настройки'))
      .finally(() => setIsLoading(false))
  }, [])

  const handleSave = async () => {
    try {
      setIsSaving(true)
      setError(null)
      setSuccess(false)
      await api.patch('/settings', settings)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Ошибка сохранения')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) return <div style={{ padding: 32 }}>Загрузка...</div>

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>Настройки</h1>

      <div style={{
        background: '#fff',
        borderRadius: 12,
        padding: 24,
        maxWidth: 480,
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>Стоимость доставки и сборов</h2>

        <label style={labelStyle}>
          Стоимость доставки (₽)
          <input
            type="number"
            min={0}
            value={settings.deliveryFee}
            onChange={e => setSettings(prev => ({ ...prev, deliveryFee: Number(e.target.value) }))}
            style={inputStyle}
          />
        </label>

        <label style={labelStyle}>
          Сервисный сбор (₽)
          <input
            type="number"
            min={0}
            value={settings.serviceFee}
            onChange={e => setSettings(prev => ({ ...prev, serviceFee: Number(e.target.value) }))}
            style={inputStyle}
          />
        </label>

        <div style={{ marginTop: 8, padding: 12, background: '#f8fafc', borderRadius: 8, fontSize: 13, color: '#64748b' }}>
          Итого к оплате = сумма блюд + {settings.deliveryFee} ₽ (доставка) + {settings.serviceFee} ₽ (сервис)
        </div>

        {error && <p style={{ color: '#ef4444', marginTop: 12, fontSize: 14 }}>{error}</p>}
        {success && <p style={{ color: '#22c55e', marginTop: 12, fontSize: 14 }}>✅ Сохранено!</p>}

        <button
          onClick={handleSave}
          disabled={isSaving}
          style={{
            marginTop: 20,
            padding: '10px 24px',
            background: '#6366f1',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            cursor: 'pointer',
            fontWeight: 500,
            fontSize: 14,
            opacity: isSaving ? 0.6 : 1,
          }}
        >
          {isSaving ? 'Сохранение...' : 'Сохранить'}
        </button>
      </div>
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
  fontSize: 14,
  fontWeight: 500,
  color: '#374151',
  marginBottom: 16,
}

const inputStyle: React.CSSProperties = {
  padding: '10px 12px',
  border: '1px solid #e2e8f0',
  borderRadius: 8,
  fontSize: 16,
  outline: 'none',
}