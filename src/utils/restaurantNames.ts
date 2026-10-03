import type { Order, OrderItem, Restaurant } from '../types'

const CUID_LIKE = /^c[a-z0-9]{20,}$/i

export const isLikelyRestaurantId = (value: string): boolean =>
  CUID_LIKE.test(value)

export const buildRestaurantNameMap = (
  restaurants: Restaurant[],
): Map<string, string> =>
  new Map(restaurants.map(r => [r.id, r.name.trim()]))

export type ProductRestaurantRef = {
  restaurantId: string
  restaurantName: string
}

/** productId → restaurant (from GET /restaurants with nested products) */
export const buildProductRestaurantMap = (
  restaurants: Restaurant[],
): Map<string, ProductRestaurantRef> => {
  const map = new Map<string, ProductRestaurantRef>()
  for (const restaurant of restaurants) {
    const restaurantName = restaurant.name.trim()
    for (const product of restaurant.products ?? []) {
      map.set(product.id, { restaurantId: restaurant.id, restaurantName })
    }
  }
  return map
}

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
      return restaurantName.trim()
    }
  }
  return null
}

export const getItemRestaurantLabel = (
  item: OrderItem,
  nameById: Map<string, string>,
  byProductId: Map<string, ProductRestaurantRef>,
): string | null => {
  if (item.productId) {
    const fromProduct = byProductId.get(item.productId)
    if (fromProduct) return fromProduct.restaurantName
  }
  return resolveRestaurantName(item.restaurantId, item.restaurantName, nameById)
}

export const getOrderRestaurantLabel = (
  order: Order,
  nameById: Map<string, string>,
  byProductId: Map<string, ProductRestaurantRef>,
): string => {
  const names = new Set<string>()

  order.restaurants?.forEach(r => {
    const name = (nameById.get(r.id) ?? r.name)?.trim()
    if (name && !isLikelyRestaurantId(name)) names.add(name)
  })

  order.items.forEach(item => {
    const name = getItemRestaurantLabel(item, nameById, byProductId)
    if (name) names.add(name)
  })

  return names.size > 0 ? [...names].join(', ') : '—'
}

export const enrichOrdersWithRestaurants = (
  orders: Order[],
  restaurants: Restaurant[],
): Order[] => {
  const nameById = buildRestaurantNameMap(restaurants)
  const byProductId = buildProductRestaurantMap(restaurants)

  return orders.map(order => {
    const items = order.items.map(item => {
      const label = getItemRestaurantLabel(item, nameById, byProductId)
      const fromProduct = item.productId ? byProductId.get(item.productId) : undefined
      return {
        ...item,
        restaurantId: item.restaurantId ?? fromProduct?.restaurantId ?? null,
        restaurantName: label,
      }
    })

    const restaurantIds = new Set<string>()
    items.forEach(item => {
      if (item.restaurantId) restaurantIds.add(item.restaurantId)
    })

    const restaurantsOnOrder = [...restaurantIds]
      .map(id => {
        const name = nameById.get(id)
        return name ? { id, name } : null
      })
      .filter((r): r is { id: string; name: string } => r !== null)

    return { ...order, items, restaurants: restaurantsOnOrder }
  })
}
