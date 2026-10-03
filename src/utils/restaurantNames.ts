import type { Order, OrderItem, Restaurant } from '../types'

const CUID_LIKE = /^c[a-z0-9]{20,}$/i

export const isLikelyRestaurantId = (value: string): boolean =>
  CUID_LIKE.test(value)

export const buildRestaurantNameMap = (
  restaurants: Restaurant[],
): Map<string, string> => new Map(restaurants.map(r => [r.id, r.name]))

export const resolveRestaurantName = (
  restaurantId: string | null | undefined,
  restaurantName: string | null | undefined,
  nameById: Map<string, string>,
): string | null => {
  if (restaurantId && nameById.has(restaurantId)) {
    return nameById.get(restaurantId)!
  }
  if (restaurantName) {
    if (nameById.has(restaurantName)) {
      return nameById.get(restaurantName)!
    }
    if (!isLikelyRestaurantId(restaurantName)) {
      return restaurantName
    }
  }
  return null
}

export const getOrderRestaurantLabel = (
  order: Order,
  nameById: Map<string, string>,
): string => {
  const names = new Set<string>()

  order.restaurants?.forEach(r => {
    const name = nameById.get(r.id) ?? r.name
    if (name && !isLikelyRestaurantId(name)) names.add(name)
  })

  order.items.forEach(item => {
    const name = resolveRestaurantName(item.restaurantId, item.restaurantName, nameById)
    if (name) names.add(name)
  })

  return names.size > 0 ? [...names].join(', ') : '—'
}

export const getItemRestaurantLabel = (
  item: OrderItem,
  nameById: Map<string, string>,
): string | null =>
  resolveRestaurantName(item.restaurantId, item.restaurantName, nameById)
