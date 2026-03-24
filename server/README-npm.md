# GitHub Packages (`@19010853/ithust-shared`)

File `*/.npmrc` dùng `${NPM_TOKEN}` — **không** commit PAT vào git.

## Máy dev (PowerShell)

```powershell
$env:NPM_TOKEN = "ghp_..."   # PAT có quyền `read:packages`
cd server\8-review-service
npm install
```

## Jenkins

Tạo credential **Secret text**, id: `github-npm-token`, giá trị là PAT (cùng quyền `read:packages`).

Pipeline đã map: `NPM_TOKEN = credentials('github-npm-token')`.

## Docker build

`Dockerfile` nhận `ARG NPM_TOKEN`. Build thủ công:

```bash
docker build --build-arg NPM_TOKEN=$NPM_TOKEN -t ithust-review .
```
