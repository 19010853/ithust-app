# Nâng cấp từ v1

## Hướng dẫn chi tiết so sánh SePay API v1 và v2. Hiểu các thay đổi endpoint, xác thực và định dạng response để lên kế hoạch migration hiệu quả.

---

**API Overview:**

API truy vấn giao dịch ngân hàng, tài khoản ngân hàng và Virtual Account (VA) theo đơn hàng.

**Base URL:** `https://my.sepay.vn`

**Rate Limits:** 3 requests/giây. Vượt quá sẽ trả về HTTP 429 với header `x-sepay-userapi-retry-after`.


---

## Thay đổi so với API v1 (userapi/)

| Khía cạnh         | API v1 (`userapi/`)                                  | API v2 (`/v2/`)                                                                  |
| ----------------- | ---------------------------------------------------- | -------------------------------------------------------------------------------- |
| Base URL          | `https://my.sepay.vn/userapi/`                       | `https://userapi.sepay.vn/v2`                                                    |
| Lỗi xác thực      | HTTP 200, body rỗng                                  | HTTP 401, JSON body                                                              |
| Lỗi nghiệp vụ     | HTTP 200                                             | HTTP 422 với `error_code`                                                        |
| Key trả về        | `transactions`, `bankaccounts`, `count_transactions` | Luôn là `data`                                                                   |
| Định danh         | Số tự tăng                                           | UUID                                                                             |
| Kiểu tiền tệ      | Số thực (chuỗi)                                      | Số nguyên                                                                        |
| Phân trang        | `limit` (mặc định 5000), `since_id`                  | `page`/`per_page` (mặc định 20, tối đa 100), `since_id`                          |
| Bộ lọc số tiền    | Khớp chính xác (`amount_in=X`)                       | Khoảng (`amount_in_min`/`amount_in_max`)                                         |
| Bộ lọc ngày       | `transaction_date_min`/`_max`                        | `transaction_date_from`/`_to`                                                    |
| Rate limit header | `x-sepay-userapi-retry-after`                        | `Retry-After`, `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset` |

<Callout type="info" title="Thông tin">
Các endpoint v1 (
`userapi/*`
) giữ nguyên và hoạt động bình thường. Bạn có thể sử dụng song song cả v1 và v2 trong quá trình chuyển đổi.
</Callout>

***

## Bảng chuyển đổi endpoint

| V1                                                | V2                                                      | Ghi chú                 |
| ------------------------------------------------- | ------------------------------------------------------- | ----------------------- |
| `GET /userapi/transactions/list`                  | `GET /v2/transactions`                                  |                         |
| `GET /userapi/transactions/details/{id}`          | `GET /v2/transactions/{uuid}`                           | ID số -> UUID           |
| `GET /userapi/transactions/count`                 | (đã bỏ)                                                 | Dùng `pagination.total` |
| `GET /userapi/bankaccounts/list`                  | `GET /v2/bank-accounts`                                 |                         |
| `GET /userapi/bankaccounts/details/{id}`          | `GET /v2/bank-accounts/{uuid}`                          | ID số -> UUID           |
| `GET /userapi/bankaccounts/count`                 | (đã bỏ)                                                 | Dùng `pagination.total` |
| `GET /userapi/bidv/{id}/orders`                   | `GET /v2/bank-accounts/{uuid}/orders`                   |                         |
| `POST /userapi/bidv/{id}/orders`                  | `POST /v2/bank-accounts/{uuid}/orders`                  |                         |
| `GET /userapi/bidv/{id}/orders/{oid}`             | `GET /v2/bank-accounts/{uuid}/orders/{uuid}`            |                         |
| `DELETE /userapi/bidv/{id}/orders/{oid}`          | `DELETE /v2/bank-accounts/{uuid}/orders/{uuid}`         |                         |
| `POST /userapi/bidv/{id}/orders/{oid}/vas`        | `POST /v2/bank-accounts/{uuid}/orders/{uuid}/va`        |                         |
| `DELETE /userapi/bidv/{id}/orders/{oid}/vas/{va}` | `DELETE /v2/bank-accounts/{uuid}/orders/{uuid}/va/{va}` |                         |
| (không có)                                        | `GET /v2/bank-accounts/{uuid}/va`                       | Mới: API tài khoản ảo   |

***

## Các bước chuyển đổi

<Steps>
  <Step title="Cập nhật Base URL">
    Thay `https://my.sepay.vn/userapi/` bằng `https://userapi.sepay.vn/v2`.
  </Step>

  <Step title="Chuyển ID số sang UUID">
    Tất cả endpoint v2 sử dụng UUID thay cho numeric ID. Lấy UUID từ response danh sách hoặc lưu lại UUID khi tạo mới.
  </Step>

  <Step title="Cập nhật xử lý số tiền (float -> integer)">
    <Node title="So sánh">
    ```js
    V1: "amount_in": "18067000.00"  (string, float)
    V2: "amount_in": 18067000       (integer)
    ```
    </Node>

    Loại bỏ các hàm parse float/string khi xử lý số tiền từ v2.
  </Step>

  <Step title="Cập nhật phân trang (limit -> page/per_page)">
    V1 dùng `limit` (mặc định 5000). V2 dùng `page`/`per_page` (mặc định 20, tối đa 100). Nếu cần lấy nhiều dữ liệu, lặp qua các trang cho đến khi `has_more: false`.
  </Step>

  <Step title="Cập nhật xử lý lỗi">
    V1 luôn trả HTTP 200, cần parse body để xác định lỗi. V2 trả đúng HTTP status code (401, 404, 422, 429). Kiểm tra HTTP status trước khi parse body.
  </Step>
</Steps>

***

## Ví dụ so sánh

**Lấy danh sách giao dịch:**

<Node title="V1">
```js
curl -X GET "https://my.sepay.vn/userapi/transactions/list?limit=20" \\
-H "Authorization: Bearer YOUR_TOKEN"
```
</Node>

<Node title="V2">
```js
curl -X GET "https://userapi.sepay.vn/v2/transactions?per_page=20" \\
-H "Authorization: Bearer YOUR_TOKEN"
```
</Node>

**Định dạng response:**

<Node title="V1 - Root key thay đổi theo endpoint">
```js
{
"status": 200,
"messages": { "success": true },
"transactions": [...]
}
```
</Node>

<Node title="V2 - Luôn dùng "data"">
```js
{
"status": "success",
"data": [...],
"meta": {
  "pagination": {
    "total": 150,
    "per_page": 20,
    "has_more": true
  }
}
}
```
</Node>

***

## Xử lý ID

API v2 sử dụng UUID cho tất cả định danh. ID dạng số từ v1 không hoạt động với endpoint v2.

Ví dụ:

* V1: `GET /userapi/transactions/details/12345`
* V2: `GET /v2/transactions/a1b2c3d4-e5f6-7890-abcd-ef1234567890`

Để lấy UUID tương ứng, gọi endpoint danh sách v2 và đối chiếu dựa trên các trường nghiệp vụ (số tài khoản, mã tham chiếu, v.v.).

***

## Phân trang

|                      | V1                                  | V2                         |
| -------------------- | ----------------------------------- | -------------------------- |
| Tham số              | `limit`                             | `page`, `per_page`         |
| Mặc định             | 5000 bản ghi                        | 20 bản ghi/trang           |
| Tối đa               | 5000                                | 100 bản ghi/trang          |
| Lấy dữ liệu mới      | `since_id` (số)                     | `since_id` (UUID)          |
| Kiểm tra còn dữ liệu | So sánh số lượng trả về với `limit` | `meta.pagination.has_more` |

Để lấy toàn bộ dữ liệu, tăng `page` cho đến khi `has_more: false`:

<Node title="Ví dụ">
```js
# Trang 1
GET /v2/transactions?page=1&per_page=100

# Trang 2 (nếu has_more: true)
GET /v2/transactions?page=2&per_page=100
```
</Node>
