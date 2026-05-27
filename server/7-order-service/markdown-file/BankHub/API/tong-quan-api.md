# Tổng quan API và xác thực Bank Hub

## Tổng quan API SePay Bank Hub: môi trường sandbox/production, xác thực Bearer Token, HTTP status code, định dạng error và danh sách endpoints đầy đủ.

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

## Giới thiệu

Ngoài Hosted Link, Bank Hub cung cấp **bộ API RESTful đầy đủ** để:

* Tạo và quản lý link token
* Tạo và Quản lý công ty
* Quản lý tài khoản ngân hàng đã liên kết
* Truy vấn lịch sử giao dịch
* Cấu hình merchant
* Cấu hình webhook nhận sự kiện

***

## Môi trường API & Versioning

Bank Hub hỗ trợ 2 môi trường:

### Production

* Base URL: `https://bankhub-api.sepay.vn`
* API Version: `/v1`
* Sử dụng cho môi trường thực tế

### Sandbox

* Base URL: `https://bankhub-api-sandbox.sepay.vn`
* API Version: `/v1`
* Sử dụng cho phát triển và kiểm thử

<Callout type="warning" title="Lưu ý">
Tất cả endpoint đều có tiền tố 
`/v1/`
 và được định tuyến dựa trên hostname.
</Callout>

***

## Xác thực API

### Tạo Access Token

Endpoint tạo token sử dụng **Basic Authentication** với `client_id` và `client_secret` được SePay cấp.

<Endpoint method="POST" path="/v1/token">
  ```http
  Authorization: Basic {base64(client_id:client_secret)}
  ```
</Endpoint>

<Callout type="warning" title="Bảo mật">
KHÔNG
 sử dụng API này từ client-side (browser, mobile app). API tạo token yêu cầu 
`client_secret`
 - thông tin này phải được bảo mật tuyệt đối trên server. Chỉ gọi API này từ backend server của bạn.
</Callout>

Chi tiết về API tạo token xem tại: **[API Tạo Token](/vi/bankhub/api/tao-token)**

## Gọi API nghiệp vụ

Tất cả API nghiệp vụ khác yêu cầu xác thực bằng **Bearer Token**:

<TextBlock title="Authorization Header">
```text
Authorization: Bearer YOUR_ACCESS_TOKEN
```
</TextBlock>

<Callout type="info" title="Quản lý Token">
Token có thời gian hiệu lực giới hạn (TTL)
Khi token hết hạn, API sẽ trả về lỗi 
`401 Unauthorized`
Cần gọi lại API 
`/v1/token`
 để lấy token mới
Gợi ý: Nên implement cơ chế refresh token tự động trước khi hết hạn
</Callout>

***

## HTTP Status Code

Bank Hub sử dụng các HTTP status code chuẩn:

* `200 OK` – Request thành công
* `201 Created` – Tạo resource thành công
* `400 Bad Request` – Lỗi validation hoặc request không hợp lệ
* `401 Unauthorized` – Thiếu hoặc sai thông tin xác thực
* `404 Not Found` – Không tìm thấy resource
* `405 Method Not Allowed` – Sai HTTP method
* `500 Internal Server Error` – Lỗi hệ thống
* `503 Service Unavailable` – Dịch vụ tạm thời không khả dụng

***

## Định dạng Error Response

Tất cả lỗi API đều trả về theo cấu trúc thống nhất:

<ResponseBlock title="RESPONSE 400 - Validation Error">
  ```json
  {
    "code": 400,
    "message": "Bad request",
    "errors": {
      "field_name": "Thông báo lỗi chi tiết"
    }
  }
  ```
</ResponseBlock>

<ResponseBlock title="RESPONSE 401 - Authentication Error">
  ```json
  {
    "code": 401,
    "message": "Unauthenticated"
  }
  ```
</ResponseBlock>

<ResponseBlock title="RESPONSE 404 - Not Found">
  ```json
  {
    "code": 404,
    "message": "Resource not found"
  }
  ```
</ResponseBlock>

***

## Danh sách API Endpoints

* **Link Token APIs:**

<Endpoint method="POST" path="/v1/link-token/create">
  Tạo link liên kết hoặc huỷ liên kết ngân hàng (có thể dùng link để nhúng Iframe hoặc dùng cho SDK). **[Chi tiết API →](/vi/bankhub/api/link-token/tao-link-token)**
</Endpoint>

<Endpoint method="POST" path="/v1/link-token/get">
  Lấy thông tin chi tiết của link token đã tạo. **[Chi tiết API →](/vi/bankhub/api/link-token/thong-tin-link-token)**
</Endpoint>

<Endpoint method="POST" path="/v1/link-token/revoke">
  Huỷ bỏ link token đã tạo, vô hiệu hoá link. **[Chi tiết API →](/vi/bankhub/api/link-token/thu-hoi-link-token)**
</Endpoint>

* **Company APIs:**

<Endpoint method="GET" path="/v1/company">
  Lấy danh sách công ty của merchant. **[Chi tiết API →](/vi/bankhub/api/cong-ty/danh-sach-cong-ty)**
</Endpoint>

<Endpoint method="GET" path="/v1/company/{xid}">
  Lấy thông tin chi tiết của một công ty theo xid. **[Chi tiết API →](/vi/bankhub/api/cong-ty/chi-tiet-cong-ty)**
</Endpoint>

<Endpoint method="POST" path="/v1/company/create">
  Tạo công ty mới cho merchant. **[Chi tiết API →](/vi/bankhub/api/cong-ty/tao-cong-ty)**
</Endpoint>

<Endpoint method="POST" path="/v1/company/edit/{xid}">
  Cập nhật thông tin công ty theo xid. **[Chi tiết API →](/vi/bankhub/api/cong-ty/chinh-sua-cong-ty)**
</Endpoint>

<Endpoint method="GET" path="/v1/company/counter/{xid}">
  Đếm giao dịch của công ty. **[Chi tiết API →](/vi/bankhub/api/cong-ty/bo-dem-cong-ty)**
</Endpoint>

* **Bank Account APIs:**

<Endpoint method="GET" path="/v1/bank-account">
  Lấy danh sách tài khoản ngân hàng đã liên kết. **[Chi tiết API →](/vi/bankhub/api/tai-khoan-ngan-hang/danh-sach-tai-khoan)**
</Endpoint>

<Endpoint method="GET" path="/v1/bank-account/{xid}">
  Lấy thông tin chi tiết của một tài khoản ngân hàng theo xid. **[Chi tiết API →](/vi/bankhub/api/tai-khoan-ngan-hang/chi-tiet-tai-khoan)**
</Endpoint>

* **Transaction APIs:**

<Endpoint method="GET" path="/v1/transaction">
  Truy vấn lịch sử giao dịch với bộ lọc linh hoạt. **[Chi tiết API →](/vi/bankhub/api/api-giao-dich/danh-sach-giao-dich)**
</Endpoint>

<Endpoint method="GET" path="/v1/transaction/{transaction_id}">
  Lấy thông tin chi tiết của một giao dịch theo transaction\_id. **[Chi tiết API →](/vi/bankhub/api/api-giao-dich/chi-tiet-giao-dich)**
</Endpoint>

* **Merchant Config APIs:**

<Endpoint method="GET" path="/v1/merchant-config">
  Lấy cấu hình hiển thị của merchant (logo, tên, màu sắc). **[Chi tiết API →](/vi/bankhub/api/api-merchant/thong-tin-cau-hinh)**
</Endpoint>

<Endpoint method="POST" path="/v1/merchant-config">
  Cập nhật cấu hình hiển thị của merchant. **[Chi tiết API →](/vi/bankhub/api/api-merchant/chinh-sua-thong-tin-cau-hinh)**
</Endpoint>

<Endpoint method="POST" path="/v1/merchant-config/logo">
  Upload logo cho merchant. **[Chi tiết API →](/vi/bankhub/api/api-merchant/upload-logo-merchant)**
</Endpoint>

* **Webhook APIs:**

<Endpoint method="GET" path="/v1/webhook">
  Lấy cấu hình webhook hiện tại. **[Chi tiết API →](/vi/bankhub/api/api-webhook/thong-tin-webhook)**
</Endpoint>

<Endpoint method="POST" path="/v1/webhook">
  Cấu hình URL và secret key cho webhook nhận sự kiện. **[Chi tiết API →](/vi/bankhub/api/api-webhook/cap-nhat-webhook)**
</Endpoint>

***

## Best Practices

### 1. Quản lý Token

* Lưu trữ token an toàn, không để lộ ra client-side
* Implement cơ chế refresh token tự động trước khi hết hạn
* Xử lý lỗi 401 bằng cách tự động lấy token mới và retry request

### 2. Xử lý Lỗi

* Luôn kiểm tra HTTP status code
* Parse và hiển thị thông báo lỗi từ response
* Implement retry logic cho các lỗi tạm thời (5xx)

### 3. Rate Limiting

* Tuân thủ rate limit của API
* Implement exponential backoff khi gặp lỗi 429
* Cache dữ liệu khi có thể để giảm số lượng API calls

### 4. Idempotency

* Sử dụng idempotency key cho các request quan trọng
* Lưu trữ và kiểm tra response dựa trên idempotency key
* Xử lý duplicate requests một cách an toàn

***

## Bước tiếp theo

Để bắt đầu sử dụng Bank Hub API, bạn có thể thực hiện theo thứ tự sau:

1. **[Tạo Access Token](/vi/bankhub/api/tao-token)** - Lấy Bearer token để xác thực các API tiếp theo
2. **[Tạo công ty](/vi/bankhub/api/cong-ty/tao-cong-ty)** - Tạo công ty để quản lý tài khoản ngân hàng
3. **[Tạo Link Token](/vi/bankhub/api/link-token/tao-link-token)** - Tạo link để người dùng liên kết ngân hàng

<Callout type="info" title="Gợi ý">
Xem 
Bắt đầu nhanh
 để có hướng dẫn tích hợp từng bước với code mẫu đầy đủ.
</Callout>
