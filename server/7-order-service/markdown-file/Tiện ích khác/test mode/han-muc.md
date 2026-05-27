# Hạn mức Test mode SePay

## Hạn mức Test mode (sandbox) SePay: 500 giao dịch/ngày, 50 tài khoản ngân hàng, 100 VA, 50 webhook, 50 API Access. Reset 00:00 giờ Việt Nam.

Test mode (chế độ thử nghiệm) áp dụng giới hạn cứng cho từng tài khoản công ty trên mọi tài nguyên. Khi vượt giới hạn, hệ thống từ chối thao tác và không tạo dữ liệu.

## Bảng hạn mức Test mode

| Tài nguyên          | Giới hạn                    | Loại                                      |
| ------------------- | --------------------------- | ----------------------------------------- |
| Giao dịch mô phỏng  | 500 mỗi ngày                | Theo ngày, làm mới lúc 00:00 giờ Việt Nam |
| Tài khoản ngân hàng | 50                          | Tổng                                      |
| Tài khoản ảo (VA)   | 100 mỗi tài khoản ngân hàng | Tổng                                      |
| Webhook             | 50                          | Tổng                                      |
| API Access          | 50                          | Tổng                                      |

<Image src="/images/test-mode/han-muc-tai-nguyen-test-mode.png" alt="Bảng theo dõi hạn mức tài nguyên Test mode" caption="Bảng tổng quan cho biết mức sử dụng hiện tại trên từng tài nguyên Test mode" />

## Làm mới hạn mức giao dịch theo ngày

Hạn mức giao dịch làm mới về 0 lúc **00:00 giờ Việt Nam (UTC+7)** hằng ngày. Sau thời điểm này, tài khoản công ty lại được mô phỏng 500 giao dịch mới.

<Callout type="info" title="Múi giờ">
Hạn mức tính theo giờ Việt Nam. Lúc 00:00 ngày mới, hệ thống tự động làm mới hạn mức giao dịch cho mọi tài khoản công ty.
</Callout>

## Khi vượt hạn mức Test mode

| Tài nguyên          | Kết quả                                                             |
| ------------------- | ------------------------------------------------------------------- |
| Giao dịch           | Form mô phỏng trả lỗi, không tạo giao dịch, không kích hoạt webhook |
| Tài khoản ngân hàng | Không thể tạo tài khoản thứ 51                                      |
| Tài khoản ảo (VA)   | Không thể tạo VA thứ 101 trên cùng một tài khoản ngân hàng          |
| Webhook             | Không thể tạo webhook thứ 51                                        |
| API Access          | Không thể tạo token thứ 51                                          |

## Cách giải phóng hạn mức

* **Giao dịch**: chờ đến 00:00 giờ Việt Nam hôm sau
* **Tài khoản ngân hàng**: xóa tài khoản Test mode cũ trong **Test mode → Tài khoản ngân hàng**
* **Webhook**: xóa webhook cũ trong **Test mode → Webhook**
* **API Access**: xóa token cũ trong **Cấu hình Công ty → API Access** (đang ở Test mode)

<Callout type="warn" title="Xóa tài khoản kéo theo dữ liệu liên quan">
Xóa tài khoản ngân hàng Test mode xóa luôn toàn bộ VA, giao dịch mô phỏng, và lịch sử gửi webhook liên quan. Thao tác không hoàn tác được.
</Callout>

## Tiếp theo

* [Tài khoản ngân hàng](./tai-khoan-ngan-hang): tạo tài khoản trong giới hạn
* [Tạo VA](./tao-va): VA chính thức và VA nội bộ trong giới hạn 100 VA mỗi tài khoản
* [Mô phỏng giao dịch](./mo-phong-giao-dich): dùng hạn mức 500 giao dịch mỗi ngày
