import { useEffect, useState } from 'react'
import type { User, Role } from '../types'
import { getUsers, updateUserRole, deleteUser } from '../api/usersApi'

const ROLES: Role[] = ['USER', 'RESTAURANT', 'COURIER', 'ADMIN']

const roleColors: Record<Role, string> = {
  USER: '#64748b',
  RESTAURANT: '#f59e0b',
  COURIER: '#3b82f6',
  ADMIN: '#ef4444',
}

export const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const data = await getUsers()
      setUsers(data)
    } catch {
      setError('Не удалось загрузить пользователей')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleRoleChange = async (id: string, role: Role) => {
    try {
      await updateUserRole(id, role)
      setUsers(prev => prev.map(u => u.id === id ? { ...u, role } : u))
    } catch {
      alert('Ошибка при смене роли')
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Удалить пользователя ${name}?`)) return
    try {
      await deleteUser(id)
      setUsers(prev => prev.filter(u => u.id !== id))
    } catch {
      alert('Ошибка при удалении')
    }
  }

  if (loading) return <div>Загрузка...</div>
  if (error) return <div style={{ color: '#ef4444' }}>{error}</div>

  return (
    <div>
      <h2 style={{ margin: '0 0 24px', fontSize: 24 }}>👥 Пользователи</h2>

      <div style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <th style={th}>Имя</th>
              <th style={th}>Email</th>
              <th style={th}>Телефон</th>
              <th style={th}>Роль</th>
              <th style={th}>Действия</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={td}>{user.name}</td>
                <td style={td}>{user.email}</td>
                <td style={td}>{user.phone || '—'}</td>
                <td style={td}>
                 <select
  value={user.role}
  onChange={e => handleRoleChange(user.id, e.target.value as Role)}
  style={{
    padding: '4px 24px 4px 8px',
    borderRadius: 6,
    border: '1px solid #e2e8f0',
    background: roleColors[user.role],
    color: '#fff',
    fontWeight: 600,
    cursor: 'pointer',
    appearance: 'none',
    WebkitAppearance: 'none',
    MozAppearance: 'none',
    backgroundImage:
      'url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2710%27 height=%276%27 viewBox=%270 0 10 6%27%3E%3Cpath d=%27M1 1l4 4 4-4%27 stroke=%27white%27 stroke-width=%271.5%27 fill=%27none%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27/%3E%3C/svg%3E")',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 8px center',
  }}
>
  {ROLES.map(r => (
    <option
      key={r}
      value={r}
      style={{ color: '#1e293b', background: '#fff', fontWeight: 500 }}
    >
      {r}
    </option>
  ))}
</select>
                </td>
                <td style={td}>
                  <button
                    onClick={() => handleDelete(user.id, user.name)}
                    style={{
                      padding: '6px 12px',
                      background: '#fef2f2',
                      color: '#ef4444',
                      border: '1px solid #fecaca',
                      borderRadius: 6,
                      cursor: 'pointer',
                      fontWeight: 500,
                    }}
                  >
                    Удалить
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const th: React.CSSProperties = {
  padding: '12px 16px',
  textAlign: 'left',
  fontWeight: 600,
  fontSize: 13,
  color: '#64748b',
}

const td: React.CSSProperties = {
  padding: '12px 16px',
  fontSize: 14,
  color: '#1e293b',
}