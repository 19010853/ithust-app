# run-benchmark.ps1
# Chay toan bo benchmark tuan tu va sinh bao cao.
#
# Cach dung (tu thu muc 5-gig-service):
#   .\benchmark\run-benchmark.ps1 [BASE_URL]
#
# Vi du:
#   .\benchmark\run-benchmark.ps1 http://localhost:4004

param(
    [string]$BaseUrl = "http://localhost:4004"
)

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ResultsDir = Join-Path $ScriptDir "results"
New-Item -ItemType Directory -Force -Path $ResultsDir | Out-Null

Write-Host ""
Write-Host "============================================"
Write-Host "  IT HUST Benchmark: ES vs MongoDB Search"
Write-Host "  Target: $BaseUrl"
Write-Host "============================================"
Write-Host ""

# Smoke test
Write-Host ">> Smoke test endpoints..."
try {
    Invoke-WebRequest -Uri "$BaseUrl/benchmark/search/0/1/forward?query=programming" -UseBasicParsing -ErrorAction Stop | Out-Null
    Write-Host "   ES endpoint: OK"
} catch {
    Write-Host "   ES endpoint: FAILED -- khoi dong gig-service truoc" -ForegroundColor Red
    exit 1
}

try {
    Invoke-WebRequest -Uri "$BaseUrl/benchmark/mongo/search/0/1/forward?query=programming&mode=text" -UseBasicParsing -ErrorAction Stop | Out-Null
    Write-Host "   MongoDB endpoint: OK"
} catch {
    Write-Host "   MongoDB endpoint: FAILED" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Run 1: Elasticsearch
Write-Host ">> [1/3] Elasticsearch benchmark..."
$esOut = Join-Path $ResultsDir "es-results.json"
k6 run --env BASE_URL="$BaseUrl" --out "json=$esOut" "$ScriptDir\k6-es.js"

Write-Host ""
Write-Host ">> Cooldown 60s (de service on dinh)..."
Start-Sleep -Seconds 60

# Run 2: MongoDB text index
Write-Host ""
Write-Host ">> [2/3] MongoDB text-index benchmark..."
$mongoTextOut = Join-Path $ResultsDir "mongo-text-results.json"
k6 run --env BASE_URL="$BaseUrl" --env MONGO_MODE=text --out "json=$mongoTextOut" "$ScriptDir\k6-mongo.js"

Write-Host ""
Write-Host ">> Cooldown 60s..."
Start-Sleep -Seconds 60

# Run 3: MongoDB regex
Write-Host ""
Write-Host ">> [3/3] MongoDB regex benchmark..."
$mongoRegexOut = Join-Path $ResultsDir "mongo-regex-results.json"
k6 run --env BASE_URL="$BaseUrl" --env MONGO_MODE=regex --out "json=$mongoRegexOut" "$ScriptDir\k6-mongo.js"

# Sinh bao cao
Write-Host ""
Write-Host ">> Sinh bao cao so sanh..."
node "$ScriptDir\report.mjs"

Write-Host ""
Write-Host "============================================"
Write-Host "  Benchmark hoan tat!"
Write-Host "  Ket qua: $ResultsDir"
Write-Host "============================================"
Write-Host ""
