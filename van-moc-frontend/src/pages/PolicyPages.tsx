import { Link } from 'react-router-dom'
import { BRAND } from '../brand'

const purchase = [
  ['Thông tin sản phẩm và giá bán', 'Sản phẩm được chế tác từ sừng tự nhiên nên sắc độ và đường vân có thể khác nhau giữa từng sản phẩm. Vui lòng kiểm tra mô tả, kích thước, giá và cấu hình khắc trước khi đặt hàng. Phí khắc, phí giao hàng và tổng thanh toán được hiển thị tại bước xác nhận đơn.'],
  ['Đặt hàng và khắc tên', 'Chọn sản phẩm, số lượng và nội dung khắc nếu có, sau đó kiểm tra địa chỉ nhận hàng và phương thức thanh toán. Với hàng cá nhân hóa, hãy kiểm tra chính tả, font và vị trí khắc trước khi xác nhận. Yêu cầu thay đổi sau khi đặt cần được Vân Mộc kiểm tra theo tiến độ xử lý thực tế.'],
  ['Thanh toán', 'Các phương thức khả dụng được hiển thị tại bước thanh toán. Với chuyển khoản, sử dụng đúng tài khoản, số tiền và nội dung được cung cấp cho đơn hàng. Việc bấm kiểm tra trạng thái không thay thế xác nhận thanh toán của hệ thống. Nếu đã chuyển tiền nhưng trạng thái chưa cập nhật, hãy liên hệ Vân Mộc kèm mã đơn và thông tin giao dịch; không tự chuyển thêm khi chưa được đối soát.'],
  ['Giao hàng', 'Phí giao hàng được tính theo địa chỉ và hiển thị trước khi đặt đơn. Thời gian chuẩn bị và giao hàng phụ thuộc sản phẩm, yêu cầu khắc và địa điểm nhận. Vui lòng liên hệ trước khi đặt nếu cần nhận vào một ngày cụ thể; không mặc định thời gian giao cho sản phẩm có sẵn và sản phẩm chế tác riêng là giống nhau.'],
  ['Kiểm tra hàng và yêu cầu hỗ trợ', 'Khi nhận hàng, kiểm tra sản phẩm và bao bì. Nếu phát hiện hư hỏng, sai sản phẩm hoặc sai nội dung đã xác nhận, vui lòng liên hệ sớm, cung cấp mã đơn, mô tả và hình ảnh liên quan để được kiểm tra. Hình ảnh hoặc video mở kiện, nếu có, giúp việc xác minh thuận tiện hơn.'],
  ['Đổi trả, hủy đơn và hoàn tiền', 'Liên hệ Vân Mộc trước khi gửi trả hàng hoặc yêu cầu hủy. Phương án xử lý cần được xác nhận dựa trên tình trạng sản phẩm, nguyên nhân và tiến độ chế tác; sản phẩm khắc tên cần được xem xét riêng. Không tự gửi trả hoặc mặc định yêu cầu đã được chấp thuận. Quyền và lợi ích hợp pháp của người tiêu dùng được thực hiện theo quy định pháp luật áp dụng.'],
]
const privacy = [
  ['Thông tin được xử lý', 'Website xử lý thông tin tài khoản khi bạn đăng nhập, thông tin liên hệ và địa chỉ bạn cung cấp, giỏ hàng, nội dung khắc, đơn hàng và trạng thái thanh toán. Không cung cấp mật khẩu ngân hàng hoặc mã OTP cho Vân Mộc.'],
  ['Mục đích sử dụng', 'Thông tin được sử dụng để xác thực tài khoản, lưu giỏ hàng, xử lý đơn, giao hàng, đối soát thanh toán và hỗ trợ yêu cầu của bạn. Website không còn form đăng ký nhận bản tin.'],
  ['Cookie và lưu trữ trên thiết bị', 'Website sử dụng cookie phục vụ đăng nhập và bảo vệ yêu cầu, cùng lưu trữ trên trình duyệt để giữ giỏ hàng khách và trạng thái cần thiết. Bạn có thể xóa dữ liệu trong trình duyệt; thao tác này có thể làm mất giỏ hàng khách hoặc yêu cầu đăng nhập lại.'],
  ['Dịch vụ liên quan', 'Đăng nhập Google và đối soát chuyển khoản qua SePay có liên quan đến dịch vụ bên thứ ba. Thông tin cần thiết có thể được xử lý bởi các dịch vụ phục vụ vận hành, thanh toán và giao hàng. Khi mở Facebook hoặc dịch vụ khác, chính sách của dịch vụ đó được áp dụng.'],
  ['Bảo vệ và thời gian lưu trữ', 'Thông tin đơn hàng và giao dịch có thể cần được giữ để xử lý đơn, đối soát, giải quyết yêu cầu và đáp ứng nghĩa vụ pháp luật. Không có hệ thống truyền tải hay lưu trữ nào an toàn tuyệt đối. Hãy bảo vệ tài khoản Google và không chia sẻ thông tin đăng nhập.'],
  ['Yêu cầu liên quan đến dữ liệu', 'Bạn có thể cập nhật thông tin tài khoản và địa chỉ trong khu vực tài khoản. Để yêu cầu kiểm tra, sửa hoặc xóa dữ liệu, liên hệ kênh chính thức bên dưới. Yêu cầu có thể cần xác minh danh tính; việc xóa một số dữ liệu phụ thuộc nghĩa vụ lưu trữ và giao dịch đang xử lý.'],
]

export function PolicyPage({ privacyPolicy = false }: { privacyPolicy?: boolean }) {
  const title = privacyPolicy ? 'Chính sách bảo mật' : 'Chính sách mua hàng'
  return <div className="info-page bg-paper-warm pt-24 pb-12 md:pt-32">
    <article className="mx-auto max-w-3xl px-5 md:px-8">
      <h1>{title}</h1>
      <p className="mt-5 text-[#66584b]">Thông tin dành cho khách hàng khi sử dụng website và mua sắm cùng Vân Mộc.</p>
      <div className="mt-8 space-y-7">{(privacyPolicy ? privacy : purchase).map(([heading, text]) => <section key={heading}><h2>{heading}</h2><p className="mt-2 text-[#33251d]">{text}</p></section>)}</div>
      <section className="mt-9 border-t border-[#e6d8c7] pt-6"><h2>Liên hệ hỗ trợ</h2>
        <p className="mt-2 break-words"><a href={`tel:${BRAND.phone}`}>{BRAND.phone}</a> · <a href={`mailto:${BRAND.email}`}>{BRAND.email}</a></p>
        <Link className="mt-3 inline-block underline" to="/lien-he">Các kênh liên hệ chính thức</Link>
      </section>
    </article>
  </div>
}
