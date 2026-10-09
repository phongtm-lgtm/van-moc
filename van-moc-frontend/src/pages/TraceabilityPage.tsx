import { useState } from 'react'
import {
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
  Home,
  Layers,
  Leaf,
  Nfc,
} from 'lucide-react'
import { Reveal } from '../components/Reveal'

const PRODUCT_ID = 'VM000123'
const NFC_ID = 'VM-NFC-000123'
const BATCH_ID = 'VM-BATCH-2026-09'

const GALLERY = [
  '/image/products/luoc-rang-thua.jpg',
  '/image/products/luoc-bo-tui.jpg',
  '/image/products/luoc-rang-thua.jpg',
  '/image/products/bo-qua-tang.jpg',
]

const META = [
  { icon: Leaf, label: 'Chất liệu', value: 'Sừng tự nhiên' },
  { icon: Home, label: 'Làng nghề', value: 'Thụy Ứng, Hà Nội' },
  { icon: Layers, label: 'Đợt sản xuất', value: BATCH_ID },
  { icon: CalendarDays, label: 'Ngày hoàn thiện', value: '05/09/2026' },
]

const ORIGIN = [
  {
    image: '/image/truy-xuat/lang-nghe-thuy-ung.jpg',
    title: 'Làng nghề Thụy Ứng',
    text: 'Sản phẩm được chế tác tại làng nghề Thụy Ứng — nơi nghề làm đồ sừng đã gắn bó với đời sống nhiều thế hệ.',
  },
  {
    image: '/image/truy-xuat/chat-lieu-sung.jpg',
    title: 'Chất liệu',
    text: 'Sừng tự nhiên được tuyển chọn theo độ đặc, sắc độ và đường vân — mỗi miếng nguyên liệu đều mang dấu hiệu riêng.',
  },
  {
    image: '/image/products/luoc-rang-thua.jpg',
    title: 'Đợt sản xuất',
    text: `Đợt ${BATCH_ID}. Mỗi sản phẩm trong đợt đều được gắn mã định danh riêng để truy xuất.`,
  },
]

const JOURNEY = [
  {
    step: '01',
    date: '01/09/2026',
    title: 'Tuyển chọn chất liệu',
    text: 'Chọn miếng sừng có độ đặc ổn định, sắc độ ấm và đường vân rõ — làm nền cho sản phẩm sau này.',
    image: '/image/truy-xuat/chat-lieu-sung.jpg',
  },
  {
    step: '02',
    date: '03/09/2026',
    title: 'Tạo dáng & mài thủ công',
    text: 'Nghệ nhân tạo dáng lược, mài từng răng và chỉnh tỉ lệ bằng tay để giữ cảm giác cầm chắc, nhẹ.',
    image: '/image/truy-xuat/che-tac-mai.jpg',
  },
  {
    step: '03',
    date: '05/09/2026',
    title: 'Đánh bóng & hoàn thiện',
    text: 'Đánh bóng bề mặt đến độ mịn mong muốn, kiểm tra lần cuối rồi gắn thẻ NFC truy xuất nguồn gốc.',
    image: '/image/truy-xuat/che-tac-danh-bong.jpg',
  },
]

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      /* ignore */
    }
  }

  return (
    <button
      type="button"
      className="tx-copy"
      onClick={handleCopy}
      aria-label={copied ? 'Đã sao chép' : label}
      title={copied ? 'Đã sao chép' : label}
    >
      {copied ? <Check size={14} strokeWidth={2} /> : <Copy size={14} strokeWidth={1.6} />}
    </button>
  )
}

export function TraceabilityPage() {
  const [activeImage, setActiveImage] = useState(0)

  const changeImage = (dir: -1 | 1) => {
    setActiveImage((cur) => (cur + dir + GALLERY.length) % GALLERY.length)
  }

  return (
    <article className="tx">
      <div className="tx__grain" aria-hidden />

      {/* Hero */}
      <section className="tx-hero">
        <img
          className="tx-hero__image"
          src="/image/truy-xuat/nfc-hero.jpg"
          alt="Chạm thẻ NFC để truy xuất nguồn gốc sản phẩm Vân Mộc"
        />
        <div className="tx-hero__wash" aria-hidden />

        <div className="tx-hero__inner">
          <div className="tx-hero__badge">
            <span className="tx-hero__badge-ring" aria-hidden>
              <Nfc size={28} strokeWidth={1.4} />
            </span>
            <p>Chạm để khám phá câu chuyện sản phẩm</p>
          </div>

          <div className="tx-hero__copy">
            <p className="tx-hero__eyebrow">Vân Mộc · Truy xuất</p>
            <h1>Truy xuất nguồn gốc bằng NFC</h1>
            <p className="tx-hero__desc">
              Mỗi sản phẩm Vân Mộc mang một thẻ NFC riêng — ghi lại hành trình từ chất liệu, làng nghề đến tay nghệ nhân.
            </p>
          </div>

          <div className="tx-hero__seal" aria-hidden>
            <img src="/assets/van-moc-logo-dark.png" alt="" />
          </div>
        </div>
      </section>

      {/* Product profile */}
      <section className="tx-section">
        <div className="tx-wrap">
          <Reveal>
            <div className="tx-profile">
              <div className="tx-gallery">
                <div className="tx-gallery__main">
                  <img
                    src={GALLERY[activeImage]}
                    alt={`Lược sừng tự nhiên VM01 — ảnh ${activeImage + 1}`}
                    style={{ objectPosition: activeImage === 2 ? '72% center' : 'center' }}
                  />
                  <div className="tx-gallery__nav">
                    <button type="button" onClick={() => changeImage(-1)} aria-label="Ảnh trước">
                      <ChevronLeft size={16} />
                    </button>
                    <span>
                      {activeImage + 1} / {GALLERY.length}
                    </span>
                    <button type="button" onClick={() => changeImage(1)} aria-label="Ảnh sau">
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="tx-profile__body">
                <div className="tx-verified">
                  <CheckCircle2 size={16} strokeWidth={2} />
                  <span>Đã xác thực — Sản phẩm chính hãng Vân Mộc</span>
                </div>

                <p className="tx-profile__kicker">Hồ sơ sản phẩm</p>
                <h2>Lược sừng tự nhiên VM01</h2>

                <div className="tx-profile__id">
                  <span>Mã định danh:</span>
                  <strong>{PRODUCT_ID}</strong>
                  <CopyButton value={PRODUCT_ID} label="Sao chép mã định danh" />
                </div>

                <div className="tx-meta">
                  {META.map((item) => (
                    <div key={item.label} className="tx-meta__item">
                      <span className="tx-meta__icon" aria-hidden>
                        <item.icon size={18} strokeWidth={1.5} />
                      </span>
                      <div>
                        <p>{item.label}</p>
                        <strong>{item.value}</strong>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Artisan */}
      <section className="tx-artisan">
        <div className="tx-wrap">
          <Reveal>
            <div className="tx-artisan__grid">
              <div className="tx-artisan__person">
                <img src="/image/nghe-nhan-che-tac.jpg" alt="Nghệ nhân Thụy Ứng" />
                <div>
                  <p className="tx-artisan__label">Nghệ nhân thực hiện</p>
                  <h3>Nghệ nhân Thụy Ứng</h3>
                  <p>
                    Giữ nghề làm đồ sừng qua nhiều thế hệ — tỉ mỉ từ khâu chọn chất liệu đến đánh bóng hoàn thiện.
                  </p>
                </div>
              </div>
              <blockquote className="tx-artisan__quote">
                <p>
                  “Mỗi sản phẩm là kết quả của sự tỉ mỉ, kiên nhẫn và tình yêu với chất liệu tự nhiên.”
                </p>
                <cite>— Nghệ nhân Thụy Ứng</cite>
              </blockquote>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Origin */}
      <section className="tx-section">
        <div className="tx-wrap">
          <Reveal>
            <header className="tx-heading">
              <h2>Nguồn gốc sản phẩm</h2>
              <p>Từ làng nghề, chất liệu đến đợt sản xuất — mọi dấu vết đều được ghi lại.</p>
            </header>
          </Reveal>

          <div className="tx-origin">
            {ORIGIN.map((item, i) => (
              <Reveal key={item.title} className={`delay-${(i + 1) * 75}`}>
                <article className="tx-origin__card">
                  <div className="tx-origin__media">
                    <img src={item.image} alt={item.title} />
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Journey */}
      <section className="tx-section tx-section--soft">
        <div className="tx-wrap">
          <Reveal>
            <header className="tx-heading">
              <h2>Hành trình chế tác</h2>
              <p>Ba công đoạn chính tạo nên lược sừng VM01 trong đợt {BATCH_ID}.</p>
            </header>
          </Reveal>

          <ol className="tx-journey">
            {JOURNEY.map((item, i) => (
              <Reveal key={item.step} className={`delay-${(i + 1) * 75}`}>
                <li className="tx-journey__item">
                  <div className="tx-journey__step">
                    <span className="tx-journey__num">{item.step}</span>
                    {i < JOURNEY.length - 1 ? <span className="tx-journey__line" aria-hidden /> : null}
                    <div className="tx-journey__copy">
                      <time dateTime={item.date.split('/').reverse().join('-')}>{item.date}</time>
                      <h3>{item.title}</h3>
                      <p>{item.text}</p>
                    </div>
                  </div>
                  <div className="tx-journey__media">
                    <img src={item.image} alt={item.title} />
                  </div>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* Trace footer strip */}
      <section className="tx-strip">
        <div className="tx-wrap tx-strip__inner">
          <div className="tx-strip__ids">
            <div>
              <Nfc size={16} strokeWidth={1.5} aria-hidden />
              <span>NFC ID:</span>
              <strong>{NFC_ID}</strong>
              <CopyButton value={NFC_ID} label="Sao chép NFC ID" />
            </div>
            <div>
              <span>Mã định danh:</span>
              <strong>{PRODUCT_ID}</strong>
              <CopyButton value={PRODUCT_ID} label="Sao chép mã định danh" />
            </div>
          </div>

          <div className="tx-strip__brand">
            <strong>Vân Mộc</strong>
            <p>Dấu vết của một sản phẩm thủ công</p>
          </div>

          <p className="tx-strip__note">
            Mỗi sản phẩm từ vật liệu tự nhiên có sắc độ và đường vân riêng — đây chính là dấu hiệu xác thực của hàng thủ công.
          </p>
        </div>
      </section>
    </article>
  )
}
