import { ArrowRight, Fingerprint, PenLine, ScanLine } from 'lucide-react'
import { BRAND } from '../brand'
import { MessengerIcon } from '../components/MessengerIcon'
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
    <section className="digital-craft-hero" aria-labelledby="digital-craft-title">
      <div className="digital-craft-hero__copy">
        <p className="digital-craft-hero__eyebrow">DỊCH VỤ KHẮC &amp; ĐÁNH DẤU LASER</p>
        <h1 id="digital-craft-title">Mỗi ý tưởng, một dấu ấn riêng.</h1>
        <p className="digital-craft-hero__lead">Cá nhân hoá món đồ theo cách của bạn</p>
        <a className="digital-craft-hero__button" href={BRAND.messenger} target="_blank" rel="noopener noreferrer"><MessengerIcon />Tư vấn qua Messenger<ArrowRight size={16} aria-hidden="true" /></a>
      </div>
    </section>
    <section className="digital-intro" id="kham-pha" aria-labelledby="digital-intro-title">
      <div className="digital-intro__heading">
        <p className="digital-eyebrow">Ứng dụng công nghệ laser</p>
        <h2 id="digital-intro-title">Công nghệ laser Vân Mộc</h2>
        <p className="digital-intro__tagline">Công nghệ hiện đại, lưu giữ dấu ấn riêng</p>
        <p>Tại Vân Mộc, công nghệ laser mở ra cách mới để cá nhân hóa những món đồ thân thuộc. Bằng việc ứng dụng tia laser trong quá trình khắc và đánh dấu trên bề mặt vật liệu phù hợp, chúng tôi giúp tên riêng, hình vẽ, chữ ký và những thông điệp ý nghĩa trở thành dấu ấn độc đáo trên từng sản phẩm.</p>
        <p>Từ một cái tên nhỏ đến một biểu tượng mang ý nghĩa riêng, mỗi chi tiết đều được thực hiện dựa trên thiết kế đã thống nhất, chú trọng sự chỉn chu và tính thẩm mỹ.</p>
      </div>
    </section>

    <section className="digital-split" aria-labelledby="digital-split-title">
      <div className="digital-split__inner">
        <div className="digital-split__image"><img src={image('độ tinh tế trong từng đường nét.jpg')} alt="Chi tiết chữ được khắc trên sản phẩm Vân Mộc" loading="lazy" /></div>
        <div className="digital-split__copy">
          <p className="digital-eyebrow">Độ tinh tế trong từng chi tiết</p>
          <h2 id="digital-split-title">Chỉn chu từ <em>đường nét nhỏ nhất.</em></h2>
          <p>Một nét chữ, một biểu tượng hay một họa tiết nhỏ đều có thể tạo nên sự khác biệt. Với công nghệ laser, Vân Mộc chăm chút từng chi tiết trong quá trình gia công, từ việc căn chỉnh thiết kế đến lựa chọn vị trí thể hiện phù hợp trên bề mặt sản phẩm.</p>
          <p>Mỗi đường nét được thực hiện với sự tỉ mỉ, hướng đến thành phẩm hài hòa với chất liệu và giữ trọn tinh thần của thiết kế ban đầu.</p>
          <p className="digital-split__closing">Bởi đôi khi, chính những điều nhỏ bé lại tạo nên giá trị riêng biệt.</p>
        </div>
      </div>
    </section>

    <section className="digital-features" aria-label="Cá nhân hóa sản phẩm bằng công nghệ laser">
      {features.map(({ icon: Icon, number, title, text }) => <article className="digital-feature" key={number}>
        <span className="digital-feature__number">{number} / 03</span>
        <Icon size={32} strokeWidth={1.4} aria-hidden="true" />
        <h3>{title}</h3>
        <p>{text}</p>
      </article>)}
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
