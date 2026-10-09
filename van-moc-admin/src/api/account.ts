export const API_BASE = import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD ? 'https://api.vanmocvn.com' : '')
if (!API_BASE) throw new Error('Thiếu VITE_API_BASE_URL trong .env admin')
export type Me = { id: string; email: string; fullName: string; role: string }
export class ApiError extends Error {
  constructor(public status: number, message: string) { super(message) }
}
export async function accountApi<T>(path: string, method = 'GET', body?: unknown): Promise<T> {
  const headers: Record<string, string> = { 'Accept-Language': 'vi' }
  const multipart = body instanceof FormData
  if (body !== undefined && !multipart) headers['Content-Type'] = 'application/json'
  if (method !== 'GET') {
    const response = await fetch(`${API_BASE}/api/auth/csrf`, { credentials: 'include' })
    if (!response.ok) throw new Error('Không thể lấy CSRF token.')
    const csrf: { headerName: string; token: string } = await response.json()
    headers[csrf.headerName] = csrf.token
  }
  const options: RequestInit = { credentials: 'include', method, headers }
  if (body !== undefined && method !== 'GET') options.body = multipart ? body : JSON.stringify(body)
  const response = await fetch(`${API_BASE}${path}`, options)
  if (!response.ok) {
    const problem=await response.json().catch(()=>({})) as {code?:string}
    const messages:Record<string,string>={PRODUCT_IMAGE_UPLOAD_FAILED:'Không thể tải ảnh lên AWS. Vui lòng thử lại.',PRODUCT_CHANGED:'Sản phẩm hoặc tồn kho đã thay đổi. Tải lại trang trước khi sửa.',PRODUCT_CODE_OR_SLUG_EXISTS:'Mã hoặc slug sản phẩm đã tồn tại.',INVALID_ENGRAVING:'Cấu hình khắc không hợp lệ. Khi bật khắc cần giới hạn, font và vị trí.',INVALID_STOCK_ADJUSTMENT:'Điều chỉnh tồn không hợp lệ hoặc làm tồn kho âm.',CATEGORY_SLUG_EXISTS:'Đường dẫn danh mục đã tồn tại. Vui lòng chọn tên hoặc slug khác.',CATEGORY_HAS_PRODUCTS:'Danh mục đang có sản phẩm. Hãy chuyển sản phẩm sang danh mục khác trước khi xóa.',CATEGORY_NOT_FOUND:'Danh mục không còn tồn tại.'}
    Object.assign(messages, {
      INVALID_ORDER_TRANSITION: 'Trạng thái đơn đã thay đổi hoặc bước chuyển không hợp lệ. Tải lại danh sách trước khi tiếp tục.',
      PAYMENT_REQUIRED: 'Đơn chuyển khoản phải được xác nhận đã thanh toán trước khi xử lý.',
      COD_COLLECTION_REQUIRED: 'Cần xác nhận đã thu đủ tiền COD và kiểm tra trạng thái thanh toán trước khi hoàn thành đơn.',
      INVALID_COD_COLLECTION: 'Chỉ ghi nhận thu tiền COD khi hoàn thành đơn hàng.',
      PRODUCT_DELETE_HAS_HISTORY: 'Không thể xóa sản phẩm có tồn kho, đơn hàng hoặc lịch sử điều chỉnh tồn. Hãy ẩn sản phẩm thay thế.',
      PRODUCT_DELETE_IN_CART: 'Sản phẩm đang có trong giỏ hàng của khách. Hãy ẩn sản phẩm thay vì xóa.',
      INVALID_FONT: 'Chọn đúng một style trên Google Fonts rồi sao chép link mới.',
      FONT_UPLOAD_UNAVAILABLE: 'Chưa cấu hình nơi lưu font. Kiểm tra AWS và CloudFront trên backend.',
      FONT_UPLOAD_FAILED: 'Không tải được font lên nơi lưu trữ. Vui lòng thử lại.',
      FONT_NOT_FOUND: 'Font không còn tồn tại. Tải lại danh sách.',
    })
    throw new ApiError(response.status,response.status===401?'Vui lòng đăng nhập.':response.status===403?'Tài khoản không có quyền quản trị hoặc phiên không hợp lệ.':messages[problem.code??'']??'Không thể lưu/tải dữ liệu. Kiểm tra thông tin và thử lại.')
  }
  return response.status === 204 ? undefined as T : response.json() as Promise<T>
}
