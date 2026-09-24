import { Link } from 'react-router-dom'
import { Mail, MapPin, Phone } from 'lucide-react'

/** Cập nhật URL thật khi có fanpage / kênh chính thức. */
export const SOCIAL_LINKS = {
  facebook: '',
  messenger: '',
  tiktok: '',
} as const

const PRODUCT_LINKS = [
  { label: 'Lược sừng', href: '/shop' },
  { label: 'Trâm cài', href: '/shop' },
  { label: 'Bộ quà tặng', href: '/shop' },
  { label: 'Chế tác theo yêu cầu', href: '/custom-order' },
]

export function Footer() {
  return (
    <footer className="bg-[#591d10] text-[#fff2dc] border-t border-[#c9973a]/20 pt-16 pb-8">
      <div className="container mx-auto px-5 md:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-8 pb-12">
        {/* Thương hiệu */}
        <div className="space-y-4 sm:col-span-2 lg:col-span-1">
          <h4 className="font-display text-2xl tracking-wide text-[#fff2dc]">Vân Mộc</h4>
          <p className="text-sm text-[#fff2dc]/70 leading-relaxed">
            Vân nguyên bản - Nét riêng bạn.
          </p>
          <div className="space-y-2.5 pt-1 text-sm text-[#fff2dc]/65">
            <div className="flex items-start gap-2.5">
              <MapPin size={15} className="text-[#c9973a] shrink-0 mt-0.5" />
              <span>
                {/* TODO: thay bằng địa chỉ thật của thương hiệu khi có */}
                Làng nghề Thụy Ứng, xã Hòa Bình, huyện Thường Tín, Hà Nội
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <Phone size={15} className="text-[#c9973a] shrink-0" />
              {/* TODO: thay bằng số điện thoại thật */}
              <span>+84 XXX XXX XXX</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Mail size={15} className="text-[#c9973a] shrink-0" />
              <a
                href="mailto:lienhe@vanmoc.vn"
                className="hover:text-[#c9973a] transition-colors"
              >
                lienhe@vanmoc.vn
              </a>
            </div>
          </div>
        </div>

        {/* Sản phẩm */}
        <div className="space-y-4">
          <h4 className="text-[13px] font-bold tracking-[0.16em] text-[#fff2dc] uppercase">
            Sản phẩm
          </h4>
          <ul className="text-sm text-[#fff2dc]/65 space-y-3">
            {PRODUCT_LINKS.map((item) => (
              <li key={item.label}>
                <Link to={item.href} className="hover:text-[#c9973a] transition-colors">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Đăng ký tin */}
        <div className="space-y-4 sm:col-span-2 lg:col-span-1">
          <h4 className="text-[13px] font-bold tracking-[0.16em] text-[#fff2dc] uppercase">
            Đăng ký tin
          </h4>
          <p className="text-sm text-[#fff2dc]/65 leading-relaxed">
            Nhận thông tin về sản phẩm mới và những câu chuyện từ làng nghề.
          </p>
          <form
            className="space-y-2 pt-1"
            onSubmit={(e) => {
              e.preventDefault()
            }}
          >
            <div className="flex gap-2 items-end border-b border-[#fff2dc]/35 focus-within:border-[#c9973a] transition-colors pb-1">
              <input
                placeholder="email@cua-ban.com"
                required
                className="flex-1 h-9 bg-transparent text-[#fff2dc] placeholder:text-[#fff2dc]/40 text-sm focus:outline-none"
                type="email"
                aria-label="Email đăng ký nhận tin"
              />
              <button
                type="submit"
                className="h-9 px-2 text-[#c9973a] hover:text-[#fff2dc] transition-colors cursor-pointer flex items-center justify-center"
                aria-label="Đăng ký"
              >
                <Mail size={16} strokeWidth={1.5} />
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="container mx-auto px-5 md:px-8 border-t border-[#fff2dc]/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-[11px] text-[#fff2dc]/45 text-center md:text-left">
          © 2026 Vân Mộc. Bản quyền được bảo hộ.
        </p>
        <div className="flex gap-3">
          {SOCIAL_LINKS.facebook ? (
            <a
              href={SOCIAL_LINKS.facebook}
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook"
              className="w-8 h-8 rounded-full border border-[#fff2dc]/15 flex items-center justify-center text-[#c9973a] hover:text-[#fff2dc] hover:border-[#c9973a]/50 transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
              </svg>
            </a>
          ) : null}
          {SOCIAL_LINKS.tiktok ? (
            <a
              href={SOCIAL_LINKS.tiktok}
              target="_blank"
              rel="noreferrer"
              aria-label="TikTok"
              className="w-8 h-8 rounded-full border border-[#fff2dc]/15 flex items-center justify-center text-[#c9973a] hover:text-[#fff2dc] hover:border-[#c9973a]/50 transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.24 8.24 0 0 0 4.83 1.56V6.79a4.85 4.85 0 0 1-1.06-.1z" />
              </svg>
            </a>
          ) : null}
        </div>
      </div>
    </footer>
  )
}
