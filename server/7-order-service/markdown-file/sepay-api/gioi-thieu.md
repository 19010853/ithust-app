# Giới thiệu SePay API v2

## Giới thiệu về SePay API v2 để truy vấn giao dịch và quản lý tài khoản ngân hàng. Response JSON thống nhất, xác thực bearer và giới hạn rate cải thiện.

---

**API Overview:**

API truy vấn giao dịch ngân hàng, tài khoản ngân hàng và Virtual Account (VA) theo đơn hàng.

**Base URL:** `https://my.sepay.vn`

**Rate Limits:** 3 requests/giây. Vượt quá sẽ trả về HTTP 429 với header `x-sepay-userapi-retry-after`.


---

SePay API v2 là REST API cho phép server của bạn chủ động truy vấn giao dịch ngân hàng, quản lý tài khoản và VA theo đơn hàng từ SePay. Phù hợp với đối soát định kỳ, hiển thị lịch sử cho khách hàng, dashboard quản trị nội bộ, hoặc tự động tạo đơn hàng theo workflow.

Nếu bạn cần biết ngay khi có giao dịch mới (real-time), dùng [webhooks](/vi/sepay-webhooks/bat-dau-nhanh) thay vì poll API. API và webhook bổ sung cho nhau: webhook lo realtime, API lo tra cứu và đối soát.

## Bạn có thể làm gì

* **Giao dịch**: lấy danh sách và chi tiết, lọc theo thời gian, tài khoản, số tiền
* **Tài khoản ngân hàng**: liệt kê các tài khoản đã liên kết
* **Tài khoản ảo (VA)**: tra cứu mọi VA trên các ngân hàng hỗ trợ
* **VA theo đơn hàng** (BIDV, Sacombank): tạo, hủy, gắn/hủy VA cho đơn hàng

## Có gì mới trong v2

* Response JSON envelope thống nhất, UUID thay cho numeric ID
* Phân trang chuẩn (`page`/`per_page`), trường tiền tệ kiểu integer
* HTTP status đúng quy ước (401, 404, 422, 429)
* API tài khoản ảo (mới)

So sánh chi tiết: **[Nâng cấp từ API v1](/vi/sepay-api/v2/nang-cap-tu-v1)**.

## Môi trường API

SePay API v2 hỗ trợ hai môi trường, dùng chung định dạng request/response. Chỉ khác base URL và phạm vi dữ liệu:

### Production

* Base URL: `https://userapi.sepay.vn/v2`
* Dữ liệu giao dịch ngân hàng thật, ảnh hưởng tài khoản Production
* Dùng API token Production (tạo tại **Cấu hình Công ty** → **API Access** ở chế độ Production)

### Sandbox

* Base URL: `https://userapi-sandbox.sepay.vn/v2`
* Dữ liệu cách ly hoàn toàn với Production, dùng cho phát triển và kiểm thử
* Tạo token riêng trong [**API Access**](/vi/tien-ich-khac/test-mode/api-access) ở Test mode. Token Production và token Sandbox không dùng chung được, mỗi token chỉ xác thực trên đúng endpoint của môi trường đó

<Callout type="warn" title="Chỉ hỗ trợ Production">
API 
VA theo đơn hàng
 chỉ hỗ trợ trên 
Production
.
</Callout>

## Yêu cầu

1. [Tài khoản SePay](https://my.sepay.vn) đã liên kết ít nhất 1 tài khoản ngân hàng
2. [API Token](/vi/sepay-api/v2/tao-api-token): lấy từ Dashboard

<Callout type="info" title="SePay Bank Hub">
Nếu bạn là doanh nghiệp, có sẵn nền tảng người dùng và muốn tích hợp liên kết ngân hàng và nhận biến động số dư cho từng người dùng đầu cuối, hãy tham khảo giải pháp 
SePay Bank Hub
.
</Callout>

## Bước tiếp theo

* **[Tạo API Token](/vi/sepay-api/v2/tao-api-token)**: lấy Bearer token để gọi API
* **[Xác thực & Rate Limiting](/vi/sepay-api/v2/xac-thuc)**: cách gửi token, giới hạn 3 req/giây và xử lý lỗi 401/429
* **[Bắt đầu nhanh](/vi/sepay-api/v2/bat-dau-nhanh)**: gọi API đầu tiên trong 5 phút
