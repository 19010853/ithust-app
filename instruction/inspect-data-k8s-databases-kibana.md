# Tra cứu dữ liệu, Kubernetes, Database, Kibana — ITHust App

> VPS IP: `103.147.123.149` · Cluster: K3s · Namespace: `production`

---

## Mục lục

1. [Tra cứu dữ liệu trong từng Microservice](#1-tra-cứu-dữ-liệu-trong-từng-microservice)
2. [Kiểm tra Nodes & Secrets trong Kubernetes](#2-kiểm-tra-nodes--secrets-trong-kubernetes)
3. [Kết nối Lens từ máy local](#3-kết-nối-lens-từ-máy-local)
4. [Kết nối Database bằng TablePlus](#4-kết-nối-database-bằng-tableplus)
5. [Xem Kibana trên browser máy cá nhân](#5-xem-kibana-trên-browser-máy-cá-nhân)
6. [Xem Metricbeat & Heartbeat](#6-xem-metricbeat--heartbeat)
7. [Tra cứu Elasticsearch trên Kibana](#7-tra-cứu-elasticsearch-trên-kibana)

---

## 1. Tra cứu dữ liệu trong từng Microservice

### Bản đồ dữ liệu — Service → Database

| Service | Port | Database | Loại DB | Tên DB / Bảng |
|---------|------|----------|---------|---------------|
| gateway | 4000 | Redis (cache, session) | Redis | — |
| notification | 4001 | _(không lưu DB riêng)_ | — | — |
| auth | 4002 | MySQL | `ithust_auth` | users, auth tokens |
| users | 4003 | MongoDB | `ithust-users` | buyers, sellers |
| gig | 4004 | MongoDB + Elasticsearch | `ithust-gig` | gigs, categories |
| chat | 4005 | MongoDB | `ithust-chat` | conversations, messages |
| order | 4006 | MongoDB | `ithust-order` | orders, payments |
| review | 4007 | PostgreSQL | `ithust_reviews` | reviews, ratings |

---

### 1.1 Xem log của từng service (K8s)

```bash
# Xem log realtime
kubectl logs -f deployment/ithust-gateway -n production
kubectl logs -f deployment/ithust-auth -n production
kubectl logs -f deployment/ithust-users -n production
kubectl logs -f deployment/ithust-gig -n production
kubectl logs -f deployment/ithust-chat -n production
kubectl logs -f deployment/ithust-order -n production
kubectl logs -f deployment/ithust-review -n production
kubectl logs -f deployment/ithust-notification -n production

# Xem 100 dòng cuối cùng
kubectl logs --tail=100 deployment/ithust-auth -n production

# Lọc log theo từ khoá (ví dụ: lỗi)
kubectl logs deployment/ithust-order -n production | grep -i "error\|fail"
```

---

### 1.2 Exec vào container để kiểm tra dữ liệu trực tiếp

```bash
# Lấy tên pod
kubectl get pods -n production

# Exec vào pod service cụ thể
kubectl exec -it <pod-name> -n production -- sh

# Ví dụ exec vào auth service
kubectl exec -it $(kubectl get pod -l app=ithust-auth -n production -o name | head -1) -n production -- sh
```

---

### 1.3 Kiểm tra dữ liệu MongoDB (users, gig, chat, order)

```bash
# Exec vào MongoDB pod
kubectl exec -it ithust-mongo-0 -n production -- mongosh

# Trong mongosh:
show dbs
use ithust-users
show collections
db.buyers.find().limit(5).pretty()
db.sellers.find().limit(5).pretty()

use ithust-gig
db.gigs.find().limit(5).pretty()
db.gigs.countDocuments()

use ithust-chat
db.conversations.find().limit(5).pretty()
db.messages.find().limit(5).pretty()

use ithust-order
db.orders.find().limit(5).pretty()
db.orders.find({ status: "cancelled" }).count()
```

---

### 1.4 Kiểm tra dữ liệu MySQL (auth)

```bash
# Exec vào MySQL pod
kubectl exec -it deployment/ithust-mysql -n production -- bash

# Trong container:
mysql -u ithust -p
# (nhập password từ secret)

USE ithust_auth;
SHOW TABLES;
SELECT id, username, email, createdAt FROM users LIMIT 10;
SELECT COUNT(*) FROM users;
```

---

### 1.5 Kiểm tra dữ liệu PostgreSQL (reviews)

```bash
# Exec vào Postgres pod
kubectl exec -it deployment/ithust-postgres -n production -- psql -U ithust -d ithust_reviews

# Trong psql:
\dt
SELECT * FROM reviews LIMIT 10;
SELECT COUNT(*) FROM reviews;
SELECT rating, COUNT(*) FROM reviews GROUP BY rating;
```

---

### 1.6 Kiểm tra Redis (cache / session)

```bash
# Exec vào Redis pod
kubectl exec -it ithust-redis-0 -n production -- redis-cli

# Trong redis-cli:
KEYS *
DBSIZE
GET <key-name>
TTL <key-name>

# Xem tất cả key theo pattern
SCAN 0 MATCH "user:*" COUNT 100
```

---

## 2. Kiểm tra Nodes & Secrets trong Kubernetes

### 2.1 Kiểm tra Nodes

```bash
# Xem node và trạng thái
kubectl get nodes
kubectl get nodes -o wide

# Xem chi tiết node (CPU, RAM, conditions)
kubectl describe node vpsmk

# Xem tài nguyên đang dùng trên node
kubectl top nodes
```

---

### 2.2 Xem tất cả tài nguyên trong namespace production

```bash
# Pods
kubectl get pods -n production
kubectl get pods -n production -o wide

# Deployments
kubectl get deployments -n production

# Services
kubectl get services -n production

# StatefulSets (MongoDB, Redis)
kubectl get statefulsets -n production

# Ingresses
kubectl get ingress -n production

# PersistentVolumeClaims
kubectl get pvc -n production

# Tất cả resource
kubectl get all -n production
```

---

### 2.3 Kiểm tra Secrets

```bash
# Xem danh sách secrets
kubectl get secrets -n production

# Xem tên các key trong secret (không hiện giá trị)
kubectl describe secret ithust-backend-secret -n production

# Xem giá trị một key cụ thể (decode base64)
kubectl get secret ithust-backend-secret -n production \
  -o jsonpath='{.data.gateway-jwt-token}' | base64 --decode

# Decode nhiều key cùng lúc
kubectl get secret ithust-backend-secret -n production -o json | \
  python3 -c "
import json, base64, sys
data = json.load(sys.stdin)['data']
for k, v in data.items():
    print(f'{k}: {base64.b64decode(v).decode()}')
"
```

**Các key có trong `ithust-backend-secret`:**

| Key | Dùng cho |
|-----|---------|
| `secret-key-one`, `secret-key-two` | Encryption sessions |
| `gateway-jwt-token` | Xác thực giữa gateway và services |
| `jwt-token` | JWT signing key |
| `ithust-redis-host` | Redis connection string |
| `ithust-mysql-db` | MySQL connection string (auth service) |
| `ithust-postgres-host/user/password` | PostgreSQL (review service) |
| `mongo-database-url` | MongoDB connection string |
| `stripe-secret-key` | Stripe payment key |
| `stripe-order-webhook-secret` | Stripe order webhook |
| `stripe-connect-webhook-secret` | Stripe connect webhook |
| `cloud-name/api-key/api-secret` | Cloudinary (image upload) |
| `ithust-rabbitmq-*` | RabbitMQ connection |
| `ithust-elasticsearch-*` | Elasticsearch connection |
| `sender-email`, `brevo-smtp-*` | Email (notification service) |
| `platform-owner-*` | Admin account seed |
| `usd-to-vnd-rate-*` | Currency conversion API |

---

### 2.4 Cập nhật / thay đổi Secret

```bash
# Encode giá trị mới
echo -n "new-secret-value" | base64

# Chỉnh sửa secret trực tiếp
kubectl edit secret ithust-backend-secret -n production

# Hoặc patch key cụ thể
kubectl patch secret ithust-backend-secret -n production \
  --type=merge \
  -p '{"data":{"jwt-token":"'$(echo -n "new-value" | base64)'"}}'

# Sau khi đổi secret cần restart service dùng secret đó
kubectl rollout restart deployment/ithust-auth -n production
```

---

### 2.5 Kiểm tra health & trạng thái pod

```bash
# Xem events gần đây (debug crash)
kubectl get events -n production --sort-by='.lastTimestamp' | tail -20

# Describe pod để xem lỗi
kubectl describe pod <pod-name> -n production

# Kiểm tra resource usage (cần metrics-server)
kubectl top pods -n production
```

---

## 3. Kết nối Lens từ máy local

### 3.1 Tải kubeconfig từ VPS về máy local

**Bước 1**: SSH vào VPS, lấy nội dung kubeconfig

```bash
# Trên VPS
sudo cat /etc/rancher/k3s/k3s.yaml
```

**Bước 2**: Trên **máy local**, tạo file kubeconfig

```bash
# Tạo thư mục nếu chưa có
mkdir -p ~/.kube

# Tạo file config
nano ~/.kube/config-ithust
# (dán nội dung từ bước 1 vào)
```

**Bước 3**: Thay địa chỉ server trong file config

Mở file vừa tạo và đổi dòng `server`:

```yaml
# Thay dòng này:
server: https://127.0.0.1:6443

# Thành:
server: https://103.147.123.149:6443
```

**Bước 4**: Cần mở port 6443 trên VPS (nếu chưa mở)

```bash
# Trên VPS — cho phép kết nối đến API server K3s
sudo ufw allow 6443/tcp
```

---

### 3.2 Import vào Lens

1. Mở **Lens Desktop**
2. Click **+** (Add Cluster) ở góc trái
3. Chọn **Add from kubeconfig**
4. Dán nội dung file `~/.kube/config-ithust` (đã sửa IP)
5. Click **Add cluster**

---

### 3.3 Kiểm tra kết nối

```bash
# Trên máy local (sau khi đặt KUBECONFIG)
export KUBECONFIG=~/.kube/config-ithust
kubectl get nodes
kubectl get pods -n production
```

---

### 3.4 Dùng SSH tunnel thay vì mở port 6443 (bảo mật hơn)

Nếu không muốn expose port 6443 ra internet:

```bash
# Tạo SSH tunnel — chạy lần đầu, để background
ssh -L 6443:127.0.0.1:6443 vmadmin@103.147.123.149 -N &

# Khi dùng tunnel: giữ server trong config là https://127.0.0.1:6443
# Lens sẽ đi qua tunnel thay vì kết nối trực tiếp
```

---

## 4. Kết nối Database bằng TablePlus

> Tất cả databases chạy trong K8s cluster với ClusterIP (không expose ra ngoài).
> Cần dùng **SSH tunnel** hoặc **kubectl port-forward** để kết nối từ máy local.

### Vấn đề port conflict với DB local

Máy local đang chạy DB với các port sau (từ docker-compose dev):

| DB | Port local (dev docker-compose) | Port native |
|----|--------------------------------|-------------|
| MongoDB | 27018 | 27017 |
| MySQL | 3307 | 3306 |
| PostgreSQL | 5433 | 5432 |
| Redis | 6379 | 6379 |

→ **Không dùng cùng port** khi port-forward VPS, và **không cần port-forward** nếu dùng SSH tunnel trong TablePlus.

---

### 4.1 Phương pháp 1 (Khuyến nghị): SSH Tunnel trực tiếp trong TablePlus

**Không cần port-forward, không bị conflict port, không cần giữ terminal mở.**

TablePlus sẽ SSH vào VPS rồi từ VPS kết nối vào ClusterIP — vì ClusterIP chỉ accessible từ bên trong VPS.

**Cách cấu hình trong TablePlus:**

1. Tạo connection mới → chọn loại DB
2. Tab **General**: điền host là ClusterIP hoặc Kubernetes DNS, port là port trong cluster
3. Tab **SSH**: bật SSH tunnel và điền thông tin VPS

**Thông tin SSH (dùng chung cho tất cả connection VPS):**

| Field | Giá trị |
|-------|---------|
| SSH Host | `103.147.123.149` |
| SSH Port | `22` |
| SSH User | `vmadmin` |
| SSH Password / Key | SSH key trên máy local (thường `~/.ssh/id_rsa`) |

**Thông tin từng Database (điền ở tab General):**

#### MongoDB (Users, Gig, Chat, Order)

| Field | Giá trị |
|-------|---------|
| Connection Type | MongoDB |
| Host | `10.43.78.175` _(ClusterIP ithust-mongo)_ |
| Port | `27017` |
| Database | `ithust-users` / `ithust-gig` / `ithust-chat` / `ithust-order` |
| User | _(trống)_ |
| Password | _(trống)_ |

#### MySQL (Auth Service — `ithust_auth`)

| Field | Giá trị |
|-------|---------|
| Connection Type | MySQL |
| Host | `10.43.138.196` _(ClusterIP ithust-mysql)_ |
| Port | `3307` |
| Database | `ithust_auth` |
| User | `ithust` |
| Password | _(lấy từ k8s secret `ithust-mysql-db`)_ |

#### PostgreSQL (Review Service — `ithust_reviews`)

| Field | Giá trị |
|-------|---------|
| Connection Type | PostgreSQL |
| Host | `10.43.79.54` _(ClusterIP ithust-postgres)_ |
| Port | `5432` |
| Database | `ithust_reviews` |
| User | `ithust` |
| Password | _(lấy từ k8s secret `ithust-postgres-password`)_ |

#### Redis (Cache/Session)

| Field | Giá trị |
|-------|---------|
| Connection Type | Redis |
| Host | `10.43.204.28` _(ClusterIP ithust-redis)_ |
| Port | `6379` |
| Password | _(lấy từ k8s secret `ithust-redis-host`)_ |

> **Lưu ý ClusterIP**: ClusterIP có thể thay đổi nếu service bị xóa/tạo lại.
> Kiểm tra IP hiện tại: `kubectl get svc -n production`
> Có thể thay ClusterIP bằng hostname nếu VPS resolve được DNS K8s:
> ví dụ `ithust-mongo.production.svc.cluster.local`

---

### 4.2 Phương pháp 2: `kubectl port-forward` với port khác để tránh conflict

Dùng port cao (không trùng với bất kỳ DB local nào):

```bash
# MongoDB VPS → local port 37017 (tránh 27017 và 27018)
kubectl port-forward svc/ithust-mongo -n production 37017:27017

# MySQL VPS → local port 33070 (tránh 3306 và 3307)
kubectl port-forward svc/ithust-mysql -n production 33070:3307

# PostgreSQL VPS → local port 54320 (tránh 5432 và 5433)
kubectl port-forward svc/ithust-postgres -n production 54320:5432

# Redis VPS → local port 63790 (tránh 6379)
kubectl port-forward svc/ithust-redis -n production 63790:6379
```

Sau đó trong TablePlus kết nối `127.0.0.1` với port tương ứng ở trên (37017, 33070, 54320, 63790). **Không bật SSH tunnel** khi dùng phương pháp này.

---

## 5. Xem Kibana trên browser máy cá nhân

### 5.1 Truy cập trực tiếp qua domain (production)

Kibana đã được expose qua Traefik ingress với HTTPS:

```
https://kibana.ithust.store
```

Đăng nhập:
- **Username**: `elastic`
- **Password**: lấy từ secret `ithust-elasticsearch-password`
  ```bash
  kubectl get secret ithust-backend-secret -n production \
    -o jsonpath='{.data.ithust-elasticsearch-password}' | base64 --decode
  ```

---

### 5.2 Truy cập qua `kubectl port-forward` (khi không có domain / dev)

```bash
# Forward Kibana về máy local port 5601
kubectl port-forward svc/ithust-kibana -n production 5601:5601

# Mở browser:
# http://localhost:5601
```

---

### 5.3 Truy cập qua SSH tunnel

```bash
# Tunnel cổng 5601
ssh -L 5601:10.43.134.2:5601 vmadmin@103.147.123.149 -N

# (10.43.134.2 là ClusterIP của ithust-kibana — xem kubectl get svc)
# Mở browser: http://localhost:5601
```

---

## 6. Xem Metricbeat & Heartbeat

### 6.1 Kiểm tra trạng thái pod

```bash
# Metricbeat chạy dạng DaemonSet
kubectl get pods -n production | grep metricbeat
kubectl logs -f metricbeat-<pod-id> -n production

# Heartbeat chạy dạng Deployment
kubectl get pods -n production | grep heartbeat
kubectl logs -f deployment/heartbeat -n production
```

---

### 6.2 Xem Metricbeat trong Kibana

Metricbeat thu thập metrics từ: Docker containers, system (CPU/RAM/disk/network), RabbitMQ, MongoDB, MySQL, PostgreSQL.

**Trong Kibana UI:**

1. Vào **Observability** → **Infrastructure** → xem metrics toàn bộ hệ thống
2. Hoặc vào **Analytics** → **Dashboards** → tìm **[Metricbeat System] Overview**
3. Dashboards có sẵn:
   - `[Metricbeat System] Overview ECS`
   - `[Metricbeat Docker] Overview ECS`
   - `[Metricbeat MongoDB] Overview ECS`
   - `[Metricbeat MySQL] Overview ECS`
   - `[Metricbeat PostgreSQL] Overview ECS`
   - `[Metricbeat RabbitMQ] Overview ECS`

**Tìm kiếm metrics theo CLI:**

```bash
# Kiểm tra Metricbeat đang index đúng không
kubectl exec -it metricbeat-<pod-id> -n production -- \
  metricbeat test output

# Xem cấu hình Metricbeat đang dùng
kubectl exec -it metricbeat-<pod-id> -n production -- \
  cat /usr/share/metricbeat/metricbeat.yml
```

---

### 6.3 Xem Heartbeat (Uptime Monitoring) trong Kibana

Heartbeat ping health endpoint của 8 services mỗi 5 giây.

**Endpoints được monitor:**

| Service | URL health check |
|---------|-----------------|
| Gateway | `http://103.147.123.149:4000/gateway-health` |
| Notification | `http://103.147.123.149:4001/notification-health` |
| Auth | `http://103.147.123.149:4002/auth-health` |
| Users | `http://103.147.123.149:4003/user-health` |
| Gig | `http://103.147.123.149:4004/gig-health` |
| Chat | `http://103.147.123.149:4005/chat-health` |
| Order | `http://103.147.123.149:4006/order-health` |
| Review | `http://103.147.123.149:4007/review-health` |

**Trong Kibana UI:**

1. Vào **Observability** → **Uptime** (hoặc **Synthetics**)
2. Xem trạng thái Up/Down của từng service
3. Xem history và thời gian response

---

## 7. Tra cứu Elasticsearch trên Kibana

### 7.1 Xem danh sách index

**Trong Kibana:**

1. Vào **Management** → **Stack Management** → **Index Management**
2. Hoặc dùng **Dev Tools** (Console):

```json
GET _cat/indices?v&s=index
GET _cat/indices?v&health=yellow,green
```

**Các index chính của ITHust:**

| Index pattern | Nội dung |
|---------------|---------|
| `logs-*` | Application logs từ tất cả services |
| `metricbeat-*` | System & service metrics |
| `heartbeat-*` | Uptime monitoring |
| `apm-*` | APM traces (khi ENABLE_APM=1) |
| `.kibana*` | Kibana internal config |

---

### 7.2 Tìm kiếm logs trong Discover

1. Vào **Analytics** → **Discover**
2. Chọn data view `logs-*` hoặc `*`
3. Dùng KQL (Kibana Query Language):

```kql
# Tìm log của auth service
service.name: "auth-service"

# Tìm lỗi trong tất cả service
level: "error" OR level: "ERROR"

# Tìm log theo user ID
userId: "abc123"

# Tìm log trong 1 giờ qua với lỗi
level: "error" AND @timestamp > "now-1h"

# Tìm HTTP request cụ thể
http.request.method: "POST" AND url.path: "/api/v1/auth/register"

# Tìm log của order service có lỗi
service.name: "order-service" AND level: "error"
```

---

### 7.3 Truy vấn Elasticsearch bằng Dev Tools

Vào **Management** → **Dev Tools** (Console):

```json
// Xem tất cả index
GET _cat/indices?v

// Đếm document trong index logs
GET logs-*/_count

// Tìm 10 log lỗi gần nhất
GET logs-*/_search
{
  "size": 10,
  "sort": [{ "@timestamp": "desc" }],
  "query": {
    "bool": {
      "must": [
        { "match": { "level": "error" } }
      ]
    }
  }
}

// Tìm log theo service và time range
GET logs-*/_search
{
  "size": 20,
  "sort": [{ "@timestamp": "desc" }],
  "query": {
    "bool": {
      "must": [
        { "match": { "service.name": "auth-service" } },
        {
          "range": {
            "@timestamp": {
              "gte": "now-24h",
              "lte": "now"
            }
          }
        }
      ]
    }
  }
}

// Đếm lỗi theo từng service (aggregation)
GET logs-*/_search
{
  "size": 0,
  "query": { "match": { "level": "error" } },
  "aggs": {
    "errors_by_service": {
      "terms": { "field": "service.name.keyword", "size": 20 }
    }
  }
}

// Xem metrics CPU từ metricbeat
GET metricbeat-*/_search
{
  "size": 5,
  "sort": [{ "@timestamp": "desc" }],
  "query": {
    "match": { "metricset.name": "cpu" }
  },
  "_source": ["@timestamp", "system.cpu.total.pct", "host.name"]
}

// Xem heartbeat uptime
GET heartbeat-*/_search
{
  "size": 10,
  "sort": [{ "@timestamp": "desc" }],
  "_source": ["@timestamp", "monitor.name", "monitor.status", "monitor.duration.us"]
}
```

---

### 7.4 Tạo Dashboard tùy chỉnh trong Kibana

1. Vào **Analytics** → **Dashboards** → **Create dashboard**
2. **Add panel** → chọn loại visualization:
   - **Line chart**: response time theo thời gian
   - **Pie chart**: phân bổ lỗi theo service
   - **Data table**: danh sách log lỗi gần nhất
   - **Metric**: tổng số lỗi trong 24h

**Ví dụ tạo panel đếm lỗi:**
- Chọn **Lens**
- Index: `logs-*`
- X-axis: `@timestamp` (interval: 1 hour)
- Y-axis: `Count` where `level: "error"`
- Break down: `service.name.keyword`

---

### 7.5 Tạo Alert khi có lỗi (Kibana Alerting)

1. Vào **Management** → **Stack Management** → **Rules**
2. **Create rule** → **Elasticsearch query**
3. Cấu hình:
   - Index: `logs-*`
   - Query: `{ "match": { "level": "error" } }`
   - Threshold: > 10 lần trong 5 phút
   - Action: gửi email / Slack / webhook

---

### 7.6 Xem APM Traces (khi ENABLE_APM=1)

1. Vào **Observability** → **APM**
2. Xem services, transactions, traces
3. Drill down vào từng request để xem thời gian xử lý

> **Lưu ý**: Hiện tại chỉ có `review-service` có `ENABLE_APM=1`.
> Các service khác có `ENABLE_APM=0`, cần đổi thành `1` và restart để kích hoạt APM.

---

## Tham khảo nhanh — Port Mapping

| Service | Kubernetes DNS | ClusterIP |
|---------|---------------|-----------|
| Elasticsearch | `ithust-elastic.production.svc.cluster.local:9200` | `10.43.98.81` |
| Kibana | `ithust-kibana.production.svc.cluster.local:5601` | `10.43.134.2` |
| MongoDB | `ithust-mongo.production.svc.cluster.local:27017` | `10.43.78.175` |
| MySQL | `ithust-mysql.production.svc.cluster.local:3307` | `10.43.138.196` |
| PostgreSQL | `ithust-postgres.production.svc.cluster.local:5432` | `10.43.79.54` |
| Redis | `ithust-redis.production.svc.cluster.local:6379` | `10.43.204.28` |
| RabbitMQ | `ithust-queue.production.svc.cluster.local:5672` | `10.43.134.198` |
| Gateway | `ithust-gateway.production.svc.cluster.local:4000` | `10.43.173.232` |
