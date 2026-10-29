import { type HTMLAttributes, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Nfc, Play } from 'lucide-react'
import { useInView } from '../hooks/useInView'
import './TraceabilityPage.css'

const craftImage = (name: string) =>
  `/image/VanMoc/${encodeURIComponent('Trang Hành Trình Chế Tác')}/${encodeURIComponent(name)}`

const nfcHero = '/image/truy-xuat/nfc-hero.jpg'

const CARE = [
  'Tránh để sản phẩm tiếp xúc lâu với nước hoặc môi trường ẩm.',
  'Hạn chế nhiệt độ cao và ánh nắng trực tiếp trong thời gian dài.',
  'Lau sạch bằng khăn mềm sau khi sử dụng và bảo quản nơi khô thoáng.',
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
  const { ref, inView } = useInView<HTMLElement>({ threshold: 0.08, rootMargin: '0px 0px -4% 0px' })
  return (
    <Tag
      ref={ref as never}
      className={`tx-motion${inView ? ' is-in-view' : ''} ${className}`.trim()}
      {...rest}
    >
      {children}
    </Tag>
  )
}

export function TraceabilityPage() {
  return (
    <article className="tx">
      <section className="tx-intro bg-paper-warm" aria-labelledby="tx-title">
        <div className="tx-intro__inner">
          <div className="tx-intro__copy">
            <p className="tx-eyebrow">Hành trình chế tác</p>
            <h1 id="tx-title">Chạm vào sừng, mở ra câu chuyện.</h1>
            <span className="tx-rule" aria-hidden="true" />
            <p className="tx-intro__desc">
              Từ chất liệu tự nhiên đến đôi tay người thợ Thụy Ứng — mỗi sản phẩm mang một dấu vết riêng có thể truy xuất.
            </p>
            <div className="tx-intro__actions">
              <Link className="tx-intro__cta" to="/villages#story-video">
                <span className="tx-intro__cta-icon" aria-hidden>
                  <Play size={15} fill="currentColor" />
                </span>
                Xem video câu chuyện
              </Link>
              <p className="tx-intro__nfc">
                <Nfc size={18} strokeWidth={1.5} aria-hidden />
                Chạm NFC để khám phá
              </p>
            </div>
          </div>
          <figure className="tx-intro__media">
            <img
              src={nfcHero}
              alt="Chạm NFC trên sản phẩm Vân Mộc để mở hành trình chế tác"
            />
          </figure>
        </div>
      </section>

      <MotionBlock as="section" className="tx-story bg-paper-mist" aria-labelledby="tx-material-title">
        <div className="tx-story__stage">
          <figure className="tx-story__hero tx-motion__item">
            <img
              src={craftImage('01 chất liệu.jpg')}
              alt="Sản phẩm từ sừng tự nhiên với những sắc độ và đường vân riêng"
              loading="lazy"
            />
          </figure>
          <div className="tx-story__copy tx-motion__item">
            <p className="tx-eyebrow">01 · Chất liệu</p>
            <h2 id="tx-material-title">Vẻ đẹp tự nhiên, dấu ấn thủ công</h2>
            <p>
              Sừng tự nhiên thu hút bởi những sắc độ và đường vân không hoàn toàn giống nhau. Từ tông sáng đến nâu trầm,
              mỗi phần chất liệu có đặc điểm riêng, tạo nên diện mạo khác biệt cho từng sản phẩm.
            </p>
            <p>
              Với Vân Mộc, vẻ đẹp ấy không nằm ở sự đồng nhất tuyệt đối, mà ở những chi tiết khiến mỗi chiếc lược,
              mỗi món phụ kiện mang một nét riêng.
            </p>
          </div>
        </div>
      </MotionBlock>

      <MotionBlock as="section" className="tx-video bg-paper-sand" id="tx-video" aria-labelledby="tx-video-title">
        <div className="tx-video__layout">
          <div className="tx-video__intro tx-motion__item">
            <p className="tx-eyebrow">02 · Hành trình chế tác</p>
            <h2 id="tx-video-title">Từ chất liệu đến thành phẩm</h2>
            <p>
              Theo dõi quá trình chế tác sừng thủ công tại làng nghề Thụy Ứng — nơi kỹ năng, kinh nghiệm và sự tỉ mỉ
              của người thợ hiện hữu trong từng thao tác.
            </p>
          </div>
          <div className="tx-video__frame tx-motion__item">
            <iframe
              src="https://www.youtube-nocookie.com/embed/P3GHqgBDn3k"
              title="Từ chất liệu đến thành phẩm"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
        </div>
      </MotionBlock>

      <MotionBlock as="section" className="tx-detail bg-paper-warm" aria-labelledby="tx-detail-title">
        <div className="tx-detail__stage">
          <div className="tx-detail__copy tx-motion__item">
            <p className="tx-eyebrow">03 · Chi tiết</p>
            <h2 id="tx-detail-title">Tinh tế trong từng đường nét</h2>
            <p>
              Từ đường nét tạo hình đến bề mặt được hoàn thiện, mỗi chi tiết góp phần tạo nên vẻ đẹp và trải nghiệm
              sử dụng của sản phẩm.
            </p>
            <p>
              Vân Mộc trân trọng giá trị đến từ chất liệu tự nhiên và sự chăm chút trong chế tác, để những vật dụng
              quen thuộc trở thành món đồ có nét đẹp riêng, gần gũi và bền lâu.
            </p>
          </div>
          <figure className="tx-detail__media tx-motion__item">
            <img
              src={craftImage('03 Tinh tế trong từng chi tiết.jpg')}
              alt="Những đường vân và chi tiết trên lược sừng Vân Mộc"
              loading="lazy"
            />
          </figure>
        </div>
      </MotionBlock>

      <MotionBlock as="section" className="tx-care bg-paper-mist" aria-labelledby="tx-care-title">
        <div className="tx-care__stage">
          <figure className="tx-care__media tx-motion__item">
            <img
              src={craftImage('04 Bảo quản để sử dụng lâu dài.jpg')}
              alt="Sản phẩm sừng tự nhiên Vân Mộc trong hộp quà thủ công"
              loading="lazy"
            />
          </figure>
          <div className="tx-care__copy tx-motion__item">
            <p className="tx-eyebrow">04 · Bảo quản</p>
            <h2 id="tx-care-title">Chăm sóc để sử dụng lâu dài</h2>
            <p>Sừng tự nhiên cần được chăm sóc đúng cách để duy trì vẻ đẹp theo thời gian.</p>
            <ol className="tx-care__list">
              {CARE.map((item, index) => (
                <li key={item}>
                  <span className="tx-care__num" aria-hidden="true">0{index + 1}</span>
                  <span>{item}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </MotionBlock>
    </article>
  )
}
