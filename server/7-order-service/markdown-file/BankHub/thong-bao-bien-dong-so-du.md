# Webhook IPN biến động số dư

## Cấu hình webhook IPN của SePay Bank Hub để nhận thông báo biến động số dư realtime. Bao gồm cấu trúc payload, ký bảo mật, retry và chống trùng.

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

<Callout type="info" title="Yêu cầu IPN URL">
Phía Merchant có thể tùy ý lựa chọn cấu trúc đường dẫn để nhận biến động số dư và thông báo lại cho SePay để cấu hình tích hợp.
</Callout>

## Định dạng IPN JSON payload

<Response title="IPN JSON">
```json
{
   "gateway": "string",
   "transaction_date": "Y-m-d H:i:s",
   "account_number": "string",
   "bank_account_xid": "string",
   "va": "string | null",
   "payment_code": "string | null",
   "content": "string",
   "transfer_type": "credit | debit",
   "amount": "number",
   "reference_code": "string",
   "accumulated": "number",
   "transaction_id": "string"
}

```
</Response>

## Mô tả IPN JSON

<ResponseFields
  rows={[
{ name: "gateway", type: "string", description: "Tên cổng thực hiện. Ví dụ: MBBank, OCB." },
{ name: "transaction_date", type: "string", description: "Thời gian nhận giao dịch (ISO 8601 hoặc timestamp)." },
{ name: "account_number", type: "string", description: "Số tài khoản ngân hàng." },
{ name: "bank_account_xid", type: "string", description: "ID tài khoản ngân hàng tương ứng trong hệ thống." },
{ name: "va", type: "string | null", description: "Số VA (Virtual Account), nếu có." },
{ name: "payment_code", type: "string | null", description: "Mã thanh toán, nếu có." },
{ name: "content", type: "string", description: "Nội dung giao dịch." },
{ name: "transfer_type", type: "string", description: "Loại giao dịch: credit (tiền vào) hoặc debit (tiền ra)." },
{ name: "amount", type: "number", description: "Số tiền giao dịch (số không âm)." },
{ name: "reference_code", type: "string | null", description: "Mã tham chiếu FT." },
{ name: "accumulated", type: "number", description: "Số dư sau giao dịch (hiện chưa hỗ trợ, mặc định = 0)." },
{ name: "transaction_id", type: "string", description: "ID giao dịch." }
]}
/>

## Yêu cầu Response

* Nội dung trả về với `Content-Type` là `application/json`
* JSON fragment có dạng:

<Response title="IPN JSON">
```json
{
   "success": true
}
```
</Response>

## Yêu cầu bảo mật

* URL IPN phía Merchant cung cấp phải hỗ trợ SSL
* Mặc định, SePay gọi tới IPN của Merchant kèm với header `Authorization` với giá trị là `Apikey {API_KEY}`, trong đó `{API_KEY}` là khóa bảo mật mà SePay sẽ cung cấp cho phía Merchant trước đó. Merchant có thể kiểm tra tính đúng đắn của header `Authorization` để xác nhận đó là request từ SePay.
* Hoặc phía Merchant có thể lọc địa chỉ IP gọi tới. Xem **[danh sách địa chỉ IP của SePay](/vi/dia-chi-ip)** để thêm vào allowlist.
* Hoặc Merchant có thể áp dụng cả 2 lớp bảo mật trên.

## Điều kiện SePay thông báo IPN tới Merchant

Để một công ty (tổ chức) thuộc quyền quản lý của Merchant có thể nhận thông báo IPN từ SePay phải đạt đủ các điều kiện sau đây:

* Công ty (tổ chức) sở hữu tài khoản ngân hàng nhận thông báo phải ở trạng thái Hoạt động (`status: Active` và `active: 1`), xem thêm tại **[API truy vấn chi tiết công ty (tổ chức).](/vi/bankhub/api/cong-ty/chi-tiet-cong-ty)**
* Cấu hình `transaction_amount` của công ty (tổ chức) sở hữu tài khoản ngân hàng nhận thanh toán phải có giá trị lớn hơn 0 hoặc giá trị `Unlimited`, xem thêm tại **[API truy vấn cấu hình công ty (tổ chức).](/vi/bankhub/api/cong-ty/chi-tiet-cong-ty)**

## Cơ chế retry

SePay sẽ thực hiện retry thông báo có giao dịch mới tới IPN của Merchant khi và chỉ khi bị lỗi mạng (kết nối mạng thất bại). Thời gian gọi cách nhau bằng phút, tăng dần theo dãy số **[Fibonacci](https://en.wikipedia.org/wiki/Fibonacci_sequence)**.

* Số lần gọi lại tối đa là 7 lần
* Tối đa là 5 giờ kể từ khi gọi lần đầu thất bại
* Network connect timeout của SePay là 5 giây
* Thời gian chờ phản hồi tối đa của SePay là 8 giây

## Yêu cầu chống trùng lặp giao dịch

Để tránh trùng lặp giao dịch khi phát sinh các sự cố với kết nối IPN của phía merchant tại cơ chế retry. SePay khuyến nghị merchant xử lý chống trùng lặp giao dịch khi nhận thông báo biến động giao dịch từ SePay thông qua IPN

***

## Bước tiếp theo

Sau khi cấu hình IPN thành công, bạn có thể:

1. **[Webhook Events](/vi/bankhub/webhook-event)** - Nhận thông báo sự kiện liên kết/hủy liên kết tài khoản
2. **[API Danh sách giao dịch](/vi/bankhub/api/api-giao-dich/danh-sach-giao-dich)** - Truy vấn lịch sử giao dịch
3. **[API Chi tiết giao dịch](/vi/bankhub/api/api-giao-dich/chi-tiet-giao-dich)** - Xem chi tiết một giao dịch cụ thể
4. **[API Cập nhật Webhook](/vi/bankhub/api/api-webhook/cap-nhat-webhook)** - Quản lý cấu hình webhook

<Callout type="info" title="Lưu ý">
Đảm bảo xử lý 
chống trùng lặp giao dịch
 bằng cách kiểm tra 
`transaction_id`
 trước khi xử lý IPN.
</Callout>
