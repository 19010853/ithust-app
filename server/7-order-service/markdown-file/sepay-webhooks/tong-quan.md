# SePay Webhooks là gì?

## Webhooks SePay đẩy thông báo giao dịch ngân hàng về server theo thời gian thực. Tóm tắt tính năng và mọi thứ cần chuẩn bị trước khi tích hợp.

Khi tài khoản ngân hàng đã liên kết SePay nhận được giao dịch mới, SePay tự động gửi HTTP POST kèm dữ liệu tới URL bạn cấu hình, và server của bạn chỉ cần xử lý rồi trả status 200 là xong.

Bạn có thể theo dõi tiền vào, tiền ra hoặc cả hai, lọc theo tài khoản, VA hoặc mã thanh toán. Webhook hỗ trợ 4 cách xác thực (HMAC-SHA256, API Key, OAuth 2.0 hoặc không xác thực) và tự retry tối đa 7 lần (kéo dài khoảng 33 phút) khi endpoint lỗi. Đi kèm còn có nhật ký gửi, phát lại thủ công và cảnh báo qua Telegram, Slack, Discord.

## Yêu cầu

1. [Tài khoản SePay](https://my.sepay.vn)
2. Ít nhất 1 tài khoản ngân hàng đã liên kết. Xem [Tài khoản ngân hàng](/vi/sepay-webhooks/tai-khoan-ngan-hang) cho danh sách hỗ trợ.
3. URL server có thể truy cập từ Internet để nhận POST. Nếu đang dev ở máy local, dùng [ngrok](https://ngrok.com) hoặc công cụ tương tự để tạo public URL tạm thời.

Đủ điều kiện rồi, mời sang [Bắt đầu nhanh](/vi/sepay-webhooks/bat-dau-nhanh) để tạo webhook đầu tiên.

## Tiếp theo

* [Bắt đầu nhanh](/vi/sepay-webhooks/bat-dau-nhanh): tạo webhook đầu tiên, code PHP/Node.js
* [Tích hợp webhook](/vi/sepay-webhooks/tich-hop-webhook): payload, phản hồi hợp lệ, chống trùng lặp
* [Tạo webhook](/vi/sepay-webhooks/tao-webhook): form 4 bước, bộ lọc, gửi thử
* [Xác thực](/vi/sepay-webhooks/xac-thuc): HMAC-SHA256, API Key, OAuth 2.0
* [Giám sát](/vi/sepay-webhooks/giam-sat): lịch sử gửi, cảnh báo, sự cố
