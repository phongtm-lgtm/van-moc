import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'
import { ArrowRight } from 'lucide-react'
import './CustomOrderHero.css'
import './StoryPage.css'
import './AboutPage.css'
import { BRAND } from '../brand'

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
  const aboutImage = (name: string) => `/image/VanMoc/${encodeURIComponent('Trang Về Chúng Tôi')}/${encodeURIComponent(name)}`
  const strategies = [
    'Gìn giữ kỹ thuật chế tác truyền thống',
    'Chú trọng chất lượng, vẻ đẹp tự nhiên và thân thiện với môi trường',
    'Bao bì hiện đại, giản dị, phù hợp làm quà, biếu tặng',
    'Ứng dụng công nghệ khắc laser theo yêu cầu, cho phép khách hàng khắc tên hoặc thông điệp riêng lên sản phẩm, góp phần gia tăng giá trị cá nhân hóa, ý nghĩa tinh thần và sự độc đáo cho mỗi món quà.',
    'Tích hợp công nghệ NFC khám phá câu chuyện làng nghề và hành trình chế tác sản phẩm.',
  ]
  const values = [
    { title: 'Trân trọng giá trị truyền thống', text: 'Gìn giữ kỹ thuật chế tác thủ công và những giá trị văn hóa được lưu truyền qua nhiều thế hệ tại làng nghề Thụy Ứng.' },
    { title: 'Tôn trọng vẻ đẹp nguyên bản', text: 'Trân trọng những đường vân, sắc độ và đặc tính tự nhiên của chất liệu sừng bò châu Phi, tạo nên nét riêng cho mỗi sản phẩm.' },
    { title: 'Tỉ mỉ trong từng sản phẩm', text: 'Đề cao sự khéo léo, cẩn trọng và tâm huyết của người thợ trong từng công đoạn chế tác, hoàn thiện sản phẩm.' },
    { title: 'Chân thành trong từng giá trị', text: 'Lấy sự chân thành làm nền tảng trong cách giới thiệu sản phẩm, kể câu chuyện làng nghề và kết nối với khách hàng.' },
    { title: 'Trách nhiệm với di sản làng nghề', text: 'Ý thức trách nhiệm trong việc gìn giữ, tôn vinh nghề truyền thống và góp phần lan tỏa những giá trị tốt đẹp của làng nghề Thụy Ứng.' },
  ]

  return <div className="about-page">
    <section className="about-hero" aria-labelledby="about-title">
      <img className="about-hero__banner" src="/image/VanMoc/banner%20V%C3%A2n%20M%E1%BB%99c.png" alt="Vân Mộc – làng nghề Thụy Ứng, sản phẩm sừng thủ công và thông điệp Vân nguyên bản, nét riêng bạn" />
      <div className="about-hero__inner">
        <h1 id="about-title" className="sr-only">Về Vân Mộc – Vân nguyên bản, nét riêng bạn</h1>
        <p>Vân Mộc được hình thành từ tình yêu dành cho những giá trị thủ công truyền thống và mong muốn gìn giữ tinh hoa của làng nghề sừng Thụy Ứng, Thường Tín, Hà Nội. Với Vân Mộc, mỗi sản phẩm không chỉ mang giá trị sử dụng mà còn là sự kết tinh của chất liệu tự nhiên, đôi bàn tay khéo léo và tâm huyết của những người thợ làng nghề.</p>
        <a href="#cau-chuyen-van-moc" className="about-hero__link">Tìm hiểu về Vân Mộc <ArrowRight size={18} aria-hidden="true" /></a>
      </div>
    </section>

    <section className="about-intro" id="cau-chuyen-van-moc">
      <p className="about-eyebrow">Câu chuyện của chúng tôi</p>
      <h2>Câu chuyện <em>Vân Mộc</em></h2>
      <p>Thụy Ứng là làng nghề nổi tiếng với truyền thống chế tác sừng, nơi những kỹ thuật thủ công được gìn giữ và truyền lại qua nhiều thế hệ. Từ chất liệu sừng bò châu Phi với những đường vân và sắc độ tự nhiên riêng biệt, người thợ tỉ mỉ tạo nên những sản phẩm như lược, trâm cài tóc và các món phụ kiện thủ công mang đậm dấu ấn của làng nghề.</p>
      <p>Vân Mộc ra đời với mong muốn gìn giữ và lan tỏa những giá trị ấy. Chúng tôi trân trọng từng công đoạn chế tác, sự khéo léo của người thợ và câu chuyện văn hóa ẩn sau mỗi sản phẩm. Thông qua việc giới thiệu các sản phẩm thủ công từ sừng tự nhiên, Vân Mộc hy vọng sẽ giúp nhiều người hiểu hơn, yêu hơn và trân trọng hơn nghề truyền thống của quê hương.</p>
    </section>

    <section className="about-meaning" aria-label="Vân và Mộc">
      <img src={aboutImage('Vân.jpg')} alt="Chữ Vân – đường vân nguyên bản" loading="lazy" />
      <img src={aboutImage('Mộc.jpg')} alt="Chữ Mộc – nét mộc mạc của người thợ" loading="lazy" />
    </section>

    <section className="about-direction" aria-label="Sứ mệnh và tầm nhìn">
      <div className="about-direction__grid">
        <article><p className="about-eyebrow">Sứ mệnh</p><h2>Gìn giữ tinh hoa – <em>Lan tỏa giá trị</em></h2><p>Vân Mộc mang sứ mệnh gìn giữ và phát huy những giá trị truyền thống của nghề chế tác sừng tại làng nghề Thụy Ứng. Thông qua các sản phẩm thủ công từ sừng bò châu Phi, chúng tôi mong muốn tôn vinh sự khéo léo, tỉ mỉ và tâm huyết của người thợ, đồng thời đưa vẻ đẹp của nghề truyền thống đến gần hơn với cộng đồng, đặc biệt là thế hệ trẻ.</p></article>
        <article><p className="about-eyebrow">Tầm nhìn</p><h2>Tiếp nối truyền thống – <em>Vươn xa giá trị Việt</em></h2><p>Vân Mộc hướng đến trở thành thương hiệu gắn liền với những sản phẩm thủ công từ sừng tự nhiên và tinh hoa làng nghề Thụy Ứng. Chúng tôi mong muốn góp phần nâng cao sự trân trọng của cộng đồng đối với nghề thủ công truyền thống, để những giá trị văn hóa lâu đời tiếp tục được gìn giữ, lan tỏa và nối dài qua các thế hệ.</p></article>
      </div>
    </section>

    <section className="about-strategy" aria-labelledby="about-strategy-title">
      <p className="about-eyebrow">Hướng đi của Vân Mộc</p>
      <h2 id="about-strategy-title">Chiến lược <em>phát triển</em></h2>
      <div className="about-strategy__viewport">
        <div className="about-strategy__track">
          {[0, 1].map(copy => <div className="about-strategy__group" aria-hidden={copy === 1 ? true : undefined} key={copy}>
            {strategies.map((strategy, index) => <div className="about-strategy__card" key={strategy}><span>{String(index + 1).padStart(2, '0')}</span><p>{strategy}</p></div>)}
          </div>)}
        </div>
      </div>
    </section>

    <section className="about-values" aria-labelledby="about-values-title">
      <p className="about-eyebrow">Điều Vân Mộc trân trọng</p>
      <h2 id="about-values-title">Giá trị <em>cốt lõi</em></h2>
      <div className="about-values__grid">
        {values.map((value, index) => <article key={value.title}><span>{String(index + 1).padStart(2, '0')}</span><h3>{value.title}</h3><p>{value.text}</p></article>)}
      </div>
    </section>
  </div>
}

export function CustomOrderPage() {
  return <div className="craft-page">
    <section className="craft-process" aria-labelledby="craft-process-title">
      <h1 id="craft-process-title">Từ ý tưởng đến tác phẩm</h1>
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
