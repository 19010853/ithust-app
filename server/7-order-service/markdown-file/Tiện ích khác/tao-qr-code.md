# Tạo mã VietQR thanh toán với SePay

## Tạo mã VietQR động cho thanh toán chuyển khoản ngân hàng SePay: URL ảnh QR động kèm số tài khoản, số tiền, nội dung; nhúng QR vào website.

## QR code VietQR là gì?

* Ảnh QR Code chứa toàn bộ thông tin về ngân hàng, số tài khoản thụ hưởng, số tiền chuyển khoản, nội dung chuyển khoản.

* Khi khách hàng dùng App ngân hàng để quét mã, ứng dụng sẽ tự điền toàn bộ thông tin chuyển khoản, rất tiện lợi.

* Như vậy khi tích hợp QR Code, khách hàng sẽ không cần phải điền bằng tay các thông tin chuyển khoản. Trải nghiệm khách hàng sẽ tốt hơn, việc chuyển khoản thanh toán cũng nhanh hơn.

* SePay cung cấp công cụ để giúp bạn tạo ảnh QR Code động tại **[qr.sepay.vn](https://qr.sepay.vn/)**

***

## Cấu trúc link nhúng

<TextBlock title="LINK">
```text
https://qr.sepay.vn/img?acc=SO_TAI_KHOAN&bank=NGAN_HANG&amount=SO_TIEN&des=NOI_DUNG&template=TEMPLATE&download=DOWNLOAD
```
</TextBlock>

**Giải thích tham số**

<ParamsTable
  rows={[
{ name: "acc", type: "string", required: true, description: "Số tài khoản ngân hàng (hoặc số VA, tùy quy tắc của ngân hàng — xem mục dưới)" },
{ name: "bank", type: "string", required: true, description: "Mã ngân hàng (xem danh sách hỗ trợ tại https://qr.sepay.vn/banks.json)" },
{ name: "amount", type: "integer", required: false, description: "Số tiền chuyển khoản (VND). Bỏ trống để khách tự nhập khi quét." },
{ name: "des", type: "string", required: false, description: "Nội dung chuyển khoản. Một số ngân hàng yêu cầu chuỗi cố định trong des — xem mục Quy tắc bên dưới." },
{ name: "template", type: "string", required: false, description: "Kiểu hiển thị QR. Để trống = khung mặc định kèm logo SePay; `compact` = thu gọn; `qronly` = chỉ mã QR, không kèm khung và logo." },
{ name: "download", type: "string", required: false, description: "Đặt `download=true` để trình duyệt tải ảnh QR về máy thay vì hiển thị inline." }
]}
/>

<Callout type="info">
Bạn có thể xem thông tin các ngân hàng 
tại đây
</Callout>

***

## Quy tắc tạo VietQR theo ngân hàng mà SePay hỗ trợ

Quy tắc khác nhau giữa các ngân hàng: yêu cầu tài khoản ảo (VA), chuỗi bắt buộc trong nội dung chuyển khoản, và cách điền `acc` / `des` theo loại VA.

### Yêu cầu tài khoản ảo (VA)

Một số ngân hàng bắt buộc dùng tài khoản ảo (VA) để khớp giao dịch tự động. Các ngân hàng còn lại có thể dùng VA hoặc tài khoản gốc tùy nhu cầu.

| Ngân hàng      |  Cá nhân | Hộ kinh doanh | Doanh nghiệp |
| -------------- | :------: | :-----------: | :----------: |
| OCB            | Bắt buộc |    Bắt buộc   |   Bắt buộc   |
| KienLongBank   | Bắt buộc |    Bắt buộc   |   Bắt buộc   |
| MSB            | Bắt buộc |    Bắt buộc   |   Bắt buộc   |
| BIDV           | Bắt buộc |    Bắt buộc   |   Tùy chọn   |
| Ngân hàng khác | Tùy chọn |    Tùy chọn   |   Tùy chọn   |

### Nội dung chuyển khoản

<Callout type="warn" title="SEVQR — bắt buộc cho VietinBank">
Với tài khoản VietinBank cá nhân và hộ kinh doanh, nội dung chuyển khoản (
`des`
) phải chứa chuỗi 
`SEVQR`
. Thiếu chuỗi này, thông báo giao dịch không được đẩy về SePay.
</Callout>

<Callout type="info" title="TKP + mã VA — bắt buộc khi dùng VA theo nội dung chuyển khoản">
Khi dùng VA theo nội dung chuyển khoản, nội dung phải chứa 
`TKP`
 + mã VA. Ví dụ: VA 
`001`
 thì nội dung phải có 
`TKP001`
.
</Callout>

<Callout type="info" title="Mã thanh toán — tự động bóc tách">
Thêm mã thanh toán vào nội dung để SePay tự động bóc tách giao dịch với đơn hàng của bạn. Cấu hình tiền tố mã thanh toán tại 
Cấu hình mã thanh toán
.
</Callout>

### Quy tắc tham số khởi tạo QR

Tham số `acc` và `des` thay đổi tùy loại VA:

| Loại VA                       | `acc`            | `des`                    |
| ----------------------------- | ---------------- | ------------------------ |
| VA chính thức                 | Số VA            | Nội dung tùy ý           |
| VA theo nội dung chuyển khoản | Số tài khoản gốc | `TKP` + mã VA + nội dung |
| Không có VA                   | Số tài khoản     | Nội dung tùy ý           |

***

## Ví dụ sử dụng

<Callout type="warn" title="Dữ liệu mẫu">
Mọi số tài khoản và số VA trong các ví dụ dưới đây là 
dữ liệu mẫu, không tồn tại thật
. Thay bằng số tài khoản hoặc số VA thực của bạn khi triển khai.
</Callout>

### Ví dụ 1: OCB cá nhân — VA chính thức bắt buộc

OCB bắt buộc dùng VA cho mọi loại tài khoản.

<UrlLink>
  [https://qr.sepay.vn/img?acc=VQRQ12345678\&bank=OCB\&amount=100000\&des=DH001%20thanh%20toan](https://qr.sepay.vn/img?acc=VQRQ12345678\&bank=OCB\&amount=100000\&des=DH001%20thanh%20toan)
</UrlLink>

| Tham số  | Giá trị            | Ý nghĩa                |
| -------- | ------------------ | ---------------------- |
| `acc`    | `VQRQ12345678`     | Số VA OCB (mẫu)        |
| `bank`   | `OCB`              | Ngân hàng OCB          |
| `amount` | `100000`           | 100.000 VND            |
| `des`    | `DH001 thanh toan` | Mã đơn hàng + nội dung |

### Ví dụ 2: VietinBank cá nhân — bắt buộc SEVQR trong nội dung

VietinBank cá nhân và hộ kinh doanh bắt buộc nội dung chứa chuỗi `SEVQR`.

<UrlLink>
  [https://qr.sepay.vn/img?acc=0123456789\&bank=VietinBank\&amount=100000\&des=SEVQR%20DH001](https://qr.sepay.vn/img?acc=0123456789\&bank=VietinBank\&amount=100000\&des=SEVQR%20DH001)
</UrlLink>

| Tham số  | Giá trị       | Ý nghĩa                              |
| -------- | ------------- | ------------------------------------ |
| `acc`    | `0123456789`  | Số tài khoản VietinBank (mẫu)        |
| `bank`   | `VietinBank`  | Ngân hàng VietinBank                 |
| `amount` | `100000`      | 100.000 VND                          |
| `des`    | `SEVQR DH001` | Chuỗi bắt buộc `SEVQR` + mã đơn hàng |

### Ví dụ 3: TPBank cá nhân — VA theo nội dung chuyển khoản (TKP + mã VA)

Khi dùng VA theo nội dung chuyển khoản, `acc` là số tài khoản gốc, `des` ghép `TKP` + mã VA + nội dung.

<UrlLink>
  [https://qr.sepay.vn/img?acc=0987654321\&bank=TPBank\&amount=200000\&des=TKP001%20DH001](https://qr.sepay.vn/img?acc=0987654321\&bank=TPBank\&amount=200000\&des=TKP001%20DH001)
</UrlLink>

| Tham số  | Giá trị        | Ý nghĩa                           |
| -------- | -------------- | --------------------------------- |
| `acc`    | `0987654321`   | Số tài khoản TPBank (mẫu)         |
| `bank`   | `TPBank`       | Ngân hàng TPBank                  |
| `amount` | `200000`       | 200.000 VND                       |
| `des`    | `TKP001 DH001` | `TKP` + mã VA `001` + mã đơn hàng |

### Ví dụ 4: Vietcombank cá nhân — không bắt buộc VA, đầy đủ thông tin

Vietcombank không bắt buộc VA. Truyền đầy đủ `amount` và `des` để khách quét là thanh toán ngay.

<UrlLink>
  [https://qr.sepay.vn/img?acc=0010000000355\&bank=Vietcombank\&amount=100000\&des=ung%20ho%20quy%20bao%20tro%20tre%20em](https://qr.sepay.vn/img?acc=0010000000355\&bank=Vietcombank\&amount=100000\&des=ung%20ho%20quy%20bao%20tro%20tre%20em)
</UrlLink>

| Tham số  | Giá trị                     | Ý nghĩa                        |
| -------- | --------------------------- | ------------------------------ |
| `acc`    | `0010000000355`             | Số tài khoản Vietcombank (mẫu) |
| `bank`   | `Vietcombank`               | Ngân hàng Vietcombank          |
| `amount` | `100000`                    | 100.000 VND                    |
| `des`    | `ung ho quy bao tro tre em` | Nội dung tự do                 |

### Ví dụ 5: Vietcombank — chỉ có số tài khoản và ngân hàng

Bỏ qua `amount` và `des` để khách tự điền số tiền và nội dung khi quét.

<UrlLink>
  [https://qr.sepay.vn/img?acc=0010000000355\&bank=Vietcombank](https://qr.sepay.vn/img?acc=0010000000355\&bank=Vietcombank)
</UrlLink>

| Tham số | Giá trị         | Ý nghĩa                        |
| ------- | --------------- | ------------------------------ |
| `acc`   | `0010000000355` | Số tài khoản Vietcombank (mẫu) |
| `bank`  | `Vietcombank`   | Ngân hàng Vietcombank          |

***

## Nhúng mã QR Code vào website

Bạn có thể nhúng bằng thẻ IMG như sau:

<Html title="HTML">
  {`<img src='https://qr.sepay.vn/img?acc=SO_TAI_KHOAN&bank=NGAN_HANG&amount=SO_TIEN&des=NOI_DUNG'/>`}
</Html>
