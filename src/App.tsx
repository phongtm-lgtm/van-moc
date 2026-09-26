import { Route, Routes } from 'react-router-dom'
import { Footer } from './components/Footer'
import { Header } from './components/Header'
import { CartPage } from './pages/CartPage'
import { CheckoutPage } from './pages/CheckoutPage'
import { HomePage } from './pages/HomePage'
import { OrderHistoryPage } from './pages/OrderHistoryPage'
import { ProductDetailPage } from './pages/ProductDetailPage'
import { ProductPage } from './pages/ProductPage'
import { TraceabilityPage } from './pages/TraceabilityPage'

function Placeholder({ title }: { title: string }) {
  return (
    <div className="container mx-auto px-6 py-24 text-center">
      <h1 className="text-3xl text-[#3f2a1a] text-title-gradient">{title}</h1>
    </div>
  )
}

export default function App() {
  return (
    <div className="flex min-h-screen flex-col bg-[#fff8e7]">
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/shop" element={<ProductPage />} />
          <Route path="/shop/:id" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/account/orders" element={<OrderHistoryPage />} />
          <Route path="/villages" element={<Placeholder title="Câu Chuyện" />} />
          <Route path="/gioi-thieu" element={<Placeholder title="Về chúng tôi" />} />
          <Route path="/truy-xuat" element={<TraceabilityPage />} />
          <Route path="/quy-dinh" element={<Placeholder title="Chính sách mua hàng" />} />
          <Route path="/custom-order" element={<Placeholder title="Chế tác theo yêu cầu" />} />
          <Route path="/lien-he" element={<Placeholder title="Liên hệ" />} />
          <Route path="/login" element={<Placeholder title="Đăng nhập" />} />
          <Route path="/register" element={<Placeholder title="Đăng ký" />} />
          <Route path="*" element={<Placeholder title="Đang phát triển" />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
