# IPN xác nhận thanh toán Cổng Thanh Toán

## Cấu hình IPN endpoint trong Cổng thanh toán SePay để nhận callback xác nhận thanh toán tức thì, an toàn và đúng theo thời gian thực.

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

## Cấu hình IPN URL

IPN URL được cấu hình tại trang quản lý merchant trên SePay:

1. Đăng nhập vào [SePay](https://sepay.vn)
2. Vào **Cổng thanh toán → Cấu hình → IPN**
3. Nhập URL endpoint của bạn để nhận IPN
4. Lưu cấu hình

<Callout type="warn" title="Lưu ý quan trọng">
IPN URL phải là 
HTTPS
 và endpoint phải trả về HTTP status code 
200
 để xác nhận đã nhận thành công.
</Callout>

***

## Request từ SePay đến Merchant

<Endpoint method="POST" path="https://your-url (url bạn cấu hình trong IPN)" />

**Headers:**

```http
X-Secret-Key: <secret_key>
Content-Type: application/json
```

<Callout type="tip" title="Ghi chú">
X-Secret-Key:
 Secret key để xác thực (chỉ có khi merchant cấu hình auth type = SECRET_KEY)
</Callout>

**Danh sách tham số**

<ParamsTable rows={[{ "name": "timestamp", "type": "integer", "required": true, "description": "Unix timestamp khi gửi thông báo" }, { "name": "notification_type", "type": "string", "required": true, "description": "Loại thông báo: ORDER_PAID (thanh toán thành công), TRANSACTION_VOID (hủy giao dịch)" }, { "name": "order", "type": "object", "required": true, "description": "Thông tin đơn hàng", "children": [{ "name": "id", "type": "uuidv4", "required": true, "description": "ID đơn hàng nội bộ SePay" }, { "name": "order_id", "type": "string", "required": true, "description": "Mã đơn hàng duy nhất" }, { "name": "order_status", "type": "string", "required": true, "description": "Trạng thái: CAPTURED (đã thanh toán), CANCELLED (đã hủy), AUTHENTICATION_NOT_NEEDED (đang đợi thanh toán)" }, { "name": "order_currency", "type": "string", "required": true, "description": "Mã tiền tệ (VND)" }, { "name": "order_amount", "type": "string", "required": true, "description": "Số tiền đơn hàng" }, { "name": "order_invoice_number", "type": "string", "required": true, "description": "Mã hóa đơn" }, { "name": "custom_data", "type": "array", "required": true, "description": "Dữ liệu tùy chỉnh" }, { "name": "user_agent", "type": "string", "required": true, "description": "User agent của khách hàng" }, { "name": "ip_address", "type": "string", "required": true, "description": "IP address của khách hàng" }, { "name": "order_description", "type": "string", "required": true, "description": "Mô tả đơn hàng" }] }, { "name": "transaction", "type": "object", "required": true, "description": "Thông tin giao dịch", "children": [{ "name": "id", "type": "uuidv4", "required": true, "description": "ID giao dịch nội bộ" }, { "name": "payment_method", "type": "string", "required": true, "description": "Phương thức thanh toán" }, { "name": "transaction_id", "type": "string", "required": true, "description": "Mã giao dịch duy nhất" }, { "name": "transaction_type", "type": "string", "required": true, "description": "Loại giao dịch: PAYMENT, REFUND" }, { "name": "transaction_date", "type": "string", "required": true, "description": "Ngày giờ giao dịch" }, { "name": "transaction_status", "type": "string", "required": true, "description": "Trạng thái: APPROVED, DECLINED" }, { "name": "transaction_amount", "type": "string", "required": true, "description": "Số tiền giao dịch" }, { "name": "transaction_currency", "type": "string", "required": true, "description": "Mã tiền tệ" }] }, { "name": "customer", "type": "object", "required": true, "description": "Thông tin khách hàng", "children": [{ "name": "id", "type": "uuidv4", "required": true, "description": "ID khách hàng nội bộ" }, { "name": "customer_id", "type": "string", "required": true, "description": "ID khách hàng của merchant" }] }]} />

**Ví dụ request body:**

<Response title="REQUEST">
```json
{
  "timestamp": 1757058220,
  "notification_type": "ORDER_PAID",
  "order": {
    "id": "e2c195be-c721-47eb-b323-99ab24e52d85",
    "order_id": "NPSETVI00101000042R",
    "order_status": "CAPTURED",
    "order_currency": "VND",
    "order_amount": "50000.00",
    "order_invoice_number": "SUB_202509_001",
    "custom_data": [],
    "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "ip_address": "14.xxx.xxx.xxx",
    "order_description": "Thanh toán định kỳ gói Premium tháng 9/2025"
  },
  "transaction": {
    "id": "384c66dd-41e6-4316-a544-b4141682595c",
    "payment_method": "CARD",
    "transaction_id": "68ba94ac80123",
    "transaction_type": "PAYMENT",
    "transaction_date": "2025-09-01 00:00:15",
    "transaction_status": "APPROVED",
    "transaction_amount": "50000",
    "transaction_currency": "VND",
    "authentication_status": "AUTHENTICATION_SUCCESSFUL",
    "card_number": "4111XXXXXXXX1111",
    "card_holder_name": "NGUYEN VAN A",
    "card_expiry": "12/26",
    "card_funding_method": "CREDIT",
    "card_brand": "VISA"
  },
  "customer": {
    "id": "bae12d2f-0580-4669-8841-cc35cf671613",
    "customer_id": "CUST_001"
  }
}
```
</Response>

**Xử lý IPN endpoint:**

<Php title="PHP">
```php
Route::post('/payment/ipn', function(Request $request) {
  // Verify secret key
  if ($request->header('X-Secret-Key') !== $secretKey) {
      return response()->json(['error' => 'Unauthorized'], 401);
  }

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
