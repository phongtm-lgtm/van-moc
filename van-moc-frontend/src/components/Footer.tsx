import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Mail, PackageCheck, Phone, RotateCcw, ShieldCheck } from 'lucide-react'
import { api, type Category } from '../api/catalog'
import { BRAND } from '../brand'

/** Cập nhật URL thật khi có fanpage / kênh chính thức. */
const SOCIAL_LINKS = {
  facebook: BRAND.facebook,
  messenger: '',
  tiktok: '',
} as const

export function Footer() {
  const [categories, setCategories] = useState<Category[]>([])
  useEffect(() => {
    const controller = new AbortController()
    api<Category[]>('/api/categories', controller.signal)
      .then(rows => { if (!controller.signal.aborted) setCategories(rows) })
      .catch(() => { /* Keep the catalog link available if categories cannot be loaded. */ })
    return () => controller.abort()
  }, [])

  return (
    <footer className="relative overflow-hidden border-t border-[#9a6b1f]/25 bg-[#342217] text-[#fff2dc]">
      <svg className="pointer-events-none absolute -right-16 top-28 h-80 w-80 text-[#c9973a]/[0.055]" viewBox="0 0 240 240" fill="none" stroke="currentColor" aria-hidden>
        <circle cx="120" cy="120" r="86" />
        <path d="M120 199c-42-31-59-65-50-99 8-29 30-46 50-59 20 13 42 30 50 59 9 34-8 68-50 99Z" />
        <path d="M120 53v132M120 91c-20-16-34-18-47-15M120 118c23-17 39-20 51-16M120 147c-20-14-34-16-47-12" />
      </svg>

      <div className="border-b border-[#fff2dc]/10 bg-[#2d1e14]/55">
        <div className="mx-auto grid max-w-[1400px] divide-y divide-[#fff2dc]/10 px-5 sm:grid-cols-3 sm:divide-x sm:divide-y-0 md:px-8">
          {[
            { icon: ShieldCheck, title: 'Chất liệu tuyển chọn', text: 'Sừng tự nhiên, vân độc bản' },
            { icon: PackageCheck, title: 'Gói quà chỉn chu', text: 'Trao gửi trọn vẹn ý nghĩa' },
            { icon: RotateCcw, title: 'Hỗ trợ tận tâm', text: 'Đồng hành trong suốt trải nghiệm' },
          ].map((item) => (
            <div key={item.title} className="flex items-center gap-3.5 py-5 sm:justify-center sm:px-4 md:py-6">
              <item.icon size={22} strokeWidth={1.25} className="shrink-0 text-[#c9973a]" />
              <div>
                <p className="text-[12px] font-semibold text-[#fff2dc]">{item.title}</p>
                <p className="mt-0.5 text-[10px] text-[#fff2dc]/50">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="relative z-10 pt-14 md:pt-16">
      <div className="container mx-auto px-5 md:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-8 pb-12">
        {/* Thương hiệu */}
        <div className="space-y-4 sm:col-span-2 lg:col-span-1">
          <img src="/assets/van-moc-logo-light.png" alt="Vân Mộc" className="h-14 w-auto max-w-[220px] object-contain object-left" />
          <p className="text-sm text-[#fff2dc]/70 leading-relaxed">
            Vân nguyên bản - Nét riêng bạn.
          </p>
          <div className="space-y-2.5 pt-1 text-sm text-[#fff2dc]/65">
            <div className="flex items-center gap-2.5">
              <Phone size={15} className="text-[#c9973a] shrink-0" />
              <a href={`tel:${BRAND.phone}`} className="hover:text-[#c9973a]">{BRAND.phone}</a>
            </div>
            <div className="flex items-center gap-2.5">
              <Mail size={15} className="text-[#c9973a] shrink-0" />
              <a
                href={`mailto:${BRAND.email}`}
                className="hover:text-[#c9973a] transition-colors"
              >
                {BRAND.email}
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
            <li><Link to="/shop" className="hover:text-[#c9973a] transition-colors">Tất cả sản phẩm</Link></li>
            {categories.map((item) => (
              <li key={item.id}>
                <Link to={`/shop?category=${encodeURIComponent(item.id)}`} className="hover:text-[#c9973a] transition-colors">
                  {item.name}
                </Link>
              </li>
            ))}
            <li><Link to="/custom-order" className="hover:text-[#c9973a] transition-colors">Chế tác theo yêu cầu</Link></li>
          </ul>
        </div>

        {/* Hỗ trợ và thông tin chính sách */}
        <div className="space-y-4 sm:col-span-2 lg:col-span-1">
          <h4 className="text-[13px] font-bold tracking-[0.16em] text-[#fff2dc] uppercase">
            Hỗ trợ khách hàng
          </h4>
          <ul className="text-sm text-[#fff2dc]/75 space-y-3">
            <li><Link to="/lien-he" className="hover:text-[#c9973a]">Liên hệ Vân Mộc</Link></li>
            <li><Link to="/quy-dinh" className="hover:text-[#c9973a]">Chính sách mua hàng</Link></li>
            <li><Link to="/chinh-sach-bao-mat" className="hover:text-[#c9973a]">Chính sách bảo mật</Link></li>
            <li><a href={BRAND.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-[#c9973a]">Fanpage Vân Mộc</a></li>
          </ul>
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
      </div>
    </footer>
  )
}
