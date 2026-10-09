import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { CartContext, type CartContextValue, type CartItem, type CartProduct, type CartCustomization } from './cart-context'
import { accountApi, type Me } from '../api/account'
import { ApiError, isUuid } from '../api/catalog'

const GUEST_KEY = 'vanmoc.guest.cart'
type ServerCart = {
  items: { id: string; productId: string; productSlug: string; productName: string; imageUrl: string | null; stock: number; available: boolean; quantity: number;
    engraving: { text: string; font: string; position: string } | null; unitPrice: number; engravingUnitFee: number; lineTotal: number }[]
  total: number; engravingTotal: number
}
function guestCart(): CartItem[] {
  try {
    const rows = JSON.parse(localStorage.getItem(GUEST_KEY) || '[]') as CartItem[]
    return Array.isArray(rows) ? rows.filter(row => isUuid(row?.product?.id) && row.quantity > 0 && row.quantity <= 10000) : []
  } catch { return [] }
}
function storeGuest(rows: CartItem[]) { localStorage.setItem(GUEST_KEY, JSON.stringify(rows)) }
function fromServer(cart: ServerCart): CartItem[] {
  return cart.items.map(item => ({ key: item.id, product: { id: item.productId, slug: item.productSlug, name: item.productName, price: item.unitPrice, image: item.imageUrl || '' },
    quantity: item.quantity, customization: item.engraving ? { ...item.engraving, fee: item.engravingUnitFee } : undefined,
    stock: item.stock, available: item.available, lineTotal: item.lineTotal }))
}
function sameSelection(left: CartItem, right: CartItem) {
  return left.product.id === right.product.id && left.customization?.text === right.customization?.text
    && left.customization?.font === right.customization?.font && left.customization?.position === right.customization?.position
}
export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(guestCart)
  const [authenticated, setAuthenticated] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [authVersion, setAuthVersion] = useState(0)
  const refreshing = useRef<Promise<void> | null>(null)
  const apply = (cart: ServerCart) => setItems(fromServer(cart))
  const refresh = useCallback((): Promise<void> => {
    if (refreshing.current) return refreshing.current
    const run = async () => {
    setLoading(true)
    try {
      await accountApi<Me>('/api/me')
      setAuthenticated(true)
      let cart = await accountApi<ServerCart>('/api/cart')
      for (const row of guestCart()) {
        const existing = fromServer(cart).find(item => sameSelection(item, row))
        if (existing && existing.quantity >= row.quantity) {
          storeGuest(guestCart().filter(item => item.key !== row.key))
          continue
        }
        cart = await accountApi<ServerCart>('/api/cart/items', 'POST', { productId: row.product.id, quantity: existing ? row.quantity - existing.quantity : row.quantity,
          engraving: row.customization ? { text: row.customization.text, font: row.customization.font, position: row.customization.position } : null })
        storeGuest(guestCart().filter(item => item.key !== row.key))
      }
      apply(cart); setError('')
    } catch (cause) {
      if (cause instanceof ApiError && cause.status === 401) { setAuthenticated(false); setItems(guestCart()); setError('') }
      else { setError((cause as Error).message) }
    } finally { setLoading(false) }
    }
    const pending = run()
    refreshing.current = pending
    void pending.finally(() => { if (refreshing.current === pending) refreshing.current = null })
    return pending
  }, [])
  useEffect(() => { void refresh() }, [refresh, authVersion])
  useEffect(() => {
    const onAuthChange = () => setAuthVersion(value => value + 1)
    window.addEventListener('vanmoc-auth-changed', onAuthChange)
    return () => window.removeEventListener('vanmoc-auth-changed', onAuthChange)
  }, [])

  const mutate = async (path: string, method: string, body?: unknown) => {
    setLoading(true); setError('')
    try { apply(await accountApi<ServerCart>(path, method, body)) }
    catch (cause) { setError((cause as Error).message); throw cause }
    finally { setLoading(false) }
  }
  const localChange = (change: (rows: CartItem[]) => CartItem[]) => {
    const next = change(guestCart()); storeGuest(next); setItems(next); setError('')
  }
  const addItem: CartContextValue['addItem'] = async (product: CartProduct, quantity = 1, customization?: CartCustomization) => {
    if (!isUuid(product.id)) throw new Error('ID sản phẩm không hợp lệ.')
    let signedIn = authenticated
    if (signedIn === null) {
      try { await accountApi<Me>('/api/me'); signedIn = true; setAuthenticated(true) }
      catch (cause) {
        if (!(cause instanceof ApiError && cause.status === 401)) throw cause
        signedIn = false; setAuthenticated(false)
      }
    }
    if (!signedIn) {
      if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10000) throw new Error('Số lượng không hợp lệ.')
      localChange(rows => {
        const found = rows.find(row => row.product.id === product.id && JSON.stringify(row.customization) === JSON.stringify(customization))
        if (found) {
          if (found.quantity + quantity > 10000 || found.quantity + quantity > (product.stock ?? 10000)) throw new Error('Số lượng vượt tồn kho hiện tại.')
          return rows.map(row => row === found ? { ...row, quantity: row.quantity + quantity, lineTotal: (row.quantity + quantity) * (product.price + (customization?.fee ?? 0)) } : row)
        }
        if (quantity > (product.stock ?? 10000)) throw new Error('Số lượng vượt tồn kho hiện tại.')
        return [...rows, { key: crypto.randomUUID(), product, quantity, customization, stock: product.stock ?? 10000, available: true, lineTotal: quantity * (product.price + (customization?.fee ?? 0)) }]
      })
      return
    }
    await mutate('/api/cart/items', 'POST', { productId: product.id, quantity,
      engraving: customization ? { text: customization.text, font: customization.font, position: customization.position } : null })
  }
  const updateQuantity: CartContextValue['updateQuantity'] = async (id, quantity, customization) => {
    const row = items.find(item => item.key === id)
    if (!row) return
    const config = customization === undefined ? row.customization : customization || undefined
    if (!authenticated) {
      if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10000) throw new Error('Số lượng không hợp lệ.')
      localChange(rows => rows.map(item => item.key === id ? { ...item, quantity, customization: config, lineTotal: quantity * (item.product.price + (config?.fee ?? 0)) } : item)); return
    }
    await mutate(`/api/cart/items/${id}`, 'PATCH', { quantity, engraving: config ? { text: config.text, font: config.font, position: config.position } : null })
  }
  const removeItem = async (id: string) => {
    if (!authenticated) { localChange(rows => rows.filter(row => row.key !== id)); return }
    await mutate(`/api/cart/items/${id}`, 'DELETE')
  }
  const clearCart = async () => {
    if (!authenticated) { localChange(() => []); return }
    await mutate('/api/cart/items', 'DELETE')
  }
  const total = items.reduce((sum, row) => sum + row.lineTotal, 0)
  const engravingTotal = items.reduce((sum, row) => sum + (row.customization?.fee ?? 0) * row.quantity, 0)
  return <CartContext.Provider value={{ items, total, engravingTotal, authenticated, loading, error, refresh,
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0), addItem, updateQuantity, removeItem, clearCart }}>{children}</CartContext.Provider>
}
