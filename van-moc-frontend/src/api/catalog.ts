export const API_BASE = import.meta.env.VITE_API_BASE_URL
if (!API_BASE) throw new Error('Thiếu VITE_API_BASE_URL trong .env frontend')

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) { super(message); this.status = status }
}
export async function api<T>(path: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, { signal, headers: { 'Accept-Language': 'vi' } })
  if (!response.ok) throw new ApiError(response.status, response.status === 404 ? 'Không tìm thấy sản phẩm.' : 'Không thể tải dữ liệu. Vui lòng thử lại.')
  return response.json() as Promise<T>
}
export const isUuid = (value: unknown): value is string => typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)
export const imageUrl = (url: string | null) => url || ''
export const money = (amount: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
export type Category = { id: string; name: string; slug: string }
export type Product = {
  id: string; categoryId: string; code: string; slug: string; name: string
  shortDescription: string | null; material: string; price: number; stock: number
  engravingEnabled: boolean; imageUrl: string | null
}
export type ProductPageResponse = { content: Product[]; page: number; size: number; totalElements: number; totalPages: number }
export type ProductDetail = Omit<Product, 'imageUrl' | 'engravingEnabled'> & {
  description: string | null
  images: { id: string; url: string; altText: string | null; primary: boolean; displayOrder: number; mediaType?: 'IMAGE' | 'VIDEO' }[]
  engraving: { enabled: boolean; unitFee: number; maxChars: number | null; fonts: string[]; positions: { code: string; maxChars: number | null }[] }
}
