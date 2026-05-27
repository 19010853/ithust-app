# Tạo webhook trong Test mode SePay

## Tạo webhook trong Test mode (sandbox) SePay qua 3 bước Cơ bản, Tài khoản và Bảo mật. Cùng kiểu xác thực với Live, SSL tắt, chỉ chọn được tài khoản Test mode.

Webhook trong Test mode (chế độ thử nghiệm) dùng cùng luồng tạo, cùng kiểu xác thực và cùng cơ chế gửi như Live. Test mode rút gọn từ 4 còn **3 bước** (ẩn bước **Cảnh báo**) và giới hạn tài khoản ngân hàng trong phạm vi Test mode.

## Tạo webhook Test mode tại Dashboard

Tạo tại **Test mode** → **Tích hợp Webhook** → **Thêm webhook**. Khung tạo trượt từ phía phải, đi qua ba bước theo thứ tự:

1. **Cơ bản**: tên, URL, loại giao dịch, định dạng dữ liệu, điều kiện gửi lại khi lỗi
2. **Tài khoản**: chọn tài khoản nguồn, bộ lọc mã thanh toán
3. **Bảo mật**: chọn phương thức xác thực và điền cấu hình tương ứng

Sau bước 3 bấm **Thêm** ở cuối khung để lưu.

<Image src="/images/test-mode/danh-sach-webhook-test-mode.png" alt="Trang Webhook trong Test mode" caption="Trang Webhook trong Test mode với nút Thêm webhook" />

## Bước 1: Cơ bản

| Trường                             | Bắt buộc | Mô tả                                                                                                                                                                  |
| ---------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tên webhook                        | Có       | Tối đa 300 ký tự. Dùng để phân biệt nhiều webhook trong danh sách. Ví dụ: `Xác thực thanh toán`.                                                                       |
| URL nhận webhook                   | Có       | Tối đa 300 ký tự. SePay gửi POST dữ liệu giao dịch tới URL này. Test mode chấp nhận HTTP và HTTPS với chứng chỉ tự ký.                                                 |
| Loại giao dịch                     | Có       | **Tiền vào** (mặc định), **Tiền ra**, hoặc **Tất cả**.                                                                                                                 |
| Định dạng dữ liệu                  | Có       | **JSON** (`application/json`, khuyến nghị), **Form (hỗ trợ tệp đính kèm)** (`multipart/form-data`), hoặc **Form (URL-encoded)** (`application/x-www-form-urlencoded`). |
| Tự động gửi lại khi server trả lỗi | Không    | Bật để SePay tự động retry khi endpoint trả HTTP ngoài 200-299. Tối đa 7 lần theo lịch trình Fibonacci.                                                                |

<Image src="/images/test-mode/them-webhook-test-mode-buoc-co-ban.png" alt="Bước Cơ bản khi tạo webhook Test mode" caption="Bước Cơ bản: tên, URL, loại giao dịch, định dạng, retry" />

## Bước 2: Tài khoản

### Tài khoản ngân hàng

| Lựa chọn                        | Mô tả                                                                                                         |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| **Tất cả tài khoản** (mặc định) | Webhook nhận mọi giao dịch từ tất cả tài khoản Test mode.                                                     |
| **Tuỳ chọn**                    | Mở khu vực chọn cây tài khoản (cột trái = chưa chọn, cột phải = đã chọn). Có thể tìm kiếm và mở rộng/thu gọn. |

### Dùng để xác thực thanh toán

Bật toggle này khi webhook dùng để xác nhận đơn hàng đã thanh toán. Khi bật, hiện thêm hai tuỳ chọn lọc:

| Tuỳ chọn                         | Mô tả                                                                                                                        |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| **Chỉ gửi khi có mã thanh toán** | Webhook chỉ gửi khi nội dung giao dịch chứa mã thanh toán (cấu hình mã tại **Cấu hình chung → Cấu trúc mã thanh toán**).     |
| **Lọc theo mã thanh toán**       | Multi-select tiền tố: webhook chỉ gửi khi mã thanh toán bắt đầu bằng một trong các tiền tố đã chọn. Để trống để nhận tất cả. |

<Image src="/images/test-mode/them-webhook-test-mode-buoc-tai-khoan.png" alt="Bước Tài khoản và Bộ lọc khi tạo webhook Test mode" caption="Bước Tài khoản: chọn cây tài khoản và cấu hình bộ lọc mã thanh toán" />

## Bước 3: Bảo mật

Bước này hiển thị banner khuyến nghị: "Sử dụng HMAC-SHA256 để xác minh dữ liệu webhook không bị thay đổi và chống giả mạo."

| Phương thức xác thực          | Cấu hình thêm                                                                                                                                                     |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Không xác thực** (mặc định) | Không có. Phù hợp cho test nhanh, không nên dùng cho endpoint thật.                                                                                               |
| **API Key**                   | Trường **API Key**. SePay gửi header `Authorization: Apikey <API_KEY>`.                                                                                           |
| **HMAC-SHA256** (khuyến nghị) | Trường **Secret Key** (hỗ trợ nút tạo khoá ngẫu nhiên). SePay ký payload và gửi chữ ký trong header `X-SePay-Signature`. Secret key không rời khỏi máy chủ SePay. |
| **OAuth 2.0**                 | Ba trường: **Access Token URL**, **Client ID**, **Client Secret**. SePay lấy bearer token từ Access Token URL trước mỗi lần gửi.                                  |

Cấu hình chi tiết từng phương thức và cách verify ở phía endpoint: [Xác thực webhook](/vi/sepay-webhooks/xac-thuc).

<Image src="/images/test-mode/them-webhook-test-mode-buoc-bao-mat.png" alt="Bước Bảo mật khi tạo webhook Test mode với HMAC-SHA256" caption="Bước Bảo mật: chọn phương thức xác thực và điền cấu hình" />

## Khác biệt so với webhook Live

| Khía cạnh                       | Live                      | Test mode                                       |
| ------------------------------- | ------------------------- | ----------------------------------------------- |
| Số bước tạo webhook             | 4 (có bước **Cảnh báo**)  | 3 (ẩn bước Cảnh báo)                            |
| Xác thực SSL của endpoint       | Bắt buộc chứng chỉ hợp lệ | Tắt (chấp nhận HTTP và chứng chỉ tự ký)         |
| Tài khoản ngân hàng có thể chọn | Tài khoản Live            | Chỉ tài khoản ngân hàng Test mode               |
| Số webhook tối đa               | Không giới hạn            | Có hạn mức (xem [Hạn mức Test mode](./han-muc)) |

<Callout type="info" title="SSL tắt trong Test mode">
Test mode tắt xác thực SSL để thuận tiện test trên localhost hoặc server dev có chứng chỉ tự ký. Trước khi đưa webhook lên Live, đảm bảo endpoint có chứng chỉ HTTPS hợp lệ.
</Callout>

## Tiếp theo

* [Mô phỏng giao dịch](./mo-phong-giao-dich): kích hoạt webhook bằng giao dịch mô phỏng
* [So sánh với Live](/vi/sepay-webhooks/test-mode/so-sanh-voi-live): khác biệt về log gửi, cơ chế retry, payload
* [Hạn mức Test mode](./han-muc): tối đa 50 webhook
* [Tài khoản ngân hàng](./tai-khoan-ngan-hang): cần ít nhất một tài khoản Test mode trước khi tạo webhook
