import { ArrowRight, Fingerprint, PenLine, ScanLine, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { BRAND } from '../brand'
import './DigitalTechnologyPage.css'

const image = (name: string) => `/image/VanMoc/${encodeURIComponent('Trang Công Nghệ Laser')}/${encodeURIComponent(name)}`

const features = [
  { icon: PenLine, number: '01', title: 'Từ ý tưởng của bạn', text: 'Một cái tên, lời nhắn hay hình vẽ nhỏ có thể trở thành dấu ấn riêng trên món đồ bạn chọn.' },
  { icon: ScanLine, number: '02', title: 'Khắc laser tinh tế', text: 'Công nghệ khắc laser giúp thể hiện những chi tiết nhỏ trên bề mặt sản phẩm một cách chỉn chu.' },
  { icon: Fingerprint, number: '03', title: 'Mỗi món đồ một nét riêng', text: 'Đường vân tự nhiên của sừng kết hợp cùng nội dung cá nhân hóa tạo nên món quà dành riêng cho bạn.' },
]

const gallery = [
  'Dấu ấn mang tính cá nhân 1.png',
  'Dấu ấn mang tính cá nhân 2.png',
  'Dấu ấn mang tính cá nhân 3.png',
  'Dấu ấn mang tính cá nhân 4.png',
]

export function DigitalTechnologyPage() {
  return <div className="digital-page">
    <section className="digital-hero" aria-labelledby="digital-title">
      <div className="digital-hero__content">
        <p className="digital-eyebrow"><Sparkles size={16} aria-hidden="true" /> Truyền thống gặp công nghệ</p>
        <h1 id="digital-title">Công nghệ số <em>Vân Mộc</em></h1>
        <p>Giữ trọn vẻ đẹp nguyên bản của sừng, thêm vào đó dấu ấn chỉ thuộc về bạn. Vân Mộc kết hợp đôi tay người thợ với công nghệ khắc laser để mỗi món đồ kể một câu chuyện riêng.</p>
        <a href="#kham-pha" className="digital-button">Khám phá hành trình <ArrowRight size={18} aria-hidden="true" /></a>
      </div>
      <div className="digital-hero__visual">
        <img src={image('Vân Mộc che tac rieng(1).png')} alt="Sản phẩm chế tác riêng của Vân Mộc" />
        <span className="digital-hero__stamp">Vân nguyên bản<br />Nét riêng bạn</span>
      </div>
    </section>

    <section className="digital-intro" id="kham-pha" aria-labelledby="digital-intro-title">
      <p className="digital-eyebrow">Ứng dụng công nghệ số</p>
      <h2 id="digital-intro-title">Từ chất liệu tự nhiên đến <em>dấu ấn cá nhân</em></h2>
      <p className="digital-intro__lead">Công nghệ không thay thế sự khéo léo của người thợ. Đó là một cách để ý tưởng của bạn hiện diện rõ nét hơn trên sản phẩm thủ công.</p>
      <div className="digital-features">
        {features.map(({ icon: Icon, number, title, text }) => <article className="digital-feature" key={number}>
          <span className="digital-feature__number">{number} / 03</span>
          <Icon size={32} strokeWidth={1.4} aria-hidden="true" />
          <h3>{title}</h3>
          <p>{text}</p>
        </article>)}
      </div>
    </section>

    <section className="digital-split" aria-labelledby="digital-split-title">
      <div className="digital-split__image"><img src={image('độ tinh tế trong từng đường nét.jpg')} alt="Chi tiết chế tác thể hiện sự tinh tế trong từng đường nét" loading="lazy" /></div>
      <div className="digital-split__copy">
        <p className="digital-eyebrow">Tinh tế trong từng đường nét</p>
        <h2 id="digital-split-title">Khi kỹ thuật mới <em>gặp bàn tay thủ công</em></h2>
        <p>Mỗi chất liệu sừng có sắc độ và đường vân khác nhau. Vân Mộc lắng nghe ý tưởng của bạn, cân nhắc vị trí và nội dung khắc để dấu ấn cá nhân hòa cùng vẻ đẹp vốn có của sản phẩm.</p>
        <Link to="/custom-order" className="digital-text-link">Tìm hiểu chế tác riêng <ArrowRight size={18} aria-hidden="true" /></Link>
      </div>
    </section>

    <section className="digital-gallery" aria-labelledby="digital-gallery-title">
      <p className="digital-eyebrow">Cảm hứng dành cho bạn</p>
      <h2 id="digital-gallery-title">Dấu ấn mang tính <em>cá nhân</em></h2>
      <p>Khám phá những cách lưu giữ một cái tên, một kỷ niệm hay lời nhắn trên món đồ gần gũi mỗi ngày.</p>
      <div className="digital-gallery__grid">{gallery.map((name, index) => <figure key={name}><img src={image(name)} alt={`Gợi ý cá nhân hóa sản phẩm Vân Mộc ${index + 1}`} loading="lazy" /></figure>)}</div>
    </section>

    <section className="digital-cta" aria-labelledby="digital-cta-title">
      <div>
        <p className="digital-eyebrow">Bắt đầu từ ý tưởng của bạn</p>
        <h2 id="digital-cta-title">Cùng Vân Mộc tạo nên <em>nét riêng</em></h2>
        <p>Chia sẻ điều bạn muốn khắc, chúng mình sẽ cùng bạn trao đổi về sản phẩm và cách thể hiện phù hợp.</p>
        <a href={BRAND.messenger} target="_blank" rel="noopener noreferrer" className="digital-button">Trao đổi với Vân Mộc <ArrowRight size={18} aria-hidden="true" /></a>
      </div>
    </section>
  </div>
}
