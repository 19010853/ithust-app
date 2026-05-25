#!/bin/bash

set -euo pipefail

PORTS=(3000 4000 4001 4002 4003 4004 4005 4006 4007)

find_pids_for_port() {
  local port=$1

  if command -v lsof >/dev/null 2>&1; then
    lsof -ti "tcp:${port}" 2>/dev/null || true
    return
  fi

  if command -v fuser >/dev/null 2>&1; then
    fuser -n tcp "${port}" 2>/dev/null || true
  fi
}

kill_port() {
  local port=$1
  local pids

  pids="$(find_pids_for_port "${port}" | tr '\n' ' ' | xargs || true)"
  if [[ -z "${pids}" ]]; then
    echo "[FREE] Port ${port}"
    return
  fi

  echo "[KILL] Port ${port}: ${pids}"
  kill -TERM ${pids} 2>/dev/null || true
  sleep 1

  for pid in ${pids}; do
    if kill -0 "${pid}" 2>/dev/null; then
      echo "[FORCE] PID ${pid} is still running on/near port ${port}"
      kill -KILL "${pid}" 2>/dev/null || true
    fi
  done
}

for port in "${PORTS[@]}"; do
  kill_port "${port}"
done

echo "Done."
