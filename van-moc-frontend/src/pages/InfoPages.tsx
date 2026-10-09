import { Link } from 'react-router-dom'
import { ArrowRight, Gift, Heart, MessageCircle, PencilLine, Sparkles } from 'lucide-react'

const MESSENGER_URL = 'https://m.me/vanmoc2026'

const customServices = [
  { icon: PencilLine, title: 'Khắc tên, gửi gắm lời thương', text: 'Một cái tên, ngày kỷ niệm hay lời nhắn nhỏ biến món đồ thân quen thành dấu ấn chỉ riêng bạn có.' },
  { icon: Sparkles, title: 'Chế tác theo mẫu', text: 'Chia sẻ hình ảnh hoặc ý tưởng tham khảo để cùng Vân Mộc trao đổi về kiểu dáng, chất liệu và cách thực hiện.' },
  { icon: Gift, title: 'Quà tặng cá nhân hóa', text: 'Dành tặng người thân, bạn bè hay đối tác một món quà thủ công mang câu chuyện và tâm ý của bạn.' },
  { icon: Heart, title: 'Sản phẩm đặt riêng', text: 'Từ một chiếc lược đến bộ quà tặng, mỗi yêu cầu được tư vấn theo số lượng và thời gian mong muốn.' },
]

const customSteps = [
  { number: '01', title: 'Gửi ý tưởng qua Messenger', text: 'Nhắn cho Vân Mộc ý tưởng, ảnh mẫu, số lượng và thời gian bạn mong muốn.' },
  { number: '02', title: 'Nghệ nhân tư vấn và báo giá', text: 'Cùng trao đổi về chất liệu, kiểu dáng và phương án phù hợp với ý tưởng của bạn.' },
  { number: '03', title: 'Thống nhất phương án chế tác', text: 'Khi mọi chi tiết đã rõ ràng, Vân Mộc mới bắt đầu thực hiện món đồ dành riêng cho bạn.' },
]

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
  return <main className="bg-paper-warm min-h-screen text-[#382419]">
    <section className="relative overflow-hidden pt-24 md:pt-32">
      <div className="container relative z-10 mx-auto grid items-center gap-10 px-5 pb-16 md:grid-cols-2 md:gap-12 md:px-8 md:pb-24">
        <div className="max-w-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#9a582f]">Chế tác riêng cùng Vân Mộc</p>
          <h1 className="mt-5 font-serif text-4xl leading-tight italic text-[#452416] md:text-5xl lg:text-6xl">Dấu ấn riêng trên từng tác phẩm</h1>
          <p className="mt-6 max-w-lg text-base leading-relaxed text-[#634c3b] md:text-lg">Từ chất liệu sừng tự nhiên và đôi tay nghệ nhân, Vân Mộc cùng bạn tạo nên những món đồ thủ công mang câu chuyện, ý nghĩa và phong cách riêng.</p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <a href={MESSENGER_URL} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#5a301a] px-6 py-3 font-semibold text-[#fff3dd] transition-colors hover:bg-[#3f2517]"><MessageCircle size={19} aria-hidden="true" /> Tư vấn qua Messenger <ArrowRight size={17} aria-hidden="true" /></a>
            <Link to="/shop" className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#8e6d52] px-6 py-3 font-semibold text-[#5a301a] transition-colors hover:bg-[#e9d9bf]">Xem các sản phẩm</Link>
          </div>
          <p className="mt-5 text-sm text-[#806954]">Gửi ảnh mẫu, số lượng và thời gian mong muốn ngay trong cuộc trò chuyện.</p>
        </div>
        <div className="relative overflow-hidden rounded-[2rem] border border-[#aa825b]/30 shadow-[0_22px_60px_rgba(73,40,20,0.18)]">
          <img src="/image/truy-xuat/che-tac-mai.jpg" alt="Nghệ nhân chế tác sản phẩm thủ công" className="aspect-[4/3] w-full object-cover md:aspect-[5/5]" />
        </div>
      </div>
    </section>

    <section className="relative bg-[#f5ebdb]/80 py-16 md:py-24">
      <div className="container mx-auto px-5 md:px-8">
        <div className="mx-auto max-w-2xl text-center"><p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#9a582f]">Chế tác theo yêu cầu</p><h2 className="mt-3 font-serif text-3xl text-[#452416] md:text-4xl">Một ý tưởng, nhiều cách thể hiện</h2><p className="mt-4 leading-relaxed text-[#634c3b]">Dù là một chi tiết nhỏ hay một món quà trọn vẹn, Vân Mộc luôn lắng nghe điều bạn muốn gửi gắm.</p></div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{customServices.map(service => <article key={service.title} className="rounded-2xl border border-[#cbb291]/50 bg-[#fffaf0]/80 p-6 shadow-sm"><span className="inline-flex size-12 items-center justify-center rounded-full bg-[#efe0ca] text-[#8b4a24]"><service.icon size={24} strokeWidth={1.5} aria-hidden="true" /></span><h3 className="mt-5 font-serif text-xl text-[#452416]">{service.title}</h3><p className="mt-3 text-sm leading-relaxed text-[#634c3b]">{service.text}</p></article>)}</div>
      </div>
    </section>

    <section className="relative py-16 md:py-24">
      <div className="container mx-auto px-5 md:px-8">
        <div className="mx-auto max-w-2xl text-center"><p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#9a582f]">Quy trình chế tác riêng</p><h2 className="mt-3 font-serif text-3xl text-[#452416] md:text-4xl">Chỉ 3 bước để bắt đầu</h2><p className="mt-4 text-[#634c3b]">Mọi trao đổi đều diễn ra trực tiếp qua Messenger, không cần điền biểu mẫu.</p></div>
        <ol className="mt-12 grid gap-5 md:grid-cols-3">{customSteps.map(step => <li key={step.number} className="rounded-2xl border border-[#cbb291]/60 bg-[#fff9ed]/75 p-7"><span className="font-serif text-4xl italic text-[#a46b3e]">{step.number}</span><h3 className="mt-5 font-serif text-xl text-[#452416]">{step.title}</h3><p className="mt-3 text-sm leading-relaxed text-[#634c3b]">{step.text}</p></li>)}</ol>
      </div>
    </section>

    <section className="px-5 pb-20 md:px-8 md:pb-28"><div className="container mx-auto rounded-3xl bg-[#57331f] px-6 py-12 text-center text-[#fff5e6] md:px-12 md:py-16"><p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#e8c9a3]">Cùng Vân Mộc tạo nên nét riêng</p><h2 className="mt-4 font-serif text-3xl italic md:text-4xl">Bạn có một ý tưởng riêng?</h2><p className="mx-auto mt-4 max-w-xl leading-relaxed text-[#f0dfcd]">Hãy kể Vân Mộc nghe về món đồ bạn mong muốn. Gửi ảnh mẫu, số lượng hoặc thời gian dự kiến để cùng bắt đầu cuộc trò chuyện.</p><a href={MESSENGER_URL} target="_blank" rel="noopener noreferrer" className="mt-7 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#fff3dd] px-7 py-3 font-semibold text-[#57331f] transition-colors hover:bg-white"><MessageCircle size={19} aria-hidden="true" /> Nhắn tin cho Vân Mộc <ArrowRight size={17} aria-hidden="true" /></a></div></section>
  </main>
}

export function ContactPage() {
  return <InfoPage eyebrow="Liên hệ" title="Kết nối với Vân Mộc"
    description="Bạn cần tư vấn sản phẩm hoặc muốn trao đổi về ý tưởng chế tác riêng? Hãy gửi email đến lienhe@vanmoc.vn."
    sections={[{ title: 'Làng nghề Thụy Ứng', text: 'Thụy Ứng, Hà Nội — nơi Vân Mộc gìn giữ câu chuyện chế tác sừng thủ công.' }]}
    action={{ label: 'Xem sản phẩm', to: '/shop' }} />
}
