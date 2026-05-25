# Kế hoạch tích hợp SePay test mode

## Mục tiêu
- Thanh toán đơn hàng bằng QR VietQR/SePay.
- Nhận webhook SePay qua gateway public và cập nhật đơn hàng tự động.
- Giữ rút tiền seller ở dạng request nội bộ; payout tự động qua SePay sẽ là phần tích hợp riêng sau.

## Biến môi trường cho `server/7-order-service/.env`
```env
PLATFORM_BANK_ID=MBBank
PLATFORM_BANK_ACCOUNT=0123456789
SEPAY_WEBHOOK_SECRET=your_test_webhook_api_key
```

### Cách lấy trên `my.sepay.vn`
1. Bật **Test mode** trên sidebar `my.sepay.vn`.
2. Vào **Test mode → Tài khoản ngân hàng → Thêm tài khoản**.
3. Chọn ngân hàng test. Mã ngân hàng điền vào `PLATFORM_BANK_ID` phải là mã dùng bởi `qr.sepay.vn`, ví dụ `MBBank`, `VietinBank`, `Vietcombank`. Có thể đối chiếu danh sách ở `https://qr.sepay.vn/banks.json`.
4. Lấy **Số tài khoản** test mode để điền vào `PLATFORM_BANK_ACCOUNT`. Nếu dùng VA chính thức thì điền số VA vào biến này.
5. Vào **Test mode → Tích hợp Webhook → Thêm webhook → Bảo mật**:
   - Chọn **API Key** và copy key đó vào `SEPAY_WEBHOOK_SECRET`, hoặc
   - Chọn **Không xác thực** và để `SEPAY_WEBHOOK_SECRET=` rỗng.
6. Chưa dùng HMAC-SHA256 cho flow hiện tại vì code đang kiểm tra `Authorization`, chưa verify `X-SePay-Signature` bằng raw body.

## Cấu hình webhook test mode
- URL webhook: `https://<domain>/api/gateway/v1/sepay/webhook`
- Payload: JSON
- Loại giao dịch: **Tiền vào** hoặc **Tất cả**
- Nội dung mô phỏng: dùng đúng `payment.content` client nhận được, dạng `PAYORDER<mongo_order_id>`.
- Số tiền mô phỏng: dùng đúng `payment.amount` client nhận được.

## Trạng thái triển khai hiện tại
- Gateway expose webhook public trước middleware đăng nhập, nên SePay có thể gọi `POST /api/gateway/v1/sepay/webhook`.
- Gateway forward header `Authorization` sang `7-order-service`, nên webhook API Key hoạt động với `SEPAY_WEBHOOK_SECRET`.
- `7-order-service` tạo QR SePay với `payment.qrCodeUrl`, `payment.amount`, `payment.content`.
- `7-order-service` nhận payload Test mode qua trường `content` và đổi order sang `IN_PROGRESS` khi amount khớp.
- Client đã bỏ endpoint Stripe `order/create-payment-intent` khỏi RTK Query.
- Client normalize status để nhận cả `IN_PROGRESS` và `in progress`.
- Client hiển thị amount/content dưới QR và kiểm tra lại trạng thái order trước khi chuyển sang trang activity.

## Cách test end-to-end
1. Chạy gateway, order service, client và các dependency cần thiết.
2. Tạo order từ client.
3. Ghi lại `payment.amount` và `payment.content` hiển thị ở màn QR.
4. Trên `my.sepay.vn` Test mode, mở **Mô phỏng giao dịch**.
5. Chọn tài khoản ngân hàng test, loại **Tiền vào**, nhập đúng amount và content.
6. Kiểm tra webhook log trên SePay trả HTTP 200 và body `{"success":true}`.
7. Client sẽ poll order mỗi 5 giây; khi webhook cập nhật thành công, order chuyển sang trang activity và xuất hiện trong active orders.

## Ghi chú rút tiền seller
- Flow hiện tại chỉ tạo withdrawal request trong `4-users-service` và gửi email cho admin xử lý payout batch.
- Webhook SePay `transferType: out` chưa được map vào withdrawal.
- Nếu cần payout tự động/sandbox, cần thiết kế thêm contract ở `4-users-service` thay vì chỉ thêm biến `.env` cho `7-order-service`.
