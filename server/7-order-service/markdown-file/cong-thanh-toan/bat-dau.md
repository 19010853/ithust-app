# Bắt đầu nhanh với SePay Cổng Thanh Toán

## Bắt đầu Cổng thanh toán SePay trong vài phút: tạo đơn hàng đầu tiên, xử lý IPN callback, go-live thanh toán chuyển khoản và thẻ ngay hôm nay.

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

<iframe width="100%" height="400" src="https://www.youtube.com/embed/RZnw2VU5J9U" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />

## Chức năng chính

* **Xử lý thanh toán**: Tiếp nhận thông tin thanh toán từ khách hàng
* **Bảo mật giao dịch**: Mã hóa và bảo vệ dữ liệu thanh toán
* **Kết nối ngân hàng**: Giao tiếp với các ngân hàng và tổ chức thẻ
* **Thông báo kết quả**: Gửi thông tin giao dịch về hệ thống của bạn

***

## Luồng hoạt động tổng quan

<Mermaid title="Luồng thanh toán">
flowchart LR
A[Khách hàng] -->|1. Chọn sản phẩm| B[Website/App của bạn]
B -->|2. Tạo đơn hàng| C[SePay Gateway]
C -->|3. Hiển thị trang thanh toán| A
A -->|4. Thanh toán| C
C -->|5. Xử lý giao dịch| D[Ngân hàng/Thẻ]
D -->|6. Kết quả| C
C -->|7. Thông báo #40;IPN#41;| B
C -->|8. Chuyển hướng| A

style A fill:#e3f2fd
style B fill:#fff3e0
style C fill:#c8e6c9
style D fill:#f3e5f5
</Mermaid>

***

## Bắt đầu với Quét mã QR chuyển khoản ngân hàng

### Bước 1: Đăng ký tài khoản

Truy cập [https://my.sepay.vn/register](https://my.sepay.vn/register?onboarding=payment-gateway) và đăng ký tài khoản SePay. Chọn gói dịch vụ phù hợp sau khi đăng ký.

Nếu đã có tài khoản, truy cập [https://my.sepay.vn/pg/payment-methods](https://my.sepay.vn/pg/payment-methods) để kích hoạt Cổng thanh toán.

**Kích hoạt Cổng thanh toán:**

Tại mục "CỔNG THANH TOÁN" vào "Đăng ký". Tại màn hình "Phương thức thanh toán" chọn "Bắt đầu ngay":

<Image src="/images/quick_start/step_1_1.png" alt="Payment Flow Diagram" caption="Màn hình phương thức thanh toán" />

Bạn có thể chọn bắt đầu với Sandbox và bấm vào "Bắt đầu hướng dẫn tích hợp":

<Image src="/images/quick_start/step_1_8.png" alt="Payment Flow Diagram" caption="Bắt đầu tích hợp cổng thanh toán SePay" />

SePay hỗ trợ phương thức tích hợp bằng API với SDK PHP và SDK NodeJS. Bấm tiếp tục:

<Image src="/images/quick_start/step_1_9.png" alt="Payment Flow Diagram" caption="Phương thức tích hợp" />

Bạn sẽ nhận được thông tin tích hợp (sao chép lại thông tin `MERCHANT ID` và `SECRET KEY` để sử dụng cho các bước sau), giữ lại màn hình này và thực hiện tiếp các bước sau:

<Image src="/images/quick_start/step_1_10.png" alt="Payment Flow Diagram" caption="Thông tin tích hợp" />

***

### Bước 2: Tạo form thanh toán trên hệ thống của bạn

**Cài đặt SDK (tùy chọn PHP hoặc NodeJS)**

<CodeTabs>
  <Code label="PHP">
    ```php
    composer require sepay/sepay-pg
    ```
  </Code>
  <Code label="NodeJS">
    ```js
    npm i sepay-pg-node
    ```
  </Code>
</CodeTabs>

<Callout type="info" title="Ghi chú">
Xem chi tiết hơn tích hợp bằng SDK PHP 
Tại đây
 hoặc SDK NodeJS 
Tại đây
</Callout>

**Khởi tạo form thanh toán với các thông tin đơn hàng và chữ ký bảo mật:**

* **YOUR\_MERCHANT\_ID**: MERCHANT ID bạn đã sao chép trên thông tin tích hợp ở **bước 1**
* **YOUR\_MERCHANT\_SECRET\_KEY**: SECRET KEY bạn đã sao chép trên thông tin tích hợp ở **bước 1**

<CodeTabs>
  <Code label="SDK PHP">
    ```php
    <?php
    
    require_once 'vendor/autoload.php';
    
    use SePay\SePayClient;
    use SePay\Builders\CheckoutBuilder;
    
    // Initialize client
    $sepay = new SePayClient('YOUR_MERCHANT_ID', 'YOUR_MERCHANT_SECRET_KEY', 'sandbox');
    
    // Create checkout data
    $checkoutData = CheckoutBuilder::make()
        ->currency('VND')
        ->orderInvoiceNumber('INV-' . time())
        ->orderAmount(100000)
        ->operation('PURCHASE')
        ->orderDescription('Test payment')
        ->successUrl('https://example.com/order/DH123?payment=success')
        ->errorUrl('https://example.com/order/DH123?payment=error')
        ->cancelUrl('https://example.com/order/DH123?payment=cancel')
        ->build();
    
    // Render checkout form to UI
    echo $sepay->checkout()->generateFormHtml($checkoutData);
    ```
  </Code>
  <Code label="SDK NodeJS">
    ```js
    import { SePayPgClient } from 'sepay-pg-node-sdk';
    
    const client = new SePayPgClient({
      env: 'sandbox',
      merchant_id: 'YOUR_MERCHANT_ID',
      secret_key: 'YOUR_MERCHANT_SECRET_KEY'
    });
    
    const checkoutURL = client.checkout.initCheckoutUrl();
    
    const checkoutFormfields = client.checkout.initOneTimePaymentFields({
      operation: 'PURCHASE',
      payment_method: 'BANK_TRANSFER',
      order_invoice_number: 'DH123',
      order_amount: 10000,
      currency: 'VND',
      order_description: 'Thanh toan don hang DH123',
      success_url: 'https://example.com/order/DH123?payment=success',
      error_url: 'https://example.com/order/DH123?payment=error',
      cancel_url: 'https://example.com/order/DH123?payment=cancel',
    });
    
    return (
      <form action={checkoutURL} method="POST">
        {Object.keys(checkoutFormfields).map(field => (
          <input type="hidden" name={field} value={checkoutFormfields[field]} />
        ))}
        <button type="submit">Pay now</button>
      </form>
    );
    ```
  </Code>
  <Code label="PHP">
    ```php
    <?php
    
    $merchantId = 'YOUR_MERCHANT_ID';
    $secretKey = 'YOUR_MERCHANT_SECRET_KEY';
    
    $fields = [
        'merchant' => $merchantId,
        'currency' => 'VND',
        'order_amount' => '100000',
        'operation' => 'PURCHASE',
        'order_description' => 'Payment for order #12345',
        'order_invoice_number' => 'INV_' . time(),
        'customer_id' => 'CUST_001',
        'success_url' => 'https://example.com/order/DH123?payment=success',
        'error_url' => 'https://example.com/order/DH123?payment=error',
        'cancel_url' => 'https://example.com/order/DH123?payment=cancel',
    ];
    
    // Generate signature
    $signature = signFields($fields, $secretKey);
    $fields['signature'] = $signature;
    
    // Render form
    echo '<form method="POST" action="https://pay-sandbox.sepay.vn/v1/checkout/init">';
    foreach ($fields as $key => $value) {
        echo '<input type="hidden" name="' . $key . '" value="' . $value . '">';
    }
    echo '<button type="submit">Pay now</button>';
    echo '</form>';
    
    // Signature generation function
    function signFields(array $fields, string $secretKey): string {
        $signed = [];
        $signedFields = array_values(array_filter(array_keys($fields), fn ($field) => in_array($field, [
            'merchant','operation','payment_method','order_amount','currency',
            'order_invoice_number','order_description','customer_id',
           'success_url','error_url','cancel_url'
        ])));
    
        foreach ($signedFields as $field) {
            if (! isset($fields[$field])) continue;
            $signed[] = $field . '=' . ($fields[$field] ?? '');
        }
    
        return base64_encode(hash_hmac('sha256', implode(',', $signed), $secretKey, true));
    }
    ```
  </Code>
</CodeTabs>

**Kết quả nhận được form thanh toán** (Tùy chỉnh giao diện phù hợp với hệ thống của bạn):

<Image src="/images/quick_start/step_1_6.png" alt="Payment Flow Diagram" caption="Ví dụ form thanh toán được tạo" />

Khi submit form thanh toán sẽ chuyển sang cổng thanh toán của SePay:

<Image src="/images/quick_start/step_1_7.png" alt="Payment Flow Diagram" caption="Công thanh toán của SePay sau khi bạn submit form" />

<Callout type="warn" title="Ghi chú">
Khi kết thúc thanh toán SePay sẽ trả về các kết quả: 
Thành công (success_url)
, 
Thất bại (error_url)
 và 
Khách hàng hủy (cancel_url)
. Cần tạo các endpoint để xử lý callback từ SePay.
</Callout>

**Tạo các endpoint để nhận các callback từ SePay:**

<Php title="PHP">
```php
// success_url - Handle successful payment
Route::get('/payment/success', function() {
  // Show success page to customer
  return view('payment.success');
});

// error_url - Handle failed payment
Route::get('/payment/error', function() {
  // Show error page to customer
  return view('payment.error');
});

// cancel_url - Handle canceled payment
Route::get('/payment/cancel', function() {
  // Show cancel page to customer
  return view('payment.cancel');
});
```
</Php>

Đưa các endpoint bạn đã tạo vào `success_url`, `error_url`, `cancel_url` lúc tạo form thanh toán.

***

### Bước 3: Cấu hình IPN

<Callout type="info" title="IPN (Instant Payment Notification) là gì?">
IPN là một endpoint trên hệ thống của bạn dùng để nhận thông báo giao dịch theo thời gian thực từ cổng thanh toán SePay. 
Tìm hiểu thêm về IPN
</Callout>

Tại màn hình thông tin tích hợp đang giữ ở **bước 1**, điền vào endpoint IPN của bạn:

<Image src="/images/quick_start/step_1_4.png" alt="Payment Flow Diagram" caption="Tạo cấu hình IPN" />

Lưu cấu hình IPN.

<Callout type="light" title="Ghi chú">
Khi có giao dịch thành công SePay sẽ trả về JSON qua IPN của bạn:
</Callout>

<Response title="IPN JSON">
```json
{
  "timestamp": 1759134682,
  "notification_type": "ORDER_PAID",
  "order": {
      "id": "e2c195be-c721-47eb-b323-99ab24e52d85",
      "order_id": "NQD-68DA43D73C1A5",
      "order_status": "CAPTURED",
      "order_currency": "VND",
      "order_amount": "100000.00",
      "order_invoice_number": "INV-1759134677",
      "custom_data": [],
      "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36",
      "ip_address": "14.186.39.212",
      "order_description": "Test payment"
  },
  "transaction": {
      "id": "384c66dd-41e6-4316-a544-b4141682595c",
      "payment_method": "BANK_TRANSFER",
      "transaction_id": "68da43da2d9de",
      "transaction_type": "PAYMENT",
      "transaction_date": "2025-09-29 15:31:22",
      "transaction_status": "APPROVED",
      "transaction_amount": "100000",
      "transaction_currency": "VND",
      "authentication_status": "AUTHENTICATION_SUCCESSFUL",
      "card_number": null,
      "card_holder_name": null,
      "card_expiry": null,
      "card_funding_method": null,
      "card_brand": null
  },
  "customer": null,
  "agreement": null
}
```
</Response>

**Tạo endpoint IPN để nhận JSON data từ SePay**

Endpoint là endpoint bạn đã cấu hình trên IPN:

<Php title="PHP">
```php
Route::post('/payment/ipn', function(Request $request) {
  $data = $request->json()->all();

  if ($data['notification_type'] === 'ORDER_PAID') {
      $order = Order::where('invoice_number', $data['order']['order_invoice_number'])->first();
      $order->status = 'paid';
      $order->save();
  }

  // Return 200 to acknowledge receipt
  return response()->json(['success' => true], 200);
});
```
</Php>

***

### Bước 4: Kiểm thử

Bây giờ bạn có thể kiểm thử bằng cách tạo một đơn hàng trên form vừa tích hợp ở **bước 2**.

Sau đó quay lại màn hình thông tin tích hợp và bấm tiếp tục để kiểm tra kết quả:

<Image src="/images/quick_start/step_1_12.png" alt="Payment Flow Diagram" caption="Kiểm tra kết quả" />

**Kịch bản:**

* Khi người dùng gửi form thanh toán trên website của bạn, hệ thống sẽ chuyển hướng đến trang thanh toán của SePay.
* Khi thanh toán thành công: SePay chuyển hướng về endpoint `/payment/success` của bạn và gửi dữ liệu cho endpoint IPN bạn đã cấu hình
* Khi thanh toán thất bại: SePay chuyển hướng về endpoint `/payment/error`
* Khi hủy thanh toán: SePay chuyển hướng về endpoint `/payment/cancel`

***

### Bước 5: Go live

<Callout type="info" title="Yêu cầu">
Có tài khoản ngân hàng cá nhân/doanh nghiệp và đã hoàn thành tích hợp và test ở Sandbox.
</Callout>

**Các bước cần thực hiện:**

1. Liên kết tài khoản ngân hàng thật
2. Từ **[https://my.sepay.vn/](https://my.sepay.vn/)** vào mục **Cổng thanh toán** chọn **Đăng ký** → Tại mục "Quét mã QR chuyển khoản ngân hàng" chọn "Bắt đầu ngay" và tiếp tục cho đến màn hình như ảnh bên dưới và chọn "Chuyển sang Production"

<Image src="/images/quick_start/step_1_11.png" alt="Payment Flow Diagram" caption="Chuyển sang Production" />

3. Sau khi **Chuyển sang Production** sẽ nhận được "MERCHANT ID" và "SECRET KEY" chính thức

<Image src="/images/quick_start/step_1_2.png" alt="Payment Flow Diagram" caption="Thông tin tích hợp" />

4. Cập nhật endpoint sang Production: **`https://pay.sepay.vn/v1/checkout/init`**
5. Đối với trường hợp dùng SDK: cập nhật các biến môi trường từ **Sandbox** sang **Production** (khi khởi tạo client)
6. Cập nhật "MERCHANT ID" và "SECRET KEY" của Sandbox thành "MERCHANT ID" và "SECRET KEY" chính thức
7. Cập nhật **IPN URL** sang **Production**
8. Cập nhật các **Callback URL** sang **Production**

<Callout type="light" title="Đối với Quét mã QR NAPAS chuyển khoản ngân hàng">
Cần gửi hồ sơ - 
Xem chi tiết tại đây
</Callout>

<iframe width="100%" height="400" src="https://www.youtube.com/embed/uThfz1cmwAE" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />

<Callout type="light" title="Đối với Thanh toán bằng thẻ">
Cần gửi hồ sơ - 
Xem chi tiết tại đây
</Callout>

<iframe width="100%" height="400" src="https://www.youtube.com/embed/-I4t9VKqkLM" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
