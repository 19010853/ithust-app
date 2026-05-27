# SDK JavaScript cho SePay Bank Hub

## SDK JavaScript chính thức của SePay Bank Hub giúp tích hợp Hosted Link nhanh chóng với callback sự kiện và quản lý vòng đời phiên liên kết sẵn có.

---

**API Overview:**

API tích hợp Bank Hub - Nền tảng kết nối tài khoản ngân hàng và nhận thông báo giao dịch realtime.

## Base URL
- **Sandbox**: `https://bankhub-api-sandbox.sepay.vn`
- **Production**: `https://bankhub-api.sepay.vn`

## Authentication
- Sử dụng **Basic Authentication** với `client_id:client_secret` để lấy access token
- Sử dụng **Bearer Token** cho các API khác


---

## Giới thiệu

**SDK JavaScript SePay Bank Hub** cho phép bạn tích hợp giao diện **Hosted Link (Bank Hub)** trực tiếp vào website hoặc web app mà không cần tự xây dựng luồng UI ngân hàng phức tạp.

SDK chịu trách nhiệm:

* Mở và hiển thị Bank Hub Hosted Link
* Quản lý vòng đời phiên liên kết ngân hàng
* Lắng nghe sự kiện và callback từ Bank Hub
* Chuẩn hóa trải nghiệm người dùng khi tích hợp

SDK hoạt động **kết hợp với API Link Token** và **không thay thế backend API**.

***

## Khi nào nên sử dụng SDK?

<Features
  items={[
  { icon: "zap", title: "Tích hợp nhanh", description: "Mở Bank Hub chỉ với vài dòng JavaScript, không cần xử lý UI phức tạp." },
  { icon: "refresh", title: "Quản lý vòng đời phiên", description: "SDK tự động quản lý open, close, expired và trạng thái phiên." },
  { icon: "shield", title: "An toàn & chuẩn hóa", description: "Không expose API key hoặc token nhạy cảm ở frontend." }
]}
/>

***

## Kiến trúc tích hợp SDK

Luồng tích hợp SDK chuẩn:

* Backend tạo **Link Token** thông qua API
* Backend trả về `hosted_link_url`
* Frontend khởi tạo SDK Bank Hub
* SDK mở Hosted Link cho người dùng
* Người dùng hoàn tất liên kết / hủy liên kết
* Backend xác nhận kết quả qua webhook

***

## Cài đặt SDK

Thêm file SDK vào trang HTML:

<TextBlock title="SDK Javascript">
```text
<script src='https://bankhub.sepay.vn/assets/sdk/1.0.0/bankhub.min.js'></script>
```
</TextBlock>

***

## Khởi tạo Bank Hub Instance

<Node title="JavaScript">
```js
const bankhubInstance = new Bank Hub({
mode: 'modal',

onSuccess: function (result) {
  console.log('Bank linked successfully', result);
  alert('✅ Liên kết ngân hàng thành công!');
  bankhubInstance.destroy();
},

onExit: function (result) {
  console.log('User exited Bank Hub', result);
},

onOpen: function (data) {
  console.log('Bank Hub opened', data);
},

onExpired: function (data) {
  console.log('Token/Session expired', data);
  alert('⚠️ Token hoặc Session đã hết hạn!\\nType: ' + data.expired_type);
}
});
```
</Node>

* Dữ liệu trả về cho hàm `onSuccess`

<Response title="onSuccess">
```json
{
    "event": "FINISHED_BANK_ACCOUNT_LINK | FINISHED_BANK_ACCOUNT_UNLINK",
    "metadata": {
        "account_number": "string",
        "account_type": "individual | enterprise"
    },
    "timestamp": "string"
}
```
</Response>

* Dữ liệu trả về cho hàm `onExit`

<Response title="onExit">
```json
{
    "event": "BANKHUB_CLOSE_LINK",
    "metadata": {
        "account_number": "string",
        "account_type": "individual | enterprise"
    },
    "timestamp": "string"
}
```
</Response>

* Dữ liệu trả về cho hàm `onOpen`

<Response title="onOpen">
```json
{
    "event": "BANKHUB_OPEN",
    "metadata": {
        "account_number": "string",
        "account_type": "individual | enterprise"
    },
    "timestamp": "string"
}
```
</Response>

* Dữ liệu trả về cho hàm `onExpired`

<Response title="onExpired">
```json
{
    "event": "BANKHUB_TOKEN_EXPIRED | BANKHUB_SESSION_EXPIRED",
    "metadata": {
        "account_number": "string",
        "account_type": "individual | enterprise"
    },
    "timestamp": "string"
}
```
</Response>

***

## Các option cấu hình SDK

| Option      | Kiểu dữ liệu | Mô tả                                                                    |
| ----------- | ------------ | ------------------------------------------------------------------------ |
| `mode`      | `string`     | Chế độ hiển thị. Hiện hỗ trợ: `modal`, `newTab`, `newWindow`, `redirect` |
| `onSuccess` | `function`   | Gọi khi liên kết hoặc huỷ liên kết ngân hàng thành công                  |
| `onExit`    | `function`   | Gọi khi người dùng thoát Bank Hub                                        |
| `onOpen`    | `function`   | Gọi khi Bank Hub được mở                                                 |
| `onExpired` | `function`   | Gọi khi token hoặc session hết hạn                                       |

***

## Tạo Link Token (Backend)

SDK **không tự tạo link token**.

* Link token **bắt buộc phải được tạo từ backend**.

* Ví dụ frontend gọi backend để lấy Hosted Link URL:

<Node title="JavaScript">
```js
function getHostedLinkUrl () {
const formData = new FormData();
formData.append('company_xid', 'd3dafd01-e06b-11f0-b29e-52c7e9b4f41b');
formData.append('workflow', 'LINK_BANK_ACCOUNT');

fetch('/bankhub/create_link_token', {
  method: 'POST',
  body: formData
})
.then(async (response) => {
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }

  const data = await response.json();
  bankhubInstance.initLink(data.data.hosted_link_url);
});
}
```
</Node>

***

## Mở Bank Hub

* Sau khi đã khởi tạo link bạn có thể mở Bank Hub ngay:

<Node title="Node.js">
```js
bankhubInstance.open();
```
</Node>

***

## Hủy & giải phóng instance

* Sau khi hoàn tất, nên destroy instance:

<Node title="Node.js">
```js
bankhubInstance.destroy();
```
</Node>

***

<Callout type="warning" title="Lưu ý quan trọng">
Không tạo link token ở frontend
Không expose Bearer Token hoặc client secret
Luôn xử lý trường hợp token/session hết hạn
</Callout>

***

## Bước tiếp theo

Sau khi tích hợp SDK thành công, bạn có thể:

1. **[Cấu hình Webhook IPN](/vi/bankhub/thong-bao-bien-dong-so-du)** - Nhận thông báo biến động số dư realtime
2. **[Webhook Events](/vi/bankhub/webhook-event)** - Nhận thông báo sự kiện liên kết/hủy liên kết
3. **[API Danh sách tài khoản](/vi/bankhub/api/tai-khoan-ngan-hang/danh-sach-tai-khoan)** - Lấy danh sách tài khoản đã liên kết
4. **[API Danh sách giao dịch](/vi/bankhub/api/api-giao-dich/danh-sach-giao-dich)** - Xem lịch sử giao dịch
