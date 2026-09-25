import { createContext } from 'react'

export type CartProduct = {
  id: number
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
}

export type CartContextValue = {
  items: CartItem[]
  itemCount: number
  addItem: (product: CartProduct, quantity?: number, customization?: CartCustomization) => void
  updateQuantity: (key: string, quantity: number) => void
  removeItem: (key: string) => void
  clearCart: () => void
}

export const CartContext = createContext<CartContextValue | null>(null)
