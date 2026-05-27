# Tạo tài khoản ảo (VA) Test mode SePay

## Tạo VA trong Test mode (chế độ thử nghiệm) SePay: VA chính thức SBSEPAY và VA theo nội dung, hỗ trợ theo từng ngân hàng và loại tài khoản.

VA trong Test mode (chế độ thử nghiệm) chia làm hai loại: **VA chính thức** (tiền tố `SBSEPAY` + 12 ký tự) và **VA theo nội dung** (3 ký tự). Loại VA bạn tạo được quyết định bởi ngân hàng và loại tài khoản. Xem bảng hỗ trợ bên dưới.

VA chỉ tạo được trên [tài khoản tạo mới](./tai-khoan-ngan-hang). Tài khoản sao chép từ Live chỉ đọc.

## VA chính thức

* Số VA: `SBSEPAY` + 12 ký tự ngẫu nhiên (chữ cái viết hoa và số)
* Trạng thái: tĩnh, đang hoạt động
* Ví dụ: `SBSEPAYX9KA2B7MN4QR`

<Image src="/images/test-mode/chi-tiet-tai-khoan-ngan-hang-test-mode.png" alt="Tab Tài khoản ảo trong chi tiết tài khoản Test mode" caption="Trang chi tiết tài khoản với tab Tài khoản ảo (VA) và nút Thêm VA" />

<Image src="/images/test-mode/tao-tai-khoan-ao-chinh-thuc-test-mode.png" alt="Modal Thêm VA chính thức với số VA tự sinh" caption="VA chính thức có số dạng SBSEPAY + 12 ký tự, hệ thống tự sinh" />

Tiền tố `SBSEPAY` áp dụng cho mọi ngân hàng trong Test mode. Phần ngẫu nhiên đảm bảo duy nhất trong tài khoản công ty.

Ngân hàng hỗ trợ VA chính thức: ACB, BIDV, MBBank, VPBank (cá nhân và hộ kinh doanh), VietinBank (doanh nghiệp), OCB, MSB, Sacombank (cá nhân và hộ kinh doanh), KienLongBank.

## VA theo nội dung

VA theo nội dung là chuỗi 3 ký tự (chữ cái viết hoa và số). Khi khách chuyển khoản, nội dung chuyển khoản phải chứa `TKP` + mã VA để hệ thống khớp đúng VA.

* Số VA: 3 ký tự ngẫu nhiên
* Ví dụ: `X9K`, `A2B`, `7MN`

<Image src="/images/test-mode/tao-tai-khoan-ao-theo-noi-dung-test-mode.png" alt="Modal Thêm VA theo nội dung" caption="VA theo nội dung: 3 ký tự, khớp qua nội dung TKP{mã}" />

<Callout type="info" title="VA theo nội dung chỉ áp dụng cho một số trường hợp">
VA theo nội dung chỉ áp dụng cho: VietinBank loại cá nhân và hộ kinh doanh, VPBank loại doanh nghiệp, và TPBank tất cả loại tài khoản. Các ngân hàng và loại tài khoản còn lại dùng VA chính thức.
</Callout>

## Hỗ trợ VA Test mode theo ngân hàng

| Ngân hàng                                                                                                                                                                                                                                   | Loại tài khoản                       | VA chính thức | VA theo nội dung |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ | :-----------: | :--------------: |
| <span style={{whiteSpace: 'nowrap'}}><img src="/images/bank_icons/acb-icon.png" alt="ACB Test mode SePay" width="20" style={{display: 'inline-block', verticalAlign: 'middle', marginRight: '6px'}} />ACB</span>                            | Cá nhân, hộ kinh doanh, doanh nghiệp |       Có      |                  |
| <span style={{whiteSpace: 'nowrap'}}><img src="/images/bank_icons/bidv-icon.png" alt="BIDV Test mode SePay" width="20" style={{display: 'inline-block', verticalAlign: 'middle', marginRight: '6px'}} />BIDV</span>                         | Cá nhân, hộ kinh doanh, doanh nghiệp |       Có      |                  |
| <span style={{whiteSpace: 'nowrap'}}><img src="/images/bank_icons/mbbank-icon.png" alt="MBBank Test mode SePay" width="20" style={{display: 'inline-block', verticalAlign: 'middle', marginRight: '6px'}} />MBBank</span>                   | Cá nhân, hộ kinh doanh, doanh nghiệp |       Có      |                  |
| <span style={{whiteSpace: 'nowrap'}}><img src="/images/bank_icons/vpbank-icon.png" alt="VPBank Test mode SePay" width="20" style={{display: 'inline-block', verticalAlign: 'middle', marginRight: '6px'}} />VPBank</span>                   | Cá nhân, hộ kinh doanh               |       Có      |                  |
| <span style={{whiteSpace: 'nowrap'}}><img src="/images/bank_icons/vpbank-icon.png" alt="VPBank Test mode SePay" width="20" style={{display: 'inline-block', verticalAlign: 'middle', marginRight: '6px'}} />VPBank</span>                   | Doanh nghiệp                         |               |        Có        |
| <span style={{whiteSpace: 'nowrap'}}><img src="/images/bank_icons/vietinbank-icon.png" alt="VietinBank Test mode SePay" width="20" style={{display: 'inline-block', verticalAlign: 'middle', marginRight: '6px'}} />VietinBank</span>       | Cá nhân, hộ kinh doanh               |               |        Có        |
| <span style={{whiteSpace: 'nowrap'}}><img src="/images/bank_icons/vietinbank-icon.png" alt="VietinBank Test mode SePay" width="20" style={{display: 'inline-block', verticalAlign: 'middle', marginRight: '6px'}} />VietinBank</span>       | Doanh nghiệp                         |       Có      |                  |
| <span style={{whiteSpace: 'nowrap'}}><img src="/images/bank_icons/ocb-icon.png" alt="OCB Test mode SePay" width="20" style={{display: 'inline-block', verticalAlign: 'middle', marginRight: '6px'}} />OCB</span>                            | Cá nhân, hộ kinh doanh, doanh nghiệp |       Có      |                  |
| <span style={{whiteSpace: 'nowrap'}}><img src="/images/bank_icons/msb-icon.png" alt="MSB Test mode SePay" width="20" style={{display: 'inline-block', verticalAlign: 'middle', marginRight: '6px'}} />MSB</span>                            | Cá nhân, hộ kinh doanh, doanh nghiệp |       Có      |                  |
| <span style={{whiteSpace: 'nowrap'}}><img src="/images/bank_icons/sacombank-icon.png" alt="Sacombank Test mode SePay" width="20" style={{display: 'inline-block', verticalAlign: 'middle', marginRight: '6px'}} />Sacombank</span>          | Cá nhân, hộ kinh doanh               |       Có      |                  |
| <span style={{whiteSpace: 'nowrap'}}><img src="/images/bank_icons/tpbank-icon.png" alt="TPBank Test mode SePay" width="20" style={{display: 'inline-block', verticalAlign: 'middle', marginRight: '6px'}} />TPBank</span>                   | Cá nhân, hộ kinh doanh, doanh nghiệp |               |        Có        |
| <span style={{whiteSpace: 'nowrap'}}><img src="/images/bank_icons/kienlongbank-icon.png" alt="KienLongBank Test mode SePay" width="20" style={{display: 'inline-block', verticalAlign: 'middle', marginRight: '6px'}} />KienLongBank</span> | Cá nhân, hộ kinh doanh, doanh nghiệp |       Có      |                  |

<Callout type="warn" title="Test mode cho phép thao tác mà Live không có">
Một số thao tác VA trong Test mode như xóa hoặc bật/tắt được cho phép để thuận tiện kiểm thử, dù Live không hỗ trợ. Khi thao tác, hệ thống hiển thị cảnh báo nhắc rằng tính năng chỉ khả dụng trong Test mode.
</Callout>

## Tiếp theo

* [Tài khoản ngân hàng](./tai-khoan-ngan-hang): tạo tài khoản mới để được phép tạo VA
* [Mô phỏng giao dịch](./mo-phong-giao-dich): gửi giao dịch vào VA vừa tạo để kiểm tra payload `subAccount`
* [Hạn mức Test mode](./han-muc): tối đa 100 VA mỗi tài khoản ngân hàng
