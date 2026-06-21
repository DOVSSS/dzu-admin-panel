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
}

export interface Order {
  id: string
  reference: string
  status: string
  total: number
  deliveryAddress: string | null
  createdAt: string
  user: Pick<User, 'id' | 'email' | 'name'> | null
  items: OrderItem[]
}