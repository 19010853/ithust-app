# Cấu hình mã thanh toán Test mode SePay

## Cấu hình mã thanh toán trong Test mode (chế độ thử nghiệm) SePay: bật nhận diện code, định nghĩa các cấu trúc tiền tố và độ dài hậu tố để SePay tự bóc tách mã từ nội dung giao dịch.

Cấu hình mã thanh toán trong Test mode (chế độ thử nghiệm) định nghĩa cách SePay tự bóc tách trường `code` từ nội dung chuyển khoản. Mỗi cấu trúc gồm một tiền tố (ví dụ `DH`) và độ dài hậu tố (ví dụ 3-10 ký tự). Khi mô phỏng giao dịch, hệ thống quét nội dung theo các cấu trúc đang hoạt động và gắn mã vào payload webhook.

<Callout type="info" title="Tóm tắt">
Bật/tắt nhận diện mã thanh toán toàn cục
Mỗi tài khoản công ty có thể tạo nhiều cấu trúc mã thanh toán (cấu trúc đầu tiên là mặc định, không xoá được)
Mỗi cấu trúc gồm: tiền tố, độ dài hậu tố tối thiểu/tối đa, loại ký tự, trạng thái
Cấu hình áp dụng cho 
Mô phỏng giao dịch
 và 
bộ lọc webhook
</Callout>

## Mở trang Cấu hình Test mode

Vào **Test mode** → **Cấu hình**.

<Image src="/images/test-mode/cau-hinh-ma-thanh-toan-test-mode.png" alt="Trang Cấu hình mã thanh toán trong Test mode" caption="Trang Cấu hình Test mode với phần Nhận diện mã thanh toán và Cấu trúc mã thanh toán" />

## Bật nhận diện mã thanh toán

Phần **Nhận diện mã thanh toán** ở đầu trang có hai lựa chọn:

| Trạng thái         | Tác dụng                                                                                       |
| ------------------ | ---------------------------------------------------------------------------------------------- |
| **Bật** (mặc định) | SePay quét nội dung chuyển khoản theo các mẫu đang hoạt động; trường `code` được điền nếu khớp |
| **Tắt**            | SePay không quét; trường `code` luôn rỗng dù nội dung có chứa mã hợp lệ                        |

Bộ lọc webhook **Chỉ gửi khi có mã thanh toán** chỉ có ý nghĩa khi mục này đang **Bật**.

## Trường trong mỗi cấu trúc

Mỗi cấu trúc là một thẻ có 4 trường + một công tắc trạng thái:

| Trường                  | Bắt buộc | Mô tả                                                                                                  |
| ----------------------- | -------- | ------------------------------------------------------------------------------------------------------ |
| Tiền tố                 | Có       | Phần đầu của mã (ví dụ `DH`, `HD`, `ORDER`). Tối đa 10 ký tự. Hệ thống tự đổi sang chữ hoa khi lưu.    |
| Độ dài hậu tố tối thiểu | Có       | Số ký tự tối thiểu sau tiền tố. Khoảng 1-30. Mặc định 3.                                               |
| Độ dài hậu tố tối đa    | Có       | Số ký tự tối đa sau tiền tố. Khoảng 1-30, phải ≥ giá trị tối thiểu. Mặc định 10.                       |
| Loại ký tự              | Có       | **Số nguyên** (chỉ chữ số 0-9) hoặc **Số và chữ** (chữ số và chữ cái A-Z).                             |
| Trạng thái              | Không    | Công tắc **Đang hoạt động** / **Ngưng hoạt động**. Chỉ cấu trúc đang hoạt động được dùng để nhận diện. |

Ô **Ví dụ** ngay trong thẻ tự cập nhật theo cấu hình hiện tại (ví dụ tiền tố `DH` + hậu tố 3 ký tự **Số nguyên** sinh ví dụ `DH111`).

<Image src="/images/test-mode/cau-hinh-cau-truc-ma-thanh-toan-test-mode.png" alt="Thẻ cấu trúc mã thanh toán Test mode" caption="Thẻ cấu trúc mã thanh toán với tiền tố, độ dài hậu tố, loại ký tự và trạng thái" />

## Thêm, sửa, xoá cấu trúc

| Thao tác           | Cách thực hiện                                                                                                        |
| ------------------ | --------------------------------------------------------------------------------------------------------------------- |
| Thêm cấu trúc mới  | Chọn **+ Thêm cấu trúc** ở cuối danh sách. Thẻ mới mở rộng sẵn để điền.                                               |
| Sửa cấu trúc       | Mở rộng thẻ, sửa các trường, chọn **Lưu cấu hình** ở cuối trang để áp dụng.                                           |
| Xoá cấu trúc       | Chọn biểu tượng xoá ở góc thẻ. **Cấu trúc đầu tiên (huy hiệu Cấu trúc mặc định) không xoá được**, chỉ có thể tắt.     |
| Tạm ngưng cấu trúc | Tắt công tắc **Đang hoạt động** trong thẻ rồi chọn **Lưu cấu hình**. Cấu trúc vẫn còn nhưng không tham gia nhận diện. |

Sau khi sửa, chọn nút **Lưu cấu hình** ở cuối trang. Hệ thống hiển thị thông báo "Lưu cấu hình thành công" khi xong.

## Cách SePay nhận diện mã từ nội dung

Khi mô phỏng giao dịch (hoặc khi giao dịch thật về trên Live), hệ thống quét nội dung chuyển khoản theo các cấu trúc đang hoạt động, theo thứ tự khai báo. Quy trình:

1. Lấy cấu trúc đầu tiên (đang hoạt động).
2. Tìm trong nội dung chuỗi khớp với `<tiền tố><số ký tự từ tối thiểu đến tối đa thuộc loại ký tự>`. Tiền tố không phân biệt hoa/thường.
3. Nếu khớp, gắn chuỗi đó vào trường `code` của payload webhook và dừng.
4. Nếu không khớp, thử cấu trúc tiếp theo. Hết cấu trúc mà không khớp → `code` rỗng.

| Cấu trúc                                 | Nội dung chuyển khoản          | `code` trích được |
| ---------------------------------------- | ------------------------------ | ----------------- |
| Tiền tố `DH`, hậu tố 3-10, **Số nguyên** | `DH123456 thanh toan don hang` | `DH123456`        |
| Tiền tố `DH`, hậu tố 3-10, **Số nguyên** | `dh999 thanh toan`             | `DH999`           |
| Tiền tố `DH`, hậu tố 3-10, **Số nguyên** | `Chuyen tien sinh hoat`        | (rỗng)            |
| Tiền tố `HD`, hậu tố 4-6, **Số và chữ**  | `HD12AB chuyen khoan`          | `HD12AB`          |

## Khác biệt với Live

| Khía cạnh             | Live                                                                   | Test mode                                      |
| --------------------- | ---------------------------------------------------------------------- | ---------------------------------------------- |
| Vị trí                | **Cấu hình Công ty** → **Cấu hình chung** → **Cấu trúc mã thanh toán** | **Test mode** → **Cấu hình**                   |
| Độ dài tiền tố tối đa | 5 ký tự                                                                | 10 ký tự                                       |
| Hành vi nhận diện     | Áp dụng cho giao dịch ngân hàng thật                                   | Áp dụng cho giao dịch mô phỏng trong Test mode |
| Số cấu trúc           | Không giới hạn                                                         | Không giới hạn                                 |

Cấu hình Live và Test mode tách biệt: chỉnh sửa trong Test mode không ảnh hưởng tới Live và ngược lại.

## Tiếp theo

* [Mô phỏng giao dịch](./mo-phong-giao-dich): kiểm tra mã thanh toán nhận diện trong payload webhook
* [Tạo webhook](./tao-webhook): bật bộ lọc **Chỉ gửi khi có mã thanh toán** để webhook bỏ qua giao dịch không có mã
* [Cấu hình mã thanh toán cho Live](/vi/sepay-webhooks/cau-hinh-ma-thanh-toan): cấu hình tương tự cho môi trường thật
