# Tạo tài khoản ngân hàng Test mode SePay

## Tạo tài khoản ngân hàng trong Test mode (chế độ thử nghiệm) SePay: tạo mới hoặc sao chép từ Live. Tên chủ và số tài khoản được sinh tự động.

Tài khoản ngân hàng trong Test mode (chế độ thử nghiệm) được tạo theo hai cách: **Tạo mới** trực tiếp hoặc **Sao chép từ Live**. Cách tạo ảnh hưởng trực tiếp đến quyền thao tác VA.

## Hai cách tạo tài khoản trong Test mode

| Cách tạo             | Quyền VA                                 |
| -------------------- | ---------------------------------------- |
| **Tạo mới**          | Tạo, xóa, bật/tắt VA theo từng ngân hàng |
| **Sao chép từ Live** | Chỉ đọc, không tạo, xóa hay bật/tắt VA   |

## Tài khoản tạo mới

Tạo tại **Test mode** → **Tài khoản ngân hàng** → **Thêm tài khoản**.

<Image src="/images/test-mode/tai-khoan-1-trang-danh-sach.png" alt="Trang Tài khoản ngân hàng trong Test mode" caption="Danh sách tài khoản ngân hàng Test mode" />

<Image src="/images/test-mode/them-tai-khoan-ngan-hang-test-mode-thu-cong.png" alt="Thêm mới tài khoản với tên chủ và số tự sinh" caption="Tên chủ tài khoản và số tài khoản được hệ thống tự sinh" />

| Trường            | Mô tả                                                                |
| ----------------- | -------------------------------------------------------------------- |
| Ngân hàng         | Chọn từ danh sách ngân hàng SePay hỗ trợ                             |
| Tên chủ tài khoản | Hệ thống tự sinh theo loại tài khoản, bạn có thể tự nhập theo ý mình |
| Số tài khoản      | 10 chữ số, hệ thống tự cấp                                           |
| Loại tài khoản    | Cá nhân, doanh nghiệp, hộ kinh doanh                                 |

Tên chủ tài khoản được sinh tự động theo loại tài khoản:

| Loại tài khoản | Định dạng tên                                  | Ví dụ                     |
| -------------- | ---------------------------------------------- | ------------------------- |
| Cá nhân        | Họ và tên ngẫu nhiên dạng tiếng Việt không dấu | `NGUYEN VAN A`            |
| Doanh nghiệp   | `CONG TY TNHH TEST` + chuỗi hex ngẫu nhiên     | `CONG TY TNHH TEST A1B2`  |
| Hộ kinh doanh  | `HO KINH DOANH TEST` + chuỗi hex ngẫu nhiên    | `HO KINH DOANH TEST C3D4` |

## Tài khoản sao chép từ Live

Chọn **Sao chép từ Live** để nhập nhanh cấu hình từ tài khoản thật. Tài khoản sao chép giữ thông tin từ tài khoản gốc, dùng để mô phỏng sát với cấu hình Live.

<Image src="/images/test-mode/them-tai-khoan-ngan-hang-test-mode-sao-chep-live.png" alt="Thêm mới tài khoản với chế độ Sao chép từ Live" caption="Thêm mới tài khoản với chế độ Sao chép từ Live" />

<Callout type="warn" title="Tài khoản sao chép từ Live chỉ đọc">
Tài khoản sao chép từ Live không cho phép tạo, xóa, hoặc bật/tắt VA. Có thể xóa bản sao khỏi Test mode mà không ảnh hưởng đến tài khoản gốc trên Live.
</Callout>

## Tiếp theo

* [Tạo VA](./tao-va): VA chính thức `SBSEPAY` và VA theo nội dung chuyển khoản, hỗ trợ theo từng ngân hàng
* [Mô phỏng giao dịch](./mo-phong-giao-dich): dùng tài khoản vừa tạo làm nguồn cho giao dịch mô phỏng
* [Hạn mức Test mode](./han-muc): tối đa 50 tài khoản ngân hàng, 100 VA mỗi tài khoản
