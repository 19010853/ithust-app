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

### Bước 4.1: Khởi động Hạ tầng Docker
Bạn cần tải các image và khởi tạo container từ file cấu hình (nếu có) hoặc dùng lệnh start nhanh nếu container đã từng tạo:

```bash
# Khởi động Database & Cache
docker start postgres_container mongodb_container mysql_container redis_container

# Khởi động Message Broker
docker start rabbitmq_container

# Khởi động Elastic Stack (Tìm kiếm/Giám sát)
docker start elasticsearch_container kibana_container apm_server_container heartbeat_container metricbeat_container
```
*(Nếu muốn chạy tắt mọi thứ, dùng: `docker start postgres_container mongodb_container mysql_container redis_container rabbitmq_container elasticsearch_container kibana_container apm_server_container heartbeat_container metricbeat_container`)*

### Bước 4.2: Khởi động Microservices và Client
Trong môi trường phát triển, hãy mở từng terminal riêng:

```bash
# Frontend
cd client
npm install
npm run dev

# Backend (Thực hiện tương tự cho cả 8 service)
cd server/1-gateway-service
npm install
npm run dev:watch
```
> **Lưu ý**: Cần thêm thư mục `.env` theo `backend-secrets.example.yaml` tương ứng cho từng môi trường local.

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
      - "--certificatesresolvers.letsencrypt.acme.email=YOUR_EMAIL@domain.com"
      - "--certificatesresolvers.letsencrypt.acme.storage=/data/acme.json"
      - "--certificatesresolvers.letsencrypt.acme.tlschallenge=true"
```

Trỏ tên miền (ví dụ: `ithustapp.com`, `api.ithustapp.com`) tại DNS Provider của bạn bằng `A Record` về IP của VPS.

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

1. **Khái quát**: Khi code được push/merge vào `main`, GitHub Actions sẽ tự động phát hiện module nào có thay đổi qua Path Filtering. (VD: sửa `server/1-gateway-service` thì chỉ mỗi Gateway Service được build lại).
2. **Quy trình Action**:
    - **Lint & Test**: (Mở rộng trong tương lai)
    - **Docker Build & Push**: Tự động tải NPM dependencies, đóng gói docker image dưới tag `stable-<build-number>` và đẩy thẳng lên Docker Hub.
    - **Deployment (Rolling Update)**: GitHub connect tới VPS bằng TLS (KubeConfig base64), xoá pods hiển tại báo hiệu K3s tải hình ảnh `latest/stable` trên docker hub. Hệ thống không gây gián đoạn down-time thông qua K8s.
3. **Cấu hình trên GitHub Repo**: Để pipeline chạy thành công, chủ repo phải cập nhật các Credentials vào Github **Settings > Secrets**:
    - `DOCKERHUB_USERNAME`, `DOCKERHUB_PASSWORD`: Token đăng nhập hệ thống docker để đẩy image.
    - `NPM_TOKEN`: GitHub personal PAT để tải chung các package public (@19010853/ithust-shared) dưới dạng registry.
    - `KUBECONFIG_B64`: String Base64 của file `~/.kube/config` trích từ nội VPS. *(Dùng lệnh `cat ~/.kube/config | base64` ở Server)*.
    - Các khoá cấu hình Frontend: `VITE_BASE_ENDPOINT`, `STRIPE_API_KEY`, v.v...

---

## 7. Xử lý Lỗi Cơ Bản K3s
- **Elasticsearch bị CrashLoopBackOff**: Mặc định VPS thiếu quyền RAM. Chạy `sudo sysctl -w vm.max_map_count=262144`.
- **Lấy Password Kibana**: Đợi 2 phút cài đặt, nhập lệnh: `kubectl exec -n production deploy/ithust-elastic -- elasticsearch-reset-password -u kibana_system -b`.
- **Cập nhật Kubernetes Pod bị Pending**: StorageClass `local-path` chưa được khởi tạo, dùng `kubectl describe pvc -n production` để tra cứu thông báo lỗi đĩa. 

---

**Cấp phép:** Bản quyền ISC.
