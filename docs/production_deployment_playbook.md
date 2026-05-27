# CẨM NANG TRIỂN KHAI HỆ THỐNG IT HUST APP LÊN VPS LINUX K3S & CI/CD GITHUB ACTIONS

Cẩm nang này cung cấp lộ trình chi tiết chia làm **6 Phase** giúp bạn đưa hệ thống Microservices **IT HUST App** (bao gồm React Frontend, Gateway Service, và 7 Backend Microservices) từ môi trường phát triển (Local/Sandbox) lên môi trường sản xuất (Production) sử dụng cụm **K3s (Kubernetes tối giản) trên VPS Linux (Ubuntu)**, cấu hình HTTPS tự động với **Traefik + Let's Encrypt**, và thiết lập pipeline tự động hóa qua **GitHub Actions**.

---

## 🗺️ PHẦN 1: LỘ TRÌNH TRIỂN KHAI CHI TIẾT (6 PHASES)

```mermaid
graph TD
    P1[Phase 1: Chuẩn bị Hạ tầng & DNS] --> P2[Phase 2: Cài K3s & Traefik HTTPS]
    P2 --> P3[Phase 3: Triển khai Databases & Services nền]
    P3 --> P4[Phase 4: Cấu hình Secrets & Biến môi trường]
    P4 --> P5[Phase 5: Deploy Microservices & Frontend]
    P5 --> P6[Phase 6: Thiết lập CI/CD GitHub Actions]
```

### 🔹 PHASE 1: Chuẩn bị Hạ tầng VPS & Trỏ DNS
1. **Yêu cầu cấu hình VPS (Linux Ubuntu 22.04 LTS trở lên)**:
   * **RAM**: Khuyến nghị tối thiểu **8GB** (tốt nhất là **16GB**) vì cụm cần chạy đồng thời Elasticsearch, MySQL, Postgres, MongoDB, Redis, RabbitMQ và 8 microservices.
   * **CPU**: Tối thiểu **4 Cores**.
   * **Ổ cứng (SSD/NVMe)**: **40GB - 80GB** trở lên (Elasticsearch và các DBs tiêu tốn dung lượng I/O khá nhiều).
2. **Cấu hình bản ghi tên miền (DNS)**:
   * Vào trang quản trị tên miền của bạn (Namecheap, Cloudflare, Pavietnam, v.v...) trỏ các bản ghi **A Record** về địa chỉ IP Public của VPS:
     * `ithust.shop` $\rightarrow$ Địa chỉ IP VPS (Dành cho Frontend Production)
     * `ithust.store` $\rightarrow$ Địa chỉ IP VPS (Dành cho Backend Gateway API)
     * `dev.ithust.shop` $\rightarrow$ Địa chỉ IP VPS (Dành cho Frontend Sandbox/Staging nếu có)
     * `dev.ithust.store` $\rightarrow$ Địa chỉ IP VPS (Dành cho Backend Sandbox/Staging nếu có)
     * `kibana.ithust.store` $\rightarrow$ Địa chỉ IP VPS (Dành cho Elastic Kibana giám sát logs/APM)

---

### 🔹 PHASE 2: Cài đặt K3s & Cấu hình Traefik HTTPS tự động
K3s tích hợp sẵn **Traefik làm Ingress Controller** mặc định. Chúng ta sẽ kích hoạt tính năng tự cấp chứng chỉ SSL Let's Encrypt.

1. **Cài đặt K3s lên VPS**:
   SSH vào VPS và chạy lệnh:
   ```bash
   curl -sfL https://get.k3s.io | sh -
   ```
2. **Phân quyền truy cập cluster không cần sudo**:
   ```bash
   mkdir -p ~/.kube
   sudo cp /etc/rancher/k3s/k3s.yaml ~/.kube/config
   sudo chown $(id -u):$(id -g) ~/.kube/config
   chmod 600 ~/.kube/config
   export KUBECONFIG=~/.kube/config
   ```
3. **Cấu hình Traefik Let's Encrypt**:
   Sửa file cấu hình HelmChart của Traefik do K3s tự động tạo để bật TLS Challenge:
   ```bash
   sudo nano /var/lib/rancher/k3s/server/manifests/traefik-config.yaml
   ```
   Cập nhật nội dung như sau (nhớ thay đổi địa chỉ email của bạn):
   ```yaml
   apiVersion: helm.cattle.io/v1
   kind: HelmChartConfig
   metadata:
     name: traefik
     namespace: kube-system
   spec:
     valuesContent: |-
       additionalArguments:
         - "--certificatesresolvers.letsencrypt.acme.email=your-email@example.com"
         - "--certificatesresolvers.letsencrypt.acme.storage=/data/acme.json"
         - "--certificatesresolvers.letsencrypt.acme.tlschallenge=true"
   ```
   > [!NOTE]
   > Traefik sẽ tự động lắng nghe cấu hình `Ingress` có annotation resolver `letsencrypt` để gửi yêu cầu cấp chứng chỉ SSL miễn phí từ Let's Encrypt và tự động gia hạn sau mỗi 90 ngày.

---

### 🔹 PHASE 3: Triển khai Database & Middleware (Hạ tầng nền)
Trước khi chạy code ứng dụng, cụm K3s cần có sẵn các cơ sở dữ liệu và message broker.

1. **Khắc phục lỗi RAM cho Elasticsearch**:
   Elasticsearch mặc định yêu cầu tài nguyên ảo hóa bộ nhớ cao hơn giới hạn mặc định của Linux. Trên VPS, hãy chạy lệnh sau để tránh lỗi `CrashLoopBackOff`:
   ```bash
   sudo sysctl -w vm.max_map_count=262144
   # Để duy trì sau khi reboot VPS:
   echo "vm.max_map_count=262144" | sudo tee -a /etc/sysctl.conf
   ```
2. **Clone mã nguồn dự án về VPS (Chỉ dùng để chạy script khởi tạo lần đầu)**:
   ```bash
   git clone https://github.com/your-username/ithust-app.git
   cd ithust-app/kubernetes/k3s
   ```
3. **Tạo Namespace `production`**:
   ```bash
   kubectl create namespace production || true
   ```
4. **Deploy cơ sở hạ tầng (Database & Middleware)**:
   Bạn có thể apply từng thư mục hạ tầng bằng lệnh `kubectl apply -f`:
   ```bash
   kubectl apply -f mongodb/
   kubectl apply -f mysql/
   kubectl apply -f postgresql/
   kubectl apply -f redis/
   kubectl apply -f rabbitmq/
   kubectl apply -f elasticsearch/
   kubectl apply -f kibana/
   ```
   *Kiểm tra trạng thái hạ tầng:*
   ```bash
   kubectl get pods -n production
   ```
   > [!WARNING]
   > Hãy đợi tất cả các cơ sở dữ liệu và RabbitMQ/Elasticsearch chuyển sang trạng thái `Running` hoàn toàn trước khi tiếp tục. Riêng Elasticsearch có thể mất từ 2-3 phút để khởi tạo.

---

### 🔹 PHASE 4: Quản lý Secrets & Biến môi trường
Toàn bộ thông tin mật (Mật khẩu DB, API Key cổng thanh toán, JWT Secret) sẽ được đóng gói thành một K8s `Secret` có tên `ithust-backend-secret` thuộc namespace `production`.

1. **Tạo file cấu hình bí mật thực tế**:
   ```bash
   mkdir -p secrets
   cp backend-secrets.example.yaml secrets/backend-secrets.yaml
   nano secrets/backend-secrets.yaml
   ```
2. **Mã hóa các giá trị sang Base64**:
   Mọi giá trị trong trường `data:` của Kubernetes Secret bắt buộc phải được mã hóa Base64.
   * Trên Linux VPS, tạo nhanh chuỗi Base64 bằng lệnh:
     ```bash
     echo -n "mật_khẩu_hoặc_key_của_bạn" | base64
     ```
   * *Ví dụ*: Nếu `secret-key-one` là `my-super-secret-123`, chạy `echo -n "my-super-secret-123" | base64` ra kết quả `bXktc3VwZXItc2VjcmV0LTEyMw==`. Nhập chuỗi này vào file yaml.
3. **Apply Secret vào Cluster**:
   ```bash
   kubectl apply --validate=false -f secrets/backend-secrets.yaml
   ```

*(Chi tiết cách đổi biến môi trường từ Sandbox $\rightarrow$ Production được hướng dẫn cụ thể ở **Phần 2**).*

---

### 🔹 PHASE 5: Triển khai các Microservices ứng dụng
Khi hạ tầng và các Secrets đã sẵn sàng, chúng ta tiến hành triển khai các dịch vụ logic của backend.

1. **Apply các manifest của từng service**:
   ```bash
   kubectl apply -f 0-frontend/
   kubectl apply -f 1-gateway-service/
   kubectl apply -f 2-notifications-service/
   kubectl apply -f 3-auth-service/
   kubectl apply -f 4-users-service/
   kubectl apply -f 5-gig-service/
   kubectl apply -f 6-chat-service/
   kubectl apply -f 7-order-service/
   kubectl apply -f 8-review-service/
   ```
   Hoặc sử dụng nhanh script tự động: `chmod +x apply-all.sh && ./apply-all.sh`.
2. **Xác nhận Ingress hoạt động**:
   Traefik sẽ lắng nghe các file `ingress.yaml` của Gateway và Frontend để tạo cấu hình định tuyến.
   * Để xem IP và trạng thái của Ingress:
     ```bash
     kubectl get ingress -n production
     ```

---

### 🔹 PHASE 6: Thiết lập CI/CD tự động bằng GitHub Actions
Thay vì build Docker image thủ công trên VPS tốn tài nguyên và gây gián đoạn dịch vụ, quy trình chuẩn như sau:

```mermaid
sequenceDiagram
    developer->>github: Push code lên nhánh dev/se-pay
    github->>github actions: Trigger Workflow
    github actions->>dockerhub: Build & Push Docker Image (tag: stable)
    github actions->>VPS K3s: Apply manifest & rollout restart
    VPS K3s->>dockerhub: Pull Image mới nhất và Rolling Update (Không downtime)
```

1. Mỗi lần push code lên nhánh release (như `dev` hoặc `main`), GitHub Actions Runner sẽ tự đóng gói ứng dụng thành Docker image với tag `stable` và đẩy lên Docker Hub.
2. Actions kết nối tới VPS bằng cấu hình `KUBECONFIG`, apply lại manifest tương ứng rồi restart deployment:
   ```bash
   kubectl apply -f kubernetes/k3s/<tên-thư-mục-service>/
   kubectl rollout restart deployment/<tên-deployment> -n production
   kubectl rollout status deployment/<tên-deployment> -n production --timeout=180s
   ```
   Do trong manifest K8s cài đặt `imagePullPolicy: Always` nên khi rollout tạo Pod mới, Pod sẽ tự động kéo Docker image `stable` mới nhất từ Docker Hub về chạy. Điều này giúp hệ thống cập nhật tự động qua Rolling Update.

---

## 🔐 PHẦN 2: HƯỚNG DẪN CHUYỂN BIẾN MÔI TRƯỜNG (SANDBOX ➔ PRODUCTION)

Khi chuyển dịch từ chạy thử nghiệm sang môi trường thương mại thực tế, việc quản trị biến môi trường vô cùng quan trọng để đảm bảo tính an toàn bảo mật và khả năng mở rộng. Dưới đây là bảng phân tích chi tiết:

### 1. Thông tin cấu hình chính (Core & Routing)
| Tên biến (K8s Secret Key / Env) | Môi trường Sandbox / Local | Môi trường Production thực tế | Giải thích & Hành động |
| :--- | :--- | :--- | :--- |
| `NODE_ENV` | `development` / `test` | `production` | Bật các tối ưu hóa production của Node.js, tắt verbose logging không cần thiết. |
| `ENABLE_APM` | `0` | `0` mặc định, đổi sang `1` khi đã có APM server thật | Tránh lỗi cấu hình rỗng khi chưa triển khai Elastic APM. |
| `CLIENT_URL` / `VITE_CLIENT_ENDPOINT` | `http://localhost:3000` | `https://ithust.shop` | Domain chính thức của giao diện người dùng frontend (cần cấu hình HTTPS). |
| `VITE_BASE_ENDPOINT` | `http://localhost:4000` | `https://ithust.store` | Điểm truy cập API Gateway bên ngoài. Client sẽ gửi toàn bộ API request tới đây qua HTTPS. |

### 2. Cổng thanh toán quét mã QR SePay (Rất quan trọng)
Dự án sử dụng SePay/VietQR làm luồng thanh toán duy nhất cho order production.
| Tên biến (K8s Secret Key) | Môi trường Sandbox (Test mode) | Môi trường Production | Giải thích & Hành động |
| :--- | :--- | :--- | :--- |
| `PLATFORM_BANK_ID` | `MBBank` | Tên ngân hàng thật (vd: `Vietcombank`, `Techcombank`, `MBBank`) | Mã ngân hàng thụ hưởng chính thức của doanh nghiệp/chủ sàn. Tra cứu mã chuẩn tại `https://qr.sepay.vn/banks.json`. |
| `PLATFORM_BANK_ACCOUNT` | `0123456789` (Số TK test) | Số tài khoản thật / Số tài khoản ảo (VA) | Số tài khoản ngân hàng chính thức nhận tiền thanh toán từ khách hàng. |
| `SEPAY_WEBHOOK_SECRET` | Key lấy từ mục **Test mode** trên `my.sepay.vn` | Key lấy từ mục **Live mode** trên `my.sepay.vn` | Mã token bí mật dùng để xác thực webhook gửi đi từ SePay. Đảm bảo request gửi tới cổng Gateway của bạn đúng là từ hệ thống SePay chứ không phải hacker giả lập. |
| *Webhook URL cấu hình trên SePay* | `https://your-ngrok-tunnel.ngrok-free.app/api/gateway/v1/sepay/webhook` | `https://ithust.store/api/gateway/v1/sepay/webhook` | Địa chỉ endpoint Gateway chính thức tiếp nhận dữ liệu giao dịch biến động số dư. |

Refund và seller withdrawal hiện là quy trình manual review nội bộ; không dùng API refund tự động từ cổng thanh toán khác.

### 3. Cơ sở dữ liệu & Cấu hình mạng Cluster K3s
Trên localhost, các dịch vụ kết nối với DB qua cổng map ra máy vật lý (ví dụ MySQL port 3307, Redis 6379). Trên K3s Production, các dịch vụ gọi nhau thông qua hệ thống phân giải tên miền nội bộ của Kubernetes (CoreDNS) để tối đa hóa bảo mật (không mở cổng DB ra internet).
| Tên biến (K8s Secret Key) | Cấu hình Sandbox/Local | Cấu hình Production trên K3s | Giải thích & Hành động |
| :--- | :--- | :--- | :--- |
| `mongo-database-url` | `mongodb://localhost:27017/ithust` | `mongodb://ithust-mongo.production.svc.cluster.local:27017/ithust` | Kết nối nội bộ tới StatefulSet MongoDB trong cụm K3s. |
| `ithust-mysql-db` | `mysql://root:api@localhost:3307/ithust_auth` | `mysql://ithust:api@ithust-mysql.production.svc.cluster.local:3307/ithust_auth` | Kết nối nội bộ tới service MySQL. Lưu ý port mặc định khai báo trong service K3s là `3307`. |
| `ithust-postgres-host` / `DATABASE_PORT` | `localhost` / `5432` | `ithust-postgres.production.svc.cluster.local` / `5432` | Hostname và port của dịch vụ PostgreSQL dùng cho Review Service. |
| `ithust-redis-host` | `redis://127.0.0.1:6379` | `redis://ithust-redis.production.svc.cluster.local:6379` | Kết nối Redis làm cache và quản lý session chat thời gian thực. |
| `ithust-rabbitmq-endpoint` | `amqp://guest:guest@localhost:5672` | `amqp://ithust:ithustpass@ithust-queue.production.svc.cluster.local:5672` | Endpoint kết nối RabbitMQ để truyền tin nhắn bất đồng bộ giữa các microservices. |
| `ithust-elasticsearch-url` | `http://localhost:9200` | `http://elastic:mật-khẩu-thật@ithust-elastic.production.svc.cluster.local:9200` | Đường dẫn kết nối Elasticsearch phục vụ cho việc tìm kiếm gig/dịch vụ nhanh. |

### 4. Dịch vụ lưu trữ hình ảnh Cloudinary
| Tên biến (K8s Secret Key) | Môi trường Sandbox | Môi trường Production | Giải thích & Hành động |
| :--- | :--- | :--- | :--- |
| `cloud-name`, `cloud-api-key`, `cloud-api-secret` | Tài khoản cá nhân chạy thử | Tài khoản Cloudinary Production doanh nghiệp | Nơi lưu trữ hình ảnh tải lên từ avatar người dùng, ảnh minh họa gigs, hình ảnh đính kèm tin nhắn chat. Nên tạo thư mục/folder riêng để tránh lẫn lộn file test. |

### 5. Gửi Email thông báo (SMTP)
| Tên biến (K8s Secret Key) | Môi trường Sandbox | Môi trường Production | Giải thích & Hành động |
| :--- | :--- | :--- | :--- |
| `sender-email` | Email cá nhân (vd: `test@gmail.com`) | Email giao dịch (vd: `no-reply@ithust.shop`) | Địa chỉ email hiển thị ở hộp thư khách hàng khi hệ thống gửi thông báo kích hoạt tài khoản hoặc đơn hàng. |
| `sender-email-password` | Mật khẩu ứng dụng Gmail (App Password 16 ký tự) | API Key của dịch vụ SMTP chính thức (vd: SendGrid, Amazon SES, Mailgun) | Để đạt tỷ lệ thư vào Inbox cao không bị spam, khuyến nghị sử dụng nhà cung cấp SMTP chuyên nghiệp thay vì SMTP Gmail cá nhân bị giới hạn số lượng gửi hàng ngày. |

---

## 🛠️ PHẦN 3: CẤU HÌNH GITHUB SECRETS CHO PIPELINE GITHUB ACTIONS

Để cho phép pipeline GitHub Actions tự động thực hiện tiến trình tích hợp liên tục và triển khai liên tục (CI/CD) mà không làm lộ các khóa bảo mật lên mã nguồn công khai, bạn cần truy cập vào **GitHub Repository $\rightarrow$ Settings $\rightarrow$ Secrets and variables $\rightarrow$ Actions $\rightarrow$ New repository secret** để thêm các khóa sau:

### Bảng cấu hình các Github Secrets cần thiết:

| Tên Secret trên Github | Giá trị cần điền | Hướng dẫn lấy giá trị |
| :--- | :--- | :--- |
| `DOCKERHUB_USERNAME` | Tên tài khoản Docker Hub của bạn | Ví dụ: `minhkhoi779` |
| `DOCKERHUB_PASSWORD` | Docker Hub Access Token (Khuyến nghị) hoặc mật khẩu | Vào **Docker Hub $\rightarrow$ Account Settings $\rightarrow$ Security $\rightarrow$ New Access Token**. Tạo token có quyền **Read & Write** để bảo mật hơn sử dụng mật khẩu gốc. |
| `NPM_TOKEN` | GitHub Personal Access Token (PAT) hoặc NPM Token | Dùng để tải các thư viện dùng chung được đóng gói riêng của bạn (ví dụ `@19010853/ithust-shared`). Cách lấy: Vào **GitHub $\rightarrow$ Developer Settings $\rightarrow$ Personal Access Tokens (Classic)** $\rightarrow$ Tạo token có quyền `read:packages`. |
| `KUBECONFIG_B64` | Chuỗi mã hóa Base64 của file cấu hình Kubernetes trên VPS | **Đây là cầu nối giúp GitHub điều khiển cụm K3s trên VPS**. Hãy đăng nhập SSH vào VPS và chạy lệnh:<br>`cat ~/.kube/config \| sed "s/127.0.0.1/YOUR_VPS_PUBLIC_IP/g" \| base64 -w 0`<br>Copy toàn bộ chuỗi ký tự hiển thị trên màn hình dán vào giá trị Secret này. |
| `VITE_BASE_ENDPOINT` | `https://ithust.store` | Địa chỉ URL API Gateway chính thức cho môi trường Production. |
| `VITE_CLIENT_ENDPOINT` | `https://ithust.shop` | Địa chỉ URL trang giao diện người dùng Frontend Production. |
| `VITE_ELASTIC_APM_SERVER` | URL APM frontend, có thể để trống nếu chưa dùng | Chỉ điền khi đã triển khai APM server thật. |
| `VITE_ELASTIC_APM_SERVER_TOKEN` | Token APM frontend, có thể để trống nếu chưa dùng | Chỉ điền khi APM server yêu cầu token. |
| `TELEGRAM_TOKEN` | Token của Telegram Bot thông báo | Chat với `@BotFather` trên Telegram để tạo Bot mới và lấy Token thông báo trạng thái Deploy thành công/thất bại. |
| `TELEGRAM_TO` | ID phòng chat nhận thông báo | ID của tài khoản Telegram cá nhân của bạn hoặc Group ID nơi add Bot vào nhận tin nhắn trạng thái deploy. |

> [!IMPORTANT]
> Workflow chạy `kubectl` từ GitHub runner, nên `server:` trong kubeconfig không được là `127.0.0.1`. Hãy thay bằng IP public/domain của VPS và đảm bảo Kubernetes API port `6443` có thể truy cập theo chính sách firewall của bạn.

> [!NOTE]
> Các backend runtime secrets như mật khẩu DB, RabbitMQ, Elasticsearch, Cloudinary, SePay live key không cần đưa vào GitHub Actions nếu workflow không dùng trực tiếp. Các giá trị đó nằm trong Kubernetes Secret `kubernetes/k3s/secrets/backend-secrets.yaml` và apply trực tiếp vào cluster.

---

## 🔍 QUY TRÌNH VẬN HÀNH & BẢO TRÌ SAU DEPLOY

1. **Kiểm tra trạng thái hệ thống Microservices**:
   ```bash
   kubectl get pods -n production -w
   ```
2. **Xem logs trực tiếp của bất kỳ dịch vụ nào (Ví dụ: Gateway Service)**:
   ```bash
   kubectl logs -n production -l app=ithust-gateway --tail=100 -f
   ```
3. **Cách restart một service thủ công không gây downtime**:
   Nếu muốn cập nhật cấu hình mà không đổi code:
   ```bash
   kubectl rollout restart deployment/ithust-gateway -n production
   ```
4. **Xử lý sự cố Elasticsearch thiếu RAM đột ngột**:
   Nếu Pod Elasticsearch bị crash với lỗi thoát bộ nhớ vật lý:
   ```bash
   kubectl describe pod -n production -l app=ithust-elastic
   # Kiểm tra giới hạn tài nguyên cấp phát trong file elasticsearch deployment.yaml
   ```

---

> [!TIP]
> **Khuyến nghị bảo mật**: Không bao giờ commit file `kubernetes/k3s/secrets/backend-secrets.yaml` lên GitHub. File này phải nằm trong `.gitignore`; nếu đã từng commit credential thật, hãy rotate toàn bộ secret trước khi deploy production. Chỉ lưu trữ file thật an toàn trên VPS hoặc dùng giải pháp quản lý khóa tập trung như HashiCorp Vault sau này.
