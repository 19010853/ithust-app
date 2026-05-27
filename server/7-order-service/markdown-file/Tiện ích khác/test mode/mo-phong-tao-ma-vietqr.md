# Mô phỏng tạo mã VietQR trong Test mode SePay

## Mô phỏng tạo mã VietQR trong Test mode (chế độ thử nghiệm) SePay: sinh QR từ tài khoản và VA Test mode, mô phỏng quét QR và xác nhận chuyển khoản ngay trên giao diện.

Mô phỏng tạo mã VietQR trong Test mode (chế độ thử nghiệm) sinh ra mã QR từ tài khoản và VA Test mode, kèm phần mô phỏng quét QR và xác nhận chuyển khoản ngay trong giao diện. Dùng để kiểm tra luồng hiển thị QR trên trang thanh toán của bạn trước khi đưa lên Live.

<Callout type="info" title="Tóm tắt">
QR tạo từ tài khoản ngân hàng và VA trong Test mode (không liên quan tài khoản Live)
Hỗ trợ ba mẫu hiển thị: 
Thu gọn
, 
Chỉ QR
, 
Đầy đủ
Có nút 
Mô phỏng chuyển khoản
 giả lập việc khách quét QR và bấm xác nhận
Trang trả về cả ảnh QR (PNG), URL QR và đoạn code tích hợp cho nhiều ngôn ngữ
</Callout>

## Mở trang Mô phỏng tạo mã VietQR

Vào **Test mode** → **Mô phỏng tạo mã VietQR**.

<Image src="/images/test-mode/trang-mo-phong-tao-ma-vietqr-test-mode.png" alt="Trang Mô phỏng tạo mã VietQR Test mode" caption="Trang Mô phỏng tạo mã VietQR Test mode với khu vực điền dữ liệu và khung xem trước QR" />

## Các trường trong form

| Trường                | Bắt buộc     | Mô tả                                                                                                                                                               |
| --------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tài khoản ngân hàng   | Có           | Chọn từ danh sách tài khoản đã tạo trong Test mode (tạo mới hoặc sao chép từ Live).                                                                                 |
| Tài khoản ảo (VA)     | Có điều kiện | Hiển thị sau khi chọn tài khoản. **Bắt buộc** với OCB, KienLongBank, MSB (mọi loại tài khoản) và BIDV (cá nhân, hộ kinh doanh). Tuỳ chọn với các ngân hàng còn lại. |
| Số tiền               | Không        | Tính theo VND, tối thiểu 1.000, tối đa 499.000.000. Nhập theo định dạng `100000` hoặc `100.000`. Bỏ trống thì khách tự nhập khi quét QR.                            |
| Nội dung chuyển khoản | Không        | Tối đa 200 ký tự. Bỏ dấu tự động. Khi gõ, hệ thống nhận diện mã thanh toán theo [cấu hình mã](./cau-hinh) và hiển thị chip kết quả ngay phía trên ô.                |
| Mẫu QR                | Có           | **Thu gọn** (mặc định), **Chỉ QR**, hoặc **Đầy đủ**. Quyết định kiểu hiển thị QR và phần thông tin tài khoản kèm theo.                                              |

<Callout type="info" title="Phím tắt mã thanh toán">
Khi đã có mẫu mã thanh toán đang hoạt động ở 
Cấu hình
, trang QR hiển thị các nút phím tắt phía trên ô 
Nội dung chuyển khoản
. Bấm phím tắt để chèn nhanh mã hợp lệ vào nội dung.
</Callout>

<Image src="/images/test-mode/form-mo-phong-tao-ma-viet-qr-test-mode.png" alt="Form mô phỏng tạo mã VietQR Test mode đã điền đủ trường" caption="Form đã điền với chip xanh nhận diện mã thanh toán" />

## Khi nào VA bắt buộc

Một số ngân hàng yêu cầu QR phải gắn VA. Form khoá nút xem trước QR cho tới khi chọn VA:

| Ngân hàng             | Loại tài khoản         | VA       |
| --------------------- | ---------------------- | -------- |
| OCB                   | Mọi loại               | Bắt buộc |
| KienLongBank          | Mọi loại               | Bắt buộc |
| MSB                   | Mọi loại               | Bắt buộc |
| BIDV                  | Cá nhân, hộ kinh doanh | Bắt buộc |
| BIDV                  | Doanh nghiệp           | Tuỳ chọn |
| Các ngân hàng còn lại | Mọi loại               | Tuỳ chọn |

Nút **Quy tắc theo ngân hàng** trên trang mở cửa sổ chi tiết, liệt kê đầy đủ điều kiện VA, quy tắc nội dung chuyển khoản (ví dụ VietinBank yêu cầu tiền tố `SEVQR`), và quy tắc tham số URL QR.

Xem chi tiết quy tắc từng ngân hàng và đầy đủ tham số: [Tạo mã VietQR](/vi/tien-ich-khac/tao-qr-code).

## Xem trước và mô phỏng quét QR

Khung bên phải tự cập nhật mỗi khi bạn đổi giá trị trong form:

* **Ảnh QR** ở giữa
* Bên dưới ảnh là bảng thông tin gồm tên ngân hàng, số tài khoản (hoặc VA), tên chủ tài khoản, số tiền, nội dung chuyển khoản
* Nút **Mô phỏng chuyển khoản** ở cuối khung

Bấm **Mô phỏng chuyển khoản** mở khung điện thoại giả lập:

1. Màn camera hiển thị ảnh QR vừa tạo
2. Bấm để xác nhận quét, chuyển sang màn xác nhận chuyển khoản với các trường điền sẵn (số tiền, nội dung) — vẫn cho phép chỉnh sửa
3. Bấm **Chuyển khoản** để hoàn tất mô phỏng

Sau khi mô phỏng, một giao dịch mới được ghi nhận đúng như khi mô phỏng từ trang [Mô phỏng giao dịch](./mo-phong-giao-dich). Webhook đang khớp tài khoản đó được kích hoạt.

<Image src="/images/test-mode/mo-phong-quet-ma-viet-qr-chuyen-khoan-test-mode.png" alt="Khung điện thoại mô phỏng quét mã VietQR Test mode" caption="Mô phỏng quét và xác nhận chuyển khoản qua mã VietQR Test mode" />

## Khác biệt với QR Live

| Khía cạnh                        | Live                              | Test mode                                                              |
| -------------------------------- | --------------------------------- | ---------------------------------------------------------------------- |
| Tài khoản nguồn                  | Tài khoản ngân hàng thật          | Tài khoản ngân hàng/VA giả lập                                         |
| Khi quét bằng app ngân hàng thật | Truy vấn được thông tin thụ hưởng | Không truy vấn được thông tin thụ hưởng vì dùng tài khoản/VA giả lập   |
| Chuyển khoản                     | Chuyển khoản thật, không mô phỏng | **Mô phỏng chuyển khoản** ngay trên giao diện, không chuyển khoản thật |
| Mục đích                         | Nhận tiền thật                    | Kiểm tra luồng hiển thị mã QR và chuyển khoản trước khi đưa lên Live   |

<Callout type="warn" title="QR Test mode không nhận tiền thật">
Mã QR sinh ra trong Test mode dùng tham số tài khoản Test mode, không liên kết với tài khoản ngân hàng thật. Quét bằng app ngân hàng thật sẽ báo lỗi tài khoản không tồn tại. Chỉ dùng nút 
Mô phỏng chuyển khoản
 để giả lập giao dịch.
</Callout>

## Tiếp theo

* [Mô phỏng giao dịch](./mo-phong-giao-dich): tạo giao dịch trực tiếp không qua QR
* [Cấu hình mã thanh toán](./cau-hinh): định nghĩa các mẫu mã để hệ thống nhận diện trong nội dung chuyển khoản
