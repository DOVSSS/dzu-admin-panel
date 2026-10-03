import api from './axios'
import type { Order, OrderStatus } from '../types'

export type OrderFilters = {
  restaurantId?: string
  status?: OrderStatus | ''
}

export const getOrders = async (filters?: OrderFilters): Promise<Order[]> => {
  const params: Record<string, string> = {}
  if (filters?.restaurantId) params.restaurantId = filters.restaurantId
  if (filters?.status) params.status = filters.status
  const { data } = await api.get<Order[]>('/orders', { params })
  return data
}

export const updateOrderStatus = async (id: string, status: OrderStatus): Promise<Order> => {
  const { data } = await api.patch<Order>(`/orders/${id}`, { status })
  return data
}

export const cancelOrder = async (id: string): Promise<Order> => {
  const { data } = await api.post<Order>(`/orders/${id}/cancel`)
  return data
}
