#!/usr/bin/env bash
# =============================================================================
# apply-all.sh — Deploy toàn bộ ithust-app lên k3s cluster
# =============================================================================
#
# Yêu cầu:
#   - k3s đã cài và chạy:  curl -sfL https://get.k3s.io | sh -
#   - kubectl trỏ đúng cluster (k3s dùng: export KUBECONFIG=/etc/rancher/k3s/k3s.yaml)
#   - File secrets/backend-secrets.yaml đã có base64 thật (copy từ backend-secrets.example.yaml)
#
# Chạy:
#   chmod +x apply-all.sh
#   ./apply-all.sh
#
# =============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# ── Màu sắc log ──────────────────────────────────────────────────────────────
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
RED='\033[0;31m'
NC='\033[0m'

info()    { echo -e "${CYAN}[INFO]${NC}  $*"; }
success() { echo -e "${GREEN}[OK]${NC}    $*"; }
warn()    { echo -e "${YELLOW}[WARN]${NC}  $*"; }
error()   { echo -e "${RED}[ERROR]${NC} $*" >&2; exit 1; }

# ── Kiểm tra tiên quyết ──────────────────────────────────────────────────────
command -v kubectl &>/dev/null || error "kubectl không tìm thấy. Hãy cài k3s trước."

if [ ! -f "secrets/backend-secrets.yaml" ]; then
  error "Không tìm thấy secrets/backend-secrets.yaml. Hãy copy từ backend-secrets.example.yaml và điền giá trị base64 thật."
fi

# ── Step 1: Tạo namespace ─────────────────────────────────────────────────────
info "Step 1/4 — Tạo namespace 'production'..."
kubectl apply -f - <<EOF
apiVersion: v1
kind: Namespace
metadata:
  name: production
EOF
success "Namespace ready."

# ── Step 2: Apply Secrets ─────────────────────────────────────────────────────
info "Step 2/4 — Apply secrets..."
kubectl apply --validate=false -f secrets/backend-secrets.yaml
success "Secrets applied."

# ── Step 3: Infrastructure ────────────────────────────────────────────────────
info "Step 3/4 — Apply infrastructure..."

apply_infra() {
  local dir="$1"
  local name="$2"
  info "  → $name"
  kubectl apply -f "$dir/"
}

apply_infra mongodb      "MongoDB"
apply_infra mysql        "MySQL"
apply_infra postgresql   "PostgreSQL"
apply_infra rabbitmq     "RabbitMQ"
apply_infra redis        "Redis"
apply_infra elasticsearch "Elasticsearch (self-hosted)"
apply_infra kibana       "Kibana"

success "Infrastructure applied."

# ── Step 4: Application Services ─────────────────────────────────────────────
info "Step 4/4 — Apply application services..."

apply_service() {
  local dir="$1"
  local name="$2"
  info "  → $name"
  kubectl apply -f "$dir/"
}

apply_service 1-gateway-service       "Gateway Service"
apply_service 2-notifications-service "Notifications Service"
apply_service 3-auth-service           "Auth Service"
apply_service 4-users-service         "Users Service"
apply_service 5-gig-service           "Gig Service"
apply_service 6-chat-service          "Chat Service"
apply_service 7-order-service         "Order Service"
apply_service 8-review-service        "Review Service"

success "Application services applied."

# ── Kết quả ───────────────────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}================================================================${NC}"
echo -e "${GREEN} Deploy hoàn tất! Kiểm tra trạng thái pods:${NC}"
echo -e "${GREEN}================================================================${NC}"
echo ""
echo "  kubectl get pods -n production"
echo "  kubectl get ingress -n production"
echo ""
warn "Lưu ý: Pods mất vài phút để khởi động. Elasticsearch cần ~2-3 phút."
warn "Nếu Kibana không kết nối được Elasticsearch, xem log:"
warn "  kubectl logs -n production deploy/ithust-elastic"
