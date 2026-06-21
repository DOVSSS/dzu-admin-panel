import api from './axios'
import type { Role, User } from '../types'

export const getUsers = async (): Promise<User[]> => {
  const { data } = await api.get('/users')
  return data
}

export const updateUserRole = async (id: string, role: Role): Promise<User> => {
  const { data } = await api.patch(`/users/${id}`, { role })
  return data
}

export const deleteUser = async (id: string): Promise<void> => {
  await api.delete(`/users/${id}`)
}