import { accountApi } from './account'

export type OrderStatus = 'PENDING_PAYMENT' | 'PENDING_CONFIRMATION' | 'CONFIRMED' | 'PROCESSING' | 'READY_TO_SHIP' | 'SHIPPING' | 'COMPLETED' | 'CANCELLED'
export const ORDER_LABELS: Record<OrderStatus, string> = {
  PENDING_PAYMENT: 'Chờ thanh toán', PENDING_CONFIRMATION: 'Chờ xác nhận', CONFIRMED: 'Đã xác nhận',
  PROCESSING: 'Đang chế tác', READY_TO_SHIP: 'Sẵn sàng giao', SHIPPING: 'Đang giao', COMPLETED: 'Đã hoàn tất', CANCELLED: 'Đã hủy',
}
export type CheckoutRequest = { cartItemIds: string[]; addressId: string; paymentMethod: 'COD' | 'BANK_TRANSFER'; note: string; idempotencyKey: string }
export type CheckoutResult = { orderId: string | null; orderCode: string; status: OrderStatus; productSubtotal: number; engravingTotal: number; shippingFee: number; grandTotal: number }
export type Payment = { status: 'PENDING' | 'PAID' | 'FAILED' | 'EXPIRED' | 'REFUNDED'; amount: number; transferCode: string | null; expiresAt: string | null; bank: string | null; accountNumber: string | null; qrUrl: string | null }
export type OrderDetail = {
  id: string; orderCode: string; status: OrderStatus; paymentMethod: 'COD' | 'BANK_TRANSFER';
  productSubtotal: number; engravingTotal: number; shippingFee: number; grandTotal: number;
  recipientName: string; recipientPhone: string; addressLine: string; wardName: string; provinceName: string;
  note: string | null; createdAt: string; paymentExpiresAt: string | null;
  items: { id: string; productCode: string; productName: string; imageUrl: string | null; quantity: number; unitPrice: number; engravingUnitFee: number; lineTotal: number; engravingText: string | null; engravingFont: string | null; engravingPosition: string | null }[];
  timeline: { previousStatus: OrderStatus | null; newStatus: OrderStatus; actorType: string; createdAt: string; note: string | null }[];
}
export type OrderPage = { content: CheckoutResult[]; totalPages: number; totalElements: number }
export const getOrder = (id: string) => accountApi<OrderDetail>(`/api/orders/${id}`)
export const getPayment = (id: string) => accountApi<Payment>(`/api/orders/${id}/payment`, 'GET', undefined, AbortSignal.timeout(15000))
export const money = (value: number) => `${new Intl.NumberFormat('vi-VN').format(value)} đ`
