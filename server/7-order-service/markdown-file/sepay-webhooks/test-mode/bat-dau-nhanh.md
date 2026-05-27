# Bắt đầu nhanh với Test mode SePay Webhooks

## Hướng dẫn nhanh Test mode SePay Webhooks: bật chế độ thử nghiệm, tạo tài khoản ngân hàng và webhook, mô phỏng giao dịch để kiểm tra tích hợp.

## Webhook trong Test mode

Test mode SePay Webhooks chạy tách biệt hoàn toàn với hệ thống Live: webhook chỉ nhận giao dịch mô phỏng, không ảnh hưởng tới tài khoản ngân hàng thật. Mỗi tài khoản công ty có hạn mức riêng (xem [Hạn mức Test mode](/vi/tien-ich-khac/test-mode/han-muc)). Các bước dưới đây giúp bạn nhận webhook mô phỏng đầu tiên trong vài phút.

<Steps>
  <Step title="Bật Test mode">
    Mở **Test mode** ở sidebar my.sepay.vn để chuyển sang Test mode (chế độ thử nghiệm).
  </Step>

  <Step title="Tạo tài khoản ngân hàng Test mode">
    Tạo tài khoản ngân hàng Test mode để làm nguồn cho giao dịch mô phỏng.
  </Step>

  <Step title="Tạo webhook Test mode">
    Trỏ webhook đến endpoint của bạn để nhận payload khi mô phỏng giao dịch.
  </Step>

  <Step title="Mô phỏng giao dịch">
    Giả lập giao dịch và quan sát quy trình xử lý giao dịch, gửi webhook ngân hàng của SePay ngay trên giao diện.
  </Step>
</Steps>

## Bật Test mode

Mở **Test mode** ở sidebar [my.sepay.vn](https://my.sepay.vn) để chuyển sang chế độ thử nghiệm. Khi đã bật, banner màu vàng "**Test mode**: dữ liệu không ảnh hưởng tài khoản thật" hiển thị ở đầu trang.

<Callout type="info" title="Dữ liệu hoàn toàn tách biệt">
Mọi thao tác trong Test mode (tạo tài khoản, webhook, giao dịch) đều cách ly với dữ liệu thật. Không có giao dịch mô phỏng nào ảnh hưởng đến tài khoản ngân hàng hoặc số dư Live.
</Callout>

## Tạo tài khoản ngân hàng Test mode

Vào **Test mode** → **Tài khoản ngân hàng** → **Thêm mới**.

<Image src="/images/sepay-webhooks/tao-tai-khoan-ngan-hang-test-mode.png" alt="Tạo tài khoản ngân hàng Test mode" caption="Tạo tài khoản ngân hàng Test mode" />

Hoặc **Sao chép từ Live** để nhập nhanh cấu hình từ tài khoản thật (chỉ đọc sau khi sao chép).

Xem chi tiết cách tạo: [Tài khoản ngân hàng Test mode](/vi/tien-ich-khac/test-mode/tai-khoan-ngan-hang).

## Tạo webhook Test mode

Vào **Test mode** → **Webhook** → **Thêm webhook**.

<Image src="/images/test-mode/them-webhook-test-mode-buoc-co-ban.png" alt="Form thêm webhook trong Test mode SePay" caption="Bước Cơ bản của form thêm webhook Test mode (tên, URL, loại sự kiện, định dạng)" />

| Trường       | Giá trị ví dụ                    |
| ------------ | -------------------------------- |
| Tên          | Webhook test                     |
| URL          | `https://webhook.site/your-uuid` |
| Loại sự kiện | Cả hai                           |
| Xác thực     | Không xác thực                   |
| Tài khoản    | Tất cả                           |

<Callout type="tip" title="Test endpoint nhanh">
Dùng 
webhook.site
 hoặc 
requestbin.com
 để nhận webhook không cần server. Xác thực SSL bị tắt trong Test mode, tức là endpoint HTTP hoặc chứng chỉ tự ký đều được chấp nhận.
</Callout>

Xem chi tiết cách tạo: [Tạo webhook trong Test mode](/vi/tien-ich-khac/test-mode/tao-webhook).

## Mô phỏng giao dịch trong Test mode

Vào **Test mode** → **Giao dịch** → **Mô phỏng**.

<Image src="/images/test-mode/form-mo-phong-giao-dich-test-mode.png" alt="Form mô phỏng giao dịch trong Test mode SePay" caption="Form mô phỏng giao dịch với 100.000 VND vào tài khoản MBBank" />

| Trường    | Giá trị ví dụ                  |
| --------- | ------------------------------ |
| Tài khoản | Tài khoản vừa tạo              |
| Loại      | Tiền vào                       |
| Số tiền   | 100,000 VND                    |
| Nội dung  | `DH123456 thanh toan don hang` |

Chọn **Mô phỏng**. Hệ thống tạo giao dịch và gửi webhook đến URL của bạn trong vài giây.

<Response title="Payload webhook nhận được">
```json
{
  "gateway": "MBBank",
  "transactionDate": "2025-01-15 10:30:00",
  "accountNumber": "0123456789",
  "subAccount": null,
  "code": "DH123456",
  "content": "DH123456 thanh toan don hang",
  "transferType": "in",
  "description": "NGUYEN VAN A chuyen tien",
  "transferAmount": 100000,
  "referenceCode": "FT25015ABC123",
  "accumulated": 5000000,
  "id": 12345
}
```
</Response>

Endpoint của bạn cần trả HTTP 200 hoặc 201 kèm `{"success": true}` để SePay ghi nhận thành công. Xem chi tiết điều kiện thành công tại [Tích hợp webhook](../tich-hop-webhook#payload).

Kiểm tra kết quả gửi tại **Test mode** → **Webhook** → **Lịch sử gửi**.

Xem chi tiết cách mô phỏng: [Mô phỏng giao dịch](/vi/tien-ich-khac/test-mode/mo-phong-giao-dich).

## Tiếp theo

* [So sánh với Live](./so-sanh-voi-live): Test mode khác môi trường thật ở điểm nào, cấu hình webhook và log Test mode đầy đủ
* [Mô phỏng giao dịch](/vi/tien-ich-khac/test-mode/mo-phong-giao-dich): payload đầy đủ, khớp tài khoản ảo, hạn mức theo ngày
* [Tài khoản ngân hàng Test mode](/vi/tien-ich-khac/test-mode/tai-khoan-ngan-hang): tạo mới hoặc sao chép từ Live
* [Hạn mức Test mode](/vi/tien-ich-khac/test-mode/han-muc): bảng hạn mức cho mọi tài nguyên
