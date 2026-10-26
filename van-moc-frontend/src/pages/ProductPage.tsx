import { useEffect, useRef, useState, type HTMLAttributes, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { api, type Product, type ProductPageResponse } from '../api/catalog'
import { ProductCard } from '../components/ProductCard'
import { useInView } from '../hooks/useInView'
import './ProductPage.css'

const shopImage = (name: string) =>
  `/image/VanMoc/${encodeURIComponent('Trang Sản Phẩm')}/${encodeURIComponent(name)}`

const isTestProduct = (product: Product) =>
  /test/i.test(product.name) || /test/i.test(product.slug) || /test/i.test(product.code)

const PROCESS = [
  {
    step: '01',
    title: 'Lựa chọn nguyên liệu sừng',
    text: 'Sừng bò được lựa chọn dựa trên đặc điểm về màu sắc, độ dày, kích thước và chất lượng. Nguyên liệu phù hợp giúp tạo nên chiếc lược có độ bền và vẻ đẹp tự nhiên.',
  },
  {
    step: '02',
    title: 'Xử lý và tạo phôi',
    text: 'Sừng được làm sạch, xử lý và cắt thành những phần phù hợp với kích thước của chiếc lược. Người thợ lựa chọn phần sừng thích hợp để tận dụng vân màu tự nhiên của chất liệu.',
  },
  {
    step: '03',
    title: 'Tạo hình thân lược',
    text: 'Phôi sừng được gia công, cắt gọt và định hình theo kiểu dáng mong muốn. Công đoạn này đòi hỏi sự khéo léo để thân lược có hình dáng cân đối và phù hợp với công năng sử dụng.',
  },
  {
    step: '04',
    title: 'Tạo răng lược',
    text: 'Người thợ lần lượt cắt và tạo hình từng răng lược, điều chỉnh khoảng cách, độ dài và độ đều. Đây là công đoạn cần sự tỉ mỉ để lược có thể sử dụng thuận tiện.',
  },
  {
    step: '05',
    title: 'Mài nhẵn và đánh bóng',
    text: 'Các cạnh và răng lược được mài nhẵn, xử lý bề mặt và đánh bóng. Công đoạn này giúp lược trở nên mịn màng, hạn chế cạnh sắc và làm nổi bật những đường vân tự nhiên của sừng.',
  },
  {
    step: '06',
    title: 'Kiểm tra và hoàn thiện sản phẩm',
    text: 'Chiếc lược được kiểm tra về hình dáng, độ nhẵn, độ hoàn thiện của răng lược và chất lượng bề mặt trước khi đóng gói, đưa đến tay khách hàng.',
  },
]

function MotionBlock({
  className = '',
  children,
  as: Tag = 'div',
  ...rest
}: {
  className?: string
  children: ReactNode
  as?: 'div' | 'section' | 'header'
} & HTMLAttributes<HTMLElement>) {
  const { ref, inView } = useInView<HTMLElement>()
  return (
    <Tag
      ref={ref as never}
      className={`shop-motion${inView ? ' is-in-view' : ''} ${className}`.trim()}
      {...rest}
    >
      {children}
    </Tag>
  )
}

function ProductCarousel({ products }: { products: Product[] }) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [atStart, setAtStart] = useState(true)
  const [atEnd, setAtEnd] = useState(false)
  const [progress, setProgress] = useState(0)
  const { ref: sectionRef, inView } = useInView<HTMLElement>({ threshold: 0.12 })

  useEffect(() => {
    const track = trackRef.current
    if (!track) return

    const update = () => {
      const max = Math.max(track.scrollWidth - track.clientWidth, 1)
      setAtStart(track.scrollLeft <= 4)
      setAtEnd(track.scrollLeft >= max - 4)
      setProgress(track.scrollLeft / max)
    }

    update()
    track.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      track.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [products])

  const move = (direction: -1 | 1) => {
    const track = trackRef.current
    if (!track) return
    const card = track.querySelector<HTMLElement>(':scope > *')
    if (!card) return
    const gap = Number.parseFloat(getComputedStyle(track).columnGap) || 0
    track.scrollBy({ left: direction * (card.offsetWidth + gap), behavior: 'smooth' })
  }

  return (
    <section
      ref={sectionRef}
      className={`shop-collection bg-paper-sand shop-motion${inView ? ' is-in-view' : ''}`}
      aria-labelledby="shop-collection-title"
    >
      <div className="shop-collection__inner">
        <div className="shop-collection__heading shop-motion__item">
          <div>
            <p className="shop-eyebrow">Bộ sưu tập quà tặng</p>
            <h2 id="shop-collection-title">Sản phẩm và quà tặng Vân Mộc</h2>
            <p>Khám phá những sản phẩm thủ công từ sừng tự nhiên — mỗi món mang đường vân và sắc độ riêng.</p>
          </div>
          <div className="shop-collection__arrows">
            <button type="button" className="carousel-arrow" aria-label="Xem sản phẩm trước" disabled={atStart} onClick={() => move(-1)}>
              <ChevronLeft size={19} strokeWidth={1.6} />
            </button>
            <button type="button" className="carousel-arrow" aria-label="Xem sản phẩm tiếp theo" disabled={atEnd} onClick={() => move(1)}>
              <ChevronRight size={19} strokeWidth={1.6} />
            </button>
          </div>
        </div>

        <div ref={trackRef} className="shop-collection__track" aria-label="Sản phẩm Vân Mộc" tabIndex={0}>
          {products.map((product, index) => (
            <div
              key={product.id}
              className="shop-collection__card shop-motion__item"
              style={{ transitionDelay: inView ? `${120 + index * 70}ms` : undefined }}
            >
              <ProductCard product={product} featured />
            </div>
          ))}
        </div>

        <div className="shop-collection__progress" aria-hidden="true">
          <span style={{ width: `${18 + progress * 82}%` }} />
        </div>
      </div>
    </section>
  )
}

export function ProductPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [retry, setRetry] = useState(0)
  const [heroReady, setHeroReady] = useState(false)
  const [activeStep, setActiveStep] = useState(0)

  useEffect(() => {
    const id = window.requestAnimationFrame(() => setHeroReady(true))
    return () => window.cancelAnimationFrame(id)
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError('')
    api<ProductPageResponse>('/api/products?page=0&size=48', controller.signal)
      .then(result => {
        if (controller.signal.aborted) return
        setProducts(result.content.filter(product => !isTestProduct(product)))
      })
      .catch(() => {
        if (!controller.signal.aborted) setError('Không tải được danh sách sản phẩm. Vui lòng thử lại.')
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [retry])

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const id = window.setInterval(() => {
      setActiveStep(current => (current + 1) % PROCESS.length)
    }, 3200)
    return () => window.clearInterval(id)
  }, [])

  return (
    <div className="shop-page">
      <section className={`shop-intro bg-paper-warm${heroReady ? ' is-ready' : ''}`} aria-labelledby="shop-intro-title">
        <div className="shop-intro__glow" aria-hidden />
        <div className="shop-intro__inner">
          <div className="shop-intro__media">
            <img
              src={shopImage('Vân Mộc - Lược sừng thụy ứng (đầu trang phần giới thiệu sản phẩm).jpg')}
              alt="Lược sừng thủ công Vân Mộc từ làng nghề Thụy Ứng"
            />
          </div>
          <div className="shop-intro__copy">
            <p className="shop-eyebrow shop-intro__fade">Sản phẩm thủ công</p>
            <h1 id="shop-intro-title">Vân Mộc — Lược sừng Thụy Ứng</h1>
            <div className="shop-intro__panel">
              <p>
                Lược sừng Thụy Ứng là sản phẩm thủ công truyền thống nổi tiếng của làng nghề Thụy Ứng, xã Thường Tín,
                thành phố Hà Nội. Được chế tác từ sừng tự nhiên, chủ yếu qua đôi tay khéo léo của những người thợ lành nghề,
                mỗi chiếc lược mang màu sắc và đường vân riêng biệt, kết hợp cùng độ bóng mịn và kiểu dáng tinh tế.
              </p>
              <p>
                Trải qua hơn 400 năm hình thành và phát triển, nghề làm lược sừng không chỉ thể hiện sự khéo léo, tỉ mỉ
                của người thợ mà còn là nét đẹp văn hóa, lưu giữ tinh hoa thủ công truyền thống của vùng đất Thụy Ứng.
              </p>
            </div>
            <div className="shop-intro__actions">
              <a className="shop-button shop-button--primary" href="#shop-collection">Xem bộ sưu tập</a>
              <Link className="shop-button shop-button--ghost" to="/truy-xuat">Hành trình chế tác</Link>
            </div>
          </div>
        </div>
      </section>

      <div id="shop-collection">
        {loading && <p className="shop-state" role="status">Đang tải sản phẩm…</p>}
        {error && (
          <p className="shop-state" role="alert">
            {error}{' '}
            <button type="button" onClick={() => setRetry(value => value + 1)}>Thử lại</button>
          </p>
        )}
        {!loading && !error && products.length > 0 && <ProductCarousel products={products} />}
        {!loading && !error && products.length === 0 && (
          <p className="shop-state" role="status">Chưa có sản phẩm. Vui lòng quay lại sau.</p>
        )}
      </div>

      <MotionBlock as="section" className="shop-heritage bg-paper-mist" aria-labelledby="shop-heritage-title">
        <div className="shop-heritage__inner">
          <div className="shop-heritage__copy shop-motion__item">
            <p className="shop-eyebrow">Tinh hoa làng nghề</p>
            <h2 id="shop-heritage-title">Vân Mộc gìn giữ và tiếp nối tinh hoa làng nghề Thụy Ứng</h2>
            <p>
              Vì vậy, Vân Mộc hướng đến việc gìn giữ và phát huy những giá trị truyền thống của làng nghề sừng Thụy Ứng,
              từ kỹ thuật chế tác thủ công được lưu truyền qua nhiều thế hệ đến sự khéo léo, tỉ mỉ và tâm huyết của những
              người thợ lành nghề. Thông qua việc phát triển các sản phẩm thủ công từ sừng bò châu Phi, Vân Mộc mong muốn
              lưu giữ những nét tinh túy của nghề truyền thống, đồng thời góp phần bảo tồn giá trị văn hóa gắn liền với
              lịch sử và đời sống của làng nghề.
            </p>
            <p>
              Điều Vân Mộc mang đến không chỉ là những món phụ kiện thủ công, mà còn là câu chuyện về nguồn cội, bàn tay
              tài hoa của người thợ và những giá trị văn hóa được gìn giữ qua nhiều thế hệ. Mỗi sản phẩm là một cách để
              truyền tải tinh hoa nghề truyền thống, giúp khách hàng hiểu hơn về vẻ đẹp của chất liệu sừng tự nhiên cũng
              như giá trị của lao động thủ công.
            </p>
            <p>
              Trong tương lai, Vân Mộc mong muốn tiếp tục đồng hành cùng những người thợ làng nghề, gìn giữ các kỹ thuật
              chế tác truyền thống và lan tỏa câu chuyện về làng nghề Thụy Ứng đến cộng đồng, đặc biệt là thế hệ trẻ. Qua
              đó, thương hiệu kỳ vọng góp phần để những giá trị quý báu của nghề thủ công truyền thống không chỉ được bảo
              tồn mà còn tiếp tục được trân trọng và nối dài qua các thế hệ.
            </p>
          </div>
          <div className="shop-heritage__gallery" aria-hidden="true">
            {[
              'Vân Mộc gìn giữ và tiếp nối tinh hoa làng nghề Thụy Ứng.jpg',
              'Vân Mộc gìn giữ và tiếp nối tinh hoa làng nghề Thụy Ứng 2.jpg',
              'Vân Mộc gìn giữ và tiếp nối tinh hoa làng nghề Thụy Ứng 3.jpg',
            ].map((name, index) => (
              <img
                key={name}
                className="shop-motion__item"
                style={{ transitionDelay: `${180 + index * 110}ms` }}
                src={shopImage(name)}
                alt=""
                loading="lazy"
              />
            ))}
          </div>
        </div>
      </MotionBlock>

      <section className="shop-process bg-paper-warm" aria-labelledby="shop-process-title">
        <MotionBlock className="shop-process__inner">
          <div className="shop-process__heading shop-motion__item">
            <p className="shop-eyebrow">Sáu bước kỳ công</p>
            <h2 id="shop-process-title">Quy trình chế tác một chiếc lược sừng Vân Mộc</h2>
          </div>
          <ol className="shop-process__grid">
            {PROCESS.map((item, index) => (
              <li
                key={item.step}
                className={`shop-motion__item${activeStep === index ? ' is-active' : ''}`}
                style={{ transitionDelay: `${100 + index * 80}ms` }}
                onMouseEnter={() => setActiveStep(index)}
              >
                <span aria-hidden="true">{item.step}</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </li>
            ))}
          </ol>
        </MotionBlock>
      </section>

      <MotionBlock as="section" className="shop-material bg-paper-sand" aria-labelledby="shop-material-title">
        <div className="shop-material__inner">
          <div className="shop-material__media shop-motion__item shop-motion__item--left">
            <img
              src={shopImage('Chất liệu sừng tự nhiên – Nét đẹp nguyên bản.jpg')}
              alt="Chất liệu sừng tự nhiên với đường vân và sắc độ nguyên bản"
              loading="lazy"
            />
          </div>
          <div className="shop-material__copy shop-motion__item shop-motion__item--right">
            <p className="shop-eyebrow">Nguyên liệu</p>
            <h2 id="shop-material-title">Chất liệu sừng tự nhiên — Nét đẹp nguyên bản</h2>
            <p>
              Lược sừng Vân Mộc được chế tác từ sừng bò châu Phi, với những đường vân và sắc độ tự nhiên tạo nên nét riêng
              cho từng sản phẩm. Qua đôi bàn tay khéo léo và kỹ thuật chế tác thủ công của người thợ làng nghề Thụy Ứng,
              chất liệu sừng được mài giũa, hoàn thiện thành những chiếc lược mang vẻ đẹp mộc mạc, tinh tế.
            </p>
            <p>
              Mỗi chiếc lược không chỉ thể hiện vẻ đẹp của chất liệu tự nhiên mà còn lưu giữ sự tỉ mỉ, tâm huyết và tinh
              hoa nghề thủ công được truyền qua nhiều thế hệ.
            </p>
          </div>
        </div>
      </MotionBlock>

      <MotionBlock as="section" className="shop-gift bg-paper-mist" aria-labelledby="shop-gift-title">
        <div className="shop-gift__inner">
          <div className="shop-gift__copy shop-motion__item shop-motion__item--left">
            <p className="shop-eyebrow">Hộp quà tặng tinh tế</p>
            <h2 id="shop-gift-title">Mộc mạc trong thiết kế — Trọn vẹn ý nghĩa</h2>
            <p>
              Hộp quà tặng Vân Mộc được thiết kế theo phong cách đơn giản, mộc mạc và gần gũi với thiên nhiên, đúng như
              tinh thần mà thương hiệu hướng đến. Từng chi tiết bao bì được chăm chút hài hòa, tôn lên vẻ đẹp nguyên bản
              của sản phẩm thủ công từ sừng tự nhiên.
            </p>
            <p>
              Không chỉ là cách trao gửi một món quà, mỗi hộp quà Vân Mộc còn chứa đựng sự trân trọng đối với những giá trị
              truyền thống và tâm huyết của người thợ làng nghề. Đây là món quà ý nghĩa dành tặng người thân, bạn bè,
              đối tác, thay lời gửi gắm chân thành và tinh tế trong từng dịp đặc biệt.
            </p>
            <a className="shop-button shop-button--primary" href="#shop-collection">Chọn quà từ bộ sưu tập</a>
          </div>
          <div className="shop-gift__media shop-motion__item shop-motion__item--right">
            <img
              src={shopImage('Hộp Quà Tặng Tinh Tế.jpg')}
              alt="Hộp quà tặng Vân Mộc thiết kế mộc mạc, tinh tế"
              loading="lazy"
            />
          </div>
        </div>
      </MotionBlock>
    </div>
  )
}
