import api from './axios'
import type { Role, User } from '../types'

type UserListItem = User & { orders?: unknown[] }

const fetchUserRole = async (id: string): Promise<Role> => {
  const { data } = await api.get<{ role: Role }>(`/users/${id}`)
  return data.role
}

const withRolesFromApi = async (users: UserListItem[]): Promise<User[]> => {
  if (users.length === 0) return users
  if (users.every(u => u.role != null)) return users

  return Promise.all(
    users.map(async (user) => {
      if (user.role != null) return user
      const role = await fetchUserRole(user.id)
      return { ...user, role }
    }),
  )
}

export const getUsers = async (): Promise<User[]> => {
  const { data } = await api.get<UserListItem[]>('/users')
  return withRolesFromApi(data)
}

export const updateUserRole = async (id: string, role: Role): Promise<User> => {
  const { data } = await api.patch<UserListItem>(`/users/${id}`, { role })
  if (data.role != null) return data as User
  return { ...data, role }
}

export const deleteUser = async (id: string): Promise<void> => {
  await api.delete(`/users/${id}`)
}
