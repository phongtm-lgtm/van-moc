import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Hand,
  Headset,
  Leaf,
  PackageCheck,
  Sparkles,
  Star,
  Truck,
  Hourglass,
} from 'lucide-react'
import { Reveal } from '../components/Reveal'
import { ScrollProgress } from '../components/ScrollProgress'
import { SectionDecor } from '../components/SectionDecor'
import { api, type Product } from '../api/catalog'
import { ProductCard } from '../components/ProductCard'

const BRAND_VALUES = [
  {
    step: '01',
    title: 'Chất liệu từ thiên nhiên',
    desc: 'Sử dụng sừng bò châu Phi – chất liệu bền bỉ, quý hiếm, mang vẻ đẹp tự nhiên và độc đáo.',
  },
  {
    step: '02',
    title: 'Tinh hoa thủ công truyền thống',
    desc: 'Được chế tác bởi những nghệ nhân làng nghề Thụy Ứng, với kỹ thuật thủ công tỉ mỉ, khéo léo qua nhiều công đoạn.',
  },
  {
    step: '03',
    title: 'Thiết kế hiện đại, gần gũi',
    desc: 'Kế thừa giá trị truyền thống, kết hợp cùng ngôn ngữ thiết kế tinh tế, phù hợp với phong cách sống hiện đại.',
  },
]

const PRODUCT_VALUES = [
  {
    icon: Leaf,
    title: 'Chất liệu sừng tự nhiên',
    desc: 'Mỗi sản phẩm sở hữu màu sắc và đường vân riêng biệt, tôn lên vẻ đẹp nguyên bản của chất liệu.',
  },
  {
    icon: Hand,
    title: 'Chế tác thủ công tỉ mỉ',
    desc: 'Được hoàn thiện qua bàn tay khéo léo của người thợ, chú trọng từng chi tiết và đường nét.',
  },
  {
    icon: Sparkles,
    title: 'Thiết kế tinh tế, độc đáo',
    desc: 'Sự giao thoa giữa nét đẹp truyền thống và phong cách hiện đại, phù hợp với nhiều cá tính và phong cách khác nhau.',
  },
  {
    icon: Hourglass,
    title: 'Gìn giữ giá trị làng nghề',
    desc: 'Mỗi sản phẩm góp phần lan tỏa tinh hoa nghề sừng Thụy Ứng và đưa nét đẹp thủ công truyền thống đến gần hơn với thế hệ trẻ.',
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

const REVIEWS = [
  {
    name: 'Chí Nguyện',
    quote: 'Lược sừng rất đẹp, vân tự nhiên độc đáo. Cầm chắc tay và được hoàn thiện tỉ mỉ.',
    image: '/image/VanMoc/Cảm nhận từ khách hàng (homepage)/Chí Nguyện.jpg',
  },
  {
    name: 'Mạnh Phong',
    quote: 'Mình thích nhất là mỗi sản phẩm có đường vân riêng, nhìn mộc mạc mà vẫn rất tinh tế.',
    image: '/image/VanMoc/Cảm nhận từ khách hàng (homepage)/Mạnh Phong.jpg',
  },
  {
    name: 'My Vũ',
    quote: 'Trâm cài tóc có thiết kế thanh lịch, tạo điểm nhấn nhẹ nhàng cho trang phục của mình.',
    image: '/image/VanMoc/Cảm nhận từ khách hàng (homepage)/My Vũ.jpg',
  },
  {
    name: 'Quyết Đạt',
    quote: 'Đẹp nhờ! Cho mua cái này!',
    image: '/image/VanMoc/Cảm nhận từ khách hàng (homepage)/Quyết Đạt.jpg',
  },
]

const CUSTOM_STEPS = [
  {
    step: '01',
    title: 'Gửi hình mẫu',
    desc: 'Gửi hình ảnh sản phẩm bạn mong muốn được khắc tên.',
  },
  {
    step: '02',
    title: 'Nhận tư vấn',
    desc: 'Vân Mộc tư vấn kích thước phông chữ, icon phù hợp.',
  },
  {
    step: '03',
    title: 'Xác nhận thiết kế',
    desc: 'Thống nhất bản thiết kế trước khi in tên.',
  },
  {
    step: '04',
    title: 'In laser',
    desc: 'Vân Mộc mang đến cửa hàng in tên trực tiếp, theo dõi từng chi tiết.',
  },
]

const SERVICES = [
  {
    icon: Truck,
    title: 'Giao hàng toàn quốc',
    description: 'Vận chuyển nhanh chóng toàn quốc, thanh toán sau khi nhận hàng.',
  },
  {
    icon: PackageCheck,
    title: 'Đóng gói cẩn thận',
    description: 'Hộp chống sốc, đệm lót kèm lụa ngăn ngừa trầy xước sản phẩm tối ưu trong suốt chuyến đi dài.',
  },
  {
    icon: CreditCard,
    title: 'Thanh toán đa dạng',
    description: 'Chấp nhận thẻ, ví điện tử, hoặc chuyển khoản ngân hàng quét mã QR siêu tốc.',
  },
  {
    icon: Headset,
    title: 'Hỗ trợ tận tâm 24/7',
    description: 'Đội ngũ chăm sóc, tư vấn trực hotline xử lý khiếu nại, phản hồi tức thì.',
  },
]

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
        <Star key={i} size={13} className="fill-[#e4bb69] text-[#e4bb69]" />
      ))}
    </div>
  )
}

function FeaturedProductsCarousel() {
  const trackRef = useRef<HTMLDivElement>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [retry, setRetry] = useState(0)
  const [progress, setProgress] = useState(0)
  const [atStart, setAtStart] = useState(true)
  const [atEnd, setAtEnd] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    api<Product[]>('/api/products/featured', controller.signal)
      .then(items => { if (!controller.signal.aborted) { setProducts(items); setError('') } })
      .catch((cause: Error) => { if (!controller.signal.aborted) setError(cause.message) })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [retry])

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
  }, [products])

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

      {loading && <p role="status" className="py-8 text-center">Đang tải sản phẩm…</p>}
      {error && <p role="alert" className="py-8 text-center">{error} <button type="button" onClick={() => { setLoading(true); setRetry(value => value + 1) }}>Thử lại</button></p>}
      {!loading && !error && !products.length && <p className="py-8 text-center text-[#3f3228]">Chưa có sản phẩm nổi bật. Khám phá các sản phẩm khác tại cửa hàng.</p>}
      <div
        ref={trackRef}
        className="featured-products-track"
        aria-label="Sản phẩm nổi bật"
        tabIndex={0}
      >
        {products.map((product) => (
          <ProductCard key={product.id} product={product} featured />
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

export function HomePage() {

  return (
    <div className="relative overflow-x-hidden">
      <ScrollProgress />

      {/* Hero: editorial split composition with copy left and craft still life right. */}
      <section className="home-hero">
        <img
          alt="Vân Mộc — thủ công từ sừng tự nhiên"
          className="home-hero__image"
          src="/image/VanMoc/banner%20V%C3%A2n%20M%E1%BB%99c.png"
        />
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
              description="Vân Mộc được hình thành từ tình yêu với làng nghề truyền thống Thụy Ứng – nơi hơn 400 năm gìn giữ tinh hoa chế tác sừng. Mỗi sản phẩm là sự kết tinh giữa bàn tay khéo léo của người thợ, giá trị di sản và hơi thở hiện đại, mang đến những món phụ kiện thủ công tinh xảo, đậm đà bản sắc người con đất Việt."
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

            <Reveal className="delay-150 lg:pl-3">
              <div className="mb-2 border-b border-[#9a6b1f]/35 pb-4 md:mb-3 md:pb-5">
                <h3 className="font-display text-2xl leading-tight text-[#241a13] md:text-[1.8rem]">
                  Ba giá trị nổi bật của Vân Mộc
                </h3>
              </div>
              <ol>
                {BRAND_VALUES.map((item, index) => (
                  <li
                    key={item.step}
                    className={`flex gap-4 py-3.5 md:gap-5 md:py-4 ${
                      index < BRAND_VALUES.length - 1 ? 'border-b border-[#9a6b1f]/35' : ''
                    }`}
                  >
                    <span className="w-10 shrink-0 font-display text-2xl leading-none text-[#9f321f] md:text-3xl" aria-hidden>
                      {item.step}
                    </span>
                    <div className="min-w-0 space-y-1">
                      <h4 className="text-base font-semibold text-[#241a13] md:text-lg">{item.title}</h4>
                      <p className="text-sm leading-relaxed text-[#3f3228]">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ol>
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
                        src="/image/VanMoc/Tại sao nên chọn Vân Mộc_ (homepage)/ảnh sản phẩm vân mộc.jpg"
                        alt="Các sản phẩm thủ công Vân Mộc từ sừng tự nhiên"
                        className="size-full object-cover object-center"
                      />
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
                     Tại sao nên chọn Vân Mộc?
                  </h2>
                  <div className="w-12 h-px bg-[#9a6b1f]" />
                  <p className="text-sm leading-relaxed text-[#3f3228] md:text-base">
                     Vân Mộc kết hợp tinh hoa chế tác sừng truyền thống của làng nghề Thụy Ứng với phong cách thiết kế hiện đại, tạo nên những món phụ kiện mang dấu ấn riêng.
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
                        <h3 className="text-[15px] font-semibold text-[#241a13]">0{i + 1}. {item.title}</h3>
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
          <Reveal>
            <figure className="material-frame mx-auto max-w-[760px]">
              <div className="material-frame__border">
                <div className="material-frame__inner">
                  <img
                    src="/image/VanMoc/Qua đôi tay người thợ (homepage)/Cựu chiến binh Nguyễn Văn sử cưa sừng chế tác sản phẩm..jpg"
                    alt="Người thợ cưa sừng để chế tác sản phẩm"
                    loading="lazy"
                    className="block h-auto w-full rounded-[1.2rem] md:rounded-[1.5rem]"
                  />
                </div>
              </div>
            </figure>
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

      {/* Khắc tên theo yêu cầu */}
      <section className="custom-craft-section bg-paper-warm py-16 md:py-24">
        <svg className="custom-craft-mountains" viewBox="0 0 420 180" fill="none" aria-hidden>
          <path d="M8 148c42-48 78-78 118-78 28 0 48 18 72 18 36 0 58-38 96-38 34 0 62 28 88 52 14 13 28 24 38 28" />
          <path d="M48 156c36-32 68-54 104-54 30 0 46 16 74 16 40 0 66-34 98-34 24 0 48 18 70 36" />
          <path d="M0 168h420" />
        </svg>

        <div className="relative z-10 mx-auto grid max-w-[1440px] items-center gap-10 px-5 md:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.08fr)] lg:gap-8 xl:gap-14">
          <Reveal className="min-w-0">
            <figure className="material-frame mx-auto max-w-[620px]">
              <div className="material-frame__border">
                <div className="material-frame__inner">
                  <img
                    src="/image/VanMoc/Trang Công Nghệ Laser/Dấu ấn mang tính cá nhân 2.png"
                    alt="Lược sừng Vân Mộc khắc tên riêng theo yêu cầu"
                    loading="lazy"
                    className="block h-auto w-full rounded-[1.2rem] md:rounded-[1.5rem]"
                  />
                </div>
              </div>
            </figure>
          </Reveal>

          <Reveal className="custom-info-panel delay-150">
            <header className="relative z-10 max-w-2xl">
              <div className="flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.28em] text-[#876342] md:text-[11px]">
                <span className="h-px w-8 bg-[#ad7a38]" />
                Dịch vụ khắc tên riêng
              </div>
              <h2 className="mt-3.5 max-w-xl text-[1.85rem] leading-[1.15] text-[#241a13] md:text-[2.35rem] lg:text-[2.55rem]">
                Khắc tên riêng theo ý tưởng của bạn
              </h2>

            </header>

            <ol className="custom-steps relative z-10 mt-8 grid sm:grid-cols-2">
              {CUSTOM_STEPS.map((step) => (
                <li key={step.step} className="custom-step-card">
                  <span className="custom-step-number">{step.step}</span>
                  <h3>{step.title}</h3>
                  <p>{step.desc}</p>
                </li>
              ))}
            </ol>

            <div className="relative z-10 mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <Link
                to="/cong-nghe-laser#kham-pha"
                className="inline-flex min-h-12 items-center justify-center gap-2.5 rounded-full bg-[#5a301a] px-8 py-3 text-sm font-semibold text-[#fff3dd] transition-colors hover:bg-[#3f2517]"
              >
                Gửi yêu cầu khắc tên
                <ArrowRight size={15} />
              </Link>
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
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4 xl:gap-4">
            {REVIEWS.map((review) => (
              <Reveal key={review.name} className="h-full">
                <article className="feedback-card">
                  <div className="feedback-card__media">
                    <img src={review.image} alt={`Ảnh của ${review.name}`} loading="lazy" />
                  </div>
                  <div className="feedback-card__content">
                    <h3>{review.name}</h3>
                    <Stars />
                    <blockquote>&ldquo;{review.quote}&rdquo;</blockquote>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Dịch vụ mua sắm */}
      <section className="home-services-section bg-paper-sand overflow-hidden py-12 md:py-16">
        <SectionDecor variant="light" />
        <div className="relative z-10 container mx-auto grid gap-4 px-5 sm:grid-cols-2 md:px-8 xl:grid-cols-4 xl:gap-5">
          {SERVICES.map((service) => (
            <Reveal key={service.title} className="h-full">
              <article className="home-service-card">
                <span className="home-service-card__icon" aria-hidden>
                  <service.icon size={24} strokeWidth={1.5} />
                </span>
                <div>
                  <h2>{service.title}</h2>
                  <p>{service.description}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  )
}
