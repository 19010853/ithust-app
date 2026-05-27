# Cách mô phỏng giao dịch ngân hàng SePay

## Mô phỏng giao dịch ngân hàng SePay trong Test mode (sandbox) để test webhook mà không cần chuyển tiền thật. Form mô phỏng, pipeline xử lý, hạn mức.

Mô phỏng giao dịch trong Test mode (chế độ thử nghiệm) tạo một bản ghi giao dịch giả lập trên tài khoản ngân hàng đang chọn, cập nhật số dư cộng dồn nếu phù hợp, sau đó đẩy webhook vào hàng đợi đúng như khi tiền vào tài khoản thật. Bạn dùng nó để kiểm tra logic webhook, mã thanh toán, lọc theo VA mà không cần chuyển tiền thật.

<Callout type="info" title="Chỉ khả dụng trong Test mode">
Tính năng 
Mô phỏng giao dịch
 chỉ bật khi đang ở Test mode (chế độ thử nghiệm). Bật 
Test mode
 trên sidebar 
my.sepay.vn
 để truy cập. Live không có nút này.
</Callout>

## Mở mô phỏng giao dịch Test mode

1. Tại sidebar Test mode, nhấp vào **Mô phỏng giao dịch**.
2. Mô phỏng mở ra, bắt đầu chọn tài khoản và điền dữ liệu.

<Image src="/images/test-mode/trang-mo-phong-giao-dich-test-mode.png" alt="Trang Mô phỏng giao dịch trong Test mode SePay" caption="Trang Mô phỏng giao dịch trong Test mode với nút Mô phỏng giao dịch ở góc trên bên phải" />

## Các trường trong form

| Trường                | Bắt buộc     | Mô tả                                                                                                                                                                                                                           |
| --------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tài khoản ngân hàng   | Có           | Chọn từ danh sách tài khoản đã tạo trong Test mode. Nếu là tài khoản sao chép từ Live, hệ thống hiển thị cảnh báo nhắc rằng giao dịch chỉ là mô phỏng, không ảnh hưởng tài khoản gốc.                                           |
| Tài khoản ảo (VA)     | Có điều kiện | Hiển thị sau khi chọn tài khoản. Bắt buộc với OCB, KienLongBank, MSB và BIDV (cá nhân, hộ kinh doanh); tùy chọn với các ngân hàng còn lại.                                                                                      |
| Loại giao dịch        | Có           | **Tiền vào** (mặc định) hoặc **Tiền ra**. Quyết định webhook nào khớp theo cấu hình **Loại giao dịch** (Có tiền vào / Có tiền ra).                                                                                              |
| Số tiền               | Có           | Tính theo VND, tối thiểu 1.000, tối đa 499.000.000.                                                                                                                                                                             |
| Nội dung chuyển khoản | Không        | Tối đa 200 ký tự. Bỏ trống thì hệ thống tự sinh nội dung dạng `Giao dich sandbox` kèm thời điểm hiện tại. Khi gõ, hệ thống nhận diện mã thanh toán và mã VA theo nội dung chuyển khoản, hiển thị chip kết quả ngay phía trên ô. |
| Số tham chiếu         | (tự sinh)    | Hệ thống tự sinh chuỗi tham chiếu bắt đầu bằng `SB`. Bạn không cần điền.                                                                                                                                                        |
| Thời điểm giao dịch   | (tự sinh)    | Lấy thời điểm hiện tại theo giờ Việt Nam (UTC+7).                                                                                                                                                                               |

<Image src="/images/test-mode/form-mo-phong-giao-dich-test-mode.png" alt="Form Mô phỏng giao dịch đã điền với chip nhận diện mã thanh toán" caption="Form mô phỏng đã điền, chip xanh phía trên nội dung là mã thanh toán nhận diện được" />

<Callout type="info" title="Cấu hình mã thanh toán">
Nếu bạn dùng tiền tố mã thanh toán (ví dụ 
`DH`
, 
`HD`
), cấu hình tại 
Công ty → Cấu hình chung → Cấu trúc mã thanh toán
. Form mô phỏng dùng cấu hình này để nhận diện mã trong nội dung chuyển khoản theo thời gian thực.
</Callout>

## Quy trình xử lý khi bấm gửi

Sau khi bấm **Gửi giao dịch thử**, SePay chạy qua bốn bước sau và trả về kết quả ngay trong form:

1. **Nhận giao dịch**: kiểm tra hạn mức ngày, ghi bản ghi giao dịch vào tài khoản ngân hàng đã chọn.
2. **Bộ lọc giao dịch**: mỗi webhook đang bật lần lượt qua các bộ lọc đã cấu hình (Loại giao dịch, Chỉ gửi khi có mã thanh toán, Tiền tố mã thanh toán). Webhook nào qua thì được đưa vào hàng đợi gửi; webhook nào bị chặn được ghi log với lý do bỏ qua.
3. **Khớp tài khoản ảo (VA)**: nếu nội dung hoặc trường VA khớp một VA đang hoạt động, gắn mã VA vào trường `subAccount` của payload. Không khớp thì để rỗng.
4. **Nhận diện mã thanh toán**: phân tích nội dung chuyển khoản theo các tiền tố đã cấu hình, gán mã vào trường `code` của payload. Không khớp thì rỗng.

<Image src="/images/test-mode/mo-phong-luong-xu-ly-giao-dich-tets-mode.png" alt="Pipeline 4 bước xử lý giao dịch mô phỏng" caption="Bốn bước xử lý: Nhận giao dịch → Bộ lọc → Khớp VA → Nhận diện mã" />

## Kết quả mô phỏng

Sau khi xử lý, form hiển thị danh sách webhook đã đánh giá, mỗi webhook gồm:

* **Trạng thái**: `Gửi` (đã đưa vào hàng đợi) hoặc `Bỏ qua` (bị bộ lọc chặn).
* **Lý do bỏ qua** (nếu có):

| Lý do hiển thị                                    | Khi nào xảy ra                                                                                                                            |
| ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Loại giao dịch không phù hợp với cấu hình webhook | Webhook chỉ nhận **Có tiền vào** nhưng giao dịch là tiền ra (hoặc ngược lại).                                                             |
| Nội dung không chứa mã thanh toán                 | Webhook bật **Chỉ gửi khi có mã thanh toán** nhưng giao dịch không có mã.                                                                 |
| Mã thanh toán không khớp tiền tố cho phép         | Webhook giới hạn ở danh sách **Tiền tố mã thanh toán** nhưng mã thanh toán nhận diện được không bắt đầu bằng tiền tố nào trong danh sách. |

Webhook đã đẩy vào hàng đợi sẽ được gửi bất đồng bộ. Kết quả gửi (HTTP status, response body, thời gian xử lý) xem được trong trang chi tiết giao dịch sau khi trang tải lại danh sách.

<Image src="/images/test-mode/chi-tiet-giao-dich-gia-lap-test-mode.png" alt="Trang chi tiết giao dịch hiển thị log gửi webhook" caption="Log webhook trong chi tiết giao dịch: status, thời gian, payload, nút Phát lại" />

<Callout type="info" title="Phát lại webhook">
Trong trang chi tiết giao dịch, mỗi log webhook có nút 
Phát lại
 để gửi lại payload mà bỏ qua bộ lọc.
</Callout>

## Payload webhook

Mỗi webhook khớp nhận POST JSON với cùng cấu trúc như Live:

```json
{
  "gateway": "MBBank",
  "transactionDate": "2026-01-15 10:30:00",
  "accountNumber": "0123456789",
  "subAccount": "SBSEPAYX9KA2B7MN4QR",
  "code": "DH123456",
  "content": "DH123456 thanh toan don hang",
  "transferType": "in",
  "description": "NGUYEN VAN A chuyen tien",
  "transferAmount": 100000,
  "referenceCode": "SB1A2B3C4D5E",
  "accumulated": 5000000,
  "id": 12345
}
```

| Trường            | Mô tả                                                         |
| ----------------- | ------------------------------------------------------------- |
| `gateway`         | Tên ngân hàng của tài khoản đang mô phỏng                     |
| `transactionDate` | Thời điểm tạo giao dịch (UTC+7)                               |
| `accountNumber`   | Số tài khoản ngân hàng                                        |
| `subAccount`      | Mã VA nếu khớp; rỗng nếu giao dịch không gắn VA               |
| `code`            | Mã thanh toán nhận diện được; rỗng nếu không khớp tiền tố nào |
| `content`         | Nội dung chuyển khoản (do bạn nhập hoặc tự sinh)              |
| `transferType`    | `in` cho Tiền vào, `out` cho Tiền ra                          |
| `transferAmount`  | Số tiền (VND), luôn dương                                     |
| `referenceCode`   | Số tham chiếu tự sinh, bắt đầu bằng `SB`                      |
| `accumulated`     | Số dư cộng dồn sau giao dịch (xem mục bên dưới)               |
| `id`              | ID giao dịch trong SePay                                      |

## Số dư cộng dồn (`accumulated`)

`accumulated` chỉ thay đổi khi tài khoản đang mô phỏng dùng kết nối có theo dõi số dư:

| Loại kết nối                          | Cập nhật `accumulated`?          |
| ------------------------------------- | -------------------------------- |
| SMS                                   | Có                               |
| API VietinBank cá nhân, hộ kinh doanh | Có                               |
| API TPBank                            | Có                               |
| Các kết nối API khác                  | Không (giữ giá trị từ tài khoản) |

Khi cập nhật:

* Tiền vào: `accumulated` mới = `accumulated` cũ + `transferAmount`
* Tiền ra: `accumulated` mới = max(0, `accumulated` cũ − `transferAmount`)

## Lọc webhook theo VA

Khi giao dịch có gắn VA, các webhook bật **Chỉ nhận thông báo từ các giao dịch của tài khoản ảo (VA)** mới khớp. Đây là cách thử nhanh logic VA: tạo VA → mô phỏng giao dịch chọn VA đó → kiểm tra webhook chỉ nhận đúng giao dịch có VA.

## Hạn mức mô phỏng giao dịch

Mỗi tài khoản công ty được mô phỏng tối đa **500 giao dịch mỗi ngày**. Hạn mức reset lúc **00:00 giờ Việt Nam (UTC+7)**. Form hiển thị thanh `Đã dùng: X/500` ở đầu modal và khóa nút gửi khi đã hết quota.

Xóa giao dịch mô phỏng sẽ trả lại quota cho ngày đó.

## Tiếp theo

* [Tạo VA Test mode](./tao-va): tạo tài khoản ảo (VA) trước rồi mô phỏng giao dịch với VA
* [Bắt đầu nhanh với Webhook trong Test mode](/vi/sepay-webhooks/test-mode/bat-dau-nhanh)
