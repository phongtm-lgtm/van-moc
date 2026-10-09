export const money = (value: number) => `${new Intl.NumberFormat('vi-VN').format(value)} đ`
export const statuses = { PENDING_PAYMENT:'Chờ thanh toán', PENDING_CONFIRMATION:'Chờ xác nhận', CONFIRMED:'Đã xác nhận', PROCESSING:'Đang chuẩn bị / Khắc tên', READY_TO_SHIP:'Sẵn sàng giao', SHIPPING:'Đang giao hàng', COMPLETED:'Hoàn thành', CANCELLED:'Đã hủy' } as const
export const paymentStatuses = { PENDING:'Chưa thanh toán', PAID:'Đã thanh toán', FAILED:'Thanh toán thất bại', EXPIRED:'Hết hạn thanh toán', REFUNDED:'Đã hoàn tiền' } as const
export type PaymentStatus = keyof typeof paymentStatuses
export type OrderStats = { total:number; pendingConfirmation:number; cancelled:number }
export type Status = keyof typeof statuses
export const orderActions: Partial<Record<Status, { status: Status; label: string }>> = {
  PENDING_CONFIRMATION: { status: 'CONFIRMED', label: 'Xác nhận' },
  CONFIRMED: { status: 'PROCESSING', label: 'Chuẩn bị hàng' },
  PROCESSING: { status: 'READY_TO_SHIP', label: 'Sẵn sàng giao' },
  READY_TO_SHIP: { status: 'SHIPPING', label: 'Giao hàng' },
  SHIPPING: { status: 'COMPLETED', label: 'Hoàn thành' },
}
export type Summary = { id:string; orderCode:string; status:Status; paymentMethod:'COD'|'BANK_TRANSFER'; recipientName:string; grandTotal:number; createdAt:string; paymentStatus:PaymentStatus|null }
export type OrderPage = { content:Summary[]; totalPages:number; totalElements:number }
export type Detail = {
  order:Summary & {recipientPhone:string; addressLine:string; wardName:string; provinceName:string; note:string|null; productSubtotal:number; engravingTotal:number; shippingFee:number;
    items:{id:string; productCode:string; productName:string; imageUrl:string|null; quantity:number; unitPrice:number; engravingUnitFee:number; lineTotal:number; engravingText:string|null; engravingFont:string|null; engravingPosition:string|null}[];
    timeline:{previousStatus:Status|null; newStatus:Status; createdAt:string; note:string|null; actorType:string}[]};
  paymentStatus:PaymentStatus; expectedAmount:number; paidAmount:number|null; transferCode:string|null; expiresAt:string|null; paidAt:string|null;
}
