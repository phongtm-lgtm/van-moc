import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, Search, ShoppingCart, UserRound, X } from 'lucide-react'
import { useCart } from '../hooks/useCart'

const NAV = [
  { label: 'Trang chủ', href: '/' },
  { label: 'Câu Chuyện', href: '/villages' },
  { label: 'Sản phẩm', href: '/shop' },
  { label: 'Chế tác riêng', href: '/custom-order' },
  { label: 'Về chúng tôi', href: '/gioi-thieu' },
  { label: 'Chính sách', href: '/quy-dinh' },
]

export function Header() {
  const { pathname } = useLocation()
  const { itemCount } = useCart()
  const [open, setOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-[#7a5138]/15 bg-[#f7ebdd]/92 backdrop-blur-xl shadow-[0_2px_18px_rgba(58,33,22,0.055)]">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center px-4 md:h-20 md:px-8">
        <Link to="/" className="flex shrink-0 items-center" aria-label="Vân Mộc">
          <img
            alt="Vân Mộc"
            className="h-9 w-auto max-w-[160px] object-contain md:h-12 md:max-w-[240px]"
            src="/assets/van-moc-logo-dark.png"
          />
        </Link>

        <nav className="hidden flex-1 items-center justify-center gap-1 md:flex">
          {NAV.map((item) => {
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`relative px-4 py-2 text-base font-medium transition-colors after:absolute after:left-4 after:right-4 after:bottom-0 after:h-px after:origin-left after:bg-[#a84a32] after:transition-transform ${
                  active
                    ? 'text-[#4a2a1a] after:scale-x-100'
                    : 'text-[#5a4033] after:scale-x-0 hover:text-[#3a2116] hover:after:scale-x-100'
                }`}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="ml-auto hidden shrink-0 items-center gap-4 border-l border-[#7a5138]/15 pl-5 md:flex">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#5a4033] transition-colors hover:text-[#3a2116]"
          >
            <UserRound size={19} strokeWidth={1.5} />
            Đăng nhập
          </Link>
          <button
            type="button"
            aria-label="Tìm kiếm"
            className="cursor-pointer text-[#5a4033] transition-colors hover:text-[#3a2116]"
          >
            <Search size={22} strokeWidth={1.5} />
          </button>
          <Link
            to="/cart"
            aria-label="Giỏ hàng"
            className="header-cart"
          >
            <ShoppingCart size={20} strokeWidth={1.5} />
            {itemCount > 0 && <span>{itemCount > 99 ? '99+' : itemCount}</span>}
          </Link>
        </div>

        <div className="ml-auto flex items-center gap-3 md:hidden">
          <button
            type="button"
            aria-label="Tìm kiếm"
            className="cursor-pointer text-[#5a4033] transition-colors hover:text-[#3a2116]"
          >
            <Search size={20} strokeWidth={1.5} />
          </button>
          <Link
            to="/cart"
            aria-label="Giỏ hàng"
            className="header-cart header-cart--mobile"
          >
            <ShoppingCart size={18} strokeWidth={1.5} />
            {itemCount > 0 && <span>{itemCount > 99 ? '99+' : itemCount}</span>}
          </Link>
          <button
            type="button"
            className="cursor-pointer text-[#5a4033] hover:text-[#3a2116]"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
            aria-expanded={open}
            aria-controls="mobile-navigation"
          >
            {open ? <X size={20} strokeWidth={2} /> : <Menu size={20} strokeWidth={2} />}
          </button>
        </div>
      </div>

      {open && (
        <div id="mobile-navigation" className="border-t border-[#7a5138]/12 bg-[#f7ebdd] px-4 pb-6 pt-3 shadow-[0_20px_40px_rgba(58,33,22,0.14)] md:hidden">
          <p className="mb-3 px-3 pt-1 text-[9px] font-semibold uppercase tracking-[0.24em] text-[#9a6a32]">Khám phá Vân Mộc</p>
          {NAV.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              onClick={() => setOpen(false)}
              className={`flex items-center justify-between border-b border-[#7a5138]/10 px-3 py-3.5 text-base ${
                pathname === item.href ? 'text-[#a84a32]' : 'text-[#5a4033]'
              }`}
            >
              {item.label}
              <span aria-hidden className="text-[#9a6a32]">→</span>
            </Link>
          ))}
          <Link
            to="/login"
            onClick={() => setOpen(false)}
            className="mt-3 flex items-center justify-center gap-2 rounded-full border border-[#7a5138]/50 px-4 py-2.5 text-sm font-medium text-[#5b301b]"
          >
            <UserRound size={18} strokeWidth={1.5} />
            Đăng nhập
          </Link>
        </div>
      )}
    </header>
  )
}
