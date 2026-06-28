# Hướng dẫn Chạy Benchmark: Elasticsearch vs MongoDB Search

> **Mục tiêu:** Đo lường và so sánh hiệu năng tìm kiếm giữa Elasticsearch và MongoDB (text index / regex) bằng k6 load testing. Kết quả dùng làm bằng chứng thực nghiệm cho đồ án.

---

## Tổng quan kiến trúc benchmark

```
k6 (load generator)
    │
    ├─► GET /benchmark/search/:from/:size/:type         → Elasticsearch
    └─► GET /benchmark/mongo/search/:from/:size/:type   → MongoDB (text | regex)
                │
                └─► gig-service (port 4004) — KHÔNG qua gateway, không cần auth
```

**3 phương án so sánh:**

| Phương án | Engine | Đặc điểm |
|-----------|--------|-----------|
| Elasticsearch | ES inverted index + BM25 scoring | Baseline chính |
| MongoDB text index | Inverted index qua `$text` + weights | Fair comparison |
| MongoDB regex | Full collection scan `$or + $regex` | Worst case, minh hoạ tại sao chọn ES |

---

## Yêu cầu cài đặt

### 1. k6

**Linux:**
```bash
sudo gpg --no-default-keyring \
  --keyring /usr/share/keyrings/k6-archive-keyring.gpg \
  --keyserver hkp://keyserver.ubuntu.com:80 \
  --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69

echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" \
  | sudo tee /etc/apt/sources.list.d/k6.list

sudo apt-get update && sudo apt-get install k6
```

**Windows (chọn 1 trong 2):**
```powershell
choco install k6   # nếu có Chocolatey
# hoặc
scoop install k6   # nếu có Scoop
```

Kiểm tra cài thành công:
```bash
k6 version
```

### 2. Node.js ≥ 18, MongoDB, Elasticsearch

Đã có sẵn trong docker-compose của dự án. Khởi động:
```bash
cd volumes
docker-compose up -d
```

---

## Các bước chạy benchmark

### Bước 1 — Seed dữ liệu tổng hợp (5000 gigs)

> **Lưu ý quan trọng:** Phải chạy từ đúng thư mục `server/5-gig-service/`, không phải từ root project.

```bash
# Đúng
cd server/5-gig-service
node scripts/seed-benchmark.mjs --count 5000 --clear
```

Cờ `--clear` xoá dữ liệu benchmark cũ (tag `_benchmark: true`) trước khi seed lại.

Kết quả thành công:
```
✅  MongoDB connected
✅  Elasticsearch connected
   [100%] Batch 25/25 — MongoDB: 5000, ES: 5000
✅  Seeding hoàn tất trong ~20s
```

### Bước 2 — Khởi động gig-service

```bash
cd server/5-gig-service
npm run dev
```

Service phải chạy trên port **4004**.

### Bước 3 — Smoke test (kiểm tra endpoint hoạt động)

```bash
# Elasticsearch endpoint
curl "http://localhost:4004/benchmark/search/0/10/forward?query=programming"

# MongoDB text index endpoint
curl "http://localhost:4004/benchmark/mongo/search/0/10/forward?query=programming&mode=text"

# MongoDB regex endpoint
curl "http://localhost:4004/benchmark/mongo/search/0/10/forward?query=programming&mode=regex"
```

Cả 3 phải trả về `{ total: N, gigs: [...] }` với `N > 0`.

### Bước 4 — Chạy full benchmark

**Linux / Git Bash:**
```bash
bash benchmark/run-benchmark.sh
```

**Windows (PowerShell):**
```powershell
.\benchmark\run-benchmark.ps1
```

Thời gian chạy: ~10 phút (3 scenarios × ~270s + 2 cooldown × 60s).

Kết quả lưu tại `benchmark/results/benchmark-report.md`.

---

## Lỗi thường gặp & cách fix

### Lỗi 1 — `Cannot find module 'scripts/seed-benchmark.mjs'`

```
Error: Cannot find module 'C:\Users\Admin\ithust-app\scripts\seed-benchmark.mjs'
```

**Nguyên nhân:** Chạy lệnh từ thư mục gốc của project thay vì từ `server/5-gig-service/`.

**Fix:**
```bash
# Sai — đứng ở root
node scripts/seed-benchmark.mjs

# Đúng — phải vào đúng thư mục trước
cd server/5-gig-service
node scripts/seed-benchmark.mjs --count 5000 --clear
```

---

### Lỗi 2 — `faker.internet.username is not a function`

```
TypeError: faker.internet.username is not a function
    at generateGig (seed-benchmark.mjs:175:30)
```

**Nguyên nhân:** Tên hàm thay đổi theo version của `@faker-js/faker`:

| Version | Tên hàm |
|---------|---------|
| v7.x | `faker.internet.userName()` |
| v8.x | `faker.internet.userName()` (camelCase N) |
| v9.x+ | `faker.internet.username()` (lowercase) |

Dự án đang dùng `^8.2.0` nên phải dùng `userName()` (chữ N hoa).

**Fix:** Trong `scripts/seed-benchmark.mjs` dòng 175:
```js
// Sai (chỉ dùng được ở v9+)
username: faker.internet.username().toLowerCase(),

// Đúng (tương thích v8.x)
username: faker.internet.userName().toLowerCase(),
```

---

### Lỗi 3 — `$'\r': command not found` khi chạy `.sh` trên Windows

```
benchmark/run-benchmark.sh: line 10: $'\r': command not found
: invalid optionnchmark.sh: line 11: set: -
```

**Nguyên nhân:** Git trên Windows tự động chuyển line endings từ `LF` (Unix) sang `CRLF` (Windows) khi clone. Bash không hiểu ký tự `\r` thừa đó.

**Fix — cách 1:** Dùng file PowerShell thay thế (khuyến nghị trên Windows):
```powershell
.\benchmark\run-benchmark.ps1
```

**Fix — cách 2:** Convert line endings trong Git Bash:
```bash
sed -i 's/\r//' benchmark/run-benchmark.sh
bash benchmark/run-benchmark.sh
```

**Ngăn lỗi trong tương lai** — thêm vào `.gitattributes` ở root project:
```
*.sh text eol=lf
```

---

## Cấu trúc file benchmark

```
server/5-gig-service/
├── scripts/
│   └── seed-benchmark.mjs        # Sinh 5000 gigs vào MongoDB + ES
├── benchmark/
│   ├── k6-es.js                  # k6 script — Elasticsearch
│   ├── k6-mongo.js               # k6 script — MongoDB (text/regex)
│   ├── run-benchmark.sh          # Chạy 3 scenarios tuần tự (Linux)
│   ├── run-benchmark.ps1         # Chạy 3 scenarios tuần tự (Windows)
│   ├── report.mjs                # Tổng hợp kết quả → Markdown table
│   └── results/                  # Output JSON + benchmark-report.md
└── src/
    ├── services/
    │   ├── search.service.ts         # Elasticsearch search (có sẵn)
    │   └── mongo-search.service.ts   # MongoDB search (mới thêm)
    ├── controllers/
    │   └── benchmark.ts              # Controller không dùng Redis cache
    └── routes/
        └── benchmark.ts              # Router không cần gateway auth
```

---

## Load test profile (k6 stages)

```
VUs
100 │                          ████
 50 │           ████████████████
 10 │  ████████
  1 │█
    └──────────────────────────────── Time
      30s  60s  120s  30s  30s
      warm ramp  sustained peak cool
```

**Queries ngẫu nhiên:** `programming`, `design`, `logo`, `video`, `marketing`, `writing`, `music`, `data`

---

## Kết quả kỳ vọng

| Phương án | p95 (dự kiến) | Ghi chú |
|-----------|---------------|---------|
| Elasticsearch | ~50–150ms | Ổn định khi VU tăng |
| MongoDB text | ~200–500ms | Tăng nhẹ theo VU |
| MongoDB regex | ~500–5000ms | Spike mạnh ở peak load (O(n) scan) |

Chênh lệch ES vs Mongo-regex thường **5–20x** dưới 100 VU với 5000 documents.

---

## Ghi chú cho đồ án

- Chạy benchmark **3 lần**, lấy giá trị **median** của p95 để báo cáo
- Ghi rõ trong đồ án: số lượng documents (5000), system specs (RAM/CPU), Node.js version
- File `benchmark/results/benchmark-report.md` sinh tự động sau mỗi lần chạy — paste thẳng vào đồ án
