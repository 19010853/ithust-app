# Hướng dẫn Deploy: production-stripe → production

> **Mục tiêu:** Push toàn bộ thay đổi (bao gồm tích hợp Stripe thay thế SePay) lên branch `production` để GitHub Actions tự động build Docker image và deploy lên K3s cluster.

---

## Tổng quan luồng CI/CD

```
Local (production-stripe)
    │
    ├─ git commit
    ├─ git merge → production
    └─ git push origin production
                │
                └─► GitHub Actions trigger song song:
                        deploy-frontend.yml   (client/)
                        deploy-gateway.yml    (server/1-gateway-service/)
                        deploy-order.yml      (server/7-order-service/)
                        deploy-users.yml      (server/4-users-service/)
                        deploy-*.yml          (các service khác nếu có thay đổi)
                                │
                                └─► Build Docker Image → Push DockerHub
                                        └─► kubectl apply + rollout restart (K3s)
```

---

## Bước 0 — Kiểm tra pre-flight trên VPS

SSH vào VPS, chạy các lệnh kiểm tra:

```bash
# Kiểm tra pods đang chạy
kubectl get pods -n production

# Kiểm tra secret hiện tại (xem key nào đã có / còn thiếu)
kubectl get secret ithust-backend-secret -n production -o jsonpath='{.data}' | python3 -m json.tool
```

Chú ý xem 3 key Stripe sau đã tồn tại chưa:
- `stripe-secret-key`
- `stripe-order-webhook-secret`
- `stripe-connect-webhook-secret`

---

## Bước 1 — Cập nhật GitHub Repository Secrets

Truy cập: **GitHub Repo → Settings → Secrets and variables → Actions → Repository secrets**

### Backend secrets (dùng chung cho mọi service):

| Secret | Mô tả |
|--------|-------|
| `DOCKERHUB_USERNAME` | `minhkhoi779` |
| `DOCKERHUB_PASSWORD` | Docker Hub password hoặc Access Token |
| `NPM_TOKEN` | GitHub PAT với quyền `read:packages` (cho `@19010853/ithust-shared`) |
| `KUBECONFIG_B64` | Chạy trên VPS: `cat ~/.kube/config \| base64 -w 0` |
| `TELEGRAM_TO` | Telegram chat ID nhận thông báo deploy |
| `TELEGRAM_TOKEN` | Telegram bot token |

### Frontend secrets (liên quan Stripe — kiểm tra / thêm mới):

| Secret | Mô tả |
|--------|-------|
| `VITE_BASE_ENDPOINT` | URL API gateway, vd: `https://ithust.store` |
| `VITE_CLIENT_ENDPOINT` | URL frontend, vd: `https://ithust.shop` |
| `VITE_STRIPE_PUBLISHABLE_KEY` | **MỚI** — Stripe public key (`pk_live_...` hoặc `pk_test_...`) |
| `VITE_ELASTIC_APM_SERVER` | Để trống `""` nếu không dùng APM |
| `VITE_ELASTIC_APM_SERVER_TOKEN` | Để trống `""` nếu không dùng APM |

> `VITE_STRIPE_PUBLISHABLE_KEY` lấy từ: **Stripe Dashboard → Developers → API Keys → Publishable key**
> Đây là key **public**, an toàn khi dùng phía browser.

---

## Bước 2 — Cấu hình Stripe Webhook Endpoints

> **Làm bước này TRƯỚC bước 3** vì cần lấy `whsec_...` từ Stripe để điền vào K3s secret.

Truy cập: **Stripe Dashboard → Developers → Webhooks → Add endpoint**

### Webhook 1 — Order payments:

| Trường | Giá trị |
|--------|---------|
| Endpoint URL | `https://ithust.store/webhook/stripe/order` |
| Events | `payment_intent.succeeded`, `charge.refunded` |

Sau khi tạo xong → lấy **Signing secret** (`whsec_...`) → dùng ở Bước 3.

### Webhook 2 — Seller Connect payouts:

| Trường | Giá trị |
|--------|---------|
| Endpoint URL | `https://ithust.store/webhook/stripe/connect` |
| Type | **Connect** (không phải Account) |
| Events | `account.updated`, `payout.paid`, `payout.failed` |

Sau khi tạo xong → lấy **Signing secret** (`whsec_...`) → dùng ở Bước 3.

---

## Bước 3 — Cập nhật Kubernetes Secret trên VPS

> File mẫu: `kubernetes/k3s/backend-secrets.example.yaml`

```bash
# Trên VPS — KHÔNG commit file này lên git
cp kubernetes/k3s/backend-secrets.example.yaml /tmp/backend-secrets.yaml
nano /tmp/backend-secrets.yaml
```

### Encode giá trị sang base64:

```bash
# Chạy từng lệnh, copy kết quả vào file yaml
echo -n "sk_live_xxxx"   | base64    # → stripe-secret-key
echo -n "whsec_xxxx"     | base64    # → stripe-order-webhook-secret (từ Webhook 1)
echo -n "whsec_xxxx"     | base64    # → stripe-connect-webhook-secret (từ Webhook 2)
```

### Danh sách đầy đủ các key cần điền trong file yaml:

```yaml
# Auth
secret-key-one: "<base64>"
secret-key-two: "<base64>"
gateway-jwt-token: "<base64>"
jwt-token: "<base64>"

# Database
ithust-redis-host: "<base64>"          # redis://:password@host:6379
ithust-mysql-db: "<base64>"
ithust-postgres-host: "<base64>"
ithust-postgres-user: "<base64>"
ithust-postgres-password: "<base64>"
mongo-database-url: "<base64>"

# Email (Brevo SMTP)
sender-email: "<base64>"
sender-email-password: "<base64>"
brevo-smtp-username: "<base64>"
brevo-smtp-key: "<base64>"

# Platform admin
platform-owner-email: "<base64>"
platform-owner-username: "<base64>"
platform-owner-password: "<base64>"

# Cloudinary
cloud-name: "<base64>"
cloud-api-key: "<base64>"
cloud-api-secret: "<base64>"

# RabbitMQ
ithust-rabbitmq-user: "<base64>"
ithust-rabbitmq-password: "<base64>"
ithust-rabbitmq-endpoint: "<base64>"

# Elasticsearch (để trống nếu không dùng self-hosted)
ithust-elasticsearch-url: "<base64>"
ithust-elasticsearch-host: "<base64>"
ithust-elasticsearch-username: "<base64>"
ithust-elasticsearch-password: "<base64>"
ithust-elastic-apm-server-url: ""
ithust-elastic-apm-secret-token: ""

# Exchange rate
usd-to-vnd-rate-api-url: "<base64>"
usd-to-vnd-rate-fallback: "<base64>"

# STRIPE (MỚI — bắt buộc điền)
stripe-secret-key: "<base64>"                 # sk_live_... hoặc sk_test_...
stripe-order-webhook-secret: "<base64>"       # whsec_... từ Webhook 1
stripe-connect-webhook-secret: "<base64>"     # whsec_... từ Webhook 2
```

### Apply và xóa file:

```bash
kubectl apply -f /tmp/backend-secrets.yaml

# QUAN TRỌNG: xóa ngay sau khi apply, không để file chứa secret trên server
rm /tmp/backend-secrets.yaml
```

---

## Bước 4 — Commit code trên máy local

```bash
# Kiểm tra lại trước khi commit
git status
git diff --stat

# Stage tất cả thay đổi
git add .

# Commit
git commit -m "feat: migrate payment from SePay to Stripe

- Add Stripe payment intent + webhook handling in order-service
- Add Stripe Connect for seller payouts in users-service
- Update frontend checkout with Stripe publishable key
- Update Kubernetes deployments with Stripe env vars
- Migrate currency display to VND throughout UI
- Update gateway webhook routes for Stripe"
```

---

## Bước 5 — Merge sang production và push

```bash
# Chuyển sang branch production
git checkout production

# Merge production-stripe (giữ lại commit history)
git merge production-stripe --no-ff -m "merge: production-stripe into production"

# Push lên remote → GitHub Actions tự trigger
git push origin production
```

> Sau lệnh `push`, truy cập **GitHub Repo → Actions tab** để theo dõi các workflow chạy song song.

---

## Bước 6 — Theo dõi GitHub Actions

Các workflow sẽ trigger tùy theo file nào thay đổi:

| Workflow | Trigger khi thay đổi |
|----------|---------------------|
| `deploy-frontend` | `client/**` |
| `deploy-gateway` | `server/1-gateway-service/**` |
| `deploy-order` | `server/7-order-service/**` |
| `deploy-users` | `server/4-users-service/**` |
| `deploy-auth` | `server/2-auth-service/**` |
| `deploy-chat` | `server/5-chat-service/**` |
| `deploy-gig` | `server/3-gig-service/**` |
| `deploy-notification` | `server/6-notification-service/**` |
| `deploy-review` | `server/8-review-service/**` |

Mỗi workflow sẽ gửi thông báo Telegram khi thành công hoặc thất bại.

---

## Bước 7 — Chạy migration dữ liệu SePay cũ

> Thực hiện sau khi `deploy-order` thành công.

```bash
# Xác định pod đang chạy
kubectl get pods -n production -l app=ithust-order

# Dry-run trước (không thay đổi dữ liệu)
kubectl exec -n production deploy/ithust-order -- \
  node build/scripts/migrate-payment-lifecycle.js

# Kiểm tra output, nếu ổn thì chạy thực sự
kubectl exec -n production deploy/ithust-order -- \
  node build/scripts/migrate-payment-lifecycle.js --apply
```

Script sẽ:
- Tìm tất cả đơn hàng có `paymentProvider = 'sepay'`
- Đơn `PENDING` → chuyển thành `PAYMENT_EXPIRED`
- Đơn đã hoàn thành → giữ nguyên payment status tương ứng

---

## Bước 8 — Verify sau deploy

```bash
# Kiểm tra tổng quan pods
kubectl get pods -n production

# Xem logs order-service (webhook Stripe)
kubectl logs -n production -l app=ithust-order --tail=50 -f

# Xem logs gateway-service (routes webhook)
kubectl logs -n production -l app=ithust-gateway --tail=50
```

**Test Stripe webhook thủ công:**
Stripe Dashboard → Webhooks → chọn endpoint → **Send test event** → chọn `payment_intent.succeeded`

### Checklist verify chức năng:

- [ ] Đăng nhập / đăng ký hoạt động bình thường
- [ ] Tạo gig mới thành công
- [ ] Đặt hàng mới → hiển thị form thanh toán Stripe
- [ ] Webhook nhận thành công (Stripe Dashboard → Events → không có lỗi 4xx)
- [ ] Admin withdrawal / seller payout hoạt động
- [ ] Currency hiển thị VND đúng trên toàn bộ UI
- [ ] Migration SePay không ảnh hưởng đơn hàng active

---

## Xử lý lỗi thường gặp

| Lỗi | Nguyên nhân | Cách fix |
|-----|-------------|----------|
| `Missing GitHub Actions secret: VITE_STRIPE_PUBLISHABLE_KEY` | Chưa thêm secret mới | Bước 1: Thêm secret vào GitHub |
| `docker: denied: access forbidden` | Sai Docker Hub credentials | Tạo Access Token mới trên Docker Hub |
| `Unable to connect to server` (kubectl) | `KUBECONFIG_B64` sai hoặc hết hạn | Encode lại trên VPS: `cat ~/.kube/config \| base64 -w 0` |
| `ImagePullBackOff` | Image chưa push được lên Docker Hub | Xem Actions log bước "Build Docker Image" |
| Webhook Stripe lỗi 400/401 | Sai `STRIPE_WEBHOOK_SECRET` | Lấy lại signing secret từ Stripe Dashboard → apply lại K3s secret |
| `CrashLoopBackOff` order-service | Thiếu env var Stripe | Kiểm tra K3s secret đã có đủ 3 Stripe keys chưa |
| Pods restart liên tục | Config sai | `kubectl describe pod <pod-name> -n production` |

---

## Thứ tự thực hiện tóm gọn

```
[Stripe Dashboard]  Tạo 2 webhook endpoints → lấy 2x whsec_...
        ↓
[VPS]              kubectl apply secret (với 3 Stripe keys)
        ↓
[GitHub]           Thêm VITE_STRIPE_PUBLISHABLE_KEY và các secrets còn thiếu
        ↓
[Local]            git add . → git commit
        ↓
[Local]            git checkout production → git merge production-stripe → git push
        ↓
[GitHub Actions]   Theo dõi các workflow song song
        ↓
[VPS]              Chạy migrate-payment-lifecycle.js --apply
        ↓
[Browser/VPS]      Verify chức năng
```
