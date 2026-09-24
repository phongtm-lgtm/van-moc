import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Droplets,
  Fingerprint,
  Leaf,
  MessageCircle,
  Sparkles,
  Star,
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
    name: 'Lược sừng răng thưa',
    category: 'Lược sừng',
    price: '320.000đ',
    badge: 'Bán chạy' as const,
    image: '/image/products/luoc-rang-thua.png',
    href: '/shop',
  },
  {
    id: 'luoc-bo-tui',
    name: 'Lược sừng bỏ túi',
    category: 'Lược sừng',
    price: '185.000đ',
    badge: 'Mới' as const,
    image: '/image/products/luoc-bo-tui.jpg',
    href: '/shop',
  },
  {
    id: 'tram-hoa-sen',
    name: 'Trâm cài hoa sen',
    category: 'Trâm cài',
    price: 'Liên hệ',
    badge: 'Độc bản' as const,
    image: '/image/products/tram-hoa-sen.jpg',
    href: '/shop',
  },
  {
    id: 'bo-qua-tang',
    name: 'Bộ quà tặng Vân Mộc',
    category: 'Bộ quà tặng',
    price: '650.000đ',
    badge: undefined,
    image: '/image/products/bo-qua-tang.png',
    href: '/shop',
  },
]

const PRODUCT_VALUES = [
  {
    icon: Leaf,
    title: 'Sừng tự nhiên',
    desc: 'Màu sắc và đường vân hình thành tự nhiên.',
  },
  {
    icon: Fingerprint,
    title: 'Đường vân độc bản',
    desc: 'Không có hai sản phẩm hoàn toàn giống nhau.',
  },
  {
    icon: Sparkles,
    title: 'Hoàn thiện thủ công',
    desc: 'Các cạnh được mài và đánh bóng cẩn thận.',
  },
  {
    icon: Droplets,
    title: 'Bền đẹp theo thời gian',
    desc: 'Có thể sử dụng lâu dài nếu được bảo quản đúng cách.',
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
  { step: '01', title: 'Gửi hình mẫu' },
  { step: '02', title: 'Nhận tư vấn' },
  { step: '03', title: 'Xác nhận thiết kế' },
  { step: '04', title: 'Chế tác thủ công' },
]

/** Thay logo/tên bằng đơn vị thật khi có. logo: đường dẫn ảnh hoặc undefined. */
const PARTNERS = [
  {
    name: 'Làng nghề Thụy Ứng',
    logo: undefined as string | undefined,
    href: undefined as string | undefined,
  },
  {
    name: 'Hợp tác xã thủ công',
    logo: undefined as string | undefined,
    href: undefined as string | undefined,
  },
  {
    name: 'Đơn vị đồng hành 03',
    logo: undefined as string | undefined,
    href: undefined as string | undefined,
  },
  {
    name: 'Đơn vị đồng hành 04',
    logo: undefined as string | undefined,
    href: undefined as string | undefined,
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
          light ? 'text-[#fff2dc]' : 'text-ink text-title-gradient'
        }`}
      >
        {title}
      </h2>
      <div className={`w-12 h-px mx-auto ${light ? 'bg-[#c9973a]/80' : 'bg-[#9a6b1f]'}`} />
      {description ? (
        <p
          className={`text-sm md:text-base leading-relaxed pt-1 ${
            light ? 'text-[#fff2dc]/85' : 'text-ink-body'
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
  href,
}: (typeof FEATURED_PRODUCTS)[number]) {
  return (
    <article className="group flex flex-col">
      <Link to={href} className="relative block overflow-hidden bg-[#f3e6d0]">
        <div className="aspect-[4/5] overflow-hidden">
          <img
            src={image}
            alt={name}
            className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        {badge ? (
          <span className="absolute left-3 top-3 bg-[#591d10]/90 px-2.5 py-1 text-[10px] font-semibold tracking-wider uppercase text-[#fff2dc]">
            {badge}
          </span>
        ) : null}
      </Link>
      <div className="flex flex-1 flex-col gap-1.5 pt-4">
        <p className="text-[11px] tracking-[0.12em] uppercase text-ink-muted">{category}</p>
        <h3 className="text-base font-semibold text-ink leading-snug">{name}</h3>
        <p className="text-sm font-medium text-accent-gold">{price}</p>
        <Link
          to={href}
          className="mt-2 inline-flex items-center gap-1.5 text-[12px] font-semibold text-ink hover:text-accent-gold transition-colors"
        >
          Xem chi tiết
          <ArrowRight size={12} />
        </Link>
      </div>
    </article>
  )
}

export function HomePage() {
  const messengerHref = MESSENGER_URL || undefined

  return (
    <div className="relative overflow-x-hidden">
      <ScrollProgress />

      {/* Hero — giữ thiết lập hiện tại */}
      <section className="relative w-full aspect-video overflow-hidden bg-[#fff8e7]">
        <img
          alt="Vân Mộc — thủ công từ sừng tự nhiên"
          className="absolute inset-0 size-full object-cover object-center"
          src="/assets/herobanner.jpg"
        />
        {/* Gradient kem nhẹ phía sau chữ trên màn hình nhỏ — không phủ tối toàn hero */}
        <div
          className="pointer-events-none absolute inset-y-0 left-0 w-[85%] max-w-xl bg-gradient-to-r from-[#fff2dc]/55 via-[#fff2dc]/25 to-transparent md:from-[#fff2dc]/20 md:via-transparent md:to-transparent"
          aria-hidden
        />
        <div className="absolute inset-0 flex flex-col justify-center px-5 pt-14 -translate-y-[8vh] sm:px-6 sm:pt-16 sm:-translate-y-[9vh] md:px-[5.5vw] md:pt-20 md:-translate-y-[10vh]">
          <p className="font-display text-[2.35rem] leading-none text-[#641d13] sm:text-5xl md:text-7xl lg:text-8xl">
            Vân Mộc
          </p>
          <div className="my-2.5 h-px w-7 bg-[#7a2c1d] sm:my-4 sm:w-8" />
          <h1 className="max-w-[16rem] text-[1.35rem] leading-[1.15] text-[#592014] sm:max-w-md sm:text-3xl md:max-w-xl md:text-5xl md:leading-[1.05]">
            Tinh hoa thủ công
            <br />
            từ làng nghề Thụy Ứng
          </h1>
          <div className="mt-4 flex flex-wrap gap-2.5 sm:mt-6 sm:gap-3">
            <Link
              to="/shop"
              className="rounded-full bg-[#671f12] px-5 py-2 text-xs font-semibold text-[#fff4df] transition-colors hover:bg-[#4a160d] sm:px-6 sm:py-2.5 sm:text-sm md:px-8 md:py-3"
            >
              Khám phá sản phẩm →
            </Link>
            <Link
              to="/villages"
              className="rounded-full border border-[#671f12]/70 bg-[#fff8e7]/30 px-5 py-2 text-xs font-semibold text-[#592014] transition-colors hover:bg-[#fff8e7]/60 sm:px-6 sm:py-2.5 sm:text-sm md:px-8 md:py-3"
            >
              Câu chuyện làng nghề
            </Link>
          </div>
        </div>
      </section>

      {/* Giá trị thương hiệu */}
      <section className="bg-paper-warm overflow-hidden py-10 md:py-14">
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
                  <span className="font-display text-2xl md:text-3xl text-accent-gold leading-none shrink-0 w-10">
                    {item.step}
                  </span>
                  <div className="space-y-1.5 pt-0.5">
                    <h3 className="text-base md:text-lg font-semibold text-ink">{item.title}</h3>
                    <p className="text-sm leading-relaxed text-ink-body">{item.desc}</p>
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
              <p className="font-display text-lg md:text-xl text-ink italic max-w-xl leading-relaxed">
                “Mỗi đường vân là một dấu vết riêng của tự nhiên.”
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Sản phẩm nổi bật */}
      <section className="bg-paper-cream overflow-hidden py-10 md:py-14">
        <SectionDecor variant="light" />
        <div className="relative z-10 container mx-auto px-5 md:px-8 space-y-7 md:space-y-8">
          <Reveal>
            <SectionHeading
              title="Những sản phẩm được yêu thích"
            />
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-6">
            {FEATURED_PRODUCTS.map((product, i) => (
              <Reveal key={product.id} className={i === 1 ? 'delay-75' : i === 2 ? 'delay-150' : i === 3 ? 'delay-225' : ''}>
                <ProductCard {...product} />
              </Reveal>
            ))}
          </div>
          <Reveal className="text-center pt-2">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 rounded-full border-2 border-[#3a140e] px-7 py-3 text-sm font-semibold text-ink transition-colors hover:bg-[#3a140e] hover:text-[#fff2dc]"
            >
              Xem tất cả sản phẩm
              <ArrowRight size={15} />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* Giá trị sản phẩm */}
      <section className="bg-paper-sand overflow-hidden py-10 md:py-14">
        <SectionDecor variant="warm" />
        <div className="relative z-10 container mx-auto px-5 md:px-8 space-y-7 md:space-y-8">
          <Reveal>
            <SectionHeading title="Vẻ đẹp đến từ chất liệu nguyên bản" />
          </Reveal>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            <Reveal className="lg:col-span-5 order-2 lg:order-1">
              <img
                src="/image/products/chat-lieu.jpg"
                alt="Đường vân sừng tự nhiên"
                className="w-full aspect-[4/5] object-cover"
              />
            </Reveal>
            <div className="lg:col-span-7 order-1 lg:order-2 grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-x-8 sm:gap-y-10">
              {PRODUCT_VALUES.map((item, i) => (
                <Reveal key={item.title} className={i % 2 === 1 ? 'delay-150' : ''}>
                  <div className="space-y-3">
                    <item.icon size={26} strokeWidth={1.5} className="text-accent-gold" />
                    <h3 className="text-base font-semibold text-ink">{item.title}</h3>
                    <p className="text-sm leading-relaxed text-ink-body">{item.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Quy trình chế tác */}
      <section className="bg-paper-mist overflow-hidden py-10 md:py-14">
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
                    <h3 className="text-sm font-semibold text-ink md:text-[15px]">{step.title}</h3>
                    <p className="text-xs leading-relaxed text-ink-body md:text-[13px] md:max-w-[160px] lg:max-w-[180px]">
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
      <section className="bg-paper-wine overflow-hidden py-10 md:py-14">
        <SectionDecor variant="wine" />
        <div className="relative z-10 container mx-auto px-5 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <Reveal className="order-2 lg:order-1 overflow-hidden">
              <img
                src="/image/products/custom-craft.jpg"
                alt="Chế tác thủ công từ sừng tự nhiên"
                className="w-full aspect-[4/5] md:aspect-[5/6] object-cover"
              />
            </Reveal>
            <Reveal className="order-1 lg:order-2 space-y-5 delay-150">
              <div className="space-y-3">
                <h2 className="text-2xl md:text-3xl lg:text-[34px] leading-tight text-[#fff2dc]">
                  Chế tác riêng từ ý tưởng của bạn
                </h2>
                <div className="w-12 h-px bg-[#c9973a]" />
                <p className="text-sm md:text-base leading-relaxed text-[#fff2dc]/80">
                  Gửi hình ảnh hoặc mẫu sản phẩm bạn mong muốn. Vân Mộc sẽ tư vấn kiểu dáng, chất
                  liệu, kích thước và phương án chế tác phù hợp bởi nghệ nhân làng nghề Thụy Ứng.
                </p>
              </div>
              <ol className="grid grid-cols-2 gap-4">
                {CUSTOM_STEPS.map((s) => (
                  <li key={s.step} className="space-y-1">
                    <span className="block font-display text-2xl text-[#c9973a]">{s.step}</span>
                    <span className="block text-sm text-[#fff2dc]">{s.title}</span>
                  </li>
                ))}
              </ol>
              <div className="flex flex-wrap gap-3 pt-2">
                <Link
                  to="/custom-order"
                  className="inline-flex items-center gap-2 rounded-full bg-[#fff2dc] px-6 py-3 text-sm font-semibold text-[#591d10] transition-colors hover:bg-white"
                >
                  Gửi yêu cầu chế tác
                  <ArrowRight size={14} />
                </Link>
                {messengerHref ? (
                  <a
                    href={messengerHref}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-[#fff2dc]/50 px-6 py-3 text-sm font-semibold text-[#fff2dc] transition-colors hover:border-[#fff2dc] hover:bg-white/10"
                  >
                    <MessageCircle size={15} strokeWidth={1.5} />
                    Tư vấn qua Messenger
                  </a>
                ) : (
                  <span
                    title="Cập nhật MESSENGER_URL khi có fanpage"
                    className="inline-flex items-center gap-2 rounded-full border border-[#fff2dc]/35 px-6 py-3 text-sm font-semibold text-[#fff2dc]/55 cursor-not-allowed"
                  >
                    <MessageCircle size={15} strokeWidth={1.5} />
                    Tư vấn qua Messenger
                  </span>
                )}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Đánh giá khách hàng */}
      <section className="bg-paper-grain overflow-hidden py-10 md:py-14">
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
                <p className="text-sm leading-relaxed text-ink-body italic">&ldquo;{review.quote}&rdquo;</p>
                <div className="flex items-center gap-3 pt-1">
                  {review.avatar ? (
                    <img
                      src={review.avatar}
                      alt=""
                      className="size-9 rounded-full object-cover"
                    />
                  ) : null}
                  <div>
                    <span className="block text-sm font-semibold text-ink">{review.name}</span>
                    <span className="block text-xs text-ink-muted">{review.role}</span>
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
      <section className="bg-paper-soft overflow-hidden py-10 md:py-12 border-t border-[#c9973a]/15">
        <SectionDecor variant="light" />
        <div className="relative z-10 container mx-auto px-5 md:px-8 space-y-7 md:space-y-8">
          <Reveal>
            <SectionHeading
              title="Đơn vị đồng hành"
              description="Những đối tác đồng hành cùng Vân Mộc gìn giữ và lan tỏa nghề chế tác sừng truyền thống."
            />
          </Reveal>
          <Reveal className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {PARTNERS.map((partner) => {
              const inner = (
                <div className="flex h-24 md:h-28 items-center justify-center border border-[#9a6b1f]/35 bg-[#fff8e7]/35 px-4 transition-colors hover:border-[#9a6b1f]/70">
                  {partner.logo ? (
                    <img
                      src={partner.logo}
                      alt={partner.name}
                      className="max-h-12 md:max-h-14 w-auto max-w-full object-contain opacity-90"
                    />
                  ) : (
                    <span className="text-center text-xs md:text-sm font-semibold tracking-wide text-ink leading-snug">
                      {partner.name}
                    </span>
                  )}
                </div>
              )

              return partner.href ? (
                <a
                  key={partner.name}
                  href={partner.href}
                  target="_blank"
                  rel="noreferrer"
                  className="block"
                  aria-label={partner.name}
                >
                  {inner}
                </a>
              ) : (
                <div key={partner.name}>{inner}</div>
              )
            })}
          </Reveal>
        </div>
      </section>
    </div>
  )
}
