import { Link } from 'react-router-dom'

type InfoPageProps = {
  eyebrow: string
  title: string
  description: string
  image?: string
  imageAlt?: string
  sections: { title: string; text: string }[]
  action?: { label: string; to: string }
}

function InfoPage({ eyebrow, title, description, image, imageAlt, sections, action }: InfoPageProps) {
  return <div className="bg-paper-warm min-h-screen pt-16 md:pt-20">
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
  return <InfoPage eyebrow="Câu chuyện làng nghề" title="Làng nghề Thụy Ứng"
    description="Từ đôi tay của người thợ, chất liệu sừng tự nhiên trở thành những vật dụng mang dấu ấn riêng. Vân Mộc tiếp nối câu chuyện thủ công ấy qua từng sản phẩm."
    image="/image/truy-xuat/lang-nghe-thuy-ung.jpg" imageAlt="Làng nghề Thụy Ứng"
    sections={[
      { title: 'Gìn giữ nghề truyền thống', text: 'Kỹ thuật chế tác được truyền qua nhiều thế hệ, từ chọn chất liệu, tạo hình đến mài nhẵn và đánh bóng bằng tay.' },
      { title: 'Mỗi đường vân một câu chuyện', text: 'Sắc độ và đường vân tự nhiên khiến mỗi chiếc lược, mỗi chiếc trâm đều có vẻ đẹp không trùng lặp.' },
    ]} action={{ label: 'Khám phá sản phẩm', to: '/shop' }} />
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
  return <InfoPage eyebrow="Chế tác riêng" title="Từ ý tưởng của bạn đến sản phẩm riêng"
    description="Bạn có mẫu thiết kế hoặc ý tưởng cho một món đồ thủ công? Hãy liên hệ Vân Mộc để được tư vấn về kiểu dáng, chất liệu và quá trình chế tác."
    image="/image/products/tram-hoa-sen.jpg" imageAlt="Trâm cài thủ công"
    sections={[
      { title: '01 · Gửi ý tưởng', text: 'Chia sẻ hình ảnh, mẫu tham khảo hoặc mô tả sản phẩm bạn mong muốn.' },
      { title: '02 · Nhận tư vấn', text: 'Trao đổi về kiểu dáng, chất liệu và kích thước phù hợp trước khi thống nhất thiết kế.' },
      { title: '03 · Chế tác', text: 'Người thợ tạo hình, mài và hoàn thiện sản phẩm thủ công theo thiết kế đã thống nhất.' },
      { title: 'Liên hệ tư vấn', text: 'Gửi ý tưởng của bạn qua email để Vân Mộc trao đổi thêm về yêu cầu chế tác.' },
    ]} action={{ label: 'Liên hệ Vân Mộc', to: '/lien-he' }} />
}

export function ContactPage() {
  return <InfoPage eyebrow="Liên hệ" title="Kết nối với Vân Mộc"
    description="Bạn cần tư vấn sản phẩm hoặc muốn trao đổi về ý tưởng chế tác riêng? Hãy gửi email đến lienhe@vanmoc.vn."
    sections={[{ title: 'Làng nghề Thụy Ứng', text: 'Thụy Ứng, Hà Nội — nơi Vân Mộc gìn giữ câu chuyện chế tác sừng thủ công.' }]}
    action={{ label: 'Xem sản phẩm', to: '/shop' }} />
}
