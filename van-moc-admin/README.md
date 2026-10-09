# Vân Mộc Admin

## Font khắc

Vào **Sản phẩm → Thao tác khác → Quản lý font khắc** (`/products/engraving-fonts`) để thêm font từ Google Fonts, xem trước và bật/ẩn font. Sau khi thêm, mở phần **Cho phép khắc tên → Kiểu chữ** của từng sản phẩm để chọn font áp dụng. Font đã ẩn không còn được khách chọn nhưng mã và file được giữ nguyên để không mất dữ liệu đơn hàng; bật lại khi cần. Ba font cũ và các font đã tải lên từ trước tiếp tục hiển thị; không còn tính năng tải file font mới. Khởi động lại backend để chạy migration `V6__engraving_font_catalog.sql` trước khi sử dụng.

Chọn đúng một style trên Google Fonts rồi dán URL stylesheet `https://fonts.googleapis.com/css2?family=...` hoặc cả đoạn embed, nhập tên hiển thị. Hệ thống tự lấy độ đậm và kiểu thường/nghiêng từ link, chỉ lưu URL đã chuẩn hóa; link có nhiều style bị từ chối. Cần truy cập được Google Fonts và `fonts.gstatic.com` từ trình duyệt; nếu tải lỗi sẽ báo thay vì hiển thị font dự phòng. Khởi động lại backend để chạy migrations `V7__google_engraving_fonts.sql` và `V8__google_font_italic.sql`.

Mỗi style cần thêm là một mục font khắc riêng; hãy chọn style tương ứng bên Google Fonts và sao chép link mới.

## Danh mục sản phẩm

Vào **Sản phẩm → Thao tác khác → Quản lý danh mục** (`/products/categories`) để thêm danh mục hoặc xóa danh mục chưa có sản phẩm. Slug tự tạo từ tên tiếng Việt, có thể sửa. Danh mục có sản phẩm (kể cả sản phẩm đã ẩn) không thể xóa; chuyển sản phẩm sang danh mục khác trước. Xóa thực chất ẩn danh mục khỏi danh sách/cửa hàng, không xóa bản ghi để tránh mất liên kết; slug đã dùng không thể dùng lại. API admin: `GET/POST /api/admin/categories`, `DELETE /api/admin/categories/{id}` (CSRF và quyền admin). Cần khởi động lại backend sau khi cập nhật mã nguồn.

## Danh sách sản phẩm

`/products` dùng toàn bộ chiều rộng workspace, sidebar chung 240px và header chung. Tổng sản phẩm/đang bán/hết hàng lấy `totalElements` từ ba truy vấn API hiện có, độc lập với bộ lọc bảng. Thanh công cụ gom tìm tên/SKU, danh mục, trạng thái và hết hàng. Bảng giữ phân trang 20 sản phẩm theo backend, có ảnh đại diện, SKU, giá, tồn, trạng thái, skeleton, trạng thái trống và thử lại khi lỗi.

Menu ba chấm có chỉnh sửa, cập nhật tồn bằng dialog (API tồn kho và lý do hiện có), sao chép qua `/products/new?copy=...`, và ẩn bằng PATCH toàn bộ details với `active=false`, giữ version để backend phát hiện thay đổi đồng thời. Lỗi mạng không rõ kết quả điều chỉnh tồn yêu cầu kiểm tra lịch sử trước khi gửi lại. Thêm hàng loạt nằm trong **Thao tác khác** và dẫn tới bảng nhập hiện có; chưa có nhập file Excel/CSV.

Cài đặt cạnh bộ lọc cho phép đổi ngưỡng sắp hết hàng (mặc định tồn lớn hơn 0 và nhỏ hơn 10); lưu tùy chọn trên trình duyệt, không đổi tồn kho hoặc dữ liệu backend. Mobile/tablet có sidebar dạng ngăn kéo và bảng cuộn ngang. Đã kiểm tra build/lint và trình duyệt với API giả lập cho số liệu, bộ lọc, phân trang, lỗi/thử lại, menu bàn phím, cập nhật tồn, mất phản hồi, ẩn sản phẩm/xung đột version và responsive. Không tạo hoặc sửa sản phẩm thật trong kiểm tra này.

## Thêm nhiều sản phẩm

Vào **Sản phẩm → Thêm nhiều sản phẩm** (`/products/bulk`). Nhập tên, mã, danh mục, chất liệu và giá trên từng dòng rồi chọn **Lưu tất cả**. Có thêm một/năm dòng, xóa dòng và nhân bản danh mục/chất liệu/giá/trạng thái bán; tên, mã và slug của dòng nhân bản được để trống. Slug tự tạo từ tên tiếng Việt và có thể sửa riêng.

Kiểm tra trường bắt buộc, giá nguyên không âm, mã/slug trùng trong bảng trước khi gửi. Mỗi dòng được tạo qua API hiện có; dòng thành công được khóa và không gửi lại khi thử lại dòng lỗi. Khi mất kết nối hoặc lỗi máy chủ khiến kết quả chưa rõ, dùng **Kiểm tra kết quả** để tìm lại theo mã/slug trước khi lưu lại. Thêm ảnh, tồn kho, mô tả và cấu hình khắc qua **Ảnh / tồn / chi tiết** sau khi tạo (tồn ban đầu là 0).

Đã kiểm tra build/lint và tương tác trình duyệt với API giả lập: validation, slug tiếng Việt, kết quả thành công một phần, lưu lại không gửi lại dòng thành công, nhân bản/thêm/xóa, đối soát kết quả mất kết nối và layout mobile. Kiểm tra này không tạo sản phẩm trong database đang dùng.

## Sản phẩm / tồn kho

Trang thêm/sửa dùng bố cục một trang với thông tin cơ bản, ảnh luôn mở; khắc tên và thông tin nâng cao thu gọn. SKU tự sinh cho sản phẩm mới; slug tự tạo từ tên và cho phép sửa; chất liệu mặc định là Sừng tự nhiên, có gợi ý và cho nhập tự do. Danh mục có bộ lọc tìm kiếm. Khi bật khắc lần đầu, mặc định 30 ký tự, miễn phí, kiểu Cổ điển và Mặt trước; các tùy chọn có thể chỉnh lại.

**Lưu nháp** lưu sản phẩm hợp lệ với `active=false` (chưa bán); **Lưu sản phẩm** và **Lưu & thêm sản phẩm tiếp theo** lưu với `active=true`. Ảnh chọn nhiều/kéo thả được xem trước và tải sau khi lưu sản phẩm. Nếu tải ảnh lỗi, form giữ ID đã tạo cùng các ảnh còn lại để thử lại. **Sao chép sản phẩm này** trong trang sửa sao chép thông tin/cấu hình khắc, tạo SKU mới, không sao chép tồn kho hoặc ảnh. Tồn ban đầu vẫn là 0, nhập kho qua phần tồn kho sau khi lưu.

Đã kiểm tra build/lint và trình duyệt với API giả lập: trường bắt buộc, SKU/slug và sửa slug, một mô tả, thu gọn/mở cấu hình khắc, chọn ảnh và thử lại lỗi tải ảnh, lưu nháp, sao chép, lưu & thêm tiếp, giao diện mobile không tràn ngang. Chưa kiểm tra upload AWS thật trong lần thay giao diện này.

Form thêm/sửa chỉ có một ô **Mô tả (không bắt buộc)**, tối đa 20.000 ký tự. Khi lưu, `shortDescription` của API được tự lấy từ mô tả (gộp khoảng trắng, tối đa 2.000 ký tự). Khi mở sản phẩm cũ có mô tả chính trống, form lấy nội dung mô tả ngắn làm mô tả để chỉnh sửa.

`/products`: danh sách phân trang, name/code search, category/active/hết hàng filters. `/products/new` và `/products/:id`: thông tin, giá, nội dung, trạng thái bán, cấu hình khắc và điều chỉnh tồn có lý do/lịch sử. Mới tạo stock=0, tăng tồn qua stock adjustment. Nếu báo PRODUCT_CHANGED cần tải lại trước khi sửa, không ghi đè thay đổi khác. Nếu stock request timeout, kiểm tra lịch sử trước khi gửi lại vì chưa có idempotency. Upload/quản lý ảnh chưa triển khai; giữ ảnh cũ. Backend 29 unit + 27 PostgreSQL IT đạt, admin build/lint đạt; chưa browser E2E. Checklist chi tiết: `../docs/phase-1.md`.

## Giao diện TailAdmin

### Nguồn màn đã thích nghi

- `components/tables/BasicTable.tsx` ← template `components/tables/BasicTables/BasicTableOne.tsx`: giữ classes/container/header/cells, thay data props cho orders/products; dùng Badge gốc.
- `components/common/ComponentCard.tsx`, `PageBreadCrumb.tsx`, `components/ui/badge/Badge.tsx`, `components/form/input/TextArea.tsx`, `components/form/Select.tsx`: copy từ template. Cards trong list/editor/ship theo wrapper gốc; TextArea đã dùng trong product editor, Select chưa chuyển toàn bộ usage.
- `components/common/InformationCard.tsx` ← read-only `UserProfile/UserAddressCard.tsx`; order detail container từ `pages/UserProfiles.tsx`. Repo Free không có order detail/invoice chuyên biệt.
- Sidebar/header vẫn phiên bản thích nghi, không nguyên bản. Filter/stock/history còn phần adapter cũ. Không gọi toàn bộ app là bản template nguyên trạng. Admin build/lint đạt; visual/E2E chưa xác minh.

CSS/theme gốc từ https://github.com/TailAdmin/free-react-tailwind-admin-dashboard được tích hợp tại `src/index.css`: font Outfit, Tailwind v4 tokens, menu utilities và dark mode. Layout admin được thích nghi với menu Vân Mộc, responsive sidebar/header và form phí ship thật; không import dashboard số liệu demo hoặc thư viện chart/map. MIT notice giữ trong `LICENSE.tailadmin.md`. CSS adapter dùng theme tokens để style form đang nối API. Không đổi CSS storefront.

`npm run build` và `npm run lint` đạt sau tích hợp. Chưa kiểm tra screenshot/browser E2E. Font Outfit tải từ Google Fonts, có fallback sans-serif nếu offline. Restart Vite sau thay plugin Tailwind.

Frontend React/Vite riêng, chạy `http://localhost:5174` với strictPort (không tự nhảy cổng).

```powershell
npm install
Copy-Item .env.example .env
npm run dev
```

Backend chạy cổng 30000. Cấu hình backend `ADMIN_ORIGIN=http://localhost:5174`, storefront `VITE_ADMIN_URL=http://localhost:5174`. Dùng cùng hostname localhost cho ba ứng dụng để session cookie hoạt động đúng.

Đăng nhập username/password trực tiếp tại admin. Backend tạo `admin` với password ban đầu `vanmoc@2026` khi chưa có username này; BCrypt, không reset mật khẩu/quyền/active khi restart. Có thể đặt `ADMIN_INITIAL_PASSWORD` ở môi trường trước lần khởi tạo đầu tiên; thay biến sau đó không đổi tài khoản đã có. Mật khẩu mặc định chỉ dùng local, phải thay trước khi public; chưa có UI đổi mật khẩu hoặc rate-limit login. Google khách hàng vẫn chuyển `/shop`. Admin dùng server session + CSRF, không lưu JWT hoặc password phía browser. `/api/admin/me` kiểm tra role/active từ DB. Login nhận form-urlencoded POST `/api/admin/login` và CSRF, trả 204/401.

Đã dùng AppLayout/SidebarContext/ThemeContext/Backdrop và Label/Input/Button/GridShape thực tế từ TailAdmin, auth hai cột dựa trên SignInForm/AuthPageLayout; sidebar/header rút gọn cho chức năng thật (không giữ notifications/profile demo). Không phải bản sao đầy đủ dashboard demo. MIT license được giữ nguyên.

Hiện có quản lý phí giao hàng (`/shipping`) và đơn hàng (`/orders`, `/orders/:id`): danh sách phân trang/tìm mã/lọc trạng thái/phương thức, snapshot/timeline/payment detail, chuyển bước tuần tự, hoàn tất COD phải xác nhận thu đủ. Không tự paid bank hoặc refund. Quản lý sản phẩm chưa có UI. Production cần cấu hình origin cụ thể, HTTPS/cookie phù hợp; không dùng CORS wildcard.

Verification admin orders: build/lint đạt; backend 29 unit + 26 PostgreSQL integration tests đạt (có bổ sung assertions admin quyền/filter/detail). Chưa browser E2E/SePay live. Tiến độ và checklist chính: `../docs/phase-1.md`.
