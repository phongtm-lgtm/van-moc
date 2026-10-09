import { API_BASE, ApiError } from './catalog'

export type Me = { id: string; email: string; fullName: string; avatarUrl: string | null; role: string }
export type Address = { id: string; label: string; recipientName: string; phone: string; wardCode: number; wardName: string; provinceCode: number; provinceName: string; addressLine: string; isDefault: boolean }
export async function accountApi<T>(path: string, method = 'GET', body?: unknown, signal?: AbortSignal): Promise<T> {
  const headers: Record<string, string> = { 'Accept-Language': 'vi' }
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (method !== 'GET') {
    const csrfResponse = await fetch(`${API_BASE}/api/auth/csrf`, { credentials: 'include' })
    if (!csrfResponse.ok) throw new Error('Không thể lấy CSRF token.')
    const csrf: { headerName: string; token: string } = await csrfResponse.json()
    headers[csrf.headerName] = csrf.token
  }
  const response = await fetch(`${API_BASE}${path}`, { credentials: 'include', method, headers, signal, body: body === undefined ? undefined : JSON.stringify(body) })
  if (!response.ok) {
    const problem: { code?: string; detail?: string } = await response.json().catch(() => ({}))
    const messages: Record<string, string> = {
      INVALID_ENGRAVING: 'Nội dung/font/vị trí khắc không hợp lệ.',
      INSUFFICIENT_STOCK: 'Tổng số lượng sản phẩm vượt tồn kho hiện tại.',
      PRODUCT_NOT_FOUND: 'Sản phẩm không còn khả dụng.',
      CART_ITEM_NOT_FOUND: 'Dòng giỏ không còn tồn tại. Vui lòng tải lại giỏ.',
      VALIDATION_ERROR: 'Vui lòng kiểm tra các trường bắt buộc và số lượng.',
      PAYMENT_NOT_CONFIGURED: 'Chuyển khoản chưa được cấu hình. Bạn có thể chọn COD.',
      IDEMPOTENCY_CONFLICT: 'Yêu cầu đặt hàng đã thay đổi. Vui lòng kiểm tra đơn cũ trước khi đặt lại.',
      ADDRESS_NOT_FOUND: 'Địa chỉ không còn tồn tại. Vui lòng chọn lại địa chỉ.',
      ORDER_CANNOT_CANCEL: 'Đơn đã xác nhận hoặc thanh toán, không thể tự hủy.',
      ORDER_NOT_FOUND: 'Không tìm thấy đơn hàng của bạn.',
      INVALID_SHIPPING_FEE: 'Phí giao hàng phải là số nguyên VND không âm.',
      PROVINCE_NOT_FOUND: 'Tỉnh/thành không còn khả dụng.',
    }
    throw new ApiError(response.status, response.status === 401 ? 'Vui lòng đăng nhập Google.' : messages[problem.code || ''] || 'Yêu cầu không thành công. Kiểm tra dữ liệu và thử lại.')
  }
  return response.status === 204 ? undefined as T : response.json() as Promise<T>
}
