import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { Gem, HandHeart, Landmark, Sparkles, Trees } from 'lucide-react'
import './StoryPage.css'
import './AboutPage.css'
import { AboutStrategyTimeline } from '../components/AboutStrategyTimeline'
import { BRAND } from '../brand'

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
  const { hash } = useLocation()
  const storyImage = (name: string) => `/image/VanMoc/${encodeURIComponent('Trang Câu chuyện')}/${encodeURIComponent(name)}`

  useEffect(() => {
    if (!hash) return
    const id = hash.replace(/^#/, '')
    const el = document.getElementById(id)
    if (!el) return
    const frame = window.requestAnimationFrame(() => {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
    return () => window.cancelAnimationFrame(frame)
  }, [hash])

  const chapters = [
    {
      number: '01', label: 'KHỞI NGUỒN LÀNG NGHỀ', title: 'Nơi tinh hoa được gìn giữ qua thời gian',
      image: '01 Khởi nguồn làng nghề.jpg',
      paragraphs: [
        'Thụy Ứng, Thường Tín, Hà Nội là vùng đất gắn liền với nghề chế tác lược sừng có lịch sử hơn 400 năm. Qua bao thế hệ, những người thợ nơi đây vẫn bền bỉ gìn giữ kỹ thuật thủ công và kinh nghiệm được truyền lại từ cha ông.',
        'Từ một nghề truyền thống, những sản phẩm sừng mộc mạc đã trở thành dấu ấn của sự khéo léo, kiên nhẫn và tình yêu dành cho nghề.',
      ],
    },
    {
      number: '02', label: 'ĐÔI TAY NGƯỜI THỢ', title: 'Tỉ mỉ trong từng đường nét',
      image: '02 Đôi tay người thợ.jpg',
      paragraphs: [
        'Đằng sau mỗi sản phẩm là nhiều công đoạn đòi hỏi sự khéo léo và kiên trì, từ lựa chọn chất liệu, xử lý sừng, tạo hình đến mài nhẵn và đánh bóng.',
        'Bằng đôi tay và kinh nghiệm tích lũy qua năm tháng, người thợ làm nổi bật màu sắc, đường vân tự nhiên của sừng, tạo nên nét riêng cho từng món đồ thủ công.',
      ],
    },
    {
      number: '03', label: 'TỪ TRUYỀN THỐNG ĐẾN HIỆN ĐẠI', title: 'Di sản trong diện mạo mới',
      image: '03 Từ  truyền thống đến hiện đại.jpg',
      paragraphs: [
        'Không chỉ dừng lại ở những chiếc lược truyền thống, chất liệu sừng còn được ứng dụng trong nhiều món phụ kiện như trâm cài tóc, khuyên tai, vòng tay và nhẫn.',
        'Vân Mộc mong muốn kết hợp giá trị thủ công lâu đời với ngôn ngữ thiết kế hiện đại, để những sản phẩm mang dấu ấn truyền thống có thể đồng hành cùng phong cách sống hôm nay.',
      ],
    },
    {
      number: '04', label: 'CÂU CHUYỆN VÂN MỘC', title: 'Trân trọng nguyên bản, tôn vinh nét riêng',
      image: '04 Câu chuyện Vân Mộc.jpg',
      paragraphs: [
        'Vân Mộc ra đời từ sự trân trọng dành cho nghề chế tác sừng Thụy Ứng và mong muốn đưa vẻ đẹp của chất liệu tự nhiên đến gần hơn với thế hệ trẻ.',
        'Chúng mình tin rằng mỗi sản phẩm đều mang một vẻ đẹp riêng, được tạo nên từ đường vân tự nhiên, bàn tay người thợ và những giá trị truyền thống được tiếp nối. Vân Mộc không chỉ làm ra phụ kiện, mà còn mong muốn kể tiếp câu chuyện của một làng nghề bằng ngôn ngữ gần gũi với cuộc sống hiện đại.',
      ],
    },
  ]

  return <main className="story-page">
    <section className="story-hero" aria-labelledby="story-title">
      <div className="story-hero__inner">
        <div className="story-hero__copy">
          <h1 id="story-title">
            <span>CÂU CHUYỆN LƯỢC SỪNG THỤY ỨNG</span>
            <span>“Tinh hoa đương đại - Chế tác từ Sừng”</span>
          </h1>
          <span className="story-rule" aria-hidden="true">✦</span>
        </div>
        <div className="story-hero__video-wrap" id="story-video">
          <iframe
            src="https://www.youtube-nocookie.com/embed/ZD3Akw4nw1w"
            title="Câu chuyện lược sừng Thụy Ứng"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        </div>
      </div>
    </section>
    <div className="story-chapters">
      {chapters.map((chapter, index) => <section className={`story-chapter ${index % 2 === 0 ? 'bg-paper-sand' : 'bg-paper-mist'}`} id={chapter.number === '01' ? 'khoi-nguon' : undefined} key={chapter.number}>
        <div className="story-chapter__image"><img src={storyImage(chapter.image)} alt={chapter.label.toLocaleLowerCase('vi')} loading="lazy" /></div>
        <div className="story-chapter__content">
          <p className="story-eyebrow">{chapter.number} · {chapter.label}</p>
          <h2>{chapter.title}</h2>
          <span className="story-chapter__line" aria-hidden="true" />
          {chapter.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
        </div>
      </section>)}
    </div>
    <section className="story-ending" aria-label="Thông điệp Vân Mộc">
      <div className="story-ending__card">
        <h2>Vân nguyên bản – Nét riêng bạn</h2>
        <p>Trân trọng vẻ đẹp tự nhiên. Gìn giữ tinh hoa thủ công. Tôn vinh dấu ấn riêng.</p>
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
    { icon: Landmark, title: 'Trân trọng giá trị truyền thống', text: 'Gìn giữ kỹ thuật chế tác thủ công và những giá trị văn hóa được lưu truyền qua nhiều thế hệ tại làng nghề Thụy Ứng.' },
    { icon: Trees, title: 'Tôn trọng vẻ đẹp nguyên bản', text: 'Trân trọng những đường vân, sắc độ và đặc tính tự nhiên của chất liệu sừng bò châu Phi, tạo nên nét riêng cho mỗi sản phẩm.' },
    { icon: Sparkles, title: 'Tỉ mỉ trong từng sản phẩm', text: 'Đề cao sự khéo léo, cẩn trọng và tâm huyết của người thợ trong từng công đoạn chế tác, hoàn thiện sản phẩm.' },
    { icon: HandHeart, title: 'Chân thành trong từng giá trị', text: 'Lấy sự chân thành làm nền tảng trong cách giới thiệu sản phẩm, kể câu chuyện làng nghề và kết nối với khách hàng.' },
    { icon: Gem, title: 'Trách nhiệm với di sản làng nghề', text: 'Ý thức trách nhiệm trong việc gìn giữ, tôn vinh nghề truyền thống và góp phần lan tỏa những giá trị tốt đẹp của làng nghề Thụy Ứng.' },
  ]

  return <div className="about-page">
    <section className="about-hero" aria-labelledby="about-title">
      <img className="about-hero__banner" src="/image/VanMoc/banner%20V%C3%A2n%20M%E1%BB%99c.png" alt="Vân Mộc – làng nghề Thụy Ứng, sản phẩm sừng thủ công và thông điệp Vân nguyên bản, nét riêng bạn" />
      <div className="about-hero__inner">
        <p className="about-eyebrow">Về chúng tôi</p>
        <h1 id="about-title">Vân Mộc – Vân nguyên bản, Nét riêng bạn</h1>
        <p>Vân Mộc được hình thành từ tình yêu dành cho những giá trị thủ công truyền thống và mong muốn gìn giữ tinh hoa của làng nghề sừng Thụy Ứng, Thường Tín, Hà Nội. Với Vân Mộc, mỗi sản phẩm không chỉ mang giá trị sử dụng mà còn là sự kết tinh của chất liệu tự nhiên, đôi bàn tay khéo léo và tâm huyết của những người thợ làng nghề.</p>
      </div>
    </section>

    <section className="about-intro bg-paper-warm" id="cau-chuyen-van-moc">
      <div className="about-intro__inner">
        <div className="about-intro__copy">
          <p className="about-eyebrow">Câu chuyện của chúng tôi</p>
          <h2>Câu chuyện <em>Vân Mộc</em></h2>
          <div className="about-intro__prose">
            <p>Thụy Ứng là làng nghề nổi tiếng với truyền thống chế tác sừng, nơi những kỹ thuật thủ công được gìn giữ và truyền lại qua nhiều thế hệ. Từ chất liệu sừng bò châu Phi với những đường vân và sắc độ tự nhiên riêng biệt, người thợ tỉ mỉ tạo nên những sản phẩm như lược, trâm cài tóc và các món phụ kiện thủ công mang đậm dấu ấn của làng nghề.</p>
            <p>Vân Mộc ra đời với mong muốn gìn giữ và lan tỏa những giá trị ấy. Chúng tôi trân trọng từng công đoạn chế tác, sự khéo léo của người thợ và câu chuyện văn hóa ẩn sau mỗi sản phẩm. Thông qua việc giới thiệu các sản phẩm thủ công từ sừng tự nhiên, Vân Mộc hy vọng sẽ giúp nhiều người hiểu hơn, yêu hơn và trân trọng hơn nghề truyền thống của quê hương.</p>
          </div>
        </div>
        <div className="about-meaning" aria-label="Vân và Mộc">
          <img src={aboutImage('Vân.jpg')} alt="Chữ Vân – đường vân nguyên bản" loading="lazy" />
          <img src={aboutImage('Mộc.jpg')} alt="Chữ Mộc – nét mộc mạc của người thợ" loading="lazy" />
        </div>
      </div>
    </section>

    <section className="about-direction bg-paper-sand" aria-label="Sứ mệnh và tầm nhìn">
      <div className="about-direction__grid">
        <article><span className="about-direction__number" aria-hidden="true">01</span><p className="about-eyebrow">Sứ mệnh</p><h2>Gìn giữ tinh hoa – <em>Lan tỏa giá trị</em></h2><p>Vân Mộc mang sứ mệnh gìn giữ và phát huy những giá trị truyền thống của nghề chế tác sừng tại làng nghề Thụy Ứng. Thông qua các sản phẩm thủ công từ sừng bò châu Phi, chúng tôi mong muốn tôn vinh sự khéo léo, tỉ mỉ và tâm huyết của người thợ, đồng thời đưa vẻ đẹp của nghề truyền thống đến gần hơn với cộng đồng, đặc biệt là thế hệ trẻ.</p></article>
        <article><span className="about-direction__number" aria-hidden="true">02</span><p className="about-eyebrow">Tầm nhìn</p><h2>Tiếp nối truyền thống – <em>Vươn xa giá trị Việt</em></h2><p>Vân Mộc hướng đến trở thành thương hiệu gắn liền với những sản phẩm thủ công từ sừng tự nhiên và tinh hoa làng nghề Thụy Ứng. Chúng tôi mong muốn góp phần nâng cao sự trân trọng của cộng đồng đối với nghề thủ công truyền thống, để những giá trị văn hóa lâu đời tiếp tục được gìn giữ, lan tỏa và nối dài qua các thế hệ.</p></article>
      </div>
    </section>

    <section className="about-strategy bg-paper-mist" aria-labelledby="about-strategy-title">
      <div className="about-strategy__inner about-strategy__inner--motion">
        <div className="about-strategy__heading">
          <p className="about-eyebrow">Hướng đi của Vân Mộc</p>
          <h2 id="about-strategy-title">Chiến lược <em>phát triển</em></h2>
          <p className="about-strategy__period">Giai Đoạn 2026 - 2031</p>
        </div>
        <AboutStrategyTimeline items={strategies} />
      </div>
    </section>

    <section className="about-values bg-paper-sand" aria-labelledby="about-values-title">
      <div className="about-values__inner">
        <p className="about-eyebrow">Điều Vân Mộc trân trọng</p>
        <h2 id="about-values-title">Giá trị <em>cốt lõi</em></h2>
        <div className="about-values__grid">
          {values.map(value => {
            const Icon = value.icon
            return <article key={value.title}>
              <span className="about-values__icon" aria-hidden="true"><Icon strokeWidth={1.6} /></span>
              <h3>{value.title}</h3>
              <p>{value.text}</p>
            </article>
          })}
        </div>
      </div>
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
