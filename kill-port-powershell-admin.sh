$ports = @(3000, 4000, 4001, 4002, 4003, 4004, 4005, 4006, 4007)

foreach ($port in $ports) {
    $connections = netstat -ano | Select-String ":$port\s" | Where-Object { $_ -notmatch "TIME_WAIT" }
    $procIds = $connections | ForEach-Object {
        ($_ -split "\s+")[-1]
    } | Sort-Object -Unique | Where-Object { $_ -match "^\d+$" }

    if (-not $procIds) {
        Write-Host "[FREE] Port $port"
        continue
    }

    foreach ($p in $procIds) {
        try {
            $proc = Get-Process -Id $p -ErrorAction Stop
            Write-Host "[KILL] Port $port - PID $p ($($proc.ProcessName))"
            Stop-Process -Id $p -Force -ErrorAction Stop
        } catch {
            Write-Host "[SKIP] PID $p - $_"
        }
    }

    Start-Sleep -Milliseconds 500

    foreach ($p in $procIds) {
        if (Get-Process -Id $p -ErrorAction SilentlyContinue) {
            Write-Host "[FORCE] PID $p still alive, retrying..."
            taskkill /F /PID $p 2>$null
        }
    }
}

Write-Host "Done."
