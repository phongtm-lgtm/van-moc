import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, ShoppingCart, X } from 'lucide-react'
import { useCart } from '../hooks/useCart'
import { AccountDropdown } from './AccountDropdown'

const NAV = [
  { label: 'Trang chủ', href: '/' },
  { label: 'Câu Chuyện', href: '/villages' },
  { label: 'Sản phẩm', href: '/shop' },
  { label: 'Công nghệ laser', href: '/cong-nghe-laser' },
  { label: 'Về chúng tôi', href: '/gioi-thieu' },
  { label: 'Hành trình chế tác', href: '/truy-xuat' },
]

export function Header() {
  const { pathname } = useLocation()
  const { itemCount } = useCart()
  const [open, setOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-[#7a5138]/15 bg-[#f7ebdd]/95 shadow-[0_4px_20px_rgba(58,33,22,0.07)] backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1600px] items-center gap-2 px-3 sm:px-4 md:h-20 md:gap-5 md:px-8 xl:gap-3">
        <Link to="/" className="flex shrink-0 items-center gap-1 rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9a6b1f]" aria-label="Vân Mộc - Trang chủ">
          <img
            alt=""
            className="h-14 w-auto shrink-0 object-contain sm:h-[4.25rem] md:h-[5.25rem] xl:h-[4.25rem] 2xl:h-[5.25rem]"
            src="/assets/Logo.png"
          />
          <span className="flex flex-col text-[#5a301a]" aria-hidden="true">
            <span className="header-brand__name whitespace-nowrap text-[15px] font-bold leading-tight tracking-[0.1em] sm:text-[21px] md:text-[23px] xl:text-[18px] 2xl:text-[23px]">
              VÂN MỘC
            </span>
            <span className="hidden whitespace-nowrap text-[8px] leading-tight tracking-[0.02em] sm:block">
              Vân nguyên bản - Nét riêng bạn.
            </span>
          </span>
        </Link>

        <nav className="hidden min-w-0 flex-1 items-center justify-center gap-1 xl:flex" aria-label="Điều hướng chính">
          {NAV.map((item) => {
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                to={item.href}
                aria-current={active ? 'page' : undefined}
                className={`relative whitespace-nowrap rounded-md px-1.5 py-2 text-[13px] font-medium outline-none transition-colors after:absolute after:bottom-0 after:left-1.5 after:right-1.5 after:h-0.5 after:origin-left after:rounded-full after:bg-[#a84a32] after:transition-transform focus-visible:bg-[#efe0cd] focus-visible:after:scale-x-100 2xl:px-2.5 2xl:text-[15px] 2xl:after:left-2.5 2xl:after:right-2.5 ${
                  active
                    ? 'text-[#4a2a1a] after:scale-x-100'
                    : 'text-[#5a4033] after:scale-x-0 hover:bg-[#efe0cd]/70 hover:text-[#3a2116] hover:after:scale-x-100'
                }`}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="header-account-position">
          <AccountDropdown onOpen={() => setOpen(false)} />
        </div>
        <div className="hidden shrink-0 items-center md:flex">
          <Link
            to="/cart"
            aria-label="Giỏ hàng"
            className="header-cart"
          >
            <ShoppingCart size={20} strokeWidth={1.5} />
            {itemCount > 0 && <span>{itemCount > 99 ? '99+' : itemCount}</span>}
          </Link>
        </div>

        <div className="flex items-center gap-2 md:gap-3 xl:hidden">
          <Link
            to="/cart"
            aria-label="Giỏ hàng"
            className="header-cart header-cart--mobile md:hidden"
          >
            <ShoppingCart size={18} strokeWidth={1.5} />
            {itemCount > 0 && <span>{itemCount > 99 ? '99+' : itemCount}</span>}
          </Link>
          <button
            type="button"
            className="grid h-9 w-9 cursor-pointer place-items-center rounded-full border border-[#7a5138]/25 text-[#5a4033] transition-colors hover:bg-[#efe0cd] hover:text-[#3a2116] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9a6b1f]"
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
        <div id="mobile-navigation" className="max-h-[calc(100dvh-4rem)] overflow-y-auto border-t border-[#7a5138]/12 bg-[#f7ebdd] px-4 pb-6 pt-3 shadow-[0_20px_40px_rgba(58,33,22,0.14)] xl:hidden">
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
        </div>
      )}
    </header>
  )
}
