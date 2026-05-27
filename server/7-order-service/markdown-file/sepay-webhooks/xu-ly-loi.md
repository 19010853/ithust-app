# Xử lý lỗi khi tích hợp webhook

## Lịch retry tự động, cách chẩn đoán khi webhook không gửi, và các câu hỏi thường gặp về thứ tự sự kiện, IP, phát lại và giới hạn.

Khi endpoint của bạn lỗi, SePay tự gửi lại theo lịch riêng. Bài này tổng hợp lịch retry, cách tự chẩn đoán khi webhook không gửi, và các câu hỏi hay gặp.

## Lịch retry

Khi webhook bật "Tự động gửi lại khi server trả lỗi", SePay thử lại nếu:

* Không kết nối được endpoint (DNS, connection refused, timeout)
* Server trả HTTP status ngoài 200-299

Khoảng cách giữa các lần tăng dần theo Fibonacci:

| Lần         | Chờ     | Tổng    |
| ----------- | ------- | ------- |
| 1 (ban đầu) | ngay    | 0 phút  |
| 2           | 1 phút  | 1 phút  |
| 3           | 1 phút  | 2 phút  |
| 4           | 2 phút  | 4 phút  |
| 5           | 3 phút  | 7 phút  |
| 6           | 5 phút  | 12 phút |
| 7           | 8 phút  | 20 phút |
| 8 (cuối)    | 13 phút | 33 phút |

Tổng cộng 8 lần gửi (1 lần đầu cộng 7 lần retry), kéo dài khoảng 33 phút nếu tất cả đều thất bại. Webhook khi đó được đánh dấu Failed và SePay gửi cảnh báo (nếu bạn đã bật). Webhook cũ hơn 5 giờ sẽ không được cron quét retry tiếp, đây là vùng an toàn dự phòng, bình thường không tới mức này vì 33 phút đã kết thúc trước rồi.

<Callout type="tip" title="Mẹo endpoint nhanh">
Trả 200 ngay khi nhận được, rồi đẩy payload vào queue xử lý sau. Đừng chặn response khi đang xử lý nặng.
</Callout>

## Phân loại lỗi

### Lỗi kết nối

| Lỗi                | Là gì                             | Sửa thế nào                                                         |
| ------------------ | --------------------------------- | ------------------------------------------------------------------- |
| DNS Error          | Không tìm thấy domain             | Kiểm tra URL, DNS                                                   |
| Connection Refused | Server từ chối                    | Kiểm tra server chạy chưa, port, firewall                           |
| Timeout            | Quá 30 giây không phản hồi        | Tối ưu endpoint, trả 200 trước rồi xử lý sau                        |
| SSL Error          | Chứng chỉ hoặc chuỗi CA có vấn đề | Kiểm tra chứng chỉ còn hạn, CA chain đầy đủ, không dùng self-signed |

### Lỗi HTTP

| Status  | Là gì                 | Sửa thế nào                                   |
| ------- | --------------------- | --------------------------------------------- |
| 401     | Sai xác thực          | Kiểm tra API Key, Secret Key                  |
| 403     | Bị chặn               | Thêm [IP SePay](/vi/dia-chi-ip) vào whitelist |
| 404     | Sai URL               | Kiểm tra đường dẫn (chú ý hoa thường)         |
| 405     | Sai method            | Endpoint phải nhận POST                       |
| 500     | Lỗi server            | Kiểm tra logs                                 |
| 502/503 | Server không sẵn sàng | Bảo trì hoặc quá tải                          |

### Tốc độ phản hồi

| Thời gian | Nhận xét      |
| --------- | ------------- |
| \< 1 giây | Tốt           |
| 1-5 giây  | Nên cải thiện |
| > 5 giây  | Dễ bị timeout |

### Mã cURL

Lịch sử gửi ghi `error_code` (mã cURL) + `response_time_ms` mỗi lần gửi.

| Mã | Lỗi                | Ghi chú                                  |
| -- | ------------------ | ---------------------------------------- |
| 6  | DNS                | Sai domain hoặc DNS chưa trỏ             |
| 7  | Connection Refused | Server tắt, sai port, firewall chặn      |
| 28 | Timeout            | Phản hồi quá 30 giây                     |
| 35 | SSL                | Lỗi bắt tay TLS                          |
| 51 | SSL Cert           | Chứng chỉ không hợp lệ                   |
| 55 | Send Error         | Mất kết nối khi gửi                      |
| 56 | Receive Error      | Mất kết nối khi nhận                     |
| 60 | CA Cert            | Không xác minh được chuỗi chứng chỉ (CA) |

## Chẩn đoán webhook không gửi

Đã bật webhook nhưng server không nhận request? Đi từ trên xuống, lỗi thường ở mấy bước đầu.

### 1. Webhook còn bật

Dashboard → **[Webhooks](https://my.sepay.vn/webhooks)**, cột **Trạng thái** phải là **Bật**. Lưu webhook không tự bật lại nếu bạn đã tắt, kiểm tra lại công tắc sau mỗi lần sửa.

### 2. URL có gọi được không

Bấm **⋯** → **Gửi thử**. SePay gửi payload mẫu và kết quả hiện ra ngay.

| Kết quả            | Nguyên nhân thường gặp                          |
| ------------------ | ----------------------------------------------- |
| Thành công         | URL ổn, qua bước 3                              |
| DNS Error          | Domain chưa trỏ, hoặc sai chính tả URL          |
| Connection Refused | Server chưa lắng nghe port đó                   |
| Timeout            | Firewall chặn, hoặc server quá chậm             |
| SSL Error          | Chứng chỉ hết hạn hoặc không hợp lệ             |
| HTTP 4xx / 5xx     | Server nhận được nhưng trả lỗi, mở chi tiết log |

### 3. Loại sự kiện có khớp

Webhook có 3 loại: **Tất cả** (cả vào cả ra), **Chỉ tiền vào**, **Chỉ tiền ra**.

Webhook **Chỉ tiền vào** mà test rút tiền → không gửi.

**Chỉ tiền ra** thêm ràng buộc: chỉ hỗ trợ Sacombank, TPBank, VietinBank, và phải dùng [TKP](./tai-khoan-ngan-hang#hai-loai-va) (VA nội dung, không dùng VA chính thức). Xem [Lưu ý khi chọn Chỉ tiền ra](./tai-khoan-ngan-hang#luu-y-khi-chon-chi-tien-ra).

### 4. Tài khoản ngân hàng có trong danh sách

Mở webhook → tab **Tài khoản**.

Chế độ **Tất cả tài khoản**: mọi tài khoản đều kích hoạt webhook.

Chế độ **Chọn cụ thể**: tài khoản phát sinh giao dịch phải có trong cột **Đã chọn**.

<Callout type="warn" title="Tài khoản mới không tự thêm">
Tài khoản liên kết SAU KHI tạo webhook không tự có trong danh sách tuỳ chọn. Mở webhook, thêm tay rồi lưu.
</Callout>

### 5. Cấu hình VA

Mỗi tài khoản trong danh sách có 3 chế độ VA:

* **Tất cả VA**: nhận mọi VA, kể cả VA tạo sau.
* **Chỉ VA được chọn**: chỉ khi giao dịch qua VA trong danh sách tick.
* **Không nhận VA**: bỏ qua mọi giao dịch qua VA.

Giao dịch đi qua VA? Kiểm tra chế độ:

* **Không nhận VA**: webhook bỏ qua, đổi chế độ.
* **Chỉ VA được chọn**: VA đó đã tick chưa?

Ngân hàng chỉ hỗ trợ VA (BIDV, MSB, KienlongBank, OCB) không có tài khoản chính, bắt buộc phải có VA.

### 6. Mã thanh toán

Nếu **Chỉ gửi khi có mã thanh toán** bật, giao dịch phải có `code` nhận diện được. Xem [Cấu hình mã thanh toán](https://my.sepay.vn/company/configuration) cho mẫu công ty bạn.

Có bộ lọc **Lọc theo mã thanh toán** (tiền tố) thì mã phải bắt đầu bằng một trong các tiền tố đó.

Test nhanh: tắt công tắc này, chuyển lại khoản test.

### 7. Server trả về gì

Mở **Lịch sử gửi** → dòng mới nhất → tab **Response**.

Trả HTTP 200/201 với body `{"success": true}` mới tính thành công. Khác đi bị đánh dấu thất bại dù URL nhận được request. Chi tiết: [Phản hồi hợp lệ](./tich-hop-webhook#phan-hoi-hop-le).

### 8. Đang bị retry ngầm

Nếu server thỉnh thoảng sập hoặc chậm, SePay sẽ retry. Mỗi lần retry tạo một dòng riêng trong Lịch sử gửi.

Nếu thấy 8 dòng liên tiếp cùng `id` và đều Failed, nghĩa là giao dịch đó đã mất. Dùng [Sự cố](./giam-sat#su-co) để tìm tất cả giao dịch mất và gửi lại.

### 9. OAuth 2.0 lỗi xác thực

Với OAuth 2.0, SePay phải gọi token endpoint trước rồi mới gọi đến webhook URL kèm Bearer token. Nếu token endpoint hỏng, webhook URL **sẽ không nhận được request nào**. Lúc debug bạn cần nhìn cả log token, không chỉ log webhook.

#### Chẩn đoán OAuth 2.0

OAuth 2.0 có thể hỏng ở 5 chỗ. Mở **Lịch sử gửi** xem log để xác định:

| Chỗ hỏng                       | Biểu hiện trong log                                       | Hướng kiểm tra                                                               |
| ------------------------------ | --------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Không gọi được token endpoint  | DNS Error / Timeout / Connection Refused ở bước lấy token | URL token online? Firewall chặn IP SePay?                                    |
| Token endpoint trả sai status  | HTTP 4xx/5xx từ URL token                                 | Endpoint phải trả 200                                                        |
| Token endpoint body sai format | "Phản hồi OAuth không đúng định dạng"                     | Phải có `access_token` (dạng chuẩn) hoặc `data.accessToken` (dạng tùy chỉnh) |
| Token OK, webhook URL trả 401  | Đã có token rồi mà webhook từ chối                        | Server chưa xác minh Bearer đúng, hoặc coi token đã hết hạn                  |
| Webhook URL trả 200            | Thành công                                                | Không cần làm gì                                                             |

<Callout type="tip" title="Test token endpoint bằng curl trước">
Trước khi cấu hình webhook, gọi thử token endpoint bằng curl:
```bash
curl -X POST https://your-auth-server/oauth/token \
  -d "grant_type=client_credentials" \
  -u "your_client_id:your_client_secret"
```
Response phải là JSON status 200 có 
`access_token`
. OK rồi mới cấu hình webhook.
</Callout>

Cấu hình + flow OAuth xem ở [Xác thực OAuth 2.0](./xac-thuc#oauth-20).

## Câu hỏi thường gặp

<AccordionGroup>
  <Accordion title="Nhiều webhook cùng trỏ về một URL thì sao?">
    Mỗi webhook là một lần gửi riêng. Endpoint nhận 2 POST với cùng payload (cùng `id`) từ 2 webhook khác nhau. Dùng `id` làm UNIQUE để [chống trùng](./tich-hop-webhook#chong-trung-lap).
  </Accordion>

  <Accordion title="`accumulated` là số dư trước hay sau giao dịch?">
    Sau. Số dư còn lại ngay sau khi giao dịch hoàn tất. Một số ngân hàng không hỗ trợ trả số dư, lúc đó `accumulated = 0`. Đừng dùng để đối soát số dư thực nếu chưa chắc ngân hàng của bạn có hỗ trợ.
  </Accordion>

  <Accordion title="SePay có đảm bảo thứ tự webhook không?">
    Không. SePay gửi càng sớm càng tốt sau khi xử lý. Hai giao dịch cách nhau vài giây có thể đến endpoint theo thứ tự đảo ngược nếu webhook cũ đang retry. Dùng `transactionDate` trong payload để sắp xếp.
  </Accordion>

  <Accordion title="IP nào của SePay gọi webhook?">
    Tập IP cố định. Danh sách cập nhật: [Địa chỉ IP](/vi/dia-chi-ip). Allowlist IP này ở firewall để chặn request giả mạo. Theo dõi thông báo khi SePay thêm IP mới.
  </Accordion>

  <Accordion title="Mỗi công ty tạo tối đa bao nhiêu webhook?">
    Không có giới hạn cứng. Thực tế nên giữ dưới 20 webhook mỗi công ty để dễ quản lý. Mỗi webhook bắn độc lập, càng nhiều thì càng nhiều request ra ngoài. Gom logic về 1 endpoint đa mục đích thường dễ bảo trì hơn.
  </Accordion>

  <Accordion title="Payload của Gửi thử có giống thật không?">
    Gần giống. Cấu trúc JSON và tên trường giống hệt, nhưng `id` là số mock (ví dụ `0`), các trường khác là data mẫu. Đừng viết cứng giá trị test vào code. Sau khi endpoint xử lý được payload mẫu, test lại với giao dịch thật.
  </Accordion>

  <Accordion title="Đổi URL webhook đang chạy có mất giao dịch không?">
    Không. Thay đổi áp dụng cho giao dịch tiếp theo, không ảnh hưởng giao dịch đã gửi trước đó. Có sự cố đang mở? Dùng **Phát lại** trong trang Sự cố để gửi lại các giao dịch bị mất sang URL mới. Xem [Sự cố](./giam-sat#su-co).
  </Accordion>

  <Accordion title="Webhook đã xoá có lấy lại được không?">
    Không. Xoá mất luôn cấu hình. Lịch sử gửi cũ vẫn giữ để đối soát, không khôi phục được webhook.

    Tạm không dùng thì **Tắt** thay vì xoá. Giữ cấu hình, bật lại sau không phải nhập lại.
  </Accordion>
</AccordionGroup>

## Khi nào cần đối soát

Retry tự động chỉ trong khoảng 33 phút. Endpoint sập lâu hơn thì webhook mất. Lúc đó dùng [đối soát giao dịch](./doi-soat-giao-dich) hoặc [Sự cố](./giam-sat#su-co) để xem danh sách bị ảnh hưởng và gửi lại.

## Tiếp theo

* [Đối soát giao dịch](./doi-soat-giao-dich): backup khi webhook mất quá 5 giờ
* [Giám sát](./giam-sat): lịch sử gửi, cảnh báo, sự cố
* [Tích hợp webhook](./tich-hop-webhook): cách chống trùng lặp
* [Bảo mật](./bao-mat): checklist bảo mật endpoint
