# Bộ câu hỏi phản biện đồ án — ITHust App

> Tổng hợp từ quá trình rà soát trực tiếp source code (không dựa vào README/docs). Mỗi câu trả lời có trích dẫn file:line để tra cứu nhanh khi bị hỏi xoáy. Các câu ở mục 6 là câu hỏi "ép chết" — nêu thẳng điểm yếu thật của dự án kèm cách trả lời trung thực, không né tránh.

---

## 1. Tính ứng dụng / lý do chọn đề tài

**H: Vì sao chọn đề tài nền tảng freelance marketplace? Giải quyết nỗi đau xã hội nào?**

Nỗi đau nhắm tới là **thiếu cơ chế tin cậy** khi buyer/seller giao dịch trực tiếp ngoài các nền tảng lớn (ví dụ thoả thuận qua Zalo/Facebook): không có bên trung gian giữ tiền, không có cơ chế phân xử khi bị bùng tiền/bùng việc, không có lịch sử đánh giá đáng tin cậy để đánh giá năng lực đối phương trước khi hợp tác. Dự án giải quyết bằng: `Order Service` giữ tiền dạng escrow (`paymentStatus: HELD`, `order.schema.ts:49-53`) — cơ chế này hoạt động độc lập với việc đứng sau là cổng thanh toán nào; `Dispute Service` (`dispute.service.ts`) + `Refund Service` (`refund.service.ts`) xử lý tranh chấp có cấu trúc thay vì thoả thuận miệng; `Review Service` chỉ cho đánh giá gắn với `orderId` thật, tránh review ảo.

*Lưu ý khi trình bày*: không nêu "rào cản thanh toán quốc tế" (thẻ Visa/PayPal) làm lý do chọn đề tài — lập luận đó tự mâu thuẫn với hiện trạng dự án đang dùng Stripe (vẫn cần thẻ/PayPal) và đã bỏ hẳn hướng cổng nội địa SePay/VNPay khỏi phạm vi. Chỉ nên khai thác đúng phần **tin cậy giao dịch (escrow/dispute/review)**, vì phần này thật sự được code hiện tại giải quyết, không phụ thuộc cổng thanh toán.

**H: Payment hiện dùng Stripe hay SePay/VietQR?**

Chỉ **Stripe** là thực sự hoạt động (`controllers/order/stripe.ts`, route `/order/stripe/webhook` — `routes/order.ts:20`). `sepay` chỉ còn là 1 giá trị enum trong schema (`order.schema.ts:44`) và 1 biến môi trường dự phòng (`SEPAY_WEBHOOK_SECRET`, `gateway/config.ts:25`) — **không có route/controller nào xử lý SePay**, và hướng dùng cổng nội địa dạng quét mã QR (SePay/VNPay) đã bị bỏ khỏi phạm vi dự án, không phải "chưa kịp làm". Trả lời trung thực: dùng Stripe sandbox để chứng minh luồng nghiệp vụ (webhook, đối soát, chống trùng) hoạt động đúng — không tự nhận đã giải quyết bài toán thanh toán nội địa.

**H: So với Fiverr/Upwork, dự án có điểm gì đáng nói (không phải về quy mô)?**

Không so quy mô kinh doanh. Đáng nói: (1) tự benchmark thực nghiệm ES vs MongoDB thay vì chọn theo phong trào (`benchmark/`); (2) xử lý webhook thanh toán có chống trùng (`providerEventId`) + đối soát số tiền/currency trước khi activate đơn; (3) quy trình dispute/refund có cấu trúc với deadline (`dispute.schema.ts:11-12`); (4) có hẳn Admin Console vận hành nền tảng (`client/src/features/admin/`) chứ không chỉ giao diện người dùng cuối.

---

## 2. Kiến trúc Microservices

**H: Vì sao mỗi service dùng một loại CSDL khác nhau?**

Theo nguyên tắc *Database per Service* + *polyglot persistence* — chọn DB theo hình dạng dữ liệu, không theo thói quen. Auth→MySQL (cần UNIQUE constraint cứng cho email/username, ACID cho bảo mật — `auth.schema.ts:103-116`). Users/Gig/Chat/Order→MongoDB (dữ liệu lồng, linh hoạt, ghi nhiều). Review→PostgreSQL (dữ liệu phẳng, cần `AVG`/`GROUP BY` để tính rating — `review.service.ts`, bảng SQL thuần trong `database.ts:35-50`). Notification/Gateway không có DB riêng.

**H: Vai trò của Redis trong hệ thống?**

Chỉ **Gateway** và **Gig Service** thực sự dùng Redis (comment xác nhận tại `ithust-shared/src/redis.ts:7`) — các service khác có khai `redis` trong `package.json` nhưng không có code nào gọi tới. 3 vai trò thật: (1) **Socket.IO Redis Pub/Sub adapter** (`gateway/server.ts:189-194`) để đồng bộ sự kiện real-time giữa nhiều pod Gateway; (2) theo dõi user đang online bằng Redis LIST (`gateway.cache.ts:23-37`); (3) lưu category gig user vừa xem (`gateway.cache.ts:14-21`) để Gig Service đọc lại phục vụ gợi ý (`gig.cache.ts:8-17`).

**H: Vai trò RabbitMQ, có bao nhiêu exchange, direct hay fanout?**

9 exchange, chủ yếu `direct` (điểm-đến-điểm: gửi email, cập nhật số liệu seller/buyer). Duy nhất `ithust-review` là `fanout` vì 1 review mới cần phát tới **2 service độc lập cùng lúc** (Users + Order — `user.consumer.ts:99-103`, `order.consumer.ts:15-19`) mà Review Service không cần biết ai đang lắng nghe. Ví dụ điển hình: Auth Service sau khi tạo tài khoản publish 2 message riêng (email xác thực + tạo buyer profile) mà không cần chờ phản hồi (`auth.service.ts:25-33`).

**H: Các service giao tiếp đồng bộ (REST) khi nào, bất đồng bộ (RabbitMQ) khi nào?**

REST/HTTP nội bộ dùng cho request cần phản hồi ngay trong vòng đời 1 request của client (Gateway gọi sang Auth/Users/Gig... qua DNS nội bộ, ví dụ `AUTH_BASE_URL` trong `gateway.yaml:64`). RabbitMQ dùng cho tác vụ phụ không cần chặn response chính: gửi email, đồng bộ số liệu across service, review lan toả sang nhiều service.

**H: Nếu 1 service chết (ví dụ Notification Service down) thì hệ thống có sập không?**

Không — vì giao tiếp qua RabbitMQ là bất đồng bộ, message vẫn nằm trong queue (`durable: true, autoDelete: false` — ví dụ `email.consumer.ts:28`) chờ Notification Service khởi động lại rồi xử lý tiếp, không làm hỏng luồng chính (ví dụ tạo đơn hàng vẫn thành công dù email chưa gửi được).

---

## 3. Tối ưu tìm kiếm gig bằng Elasticsearch

**H: Cơ chế giúp Elasticsearch nhanh hơn MongoDB là gì?**

**Inverted Index** — giống mục lục cuối sách: thay vì lưu "tài liệu chứa từ gì" (phải quét từng tài liệu), ES lưu ngược "từ nào nằm trong tài liệu nào", nên tra cứu gần như không phụ thuộc số lượng gig. Dữ liệu được đánh index ngay lúc ghi (`gig.service.ts:37` → `elasticsearch.ts:61-67` → `elasticsearch-utils.ts:89`), không phải lúc tìm kiếm.

**H: Có bằng chứng thực nghiệm nào không hay chỉ là lý thuyết?**

Có — tự xây 2 luồng tìm kiếm song song trên cùng dữ liệu: `search.service.ts` (Elasticsearch) và `mongo-search.service.ts` (MongoDB `$text`/regex), expose qua `controllers/benchmark.ts`, đo bằng k6 load test (`benchmark/k6-es.js`, `k6-mongo.js`) với p50/p95/p99, kết luận in ra tại `report.mjs:148-154`: ES vượt trội ở mọi percentile, MongoDB-regex suy giảm mạnh nhất do phải full collection scan.

**H: p50/p95/p99 nghĩa là gì trong benchmark này?**

Đo bằng `res.timings.duration` của k6 (độ trễ đầu-cuối, không chỉ riêng ES) — `k6-es.js:44`. p50 = trải nghiệm điển hình; p95 = ngưỡng SLO thực dùng trong chính threshold của test (`thresholds: p(95)<1000` — `k6-es.js:29`); p99 = bắt tail latency lúc tải đỉnh. Tính bằng nearest-rank (`report.mjs:47-52`). Lưu ý: percentile hiện gộp chung mọi giai đoạn tải (warm-up→peak), chưa tách riêng theo từng mức VU.

**H: Ngoài inverted index, còn cơ chế nào khiến ES nhanh hơn?**

(1) Chấm điểm liên quan BM25 tự động xếp hạng kết quả — MongoDB không có; (2) phân trang `search_after` dùng cursor (`search.service.ts:105`) không bị phạt khi lật trang sâu, khác với `.skip().limit()` của MongoDB (`mongo-search.service.ts:52-53`) phải duyệt qua các trang trước.

**H: Dữ liệu index "gigs" lưu trữ ở đâu?**

Logic: index tên `gigs` tạo tại `server.ts:63`, gồm cả inverted index và bản sao `_source` JSON gốc. Vật lý: mount vào PersistentVolumeClaim `elasticsearch-pvc` 8Gi trên ổ đĩa VPS (`kubernetes/k3s/elasticsearch/pvc.yaml:6-12`, `elasticsearch.yaml:75-82`). Đây chỉ là **bản sao phục vụ tìm kiếm** — nguồn dữ liệu gốc vẫn là MongoDB (`GigModel`), có thể build lại index nếu mất.

**H: Elasticsearch chạy 1 node hay nhiều node, có replica shard không?**

`discovery.type: single-node` (`elasticsearch.yaml:47-48`) — chỉ 1 node, không có replica shard sang node khác để chịu lỗi phần cứng. Chấp nhận được vì đây là bản sao, không phải nguồn dữ liệu gốc.

---

## 4. Luồng nghiệp vụ đơn hàng & thanh toán

**H: Trình bày luồng từ lúc buyer nhắn tin tới lúc đánh giá?**

Chat (`message.service.ts:15-39`, seller gửi offer) → buyer chấp nhận → tạo Order `status: PENDING_PAYMENT` (`create.ts:33-41`) → Stripe PaymentIntent → webhook `payment_intent.succeeded` xác thực + đối soát → `activatePaidOrder`: `IN_PROGRESS`/`HELD` (`order.service.ts:44-62`) → seller giao hàng: `Delivered` (`sellerDeliverOrder`, `order.service.ts:193-215`) → buyer duyệt: `Completed`/`RELEASED` (`approveOrder`, `order.service.ts:141-160`) → Review Service ghi nhận, publish fanout cập nhật rating.

**H: Các trường hợp hoàn tiền gồm những gì?**

Đúng 3 con đường thật (dù enum khai 4 giá trị, `BUYER_REQUEST` không bao giờ được dùng — `refund.service.ts:19`): (1) `EXTENSION_REJECTED` — buyer từ chối gia hạn giao hàng (`rejectDeliveryDate`, `order.service.ts:345-389`); (2) `OVERDUE_AUTO` — seller trễ hạn giao, hệ thống tự hoàn (`processOverdueRefunds`, `refund.service.ts:328-359`, kích hoạt lazy khi có request GET, không phải cron); (3) `QUALITY_DISPUTE` — admin quyết định sau khi xử lý tranh chấp (`decideDispute`, `dispute.service.ts:154-219`).

**H: Nếu buyer không duyệt đơn cũng không mở dispute thì sao?**

**Gap thật, đã thừa nhận**: không có cơ chế auto-approve timeout. Đơn treo mãi ở `Delivered`/`HELD` nếu buyer im lặng. Đối chiếu: dispute flow lại CÓ deadline (`sellerResponseDeadlineAt`, `dispute.schema.ts:11`) — cho thấy có nhận thức về khái niệm SLA nhưng chưa mở rộng sang nhánh này do giới hạn thời gian đồ án. Hướng khắc phục: thêm field `autoApproveAt` + K8s CronJob quét đơn quá hạn.

**H: Seller pause 1 gig đang có đơn dở dang thì đơn đó sao?**

Đơn vẫn tiếp tục bình thường tới khi hoàn tất. `updateActiveGigProp` (`gig.service.ts:87-102`) chỉ đổi field `active` + reindex ES, không publish message nào, không đụng Order. Order lưu snapshot dữ liệu gig tại thời điểm đặt hàng (`order.schema.ts:17-25`), và điều kiện giao hàng (`sellerDeliverOrder`, `order.service.ts:193-203`) không kiểm tra `gig.active`. Pause chỉ ẩn gig khỏi tìm kiếm công khai (lọc `active:true` trong `search.service.ts:64-67`).

**H: Withdrawal (rút tiền) có SLA xử lý không?**

**Gap thật**: `WithdrawalModel` có status `MANUAL_REVIEW`/`PENDING` và endpoint admin xử lý thủ công (`PATCH /withdrawals/:id/status`, `routes/seller.ts:16`) nhưng không có field deadline, không có cron escalate nếu admin không xử lý.

**H: Rủi ro thanh toán trùng/giả mạo được xử lý thế nào?**

Chống trùng theo `providerEventId` trước khi xử lý (`stripe.ts:29-33`), verify chữ ký webhook Stripe (`constructStripeEvent`), và đối soát số tiền/currency giữa Stripe trả về với đơn đang chờ trước khi activate — nếu lệch thì đánh dấu `RECONCILIATION_REQUIRED` thay vì tự động kích hoạt (`stripe.ts:46-52`).

---

## 5. Triển khai / Vận hành

**H: Luồng build Docker → deploy K3s?**

Multi-stage Dockerfile: stage `builder` compile TypeScript, stage runtime chỉ copy `build/` + cài `--omit=dev` (`Dockerfile:1-27`). CI/CD: push nhánh `production` → path-filtered trigger (`deploy-gateway.yml:3-10`) → reusable workflow `_deploy-backend.yml`: build + tag kép (`stable-{run_number}` và `stable`) → push Docker Hub → `kubectl apply -f <k8s_dir>/` + `rollout restart` + `rollout status` (dòng 114-123).

**H: File `traefik-config.yaml` có chức năng gì?**

Custom Resource `HelmChartConfig` tuỳ biến Traefik có sẵn trong K3s — chỉ cấu hình đúng 1 việc: certificate resolver Let's Encrypt để tự động cấp/gia hạn HTTPS (`traefik-config.yaml:9-11`). Traefik đóng vai trò reverse proxy duy nhất, chỉ expose ra internet đúng 3 điểm: gateway, frontend, kibana — 7 service backend còn lại chỉ gọi được qua DNS nội bộ cluster.

**H: Hệ thống có autoscaling thật không?**

**Có, vừa triển khai** (trước đó không có). Đã thêm `HorizontalPodAutoscaler` (`autoscaling/v2`) cho 8 service backend tại `kubernetes/k3s/*/hpa.yaml`, target CPU 70% trên request 100m, min 2 replica, max riêng theo service (gateway 4, gig 6, còn lại 3). Đồng thời xoá field `spec.replicas` khỏi 8 Deployment để tránh CI (`kubectl apply`) ghi đè lại số replica mà HPA đang quản lý — nếu để cả 2 cùng tồn tại, mỗi lần deploy sẽ kéo replica về số cố định trong YAML, xung đột với HPA.

**H: Node/VPS có đủ tài nguyên khi tất cả HPA scale kịch trần cùng lúc không?**

CPU và memory **request** vẫn an toàn (~74% CPU, ~51% memory trên 6 vCPU/23.5Gi) nên việc schedule pod không vấn đề. Nhưng tổng **memory limit** cam kết lúc kịch trần (~24.530Mi) **vượt nhẹ tổng RAM vật lý** (~24.030Mi, ≈102%) — nếu mọi pod cùng lúc dùng sát tới giới hạn của nó (kịch bản cực đoan, thực tế mỗi pod hiện chỉ dùng 70-135Mi), có thể gây áp lực OOM. CPU vượt limit chỉ bị throttle (không kill), memory vượt mới nguy hiểm. Khắc phục: giảm `maxReplicas` của gig/gateway nếu muốn có biên an toàn tuyệt đối.

**H: Deploy có bị downtime không?**

Trước đây có: `replicas: 1` + `maxSurge: 0, maxUnavailable: 1` (rolling update) làm tắt pod cũ trước khi pod mới sẵn sàng → downtime ngắn mỗi lần deploy. Với HPA giữ tối thiểu 2 replica luôn chạy, `maxUnavailable: 1` giờ chỉ tắt tối đa 1/2 pod mỗi lần — luôn còn ít nhất 1 pod phục vụ, gần như zero-downtime.

**H: `kubectl rollout restart` mỗi lần CI deploy có xung đột với HPA không?**

Không — `rollout restart` chỉ cycle lại pod ở đúng số replica hiện tại, không set lại `spec.replicas`, nên không tranh chấp với HPA.

---

## 6. Câu hỏi "ép chết" — điểm yếu cần thừa nhận thẳng

**H: Deployment 8 service backend có `livenessProbe`/`readinessProbe` không?**

Không — chỉ 3 database (mysql, postgresql, redis) có probe. `kubectl rollout status` ở CI chỉ xác nhận container **đã khởi động**, chưa xác nhận app thực sự sẵn sàng nhận traffic (ví dụ đã kết nối xong MongoDB/Redis). Đây là điểm có thể cải thiện.

**H: Review có bắt buộc order phải `Completed` mới cho đánh giá không?**

Controller `review.ts` phía server **không kiểm tra** `order.status`, chỉ nhận thẳng `req.body` (`controllers/create.ts`). Việc chỉ hiện nút đánh giá sau khi hoàn tất đơn hiện chỉ được kiểm soát ở UI, chưa enforce ở tầng service.

**H: Tạo đơn mới có kiểm tra `gig.active` trước không?**

Không — `controllers/order/create.ts` không gọi sang Gig Service để kiểm tra gig còn active hay không trước khi tạo Order + PaymentIntent. Về kỹ thuật, buyer gọi thẳng API vẫn tạo được đơn cho gig đã pause; việc chặn hiện chỉ dựa vào ẩn nút ở UI.

**H: Cluster hiện có đúng những gì trong Git không (config drift)?**

Từng phát hiện thật: cluster live chạy `replicas: 2` cho toàn bộ 8 backend, nhưng file Git vẫn ghi `replicas: 1` (khác biệt do ai đó `kubectl scale` trực tiếp mà chưa commit) — xác minh qua annotation `last-applied-configuration` vẫn còn `"replicas":1` dù `.spec.replicas` live là `2`. Rủi ro: lần CI deploy tiếp theo sẽ tự động kéo replica về lại số trong Git, xoá mất scale thủ công. Đã khắc phục bằng cách xoá hẳn field `replicas` khỏi YAML và giao cho HPA quản lý.

**H: Đây có phải autoscaling "thật" theo đúng nghĩa hạ tầng elastic không?**

Không hoàn toàn — cluster chỉ có **1 node VPS duy nhất**, không có Cluster Autoscaler, không có node thứ 2 để mở rộng. HPA chỉ nhồi thêm pod lên cùng 6 vCPU sẵn có — giúp giảm nghẽn hàng đợi request (nhiều tiến trình Node.js xử lý song song) chứ không tạo thêm sức mạnh tính toán vật lý thật sự.

**H: Trước khi có HPA, hệ thống "tự nhận" thiết kế để scale ngang (Socket.IO Redis adapter) nhưng thực tế chạy mấy pod?**

Từng chỉ chạy `replicas: 1` — nghĩa là cơ chế Redis Pub/Sub adapter tồn tại "cho tương lai" chứ chưa thực sự cần thiết lúc đó. Sau khi phát hiện cluster đã bị scale tay lên 2 và giờ thêm HPA, cơ chế này mới thực sự được exercise trong production.

**H: Vì sao mọi Deployment dùng chung 1 cấu hình resource (100m/300m CPU, 120Mi/512Mi RAM) dù khối lượng công việc khác nhau (gig gọi Elasticsearch, notification chỉ gửi email)?**

Chưa có profiling riêng từng service để justify việc tách CPU khác nhau — đây là baseline đồng nhất chấp nhận được cho quy mô đồ án, nhưng là điểm có thể tinh chỉnh nếu triển khai thực tế lớn hơn. Riêng memory đã phát hiện và sửa: request cũ 120Mi thấp hơn cả mức RAM Node.js dùng thực tế lúc rảnh (70-135Mi) — đã tăng lên 192Mi.

**H: Nếu Elasticsearch chết thì tìm kiếm gig có hoạt động không?**

Không — toàn bộ luồng tìm kiếm/lọc/gợi ý gig (`search.service.ts`) phụ thuộc hoàn toàn vào ES, không có fallback tự động sang MongoDB dù đã có sẵn code MongoDB search (`mongo-search.service.ts`) — 2 luồng này hiện tách biệt, chỉ dùng thủ công qua endpoint benchmark riêng, chưa nối thành cơ chế fallback tự động.

**H: Vì sao dùng Stripe (cổng quốc tế) thay vì cổng nội địa cho một nền tảng hướng tới người dùng Việt Nam?**

Vì mục tiêu của phần thanh toán trong đồ án là chứng minh luồng nghiệp vụ (webhook, đối soát số tiền/currency, chống trùng theo `providerEventId`) hoạt động đúng và an toàn — Stripe sandbox tích hợp nhanh, không đòi hỏi đăng ký doanh nghiệp/merchant account như cổng nội địa. Hướng cổng nội địa dạng quét mã QR (SePay/VNPay) từng được cân nhắc nhưng đã bị loại khỏi phạm vi dự án; `paymentProvider` enum và bảng `payment-event` tách theo provider chỉ còn là dấu vết thiết kế cũ, không nên trình bày như một roadmap sẽ làm tiếp. Không nêu lý do "giải quyết rào cản thanh toán quốc tế" ở đây vì bản thân Stripe cũng thuộc nhóm cổng quốc tế đó — xem lưu ý ở mục 1.

---

## 7. Ngoại lệ / trường hợp đặc biệt cần lưu ý

- **Thanh toán thất bại (`payment_intent.payment_failed`)**: enum `PAYMENT_FAILED` tồn tại trong schema nhưng webhook (`stripe.ts`) chỉ xử lý `succeeded` và `charge.refunded` — chưa có code set trạng thái này lúc runtime.
- **Đơn hàng không bao giờ được thanh toán** (buyer bỏ ngang sau khi tạo PaymentIntent): không có cron tự động chuyển `PENDING_PAYMENT` sang `PAYMENT_EXPIRED`; chỉ có 1 script migration thủ công (`scripts/migrate-payment-lifecycle.ts`) chạy tay, không tự động.
- **Hoàn tiền Stripe thất bại giữa chừng**: `refundHeldOrderToOriginalSource` có rollback — nếu Stripe refund lỗi, `paymentStatus` được set lại về `HELD` thay vì kẹt ở `REFUND_PROCESSING` (`refund.service.ts:214-228`).
- **Webhook trùng lặp** (Stripe gửi lại do timeout): chống bằng kiểm tra `providerEventId` đã tồn tại trong `PaymentEventModel` trước khi xử lý (`stripe.ts:29-33`).
- **Seller không giao hàng đúng hạn**: tự động hoàn tiền qua `processOverdueRefunds`, nhưng cơ chế này chỉ chạy "lazy" khi có ai đó gọi API GET order — không phải cron job chạy nền độc lập, nên nếu không ai truy vấn đơn đó, việc hoàn tiền có thể bị trễ.
- **Buyer từ chối gia hạn giao hàng**: tự động hoàn tiền toàn bộ, không có tuỳ chọn hoàn một phần.
- **Redis/RabbitMQ down tạm thời**: các thao tác ghi Redis đều có try/catch nuốt lỗi và trả về giá trị rỗng thay vì crash (`gateway.cache.ts`, `gig.cache.ts`) — hệ thống suy giảm tính năng (mất trạng thái online, mất gợi ý cá nhân hoá) chứ không sập.
- **Kịch bản quá tải cực đoan (mục 5)**: tổng memory limit lý thuyết vượt ~102% RAM VPS nếu toàn bộ HPA scale kịch trần và mọi pod cùng lúc chạm limit — xác suất thấp với traffic thực tế nhưng là giới hạn cứng cần biết.
