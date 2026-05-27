# SePay Bank Hub là gì?

## SePay Bank Hub là nền tảng kết nối ngân hàng tập trung qua Hosted Link và REST API, đồng bộ giao dịch realtime và đối soát tự động cho đối tác.

---

**API Overview:**

API tích hợp Bank Hub - Nền tảng kết nối tài khoản ngân hàng và nhận thông báo giao dịch realtime.

## Base URL
- **Sandbox**: `https://bankhub-api-sandbox.sepay.vn`
- **Production**: `https://bankhub-api.sepay.vn`

## Authentication
- Sử dụng **Basic Authentication** với `client_id:client_secret` để lấy access token
- Sử dụng **Bearer Token** cho các API khác


---

<ButtonLink href="/vi/bankhub-demo" variant="primary">Trải nghiệm dùng thử Bank Hub</ButtonLink>

## Giới thiệu

**SePay Bank Hub** là nền tảng kết nối ngân hàng tập trung, cho phép đối tác của SePay:

* Liên kết và quản lý tài khoản ngân hàng
* Theo dõi giao dịch theo thời gian thực
* Nhận thông báo sự kiện qua webhook
* Quản lý dữ liệu ngân hàng một cách an toàn và chuẩn hóa

Bank Hub cung cấp **Hosted Link (WebView)** kết hợp với **RESTful API**, giúp đối tác **không cần xây dựng giao diện ngân hàng phức tạp** nhưng vẫn đảm bảo trải nghiệm người dùng và tính bảo mật cao.

***

## Đối tượng sử dụng SePay Bank Hub

SePay Bank Hub phù hợp cho các sản phẩm cần kết nối tài khoản ngân hàng để xác thực, đồng bộ giao dịch và quản lý dòng tiền:

<Features
  items={[
  { icon: "store", title: "Website bán hàng & Marketplace", description: "Xác thực thanh toán, theo dõi giao dịch theo thời gian thực và tự động đối soát doanh thu." },
  { icon: "sliders", title: "Hệ thống quản lý dòng tiền doanh nghiệp", description: "Tự động ghi nhận biến động số dư, đối soát thu – chi và tổng hợp báo cáo dòng tiền tập trung." },
  { icon: "link", title: "Nền tảng tài chính & kế toán", description: "Kết nối nhiều tài khoản ngân hàng, đồng bộ dữ liệu và kiểm soát dòng tiền trên một nền tảng duy nhất." },
  { icon: "code", title: "Dịch vụ cần tích hợp API ngân hàng tự động", description: "Tích hợp nhanh qua WebView, cung cấp webhook sự kiện và API để tự động hóa quy trình." }
]}
/>

***

## Luồng hoạt động

<Mermaid title="Diagram">
sequenceDiagram
  actor M as Merchant
  participant P as Platform
  participant SBH as SePay Bank Hub
  participant Bank as Ngân hàng thụ hưởng
  actor NMH as Người mua hàng

  Note over M,Bank: Merchant kết nối tài khoản ngân hàng
  M->>P: Đăng ký/Yêu cầu kết nối tài khoản ngân hàng
  P->>SBH: Gọi API tạo link token cho Merchant
  SBH-->>P: Trả về Hosted Link
  P->>M: Chuyển hướng/hiển thị Hosted Link
  M->>SBH: Truy cập Hosted Link và kết nối ngân hàng
  M->>Bank: Xác thực và ủy quyền kết nối
  Bank-->>SBH: Xác nhận kết nối thành công
  SBH->>SBH: Ghi nhận kết nối Merchant thành công
  SBH->>P: Đẩy webhook event (BANK_ACCOUNT_LINKED)
  P->>M: Thông báo liên kết tài khoản ngân hàng thành công

  Note over M,NMH: Người mua hàng đặt hàng và thanh toán
  NMH->>P: Đặt hàng từ Merchant trên Platform
  P->>M: Thông báo đơn hàng mới
  NMH->>Bank: Chuyển khoản thanh toán đơn hàng

  Note over P,Bank: Xác thực thanh toán tự động
  Bank->>Bank: Phát sinh giao dịch vào TK Merchant
  Bank->>SBH: Đẩy thông báo biến động số dư
  SBH->>P: Đẩy IPN (thông báo biến động số dư)
  P->>P: Đối soát và xác thực thanh toán
  P->>M: Thông báo đơn hàng đã thanh toán
  M->>NMH: Xử lý và cung cấp dịch vụ/sản phẩm
</Mermaid>

***

## Các ngân hàng hỗ trợ

Bank Hub hiện tại hỗ trợ kết nối với các ngân hàng sau:

<BankTable
  rows={[
  { bank: "VPBank", personal: true, business: false, sandbox: false, layout: "business_household", personalFeatures: [{ key: "share_main_account", supported: true }, { key: "sync_incoming", supported: true }], businessFeatures: [], householdFeatures: [{ key: "share_main_account", supported: true }, { key: "sync_incoming", supported: true }] },
  { bank: "TPBank", personal: true, business: true, sandbox: false, layout: "business_household", personalFeatures: [{ key: "share_main_account", supported: true }, { key: "sync_incoming_outgoing", supported: true }, { key: "balance_sync", supported: true }], businessFeatures: [{ key: "share_main_account", supported: true }, { key: "sync_incoming_outgoing", supported: true }, { key: "balance_sync", supported: true }], householdFeatures: [{ key: "share_main_account", supported: true }, { key: "sync_incoming_outgoing", supported: true }, { key: "balance_sync", supported: true }] },
  { bank: "Vietinbank", personal: true, business: false, household: true, sandbox: true, layout: "business_household", personalFeatures: [{ key: "share_main_account", supported: true }, { key: "sync_incoming_outgoing", supported: true }, { key: "balance_sync", supported: true }], businessFeatures: [{ key: "share_main_account", supported: true }, { key: "sync_incoming_outgoing", supported: true }], householdFeatures: [{ key: "share_main_account", supported: true }, { key: "sync_incoming_outgoing", supported: true }, { key: "balance_sync", supported: true }] },
  { bank: "ACB", personal: true, business: true, sandbox: true, layout: "business_household", personalFeatures: [{ key: "share_main_account", supported: true }, { key: "sync_incoming_outgoing", supported: true }], businessFeatures: [{ key: "share_main_account", supported: true }, { key: "sync_incoming_outgoing", supported: true }], householdFeatures: [{ key: "share_main_account", supported: true }, { key: "sync_incoming_outgoing", supported: true }] },
  { bank: "BIDV", personal: true, business: false, sandbox: true, personalFeatures: [{ key: "va_only", supported: true }, { key: "sync_incoming", supported: true }], businessFeatures: [{ key: "va_only", supported: true }, { key: "sync_incoming", supported: true }], householdFeatures: [{ key: "va_only", supported: true }, { key: "sync_incoming", supported: true }] },
  { bank: "MBBank", personal: true, business: true, sandbox: true, personalFeatures: [{ key: "share_main_account", supported: true }, { key: "sync_incoming_outgoing", supported: true }], businessFeatures: [{ key: "share_main_account", supported: true }, { key: "sync_incoming_outgoing", supported: true }], householdFeatures: [{ key: "share_main_account", supported: true }, { key: "sync_incoming_outgoing", supported: true }] },
  { bank: "OCB", personal: true, business: false, sandbox: true, layout: "business_household", personalFeatures: [{ key: "va_only", supported: true }, { key: "sync_incoming", supported: true }], businessFeatures: [{ key: "va_only", supported: true }, { key: "sync_incoming", supported: true }], householdFeatures: [{ key: "va_only", supported: true }, { key: "sync_incoming", supported: true }] },
  { bank: "KienLongBank", personal: true, business: true, sandbox: true, personalFeatures: [{ key: "va_only", supported: true }, { key: "sync_incoming", supported: true }], businessFeatures: [{ key: "va_only", supported: true }, { key: "sync_incoming", supported: true }], householdFeatures: [{ key: "va_only", supported: true }, { key: "sync_incoming", supported: true }] },
  { bank: "MSB", personal: true, business: true, sandbox: true, personalFeatures: [{ key: "va_only", supported: true }, { key: "sync_incoming", supported: true }], businessFeatures: [{ key: "va_only", supported: true }, { key: "sync_incoming", supported: true }], householdFeatures: [{ key: "va_only", supported: true }, { key: "sync_incoming", supported: true }] }
]}
/>

> ***Sắp ra mắt — Quản lý Virtual Account (VA):*** *tạo mới, liệt kê và vô hiệu hoá VA qua API hoặc Dashboard. Tính năng đang phát triển, sẽ sớm có mặt trên Bank Hub.*

<Callout type="warning" title="Lưu ý đặc thù theo ngân hàng">
VietinBank (cá nhân và hộ kinh doanh) — Tiền tố 
`SEVQR`
 bắt buộc trong nội dung chuyển khoản
Với tài khoản VietinBank đã liên kết qua Bank Hub, hệ thống tự động thêm tiền tố 
`SEVQR `
 vào đầu nội dung chuyển khoản khi tạo QR thanh toán. Người chuyển cần giữ nguyên tiền tố này — nếu bị xóa hoặc thay đổi, SePay không nhận diện được giao dịch và sẽ không gửi webhook.
OCB, MSB, KienLongBank, TPBank — "Hủy liên kết" chỉ vô hiệu hóa trong Bank Hub
Với 4 ngân hàng này, thao tác "Hủy liên kết" chỉ vô hiệu hóa tài khoản trong hệ thống Bank Hub; liên kết phía ngân hàng vẫn được giữ nguyên. Khi cần khôi phục, đối tác có thể liên hệ SePay để kích hoạt lại tài khoản thủ công mà không phải xác thực OTP lần nữa.
</Callout>

<Callout type="info" title="Lưu ý">
Môi trường Live
: Sử dụng cho production với tài khoản ngân hàng thật
Môi trường Sandbox
: Sử dụng cho testing và development với tài khoản demo 
Xem các ngân hàng dùng trên Sandbox
Danh sách ngân hàng được cập nhật thường xuyên, vui lòng liên hệ SePay để biết thêm chi tiết
</Callout>

***

## Tại sao chọn SePay Bank Hub?

<Features
  items={[
  { icon: "zap", title: "Tích hợp nhanh chóng", description: "Kết nối và liên kết tài khoản ngân hàng chỉ trong vài phút thông qua hosted link, không cần tự xây dựng giao diện." },
  { icon: "shield", title: "Bảo mật theo chuẩn ngân hàng", description: "Không yêu cầu cung cấp mật khẩu ngân hàng. Mọi thao tác được thực hiện qua web view với mã hóa end-to-end." },
  { icon: "package", title: "API & Webhook đầy đủ", description: "Cung cấp bộ API RESTful và webhook để quản lý tài khoản, giao dịch và đồng bộ dữ liệu theo thời gian thực." },
  { icon: "refresh", title: "Giảm vận hành thủ công", description: "Tự động nhận giao dịch, đồng bộ số dư và đối soát, giúp giảm sai sót và tiết kiệm thời gian vận hành." },
  { icon: "trending-up", title: "Tiết kiệm chi phí phát triển", description: "Không cần đội ngũ phát triển riêng cho từng ngân hàng. Một lần tích hợp, kết nối được nhiều ngân hàng." },
  { icon: "clock", title: "Theo dõi giao dịch real-time", description: "Nhận thông báo biến động số dư tức thì qua IPN webhook, cập nhật trạng thái giao dịch ngay lập tức vào hệ thống." },
  { icon: "database", title: "Dữ liệu chuẩn hóa", description: "Tất cả dữ liệu từ các ngân hàng khác nhau được chuẩn hóa thành một định dạng thống nhất, dễ dàng xử lý và quản lý." },
  { icon: "users", title: "Trải nghiệm người dùng mượt mà", description: "Giao diện liên kết ngân hàng được thiết kế tối ưu cho cả desktop và xử lý lỗi thân thiện." }
]}
/>

***

## Phương thức tích hợp Hosted Link

<Callout type="info" title="Hosted Link là gì?">
Hosted Link
 là giao diện WebView được SePay xây dựng sẵn, cho phép người dùng cuối liên kết hoặc hủy liên kết tài khoản ngân hàng một cách an toàn. Đối tác không cần tự xây dựng UI ngân hàng phức tạp, chỉ cần nhúng 
`hosted_link_url`
 (được tạo từ 
API Link Token
) vào ứng dụng thông qua iframe hoặc SDK JavaScript. Hosted Link đảm bảo trải nghiệm người dùng chuẩn hóa, bảo mật cao và tuân thủ quy trình xác thực của từng ngân hàng.
</Callout>

SePay Bank Hub hỗ trợ **2 phương thức tích hợp giao diện Hosted Link**:

<Features
  items={[
  { icon: "code", title: "Iframe / WebView", description: "Nhúng trực tiếp hosted link vào website hoặc mobile app thông qua iframe hoặc WebView." },
  { icon: "package", title: "SDK JavaScript", description: "Tích hợp thông qua SDK để kiểm soát tốt hơn vòng đời phiên, sự kiện và callback." }
]}
/>

***

## Bước tiếp theo

Để bắt đầu tích hợp SePay Bank Hub, bạn có thể thực hiện theo thứ tự sau:

1. **[Bắt đầu nhanh](/vi/bankhub/bat-dau-nhanh)** - Hướng dẫn từng bước tích hợp Bank Hub vào ứng dụng của bạn
2. **[Thông tin Sandbox](/vi/bankhub/thong-tin-sandbox)** - Lấy thông tin tài khoản test để thử nghiệm
3. **[API Reference](/vi/bankhub/api/tong-quan-api)** - Xem chi tiết các API có sẵn

<Callout type="info" title="Gợi ý">
Nếu bạn mới bắt đầu, hãy sử dụng môi trường 
Sandbox
 để thử nghiệm trước khi chuyển sang Production.
</Callout>
