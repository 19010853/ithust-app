# Bắt đầu nhanh với SePay Bank Hub

## Tích hợp SePay Bank Hub trong ba bước: lấy access token, tạo Hosted Link, nhúng iframe và xử lý webhook biến động số dư cho ứng dụng của bạn.

---

**API Overview:**

API tích hợp Bank Hub - Nền tảng kết nối tài khoản ngân hàng và nhận thông báo giao dịch realtime.

## Base URL
- **Sandbox**: `https://bankhub-api-sandbox.sepay.vn`
- **Production**: `https://bankhub-api.sepay.vn`

## Authentication
- Sử dụng **Basic Authentication** với `client_id:client_secret` để lấy access token
- Sử dụng **Bearer Token** cho các API khác


---

* Lấy `access_token` từ API `/v1/token`
* Sử dụng `access_token` để tạo link token
* Nhúng `hosted_link_url` vào iframe trên website

<Callout type="info" title="Trước khi bắt đầu">
Đảm bảo bạn đã có:
`client_id`
 và 
`client_secret`
 do SePay cấp
`company_xid`
 (UUID của công ty đã được tạo trong hệ thống Bank Hub) - 
API tạo công ty
Backend server để gọi API (không gọi từ client-side vì lý do bảo mật)
</Callout>

***

## Bước 1: Lấy Access Token

* Đầu tiên, bạn cần lấy `access_token` để xác thực cho các API tiếp theo. API này sử dụng **Basic Authentication** với `client_id` và `client_secret`.

<Callout type="warning" title="Bảo mật">
KHÔNG
 gọi API này từ client-side (browser, mobile app). API yêu cầu 
`client_secret`
 - thông tin này phải được bảo mật tuyệt đối trên server. Chỉ gọi API này từ backend server của bạn.
</Callout>

* API Endpoint

<Endpoint method="POST" path="https://bankhub-api-sandbox.sepay.vn/v1/token">
  ```http
  Authorization: Basic {base64(client_id:client_secret)}
  Content-Type: application/x-www-form-urlencoded
  ```
</Endpoint>

* Code mẫu

<!-- No code tabs available -->

* Response

<Response title="RESPONSE 201 - Thành công">
```json
{
  "code": 201,
  "access_token": "36483db493b10304eb3abc143b3593fa1473eb9b",
  "ttl": 60000
}
```
</Response>

<Callout type="info" title="Lưu trữ Token">
Lưu 
`access_token`
 vào cache (Redis, Memcached) hoặc session
Token có thời gian hiệu lực (
`ttl`
), nên implement cơ chế refresh tự động
Khi nhận lỗi 
`401 Unauthorized`
, tự động lấy token mới
</Callout>

***

## Bước 2: Tạo Link Token

Sau khi có `access_token`, sử dụng nó để tạo link token. Link token sẽ cung cấp `hosted_link_url` - đây là URL bạn sẽ nhúng vào iframe.

* API Endpoint

<Endpoint method="POST" path="https://bankhub-api-sandbox.sepay.vn/v1/link-token/create">
  ```http
  Authorization: Bearer YOUR_ACCESS_TOKEN
  Content-Type: application/json
  ```
</Endpoint>

* Code mẫu

<!-- No code tabs available -->

<Callout type="info" title="Note">
Code mẫu trên chỉ ví dụ cho trường hợp tạo link token cho luồng liên kết tài khoản, nếu bạn cần tạo luồng huỷ liên kết thì nên truyền 
`purpose`
 là 
`UNLINK_BANK_ACCOUNT`
 và truyền thêm 
`bank_account_xid`
</Callout>

* Response

<Response title="RESPONSE 201 - Tạo thành công">
```json
{
  "xid": "850e8400-e29b-41d4-a716-446655440000",
  "hosted_link_url": "https://bankhub.sepay.vn/link/850e8400-e29b-41d4-a716-446655440000",
  "link_token": "950e8400-e29b-41d4-a716-446655440000",
  "expires_at": "2024-01-17 10:30:00"
}
```
</Response>

* Chi tiết đầy đủ về API tạo link token: **[API Tạo Link Token](/vi/bankhub/api/link-token/tao-link-token)**

***

## Bước 3: Nhúng Iframe vào Website

Sau khi có `hosted_link_url` từ bước 2, bạn có thể nhúng nó vào website thông qua iframe.

<FrameworkTabs
  tabs={[
{
  label: "HTML",
  icon: "📄",
  lang: "html",
  code: "<!DOCTYPE html>\n<html>\n<head>\n  <title>Liên kết tài khoản ngân hàng</title>\n  <style>\n    .bankhub-container {\n      width: 100%;\n      max-width: 800px;\n      margin: 0 auto;\n      padding: 20px;\n    }\n\n    .bankhub-iframe {\n      width: 100%;\n      height: 600px;\n      border: 1px solid #e5e7eb;\n      border-radius: 8px;\n      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);\n    }\n  </style>\n</head>\n<body>\n  <div class=\"bankhub-container\">\n    <h1>Liên kết tài khoản ngân hàng</h1>\n    <iframe\n      id=\"bankhub-iframe\"\n      class=\"bankhub-iframe\"\n      src=\"\"\n      frameborder=\"0\"\n      allow=\"clipboard-write\"\n    ></iframe>\n  </div>\n\n  <script>\n    // Gọi API backend để lấy hosted_link_url\n    async function loadBankHubLink() {\n      try {\n        const response = await fetch('/api/bankhub/get-link-url', {\n          method: 'POST',\n          headers: {\n            'Content-Type': 'application/json',\n            'Authorization': `Bearer ${userToken}`\n          }\n        });\n\n        const data = await response.json();\n        document.getElementById('bankhub-iframe').src = data.hosted_link_url;\n      } catch (error) {\n        console.error('Error loading Bank Hub link:', error);\n        alert('Không thể tải giao diện liên kết ngân hàng. Vui lòng thử lại.');\n      }\n    }\n\n    loadBankHubLink();\n\n    // Lắng nghe sự kiện từ iframe (postMessage)\n    window.addEventListener('message', function(event) {\n      if (event.origin !== 'https://bankhub.sepay.vn') return;\n\n      const { event: eventType, metadata, timestamp } = event.data;\n\n      switch(eventType) {\n        case 'FINISHED_BANK_ACCOUNT_LINK':\n          console.log('Tài khoản đã được liên kết:', metadata);\n          alert(`Liên kết thành công: ${metadata.account_number}`);\n          window.location.href = '/dashboard';\n          break;\n        \n        case 'FINISHED_BANK_ACCOUNT_UNLINK':\n          console.log('Tài khoản đã được hủy liên kết');\n          alert('Hủy liên kết thành công!');\n          window.location.href = '/dashboard';\n          break;\n        \n        case 'BANKHUB_CLOSE_LINK':\n          console.log('Người dùng đóng flow liên kết');\n          break;\n        \n        case 'BANKHUB_TOKEN_EXPIRED':\n          console.warn('Token đã hết hạn');\n          alert('Phiên làm việc đã hết hạn. Vui lòng thử lại.');\n          break;\n        \n        case 'BANKHUB_SESSION_EXPIRED':\n          console.warn('Session đã hết hạn');\n          alert('Phiên làm việc đã hết hạn. Vui lòng thử lại.');\n          break;\n      }\n    });\n  </script>\n</body>\n</html>"
},
{
  label: "React",
  icon: "⚛️",
  lang: "jsx",
  code: "import React, { useEffect, useRef, useState } from 'react';\n\nfunction BankHubIframe() {\n  const iframeRef = useRef(null);\n  const [hostedLinkUrl, setHostedLinkUrl] = useState('');\n  const [loading, setLoading] = useState(true);\n  const [error, setError] = useState(null);\n\n  useEffect(() => {\n    async function fetchLinkUrl() {\n      try {\n        const response = await fetch('/api/bankhub/get-link-url', {\n          method: 'POST',\n          headers: {\n            'Content-Type': 'application/json',\n            'Authorization': `Bearer ${localStorage.getItem('userToken')}`\n          }\n        });\n\n        if (!response.ok) throw new Error('Failed to get link URL');\n\n        const data = await response.json();\n        setHostedLinkUrl(data.hosted_link_url);\n      } catch (err) {\n        setError(err.message);\n      } finally {\n        setLoading(false);\n      }\n    }\n\n    fetchLinkUrl();\n\n    const handleMessage = (event) => {\n      if (event.origin !== 'https://bankhub.sepay.vn') return;\n\n      const { event: eventType, metadata, timestamp } = event.data;\n\n      switch(eventType) {\n        case 'FINISHED_BANK_ACCOUNT_LINK':\n          console.log('Tài khoản đã được liên kết:', metadata);\n          window.location.href = '/dashboard';\n          break;\n        \n        case 'FINISHED_BANK_ACCOUNT_UNLINK':\n          console.log('Tài khoản đã được hủy liên kết');\n          window.location.href = '/dashboard';\n          break;\n        \n        case 'BANKHUB_CLOSE_LINK':\n          console.log('Người dùng đóng flow liên kết');\n          break;\n        \n        case 'BANKHUB_TOKEN_EXPIRED':\n        case 'BANKHUB_SESSION_EXPIRED':\n          console.warn('Phiên làm việc hết hạn');\n          setError('Phiên làm việc đã hết hạn. Vui lòng tải lại trang.');\n          break;\n      }\n    };\n\n    window.addEventListener('message', handleMessage);\n    return () => window.removeEventListener('message', handleMessage);\n  }, []);\n\n  if (loading) return <div>Đang tải...</div>;\n  if (error) return <div>Lỗi: {error}</div>;\n\n  return (\n    <div style={{ width: '100%', maxWidth: '800px', margin: '0 auto', padding: '20px' }}>\n      <h1>Liên kết tài khoản ngân hàng</h1>\n      <iframe\n        ref={iframeRef}\n        src={hostedLinkUrl}\n        style={{\n          width: '100%',\n          height: '600px',\n          border: '1px solid #e5e7eb',\n          borderRadius: '8px',\n          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'\n        }}\n        frameBorder=\"0\"\n        allow=\"clipboard-write\"\n      />\n    </div>\n  );\n}\n\nexport default BankHubIframe;"
},
{
  label: "Vue",
  icon: "💚",
  lang: "vue",
  code: "<template>\n  <div class=\"bankhub-container\">\n    <h1>Liên kết tài khoản ngân hàng</h1>\n\n    <div v-if=\"loading\">Đang tải...</div>\n    <div v-else-if=\"error\">Lỗi: {{ error }}</div>\n\n    <iframe\n      v-else\n      ref=\"iframe\"\n      :src=\"hostedLinkUrl\"\n      class=\"bankhub-iframe\"\n      frameborder=\"0\"\n      allow=\"clipboard-write\"\n    />\n  </div>\n</template>\n\n<script>\nexport default {\n  name: 'BankHubIframe',\n\n  data() {\n    return {\n      hostedLinkUrl: '',\n      loading: true,\n      error: null\n    };\n  },\n\n  async mounted() {\n    await this.fetchLinkUrl();\n    window.addEventListener('message', this.handleMessage);\n  },\n\n  beforeUnmount() {\n    window.removeEventListener('message', this.handleMessage);\n  },\n\n  methods: {\n    async fetchLinkUrl() {\n      try {\n        const response = await fetch('/api/bankhub/get-link-url', {\n          method: 'POST',\n          headers: {\n            'Content-Type': 'application/json',\n            'Authorization': `Bearer ${localStorage.getItem('userToken')}`\n          }\n        });\n\n        if (!response.ok) throw new Error('Failed to get link URL');\n\n        const data = await response.json();\n        this.hostedLinkUrl = data.hosted_link_url;\n      } catch (err) {\n        this.error = err.message;\n      } finally {\n        this.loading = false;\n      }\n    },\n\n    handleMessage(event) {\n      if (event.origin !== 'https://bankhub.sepay.vn') return;\n\n      const { event: eventType, metadata, timestamp } = event.data;\n\n      switch(eventType) {\n        case 'FINISHED_BANK_ACCOUNT_LINK':\n          console.log('Tài khoản đã được liên kết:', metadata);\n          this.$router.push('/dashboard');\n          break;\n        \n        case 'FINISHED_BANK_ACCOUNT_UNLINK':\n          console.log('Tài khoản đã được hủy liên kết');\n          this.$router.push('/dashboard');\n          break;\n        \n        case 'BANKHUB_CLOSE_LINK':\n          console.log('Người dùng đóng flow liên kết');\n          break;\n        \n        case 'BANKHUB_TOKEN_EXPIRED':\n        case 'BANKHUB_SESSION_EXPIRED':\n          console.warn('Phiên làm việc hết hạn');\n          this.error = 'Phiên làm việc đã hết hạn. Vui lòng tải lại trang.';\n          break;\n      }\n    }\n  }\n};\n</script>\n\n<style scoped>\n.bankhub-container {\n  width: 100%;\n  max-width: 800px;\n  margin: 0 auto;\n  padding: 20px;\n}\n\n.bankhub-iframe {\n  width: 100%;\n  height: 600px;\n  border: 1px solid #e5e7eb;\n  border-radius: 8px;\n  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);\n}\n</style>"
}
]}
/>

<Callout type="info" title="Thông tin">
Nếu bạn đã cung cấp 
`completion_redirect_uri`
 khi tạo link token, bạn sẽ được redirect về URL đã cung cấp
</Callout>

***

## PostMessage Events

Iframe sẽ gửi các sự kiện qua `window.postMessage` với format:

<Response title="event format">
```json
{
  "event": "FINISHED_BANK_ACCOUNT_LINK | FINISHED_BANK_ACCOUNT_UNLINK | BANKHUB_CLOSE_LINK | BANKHUB_TOKEN_EXPIRED | BANKHUB_SESSION_EXPIRED",
  "metadata": {
    "account_number": "string",
    "account_type": "individual | enterprise"
  },
  "timestamp": "string"
}
```
</Response>

**Các loại events:**

<EventList
  events={[
{ name: "FINISHED_BANK_ACCOUNT_LINK", description: "Tài khoản ngân hàng đã được liên kết thành công. Metadata chứa thông tin tài khoản." },
{ name: "FINISHED_BANK_ACCOUNT_UNLINK", description: "Tài khoản ngân hàng đã được hủy liên kết thành công." },
{ name: "BANKHUB_CLOSE_LINK", description: "Người dùng đóng/hủy bỏ flow liên kết." },
{ name: "BANKHUB_TOKEN_EXPIRED", description: "Link token đã hết hạn, cần tạo token mới." },
{ name: "BANKHUB_SESSION_EXPIRED", description: "Phiên làm việc đã hết hạn, cần khởi tạo lại." }
]}
/>

***

## Cấu hình nhận thông báo biến động số dư (IPN)

**[➤ Bạn có thể xem chi tiết tại đây](/vi/bankhub/thong-bao-bien-dong-so-du)**

***

## Bước tiếp theo

Sau khi hoàn thành các bước tích hợp cơ bản, bạn có thể:

1. **[Cấu hình nhận thông báo biến động số dư](/vi/bankhub/thong-bao-bien-dong-so-du)** - Thiết lập IPN webhook để nhận thông báo giao dịch realtime
2. **[Webhook Events](/vi/bankhub/webhook-event)** - Nhận thông báo các sự kiện liên kết/hủy liên kết tài khoản
3. **[SDK JavaScript](/vi/bankhub/sdk)** - Sử dụng SDK để kiểm soát vòng đời phiên tốt hơn
4. **[API Reference](/vi/bankhub/api/tong-quan-api)** - Xem đầy đủ các API có sẵn

<Callout type="info" title="Lưu ý">
Đảm bảo bạn đã test kỹ trong môi trường 
Sandbox
 với 
tài khoản test
 trước khi chuyển sang Production.
</Callout>
