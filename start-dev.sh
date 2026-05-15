#!/bin/bash

# ============================================================
#  ITHust App - Dev Start Script
#  Start order: client → 6 → 7 → 8 → 5 → 4 → 3 → 2 → 1
# ============================================================

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

start_service() {
  local name=$1
  local dir=$2
  local cmd=${3:-"npm run dev"}

  echo -e "${CYAN}[START]${NC} ${YELLOW}${name}${NC} — ${dir}"

  cd "$ROOT_DIR/$dir" || { echo "❌ Directory not found: $dir"; return 1; }

  if [ ! -d "node_modules" ]; then
    echo -e "  📦 node_modules not found, running npm install..."
    npm install
  fi

  # Open a new terminal tab/window for each service
  if command -v gnome-terminal &> /dev/null; then
    gnome-terminal --tab --title="$name" -- bash -c "cd '$ROOT_DIR/$dir' && $cmd; exec bash"
  elif command -v xterm &> /dev/null; then
    xterm -title "$name" -e "cd '$ROOT_DIR/$dir' && $cmd; bash" &
  else
    # Fallback: run in background and log to file
    LOG_FILE="$ROOT_DIR/logs/${name}.log"
    mkdir -p "$ROOT_DIR/logs"
    eval "$cmd" > "$LOG_FILE" 2>&1 &
    echo -e "  📄 Logging to: logs/${name}.log (PID: $!)"
  fi

  cd "$ROOT_DIR"
  sleep 1
}

echo ""
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}  🚀 Starting ITHust App — Dev Mode        ${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""

# 1. Client (Vite)
start_service "client"                "client"                   "npm run dev"

# 2. Service 6 - Chat Service
start_service "6-chat-service"        "server/6-chat-service"    "npm run dev"

# 3. Service 7 - Order Service
start_service "7-order-service"       "server/7-order-service"   "npm run dev"

# 4. Service 8 - Review Service
start_service "8-review-service"      "server/8-review-service"  "npm run dev"

# 5. Service 5 - Gig Service
start_service "5-gig-service"         "server/5-gig-service"     "npm run dev"

# 6. Service 4 - Users Service
start_service "4-users-service"       "server/4-users-service"   "npm run dev"

# 7. Service 3 - Auth Service
start_service "3-auth-service"        "server/3-auth-service"    "npm run dev"

# 8. Service 2 - Notification Service
start_service "2-notification-service" "server/2-notification-service" "npm run dev"

# 9. Service 1 - Gateway Service
start_service "1-gateway-service"     "server/1-gateway-service" "npm run dev"

echo ""
echo -e "${GREEN}✅ All services have been started!${NC}"
echo -e "   Logs (if fallback mode): ${ROOT_DIR}/logs/"
echo ""
