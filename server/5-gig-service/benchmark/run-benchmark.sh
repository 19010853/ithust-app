#!/usr/bin/env bash
# run-benchmark.sh
# Chạy toàn bộ benchmark tuần tự và sinh báo cáo.
#
# Cách dùng (từ thư mục 5-gig-service):
#   bash benchmark/run-benchmark.sh [BASE_URL]
#
# Ví dụ:
#   bash benchmark/run-benchmark.sh http://localhost:4004

set -e

BASE_URL="${1:-http://localhost:4004}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RESULTS_DIR="$SCRIPT_DIR/results"
mkdir -p "$RESULTS_DIR"

echo ""
echo "============================================"
echo "  IT HUST Benchmark: ES vs MongoDB Search"
echo "  Target: $BASE_URL"
echo "============================================"
echo ""

# Smoke test trước khi chạy
echo ">> Smoke test endpoints..."
curl -sf "$BASE_URL/benchmark/search/0/1/forward?query=programming" -o /dev/null \
  && echo "   ES endpoint: OK" \
  || { echo "   ES endpoint: FAILED — khởi động gig-service trước"; exit 1; }

curl -sf "$BASE_URL/benchmark/mongo/search/0/1/forward?query=programming&mode=text" -o /dev/null \
  && echo "   MongoDB endpoint: OK" \
  || { echo "   MongoDB endpoint: FAILED"; exit 1; }
echo ""

# ── Run 1: Elasticsearch ─────────────────────────────────────────
echo ">> [1/3] Elasticsearch benchmark..."
k6 run \
  --env BASE_URL="$BASE_URL" \
  --out json="$RESULTS_DIR/es-results.json" \
  "$SCRIPT_DIR/k6-es.js"

echo ""
echo ">> Cooldown 60s (để service ổn định)..."
sleep 60

# ── Run 2: MongoDB text index ─────────────────────────────────────
echo ""
echo ">> [2/3] MongoDB text-index benchmark..."
k6 run \
  --env BASE_URL="$BASE_URL" \
  --env MONGO_MODE=text \
  --out json="$RESULTS_DIR/mongo-text-results.json" \
  "$SCRIPT_DIR/k6-mongo.js"

echo ""
echo ">> Cooldown 60s..."
sleep 60

# ── Run 3: MongoDB regex ──────────────────────────────────────────
echo ""
echo ">> [3/3] MongoDB regex benchmark..."
k6 run \
  --env BASE_URL="$BASE_URL" \
  --env MONGO_MODE=regex \
  --out json="$RESULTS_DIR/mongo-regex-results.json" \
  "$SCRIPT_DIR/k6-mongo.js"

# ── Sinh báo cáo ──────────────────────────────────────────────────
echo ""
echo ">> Sinh báo cáo so sánh..."
node "$SCRIPT_DIR/report.mjs"

echo ""
echo "============================================"
echo "  Benchmark hoàn tất!"
echo "  Kết quả: $RESULTS_DIR/"
echo "============================================"
echo ""
