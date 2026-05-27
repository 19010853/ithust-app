# Xác thực SePay API v2 và rate limits

## Hướng dẫn xác thực SePay API v2 bằng Bearer token và hiểu các chính sách rate limiting để tránh bị giới hạn trong môi trường production.

---

**API Overview:**

API truy vấn giao dịch ngân hàng, tài khoản ngân hàng và Virtual Account (VA) theo đơn hàng.

**Base URL:** `https://my.sepay.vn`

**Rate Limits:** 3 requests/giây. Vượt quá sẽ trả về HTTP 429 với header `x-sepay-userapi-retry-after`.


---

## Xác thực

Mọi request đều yêu cầu Bearer token trong header `Authorization`.

<Node title="Header">
```js
Authorization: Bearer {api_key}
```
</Node>

* API key là chuỗi 64 ký tự alphanumeric
* Lấy từ **Cài đặt công ty > API Keys** trên cổng SePay

<Callout type="info" title="Thông tin">
Xem hướng dẫn tạo API Token tại trang 
Tạo API Token
.
</Callout>

***

## Rate Limiting

* **3 request/giây** mỗi địa chỉ IP
* Rate Limiting được kiểm tra **trước** xác thực
* Vượt giới hạn trả HTTP 429

***

## Response lỗi xác thực

| Tình huống                      | HTTP Status | error\_code    |
| ------------------------------- | ----------- | -------------- |
| Thiếu header Authorization      | 401         | `unauthorized` |
| Định dạng token không hợp lệ    | 401         | `unauthorized` |
| API key không hợp lệ/bị vô hiệu | 401         | `unauthorized` |
| Vượt Rate Limiting              | 429         | `rate_limited` |

***

### Response 401 (Unauthorized)

<Node title="JSON">
```js
{
"status": "error",
"message": "Missing Authorization header",
"error_code": "unauthorized"
}
```
</Node>

***

### Response 429 (Rate limited)

<Node title="JSON">
```js
{
"status": "error",
"message": "Too many requests",
"error_code": "rate_limited"
}
```
</Node>

Response 429 kèm theo các header sau:

| Header                  | Mô tả                                           |
| ----------------------- | ----------------------------------------------- |
| `Retry-After`           | Số giây cần chờ trước khi gửi request tiếp theo |
| `X-RateLimit-Limit`     | Rate Limiting tối đa (3)                        |
| `X-RateLimit-Remaining` | Số request còn lại (0 khi bị rate limit)        |
| `X-RateLimit-Reset`     | Số giây cho đến khi nạp lại token               |
