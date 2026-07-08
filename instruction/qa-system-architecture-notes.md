# Q&A: Kiến trúc hệ thống ITHust

Tổng hợp các câu hỏi/trả lời trong phiên trao đổi về RabbitMQ, luồng đơn hàng/hoàn tiền/rút tiền, đa dạng database, CI/CD + Kubernetes, và kết nối gateway.

---

## 1. Kiểm tra toàn bộ các producer, consumer RabbitMQ trong dự án — message chứa thông tin gì

Toàn bộ producer đều dùng chung 2 helper trong `server/ithust-shared/src/rabbitmq.ts`:
`publishDirectMessage` (dòng 38) và `publishFanoutMessage` (dòng 62) — message luôn là JSON string được `Buffer.from()` rồi publish.

### 1. Email thông báo Auth — exchange `ithust-email-notification` (direct, key `auth-email`)

**Consumer:** `consumeAuthEmailMessages` tại `server/2-notification-service/src/queues/email.consumer.ts:19`, queue `auth-email-queue`. Đọc theo interface `IAuthEmailMessage` (dòng 10-17): `receiverEmail`, `template`, `username?`, `verifyLink?`, `resetLink?`, `otp?`.

**Producers (Auth + Users service):**
- Đăng ký: `{ receiverEmail, verifyLink, template: 'verifyEmail' }` — `3-auth-service/src/controllers/signup.ts:51-62`
- Đăng nhập cần OTP: `{ receiverEmail, username, otp, template: 'otpEmail' }` — `signin.ts:47-59`
- Quên mật khẩu: `{ receiverEmail, resetLink, username, template: 'forgotPassword' }` — `password.ts:34-44`; reset thành công: `{ username, template: 'resetPasswordSuccess' }` — `password.ts:67`, `password.ts:94`
- Gửi lại email xác thực: `current-user.ts:29-40`
- Admin khóa/mở tài khoản: `{ receiverEmail, username, template: 'restrictionStatus', status, reason, message }` — `4-users-service/src/services/admin.service.ts:269-286`

### 2. Email đơn hàng — exchange `ithust-order-notification` (direct, key `order-email`)

**Consumer:** `consumeOrderEmailMessages` tại `email.consumer.ts:67`, queue `order-email-queue`. Payload rộng (dòng 88-120): `receiverEmail, template, username, sender, offerLink, amount, buyerUsername, sellerUsername, title, description, deliveryDays, orderId, orderDue, requirements, orderUrl, originalDate, newDate, reason, subject, header, type, message, serviceFee, total, buyerEmail, bankName, accountNumber, accountName, refundRequestId, recipientUsername, actorUsername, disputeId, decision`. Template `orderPlaced` gửi kèm cả `orderReceipt` (dòng 158-161).

**Producers:**
- Chat service khi tin nhắn có offer: `message.service.ts:18-35`
- Order service — thanh toán thành công (`orderPlaced`): `order.service.ts:82-104`
- Seller giao hàng (`orderDelivered`): `order.service.ts:220-236`
- Xin gia hạn (`orderExtension`): `order.service.ts:268-284`
- Duyệt/từ chối gia hạn (`orderExtensionApproval`): `order.service.ts:322-339` và `368-379`
- Refund service — `refundStatus`: `refund.service.ts:74-91`; `refundRequest`: `refund.service.ts:289-307`
- Dispute service — `disputeStatus`: `dispute.service.ts:24-40`

### 3. Email rút tiền — exchange `ithust-withdrawal-notification` (direct, key `withdrawal-email`)

- **Producer** (Users service): `4-users-service/src/services/withdrawal.service.ts:129-150`
- **Consumer:** `consumeWithdrawalEmailMessages` tại `email.consumer.ts:179`, queue `withdrawal-email-queue`

### 4. Cập nhật Buyer — exchange `ithust-buyer-update` (direct, key `user-buyer`)

**Consumer:** `consumeBuyerDirectMessage` tại `4-users-service/src/queues/user.consumer.ts:20`, queue `user-buyer-queue`:
- `type: 'auth'` → tạo buyer mới `{ username, email, profilePicture, country, createdAt }` — producer Auth service khi đăng ký, `auth.service.ts:17-31`
- `type` khác → cập nhật `purchasedGigs` từ `{ buyerId, purchasedGigs }` — producer Order service khi duyệt (`order.service.ts:182-188`) và khi hủy (`order.service.ts:130-136`)

### 5. Cập nhật Seller — exchange `ithust-seller-update` (direct, key `user-seller`)

**Consumer:** `consumeSellerDirectMessage` tại `user.consumer.ts:55`, queue `user-seller-queue`. Payload chung `{ type, sellerId, ongoingJobs, completedJobs, totalEarnings, recentDelivery, gigSellerId, count }`:

| `type` | Producer | Nội dung |
|---|---|---|
| `create-order` | Order service khi thanh toán xong — `order.service.ts:69-81` | `{ sellerId, ongoingJobs: 1 }` |
| `approve-order` | Order service khi buyer duyệt — `order.service.ts:164-180` | `{ sellerId, buyerId, ongoingJobs, completedJobs, totalEarnings, recentDelivery }` |
| `cancel-order` | Order service khi hủy — `order.service.ts:122-128` | `{ sellerId }` |
| `refund-order` | Refund service — `refund.service.ts:64-72` | `{ sellerId, ongoingJobs: -1 }` |
| `update-gig-count` | Gig service khi tạo/xóa gig — `gig.service.ts:37-43, 51-57` | `{ gigSellerId, count: 1 hoặc -1 }` |

### 6. Review — exchange `ithust-review` (fanout, duy nhất không routing key)

**Producer** (Review service): `review.service.ts:36-51` — `{ gigId, reviewerId, sellerId, review, rating, orderId, createdAt, type: 'buyer-review'|'seller-review' }`

**2 consumers cùng nhận:**
- Users service, queue `seller-review-queue` — `user.consumer.ts:94`: cập nhật rating seller, publish tiếp sang `ithust-update-gig`
- Order service, queue `order-review-queue` — `7-order-service/src/queues/order.consumer.ts:10`: gắn review vào order

### 7. Cập nhật rating Gig — exchange `ithust-update-gig` (direct, key `update-gig`)

- **Producer** (Users service, phát tiếp từ luồng review): `{ type: 'updateGig', gigReview: <JSON string> }` — `user.consumer.ts:108-114`
- **Consumer** (Gig service), queue `gig-update-queue`: `gig.consumer.ts:21-24`

### 8 & 9. Luồng seed dữ liệu (request/response 2 chiều Gig ↔ Users)

- Gig hỏi seller — exchange `ithust-gig`, key `get-sellers`: `{ type: 'getSellers', count }` — `seed.ts:8-14`. Users nhận tại `user-gig-queue` (`user.consumer.ts:123`)
- Users trả kết quả — exchange `ithust-seed-gig`, key `receive-sellers`: `{ type: 'receiveSellers', sellers, count }` — `user.consumer.ts:139-145`. Gig nhận tại `seed-gig-queue` (`gig.consumer.ts:31-46`)

**Ghi chú:** tất cả queue `durable: true, autoDelete: false`; Notification service `nack` không requeue khi lỗi; các consumer Users/Gig/Order `ack` vô điều kiện, không try/catch quanh phần parse — message JSON hỏng sẽ throw và không được ack.

---

## 2. Luồng giao dịch đơn hàng Buyer ↔ Seller, hoàn tiền, rút tiền — chi tiết các bước và status

### A. Luồng đơn hàng

1. **Offer trong chat** — Chat service lưu message, nếu `hasOffer` publish email `offer` sang Notification — `message.service.ts:15-38`
2. **Đặt hàng** (Order service): `status: PENDING_PAYMENT`, `paymentStatus: PENDING`. Phí dịch vụ = 5.5% giá + 50.000 VND cố định nếu giá < 1.250.000 VND — `create.ts:18-23, 25-78`. Tạo Stripe PaymentIntent, lưu `providerPaymentId` v.v.
3. **Webhook `payment_intent.succeeded`** — `stripe.ts:42-58`: chống trùng bằng `PaymentEventModel.providerEventId`; đối chiếu amount/currency; gọi `activatePaidOrder` (`order.service.ts:44-107`): `status: PENDING_PAYMENT → IN_PROGRESS`, `paymentStatus: PENDING → HELD` (escrow). Users service: seller `ongoingJobs +1`. Notification: email `orderPlaced` + `orderReceipt`.
4. **(Tùy chọn) Gia hạn deadline:**
   - Seller xin gia hạn: ghi `requestExtension{...}`, không đổi status — `order.service.ts:242-288`
   - Buyer đồng ý: cập nhật `offer.newDeliveryDate`, reset `requestExtension` — `order.service.ts:290-343`
   - Buyer từ chối: **hoàn tiền toàn bộ** qua `refundHeldOrderToOriginalSource` (trigger `EXTENSION_REJECTED`) — `order.service.ts:345-389`
5. **Seller giao hàng:** `status → 'Delivered'`, `delivered: true` — `order.service.ts:193-240`. Trước đó chạy `processOverdueRefunds()`.
6a. **Buyer nghiệm thu** (`approveOrder`, `order.service.ts:141-191`): `approved: true`, `status → Completed`, `paymentStatus: HELD → RELEASED`. Users service: seller `ongoingJobs -1, completedJobs +1, totalEarnings += price, availableBalance += price`; buyer: push gigId vào `purchasedGigs`.
6b. **Buyer mở tranh chấp** (`createQualityDispute`, `dispute.service.ts:55-101`): order `Delivered → DISPUTED`, Dispute `status: SELLER_RESPONSE_REQUIRED`. Admin `decideDispute` (`dispute.service.ts:154-219`):
   - `REVISION_REQUIRED` → order `DISPUTED → REVISION_REQUIRED`, `delivered: false`
   - `REFUND_BUYER` → tạo/dùng RefundRequest (`QUALITY_DISPUTE`, `ADMIN`) → chạy luồng hoàn tiền
   - `RELEASE_SELLER` → `approveOrder(..., allowDisputed=true)`
7. **Hủy đơn** (`cancelOrder`, `order.service.ts:109-139`): `cancelled: true`, `status → Cancelled`. Seller `ongoingJobs -1, cancelledJobs +1`; buyer bị `$pull` gigId.
8. **Review** (fanout `ithust-review`): Order gắn review + `events.buyerReview/sellerReview`; Users cộng rating seller rồi chuyển tiếp Gig cập nhật rating.

**Tóm tắt status:** `status`: `PENDING_PAYMENT → IN_PROGRESS → Delivered → Completed` (nhánh phụ: `Cancelled`, `DISPUTED`, `REVISION_REQUIRED`, `REFUNDED`). `paymentStatus` (enum `order.schema.ts:49-53`): `PENDING → HELD → RELEASED` hoặc `HELD → REFUND_PROCESSING → REFUNDED`.

### B. Luồng hoàn tiền (Refund)

4 trigger (`refund-request.schema.ts:19`), đều đổ về `refundHeldOrderToOriginalSource`:
1. `EXTENSION_REJECTED` — buyer từ chối gia hạn, hoặc `createRefundRequest` (chỉ khi đang có yêu cầu gia hạn pending, còn trước deadline) — `refund.service.ts:272-277`
2. `OVERDUE_AUTO` — `processOverdueRefunds` quét tối đa 25 đơn quá hạn, tự hoàn (`decisionSource: POLICY`) — `refund.service.ts:328-359`
3. `QUALITY_DISPUTE` — admin xử tranh chấp `REFUND_BUYER`
4. `BUYER_REQUEST` — mặc định schema

**Các bước trong `refundHeldOrderToOriginalSource`** (`refund.service.ts:173-231`):
1. Kiểm tra: chưa approved, `paymentStatus === 'HELD'`, provider Stripe — dòng 55-62
2. RefundRequest: tạo mới hoặc tái dùng, `status: PROCESSING`; nếu đã `COMPLETED/PROCESSING` → trả về luôn (idempotent) — dòng 94-136
3. Order: `paymentStatus: HELD → REFUND_PROCESSING` (atomic) + emit socket — dòng 187-195
4. Gọi Stripe `refunds.create` với idempotency key `refund-<refundRequestId>` — dòng 198
5. Nếu `succeeded` ngay: RefundRequest → `COMPLETED`; `completeRefundedOrder`: order `paymentStatus → REFUNDED`, `status → REFUNDED`, reset `delivered/approved`, set `refundedAt` — dòng 138-171. Users service: seller `ongoingJobs -1`. Email `refundStatus`.
6. Nếu còn pending: chờ webhook `charge.refunded` → `completeStripeRefundForPaymentIntent` hoàn tất — dòng 233-253
7. Nếu Stripe lỗi: RefundRequest → `FAILED`, order rollback `REFUND_PROCESSING → HELD` — dòng 214-228

**Status RefundRequest:** `PENDING → PROCESSING → COMPLETED | FAILED` (schema còn có `REJECTED, MANUAL_REVIEW, RECONCILIATION_REQUIRED`). Luôn hoàn về nguồn thanh toán gốc (`settlementMode: ORIGINAL_SOURCE`). Vì refund xảy ra khi tiền còn `HELD`, không cần trừ `availableBalance` seller, chỉ trừ `ongoingJobs`.

### C. Luồng rút tiền (Withdrawal — Users service + Stripe Connect)

File: `4-users-service/src/services/withdrawal.service.ts`

1. **`createWithdrawal`** (dòng 157-259): kiểm tra cờ `STRIPE_AUTOMATIC_PAYOUT_ENABLED`, giới hạn min/max; refresh trạng thái Stripe Connect, yêu cầu `stripePayoutReadiness === 'READY'` (dòng 170-177, thông báo lỗi cụ thể dòng 97-118); trừ số dư atomic `availableBalance -= amount, pendingWithdrawals += amount` (dòng 183-191); tạo Withdrawal `status: PROCESSING`
2. **Chuyển tiền qua Stripe Connect** (cùng request): `configureManualPayoutSchedule` + `checkAndEnsurePlatformBalance` → `createTransfer` (lưu `providerTransferId`) → `createConnectedAccountPayout` → Withdrawal `PROCESSING → COMPLETED`, set `processedDate, providerPayoutId, paymentReference`. Publish email `withdrawalStatus`.
3. **Xử lý lỗi** (dòng 239-258): lỗi trước transfer → `FAILED`, hoàn đủ số dư; lỗi sau khi transfer đã tạo → `RECONCILIATION_REQUIRED`, chỉ trừ `pendingWithdrawals`, không hoàn `availableBalance` — cần admin đối soát.
4. **Webhook Stripe Connect** (dòng 458-488):
   - `payout.paid` → `PROCESSING → COMPLETED`, `pendingWithdrawals -= amount` — dòng 406-428
   - `payout.failed` → `PROCESSING → RECONCILIATION_REQUIRED` (kèm `providerFailureCode/Message`) — dòng 430-456
   - `payout.created/updated` → chỉ cập nhật `payoutStatus`
5. **Admin xử lý thủ công** (`updateWithdrawalStatus`, dòng 351-394): chỉ áp dụng cho `PENDING/MANUAL_REVIEW/FAILED/RECONCILIATION_REQUIRED`. Với `MANUAL_BANK` (không phải Stripe): `REJECTED/FAILED` hoàn `availableBalance`, `COMPLETED` chỉ trừ `pendingWithdrawals` (dòng 374-386).

**Status Withdrawal:** `PENDING → PROCESSING → COMPLETED | FAILED | REJECTED | MANUAL_REVIEW | RECONCILIATION_REQUIRED` — enum `withdrawal.schema.ts:12-16`.

### Điểm đáng lưu ý

Tiền chỉ tồn tại ở 3 trạng thái logic: **HELD** (escrow), **RELEASED** (vào `availableBalance` seller), **REFUNDED** (về thẻ buyer). Mọi chuyển trạng thái dùng `findOneAndUpdate` có điều kiện tiền-trạng-thái nên tránh double-release/double-refund; webhook Stripe chống trùng bằng `PaymentEventModel.providerEventId`. Điểm yếu: cập nhật liên-service qua RabbitMQ (vd `availableBalance += totalEarnings` khi approve) không có retry nếu consumer lỗi — consumer Users service ack vô điều kiện.

---

## 3. Vì sao dùng các cơ sở dữ liệu khác nhau cho các microservice khác nhau

### Bản đồ thực tế trong code

| Service | Database | Bằng chứng |
|---|---|---|
| Auth | **MySQL** (Sequelize) | `3-auth-service/src/database.ts:8-14` |
| Users, Gig, Chat, Order | **MongoDB** (Mongoose) | `order.schema.ts:96`, `withdrawal.schema.ts:43` |
| Review | **PostgreSQL** (pg Pool) | `8-review-service/src/database.ts:16-22`, SQL thuần `review.service.ts:29-35` |
| Gig (thêm) | **Elasticsearch** (tìm kiếm) + **Redis** (cache) | `5-gig-service/src/elasticsearch.ts`, `redis/gig.cache.ts` |
| Gateway | **Redis** (cache user online, socket) | `1-gateway-service/src/redis/gateway.cache.ts` |
| Notification | Không DB — stateless | |
| Tất cả | Elasticsearch dùng chung cho logging (winston-elasticsearch) | |

### Lý do 1 — Database-per-service: cô lập và tự chủ

Mỗi service sở hữu dữ liệu riêng, không service nào đọc thẳng DB của service khác. Nếu chung 1 DB: đổi schema service này làm vỡ service khác; query nặng của 1 service (vd lọc withdrawal đủ filter, `withdrawal.service.ts:261-349`) làm chậm cả hệ thống; DB chết là chết tất cả. Vì đã tách DB, việc mỗi DB khác loại không tốn thêm chi phí kiến trúc — dữ liệu liên service vốn đã đồng bộ qua RabbitMQ.

### Lý do 2 — Polyglot persistence: chọn đúng DB cho hình dạng dữ liệu

- **Auth → MySQL:** dữ liệu phẳng, quan hệ, cần toàn vẹn nghiêm ngặt (unique email/username), ACID.
- **Order/Chat/Gig/Users → MongoDB:** document lồng sâu, đa hình (order chứa `offer{}`, `deliveredWork[]`, `events{}`, `requestExtension{}`, `buyerReview{}` — `order.schema.ts:4-94`); atomic update trên 1 document thay transaction (vd release tiền chỉ khi `paymentStatus: 'HELD'` — `order.service.ts:142-160`; trừ số dư rút tiền có điều kiện `$gte` — `withdrawal.service.ts:183-188`); Chat cần ghi nhiều, schema tin nhắn linh hoạt.
- **Review → PostgreSQL:** dữ liệu append-only, phẳng, cần aggregate (đếm/trung bình rating) — SQL thuần `pool.query` (`review.service.ts:29-35`). Kết quả tổng hợp nhân bản sang seller/gig qua fanout.
- **Elasticsearch cho Gig:** full-text search + faceted filter (từ khóa, khoảng giá...) — MongoDB là source of truth, ES là read model (`gig.service.ts:44` — `addDataToIndex`).
- **Redis cho Gateway/Gig:** dữ liệu phù du, đọc nhanh, mất không sao (user online, category vừa xem).

### Lý do 3 — Scale độc lập theo tải thực tế

Mỗi loại tải khác nhau: Chat ghi liên tục, Gig đọc/tìm kiếm chủ yếu, Auth đột biến lúc đăng nhập, Review ghi thưa. Tách DB cho phép scale MongoDB của Chat mà không đụng MySQL của Auth.

### Cái giá phải trả

- Không transaction xuyên service → eventual consistency qua RabbitMQ (điểm yếu: consumer ack vô điều kiện, message lỗi là mất)
- Dữ liệu nhân bản có chủ đích: user tồn tại cả MySQL (Auth) lẫn MongoDB (Users); review tồn tại cả PostgreSQL lẫn trong document order/gig
- Chi phí vận hành: 4 loại DBMS (MySQL, MongoDB, PostgreSQL, Redis) + Elasticsearch

---

## 4. Cơ chế tạo Docker image, lưu Docker Hub, deploy Kubernetes, auto-scaling

### 1. Build Docker image — multi-stage Dockerfile

Mỗi service có Dockerfile 2 giai đoạn, vd `7-order-service/Dockerfile:1-35`:
- **Stage `builder`**: `node:22-alpine3.18`, copy `package.json`/`tsconfig.json`, cài dependency, copy `src/`, `npm run build`
- **Stage chạy thật**: cùng base image, `npm install --omit=dev`, copy duy nhất `build/` từ stage 1 (dòng 31) → image nhỏ, không chứa source TS

Dùng package private `@19010853/ithust-shared` từ GitHub Packages: nhận `ARG NPM_TOKEN`, ghi `.npmrc` tạm rồi **xóa ngay trong cùng RUN** (dòng 8-13) — tránh token lưu vào layer image.

(`volumes/build-all.ps1` và Jenkins trong `docker-compose.yaml:148-168` chỉ phục vụ build/chạy local — pipeline chính thức là GitHub Actions.)

### 2. CI/CD — GitHub Actions push Docker Hub

10 workflow trong `.github/workflows/`: 8 backend + frontend, tất cả gọi chung reusable workflow `_deploy-backend.yml`.

**Trigger theo path:** chỉ chạy khi push branch `production` và đổi đúng thư mục service, vd Order chỉ build khi `server/7-order-service/**` hoặc `kubernetes/k3s/7-order-service/**` đổi (`deploy-order.yml:3-10`).

**Các bước** (`_deploy-backend.yml:47-123`):
1. Checkout + validate 6 secrets (`DOCKERHUB_USERNAME/PASSWORD`, `NPM_TOKEN`, `KUBECONFIG_B64`, `TELEGRAM_TO/TOKEN`)
2. `npm install` kiểm tra dependency
3. **Build & push** (dòng 100-112): `docker login`, build với `--build-arg NPM_TOKEN`, tag 2 loại và push cả 2:
   - `minhkhoi779/ithust-order:stable-<run_number>` — bất biến, dùng rollback
   - `minhkhoi779/ithust-order:stable` — trượt, manifest K8s tham chiếu tag này
4. Fail → thu thập `kubectl get/describe/logs` + báo Telegram; thành công cũng báo Telegram (dòng 125-161)
5. `concurrency.group` theo tên service (dòng 51-53) — chống deploy chồng

### 3. Deploy về Kubernetes (K3s)

Runner kết nối cluster qua secret `KUBECONFIG_B64` → `~/.kube/config`, chạy (dòng 114-123):
```
kubectl apply -f kubernetes/k3s/7-order-service/
kubectl rollout restart deployment/ithust-order -n production
kubectl rollout status ... --timeout=180s
```
Vì manifest ghim tag `stable` cố định (`order.yaml:22`), cần `rollout restart` kết hợp `imagePullPolicy: Always` (dòng 23) để pod mới pull lại image mới.

**Rolling update:** `maxSurge: 0, maxUnavailable: 1` (`order.yaml:10-14`) — thay pod từng cái, không vượt số hiện có, chấp nhận tạm giảm 1 pod. HPA giữ tối thiểu 2 replica → luôn còn pod phục vụ → zero-downtime.

Mỗi service có 3 file trong `kubernetes/k3s/<service>/`: **Deployment** (image, resource, env — credential từ Secret `ithust-backend-secret` qua `secretKeyRef`), **Service** kiểu `ClusterIP`, **HPA**. Chỉ gateway expose ra ngoài qua Traefik Ingress + TLS tại `ithust.store`.

### 4. Auto-scaling — HorizontalPodAutoscaler theo CPU

Mỗi backend service có HPA `autoscaling/v2`, vd Order (`hpa.yaml:1-36`):

**Cơ chế đo:** metrics-server (K3s có sẵn) đo CPU thực tế so với CPU request. Order request `100m`, target `averageUtilization: 70` → CPU trung bình vượt 70m thì scale theo `replicas mới = ceil(replicas hiện tại × CPU hiện tại / 70%)`.

**Dải scale:** hầu hết `minReplicas: 2, maxReplicas: 3`, riêng **Gig max 4** (tải tìm kiếm nhiều nhất). Deployment không khai báo `replicas` — để HPA toàn quyền quản.

**Hành vi bất đối xứng** (dòng 20-36):
- **Scale up:** `stabilizationWindowSeconds: 0` — phản ứng ngay; +2 pod hoặc +100% mỗi 30s, `selectPolicy: Max`
- **Scale down:** chờ ổn định 60s, giảm tối đa 1 pod/30s — tránh flapping và giết pod đang xử lý dở (vd đang gọi Stripe refund)

**Vòng đời 1 lần release:** push `production` → Actions build image → push 2 tag Docker Hub → `kubectl apply` + `rollout restart` → pod mới pull `stable` → thay từng pod cũ → HPA co giãn 2↔3/4 theo CPU → báo Telegram. Hạ tầng (MongoDB, MySQL, PostgreSQL, Redis, RabbitMQ, Elasticsearch) chạy cố định `replicas: 1`, không auto-scale — chỉ 8 service ứng dụng + frontend là stateless nên scale ngang được.

**Lưu ý:** các Deployment backend hiện **chưa khai báo liveness/readiness probe** — pod mới được tính "sẵn sàng" ngay khi container start, chưa chắc đã kết nối xong DB/RabbitMQ. Có route health sẵn (theo commit `3ccb3c8`), nên gắn vào `readinessProbe` để rollout an toàn hơn.

---

## 5. Cách gateway-service kết nối với các microservice khác

Gateway kết nối qua **3 kênh riêng biệt**: HTTP đồng bộ (axios), Socket.IO (realtime), Redis (trạng thái chung). **Không** dùng RabbitMQ — message queue chỉ giữa các service phía sau với nhau.

### 1. Kênh chính — HTTP qua axios, mỗi service một client riêng

API Gateway thủ công (không proxy/nginx): mỗi service có class trong `services/api/` (auth, buyer, seller, gig, message, order, review, admin) chứa method axios gọi REST nội bộ — vd toàn bộ API đơn hàng tại `order.service.ts:13-107`.

Mỗi client tạo qua `AxiosService` (`services/axios.ts:5-28`):
- `baseURL` từ env, vd `ORDER_BASE_URL` (`order.service.ts:9`). Trong K8s trỏ DNS nội bộ cluster: `http://ithust-order.production.svc.cluster.local:4006` v.v. (`gateway.yaml:63-74`) — gọi thẳng ClusterIP Service, kube-proxy tự load-balance giữa các pod.
- Header **`gatewayToken`**: mỗi instance ký sẵn JWT `sign({ id: serviceName }, GATEWAY_JWT_TOKEN)` gắn vào mọi request (dòng 13-16).

### 2. Cách microservice xác minh request đến từ gateway

Mọi service gắn middleware dùng chung từ `ithust-shared` ngay base path, vd Order: `app.use(BASE_PATH, normalizeGatewayTokenHeader, verifyGatewayRequest, orderRoutes())` — `routes.ts:10`.

`verifyGatewayRequest` (`ithust-shared/src/gateway-middleware.ts:9-33`):
1. Không có header `gatewayToken` → 401
2. Verify JWT bằng secret chung `GATEWAY_JWT_TOKEN` (từ K8s Secret `ithust-backend-secret`)
3. `payload.id` phải nằm trong whitelist `['auth', 'seller', 'gig', 'search', 'buyer', 'message', 'order', 'review']` (dòng 7)

→ Client ngoài không gọi thẳng service được (Ingress chỉ mở gateway + thiếu gatewayToken).

### 3. Truyền danh tính user xuống service

2 lớp:
- **Client ↔ Gateway:** JWT giữ trong cookie-session (`req.session.jwt`, ký `SECRET_KEY_ONE/TWO`, 7 ngày — `server.ts:67-77`). `verifyUser` verify, gắn `req.currentUser`; route cần login đi qua nó (`routes.ts:18-32`).
- **Gateway ↔ Service:** JWT user forward tiếp qua header `Authorization: Bearer` cho cả 7 axios instance (`server.ts:97-107`). Service dùng `attachCurrentUser` từ shared decode ra `req.currentUser`.

⚠️ **Bug tiềm ẩn:** gán `axiosOrderInstance.defaults.headers['Authorization']` là mutate state toàn cục dùng chung giữa request — 2 request đồng thời của 2 user có thể race, JWT của user A bị ghi đè bởi user B. Nên truyền header theo từng request thay vì `defaults`.

### 4. Kênh realtime — Socket.IO hai tầng

Gateway vừa là Socket.IO server cho browser, vừa là Socket.IO client của Chat và Order (`sockets/socket.ts:48-90`):

```
Browser ⇄ (socket.io) Gateway ⇄ (socket.io-client) Chat service / Order service
```

Chat/Order emit event → gateway relay nguyên văn ra browser (dòng 69-75). Chiều browser → gateway xử lý `loggedInUsers`, `removeLoggedInUser`, `category` — lưu Redis rồi broadcast `online` (dòng 26-46).

### 5. Redis — chia sẻ trạng thái giữa các replica gateway

Vì gateway chạy 2-3 pod (HPA):
- **Socket.IO Redis adapter** (`server.ts:193`) — event emit từ pod này lan sang client nối vào pod khác
- **GatewayCache** (`redis/gateway.cache.ts`) — user online, category vừa xem, mọi pod đọc/ghi chung

### 6. Trường hợp đặc biệt — Stripe webhook

Stripe gọi vào gateway (route public), gateway lưu `req.rawBody` riêng cho 2 path webhook (`server.ts:113-119`) rồi forward nguyên vẹn kèm header `stripe-signature`, tắt serialize của axios (`order.service.ts:28-37`).

### Tóm tắt

| Kênh | Hướng | Dùng cho |
|---|---|---|
| Axios + `gatewayToken` JWT | Gateway → 7 service, qua ClusterIP DNS | Toàn bộ REST API |
| `Authorization: Bearer` forward | Gateway → service | Danh tính user |
| Socket.IO client | Gateway ⇄ Chat, Order | Relay realtime |
| Redis (adapter + cache) | Giữa các pod gateway | Đồng bộ socket & user online |
| RabbitMQ | Không dùng ở gateway | Chỉ giữa service backend |

---

## 6. Cách tìm DNS nội bộ của Kubernetes trên Lens

Kubernetes không lưu "danh sách DNS" để tra — tên DNS suy ra từ tên Service theo công thức:

```
<tên-service>.<namespace>.svc.cluster.local:<port>
```

### Cách xem trên Lens

1. **Network → Services**, chọn namespace `production`. Xem cột **Name**, **Namespace**, **Cluster IP**, **Ports** — vd `ithust-order` / `production` / `4006` → `ithust-order.production.svc.cluster.local:4006`. Đối chiếu với env gateway ở `gateway.yaml:63-74`.
2. **Click vào Service** → xem **Endpoints** (IP các pod đứng sau). Endpoints trống = DNS phân giải được nhưng không có pod nhận traffic.
3. **Dạng viết tắt:** cùng namespace chỉ cần `http://ithust-order:4006`; khác namespace `ithust-order.production` là đủ.

### Kiểm chứng DNS thật sự phân giải (Pod Shell trong Lens)

**Workloads → Pods** → chọn pod → **Pod Shell**:
```bash
nslookup ithust-order.production.svc.cluster.local
wget -qO- http://ithust-order.production.svc.cluster.local:4006/order-health
```

Cũng có thể kiểm tra CoreDNS: namespace `kube-system` → service `kube-dns` (K3s), IP thường `10.43.0.10` — mọi pod trỏ `nameserver` về IP này.

### Trường hợp đặc biệt

- **StatefulSet (MongoDB)** nếu Service headless (`clusterIP: None`): mỗi pod có DNS riêng `<pod-name>.<service-name>.<namespace>.svc.cluster.local` (vd `mongodb-0.mongodb.production.svc.cluster.local`)
- Lens không có mục "DNS" riêng — mục gần nhất là **Network → Services** và **Network → Endpoints**
- Tương đương CLI: `kubectl get svc -n production`
