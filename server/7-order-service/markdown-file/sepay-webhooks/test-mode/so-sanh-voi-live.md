# So sánh Test mode và Live cho SePay Webhooks

## So sánh Test mode (chế độ thử nghiệm) và Live cho SePay Webhooks: cùng cơ chế gửi, cùng payload, cùng retry; khác ở xác thực SSL và phạm vi dữ liệu.

Test mode SePay Webhooks dùng **cùng cơ chế gửi, cùng định dạng payload, cùng cơ chế gửi lại** với Live. Điểm khác chỉ nằm ở nguồn giao dịch, dữ liệu cách ly, hạn mức, và một số tính năng nâng cao chưa hỗ trợ.

## Cấu hình giống Live

| Khía cạnh              | Giá trị                                                                |
| ---------------------- | ---------------------------------------------------------------------- |
| Kiểu xác thực hỗ trợ   | `No_Authen`, `Api_Key`, `Secret_Key`, `OAuth2.0`, `HMAC_SHA256`        |
| Định dạng payload JSON | Hoàn toàn giống nhau                                                   |
| Cơ chế gửi lại         | Fibonacci (1, 1, 2, 3, 5, 8, 13 phút), tối đa 7 lần, tuổi tối đa 5 giờ |
| Connect timeout        | 15 giây                                                                |
| Total timeout          | 30 giây                                                                |
| Bộ lọc                 | Loại sự kiện, tiền tố mã thanh toán, bỏ qua khi không có mã, chỉ VA    |
| Điều kiện thành công   | HTTP 200/201 + body `{"success": true}`                                |

Hướng dẫn cấu hình đầy đủ ở các trang webhook Live: [Tạo webhook](../tao-webhook), [Xác thực](../xac-thuc), [Tích hợp webhook](../tich-hop-webhook#payload), [Xử lý lỗi](../xu-ly-loi).

## Khác biệt giữa Test mode và Live

| Khía cạnh                        | Live                                           | Test mode                                                                                 |
| -------------------------------- | ---------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Nguồn giao dịch                  | Giao dịch ngân hàng thực                       | Form **Mô phỏng giao dịch** trong Dashboard                                               |
| Cách ly dữ liệu                  | -                                              | Dữ liệu Test mode (chế độ thử nghiệm) không bao giờ ảnh hưởng tài khoản và giao dịch Live |
| Xác thực SSL của endpoint        | Bắt buộc chứng chỉ hợp lệ                      | Tắt (chấp nhận chứng chỉ tự ký và HTTP)                                                   |
| Cảnh báo và sự cố                | Tự động cảnh báo khi webhook thất bại liên tục | Chưa có                                                                                   |
| Bảng điều khiển sức khỏe webhook | Có thống kê và giám sát trạng thái             | Chỉ có lịch sử gửi                                                                        |

<Callout type="info" title="SSL tắt trong Test mode">
Test mode tắt xác thực SSL để thuận tiện test trên localhost hoặc server dev có chứng chỉ tự ký. Trước khi chuyển webhook lên môi trường thật, đảm bảo endpoint có chứng chỉ HTTPS hợp lệ.
</Callout>

## Lịch sử gửi trong Test mode

Xem tại **Test mode** → **Webhook** → **Lịch sử gửi**. Cấu trúc bản ghi (loại lần gửi, header yêu cầu, mã HTTP, body phản hồi, thời gian phản hồi, mã lỗi cURL) giống hệt webhook Live. Đọc đầy đủ tại [Giám sát webhook](../giam-sat).

Khác biệt duy nhất so với Live: phạm vi dữ liệu là giao dịch mô phỏng, không phải giao dịch ngân hàng thực.

## Cơ chế gửi lại trong Test mode

Lịch trình Fibonacci, số lần tối đa, tuổi tối đa entry, điều kiện kích hoạt, trạng thái hàng đợi: **giống hệt webhook Live**. Tham khảo đầy đủ tại [Xử lý lỗi webhook](../xu-ly-loi).

Lọc theo loại `Retry` tại **Test mode** → **Webhook** → **Lịch sử gửi** để xem các lần gửi lại. Mỗi log webhook cũng có nút **Phát lại** để gửi lại payload bỏ qua bộ lọc, giới hạn 10 lần/phút/tài khoản công ty.

## Hạn mức webhook trong Test mode

Tối đa **50 webhook** mỗi tài khoản công ty. Bảng hạn mức đầy đủ (giao dịch, tài khoản, VA, API Access) tại [Hạn mức Test mode](/vi/tien-ich-khac/test-mode/han-muc).

## Tiếp theo

* [Bắt đầu nhanh](./bat-dau-nhanh): bật Test mode, tạo tài khoản, tạo webhook, mô phỏng giao dịch lần đầu
* [Tài khoản ngân hàng Test mode](/vi/tien-ich-khac/test-mode/tai-khoan-ngan-hang): tạo mới hoặc sao chép từ Live
* [Mô phỏng giao dịch](/vi/tien-ich-khac/test-mode/mo-phong-giao-dich): payload đầy đủ, khớp VA
