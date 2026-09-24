import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, Search, ShoppingBag, X } from 'lucide-react'

const NAV = [
  { label: 'Trang chủ', href: '/' },
  { label: 'Sản phẩm', href: '/shop' },
  { label: 'Câu Chuyện', href: '/villages' },
  { label: 'Về chúng tôi', href: '/gioi-thieu' },
  { label: 'Chính sách', href: '/quy-dinh' },
]

export function Header() {
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#591d10]/95 backdrop-blur-xl border-b border-[#f2ddbd]/20 shadow-[0_4px_20px_rgba(45,15,8,0.18)]">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 flex items-center h-16 md:h-20">
        <Link to="/" className="flex items-center shrink-0" aria-label="Vân Mộc">
          <img
            alt="Vân Mộc"
            className="h-10 md:h-12 w-auto max-w-[180px] md:max-w-[220px] object-contain brightness-0 invert sepia-[.15]"
            src="/assets/van-moc-logo-transparent.png"
          />
        </Link>

        <nav className="hidden md:flex flex-1 items-center justify-center gap-1">
          {NAV.map((item) => {
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`relative px-4 py-2 text-[15px] font-medium transition-colors after:absolute after:left-4 after:right-4 after:bottom-0 after:h-px after:origin-left after:bg-[#f3ddbd] after:transition-transform ${
                  active
                    ? 'text-[#fff2dc] after:scale-x-100'
                    : 'text-[#f3ddbd]/80 hover:text-[#fff2dc] after:scale-x-0 hover:after:scale-x-100'
                }`}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="hidden md:flex items-center gap-4 shrink-0 ml-auto pl-5 border-l border-[#f3ddbd]/20">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 rounded-full border border-[#f3ddbd]/45 px-4 py-2 text-sm font-medium text-[#fff2dc] transition-colors hover:border-[#fff2dc] hover:bg-white/10"
          >
            <span className="flex size-5 items-center justify-center rounded-full bg-white font-sans text-xs font-bold text-[#4285f4]">
              G
            </span>
            Đăng nhập
          </Link>
          <button type="button" aria-label="Tìm kiếm" className="text-[#f3ddbd]/90 hover:text-white transition-colors cursor-pointer">
            <Search size={22} strokeWidth={1.5} />
          </button>
          <button type="button" aria-label="Giỏ hàng" className="text-[#f3ddbd]/90 hover:text-white transition-colors cursor-pointer">
            <ShoppingBag size={22} strokeWidth={1.5} />
          </button>
        </div>

        <div className="md:hidden flex items-center gap-3 ml-auto">
          <button type="button" aria-label="Tìm kiếm" className="text-[#f3ddbd]/90 hover:text-white transition-colors cursor-pointer">
            <Search size={19} strokeWidth={1.5} />
          </button>
          <button type="button" aria-label="Giỏ hàng" className="relative text-[#f3ddbd]/90 hover:text-white transition-colors cursor-pointer">
            <ShoppingBag size={18} strokeWidth={1.5} />
          </button>
          <button
            type="button"
            className="text-[#f3ddbd]/90 hover:text-white cursor-pointer"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
          >
            {open ? <X size={18} strokeWidth={2} /> : <Menu size={18} strokeWidth={2} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-[#f3ddbd]/15 bg-[#591d10] px-4 py-4 space-y-1 shadow-lg">
          {NAV.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              onClick={() => setOpen(false)}
              className={`block px-3 py-2.5 rounded-lg text-sm ${
                pathname === item.href ? 'bg-white/10 text-[#fff2dc]' : 'text-[#f3ddbd]/75'
              }`}
            >
              {item.label}
            </Link>
          ))}
          <Link
            to="/login"
            onClick={() => setOpen(false)}
            className="mt-3 flex items-center justify-center gap-2 rounded-full border border-[#f3ddbd]/40 px-4 py-2.5 text-sm font-medium text-[#fff2dc]"
          >
            <span className="flex size-5 items-center justify-center rounded-full bg-white font-sans text-xs font-bold text-[#4285f4]">
              G
            </span>
            Đăng nhập bằng Google
          </Link>
        </div>
      )}
    </header>
  )
}
