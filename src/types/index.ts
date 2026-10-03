export type Role = 'USER' | 'RESTAURANT' | 'COURIER' | 'ADMIN'

export interface User {
  id: string
  email: string
  name: string
  role: Role
  phone: string
  avatarPath: string
  createdAt: string
}

export interface Restaurant {
  id: string
  name: string
  slug: string
  image: string
  ownerId: string | null
  createdAt: string
}

export interface OrderItem {
  id: string
  productName: string
  quantity: number
  price: number
  productImage: string
  restaurantId?: string | null
  restaurantName?: string | null
}

export interface OrderRestaurant {
  id: string
  name: string
}

export type OrderStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'READY'
  | 'DELIVERING'
  | 'DELIVERED'
  | 'CANCELLED'

export interface Order {
  id: string
  reference: string
  status: OrderStatus
  total: number
  deliveryAddress: string | null
  comment?: string | null
  createdAt: string
  user: (Pick<User, 'id' | 'email' | 'name' | 'phone'> & { address?: string }) | null
  items: OrderItem[]
  restaurants?: OrderRestaurant[]
}