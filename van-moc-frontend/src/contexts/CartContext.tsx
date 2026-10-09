import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { CartContext, type CartContextValue, type CartItem } from './cart-context'
import { accountApi } from '../api/account'
import { isUuid } from '../api/catalog'

type ServerCart = {
  items: { id: string; productId: string; productSlug: string; productName: string; imageUrl: string | null; stock: number; available: boolean; quantity: number;
    engraving: { text: string; font: string; position: string } | null; unitPrice: number; engravingUnitFee: number; lineTotal: number }[]
  total: number; engravingTotal: number
}
export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [total, setTotal] = useState(0)
  const [engravingTotal, setEngravingTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const location = useLocation()
  const apply = useCallback((cart: ServerCart) => {
    setItems(cart.items.map(item => ({ key: item.id, product: { id: item.productId, slug: item.productSlug, name: item.productName, price: item.unitPrice, image: item.imageUrl || '' },
      quantity: item.quantity, customization: item.engraving ? { ...item.engraving, fee: item.engravingUnitFee } : undefined,
      stock: item.stock, available: item.available, lineTotal: item.lineTotal })))
    setTotal(cart.total); setEngravingTotal(cart.engravingTotal)
  }, [])
  const refresh = useCallback(async () => {
    setLoading(true)
    try { apply(await accountApi<ServerCart>('/api/cart')); setError('') }
    catch (cause) { setItems([]); setTotal(0); setEngravingTotal(0); setError((cause as Error).message) }
    finally { setLoading(false) }
  }, [apply])
  useEffect(() => {
    let active = true
    accountApi<ServerCart>('/api/cart').then(cart => { if (active) { apply(cart); setError('') } })
      .catch((cause: Error) => { if (active) { setItems([]); setTotal(0); setEngravingTotal(0); setError(cause.message) } })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [location.pathname, apply])
  const mutate = async (path: string, method: string, body?: unknown) => {
    setLoading(true); setError('')
    try { apply(await accountApi<ServerCart>(path, method, body)) }
    catch (cause) { setError((cause as Error).message); throw cause }
    finally { setLoading(false) }
  }
  const addItem: CartContextValue['addItem'] = async (product, quantity = 1, customization) => {
    if (!isUuid(product.id)) throw new Error('ID sản phẩm không hợp lệ.')
    await mutate('/api/cart/items', 'POST', { productId: product.id, quantity,
      engraving: customization ? { text: customization.text, font: customization.font, position: customization.position } : null })
  }
  const updateQuantity: CartContextValue['updateQuantity'] = async (id, quantity, customization) => {
    const item = items.find(row => row.key === id)
    const config = customization === undefined ? item?.customization : customization
    await mutate(`/api/cart/items/${id}`, 'PATCH', { quantity, engraving: config ? { text: config.text, font: config.font, position: config.position } : null })
  }
  return <CartContext.Provider value={{ items, total, engravingTotal, loading, error, refresh,
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0), addItem, updateQuantity,
    removeItem: id => mutate(`/api/cart/items/${id}`, 'DELETE'), clearCart: () => mutate('/api/cart/items', 'DELETE') }}>{children}</CartContext.Provider>
}
