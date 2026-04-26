# Secrets (k3s)

## Apply đúng cách

Chỉ apply file **có giá trị base64 thật**, không apply cả thư mục nếu trong đó có file mẫu/placeholder.

```bash
kubectl apply --validate=false -f kubernetes/k3s/secrets/backend-secrets.yaml
```

File mẫu nằm ngoài thư mục này: `kubernetes/k3s/backend-secrets.example.yaml` (copy → `secrets/backend-secrets.yaml`).

## `default-secret-token.yaml`

- Secret loại `kubernetes.io/service-account-token` có field **`type` không đổi được** sau khi tạo.
- Nếu cluster đã có `default-secret` trong `kube-system` với type khác, `kubectl apply` sẽ lỗi **immutable**.
- **Không cần** apply file này trừ khi bạn biết rõ mục đích; thường để Kubernetes tự tạo token cho ServiceAccount.

## Lỗi thường gặp

| Lỗi | Nguyên nhân |
|-----|-------------|
| `illegal base64 data` | Đang apply manifest có placeholder `<base64>` hoặc không phải base64 hợp lệ. |
| `type: ... field is immutable` | Secret đã tồn tại; không patch được `type`. Xóa secret cũ (cẩn thận) hoặc bỏ apply file này. |
