# build-all.ps1
Write-Host "Bắt đầu build tuần tự các service..." -ForegroundColor Cyan

$services = @("gateway", "notifications", "auth", "users", "gig", "chat", "order", "review")

foreach ($service in $services) {
    Write-Host "============================" -ForegroundColor Yellow
    Write-Host "Đang build image cho: $service" -ForegroundColor Green
    Write-Host "============================" -ForegroundColor Yellow
    
    docker compose build $service
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "=> Lỗi khi build $service. Vui lòng kiểm tra lại!" -ForegroundColor Red
        exit 1
    }
}

Write-Host "Tất cả các service đã được build thành công! Khởi động các container..." -ForegroundColor Cyan
docker compose up -d

Write-Host "Hoàn tất." -ForegroundColor Green
