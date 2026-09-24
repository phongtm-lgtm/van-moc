import { Route, Routes } from 'react-router-dom'
import { Footer } from './components/Footer'
import { Header } from './components/Header'
import { HomePage } from './pages/HomePage'

function Placeholder({ title }: { title: string }) {
  return (
    <div className="container mx-auto px-6 py-24 text-center">
      <h1 className="text-3xl text-[#ab2124] text-title-gradient">{title}</h1>
      <p className="mt-3 text-sm text-[#ab2124]/70">Trang này sẽ được clone ở bước tiếp theo.</p>
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
          <Route path="/shop" element={<Placeholder title="Sản phẩm" />} />
          <Route path="/villages" element={<Placeholder title="Câu Chuyện" />} />
          <Route path="/gioi-thieu" element={<Placeholder title="Về chúng tôi" />} />
          <Route path="/quy-dinh" element={<Placeholder title="Chính sách" />} />
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
