import api from './axios'

export type CourierDebt = {
  courierId: string
  name: string
  email: string
  owed: number
  orderCount: number
}

export type RevenueSettlement = {
  id: string
  amount: number
  createdAt: string
  courierId: string
  courierName: string
  courierEmail: string
  orderCount: number
}

export type RevenueResponse = {
  totalRevenue: number
  settlements: RevenueSettlement[]
}

export async function getDebts(): Promise<CourierDebt[]> {
  const { data } = await api.get('/revenue/debts')
  return data
}

export async function settleCourier(courierId: string) {
  const { data } = await api.post(`/revenue/settle/${courierId}`)
  return data
}

export async function getRevenue(from?: string, to?: string): Promise<RevenueResponse> {
  const { data } = await api.get('/revenue', {
    params: {
      ...(from ? { from } : {}),
      ...(to ? { to } : {}),
    },
  })
  return data
}
