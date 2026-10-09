import { createContext } from 'react'

export type CartProduct = {
  id: string
  slug?: string
  name: string
  price: number
  image: string
  category?: string
}

export type CartCustomization = {
  text: string
  font: string
  position: string
  fee: number
}

export type CartItem = {
  key: string
  product: CartProduct
  quantity: number
  customization?: CartCustomization
  stock: number
  available: boolean
  lineTotal: number
}

export type CartContextValue = {
  items: CartItem[]
  itemCount: number
  loading: boolean
  error: string
  total: number
  engravingTotal: number
  refresh: () => Promise<void>
  addItem: (product: CartProduct, quantity?: number, customization?: CartCustomization) => Promise<void>
  updateQuantity: (key: string, quantity: number, customization?: CartCustomization | null) => Promise<void>
  removeItem: (key: string) => Promise<void>
  clearCart: () => Promise<void>
}

export const CartContext = createContext<CartContextValue | null>(null)
