export interface PaymentMethod {
  id: number
  name: string
  isGlobal: boolean
}

export interface PaymentMethodCreatePayload {
  name: string
}
