# Tổng quan SePay eInvoice API

## Tổng quan SePay eInvoice API: tích hợp một lần để tạo, phát hành và quản lý hóa đơn điện tử tuân thủ Nghị định 123/2020/NĐ-CP tại Việt Nam.

---

**API Overview:**

API tạo và quản lý hóa đơn điện tử theo quy định của Tổng cục Thuế Việt Nam.

**Base URLs:**
- Production: `https://einvoice-api.sepay.vn`
- Sandbox: `https://einvoice-api-sandbox.sepay.vn`


---

## Giới thiệu

**SePay eInvoice API** là lớp trung gian giữa hệ thống của doanh nghiệp và cơ quan thuế (CQT), cho phép tạo và phát hành hóa đơn điện tử tuân thủ **Nghị định 123/2020/NĐ-CP** và Thông tư 78/2021/TT-BTC của Bộ Tài chính. Thay vì tích hợp riêng lẻ với từng nhà cung cấp hóa đơn điện tử, doanh nghiệp chỉ cần tích hợp **một lần duy nhất** với SePay để phát hành hóa đơn qua bất kỳ nhà cung cấp nào đã cấu hình.

API cung cấp đầy đủ vòng đời hóa đơn: từ tạo nháp, phát hành lên CQT, kiểm tra trạng thái theo thời gian thực, cho đến tải file PDF/XML và tra cứu hạn mức sử dụng — tất cả thông qua giao diện RESTful HTTP chuẩn.

<ButtonLink href="/vi/einvoice-demo" variant="primary">Xem hóa đơn demo</ButtonLink>

***

## Đối tượng sử dụng

eInvoice API phù hợp cho các tổ chức và cá nhân cần tự động hóa quy trình xuất hóa đơn điện tử:

<Features
  items={[
  { icon: "package", title: "Nền tảng SaaS & ERP", description: "Tích hợp phát hành hóa đơn điện tử trực tiếp vào quy trình bán hàng, kế toán hoặc quản lý đơn hàng của phần mềm." },
  { icon: "trending-up", title: "Doanh nghiệp xuất hóa đơn số lượng lớn", description: "Tự động hóa hoàn toàn việc tạo và phát hành hóa đơn theo lô, giảm thiểu thao tác thủ công và sai sót." },
  { icon: "sliders", title: "Phần mềm kế toán", description: "Kết nối trực tiếp với CQT để phát hành và đồng bộ trạng thái hóa đơn, hỗ trợ đối soát và lưu trữ theo quy định." },
  { icon: "store", title: "Sàn thương mại điện tử", description: "Tự động xuất hóa đơn cho từng đơn hàng hoàn thành, đáp ứng yêu cầu xuất hóa đơn theo giao dịch." },
  { icon: "code", title: "Developer xây dựng giải pháp", description: "Xây dựng tính năng hóa đơn điện tử cho khách hàng doanh nghiệp mà không cần đàm phán trực tiếp với từng nhà cung cấp." }
]}
/>

***

## Tính năng chính

<Features
  items={[
  { icon: "zap", title: "Xuất hóa đơn điện tử", description: "Tạo hóa đơn nháp hoặc phát hành trực tiếp qua POST v1/invoices/create, hỗ trợ nhiều mẫu và ký hiệu hóa đơn." },
  { icon: "shield", title: "Phát hành lên cơ quan thuế", description: "Gửi hóa đơn đến CQT qua nhà cung cấp hóa đơn điện tử đã cấu hình bằng POST v1/invoices/issue." },
  { icon: "refresh", title: "Theo dõi trạng thái bất đồng bộ", description: "Kiểm tra kết quả xử lý create/issue theo thời gian thực thông qua API /check/{tracking_code}." },
  { icon: "database", title: "Tra cứu và tải hóa đơn", description: "Lấy chi tiết hóa đơn đã phát hành kèm URL tải file PDF, XML theo chuẩn CQT." },
  { icon: "clock", title: "Kiểm tra hạn mức sử dụng", description: "Theo dõi số lượt phát hành còn lại qua GET v1/usage để lên kế hoạch sử dụng dịch vụ." },
  { icon: "sliders", title: "Quản lý tài khoản nhà cung cấp", description: "Xem danh sách và cấu hình chi tiết của các tài khoản nhà cung cấp hóa đơn điện tử đã đăng ký." }
]}
/>

***

## Luồng xử lý

<Mermaid title="Luồng xử lý eInvoice">
sequenceDiagram
  participant App as Merchant App
  participant API as SePay eInvoice API
  participant CQT as Cơ quan thuế (CQT)

  App->>API: POST v1/token
  API-->>App: access_token

  App->>API: GET v1/provider-accounts
  API-->>App: Danh sách tài khoản nhà cung cấp

  App->>API: GET v1/provider-accounts/{id}
  API-->>App: Chi tiết tài khoản (mẫu/ký hiệu HĐ)

  App->>API: POST v1/invoices/create
  API-->>App: tracking_code (tạo hóa đơn)

  App->>API: GET v1/invoices/create/check/{tracking_code}
  API-->>App: status, message (tạo hóa đơn)

  App->>API: POST v1/invoices/issue
  API-->>App: tracking_code (phát hành)

  App->>API: GET v1/invoices/issue/check/{tracking_code}
  API-->>App: status, message (phát hành)

  API->>CQT: Gửi hóa đơn lên cơ quan thuế
  CQT-->>API: Xác nhận tiếp nhận

  App->>API: GET v1/invoices/{reference_code}
  API-->>App: Chi tiết hóa đơn + URL file PDF/XML

  App->>API: GET v1/usage
  API-->>App: quota_remaining
</Mermaid>

Luồng xử lý eInvoice gồm các bước tuần tự từ xác thực, kiểm tra tài khoản đến tạo và phát hành hóa đơn:

1. **Lấy access token** — Gọi `POST v1/token` để lấy `access_token` dùng cho tất cả các API tiếp theo.

2. **Danh sách tài khoản nhà cung cấp** — Gọi `GET v1/provider-accounts` để xem các tài khoản hóa đơn điện tử khả dụng và trạng thái từng tài khoản.

3. **Chi tiết tài khoản** — Gọi `GET v1/provider-accounts/{id}` để lấy cấu hình chi tiết: mẫu hóa đơn, ký hiệu, trạng thái hoạt động.

4. **Tạo hóa đơn (Create)** — Gửi dữ liệu hóa đơn qua `POST v1/invoices/create`. API trả về `tracking_code` để theo dõi quá trình xử lý.

5. **Kiểm tra trạng thái tạo hóa đơn** — Gọi `GET v1/invoices/create/check/{tracking_code}` để xác nhận hóa đơn được tạo thành công hay thất bại.

6. **Phát hành hóa đơn (Issue)** — Gửi yêu cầu phát hành qua `POST v1/invoices/issue`. API trả về `tracking_code` riêng cho bước phát hành.

7. **Kiểm tra trạng thái phát hành** — Gọi `GET v1/invoices/issue/check/{tracking_code}` để xác nhận kết quả phát hành lên CQT.

8. **Lấy chi tiết hóa đơn** — Sau khi phát hành thành công, gọi `GET v1/invoices/{reference_code}` để nhận thông tin đầy đủ và URL tải file PDF, XML.

9. **Kiểm tra hạn ngạch** — Gọi `GET v1/usage` để theo dõi số lượt phát hành còn lại.

10. **Danh sách hóa đơn** — Gọi `GET v1/invoices` để lấy danh sách hóa đơn có phân trang phục vụ đối soát và quản lý.

<Callout type="info" title="Xử lý bất đồng bộ">
Các bước 
Create
 và 
Issue
 được xử lý bất đồng bộ. Sau khi gọi mỗi bước, bạn phải gọi API 
`/check`
 tương ứng để xác nhận trạng thái trước khi chuyển sang bước tiếp theo.
</Callout>

***

## Môi trường

| Môi trường     | Base URL                                |
| -------------- | --------------------------------------- |
| **Production** | `https://einvoice-api.sepay.vn`         |
| **Sandbox**    | `https://einvoice-api-sandbox.sepay.vn` |

Xác thực bằng Bearer token trong header: `Authorization: Bearer <ACCESS_TOKEN>`

<Callout type="info" title="Gợi ý">
Nếu bạn mới bắt đầu, hãy sử dụng môi trường 
Sandbox
 để thử nghiệm trước khi chuyển sang Production.
</Callout>

***

## Bước tiếp theo

Để bắt đầu tích hợp eInvoice API, thực hiện theo thứ tự sau:

1. **[Xác thực API hóa đơn điện tử (Bearer Token)](/vi/einvoice-api/v1/tao-token)** — Lấy Bearer token để xác thực các API tiếp theo
2. **[Danh sách nhà cung cấp hóa đơn điện tử](/vi/einvoice-api/v1/danh-sach-tai-khoan)** — Xem các tài khoản nhà cung cấp hóa đơn điện tử khả dụng
3. **[Xuất hóa đơn điện tử](/vi/einvoice-api/v1/xuat-hoa-don-dien-tu)** — Bắt đầu tạo hóa đơn đầu tiên
