import { useEffect, useState, type ReactNode } from 'react'
import { CartContext, type CartContextValue, type CartItem } from './cart-context'
const STORAGE_KEY = 'van-moc-cart'

function loadCart() {
  try {
    const savedCart = localStorage.getItem(STORAGE_KEY)
    return savedCart ? JSON.parse(savedCart) as CartItem[] : []
  } catch {
    return []
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(loadCart)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  const addItem: CartContextValue['addItem'] = (product, quantity = 1, customization) => {
    const key = `${product.id}:${customization?.text ?? ''}:${customization?.font ?? ''}:${customization?.position ?? ''}`
    setItems((current) => {
      const existingItem = current.find((item) => item.key === key)
      if (!existingItem) return [...current, { key, product, quantity, customization }]
      return current.map((item) => item.key === key ? { ...item, quantity: item.quantity + quantity } : item)
    })
  }

  const updateQuantity = (key: string, quantity: number) => {
    if (quantity < 1) return
    setItems((current) => current.map((item) => item.key === key ? { ...item, quantity } : item))
  }

  const removeItem = (key: string) => {
    setItems((current) => current.filter((item) => item.key !== key))
  }

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount: items.reduce((total, item) => total + item.quantity, 0),
        addItem,
        updateQuantity,
        removeItem,
        clearCart: () => setItems([]),
      }}
    >
      {children}
    </CartContext.Provider>
  )
}
