export interface PaymentMethod {
  id: number
  name: string
  isGlobal: boolean
  description?: string
}

export interface PaymentMethodCreatePayload {
  name: string
}
