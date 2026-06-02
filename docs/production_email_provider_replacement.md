# Định hướng thay thế Ethereal cho production email

Cập nhật ngày: 2026-05-31

## 1. Vấn đề hiện tại

`2-notification-service` đang gửi email bằng Nodemailer và `email-templates`, nhưng transport trong `server/2-notification-service/src/helpers.ts` hiện hardcode:

```ts
host: 'smtp.ethereal.email',
port: 587
```

Ethereal chỉ là hộp thư ảo để test trong quá trình development. Email gửi qua Ethereal không được phát đến inbox thật của người dùng, mà chỉ tạo preview URL để lập trình viên xem nội dung email. Vì vậy production cần thay bằng một nhà cung cấp SMTP/transactional email thật.

Mục tiêu thay thế:

- Gửi được email verify account, OTP, reset password, order, refund và withdrawal đến inbox thật.
- Giữ lại `nodemailer` để thay đổi ít code nhất.
- Không ghi SMTP password/API key thật vào repo.
- Hỗ trợ domain authentication bằng SPF, DKIM và DMARC để giảm spam.
- Có log, bounce/failed delivery và quota rõ ràng.

## 2. Bảng so sánh dịch vụ đề xuất

Thông tin free tier/pricing bên dưới đã được đối chiếu từ trang chính thức ngày 2026-05-31, nhưng vẫn cần kiểm tra lại trước khi deploy vì pricing của các nhà cung cấp email có thể thay đổi.

| Provider | Free plan / Giá rẻ | SMTP/API | Điểm mạnh | Lưu ý | Nguồn |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Brevo | Free 300 email/ngày; gói Starter bắt đầu từ 5,000 email/tháng | SMTP relay và API | Cân bằng tốt cho production v1, dễ thay cho Nodemailer, có transactional email và log | Quota tính theo ngày; cần verify domain để gửi ổn định | [Brevo Pricing](https://www.brevo.com/pricing/) |
| Sender.net | Free 15,000 email/tháng, 2,500 subscribers | SMTP/API cho email marketing và transactional | Free quota lớn, phù hợp giai đoạn đầu nếu traffic chưa cao | Cần kiểm tra kỹ tính năng transactional và giới hạn theo tài khoản | [Sender Pricing](https://www.sender.net/pricing/) |
| Mailjet | Free 6,000 email/tháng, 200 email/ngày | API, SMTP Relay, Webhooks | SMTP rõ ràng, có webhook/log, phù hợp transactional email volume vừa | Giới hạn 200 email/ngày trên free plan | [Mailjet Pricing](https://www.mailjet.com/pricing/) |
| Resend | Free 3,000 email/tháng, 100 email/ngày; Pro từ $20/tháng cho 50,000 email | API và SMTP relay | Developer experience tốt, API hiện đại, cấu hình domain gọn | Free quota thấp hơn Brevo/Sender/Mailjet | [Resend Pricing](https://resend.com/pricing) |
| Zoho ZeptoMail | First credit miễn phí 10,000 transactional emails; pay-as-you-go | SMTP và API | Tập trung vào transactional email, giá linh hoạt | Cần mua credit khi hết free credit; nên kiểm tra điều kiện credit theo khu vực/tài khoản | [ZeptoMail Pricing](https://www.zoho.com/zeptomail/pricing.html) |
| Amazon SES | $0.10/1,000 outbound emails; free tier 3,000 message charges/tháng trong 12 tháng | SMTP và API | Rẻ nhất khi scale, độ tin cậy cao nếu cấu hình đúng | Setup phức tạp hơn, có sandbox ban đầu, cần request production access | [Amazon SES Pricing](https://aws.amazon.com/ses/pricing/) |

## 3. Thứ tự khuyến nghị cho IT HUST App

1. **Brevo cho production v1**  
   Đây là lựa chọn mặc định nên dùng đầu tiên. Brevo có SMTP relay nên gần như thay được Ethereal trực tiếp trong Nodemailer, free 300 email/ngày đủ cho giai đoạn khởi động, không cần thẻ khi đăng ký free plan, và UI quản lý log/bounce khá dễ dùng.

2. **Sender.net hoặc Mailjet nếu ưu tiên free quota**  
   Sender.net có quota miễn phí lớn theo tháng; Mailjet có SMTP/API/Webhooks rõ ràng và free quota vừa phải. Hai lựa chọn này phù hợp nếu số email hằng ngày không vượt giới hạn free plan.

3. **Resend nếu ưu tiên developer experience**  
   Resend rất gọn cho đội ngũ dev và API hiện đại, nhưng free quota thấp hơn. Nếu sau này muốn chuyển từ SMTP sang API-first, Resend là lựa chọn đáng cân nhắc.

4. **Amazon SES khi cần scale với chi phí thấp nhất**  
   SES phù hợp khi hệ thống đã có traffic ổn định và cần tối ưu chi phí trên mỗi 1,000 email. Tuy nhiên không nên chọn cho v1 nếu cần deploy nhanh, vì cần cấu hình domain, sandbox/production access, IAM và monitoring cẩn thận hơn.

## 4. Hướng cấu hình lại notification service

Runtime code đã chuyển SMTP transport sang biến môi trường. Quy ước hiện tại: `NODE_ENV=production` dùng Brevo, còn `NODE_ENV=development` hoặc `NODE_ENV=test` dùng Ethereal cho local/test để không gửi email thật.

```env
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USERNAME=REPLACE_WITH_BREVO_SMTP_LOGIN
SMTP_PASSWORD=REPLACE_WITH_BREVO_SMTP_KEY
SENDER_EMAIL=no-reply@ithust.shop
SENDER_NAME=ITHust App
```

Ý nghĩa biến:

- `SMTP_HOST`: host SMTP của provider production.
- `SMTP_PORT`: port SMTP, mặc định nên dùng `587` với STARTTLS.
- `SMTP_SECURE`: `false` cho port `587`, `true` nếu dùng port `465`.
- `SMTP_USERNAME`: Brevo SMTP login email address, lấy trong mục SMTP của Brevo.
- `SMTP_PASSWORD`: Brevo SMTP key, không dùng REST API key.
- `SENDER_EMAIL`: địa chỉ From đã verify domain, ví dụ `no-reply@ithust.shop`.
- `SENDER_EMAIL_PASSWORD`: biến legacy fallback, không nên dùng cho Brevo production mới.
- `SENDER_NAME`: tên hiển thị trong inbox người nhận.

Ví dụ với Brevo:

- `SMTP_HOST=smtp-relay.brevo.com`
- `SMTP_PORT=587`
- `SMTP_SECURE=false`
- `SMTP_USERNAME=<Brevo SMTP login email address>`
- `SMTP_PASSWORD=<Brevo SMTP key>`
- `SENDER_EMAIL=no-reply@ithust.shop`
- `SENDER_NAME=ITHust App`

Code production nên tạo transport theo env thay vì gắn cứng provider:

```ts
const smtpTransport = nodemailer.createTransport({
  host: config.SMTP_HOST,
  port: Number(config.SMTP_PORT || 587),
  secure: config.SMTP_SECURE === 'true',
  auth: {
    user: config.SMTP_USERNAME || config.SENDER_EMAIL,
    pass: config.SMTP_PASSWORD || config.SENDER_EMAIL_PASSWORD
  }
});
```

Local development/test dùng Ethereal:

```env
NODE_ENV=development
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USERNAME=<ethereal-user>
SMTP_PASSWORD=<ethereal-password>
SENDER_EMAIL=<ethereal-user>
SENDER_EMAIL_PASSWORD=legacy-placeholder
SENDER_NAME=ITHust App
```

Tạo Ethereal credentials tại `https://ethereal.email/create`. Không dùng Brevo SMTP key trong `.env` local hoặc test. `server/2-notification-service/src/config.ts` sẽ giữ host Ethereal cho mọi môi trường không phải production, kể cả khi `SMTP_HOST` local bị đặt nhầm sang Brevo.

## 5. Checklist triển khai production email

- Tạo email gửi hệ thống, ví dụ `no-reply@ithust.shop`.
- Thêm và verify domain trên provider đã chọn.
- Cấu hình DNS records theo provider: SPF, DKIM và DMARC.
- Tạo SMTP key/API key riêng cho production.
- Đưa secret vào Kubernetes Secret, không commit giá trị thật.
- Cập nhật manifest `kubernetes/k3s/2-notifications-service/notification.yaml` nếu bổ sung env mới.
- Cập nhật `.env.production.example` của notification service với placeholder mới.
- Build và deploy lại image `ithust-notification`.
- Gửi thử email verify/reset password qua flow thật và kiểm tra inbox, spam folder, provider logs và bounce logs.

## 6. Acceptance criteria cho lần implementation tiếp theo

- `server/2-notification-service/src/helpers.ts` không còn hardcode `smtp.ethereal.email`.
- Production có thể đổi provider chỉ bằng env/Kubernetes Secret.
- Local development/test dùng Ethereal, không gửi email thật và không dùng Brevo key.
- Các flow email hiện có không đổi message contract RabbitMQ.
- Không có secret thật trong `.env.production.example`, Kubernetes example secret, docs hoặc source code.
