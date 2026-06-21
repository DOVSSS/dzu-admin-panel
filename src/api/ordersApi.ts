import api from './axios'
import type { Order } from '../types'

export const getOrders = async (): Promise<Order[]> => {
  const { data } = await api.get('/orders')
  return data
}

export const updateOrderStatus = async (id: string, status: string): Promise<Order> => {
  const { data } = await api.patch(`/orders/${id}`, { status })
  return data
}