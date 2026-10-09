import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { Footer } from './components/Footer'
import { Header } from './components/Header'
import { CartPage } from './pages/CartPage'
import { HomePage } from './pages/HomePage'
import { ProductDetailPage } from './pages/ProductDetailPage'
import { ProductPage } from './pages/ProductPage'
import { TraceabilityPage } from './pages/TraceabilityPage'
import { AccountPage, LoginPage } from './pages/AccountPage'
import { AddressesPage } from './pages/AddressesPage'
import { CheckoutPage } from './pages/CheckoutPage'
import { OrderHistoryPage } from './pages/OrderHistoryPage'
import { OrderDetailPage } from './pages/OrderDetailPage'
import { AboutPage, ContactPage, CustomOrderPage, VillagesPage } from './pages/InfoPages'

function Placeholder({ title }: { title: string }) {
  return (
    <div className="container mx-auto px-6 py-24 text-center">
      <h1 className="text-3xl text-[#3f2a1a] text-title-gradient">{title}</h1>
    </div>
  )
}

function OAuthReturn() {
  const navigate = useNavigate()
  const location = useLocation()
  useEffect(() => {
    if (location.pathname !== '/shop') return
    const path = sessionStorage.getItem('vanmoc.oauth.return')
    if (path === '/checkout') {
      sessionStorage.removeItem('vanmoc.oauth.return')
      navigate(path, { replace: true })
    }
  }, [location.pathname, navigate])
  return null
}

export default function App() {
  return (
    <div className="flex min-h-screen flex-col bg-[#fff8e7]">
      <OAuthReturn />
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/shop" element={<ProductPage />} />
          <Route path="/shop/:id" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/account/orders" element={<OrderHistoryPage />} />
          <Route path="/account/orders/:id" element={<OrderDetailPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/account/addresses" element={<AddressesPage />} />
          <Route path="/villages" element={<VillagesPage />} />
          <Route path="/gioi-thieu" element={<AboutPage />} />
          <Route path="/truy-xuat" element={<TraceabilityPage />} />
          <Route path="/quy-dinh" element={<Placeholder title="Chính sách mua hàng" />} />
          <Route path="/custom-order" element={<CustomOrderPage />} />
          <Route path="/lien-he" element={<ContactPage />} />
          <Route path="/login" element={<><HomePage /><LoginPage /></>} />
          <Route path="/chinh-sach-bao-mat" element={<Placeholder title="Chính sách bảo mật" />} />
          <Route path="/register" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Placeholder title="Đang phát triển" />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
