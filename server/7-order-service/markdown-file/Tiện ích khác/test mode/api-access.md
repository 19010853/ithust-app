# Tạo API Access cho Test mode SePay

## Tạo API Access trong Test mode (chế độ thử nghiệm) SePay: token riêng, chỉ xác thực trên userapi-sandbox.sepay.vn, không dùng chung với Live.

API Access trong Test mode (chế độ thử nghiệm) cho phép tạo token API **riêng**, không dùng chung với Live. Token được tạo và quản lý trong Test mode, chỉ xác thực được trên endpoint `userapi-sandbox.sepay.vn`.

<Callout type="warn" title="Token không dùng chung giữa Live và Test mode">
Token Live không xác thực được trên endpoint 
`userapi-sandbox.sepay.vn`
, và ngược lại token Test mode không gọi được endpoint Live 
`userapi.sepay.vn`
. Mỗi môi trường có vùng quản lý token riêng.
</Callout>

## Mở trang API Access Test mode

Vào **Test mode** → **API Access**.

<Image src="/images/test-mode/danh-sach-api-access-test-mode.png" alt="Trang API Access trong Test mode SePay" caption="Trang API Access trong Test mode với token đã được che" />

## Tạo token API Access

Chọn **+ Thêm API** ở góc trên bên phải, điền các trường rồi chọn **Thêm**.

| Trường     | Mô tả                                  |
| ---------- | -------------------------------------- |
| Tên        | Đặt tên gợi nhớ, ví dụ `Tích hợp test` |
| Trạng thái | **Hoạt động**                          |

Sau khi tạo thành công, sao chép giá trị **API Token** từ danh sách API Access vào biến môi trường server. Token chỉ hiển thị đầy đủ một lần.

<Image src="/images/test-mode/tao-api-access-test-mode.png" alt="Dialog hiển thị token đầy đủ ngay sau khi tạo trong Test mode SePay" caption="Token chỉ hiện đầy đủ một lần, sao chép ngay vào nơi an toàn" />

## Thử kết nối

Sau khi có token, gọi thử SePay API sandbox để xác nhận token hoạt động:

```bash
curl -X GET "https://userapi-sandbox.sepay.vn/v2/bank-accounts" \
  -H "Authorization: Bearer YOUR_SANDBOX_API_TOKEN"
```

Response trả về danh sách tài khoản đã tạo trong Test mode (định dạng JSON envelope giống Live).

## Quản lý token

Tại trang **API Access** trong Test mode, mỗi token có các thao tác:

| Thao tác | Tác dụng                                          |
| -------- | ------------------------------------------------- |
| Bật/tắt  | Tạm khoá hoặc mở lại token mà không xoá           |
| Sửa tên  | Đổi tên gợi nhớ; không ảnh hưởng giá trị token    |
| Xoá      | Vô hiệu hoá token vĩnh viễn; không khôi phục được |

## Khác biệt với Live

Quy trình tạo và quản lý token giống hệt với Live (cùng các trường, cùng thao tác). Khác biệt:

| Khía cạnh         | Live                                            | Test mode                                       |
| ----------------- | ----------------------------------------------- | ----------------------------------------------- |
| Endpoint xác thực | `userapi.sepay.vn`                              | `userapi-sandbox.sepay.vn`                      |
| Phạm vi dữ liệu   | Tài khoản và giao dịch thật                     | Tài khoản và giao dịch mô phỏng trong Test mode |
| Hạn mức số token  | Không giới hạn                                  | Tối đa 50                                       |
| Quy trình tạo     | [Tạo API Token](/vi/sepay-api/v2/tao-api-token) | Thực hiện trong API Access của Test mode        |

## Tiếp theo

* [Bắt đầu nhanh SePay API v2](/vi/sepay-api/v2/bat-dau-nhanh)
* [Hạn mức Test mode](./han-muc): tối đa 50 API Access mỗi tài khoản công ty
