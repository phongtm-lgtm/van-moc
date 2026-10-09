# SePay Webhooks — cấu hình Vân Mộc

Đây là webhook giao dịch ngân hàng, **không phải** Checkout Gateway/IPN Soulmap. Secret Soulmap không được sao chép.

## Backend `.env`

```dotenv
SEPAY_ENABLED=false
SEPAY_WEBHOOK_SECRET=
SEPAY_ACCOUNT_NUMBER=
SEPAY_BANK=
```

Điền secret HMAC trong máy của bạn, số tài khoản thụ hưởng, tên ngân hàng đúng trường `gateway` của payload (ví dụ Vietcombank). Đối chiếu mã ngân hàng với https://vietqr.app/banks.json. Sau khi điền đầy đủ, bật SEPAY_ENABLED=true và restart backend. Không đưa secret vào frontend, Git, chat hoặc log. Test/live dùng môi trường/database/secret riêng; tuyệt đối không gửi giao dịch mô phỏng vào endpoint production.

## Dashboard SePay

Mã đơn mới sau sửa 2026-10-02 có **10 ký tự tổng: VM + 8 hex uppercase**. Trong Cấu hình Công ty → Cấu hình chung, bật nhận diện, thêm mẫu tiền tố `VM`, hậu tố min=max `8`, loại **Số và chữ**, active. Restart backend để áp dụng code mới. Đơn cũ VM+32 không đổi; giao dịch cũ code rỗng không tự replay/paid, cần đối soát. Backend hiện vẫn matching theo code provider, chưa fallback content hoặc API reprocess. Unique order-code DB vẫn chặn trùng; chưa retry khi va chạm mã ngắn.

1. Liên kết tài khoản ngân hàng. Vào **Tích hợp → Webhooks → Thêm webhook**.
2. URL: `https://<backend-public>/api/payments/sepay/webhook`. Local có thể dùng ngrok trỏ cổng backend 30000.
3. Loại sự kiện: **Tiền vào**. Content-Type: **application/json**. Bật tự động gửi lại.
4. Chọn đúng tài khoản đã cấu hình. Cấu trúc mã thanh toán ở **Công ty → Cấu hình chung** phải khớp mã `transfer_code` tạo bởi checkout thật; không hardcode VMTEST từ integration tests. Chưa có checkout tạo mã thì chưa cấu hình tiền tố production tùy tiện.
5. Bảo mật: **HMAC-SHA256**, secret trùng SEPAY_WEBHOOK_SECRET. Không chọn không xác thực; không dùng X-Secret-Key của Gateway.
6. Thiết lập cảnh báo lỗi. Gửi thử: payload id=0 được ACK, không ghi payment thật. Gửi thử đạt chưa chứng minh một đơn đã thanh toán.

## Hợp đồng API

- POST `/api/payments/sepay/webhook`: raw body + X-SePay-Timestamp + X-SePay-Signature (`sha256=<hex>`), HMAC-SHA256 của `{timestamp}.{raw_body}`, cửa sổ ±300 giây. Chỉ endpoint này bỏ CSRF; các mutation khách hàng vẫn giữ CSRF.
- Thành công/duplicate/giao dịch đã lưu cần đối soát: HTTP 200 `{ "success": true }`. Chữ ký sai/cũ 401; payload sai 400; cấu hình thiếu 503; lỗi DB rollback để SePay retry. Không ACK trước khi transaction commit.
- Unique provider/id + PostgreSQL ON CONFLICT chống cùng giao dịch lặp; payment/order khóa để serialize quyết định paid. Giao dịch đúng chiều/tài khoản/ngân hàng/mã/đúng tiền, payment pending chưa hết hạn và order pending-payment mới được paid; order chuyển pending-confirmation, ghi timeline SYSTEM.
- Thiếu/dư, đã paid, cancelled/hết hạn hoặc payment đã có giao dịch cần đối soát: lưu REJECTED, không cộng dồn tiền, không khôi phục đơn. Sai account/direction lưu REJECTED không liên kết payment; mã không khớp lưu UNMATCHED. Giao dịch bất thường cần nhân viên kiểm tra; chưa có admin UI đối soát hoặc API reprocess.
- GET `/api/orders/{orderId}/payment`: session user active + ownership; trả trạng thái/số tiền/mã/hạn và QR URL khi pending/còn hạn. Không có API khách tự paid. QR uses `https://vietqr.app/img?acc=...&bank=...&amount=...&des=...`.

## Giới hạn hiện tại

### Kiểm tra kết nối local/tunnel 2026-10-02

- Live delivery nhận 200 nhưng payload giao dịch thật có `code` rỗng, content chứa mã VM + 32 hex. Backend hiện matching chỉ theo code nên không khớp đơn. Tài liệu provider hiện giới hạn hậu tố mẫu 1–30 ký tự: mã checkout VM+32 hiện không tương thích nhận diện dashboard. Cần sửa thiết kế transfer-code/nhận diện có validation và regression trước thử thêm; không chuyển thêm tiền, không replay/reprocess hoặc tự paid giao dịch đã nhận. Không coi HTTP 200 là payment PAID.

- Người dùng gửi thử từ dashboard SePay thành công; ngrok ghi nhận POST đúng `/api/payments/sepay/webhook` trả 200 lúc 14:10:09 +07:00. Trước đó URL thiếu `/sepay/webhook` nên POST `/api/payments` trả 403; đã sửa URL, không nới CSRF/security. Dashboard delivery/HMAC đã thông tuyến; chưa chứng minh thanh toán cho đơn thật hoặc ngân hàng live.

- Cấu hình `.env` đã enabled và đủ secret/account/bank (không ghi giá trị vào tài liệu). Signed probe `id=0, transferAmount=1000` trả HTTP 200 `{"success":true}` ở cả localhost:30000 và ngrok HTTPS đang chạy. Probe chỉ ACK theo code, không tạo event hoặc paid order.
- Đây là kiểm tra chữ ký do phía ứng dụng tự tạo và đường mạng tunnel, **không phải webhook thực do SePay gửi**. Cần Send Test từ dashboard và giao dịch ngân hàng khớp đơn thật để nghiệm thu live. Không chuyển tiền hoặc đánh dấu paid thay người dùng.

Đã có backend webhook, API đọc QR/status và checkout tạo order/payment thật. Backend hủy/expiry hoàn tồn một lần, cùng thứ tự lock order→payment với webhook. Frontend checkout, lịch sử/chi tiết đơn và QR/polling 5s đã nối API, chỉ PAID backend xác nhận thanh toán. **Chưa nghiệm thu browser E2E hoặc SePay live**. Không tạo payment demo qua production API. Test race webhook/cancel/expiry còn cần bổ sung; không đánh dấu mốc E/F hoặc Phase 1 hoàn thành.

## Tài liệu tham khảo

- https://developer.sepay.vn/vi/sepay-webhooks/tao-webhook
- https://developer.sepay.vn/vi/sepay-webhooks/tich-hop-webhook
- https://developer.sepay.vn/vi/sepay-webhooks/xac-thuc
- https://developer.sepay.vn/vi/sepay-webhooks/tao-qr-va-form-thanh-toan

Đã đọc các mục trên. Không nhận hướng dẫn mẫu amount<=received hoặc amount từ client làm chính sách Vân Mộc: chỉ đúng số tiền backend, không tin client. Chưa xác minh dashboard/bank live, sandbox hoặc đối soát provider API.
