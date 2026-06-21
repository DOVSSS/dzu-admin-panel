import api from './axios'
import type { Restaurant } from '../types'

export const getRestaurants = async (): Promise<Restaurant[]> => {
  const { data } = await api.get('/restaurants')
  return data
}

export const deleteRestaurant = async (id: string): Promise<void> => {
  await api.delete(`/restaurants/${id}`)
}