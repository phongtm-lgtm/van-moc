import { useEffect, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { accountApi, type Me } from './api/account'
import AppLayout from './layout/AppLayout'
import SignInPage from './pages/SignInPage'
import { ShippingAdminPage } from './pages/ShippingAdminPage'
import OrdersPage from './pages/OrdersPage'
import OrderDetailPage from './pages/OrderDetailPage'
import ProductsPage from './pages/ProductsPage'
import CategoriesPage from './pages/CategoriesPage'
import EngravingFontsPage from './pages/EngravingFontsPage'
import ProductEditorPage from './pages/ProductEditorPage'
import BulkProductsPage from './pages/BulkProductsPage'

export default function App() {
  const [me, setMe] = useState<Me | null>(null)
  const [ready, setReady] = useState(false)
  const [retry, setRetry] = useState(0)
  useEffect(() => {
    let active = true
    accountApi<Me>('/api/admin/me').then(user => { if (active) setMe(user) })
      .catch(() => { if (active) setMe(null) }).finally(() => { if (active) setReady(true) })
    return () => { active = false }
  }, [retry])
  if (!ready) return <p className="p-6 text-gray-500">Đang kiểm tra phiên…</p>
  if (!me || me.role !== 'ADMIN') return <SignInPage onLogin={() => { setReady(false); setRetry(value => value + 1) }} />
  return <Routes><Route element={<AppLayout />}><Route path="/products" element={<ProductsPage />} /><Route path="/products/categories" element={<CategoriesPage />} /><Route path="/products/engraving-fonts" element={<EngravingFontsPage />} /><Route path="/products/new" element={<ProductEditorPage key="new" />} /><Route path="/products/bulk" element={<BulkProductsPage />} /><Route path="/products/:id" element={<ProductEditorPage />} /><Route path="/orders" element={<OrdersPage />} /><Route path="/orders/:id" element={<OrderDetailPage />} /><Route path="/shipping" element={<ShippingAdminPage />} /><Route path="*" element={<Navigate to="/orders" replace />} /></Route></Routes>
}
