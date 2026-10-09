import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { BRAND } from '../brand'

const pages: Record<string, [string, string]> = {
  '/': ['Sản phẩm sừng thủ công từ làng nghề Thụy Ứng', 'Khám phá sản phẩm sừng tự nhiên và chế tác cá nhân hóa cùng Vân Mộc. Vân nguyên bản, nét riêng bạn.'],
  '/shop': ['Sản phẩm', 'Khám phá sản phẩm thủ công từ sừng tự nhiên, thông tin giá và lựa chọn khắc tên tại Vân Mộc.'],
  '/villages': ['Câu chuyện làng nghề Thụy Ứng', 'Câu chuyện chất liệu sừng tự nhiên và nghề thủ công truyền thống cùng Vân Mộc.'],
  '/gioi-thieu': ['Về Vân Mộc', 'Tìm hiểu Vân Mộc và tinh thần gìn giữ vẻ đẹp nguyên bản của sản phẩm sừng thủ công.'],
  '/custom-order': ['Chế tác theo yêu cầu', 'Trao đổi ý tưởng và nhận tư vấn sản phẩm sừng thủ công cá nhân hóa cùng Vân Mộc.'],
  '/lien-he': ['Liên hệ', 'Liên hệ Vân Mộc qua hotline 0981835096, email vanmoc2026@gmail.com và Fanpage chính thức.'],
  '/quy-dinh': ['Chính sách mua hàng', 'Thông tin đặt hàng, khắc tên, thanh toán, giao hàng và hỗ trợ sau mua tại Vân Mộc.'],
  '/chinh-sach-bao-mat': ['Chính sách bảo mật', 'Thông tin về xử lý dữ liệu tài khoản, địa chỉ, đơn hàng và yêu cầu bảo vệ dữ liệu tại Vân Mộc.'],
}

export function Seo() {
  const { pathname, search } = useLocation()
  useEffect(() => {
    const page = pages[pathname]
    // Product metadata is populated by ProductDetailPage after the real API response.
    const product = /^\/shop\/[^/]+$/.test(pathname)
    const title = `${page?.[0] ?? (product ? 'Chi tiết sản phẩm' : 'Thông tin')} | ${BRAND.name}`
    const description = page?.[1] ?? 'Vân Mộc — sản phẩm thủ công từ sừng tự nhiên. Vân nguyên bản, nét riêng bạn.'
    const meta = (key: string, content: string, property = false) => {
      const attribute = property ? 'property' : 'name'
      let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`)
      if (!element) { element = document.createElement('meta'); element.setAttribute(attribute, key); document.head.append(element) }
      element.content = content
    }
    document.title = title
    meta('description', description)
    meta('robots', page || product ? 'index,follow' : 'noindex,follow')
    meta('og:title', title, true); meta('og:description', description, true)
    meta('og:type', 'website', true); meta('og:locale', 'vi_VN', true)
    meta('og:image', `${BRAND.url}/assets/van-moc-logo-dark.png`, true)
    // Filtered listings retain their pagination in the canonical URL.
    const params = new URLSearchParams(search)
    const canonicalParams = new URLSearchParams()
    if (pathname === '/shop') for (const key of ['category', 'page']) { const value = params.get(key); if (value) canonicalParams.set(key, value) }
    const canonical = BRAND.url + pathname + (canonicalParams.size ? `?${canonicalParams}` : '')
    let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    if (!link) { link = document.createElement('link'); link.rel = 'canonical'; document.head.append(link) }
    link.href = canonical; meta('og:url', canonical, true)
    meta('twitter:card', 'summary'); meta('twitter:title', title); meta('twitter:description', description)
  }, [pathname, search])
  return null
}
