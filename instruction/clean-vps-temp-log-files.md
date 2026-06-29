# Dọn dẹp file temp và log rác trên VPS

## 1. Kiểm tra dung lượng trước khi dọn

```bash
# Xem tổng quan dung lượng disk
df -h

# Tìm thư mục lớn nhất (top 20)
du -h / --max-depth=3 2>/dev/null | sort -rh | head -20

# Tìm file lớn hơn 100MB
find / -type f -size +100M 2>/dev/null | sort -rh
```

---

## 2. Dọn APT cache (Ubuntu/Debian)

```bash
# Xóa package đã download nhưng không cần nữa
sudo apt-get clean

# Xóa package cũ, chỉ giữ version mới nhất
sudo apt-get autoclean

# Xóa dependency không còn dùng
sudo apt-get autoremove -y

# Gộp lại
sudo apt-get clean && sudo apt-get autoclean && sudo apt-get autoremove -y
```

---

## 3. Dọn systemd journal logs

```bash
# Xem dung lượng journal hiện tại
journalctl --disk-usage

# Chỉ giữ log 7 ngày gần nhất
sudo journalctl --vacuum-time=7d

# Chỉ giữ tối đa 500MB log
sudo journalctl --vacuum-size=500M

# Xóa hết log cũ hơn 2 ngày
sudo journalctl --vacuum-time=2d
```

---

## 4. Dọn /tmp và /var/tmp

```bash
# Xóa toàn bộ /tmp (an toàn khi không có process đang dùng)
sudo rm -rf /tmp/*

# Xóa file trong /var/tmp cũ hơn 30 ngày
sudo find /var/tmp -type f -atime +30 -delete

# Xóa thư mục rỗng trong /tmp
sudo find /tmp -type d -empty -delete
```

---

## 5. Dọn log ứng dụng trong /var/log

```bash
# Xem dung lượng thư mục log
du -sh /var/log/*

# Xóa file .gz (log đã nén cũ)
sudo find /var/log -name "*.gz" -delete

# Xóa file log cũ hơn 30 ngày
sudo find /var/log -type f -name "*.log" -mtime +30 -delete

# Xóa file log rotated (*.1, *.2, ...)
sudo find /var/log -type f -name "*.[0-9]" -delete
sudo find /var/log -type f -name "*.[0-9][0-9]" -delete

# Truncate (không xóa) file log đang dùng để tránh lỗi
sudo truncate -s 0 /var/log/syslog
sudo truncate -s 0 /var/log/auth.log
```

---

## 6. Dọn Docker (nếu dùng Docker)

```bash
# Xóa container đã stop
docker container prune -f

# Xóa image không dùng (dangling)
docker image prune -f

# Xóa tất cả image không có container nào đang dùng
docker image prune -a -f

# Xóa volume không dùng
docker volume prune -f

# Xóa network không dùng
docker network prune -f

# Xóa build cache
docker builder prune -f

# Dọn tất cả một lần (nguy hiểm - xóa mọi thứ không đang chạy)
docker system prune -a -f --volumes
```

---

## 7. Dọn Node.js / npm cache

```bash
# Xóa npm cache
npm cache clean --force

# Xóa node_modules trong project không dùng
find /home -type d -name "node_modules" -prune 2>/dev/null

# Xóa .npm cache của user
rm -rf ~/.npm

# Xóa cache của pnpm (nếu dùng)
pnpm store prune
```

---

## 8. Dọn snap packages (Ubuntu)

```bash
# Xem các snap version cũ
snap list --all

# Xóa tất cả snap version cũ (chỉ giữ version đang dùng)
snap list --all | awk '/disabled/{print $1, $3}' | while read snapname revision; do
  sudo snap remove "$snapname" --revision="$revision"
done
```

---

## 9. Dọn thumbnail và cache user

```bash
# Xóa thumbnail cache
rm -rf ~/.cache/thumbnails/*

# Xóa cache chung của user
rm -rf ~/.cache/*

# Xóa trash
rm -rf ~/.local/share/Trash/*
```

---

## 10. Tìm và xóa file trùng lặp

```bash
# Cài fdupes
sudo apt-get install fdupes -y

# Tìm file trùng trong /var/log
fdupes -r /var/log

# Tự động xóa file trùng (giữ 1 bản)
fdupes -r -d -N /var/log
```

---

## 11. Script dọn dẹp tổng hợp

Tạo file `/usr/local/bin/vps-cleanup.sh`:

```bash
#!/bin/bash
echo "=== Bắt đầu dọn dẹp VPS ==="

echo "[1/6] Dọn APT cache..."
apt-get clean -y && apt-get autoclean -y && apt-get autoremove -y

echo "[2/6] Dọn journal logs (giữ 7 ngày)..."
journalctl --vacuum-time=7d

echo "[3/6] Dọn /tmp..."
rm -rf /tmp/*

echo "[4/6] Xóa log nén cũ trong /var/log..."
find /var/log -name "*.gz" -delete
find /var/log -type f -name "*.[0-9]" -delete

echo "[5/6] Dọn Docker (nếu có)..."
if command -v docker &> /dev/null; then
  docker system prune -f
fi

echo "[6/6] Dọn npm cache (nếu có)..."
if command -v npm &> /dev/null; then
  npm cache clean --force
fi

echo "=== Hoàn tất. Dung lượng còn lại: ==="
df -h /
```

```bash
# Cấp quyền và chạy
sudo chmod +x /usr/local/bin/vps-cleanup.sh
sudo vps-cleanup.sh
```

---

## 12. Tự động dọn dẹp định kỳ (Cron)

```bash
# Mở crontab
sudo crontab -e

# Thêm dòng này để chạy mỗi Chủ Nhật lúc 3 giờ sáng
0 3 * * 0 /usr/local/bin/vps-cleanup.sh >> /var/log/vps-cleanup.log 2>&1

# Hoặc dùng logrotate để tự rotate log tự động
sudo nano /etc/logrotate.d/myapp
```

Ví dụ config logrotate cho app:

```
/var/log/myapp/*.log {
    daily
    missingok
    rotate 7
    compress
    delaycompress
    notifempty
    sharedscripts
}
```

---

## Lưu ý an toàn

| Lệnh | Mức độ an toàn | Ghi chú |
|------|---------------|---------|
| `apt-get clean` | ✅ An toàn | Chỉ xóa cache download |
| `journalctl --vacuum-time=7d` | ✅ An toàn | Giữ log 7 ngày |
| `rm -rf /tmp/*` | ⚠️ Cẩn thận | Kiểm tra không có socket/pipe đang dùng |
| `docker system prune -a` | ⚠️ Cẩn thận | Xóa cả image không đang chạy |
| `docker system prune --volumes` | ❌ Nguy hiểm | Xóa cả volume — mất data nếu không backup |
| `rm -rf /var/log/*` | ❌ Nguy hiểm | Không làm thẳng, dùng truncate thay thế |
