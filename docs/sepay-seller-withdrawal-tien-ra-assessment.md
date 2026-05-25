# Đánh giá SePay "Tiền ra" cho seller withdrawal

Ngày rà soát: 2026-05-23

## Kết luận

Không nên dùng SePay **"Tiền ra"** như API chuyển khoản tự động cho seller withdrawal.

Trong tài liệu hiện có ở `server/7-order-service/markdown-file`, **"Tiền ra"** được mô tả là loại sự kiện webhook khi tài khoản ngân hàng đã liên kết phát sinh giao dịch chuyển tiền đi. Đây là cơ chế theo dõi/đối soát giao dịch tiền đi, không phải endpoint để hệ thống chủ động phát lệnh chuyển khoản từ tài khoản nền tảng sang tài khoản seller.

Hướng phù hợp hiện tại:

- Giữ withdrawal request trong `4-users-service`.
- Giữ guard `availableBalance >= amount` trước khi chấp nhận withdrawal.
- Tiếp tục gửi email/Gmail thông qua `2-notification-service`.
- Chỉ triển khai payout tự động khi có API chuyển tiền/chi hộ chính thức từ SePay hoặc một payout provider khác đã được xác nhận.

## Tài liệu và code đã rà

Tài liệu SePay:

- `server/7-order-service/markdown-file/sepay-webhooks/tao-webhook.md`
- `server/7-order-service/markdown-file/sepay-webhooks/tai-khoan-ngan-hang.md`
- `server/7-order-service/markdown-file/sepay-webhooks/tich-hop-webhook.md`

Code hiện có:

- `server/4-users-service/src/services/withdrawal.service.ts`
- `server/4-users-service/src/models/seller.schema.ts`
- `server/4-users-service/src/models/withdrawal.schema.ts`
- `server/2-notification-service/src/queues/email.consumer.ts`
- `server/2-notification-service/src/server.ts`

## Vì sao "Tiền ra" chưa đủ cho payout tự động

Tài liệu webhook SePay mô tả:

- **"Tiền ra"** là loại sự kiện gửi webhook khi có tiền chuyển đi.
- Payload giao dịch có thể có `transferType: "out"`.
- Webhook **"Tiền ra"** bị giới hạn theo ngân hàng và loại VA/TKP trong tài liệu hiện tại.

Những thông tin này phù hợp để:

- Theo dõi giao dịch chuyển tiền đi đã xảy ra.
- Đối soát payout được thực hiện bằng kênh khác.
- Map giao dịch tiền ra vào withdrawal nếu nội dung/reference đủ mạnh.

Những thông tin này chưa đủ để kết luận hệ thống có thể:

- Tạo lệnh chuyển khoản đến tài khoản seller.
- Nhận mã payout từ SePay.
- Theo dõi trạng thái xử lý payout.
- Retry an toàn khi provider lỗi.
- Chống gửi trùng lệnh chuyển khoản bằng idempotency key.

Vì vậy, chỉ bật webhook **"Tiền ra"** không biến withdrawal request hiện tại thành luồng chuyển khoản tự động.

## Hiện trạng withdrawal trong hệ thống

Seller schema đã có:

- `availableBalance`
- `pendingWithdrawals`
- `bankAccount`

Withdrawal flow hiện tại đã có kiểm soát số dư quan trọng:

- `createWithdrawal` kiểm tra amount hợp lệ.
- Service kiểm tra `availableBalance` hiện có không nhỏ hơn amount seller request.
- Service dùng conditional update với điều kiện `availableBalance: { $gte: amount }`.
- Nếu update thành công, `availableBalance` giảm và `pendingWithdrawals` tăng.
- Nếu update không thành công, request bị trả lỗi `Insufficient available balance`.
- Withdrawal được tạo với trạng thái `PENDING`.

Điểm cần giữ khi triển khai payout tự động sau này là conditional update/reserve balance. Đây là guard chống trường hợp seller gửi nhiều request đồng thời để rút vượt số tiền available hiện có.

## Email/Gmail qua notification service

Withdrawal hiện publish message qua:

- exchange `ithust-withdrawal-notification`
- routing key `withdrawal-email`
- queue `withdrawal-email-queue`

`2-notification-service` consume message bằng `consumeWithdrawalEmailMessages` và gọi `sendEmail(...)`.

Khi mở rộng sang payout tự động, vẫn nên giữ nguyên nguyên tắc:

- Service xử lý withdrawal/payout chỉ publish email event.
- `2-notification-service` chịu trách nhiệm gửi Gmail/email.
- Không gửi email trực tiếp từ logic tích hợp SePay/provider.
- Có thể bổ sung template theo trạng thái như request created, payout processing, payout completed, payout failed nếu nghiệp vụ cần.

## Định hướng tương lai nếu có API payout thật

Nếu SePay hoặc provider khác cung cấp API chuyển tiền/chi hộ chính thức, nên triển khai theo hướng:

1. `4-users-service` vẫn là owner của withdrawal vì đây là nghiệp vụ seller balance.
2. Thêm provider adapter riêng, ví dụ:
   - `createPayout(withdrawal)`
   - `getPayoutStatus(providerPayoutId)`
   - `handlePayoutWebhook(payload)` nếu provider hỗ trợ callback.
3. Khi seller request withdrawal:
   - Validate amount và bank account.
   - Reserve balance bằng conditional update.
   - Tạo withdrawal record có reference/idempotency key nội bộ.
   - Publish withdrawal email qua notification service.
   - Gửi lệnh payout sang provider sau khi record đã tồn tại để đối soát.
4. Nếu provider có webhook hoặc SePay có webhook `transferType: "out"`:
   - Chỉ dùng để đối soát giao dịch tiền ra.
   - Match theo reference/content/idempotency reference, không chỉ theo amount.
   - Chống xử lý trùng webhook.

## Việc chưa nên làm

- Không map mọi webhook `transferType: "out"` thành withdrawal completed.
- Không giả định SePay có API payout nếu tài liệu hiện tại chưa thể hiện rõ.
- Không chuyển ownership withdrawal sang `7-order-service`.
- Không bỏ guard `availableBalance >= amount`.
- Không gửi Gmail/email trực tiếp từ code tích hợp payout.

