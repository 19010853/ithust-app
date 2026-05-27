# IT HUST App - Hệ thống Microservices Toàn diện

## 1. Tổng quan dự án

IT HUST App là một nền tảng dịch vụ vi mô (microservices) mở rộng, hỗ trợ giao dịch và trao đổi công việc/dịch vụ (gigs) với các tính năng từ xác thực, tìm kiếm thời gian thực, nhắn tin, thanh toán đến hệ thống đánh giá. Nền tảng được thiết kế cloud-native, hướng tới độ sẵn sàng cao, và tốc độ phản hồi nhanh.

Dự án được xây dựng với **Node.js** và **TypeScript** dành cho BE, **React/Vite** dành cho FE, và được triển khai thành các vi dịch vụ chạy trên cụm Kubernetes (K3s).

### Kiến trúc Microservices
Hệ thống bao gồm 8 backend services và 1 frontend client độc lập:
- **Frontend Client**: Khối giao diện người dùng chính (React/Vite).
- **Gateway Service**: Cổng API tập trung (API Gateway) xử lý định tuyến (routing), rate limiting, và xác thực request trước khi truyền đi.
- **Auth Service**: Quản lý đăng ký, đăng nhập, phân quyền, và cấp phát JWT. Lọc dữ liệu qua MySQL.
- **Users Service**: Quản lý hồ sơ người mua/người bán trên hệ thống.
- **Gig Service**: Dịch vụ quản lý các "công việc/dịch vụ" (gigs). Hỗ trợ công cụ tìm kiếm mạnh mẽ nhờ Elasticsearch.
- **Order Service**: Xử lý logic đặt hàng, tích hợp cổng thanh toán (Stripe) và theo dõi trạng thái.
- **Chat Service**: Giao tiếp thời gian thực (real-time chat) giữa các người dùng thông qua Socket.io.
- **Review Service**: Đánh giá và phản hồi các đơn hàng đã hoàn tất. Lưu trữ qua PostgreSQL.
- **Notification Service**: Chịu trách nhiệm độc lập gửi email và thông báo cho người dùng (broker driven).

## 2. Công nghệ sử dụng (Tech Stack)

- **Ngôn ngữ/Core**: Node.js, Express.js, TypeScript, React.
- **Cơ sở dữ liệu**: MongoDB (tài liệu), MySQL (xác thực), PostgreSQL (đánh giá).
- **Caching & Real-time**: Redis, Socket.io.
- **Message Broker**: RabbitMQ.
- **Công cụ Tìm kiếm**: Elasticsearch 8.x.
- **Kiến trúc kịch bản Deployment**: Kubernetes (K3s) thay thế cho Minikube/EKS cũ.
- **Containerization**: Docker.
- **CI/CD**: GitHub Actions (Tự động build image lên Docker Hub và rolling update xuống K3s).
- **Infrastructure Analytics**: Elastic APM, Kibana, Heartbeat, Metricbeat.

---

## 3. Cấu trúc thư mục

- `/.github/workflows/`: Chứa các kịch bản CI/CD của GitHub Actions để tự động hóa deploy.
- `/client/`: Mã nguồn của Frontend Application.
- `/server/`: Chứa mã nguồn của toàn bộ 8 backend microservices.
- `/kubernetes/k3s/`: Manifest triển khai hệ thống nội bộ (Database, Message broker) và manifest service (Ingress, Deployment) để lên môi trường sản xuất VPS.
- `/apiCalls/`: Bộ sưu tập API Request (Postman) để dùng cho việc test HTTP endpoint local.

---

## 4. Hướng dẫn chạy trên môi trường Local (Phát triển)

Để chạy dự án ở localhost, bạn không cần cài Kubernetes. Các cơ sở hạ tầng (Database, RabbitMQ, ElasticSearch) sẽ chạy bằng **Docker container**, còn mã nguồn Node.js/React sẽ chạy trực tiếp qua quá trình giám sát (Nodemon/Vite).

### Bước 4.0: Cài công cụ bắt buộc
Máy local cần có:

- Node.js 20+ hoặc 22+
- Docker và Docker Compose
- GitHub/NPM token có quyền đọc package `@19010853/ithust-shared`

Trước khi chạy `npm ci` trong các service backend, tạo file `.npmrc` tạm trong thư mục service nếu dependency private chưa tải được:

```bash
printf '@19010853:registry=https://npm.pkg.github.com\n//npm.pkg.github.com/:_authToken=YOUR_NPM_TOKEN\n' > .npmrc
```

### Bước 4.1: Khởi động Hạ tầng Docker
Khởi động hạ tầng local bằng Docker Compose:

```bash
docker compose -f volumes/docker-compose.yaml up -d redis mongodb mysql postgres rabbitmq elasticsearch kibana apmServer
```

Nếu container đã tồn tại và chỉ muốn bật lại nhanh:

```bash
docker start postgres_container mongodb_container mysql_container redis_container rabbitmq_container elasticsearch_container kibana_container apm_server_container
```

### Bước 4.2: Khởi động Microservices và Client
Tạo file môi trường local trước:

```bash
cp client/.env.local.example client/.env.local

cp server/1-gateway-service/.env.local.example server/1-gateway-service/.env
cp server/2-notification-service/.env.local.example server/2-notification-service/.env
cp server/3-auth-service/.env.local.example server/3-auth-service/.env
cp server/4-users-service/.env.local.example server/4-users-service/.env
cp server/5-gig-service/.env.local.example server/5-gig-service/.env
cp server/6-chat-service/.env.local.example server/6-chat-service/.env
cp server/7-order-service/.env.local.example server/7-order-service/.env
cp server/8-review-service/.env.local.example server/8-review-service/.env
```

Build nhanh trước khi chạy:

```bash
cd client && npm ci && npm run build

cd ../server/1-gateway-service && npm ci --legacy-peer-deps && npm run build
```

Lặp lại `npm ci --legacy-peer-deps && npm run build` cho toàn bộ thư mục `server/*-service`.

Khi chạy dev, mở từng terminal riêng:

```bash
# Frontend
cd client
npm ci
npm run dev

# Backend (thực hiện tương tự cho cả 8 service)
cd server/1-gateway-service
npm ci --legacy-peer-deps
npm run dev
```
> **Lưu ý**: Backend script đúng là `npm run dev`, không dùng `dev:watch`.

Khi xong việc, có thể dừng docker để tiết kiệm RAM:
`docker stop postgres_container mongodb_container mysql_container redis_container rabbitmq_container elasticsearch_container kibana_container apm_server_container heartbeat_container metricbeat_container`

---

## 5. Hướng dẫn triển khai Production (VPS + K3s)

Dự án hiện tại sử dụng **K3s trên VPS (Ubuntu 22.04+, 8GB+ RAM)** chạy built-in Traefik làm Ingress Controller. 

### Bước 5.1: Cài đặt K3s lên VPS
SSH vào VPS của bạn và cài hệ sinh thái Kubernetes dung lượng nhẹ - K3s.

```bash
# Cài k3s
curl -sfL https://get.k3s.io | sh -

# Cấu hình ~/.kube/config để dùng được kubectl mà không cần quyền sudo
mkdir -p ~/.kube
sudo cp /etc/rancher/k3s/k3s.yaml ~/.kube/config
sudo chown $(id -u):$(id -g) ~/.kube/config
```

### Bước 5.2: Khởi tạo StorageClass & Traefik HTTPS
K3s mặc định cài `local-path` provisioner làm StorageClass. Nếu muốn kích hoạt Let's Encrypt cho Web Ingress:

```bash
sudo nano /var/lib/rancher/k3s/server/manifests/traefik-config.yaml
```
```yaml
apiVersion: helm.cattle.io/v1
kind: HelmChartConfig
metadata:
  name: traefik
  namespace: kube-system
spec:
  valuesContent: |-
    additionalArguments:
      - "--certificatesresolvers.letsencrypt.acme.email=khoinguyenminhk37@gmail.com"
      - "--certificatesresolvers.letsencrypt.acme.storage=/data/acme.json"
      - "--certificatesresolvers.letsencrypt.acme.tlschallenge=true"
```

### Phase 2 — DNS, Traefik & TLS

Mô hình domain chuẩn của dự án:

- `main` → production
  - frontend: `ithust.shop`
  - backend: `ithust.store`
- `dev` → development
  - frontend: `dev.ithust.shop`
  - backend: `dev.ithust.store`

Trên Namecheap, trỏ các bản ghi `A Record` về IP VPS:

- `ithust.shop` → frontend production
- `ithust.store` → backend production
- `dev.ithust.shop` → frontend development
- `dev.ithust.store` → backend development

Nếu dùng Kibana riêng cho production, có thể thêm:

- `kibana.ithust.store` → VPS IP

Sau khi DNS trỏ đúng, copy file `kubernetes/k3s/traefik-config.yaml` vào `/var/lib/rancher/k3s/server/manifests/traefik-config.yaml`, mở port 80/443 và kiểm tra Traefik logs để xác nhận Let's Encrypt hoạt động.

### Bước 5.3: Cài đặt Secret Keys (Quan trọng)
Lấy repo về và giải mã các Base64 keys:
```bash
git clone https://github.com/19010853/ithust-app.git
cd ithust-app/kubernetes/k3s

# Tạo file secret từ bản mẫu
cp backend-secrets.example.yaml secrets/backend-secrets.yaml
```
Sửa giá trị trong file `secrets/backend-secrets.yaml` bằng mã Base64 thật (Ví dụ: `echo -n "my-db-password" | base64`). Các keys quan trọng cần chú ý:
- `ithust-elasticsearch-url` 
- `ithust-rabbitmq-endpoint` 
- `mongo-database-url`
- `ithust-mysql-db`

### Bước 5.4: Triển khai Hạ tầng thủ công (Lần đầu)
Bạn sẽ cần apply file yaml thông qua script đã cung cấp:

```bash
chmod +x apply-all.sh
./apply-all.sh
```
Sau bước này, các DBs, Caches, Elastic, và Message Broker sẽ được đưa lên mạng cluster nội bộ (`.production.svc.cluster.local`).

---

## 6. Hướng dẫn luồng CI/CD với GitHub Actions

Mọi tác vụ biên dịch ảnh Docker và cập nhật mã nguồn sẽ được tự động hoàn thành bởi **GitHub Actions**, không cần thủ công.

1. **Khái quát**: Khi code được push/merge vào `dev/se-pay`, GitHub Actions sẽ tự động phát hiện module nào có thay đổi qua Path Filtering. (VD: sửa `server/1-gateway-service` thì chỉ mỗi Gateway Service được build lại).
2. **Quy trình Action**:
    - **Lint & Test**: (Mở rộng trong tương lai)
    - **Docker Build & Push**: Tự động tải NPM dependencies, đóng gói docker image dưới tag `stable-<build-number>` và đẩy thẳng lên Docker Hub.
    - **Deployment (Rolling Update)**: GitHub connect tới VPS bằng `KUBECONFIG_B64`, apply manifest K3s tương ứng, rồi `rollout restart/status` deployment để kéo image `stable` mới nhất.
3. **Cấu hình trên GitHub Repo**: Để pipeline chạy thành công, chủ repo phải cập nhật các Credentials vào GitHub **Settings > Secrets and variables > Actions > Repository secrets**.

Secrets bắt buộc cho mọi workflow:

| Secret | Giá trị |
| --- | --- |
| `DOCKERHUB_USERNAME` | Tên tài khoản Docker Hub, ví dụ `minhkhoi779`. |
| `DOCKERHUB_PASSWORD` | Docker Hub Access Token có quyền push image. |
| `NPM_TOKEN` | GitHub PAT có quyền `read:packages` để tải `@19010853/ithust-shared`. |
| `KUBECONFIG_B64` | Base64 kubeconfig K3s production. |
| `TELEGRAM_TOKEN` | Token bot Telegram từ `@BotFather`. |
| `TELEGRAM_TO` | Chat ID hoặc group ID nhận thông báo deploy. |

Secrets bắt buộc riêng cho frontend:

| Secret | Giá trị |
| --- | --- |
| `VITE_BASE_ENDPOINT` | `https://ithust.store` |
| `VITE_CLIENT_ENDPOINT` | `https://ithust.shop` |
| `VITE_STRIPE_KEY` | Stripe publishable key dạng `pk_live_...`. |

Secrets optional cho frontend APM:

| Secret | Giá trị |
| --- | --- |
| `VITE_ELASTIC_APM_SERVER` | URL APM frontend, để trống nếu chưa dùng. |
| `VITE_ELASTIC_APM_SERVER_TOKEN` | Token APM frontend, để trống nếu chưa dùng. |

Tạo `KUBECONFIG_B64` trên VPS:

```bash
cat ~/.kube/config | sed "s/127.0.0.1/YOUR_VPS_PUBLIC_IP/g" | base64 -w 0
```

Workflow chạy `kubectl` từ GitHub runner, nên kubeconfig không được trỏ về `127.0.0.1`. VPS phải cho GitHub runner truy cập Kubernetes API public, thường là port `6443`.

Branch deploy hiện dùng cho workflow là `dev/se-pay`. Git không cho tạo đồng thời branch `dev` khi remote đang có các branch dạng `dev/*`, vì vậy cứ push trực tiếp lên `dev/se-pay`:

```bash
git push origin dev/se-pay
```

---

## 7. Xử lý Lỗi Cơ Bản K3s
- **Elasticsearch bị CrashLoopBackOff**: Mặc định VPS thiếu quyền RAM. Chạy `sudo sysctl -w vm.max_map_count=262144`.
- **Lấy Password Kibana**: Đợi 2 phút cài đặt, nhập lệnh: `kubectl exec -n production deploy/ithust-elastic -- elasticsearch-reset-password -u kibana_system -b`.
- **Cập nhật Kubernetes Pod bị Pending**: StorageClass `local-path` chưa được khởi tạo, dùng `kubectl describe pvc -n production` để tra cứu thông báo lỗi đĩa. 

---

**Cấp phép:** Bản quyền ISC.
