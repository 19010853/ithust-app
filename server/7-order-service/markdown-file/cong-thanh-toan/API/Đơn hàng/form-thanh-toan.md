# API tạo đơn hàng thanh toán

## Tạo đơn hàng one-time checkout qua API Cổng thanh toán SePay — hỗ trợ chuyển khoản QR, thẻ tín dụng/ghi nợ quốc tế và cổng NAPAS.

---

**API Overview:**

API cổng thanh toán SePay hỗ trợ nhiều phương thức thanh toán bao gồm chuyển khoản ngân hàng qua QR code, NAPAS QR và thẻ quốc tế.

**Base URLs:**
- Production API: `https://pgapi.sepay.vn`
- Sandbox API: `https://pgapi-sandbox.sepay.vn`
- Production Checkout: `https://pay.sepay.vn`
- Sandbox Checkout: `https://pay-sandbox.sepay.vn`

**Xác thực:** Tất cả API sử dụng Basic Authentication với `merchant_id` và `secret_key`.


---

<Callout type="info" title="Đơn hàng là gì?">
Trong cổng thanh toán SePay, đơn hàng (order) là gói thông tin mô tả yêu cầu thanh toán với các thuộc tính chính như số tiền, mô tả giao dịch, mã hóa đơn, khách hàng và các URL callback để hệ thống xử lý. API khởi tạo form thanh toán sử dụng gói thông tin này để tạo giao dịch một lần; bạn chỉ cần tạo form HTML hợp lệ và submit tới endpoint 
`checkout/init`
 để chuyển hướng khách hàng đến trang thanh toán.
</Callout>

## Luồng xử lý tạo đơn hàng

<Mermaid title="Luồng tạo form thanh toán và xác thực chữ ký">
flowchart TD
  A[Khách hàng chọn thanh toán] --> B[Website tạo form HTML]
  B --> C[Thu thập thông tin đơn hàng]
  C --> D[Chuẩn bị dữ liệu form]
  D --> E[Tạo signature HMAC-SHA256]
  E --> F[Thêm signature vào form]
  F --> G[Submit form POST đến checkout/init]
  G --> H{SePay xác thực signature}
  H -->|Thành công| I[Chuyển hướng đến trang thanh toán]
  H -->|Thất bại| J[Trả về lỗi xác thực]
  I --> K[Khách hàng chọn phương thức thanh toán]
  K --> L[Thực hiện thanh toán]
  L --> M[Callback về success/error/cancel URL]

  style A fill:#e1f5fe
  style I fill:#c8e6c9
  style J fill:#ffcdd2
  style M fill:#fff3e0
</Mermaid>

1. **Khách hàng chọn thanh toán**: Người dùng click nút thanh toán trên website
2. **Website tạo form HTML**: Server tạo form HTML với các tham số cần thiết
3. **Thu thập thông tin đơn hàng**: Lấy thông tin từ database hoặc session
4. **Chuẩn bị dữ liệu form**: Sắp xếp các tham số theo đúng format
5. **Tạo signature**: Sử dụng thuật toán HMAC-SHA256 để tạo chữ ký
6. **Thêm signature vào form**: Đưa chữ ký vào form như một hidden field
7. **Submit form**: Gửi POST request đến endpoint `checkout/init`
8. **Xác thực signature**: SePay kiểm tra tính hợp lệ của chữ ký
9. **Chuyển hướng**: Nếu hợp lệ, chuyển hướng đến trang thanh toán
10. **Thanh toán**: Khách hàng thực hiện thanh toán trên trang SePay
11. **Callback**: SePay gọi về URL IPN với kết quả

***

## Endpoint

<Endpoint>
  <Method>POST</Method>

  <Path>https://pgapi.sepay.vn/v1/checkout/init</Path>

  <Description>
    Tạo form thanh toán
  </Description>
</Endpoint>

<Callout type="warn" title="Lưu ý">
Đây là endpoint để submit form, không phải endpoint để gọi API.
</Callout>

***

## Danh sách tham số

<ParamsTable rows={[{ "name": "merchant", "type": "string", "required": true, "description": "ID merchant của bạn (Ví dụ: MERCHANT_123)" }, { "name": "currency", "type": "string", "required": true, "description": "Mã tiền tệ (chỉ hỗ trợ VND)" }, { "name": "order_amount", "type": "string", "required": true, "description": "Số tiền đơn hàng (đơn vị nhỏ nhất)" }, { "name": "operation", "type": "string", "required": true, "description": "Loại giao dịch (PURCHASE hoặc VERIFY)" }, { "name": "order_description", "type": "string", "required": true, "description": "Mô tả đơn hàng" }, { "name": "order_invoice_number", "type": "string", "required": true, "description": "Mã hóa đơn (bắt buộc cho PURCHASE, ví dụ: INV_20231201_001)" }, { "name": "payment_method", "type": "string", "required": false, "description": "Phương thức thanh toán (CARD, BANK_TRANSFER, NAPAS_BANK_TRANSFER)" }, { "name": "customer_id", "type": "string", "required": false, "description": "ID khách hàng" }, { "name": "success_url", "type": "string", "required": false, "description": "URL chuyển hướng khi thành công (Ví dụ: https://yoursite.com/success)" }, { "name": "error_url", "type": "string", "required": false, "description": "URL chuyển hướng khi lỗi (Ví dụ: https://yoursite.com/error)" }, { "name": "cancel_url", "type": "string", "required": false, "description": "URL chuyển hướng khi hủy (Ví dụ: https://yoursite.com/cancel)" }]} />

<Callout type="warn" title="Lưu ý">
Các tham số success_url, error_url, và cancel_url 
chỉ hoạt động khi ứng dụng của bạn đang chạy trên domain hoặc IP có thể truy cập công khai (public)
. Nếu bạn đang phát triển trên môi trường 
localhost
, hãy sử dụng các công cụ giúp public môi trường cục bộ như 
ngrok
, 
localtunnel
, hoặc tương tự.
</Callout>

***

## Ví dụ tạo đơn hàng cơ bản

**Tạo form HTML**

<Callout type="danger" title="Lưu ý quan trọng về thứ tự input trong HTML">
Khi tự dựng form HTML, hãy giữ đúng thứ tự các input như form mẫu ngay bên dưới để quá trình ký và xử lý phía SePay khớp tuyệt đối; đổi vị trí trường có thể khiến signature sai.
</Callout>

<Html title="Form thanh toán">
  {`<form action="https://pay-sandbox.sepay.vn/v1/checkout/init" method="POST">
    <input type="hidden" name="order_amount" value="100000" />
    <input type="hidden" name="merchant" value="MERCHANT_123" />
    <input type="hidden" name="currency" value="VND" />
    <input type="hidden" name="operation" value="PURCHASE" />
    <input type="hidden" name="order_description" value="Thanh toán đơn hàng #12345" />
    <input type="hidden" name="order_invoice_number" value="INV_20231201_001" />
    <input type="hidden" name="success_url" value="https://yoursite.com/payment/success" />
    <input type="hidden" name="error_url" value="https://yoursite.com/payment/error" />
    <input type="hidden" name="cancel_url" value="https://yoursite.com/payment/cancel" />
    <input type="hidden" name="signature" value="a1b2c3d4e5f6..." />
    <button type="submit">Thanh toán</button>
    </form>`}
</Html>

**Response:**

Sau khi submit form, hệ thống sẽ chuyển hướng người dùng đến trang thanh toán của SePay:

`https://pgapi-sandbox.sepay.vn?merchant=MERCHANT_123&currency=VND&order_amount=100000&operation=PURCHASE&order_description=Thanh%20toán%20đơn%20hàng%20%2312345&order_invoice_number=INV_20231201_001&customer_id=CUST_001&success_url=https%3A%2F%2Fyoursite.com%2Fpayment%2Fsuccess&error_url=https%3A%2F%2Fyoursite.com%2Fpayment%2Ferror&cancel_url=https%3A%2F%2Fyoursite.com%2Fpayment%2Fcancel&signature=a1b2c3d4e5f6...`

<Callout type="warn" title="Lưu ý">
Trang thanh toán sẽ hiển thị các phương thức thanh toán khả dụng dựa trên cấu hình merchant của bạn.
</Callout>

***

## Xác thực chữ ký

<Callout type="danger" title="Lưu ý quan trọng về các trường khi tạo chữ ký">
Khi tạo signature, hãy giữ nguyên thứ tự các field trong 
`signedFields`
 đúng như đoạn code mẫu (không sắp xếp lại) để chuỗi ký trùng với phía SePay.
</Callout>

**Signature được tạo từ các tham số form theo quy tắc sau:**

1. **Lọc các trường cần ký**: Chỉ ký các trường được phép trong danh sách: `merchant, operation, payment_method, order_amount, currency, order_invoice_number, order_description, customer_id, success_url, error_url, cancel_url`
2. **Tạo chuỗi ký**: `field1=value1,field2=value2,field3=value3...`
3. **Mã hóa**: `base64_encode(hash_hmac('sha256', $signedString, $secretKey, true))`

**Ví dụ tạo chữ ký:**

<Php title="Hàm ký dữ liệu PHP">
```php
function signFields(array $fields, string $secretKey): string {
  $signed = [];
  $allowedFields = [
      'order_amount', 'merchant', 'currency', 'operation',
      'order_description', 'order_invoice_number', 'customer_id',
      'payment_method', 'success_url', 'error_url', 'cancel_url',
  ];

  foreach ($allowedFields as $field) {
      if (! isset($fields[$field])) continue;
      $signed[] = $field . '=' . $fields[$field];
  }

  return base64_encode(hash_hmac('sha256', implode(',', $signed), $secretKey, true));
}
```
</Php>

**Ví dụ chuỗi chữ ký:**

`order_amount=100000,merchant=MERCHANT_123,currency=VND,operation=PURCHASE,order_description=Thanh toán đơn hàng #12345,order_invoice_number=INV_20231201_001,success_url=https://yoursite.com/payment/success,error_url=https://yoursite.com/payment/error,cancel_url=https://yoursite.com/payment/cancel`

***

<Callout type="warn" title="Lưu ý quan trọng">
Mã hóa đơn hàng:
 
`order_invoice_number`
 phải là duy nhất và không được trùng lặp. 2. 
Số tiền:
 Chỉ hỗ trợ VND, số tiền phải lớn hơn 0 cho giao dịch 
`PURCHASE`
. 3. 
URL callback:
 Phải là URL công khai có thể truy cập từ internet. 4. 
Chữ ký:
 Luôn kiểm tra chữ ký để đảm bảo tính toàn vẹn dữ liệu. 5. 
Môi trường:
 Sử dụng sandbox cho testing, production cho giao dịch thực.
</Callout>
