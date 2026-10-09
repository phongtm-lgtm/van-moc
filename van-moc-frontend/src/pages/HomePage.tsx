import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Hand,
  HandHeart,
  Hourglass,
  ImageIcon,
  Leaf,
  MessageCircle,
  PencilLine,
  ShoppingCart,
  Sparkles,
  Star,
  Waves,
} from 'lucide-react'
import { Reveal } from '../components/Reveal'
import { ScrollProgress } from '../components/ScrollProgress'
import { SectionDecor } from '../components/SectionDecor'

/** Thay bằng URL Messenger fanpage thật khi có. */
export const MESSENGER_URL = '' as const

const BRAND_VALUES = [
  {
    step: '01',
    title: 'Gìn giữ nghề truyền thống',
    desc: 'Tiếp nối kỹ thuật chế tác được truyền qua nhiều thế hệ.',
  },
  {
    step: '02',
    title: 'Tôn trọng vẻ đẹp tự nhiên',
    desc: 'Giữ lại màu sắc và đường vân vốn có của từng chất liệu.',
  },
  {
    step: '03',
    title: 'Chế tác bằng sự tận tâm',
    desc: 'Mỗi sản phẩm được hoàn thiện qua nhiều công đoạn thủ công.',
  },
]

const FEATURED_PRODUCTS = [
  {
    id: 'luoc-rang-thua',
    name: 'Lược sừng khắc hoa sen',
    category: 'Lược sừng',
    price: '320.000 đ',
    badge: 'Bán chạy' as const,
    image: '/image/products/luoc-rang-thua.jpg',
    imagePosition: 'center',
    href: '/shop',
  },
  {
    id: 'tram-hoa-mai',
    name: 'Trâm cài hoa mai',
    category: 'Trâm cài',
    price: '185.000 đ',
    badge: 'Mới' as const,
    image: '/image/products/tram-hoa-sen.jpg',
    imagePosition: 'center',
    href: '/shop',
  },
  {
    id: 'luoc-can-dai',
    name: 'Lược sừng cán dài',
    category: 'Lược sừng',
    price: '450.000 đ',
    badge: 'Độc bản' as const,
    image: '/image/products/luoc-rang-thua.jpg',
    imagePosition: '73% center',
    href: '/shop',
  },
  {
    id: 'vong-tay-sung',
    name: 'Vòng tay sừng tự nhiên',
    category: 'Phụ kiện',
    price: '650.000 đ',
    badge: 'Quà tặng' as const,
    image: '/image/products/bo-qua-tang.jpg',
    imagePosition: 'center',
    href: '/shop',
  },
  {
    id: 'luoc-bo-tui',
    name: 'Lược sừng bỏ túi',
    category: 'Lược sừng',
    price: '280.000 đ',
    badge: 'Mới' as const,
    image: '/image/products/luoc-bo-tui.jpg',
    imagePosition: 'center',
    href: '/shop',
  },
]

const PRODUCT_VALUES = [
  {
    icon: Leaf,
    title: 'Sừng tự nhiên',
    desc: 'Màu sắc và đường vân được hình thành tự nhiên, không nhuộm ép.',
  },
  {
    icon: Waves,
    title: 'Đường vân độc bản',
    desc: 'Không có hai sản phẩm hoàn toàn giống nhau.',
  },
  {
    icon: Hand,
    title: 'Hoàn thiện thủ công',
    desc: 'Mỗi sản phẩm được mài, tạo hình và đánh bóng tỉ mỉ qua nhiều công đoạn.',
  },
  {
    icon: Hourglass,
    title: 'Bền đẹp theo thời gian',
    desc: 'Chất liệu sừng có độ bền cao, đồng hành cùng bạn qua nhiều năm.',
  },
]

const CRAFT_STEPS = [
  {
    step: '01',
    title: 'Tuyển chọn chất liệu',
    desc: 'Lựa chọn những miếng sừng có đường vân đẹp và độ dày phù hợp.',
  },
  {
    step: '02',
    title: 'Xử lý và làm sạch',
    desc: 'Làm sạch, ổn định chất liệu trước khi đưa vào chế tác.',
  },
  {
    step: '03',
    title: 'Tạo hình thủ công',
    desc: 'Người thợ tạo dáng lược, trâm theo từng mẫu thiết kế.',
  },
  {
    step: '04',
    title: 'Mài nhẵn, đánh bóng',
    desc: 'Mài từng cạnh và đánh bóng để bề mặt mượt, sáng tự nhiên.',
  },
  {
    step: '05',
    title: 'Kiểm tra và hoàn thiện',
    desc: 'Rà soát chi tiết lần cuối trước khi đến tay người dùng.',
  },
]

/** mockup: true — thay bằng review thật khi có dữ liệu. */
const REVIEWS = [
  {
    mockup: true,
    quote:
      'Chiếc lược sừng nhẹ tay, đường vân đẹp và dùng hàng ngày rất êm. Cảm giác khác hẳn lược nhựa thông thường.',
    name: 'Nguyễn Thu Hà',
    role: 'Hà Nội',
    avatar: undefined as string | undefined,
  },
  {
    mockup: true,
    quote:
      'Trâm cài hoàn thiện tỉ mỉ, màu sắc tự nhiên rất sang. Đeo đi sự kiện nào cũng được hỏi mua ở đâu.',
    name: 'Lê Minh Anh',
    role: 'TP. Hồ Chí Minh',
    avatar: undefined as string | undefined,
  },
  {
    mockup: true,
    quote:
      'Mua bộ quà tặng Vân Mộc cho bố mẹ. Đóng gói chỉn chu, món quà mang ý nghĩa làng nghề rất đáng giữ.',
    name: 'Trần Quốc Bảo',
    role: 'Đà Nẵng',
    avatar: undefined as string | undefined,
  },
]

const CUSTOM_STEPS = [
  {
    step: '01',
    icon: ImageIcon,
    title: 'Gửi hình mẫu',
    desc: 'Gửi hình ảnh hoặc ý tưởng về sản phẩm bạn mong muốn.',
  },
  {
    step: '02',
    icon: MessageCircle,
    title: 'Nhận tư vấn',
    desc: 'Vân Mộc tư vấn kiểu dáng, chất liệu, kích thước phù hợp.',
  },
  {
    step: '03',
    icon: PencilLine,
    title: 'Xác nhận thiết kế',
    desc: 'Thống nhất bản thiết kế trước khi chế tác.',
  },
  {
    step: '04',
    icon: HandHeart,
    title: 'Chế tác thủ công',
    desc: 'Nghệ nhân làng nghề Thụy Ứng trực tiếp chế tác, hoàn thiện từng chi tiết.',
  },
]

/** Thay logo/tên bằng đơn vị thật khi có. logo: đường dẫn ảnh hoặc undefined. */
const PARTNERS = [
  {
    id: 'lang-nghe',
    name: 'Làng nghề Thụy Ứng',
    emblem: 'village' as const,
    logo: undefined as string | undefined,
    href: undefined as string | undefined,
  },
  {
    id: 'hop-tac-xa',
    name: 'Hợp tác xã thủ công',
    emblem: 'coop' as const,
    logo: undefined as string | undefined,
    href: undefined as string | undefined,
  },
  {
    id: 'bao-ton',
    name: 'Trung tâm bảo tồn di sản',
    emblem: 'heritage' as const,
    logo: undefined as string | undefined,
    href: undefined as string | undefined,
  },
  {
    id: 'du-lich',
    name: 'Du lịch làng nghề',
    emblem: 'tourism' as const,
    logo: undefined as string | undefined,
    href: undefined as string | undefined,
  },
  {
    id: 'nghe-nhan',
    name: 'Hội nghệ nhân Thụy Ứng',
    emblem: 'artisan' as const,
    logo: undefined as string | undefined,
    href: undefined as string | undefined,
  },
]

type PartnerEmblem = (typeof PARTNERS)[number]['emblem']

function PartnerEmblemMark({ type }: { type: PartnerEmblem }) {
  const common = {
    className: 'partner-emblem',
    viewBox: '0 0 64 64',
    fill: 'none',
    'aria-hidden': true as const,
  }

  switch (type) {
    case 'village':
      return (
        <svg {...common}>
          <path d="M32 8c-1.5 8-8 14-16 16 8 1.5 14.5 8 16 16 1.5-8 8-14.5 16-16-8-2-14.5-8-16-16Z" stroke="currentColor" strokeWidth="1.35" />
          <path d="M32 22v28M22 34h20" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          <circle cx="32" cy="32" r="22" stroke="currentColor" strokeWidth="1" opacity="0.45" />
        </svg>
      )
    case 'coop':
      return (
        <svg {...common}>
          <path d="M20 42V24l12-10 12 10v18" stroke="currentColor" strokeWidth="1.35" strokeLinejoin="round" />
          <path d="M26 42V30h12v12" stroke="currentColor" strokeWidth="1.2" />
          <path d="M16 46h32" stroke="currentColor" strokeWidth="1.15" strokeLinecap="round" />
          <circle cx="32" cy="32" r="22" stroke="currentColor" strokeWidth="1" opacity="0.45" />
        </svg>
      )
    case 'heritage':
      return (
        <svg {...common}>
          <path d="M18 44V28l14-12 14 12v16" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
          <path d="M24 44V34h16v10" stroke="currentColor" strokeWidth="1.15" />
          <path d="M32 16v6M26 44h12" stroke="currentColor" strokeWidth="1.15" strokeLinecap="round" />
          <path d="M22 24c3-4 7-6 10-6s7 2 10 6" stroke="currentColor" strokeWidth="1" opacity="0.7" />
          <circle cx="32" cy="32" r="22" stroke="currentColor" strokeWidth="1" opacity="0.45" />
        </svg>
      )
    case 'tourism':
      return (
        <svg {...common}>
          <path d="M18 40c6-14 12-22 14-22s8 8 14 22" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          <path d="M22 40h20" stroke="currentColor" strokeWidth="1.15" strokeLinecap="round" />
          <path d="M32 18v6M26 30h12" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" opacity="0.75" />
          <circle cx="32" cy="32" r="22" stroke="currentColor" strokeWidth="1" opacity="0.45" />
        </svg>
      )
    case 'artisan':
      return (
        <svg {...common}>
          <path d="M22 40c2-12 6-20 10-24 4 4 8 12 10 24" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" />
          <path d="M26 36c3-2 6-3 6-3s3 1 6 3" stroke="currentColor" strokeWidth="1.15" strokeLinecap="round" />
          <path d="M28 28c2.5-1.5 4-2 4-2s1.5.5 4 2" stroke="currentColor" strokeWidth="1.05" strokeLinecap="round" opacity="0.8" />
          <circle cx="32" cy="32" r="22" stroke="currentColor" strokeWidth="1" opacity="0.45" />
        </svg>
      )
  }
}

function SectionHeading({
  title,
  description,
  light = false,
}: {
  title: string
  description?: string
  light?: boolean
}) {
  return (
    <div className="text-center space-y-2 max-w-2xl mx-auto">
      <h2
        className={`text-2xl md:text-3xl lg:text-[34px] leading-tight tracking-wide ${
          light ? 'text-[#fff2dc]' : 'text-[#241a13]'
        }`}
      >
        {title}
      </h2>
      <div className={`w-12 h-px mx-auto ${light ? 'bg-[#c9973a]/80' : 'bg-[#9a6b1f]'}`} />
      {description ? (
        <p
          className={`text-sm md:text-base leading-relaxed pt-1 ${
            light ? 'text-[#fff2dc]/85' : 'text-[#3f3228]'
          }`}
        >
          {description}
        </p>
      ) : null}
    </div>
  )
}

function Stars() {
  return (
    <div className="flex gap-0.5" aria-label="5 sao">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} size={13} className="text-accent-gold fill-[#9a6b1f]" />
      ))}
    </div>
  )
}

function ProductCard({
  name,
  category,
  price,
  badge,
  image,
  imagePosition,
  href,
}: (typeof FEATURED_PRODUCTS)[number]) {
  return (
    <article className="featured-product-card group flex h-full flex-col overflow-hidden rounded-[0.9rem] border border-[#8a5c2d]/15 bg-[#fffaf0]/90">
      <div className="relative">
        <Link to={href} className="block overflow-hidden bg-[#dfc8a7]">
          <div className="aspect-[1.18/1] overflow-hidden">
            <img
              src={image}
              alt={name}
              className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.045]"
              style={{ objectPosition: imagePosition }}
            />
          </div>
        </Link>
        {badge ? (
          <span className="absolute left-3.5 top-3.5 rounded-[0.3rem] border border-[#fff2dc]/20 bg-[#7b3b24]/92 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#fff8e7] shadow-sm">
            {badge}
          </span>
        ) : null}
      </div>
      <div className="relative flex flex-1 flex-col px-5 pb-5 pt-4.5">
        <svg
          className="pointer-events-none absolute -bottom-5 -right-5 h-28 w-28 text-[#9a6b1f]/10"
          viewBox="0 0 100 100"
          fill="none"
          stroke="currentColor"
          aria-hidden
        >
          <path d="M50 91C31 77 22 60 26 43c4-16 16-26 24-34 8 8 20 18 24 34 4 17-5 34-24 48Z" />
          <path d="M50 18v67M50 38c-9-7-14-8-20-7M50 50c11-8 17-9 24-7M50 63c-9-6-15-7-21-5" />
        </svg>
        <p className="relative text-[12px] font-medium uppercase tracking-[0.15em] text-[#7a624c]">{category}</p>
        <Link to={href} className="relative mt-2 block">
          <h3 className="text-[17px] font-semibold leading-snug text-[#241a13] transition-colors hover:text-[#7a4e20] md:text-lg">{name}</h3>
        </Link>
        <div className="relative mt-1.5 flex items-baseline gap-2">
          <p className="text-base font-semibold text-[#9a6b1f]">{price}</p>
        </div>
        <div className="relative mt-4 flex items-center justify-between border-t border-[#9a6b1f]/15 pt-3">
          <button
            type="button"
            className="shop-product-card__buy-now"
            aria-label={`Mua ngay ${name}`}
          >
            Mua ngay
          </button>
          <button
            type="button"
            className="shop-product-card__cart"
            aria-label={`Thêm ${name} vào giỏ hàng`}
          >
            <ShoppingCart size={17} />
          </button>
        </div>
      </div>
    </article>
  )
}

function FeaturedProductsCarousel() {
  const trackRef = useRef<HTMLDivElement>(null)
  const [progress, setProgress] = useState(0)
  const [atStart, setAtStart] = useState(true)
  const [atEnd, setAtEnd] = useState(false)

  useEffect(() => {
    const track = trackRef.current
    if (!track) return

    const updateScrollState = () => {
      const maxScroll = Math.max(track.scrollWidth - track.clientWidth, 0)
      const nextProgress = maxScroll ? track.scrollLeft / maxScroll : 0
      setProgress(nextProgress)
      setAtStart(track.scrollLeft <= 2)
      setAtEnd(maxScroll - track.scrollLeft <= 2)
    }

    updateScrollState()
    const observer = new ResizeObserver(updateScrollState)
    observer.observe(track)
    track.addEventListener('scroll', updateScrollState, { passive: true })

    return () => {
      observer.disconnect()
      track.removeEventListener('scroll', updateScrollState)
    }
  }, [])

  const moveCarousel = (direction: -1 | 1) => {
    const track = trackRef.current
    const firstCard = track?.firstElementChild as HTMLElement | null
    if (!track || !firstCard) return

    const gap = Number.parseFloat(getComputedStyle(track).columnGap) || 0
    track.scrollBy({ left: direction * (firstCard.offsetWidth + gap), behavior: 'smooth' })
  }

  return (
    <div>
      <div className="mb-7 grid items-end gap-5 md:mb-8 md:grid-cols-[1fr_auto_1fr]">
        <span className="hidden md:block" aria-hidden />
        <div className="max-w-3xl text-center md:px-6">
          <div className="mx-auto mb-3 flex w-24 items-center gap-2 text-[#9a6b1f]/75" aria-hidden>
            <span className="h-px flex-1 bg-current" />
            <span className="size-1.5 rotate-45 border border-current" />
            <span className="h-px flex-1 bg-current" />
          </div>
          <h2 className="text-2xl leading-tight tracking-wide text-[#241a13] md:text-3xl lg:text-[36px]">
            Những sản phẩm được yêu thích
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm italic leading-relaxed text-[#3f3228] md:text-[15px]">
            Mỗi sản phẩm là sự kết tinh của chất liệu sừng tự nhiên và bàn tay người thợ Thụy Ứng.
          </p>
        </div>
        <div className="flex justify-center gap-2.5 md:justify-end md:pb-1">
          <button
            type="button"
            className="carousel-arrow"
            aria-label="Xem sản phẩm trước"
            disabled={atStart}
            onClick={() => moveCarousel(-1)}
          >
            <ChevronLeft size={19} strokeWidth={1.6} />
          </button>
          <button
            type="button"
            className="carousel-arrow"
            aria-label="Xem sản phẩm tiếp theo"
            disabled={atEnd}
            onClick={() => moveCarousel(1)}
          >
            <ChevronRight size={19} strokeWidth={1.6} />
          </button>
        </div>
      </div>

      <div
        ref={trackRef}
        className="featured-products-track"
        aria-label="Sản phẩm nổi bật"
        tabIndex={0}
      >
        {FEATURED_PRODUCTS.map((product) => (
          <ProductCard key={product.id} {...product} />
        ))}
      </div>

      <div className="mx-auto mt-7 h-[3px] w-32 overflow-hidden rounded-full bg-[#8a5c2d]/18" aria-hidden>
        <span
          className="block h-full rounded-full bg-[#9a5628] transition-[width] duration-150"
          style={{ width: `${22 + progress * 78}%` }}
        />
      </div>
    </div>
  )
}

function PartnerCard({
  name,
  emblem,
  logo,
  href,
}: (typeof PARTNERS)[number]) {
  const content = (
    <>
      <div className="partner-card__mark">
        {logo ? (
          <img src={logo} alt="" className="partner-card__logo" />
        ) : (
          <PartnerEmblemMark type={emblem} />
        )}
      </div>
      <p className="partner-card__name">{name}</p>
    </>
  )

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className="partner-card"
        aria-label={name}
      >
        {content}
      </a>
    )
  }

  return (
    <article className="partner-card" aria-label={name}>
      {content}
    </article>
  )
}

function PartnersRow() {
  const trackRef = useRef<HTMLDivElement>(null)
  const [paused, setPaused] = useState(false)
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const pause = () => {
    setPaused(true)
    if (resumeTimer.current) clearTimeout(resumeTimer.current)
  }

  const scheduleResume = () => {
    if (resumeTimer.current) clearTimeout(resumeTimer.current)
    resumeTimer.current = setTimeout(() => setPaused(false), 1800)
  }

  useEffect(() => {
    return () => {
      if (resumeTimer.current) clearTimeout(resumeTimer.current)
    }
  }, [])

  useEffect(() => {
    const track = trackRef.current
    if (!track) return

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (prefersReduced) return

    let frame = 0
    let last = performance.now()

    const tick = (now: number) => {
      const delta = now - last
      last = now

      if (!paused) {
        const maxScroll = track.scrollWidth - track.clientWidth
        if (maxScroll > 4) {
          track.scrollLeft += delta * 0.018
          if (track.scrollLeft >= maxScroll - 1) {
            track.scrollLeft = 0
          }
        }
      }

      frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [paused])

  return (
    <div
      className="partners-row"
      onMouseEnter={pause}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={pause}
      onBlurCapture={() => setPaused(false)}
      onPointerDown={pause}
      onPointerUp={scheduleResume}
      onTouchStart={pause}
      onTouchEnd={scheduleResume}
    >
      <div
        ref={trackRef}
        className="partners-track"
        aria-label="Đơn vị đồng hành"
        tabIndex={0}
      >
        {PARTNERS.map((partner) => (
          <PartnerCard key={partner.id} {...partner} />
        ))}
      </div>
    </div>
  )
}

export function HomePage() {
  const messengerHref = MESSENGER_URL || undefined

  return (
    <div className="relative overflow-x-hidden">
      <ScrollProgress />

      {/* Hero: editorial split composition with copy left and craft still life right. */}
      <section className="home-hero">
        <picture>
          <source media="(max-width: 767px)" srcSet="/assets/herobanner-mobile.png" />
          <img
            alt="Vân Mộc — thủ công từ sừng tự nhiên"
            className="home-hero__image"
            src="/assets/herobanner.jpg"
          />
        </picture>
        <div className="home-hero__wash" aria-hidden />
        <div className="home-hero__grain" aria-hidden />
        <div className="home-hero__content">
          <div className="home-hero__copy">
            <div className="home-hero__eyebrow">
              <span aria-hidden />
              Thủ công từ làng nghề Thụy Ứng
            </div>
            <p className="home-hero__brand">
              Vân Mộc
            </p>
            <div className="home-hero__rule" aria-hidden />
            <h1 className="home-hero__title">
              Tinh hoa thủ công
              <br />
              từ làng nghề Thụy Ứng
            </h1>
            <p className="home-hero__description">
              Chế tác từ sừng tự nhiên, lưu giữ vẻ đẹp truyền thống trong từng chiếc lược và trâm
              cài.
            </p>
            <div className="home-hero__actions">
              <Link
                to="/shop"
                className="home-hero__cta home-hero__cta--primary"
              >
                Khám phá sản phẩm
                <ArrowRight size={14} />
              </Link>
              <Link
                to="/villages"
                className="home-hero__cta home-hero__cta--secondary"
              >
                Câu chuyện làng nghề
              </Link>
            </div>
          </div>
        </div>
        <div className="home-hero__scroll" aria-hidden>
          <span />
          Cuộn để khám phá
        </div>
      </section>

      {/* Giá trị thương hiệu */}
      <section className="bg-paper-warm overflow-hidden py-14 md:py-20">
        <SectionDecor variant="warm" showMotif />
        <div className="relative z-10 container mx-auto px-5 md:px-8 space-y-7 md:space-y-9">
          <Reveal>
            <SectionHeading
              title="Vẹn nguyên bản, nét riêng bạn"
              description="Vân Mộc tiếp nối nghề chế tác sừng truyền thống của làng Thụy Ứng, gìn giữ vẻ đẹp nguyên bản của chất liệu qua đôi tay và kinh nghiệm của người thợ."
            />
          </Reveal>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <Reveal className="mx-auto w-full max-w-xl px-3 py-4 lg:mx-0 lg:max-w-none">
              <figure className="heritage-frame">
                <div className="heritage-frame__backdrop" aria-hidden />
                <div className="heritage-frame__body">
                  <svg
                    className="heritage-frame__corner heritage-frame__corner--top"
                    viewBox="0 0 72 72"
                    fill="none"
                    aria-hidden
                  >
                    <path d="M4 52V15C4 9 9 4 15 4h37" />
                    <path d="M11 42V20c0-5 4-9 9-9h22" />
                    <path d="M4 30c13 0 24-11 24-24" />
                    <path d="M17 17c8 2 13 7 15 15" />
                    <path d="M11 11l6 6-6 6-6-6 6-6Z" />
                  </svg>

                  <div className="heritage-frame__image-wrap">
                    <img
                      src="/image/nghe-nhan-che-tac.jpg"
                      alt="Gian hàng sản phẩm sừng thủ công của làng nghề Thụy Ứng"
                      className="size-full object-cover"
                    />
                    <svg
                      className="heritage-frame__grain"
                      viewBox="0 0 800 500"
                      preserveAspectRatio="none"
                      fill="none"
                      aria-hidden
                    >
                      <path d="M-30 84C128 25 223 133 379 76s264 42 451-18" />
                      <path d="M-40 132c142-54 267 50 408-8s279 29 472-31" />
                      <path d="M-25 405c169-72 261 47 422-18s261 32 441-27" />
                    </svg>
                  </div>

                  <svg
                    className="heritage-frame__corner heritage-frame__corner--bottom"
                    viewBox="0 0 72 72"
                    fill="none"
                    aria-hidden
                  >
                    <path d="M4 52V15C4 9 9 4 15 4h37" />
                    <path d="M11 42V20c0-5 4-9 9-9h22" />
                    <path d="M4 30c13 0 24-11 24-24" />
                    <path d="M17 17c8 2 13 7 15 15" />
                    <path d="M11 11l6 6-6 6-6-6 6-6Z" />
                  </svg>
                </div>

                <figcaption className="heritage-frame__caption">
                  <span>Làng nghề Thụy Ứng</span>
                  <span className="heritage-frame__caption-mark" aria-hidden />
                </figcaption>

                <div className="heritage-frame__seal" aria-hidden>
                  <svg viewBox="0 0 64 64" fill="none">
                    <path d="M13 37c3-14 12-23 28-25 6-1 10 2 11 7l1 7c1 4-2 7-6 7H24" />
                    <path d="M17 36 12 52M23 35l-3 18M29 34l-1 19M35 34l1 18M41 33l3 17" />
                    <path d="M19 31c7-10 16-14 29-14" />
                    <path d="M24 27c5-5 12-8 21-8" />
                  </svg>
                </div>
              </figure>
            </Reveal>

            <Reveal className="space-y-0 delay-150">
              {BRAND_VALUES.map((item, index) => (
                <div
                  key={item.step}
                  className={`flex gap-5 md:gap-6 py-4 md:py-5 ${
                    index < BRAND_VALUES.length - 1 ? 'border-b border-[#9a6b1f]/35' : ''
                  }`}
                >
                  <span className="font-display text-2xl md:text-3xl text-[#9f321f] leading-none shrink-0 w-10">
                    {item.step}
                  </span>
                  <div className="space-y-1.5 pt-0.5">
                    <h3 className="text-base md:text-lg font-semibold text-[#241a13]">{item.title}</h3>
                    <p className="text-sm leading-relaxed text-[#3f3228]">{item.desc}</p>
                  </div>
                </div>
              ))}
            </Reveal>
          </div>

          <Reveal className="text-center">
            <div className="inline-flex flex-col items-center gap-3">
              <svg
                className="h-4 w-28 text-accent-gold"
                viewBox="0 0 120 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                aria-hidden
              >
                <path d="M8 8 H42" />
                <path d="M78 8 H112" />
                <path d="M60 3 C64 6 64 10 60 13 C56 10 56 6 60 3 Z" />
              </svg>
              <p className="font-display max-w-xl text-lg italic leading-relaxed text-[#3f3228] md:text-xl">
                “Mỗi đường vân là một dấu vết riêng của tự nhiên.”
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Sản phẩm nổi bật */}
      <section className="bg-paper-cream overflow-hidden py-16 md:py-20">
        <SectionDecor variant="light" />
        <div className="relative z-10 container mx-auto px-5 md:px-8">
          <Reveal>
            <FeaturedProductsCarousel />
          </Reveal>
          <Reveal className="pt-8 text-center md:pt-9">
            <Link
              to="/shop"
              className="inline-flex items-center gap-3 rounded-[0.65rem] border border-[#6b4423]/75 bg-[#fff8e7]/35 px-7 py-3 text-sm font-semibold text-[#4a2f1c] shadow-[0_4px_12px_rgba(63,42,26,0.05)] transition-colors hover:bg-[#5c4030] hover:text-[#fff8e7]"
            >
              Xem tất cả sản phẩm
              <ArrowRight size={15} />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* Giá trị sản phẩm — editorial layout */}
      <section className="bg-paper-sand overflow-hidden py-14 md:py-20">
        <SectionDecor variant="warm" />
        <div className="relative z-10 container mx-auto px-5 md:px-8">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-6 xl:gap-10">
            {/* Left: rounded rectangular craft frame */}
            <Reveal className="lg:col-span-5 xl:col-span-6">
              <figure className="material-frame mx-auto max-w-md md:max-w-[500px] lg:max-w-[480px]">
                <div className="material-frame__border">
                  <div className="material-frame__inner">
                    <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[1.35rem] md:rounded-[1.75rem]">
                      <img
                        src="/image/products/luoc-rang-thua.jpg"
                        alt="Cận cảnh chất liệu sừng tự nhiên với đường vân độc bản"
                        className="size-full object-cover object-center"
                      />
                      <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#2e1f14]/55 to-transparent" />
                      <div className="absolute bottom-6 left-5 right-8 z-10 md:bottom-8 md:left-7">
                        <div className="flex items-start gap-2">
                          <Sparkles size={12} className="mt-1 shrink-0 text-[#c9973a]" strokeWidth={1.5} />
                          <div>
                            <p className="text-sm font-semibold text-[#fff2dc]">Chất liệu nguyên bản</p>
                            <p className="mt-0.5 text-xs leading-relaxed text-[#fff2dc]/90">
                              Mỗi đường vân được tạo nên bởi tự nhiên.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Small symmetrical craft corner ornaments */}
                  <svg
                    className="material-frame__ornament material-frame__ornament--tl"
                    viewBox="0 0 28 28"
                    fill="none"
                    aria-hidden
                  >
                    <path d="M4 18V8c0-2.2 1.8-4 4-4h10" />
                    <path d="M8 14V10c0-1.1.9-2 2-2h4" />
                    <path d="M8 8l3 3-3 3-3-3 3-3Z" />
                  </svg>
                  <svg
                    className="material-frame__ornament material-frame__ornament--tr"
                    viewBox="0 0 28 28"
                    fill="none"
                    aria-hidden
                  >
                    <path d="M4 18V8c0-2.2 1.8-4 4-4h10" />
                    <path d="M8 14V10c0-1.1.9-2 2-2h4" />
                    <path d="M8 8l3 3-3 3-3-3 3-3Z" />
                  </svg>
                  <svg
                    className="material-frame__ornament material-frame__ornament--bl"
                    viewBox="0 0 28 28"
                    fill="none"
                    aria-hidden
                  >
                    <path d="M4 18V8c0-2.2 1.8-4 4-4h10" />
                    <path d="M8 14V10c0-1.1.9-2 2-2h4" />
                    <path d="M8 8l3 3-3 3-3-3 3-3Z" />
                  </svg>
                  <svg
                    className="material-frame__ornament material-frame__ornament--br"
                    viewBox="0 0 28 28"
                    fill="none"
                    aria-hidden
                  >
                    <path d="M4 18V8c0-2.2 1.8-4 4-4h10" />
                    <path d="M8 14V10c0-1.1.9-2 2-2h4" />
                    <path d="M8 8l3 3-3 3-3-3 3-3Z" />
                  </svg>
                </div>
              </figure>
            </Reveal>

            {/* Right: headline + 2×2 values */}
            <div className="lg:col-span-7 xl:col-span-6 space-y-8 md:space-y-10">
              <Reveal>
                <div className="space-y-3 max-w-xl">
                  <h2 className="text-2xl leading-tight tracking-wide text-[#241a13] md:text-3xl lg:text-[34px]">
                    Vẻ đẹp đến từ chất liệu nguyên bản
                  </h2>
                  <div className="w-12 h-px bg-[#9a6b1f]" />
                  <p className="text-sm leading-relaxed text-[#3f3228] md:text-base">
                    Vân Mộc mang vẻ đẹp tự nhiên của chất liệu sừng vào từng sản phẩm, để mỗi đường
                    vân, sắc màu đều kể một câu chuyện riêng.
                  </p>
                </div>
              </Reveal>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-8 md:gap-y-10">
                {PRODUCT_VALUES.map((item, i) => (
                  <Reveal key={item.title} className={i % 2 === 1 ? 'delay-150' : i >= 2 ? 'delay-75' : ''}>
                    <div className="flex gap-3.5">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-[rgba(92,64,48,0.07)] text-accent-gold">
                        <item.icon size={20} strokeWidth={1.4} />
                      </span>
                      <div className="space-y-1.5 min-w-0">
                        <h3 className="text-[15px] font-semibold text-[#241a13]">{item.title}</h3>
                        <p className="text-sm leading-relaxed text-[#3f3228]">{item.desc}</p>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quy trình chế tác */}
      <section className="bg-paper-mist overflow-hidden py-14 md:py-20">
        <SectionDecor variant="light" />
        <div className="relative z-10 container mx-auto px-5 md:px-8 space-y-7 md:space-y-10">
          <Reveal>
            <SectionHeading
              title="Qua đôi tay người thợ"
              description="Mỗi sản phẩm trải qua nhiều công đoạn để giữ được vẻ đẹp của chất liệu và sự chỉn chu trong từng chi tiết."
            />
          </Reveal>
          {/* Desktop: ngang · Mobile: dọc */}
          <Reveal>
            <ol className="relative flex flex-col gap-8 md:flex-row md:gap-0 md:items-start">
              <div
                className="pointer-events-none absolute left-[1.15rem] top-3 bottom-3 w-px bg-[#9a6b1f]/60 md:left-[8%] md:right-[8%] md:top-5 md:bottom-auto md:h-px md:w-auto"
                aria-hidden
              />
              {CRAFT_STEPS.map((step) => (
                <li
                  key={step.step}
                  className="relative flex gap-5 md:flex-1 md:flex-col md:items-center md:text-center md:gap-4 md:px-3"
                >
                  <span className="relative z-10 flex size-9 shrink-0 items-center justify-center rounded-full border border-[#9a6b1f] bg-[#fff8e7]/95 font-display text-sm text-ink md:size-10 md:text-base">
                    {step.step}
                  </span>
                  <div className="space-y-1.5 pt-0.5 md:pt-0">
                    <h3 className="text-sm font-semibold text-[#241a13] md:text-[15px]">{step.title}</h3>
                    <p className="text-xs leading-relaxed text-[#3f3228] md:max-w-[160px] md:text-[13px] lg:max-w-[180px]">
                      {step.desc}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </Reveal>
        </div>
      </section>

      {/* Chế tác theo yêu cầu */}
      <section className="custom-craft-section py-16 md:py-24">
        <div className="custom-craft-grain" aria-hidden />
        <svg className="custom-craft-mountains" viewBox="0 0 420 180" fill="none" aria-hidden>
          <path d="M8 148c42-48 78-78 118-78 28 0 48 18 72 18 36 0 58-38 96-38 34 0 62 28 88 52 14 13 28 24 38 28" />
          <path d="M48 156c36-32 68-54 104-54 30 0 46 16 74 16 40 0 66-34 98-34 24 0 48 18 70 36" />
          <path d="M0 168h420" />
        </svg>

        <div className="relative z-10 mx-auto grid max-w-[1440px] items-center gap-10 px-5 md:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.08fr)] lg:gap-8 xl:gap-14">
          <Reveal className="custom-collage-wrap">
            <p className="custom-collage-label" aria-hidden>
              Thủ công từ chất liệu thiên nhiên
            </p>

            <div className="custom-collage" aria-label="Câu chuyện từ ý tưởng đến sản phẩm thủ công">
              <svg className="custom-flower custom-flower--a" viewBox="0 0 48 48" fill="none" aria-hidden>
                <circle cx="24" cy="24" r="3.2" fill="currentColor" opacity="0.55" />
                <path d="M24 8c2.4 5 2.4 9.2 0 14-2.4-4.8-2.4-9 0-14ZM24 26c2.4 5 2.4 9.2 0 14-2.4-4.8-2.4-9 0-14ZM8 24c5-2.4 9.2-2.4 14 0-4.8 2.4-9 2.4-14 0ZM26 24c5-2.4 9.2-2.4 14 0-4.8 2.4-9 2.4-14 0Z" fill="currentColor" opacity="0.72" />
              </svg>
              <svg className="custom-flower custom-flower--b" viewBox="0 0 40 40" fill="none" aria-hidden>
                <circle cx="20" cy="20" r="2.4" fill="currentColor" opacity="0.5" />
                <path d="M20 7c1.9 4 1.9 7.4 0 11.2C18.1 14.4 18.1 11 20 7ZM20 22c1.9 4 1.9 7.4 0 11.2C18.1 29.4 18.1 26 20 22ZM7 20c4-1.9 7.4-1.9 11.2 0C14.4 21.9 11 21.9 7 20ZM22 20c4-1.9 7.4-1.9 11.2 0C29.4 21.9 26 21.9 22 20Z" fill="currentColor" opacity="0.7" />
              </svg>
              <svg className="custom-flower custom-flower--c" viewBox="0 0 36 36" fill="none" aria-hidden>
                <circle cx="18" cy="18" r="2" fill="currentColor" opacity="0.45" />
                <path d="M18 6c1.7 3.5 1.7 6.5 0 10-1.7-3.5-1.7-6.5 0-10ZM18 20c1.7 3.5 1.7 6.5 0 10-1.7-3.5-1.7-6.5 0-10ZM6 18c3.5-1.7 6.5-1.7 10 0-3.5 1.7-6.5 1.7-10 0ZM20 18c3.5-1.7 6.5-1.7 10 0-3.5 1.7-6.5 1.7-10 0Z" fill="currentColor" opacity="0.65" />
              </svg>

              <figure className="custom-photo custom-photo--main">
                <img
                  src="/image/products/tram-hoa-sen.jpg"
                  alt="Những mẫu trâm cài bằng sừng được chạm khắc thủ công"
                />
              </figure>
              <figure className="custom-photo custom-photo--craft">
                <img
                  src="/image/nghe-nhan-che-tac.jpg"
                  alt="Nghệ nhân Thụy Ứng chế tác sản phẩm thủ công"
                />
              </figure>
              <figure className="custom-photo custom-photo--detail">
                <img
                  src="/image/products/luoc-rang-thua.jpg"
                  alt="Chi tiết đường vân và dáng lược sừng hoàn thiện"
                />
              </figure>

              <figure className="custom-sketch-note">
                <img
                  src="/image/custom-craft-sketch-paper.png"
                  alt="Từ ý tưởng đến tác phẩm riêng của bạn"
                />
              </figure>
            </div>
          </Reveal>

          <Reveal className="custom-info-panel delay-150">
            <div className="custom-panel-side" aria-hidden>
              <svg className="custom-panel-lotus" viewBox="0 0 120 150" fill="none">
                <path d="M60 142c1-38 0-72-1-100" />
                <path d="M59 44C40 34 35 18 42 2c12 6 18 16 18 30 0-14 8-24 21-29 5 17-1 31-22 41Z" />
                <path d="M58 58c-19-8-32-5-40 8 13 9 27 9 40-1M60 78c21-10 35-8 43 6-13 11-28 11-43 1" />
                <path d="M58 32C49 26 49 16 58 6c10 10 10 19 1 26" />
              </svg>
              <p className="custom-panel-side-label">Giữ gìn tinh hoa thủ công Việt</p>
            </div>

            <header className="relative z-10 max-w-2xl">
              <div className="flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.28em] text-[#876342] md:text-[11px]">
                <span className="h-px w-8 bg-[#ad7a38]" />
                Dịch vụ chế tác riêng
              </div>
              <h2 className="mt-3.5 max-w-xl text-[1.85rem] leading-[1.15] text-[#241a13] md:text-[2.35rem] lg:text-[2.55rem]">
                Chế tác riêng từ ý tưởng của bạn
                <span className="custom-seal custom-seal--inline" aria-hidden>
                  <svg viewBox="0 0 32 32" fill="none">
                    <rect x="1.5" y="1.5" width="29" height="29" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
                    <path d="M10 8.5h12M10 16h12M10 23.5h12M16 8.5v15" stroke="currentColor" strokeWidth="1.3" />
                    <path d="M8.5 11.5c3.2-1.8 7.2-2 11.2-.4M8.5 19c3.4-1.5 7-1.6 11.2-.2" stroke="currentColor" strokeWidth="1.1" />
                  </svg>
                </span>
              </h2>

            </header>

            <ol className="relative z-10 mt-6 grid gap-3 sm:grid-cols-2 sm:gap-3.5">
              {CUSTOM_STEPS.map((step) => (
                <li key={step.step} className="custom-step-card">
                  <div className="custom-step-head">
                    <span className="custom-step-number">{step.step}</span>
                    <span className="custom-step-icon" aria-hidden>
                      <step.icon size={20} strokeWidth={1.4} />
                    </span>
                  </div>
                  <h3>{step.title}</h3>
                  <p>{step.desc}</p>
                </li>
              ))}
            </ol>

            <div className="relative z-10 mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <Link
                to="/custom-order"
                className="inline-flex min-h-12 items-center justify-center gap-2.5 rounded-full bg-[#5a301a] px-8 py-3 text-sm font-semibold text-[#fff3dd] shadow-[0_6px_14px_rgba(65,35,19,0.14)] transition-colors hover:bg-[#3f2517]"
              >
                Gửi yêu cầu chế tác
                <ArrowRight size={15} />
              </Link>
              {messengerHref ? (
                <a
                  href={messengerHref}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-12 items-center justify-center gap-2.5 rounded-full border border-[#6e4932]/7 bg-[#fff9ec]/40 px-7 py-3 text-sm font-semibold text-[#4b3324] transition-colors hover:bg-[#fff8e7]/85"
                >
                  <MessageCircle size={16} strokeWidth={1.5} />
                  Tư vấn qua Messenger
                </a>
              ) : (
                <span
                  title="Cập nhật MESSENGER_URL khi có fanpage"
                  className="inline-flex min-h-12 cursor-not-allowed items-center justify-center gap-2.5 rounded-full border border-[#6e4932]/35 bg-[#fff9ec]/20 px-7 py-3 text-sm font-semibold text-[#6b5340]"
                >
                  <MessageCircle size={16} strokeWidth={1.5} />
                  Tư vấn qua Messenger
                </span>
              )}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Đánh giá khách hàng */}
      <section className="bg-paper-grain overflow-hidden py-14 md:py-20">
        <SectionDecor variant="warm" />
        <div className="relative z-10 container mx-auto px-5 md:px-8 space-y-7 md:space-y-8">
          <Reveal>
            <SectionHeading title="Cảm nhận từ khách hàng" />
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
            {REVIEWS.map((review, i) => (
              <Reveal
                key={review.name}
                className={`${i === 1 ? 'delay-150' : i === 2 ? 'delay-300' : ''} space-y-4 border-t border-[#9a6b1f]/40 pt-6`}
              >
                <Stars />
                <p className="text-sm italic leading-relaxed text-[#3f3228]">&ldquo;{review.quote}&rdquo;</p>
                <div className="flex items-center gap-3 pt-1">
                  {review.avatar ? (
                    <img
                      src={review.avatar}
                      alt=""
                      className="size-9 rounded-full object-cover"
                    />
                  ) : null}
                  <div>
                    <span className="block text-sm font-semibold text-[#241a13]">{review.name}</span>
                    <span className="block text-xs text-[#3f3228]">{review.role}</span>
                  </div>
                </div>
                {review.mockup ? (
                  <span className="sr-only">Nội dung đánh giá mẫu</span>
                ) : null}
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Đơn vị đồng hành */}
      <section className="partners-section overflow-hidden py-16 md:py-20">
        <div className="partners-section__grain" aria-hidden />
        <svg className="partners-section__corner partners-section__corner--tl" viewBox="0 0 80 80" fill="none" aria-hidden>
          <path d="M8 58V18c0-5.5 4.5-10 10-10h40" />
          <path d="M16 48V24c0-4 3.2-7.2 7.2-7.2H48" />
          <path d="M16 16l5 5-5 5-5-5 5-5Z" />
          <path d="M8 34c10 0 18-8 18-18" />
        </svg>
        <svg className="partners-section__corner partners-section__corner--tr" viewBox="0 0 80 80" fill="none" aria-hidden>
          <path d="M8 58V18c0-5.5 4.5-10 10-10h40" />
          <path d="M16 48V24c0-4 3.2-7.2 7.2-7.2H48" />
          <path d="M16 16l5 5-5 5-5-5 5-5Z" />
          <path d="M8 34c10 0 18-8 18-18" />
        </svg>
        <svg className="partners-section__corner partners-section__corner--bl" viewBox="0 0 80 80" fill="none" aria-hidden>
          <path d="M8 58V18c0-5.5 4.5-10 10-10h40" />
          <path d="M16 48V24c0-4 3.2-7.2 7.2-7.2H48" />
          <path d="M16 16l5 5-5 5-5-5 5-5Z" />
          <path d="M8 34c10 0 18-8 18-18" />
        </svg>
        <svg className="partners-section__corner partners-section__corner--br" viewBox="0 0 80 80" fill="none" aria-hidden>
          <path d="M8 58V18c0-5.5 4.5-10 10-10h40" />
          <path d="M16 48V24c0-4 3.2-7.2 7.2-7.2H48" />
          <path d="M16 16l5 5-5 5-5-5 5-5Z" />
          <path d="M8 34c10 0 18-8 18-18" />
        </svg>

        <div className="relative z-10 container mx-auto px-5 md:px-8 space-y-9 md:space-y-11">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center space-y-3">
              <div className="mx-auto mb-1 flex w-28 items-center gap-2 text-[#9a6b1f]/70" aria-hidden>
                <span className="h-px flex-1 bg-current" />
                <span className="size-1.5 rotate-45 border border-current" />
                <span className="h-px flex-1 bg-current" />
              </div>
              <h2 className="text-2xl leading-tight tracking-wide text-[#241a13] md:text-3xl lg:text-[34px]">
                Đơn vị đồng hành
              </h2>
              <div className="mx-auto h-px w-12 bg-[#9a6b1f]" />
              <p className="mx-auto max-w-xl pt-1 text-sm leading-relaxed text-[#3f3228] md:text-[15px]">
                Những đối tác đồng hành cùng Vân Mộc gìn giữ và lan tỏa nghề chế tác sừng truyền
                thống.
              </p>
            </div>
          </Reveal>

          <Reveal>
            <PartnersRow />
          </Reveal>
        </div>
      </section>
    </div>
  )
}
