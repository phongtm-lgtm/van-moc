import { ArrowRight, ClipboardCheck, MessageCircle, PackageCheck, ScanLine } from 'lucide-react'
import { BRAND } from '../brand'
import { MessengerIcon } from '../components/MessengerIcon'
import { SectionDecor } from '../components/SectionDecor'
import './DigitalTechnologyPage.css'

const image = (name: string) => `/image/VanMoc/${encodeURIComponent('Trang Công Nghệ Laser')}/${encodeURIComponent(name)}`

const gallery = [
  'Dấu ấn mang tính cá nhân 1.png',
  'Dấu ấn mang tính cá nhân 2.png',
  'Dấu ấn mang tính cá nhân 3.png',
  'Dấu ấn mang tính cá nhân 4.png',
]

const process = [
  { icon: MessageCircle, title: 'Chia sẻ ý tưởng', text: 'Gửi cho Vân Mộc hình ảnh sản phẩm, nội dung cần khắc hoặc mẫu thiết kế bạn yêu thích qua Messenger.' },
  { icon: ClipboardCheck, title: 'Tư vấn và hoàn thiện thiết kế', text: 'Vân Mộc kiểm tra chất liệu, vị trí thể hiện và khả năng gia công, sau đó trao đổi để thống nhất phương án, chi phí và thời gian thực hiện.' },
  { icon: ScanLine, title: 'Tiến hành gia công', text: 'Sau khi xác nhận nội dung, thiết kế và các thông tin cần thiết, sản phẩm được đưa vào quá trình khắc laser theo phương án đã thống nhất.' },
  { icon: PackageCheck, title: 'Hoàn thiện và bàn giao', text: 'Thành phẩm được kiểm tra trước khi bàn giao, để mỗi chi tiết thể hiện đúng tinh thần của thiết kế đã duyệt.' },
]

export function DigitalTechnologyPage() {
  return <div className="digital-page">
    <section className="digital-craft-hero bg-paper-warm" aria-labelledby="digital-craft-title">
      <SectionDecor variant="warm" showMotif />
      <div className="digital-craft-hero__copy">
        <p className="digital-craft-hero__eyebrow">DỊCH VỤ KHẮC &amp; ĐÁNH DẤU LASER</p>
        <h1 id="digital-craft-title">Mỗi ý tưởng, một dấu ấn riêng.</h1>
        <p className="digital-craft-hero__lead">Cá nhân hoá món đồ theo cách của bạn</p>
        <a className="digital-craft-hero__button" href={BRAND.messenger} target="_blank" rel="noopener noreferrer"><MessengerIcon />Tư vấn qua Messenger<ArrowRight size={16} aria-hidden="true" /></a>
      </div>
    </section>
    <section className="digital-intro bg-paper-sand" id="kham-pha" aria-labelledby="digital-intro-title">
      <SectionDecor variant="warm" showMotif />
      <div className="digital-intro__heading">
        <p className="digital-eyebrow">Ứng dụng công nghệ laser</p>
        <h2 id="digital-intro-title">Công nghệ laser Vân Mộc</h2>
        <p className="digital-intro__tagline">Công nghệ hiện đại, lưu giữ dấu ấn riêng</p>
        <p>Tại Vân Mộc, công nghệ laser mở ra cách mới để cá nhân hóa những món đồ thân thuộc. Bằng việc ứng dụng tia laser trong quá trình khắc và đánh dấu trên bề mặt vật liệu phù hợp, chúng tôi giúp tên riêng, hình vẽ, chữ ký và những thông điệp ý nghĩa trở thành dấu ấn độc đáo trên từng sản phẩm.</p>
        <p>Từ một cái tên nhỏ đến một biểu tượng mang ý nghĩa riêng, mỗi chi tiết đều được thực hiện dựa trên thiết kế đã thống nhất, chú trọng sự chỉn chu và tính thẩm mỹ.</p>
      </div>
    </section>

    <section className="digital-split bg-paper-wine" aria-labelledby="digital-split-title">
      <SectionDecor variant="wine" />
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

    <section className="digital-gallery bg-paper-grain" aria-labelledby="digital-gallery-title">
      <SectionDecor variant="warm" showMotif />
      <h2 id="digital-gallery-title">Dấu ấn mang tính <em>cá nhân</em></h2>
      <p className="digital-gallery__lead">Không chỉ là một món đồ, mà còn là câu chuyện của riêng bạn.</p>
      <p>Một cái tên thân thuộc, ngày tháng đáng nhớ, chữ ký hay hình vẽ yêu thích đều có thể trở thành dấu ấn riêng trên món đồ bạn trân trọng.</p>
      <p>Tại Vân Mộc, bạn có thể bắt đầu từ một ý tưởng có sẵn hoặc chia sẻ mong muốn của mình để cùng tìm ra cách thể hiện phù hợp. Từ kiểu chữ, biểu tượng đến cách sắp xếp các chi tiết, mỗi thiết kế đều hướng đến việc phản ánh cá tính và câu chuyện riêng của bạn.</p>
      <div className="digital-gallery__grid">{gallery.map((name, index) => <figure key={name}><img src={image(name)} alt={`Gợi ý cá nhân hóa sản phẩm Vân Mộc ${index + 1}`} loading="lazy" /></figure>)}</div>
    </section>

    <section className="digital-process bg-paper-sand" aria-labelledby="digital-process-title">
      <SectionDecor variant="warm" showMotif />
      <h2 id="digital-process-title">Từ ý tưởng đến <em>thành phẩm</em></h2>
      <ol className="digital-process__steps">
        {process.map(({ icon: Icon, title, text }, index) => <li className="digital-process__step" key={title}>
          <span className="digital-process__number">{String(index + 1).padStart(2, '0')}</span>
          <Icon size={30} strokeWidth={1.5} aria-hidden="true" />
          <h3>{title}</h3>
          <p>{text}</p>
        </li>)}
      </ol>
    </section>

    <section className="digital-cta bg-paper-warm" aria-labelledby="digital-cta-title">
      <div className="bg-paper-wine">
        <SectionDecor variant="wine" />
        <h2 id="digital-cta-title">Ý tưởng của bạn, sự chăm chút của Vân Mộc — <em>cùng tạo nên một dấu ấn riêng.</em></h2>
        <a href={BRAND.messenger} target="_blank" rel="noopener noreferrer" className="digital-button">Trao đổi với Vân Mộc <ArrowRight size={18} aria-hidden="true" /></a>
      </div>
    </section>
  </div>
}
