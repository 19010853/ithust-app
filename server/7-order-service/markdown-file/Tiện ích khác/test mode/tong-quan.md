# Tổng quan Test mode SePay

## Tổng quan Test mode (sandbox) SePay: chế độ thử nghiệm cách ly với Live để cấu hình tài khoản, VA, webhook, API Access, mô phỏng giao dịch trước khi chạy thật.

Test mode (chế độ thử nghiệm) là môi trường tách biệt với Live trong Dashboard my.sepay.vn, dành cho nhà phát triển và đội tích hợp. Mọi tài nguyên tạo trong Test mode (tài khoản ngân hàng, VA, webhook, API Access, giao dịch) đều cách ly hoàn toàn: không có giao dịch mô phỏng nào chạm vào tiền thật, không có webhook Live nào nhận payload từ Test mode. Phù hợp khi cần thử nghiệm tích hợp, chạy CI/CD, hoặc đào tạo đội vận hành mà không lo ảnh hưởng dữ liệu sản xuất.

## Bật Test mode

Trên [my.sepay.vn](https://my.sepay.vn), mở **Test mode** ở sidebar (có biểu tượng bình thử nghiệm) để gạt công tắc sang trạng thái bật. Hoặc mở tìm kiếm (`Cmd K` / `Ctrl K`), gõ "Test mode" và chọn kết quả.

<Image src="/images/test-mode/bat-test-mode.png" alt="Mục Test mode trên sidebar my.sepay.vn" caption="Mở Test mode ở sidebar để bật chế độ thử nghiệm" />

Khi đã ở Test mode, banner màu vàng "**Test mode**: dữ liệu không ảnh hưởng tài khoản thật" hiển thị ở đầu trang. Để quay lại Live, chọn **← Quay lại Live** trên banner hoặc gạt lại công tắc ở sidebar.

<Image src="/images/test-mode/tong-quan-1-banner.png" alt="Banner Test mode hiển thị ở đầu Dashboard" caption="Banner xác nhận đang ở Test mode kèm nút Quay lại Live" />

## Quyền truy cập Test mode

Truy cập Test mode được kiểm soát theo vai trò người dùng trong tài khoản công ty:

| Vai trò        | Truy cập Test mode                                                     |
| -------------- | ---------------------------------------------------------------------- |
| **SuperAdmin** | Mặc định có quyền                                                      |
| **Admin**      | Mặc định có quyền                                                      |
| **Người dùng** | Cần được cấp quyền **Cho phép truy cập Test mode (chế độ thử nghiệm)** |

SuperAdmin hoặc Admin cấp quyền cho Người dùng tại **Cấu hình Công ty** → **Người dùng** → mở chi tiết người dùng → bật quyền **Cho phép truy cập Test mode (chế độ thử nghiệm)**.

<Callout type="info" title="Người dùng không có quyền">
Khi mở 
Test mode
 trên sidebar mà không có quyền, hệ thống ẩn công tắc Test mode hoặc trả thông báo từ chối truy cập. Liên hệ SuperAdmin hoặc Admin của tài khoản công ty để được cấp quyền.
</Callout>

## Tài nguyên cấu hình trong Test mode

| Tài nguyên          | Mô tả                                                                                                             | Trang chi tiết                                                         |
| ------------------- | ----------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Tài khoản ngân hàng | Tạo mới hoặc sao chép từ Live, dùng làm nguồn cho giao dịch mô phỏng                                              | [Tài khoản ngân hàng](/vi/tien-ich-khac/test-mode/tai-khoan-ngan-hang) |
| Tài khoản ảo (VA)   | Giả lập VA chính thức từ ngân hàng với tiền tố `SBSEPAY`, hoặc VA theo nội dung thanh toán với 3 ký tự ngẫu nhiên | [Tạo VA](/vi/tien-ich-khac/test-mode/tao-va)                           |
| API Access          | Tạo và quản lý token API riêng cho Test mode, chỉ xác thực trên `userapi-sandbox.sepay.vn`                        | [API Access](/vi/tien-ich-khac/test-mode/api-access)                   |
| Webhook             | Endpoint nhận giao dịch mô phỏng, dùng chung 5 kiểu xác thực và bộ lọc với Live                                   | [Tạo webhook](/vi/tien-ich-khac/test-mode/tao-webhook)                 |
| Giao dịch mô phỏng  | Form **Mô phỏng giao dịch** trong Dashboard, sinh payload giống Live                                              | [Mô phỏng giao dịch](/vi/tien-ich-khac/test-mode/mo-phong-giao-dich)   |

## Hạn mức Test mode

Mỗi tài khoản công ty có hạn mức riêng cho từng loại tài nguyên trong Test mode (số tài khoản ngân hàng, số VA mỗi tài khoản, số webhook, số API Access, số giao dịch mô phỏng mỗi ngày). Vượt hạn mức thì thao tác bị từ chối; xóa tài nguyên cũ để giải phóng chỗ.

Bảng hạn mức đầy đủ và cách xử lý khi vượt: [Hạn mức Test mode](/vi/tien-ich-khac/test-mode/han-muc).

## Tích hợp Test mode theo tính năng

| Tính năng      | Hướng dẫn                                                                                              |
| -------------- | ------------------------------------------------------------------------------------------------------ |
| SePay Webhooks | [Bắt đầu nhanh](/vi/sepay-webhooks/test-mode/bat-dau-nhanh): Test mode với webhook, mô phỏng giao dịch |
| SePay API v2   | [Bắt đầu nhanh](/vi/sepay-api/v2/bat-dau-nhanh): Test mode với SePay API                               |

<Callout type="info" title="Dữ liệu hoàn toàn tách biệt">
Mọi thao tác trong Test mode (tạo tài khoản, webhook, giao dịch) đều cách ly với dữ liệu thật. Không có giao dịch mô phỏng nào ảnh hưởng đến tài khoản ngân hàng hoặc số dư Live.
</Callout>
