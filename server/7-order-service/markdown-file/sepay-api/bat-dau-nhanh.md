# Bắt đầu nhanh với SePay API v2

## Bắt đầu với SePay API v2 trong 5 phút. Truy vấn giao dịch và tài khoản ngân hàng bằng REST API chuẩn hóa với response JSON envelope thống nhất.

---

**API Overview:**

API truy vấn giao dịch ngân hàng, tài khoản ngân hàng và Virtual Account (VA) theo đơn hàng.

**Base URL:** `https://my.sepay.vn`

**Rate Limits:** 3 requests/giây. Vượt quá sẽ trả về HTTP 429 với header `x-sepay-userapi-retry-after`.


---

## Tổng quan luồng tích hợp

Sơ đồ dưới đây mô tả luồng tích hợp SePay API v2, từ tạo API Token đến truy vấn dữ liệu tài khoản và giao dịch.

<Mermaid title="Luồng tích hợp SePay API v2">
sequenceDiagram
participant SV as Server của bạn
participant SP as SePay API v2

SV->>SP: 1. Tạo API Token (Dashboard)
SV->>SP: 2. GET /v2/bank-accounts
SP-->>SV: Danh sách tài khoản ngân hàng (UUID)
SV->>SP: 3. GET /v2/transactions
SP-->>SV: Danh sách giao dịch (UUID)
SV->>SV: 4. Xử lý dữ liệu
</Mermaid>

***

## Tính năng chính

* **Lấy danh sách & chi tiết tài khoản ngân hàng**: xem thông tin các tài khoản đã liên kết trên SePay
* **Lấy danh sách & chi tiết giao dịch**: truy vấn lịch sử giao dịch, lọc theo thời gian, tài khoản, số tiền
* **Quản lý VA theo đơn hàng (BIDV, Sacombank)**: tạo, hủy đơn hàng và Virtual Account cho tài khoản BIDV doanh nghiệp và Sacombank
* **Lấy danh sách & chi tiết tài khoản ảo**: truy vấn Virtual Account trên tất cả ngân hàng

***

## Các bước thực hành

### Bước 1: Tạo API Token

<Steps>
  <Step title="Truy cập cấu hình API">
    Đăng nhập vào **[my.sepay.vn](https://my.sepay.vn)** → chọn menu **Cấu hình Công ty** → **[API Access](https://my.sepay.vn/companyapi)**.

    <Callout type="info" title="Tạo token Test mode">
    Để test tích hợp mà không ảnh hưởng dữ liệu Production, bật 
    Test mode
     ở sidebar my.sepay.vn rồi vào 
    API Access
     trong Test mode. Token tạo ở đây chỉ xác thực được trên endpoint 
    `userapi-sandbox.sepay.vn`
    , hoàn toàn cách ly với Production. Xem chi tiết: 
    API Access trong Test mode
    .
    </Callout>
  </Step>

  <Step title="Thêm API mới">
    Chọn **+ Thêm API**, điền thông tin và nhấn **Thêm** để tạo API Token.
  </Step>

  <Step title="Lưu API Token">
    Sao chép API Token vừa tạo. Token này sẽ được dùng trong header `Authorization: Bearer YOUR_API_TOKEN` cho mọi request.
  </Step>
</Steps>

<Callout type="warn" title="Bảo mật API Token">
Không commit API Token vào source code
. Sử dụng biến môi trường (environment variables)
API Token có 
toàn quyền
 truy cập dữ liệu tài khoản và giao dịch của bạn
Chỉ gọi API từ 
server-side
. Không bao giờ đặt token trong code frontend (JavaScript phía client, mobile app)
Nếu nghi ngờ token bị lộ, hãy 
xóa và tạo token mới
 ngay tại 
API Access
</Callout>

Xem chi tiết tại **[Tạo API Token](/vi/sepay-api/v2/tao-api-token)**

***

### Bước 2: Gọi API đầu tiên - Lấy danh sách tài khoản ngân hàng

<!-- No code tabs available -->

**Response mẫu:**

<Response title="200 OK">
```json
{
  "status": "success",
  "data": [
    {
      "id": "f9e8d7c6-b5a4-3210-fedc-ba0987654321",
      "account_holder_name": "NGUYEN VAN A",
      "account_number": "0123456789",
      "accumulated": 15000000,
      "last_transaction": "2025-01-15 09:30:00",
      "label": "Tai khoan chinh",
      "active": 1,
      "bank_short_name": "ACB",
      "bank_full_name": "Ngan hang TMCP A Chau",
      "bank_code": "ACB"
    }
  ],
  "meta": {
    "pagination": {
      "total": 5,
      "per_page": 20,
      "current_page": 1,
      "last_page": 1,
      "has_more": false
    }
  }
}
```
</Response>

***

### Bước 3: Lấy danh sách giao dịch

<!-- No code tabs available -->

**Response mẫu:**

<Response title="200 OK">
```json
{
  "status": "success",
  "data": [
    {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "transaction_date": "2025-02-20 14:15:00",
      "account_number": "0123456789",
      "va": "VA001",
      "transfer_type": "in",
      "amount_in": 500000,
      "amount_out": 0,
      "accumulated": 1500000,
      "transaction_content": "CONG TY CP TECH SOLUTIONS thanh toan",
      "reference_number": "FT25051ABC",
      "code": null,
      "bank_brand_name": "ACB",
      "bank_account_id": "f9e8d7c6-b5a4-3210-fedc-ba0987654321",
      "va_id": "a2b3c4d5-e6f7-8901-bcde-f12345678901",
      "webhook_success": 1
    }
  ],
  "meta": {
    "pagination": {
      "total": 150,
      "per_page": 20,
      "current_page": 1,
      "last_page": 8,
      "has_more": true
    }
  }
}
```
</Response>

***

### Bước 4: Lấy chi tiết một giao dịch

Lấy thông tin chi tiết của một giao dịch bằng UUID:

<!-- No code tabs available -->

<Response title="200 OK">
```json
{
  "status": "success",
  "data": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "transaction_date": "2025-03-05 16:45:00",
    "account_number": "0123456789",
    "va": "VA001",
    "transfer_type": "in",
    "amount_in": 500000,
    "amount_out": 0,
    "accumulated": 1500000,
    "transaction_content": "CONG TY CP TECH SOLUTIONS thanh toan",
    "reference_number": "FT25064DEF",
    "code": null,
    "bank_brand_name": "ACB",
    "bank_account_id": "f9e8d7c6-b5a4-3210-fedc-ba0987654321",
    "va_id": "a2b3c4d5-e6f7-8901-bcde-f12345678901",
    "webhook_success": 1
  }
}
```
</Response>

Xem thêm các bộ lọc nâng cao tại [API Giao dịch](/vi/sepay-api/v2/giao-dich/danh-sach).

***

## Bước tiếp theo

1. **[Xác thực & Rate Limiting](/vi/sepay-api/v2/xac-thuc)**: Chi tiết xác thực Bearer token và xử lý rate limit
2. **[API Giao dịch](/vi/sepay-api/v2/giao-dich/danh-sach)**: Truy vấn danh sách, chi tiết giao dịch với bộ lọc nâng cao
3. **[API Tài khoản ngân hàng](/vi/sepay-api/v2/tai-khoan-ngan-hang/danh-sach)**: Truy vấn thông tin tài khoản ngân hàng
4. **[API Tài khoản ảo](/vi/sepay-api/v2/tai-khoan-ao/danh-sach)**: Truy vấn Virtual Account trên tất cả ngân hàng
5. **[API VA theo đơn hàng (BIDV)](/vi/sepay-api/v2/don-hang/danh-sach)**: Tạo và quản lý VA theo đơn hàng cho tài khoản BIDV doanh nghiệp
6. **[SePay Webhooks](/vi/sepay-webhooks/bat-dau-nhanh)**: Nhận thông báo giao dịch realtime qua webhook
