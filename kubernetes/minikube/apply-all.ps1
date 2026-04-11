# Apply toàn bộ Minikube (namespace, secrets, infra, services)
# Chạy từ repo root: .\kubernetes\minikube\apply-all.ps1
# Hoặc từ thư mục kubernetes\minikube: .\apply-all.ps1

$ErrorActionPreference = "Stop"
$root = if (Test-Path ".\kubernetes\minikube\apply-all.ps1") { (Get-Location).Path } else { (Get-Location).Path }
$base = if (Test-Path "$root\kubernetes\minikube\apply-all.ps1") { "$root\kubernetes\minikube" } else { $root }

Write-Host "Base: $base" -ForegroundColor Cyan

# 1. Namespace
Write-Host "`n[1/16] Creating namespace production..." -ForegroundColor Yellow
# Tạo namespace theo kiểu idempotent: dùng --dry-run=client để tránh lỗi AlreadyExists
kubectl create namespace production --dry-run=client -o yaml | kubectl apply -f - | Out-Null

# 2. Secret (chỉ file thật; bỏ qua example)
$secretPath = "$base\secrets\backend-secrets.yaml"
if (Test-Path $secretPath) {
    Write-Host "`n[2/16] Applying secrets (backend-secrets.yaml)..." -ForegroundColor Yellow
    kubectl apply --validate=false -f $secretPath
} else {
    Write-Host "`n[2/16] Skipping secrets (backend-secrets.yaml not found)" -ForegroundColor Gray
}

# 3-9. Infra
$folders = @(
    "mongodb",
    "mysql",
    "postgresql",
    "rabbitmq",
    "redis",
    "elasticsearch",
    "kibana"
)
$i = 3
foreach ($f in $folders) {
    $path = "$base\$f"
    if (Test-Path $path) {
        Write-Host "`n[$i/16] Applying $f..." -ForegroundColor Yellow
        kubectl apply --validate=false -f $path
    }
    $i++
}

# 10-16. Services (gateway có cả ingress + service + gateway)
$services = @(
    "1-gateway-service",
    "2-notifications-service",
    "3-auth-service",
    "4-users-service",
    "5-gig-service",
    "6-chat-service",
    "7-order-service",
    "8-review-service"
)
foreach ($s in $services) {
    $path = "$base\$s"
    if (Test-Path $path) {
        Write-Host "`n[$i/16] Applying $s..." -ForegroundColor Yellow
        kubectl apply --validate=false -f $path
    }
    $i++
}

Write-Host "`nDone. Elasticsearch & Kibana are set to replicas=0." -ForegroundColor Green
Write-Host "To bring them back: edit elasticsearch.yaml & kibana.yaml and set replicas: 1, then re-run this script or apply those folders." -ForegroundColor Gray
