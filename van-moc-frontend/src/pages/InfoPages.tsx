import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'
import { ArrowRight } from 'lucide-react'
import { MessengerIcon } from '../components/MessengerIcon'
import './CustomOrderHero.css'
import './StoryPage.css'
import { BRAND } from '../brand'

const MESSENGER_URL = BRAND.messenger

const CRAFT_STEPS = [
  { number: '01', title: 'Gửi hình mẫu', description: 'Chia sẻ hình ảnh, bản phác thảo hoặc ý tưởng về món đồ bạn mong muốn.' },
  { number: '02', title: 'Nhận tư vấn', description: 'Cùng Vân Mộc trao đổi về kiểu dáng, chất liệu, số lượng và thời gian dự kiến.' },
  { number: '03', title: 'Xác nhận thiết kế', description: 'Thống nhất thiết kế và các chi tiết phù hợp trước khi bắt đầu chế tác.' },
  { number: '04', title: 'Chế tác thủ công', description: 'Người thợ tỉ mỉ tạo hình và hoàn thiện từng chi tiết theo phương án đã thống nhất.' },
]

type InfoPageProps = {
  eyebrow: string
  title: string
  description: string
  image?: string
  imageAlt?: string
  sections: { title: string; text: ReactNode }[]
  action?: { label: string; to: string }
}

function InfoPage({ eyebrow, title, description, image, imageAlt, sections, action }: InfoPageProps) {
  return <div className="info-page bg-paper-warm min-h-screen pt-16 md:pt-20">
    <div className="container mx-auto px-5 py-14 md:px-8 md:py-20">
      <div className="mx-auto max-w-4xl">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#9a6b1f]">{eyebrow}</p>
        <h1 className="mt-4 text-3xl text-[#241a13] md:text-5xl">{title}</h1>
        <p className="mt-6 max-w-2xl text-base leading-relaxed text-[#3f3228]">{description}</p>
        {image && <img src={image} alt={imageAlt ?? ''} className="mt-10 max-h-[480px] w-full rounded-xl object-cover" />}
        <div className="mt-12 grid gap-8 border-t border-[#9a6b1f]/30 pt-10 md:grid-cols-2">
          {sections.map(section => <section key={section.title}>
            <h2 className="text-xl text-[#241a13]">{section.title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-[#3f3228]">{section.text}</p>
          </section>)}
        </div>
        {action && <Link to={action.to} className="mt-12 inline-flex rounded-full bg-[#5a301a] px-7 py-3 text-sm font-semibold text-[#fff3dd] hover:bg-[#3f2517]">{action.label} →</Link>}
      </div>
    </div>
  </div>
}

export function VillagesPage() {
  const storyImage = (name: string) => `/image/VanMoc/${encodeURIComponent('Trang Câu chuyện')}/${encodeURIComponent(name)}`

  return <main className="story-page">
    <section className="story-hero" aria-labelledby="story-title">
      <div className="story-hero__inner">
        <div className="story-hero__copy">
          <p className="story-eyebrow">Vân Mộc · Câu chuyện làng nghề</p>
          <h1 id="story-title">Từ làng nghề <em>Thụy Ứng</em> đến Vân Mộc</h1>
          <span className="story-rule" aria-hidden="true">✦</span>
          <p>Ở nơi những đôi tay khéo léo thổi hồn vào chất liệu sừng tự nhiên, một câu chuyện được tiếp nối qua từng đường vân, từng món đồ nhỏ bé.</p>
          <a href="#khoi-nguon" className="story-hero__link">Khám phá câu chuyện <ArrowRight size={18} aria-hidden="true" /></a>
        </div>
        <div className="story-hero__image-wrap"><img src={storyImage('01 Khởi nguồn làng nghề.jpg')} alt="Hình ảnh mở đầu câu chuyện làng nghề Thụy Ứng" className="story-hero__image" /></div>
      </div>
    </section>

    <div className="story-divider" aria-hidden="true"><span>✦</span></div>

    <section className="story-intro" id="khoi-nguon">
      <p className="story-eyebrow">01 / Khởi nguồn</p>
      <h2>Một làng nghề, <em>nhiều thế hệ</em> gìn giữ</h2>
      <p>Làng nghề Thụy Ứng là nơi nghề chế tác sừng được truyền từ thế hệ này sang thế hệ khác. Từ việc chọn chất liệu, tạo hình đến mài nhẵn và đánh bóng, mỗi công đoạn đều cần sự kiên nhẫn và đôi tay lành nghề.</p>
    </section>

    <section className="story-chapter story-chapter--warm">
      <div className="story-chapter__image"><img src={storyImage('02 Đôi tay người thợ.jpg')} alt="Đôi tay người thợ trong quá trình chế tác thủ công" loading="lazy" /></div>
      <div className="story-chapter__content">
        <p className="story-eyebrow">02 / Con người</p>
        <h2>Qua đôi tay <em>người thợ</em></h2>
        <span className="story-chapter__line" aria-hidden="true" />
        <p>Không có hai đường vân nào hoàn toàn giống nhau. Người thợ lắng nghe chất liệu, tỉ mỉ tạo hình và hoàn thiện từng chi tiết để vẻ đẹp vốn có của sừng được hiện diện trọn vẹn.</p>
        <p>Đó là sự chăm chút lặng lẽ làm nên nét riêng của mỗi chiếc lược, chiếc trâm Vân Mộc.</p>
      </div>
    </section>

    <section className="story-quote" aria-label="Tinh thần Vân Mộc">
      <span aria-hidden="true">✦</span>
      <blockquote>“Vân nguyên bản, <em>nét riêng bạn.</em>”</blockquote>
      <p>Mỗi món đồ mang theo dấu vân của tự nhiên và câu chuyện của người làm ra nó.</p>
    </section>

    <section className="story-chapter story-chapter--reverse">
      <div className="story-chapter__image"><img src={storyImage('03 Từ  truyền thống đến hiện đại.jpg')} alt="Sản phẩm Vân Mộc kết nối nghề truyền thống với đời sống hiện đại" loading="lazy" /></div>
      <div className="story-chapter__content">
        <p className="story-eyebrow">03 / Tiếp nối</p>
        <h2>Từ truyền thống <em>đến hôm nay</em></h2>
        <span className="story-chapter__line" aria-hidden="true" />
        <p>Vân Mộc tiếp nối tinh thần của làng nghề bằng những vật dụng gần gũi với đời sống. Giữ lại vẻ đẹp nguyên bản của chất liệu, đồng thời chăm chút kiểu dáng để mỗi sản phẩm có thể đồng hành cùng bạn mỗi ngày.</p>
      </div>
    </section>

    <section className="story-finale">
      <div className="story-finale__image"><img src={storyImage('04 Câu chuyện Vân Mộc.jpg')} alt="Câu chuyện Vân Mộc qua sản phẩm thủ công" loading="lazy" /></div>
      <div className="story-finale__content">
        <p className="story-eyebrow">04 / Vân Mộc</p>
        <h2>Câu chuyện vẫn <em>đang tiếp diễn</em></h2>
        <p>Từ làng nghề đến bàn tay bạn, mỗi sản phẩm là một cách để trân trọng chất liệu tự nhiên và công sức của người thợ. Hãy tìm món đồ mang dấu vân dành riêng cho mình.</p>
        <Link to="/shop" className="story-button">Khám phá sản phẩm <ArrowRight size={18} aria-hidden="true" /></Link>
      </div>
    </section>
  </main>
}

export function AboutPage() {
  return <InfoPage eyebrow="Về chúng tôi" title="Vân Mộc — Vân nguyên bản, nét riêng bạn"
    description="Vân Mộc mang vẻ đẹp nguyên bản của chất liệu sừng vào đời sống qua những sản phẩm thủ công từ làng nghề Thụy Ứng."
    image="/image/nghe-nhan-che-tac.jpg" imageAlt="Sản phẩm thủ công từ làng nghề Thụy Ứng"
    sections={[
      { title: 'Tôn trọng chất liệu', text: 'Chúng tôi trân trọng màu sắc và đường vân vốn có của từng chất liệu, để nét riêng tự nhiên hiện diện trong mỗi sản phẩm.' },
      { title: 'Chế tác tận tâm', text: 'Từ tuyển chọn đến hoàn thiện, từng công đoạn đều được thực hiện cẩn thận để tạo nên sản phẩm chỉn chu.' },
    ]} action={{ label: 'Xem câu chuyện làng nghề', to: '/villages' }} />
}

export function CustomOrderPage() {
  return <div className="craft-page">
    <section className="craft-hero" aria-labelledby="craft-hero-title">
      <div className="craft-hero__copy">
        <p className="craft-eyebrow">Chế tác riêng cùng Vân Mộc</p>
        <h1 id="craft-hero-title">Mỗi ý tưởng, một dấu ấn riêng.</h1>
        <p className="craft-lead">Từ ý tưởng của bạn và đôi tay người thợ, Vân Mộc tạo nên những món đồ sừng thủ công mang câu chuyện riêng.</p>
        <div className="craft-hero__actions">
          <a className="craft-button craft-button--primary" href={MESSENGER_URL} target="_blank" rel="noopener noreferrer"><MessengerIcon />Tư vấn qua Messenger<ArrowRight size={16} aria-hidden="true" /></a>
        </div>
      </div>
    </section>
    <section className="craft-process" aria-labelledby="craft-process-title">
      <h2 id="craft-process-title">Từ ý tưởng đến tác phẩm</h2>
      <ol className="craft-process__steps">
        {CRAFT_STEPS.map(step => <li className="craft-process__step" key={step.number}>
          <span className="craft-process__number" aria-hidden="true">{step.number}</span>
          <h3>{step.title}</h3>
          <p>{step.description}</p>
        </li>)}
      </ol>
    </section>
  </div>
}

export function ContactPage() {
  return <InfoPage eyebrow="Liên hệ" title="Kết nối với Vân Mộc"
    description="Bạn cần tư vấn sản phẩm, hỗ trợ đơn hàng hoặc trao đổi ý tưởng chế tác riêng? Liên hệ Vân Mộc qua các kênh chính thức bên dưới."
    sections={[
      { title: 'Hotline', text: <a href={`tel:${BRAND.phone}`}>{BRAND.phone}</a> },
      { title: 'Email', text: <a href={`mailto:${BRAND.email}`}>{BRAND.email}</a> },
      { title: 'Fanpage chính thức', text: <a href={BRAND.facebook} target="_blank" rel="noopener noreferrer">Facebook · Vân Mộc</a> },
      { title: 'Hỗ trợ đơn hàng', text: 'Khi liên hệ, vui lòng cung cấp mã đơn hàng và nội dung cần hỗ trợ. Không gửi mật khẩu, mã OTP hoặc thông tin đăng nhập ngân hàng.' },
    ]}
    action={{ label: 'Xem sản phẩm', to: '/shop' }} />
}
