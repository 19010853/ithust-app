# Tổng quan API Cổng Thanh Toán

## Xác thực Basic Auth (merchant_id:secret_key) cho API Cổng thanh toán SePay — kèm base URL sandbox/production và bộ mã lỗi HTTP chuẩn.

---

**API Overview:**

API cổng thanh toán SePay hỗ trợ nhiều phương thức thanh toán bao gồm chuyển khoản ngân hàng qua QR code, NAPAS QR và thẻ quốc tế.

**Base URLs:**
- Production API: `https://pgapi.sepay.vn`
- Sandbox API: `https://pgapi-sandbox.sepay.vn`
- Production Checkout: `https://pay.sepay.vn`
- Sandbox Checkout: `https://pay-sandbox.sepay.vn`

**Xác thực:** Tất cả API sử dụng Basic Authentication với `merchant_id` và `secret_key`.


---

## Base URLs

Cổng thanh toán SePay cung cấp hai môi trường để tích hợp — Sandbox dùng cho kiểm thử và Production cho giao dịch thật:

| Môi trường     | Base URL                         |
| -------------- | -------------------------------- |
| **Production** | `https://pgapi.sepay.vn`         |
| **Sandbox**    | `https://pgapi-sandbox.sepay.vn` |

***

## Xác thực API

Tất cả các API của SePay đều sử dụng **Basic Authentication** để xác thực.

<TextBlock title="Headers">
```text
Authorization: Basic base64(merchant_id:secret_key)
Content-Type: application/json
```
</TextBlock>

***

## Mã lỗi chung

<ErrorCodes
  hiddenHead={true}
  rows={[
  { code: 200, name: "Thành công",                 description: "Request được xử lý thành công",                                              action: "—" },
  { code: 400, name: "Bad Request",                 description: "Dữ liệu request không hợp lệ",                                              action: "Kiểm tra lại các tham số" },
  { code: 401, name: "Unauthorized",                description: "Xác thực thất bại",                                                         action: "Kiểm tra lại merchant_id và secret_key" },
  { code: 403, name: "Forbidden",                   description: "Không có quyền truy cập API này",                                           action: "Xác nhận quyền truy cập/whitelist nếu cần" },
  { code: 404, name: "Not Found",                   description: "Không tìm thấy tài nguyên yêu cầu",                                         action: "Kiểm tra URL/path hoặc id" },
  { code: 422, name: "Unprocessable Entity",        description: "Dữ liệu hợp lệ nhưng không thể xử lý (validation errors)",                  action: "Sửa các lỗi validation theo thông báo" },
  { code: 429, name: "Too Many Requests",           description: "Vượt quá giới hạn rate limit",                                              action: "Giảm tần suất, áp dụng retry/backoff" },
  { code: 500, name: "Internal Server Error",       description: "Lỗi server",                                                                action: "Thử lại sau; liên hệ SePay để được hỗ trợ" }
]}
/>

***

## Phân trang

Các API trả về danh sách đều hỗ trợ phân trang:

<ParamsTable
  rows={[
  { "name": "per_page", "type": "integer", "required": false, "description": "Số lượng kết quả mỗi trang (mặc định: 20, tối đa: 100)" },
  { "name": "page", "type": "integer", "required": false, "description": "Trang hiện tại (mặc định: 1)" }
]}
/>

***

## Định dạng trả về

<Response title="RESPONSE">
```json
{
  "data": "[...]",
  "meta": {
    "per_page": 20,
    "total": 100,
    "has_more": false,
    "current_page": 1,
    "page_count": 5
  }
}
```
</Response>
