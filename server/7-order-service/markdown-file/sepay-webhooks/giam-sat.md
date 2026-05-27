# Cách giám sát webhook SePay

## Theo dõi webhook SePay qua lịch sử gửi, dashboard chỉ số, cảnh báo Telegram/Slack/Discord, quản lý sự cố và phát lại delivery thủ công khi cần.

Để theo dõi webhook, bạn có 3 công cụ. **Lịch sử gửi** dùng để xem từng lần gửi riêng lẻ. **Dashboard** xem chỉ số tổng hợp. **Cảnh báo + Sự cố** sẽ tự báo cho bạn khi có lỗi.

## Lịch sử gửi

Tab **Lịch sử gửi** hiển thị mọi lần gửi webhook: trạng thái, HTTP status, thời gian phản hồi, tên webhook, giao dịch liên quan. Lọc theo webhook, thời gian, trạng thái.

<Image src="/images/webhooks/logs-list.png" alt="Lịch sử gửi" caption="Danh sách lịch sử gửi webhook" />

### Xem chi tiết

Bấm vào dòng log để mở panel:

* **Tóm tắt**: HTTP status, thời gian phản hồi, nhãn lỗi. Webhook phát lại hiện thêm nguồn gốc.
* **Thông tin chung**: trạng thái kết nối, link đến giao dịch, HTTP method.
* **Tab Request**: URL, headers, body JSON (có highlight và nút copy).
* **Tab Response**: headers và body phản hồi từ server.
* **Copy cURL**: lấy lệnh cURL tương ứng, tiện debug trực tiếp từ terminal.

<Image src="/images/webhooks/log-detail-panel.png" alt="Chi tiết log" caption="Panel chi tiết một lần gửi webhook" />

### Nhãn lỗi thường gặp

| Lỗi                | Nguyên nhân                 | Cách sửa                           |
| ------------------ | --------------------------- | ---------------------------------- |
| DNS Error          | Không phân giải được domain | Kiểm tra URL, DNS                  |
| Connection Refused | Server không nhận kết nối   | Kiểm tra server, firewall, port    |
| Timeout            | Phản hồi quá chậm (>30s)    | Tối ưu endpoint, xử lý bất đồng bộ |
| SSL Error          | Chứng chỉ không hợp lệ      | Kiểm tra SSL cert                  |
| HTTP 401           | Sai xác thực                | Kiểm tra API Key / Secret Key      |
| HTTP 404           | Sai URL                     | Kiểm tra đường dẫn endpoint        |
| HTTP 500           | Lỗi server                  | Kiểm tra logs phía server          |

### Phát lại webhook

Gửi lại thủ công bất kỳ log nào, cả thất bại lẫn đã thành công.

**Đơn lẻ**: panel chi tiết → **Phát lại**. SePay gửi cùng payload đến endpoint hiện tại.

**Nhiều**: tick nhiều dòng → **Phát lại**. Tối đa 20 log/lần.

**Giới hạn**: 10 lần phát lại/phút mỗi công ty.

**Theo dõi**: webhook phát lại có nhãn "Phát lại từ #xxx" link về log gốc. Bản gốc không bị sửa.

<Callout type="warn" title="Endpoint phải idempotent">
Replay có thể gửi trùng với lần gốc. Đảm bảo endpoint 
chống trùng theo 
`id`
, nhất là khi replay log đã thành công.
</Callout>

<Image src="/images/webhooks/log-replay.png" alt="Phát lại webhook" caption="Nhãn phát lại trên log" />

## Dashboard

Tab **Tổng quan** hiển thị các chỉ số tổng hợp trong khoảng thời gian chọn được.

<Image src="/images/webhooks/dashboard-overview.png" alt="Dashboard tổng quan" caption="Dashboard phân tích hoạt động webhook" />

### Chỉ số

| Chỉ số              | Ý nghĩa                                    |
| ------------------- | ------------------------------------------ |
| Tỷ lệ thành công    | % webhook gửi thành công                   |
| Tổng gửi            | Tổng lượt gửi trong khoảng thời gian       |
| Thất bại            | Số lượt gửi thất bại                       |
| Timeout             | Số lượt endpoint không phản hồi kịp        |
| Phản hồi trung bình | Thời gian phản hồi trung bình (ms)         |
| P95 phản hồi        | 95% request được phản hồi trong khoảng này |

### Biểu đồ

* **Xu hướng gửi**: thành công và thất bại theo ngày.
* **Phân bố thời gian phản hồi**: endpoint nhanh hay chậm.
* **Phân loại lỗi**: tỷ lệ từng loại (DNS, timeout, 4xx, 5xx).
* **Webhook lỗi nhiều nhất**: danh sách ưu tiên xử lý.

### Lọc thời gian

Góc phải có bộ chọn: 7 ngày, 30 ngày (mặc định), 90 ngày, hoặc tùy chỉnh. Bấm ↻ để làm mới dữ liệu.

## Cảnh báo

Thay vì phải tự vào dashboard kiểm tra, bạn để SePay chủ động báo khi webhook lỗi liên tiếp. Cấu hình theo 2 bước: tạo kênh nhận thông báo, sau đó gắn kênh vào webhook.

### Tạo kênh cảnh báo

Tab **Kênh cảnh báo** → **Thêm kênh**.

<Image src="/images/webhooks/alert-channels-tab.png" alt="Tab kênh cảnh báo" caption="Danh sách kênh cảnh báo" />

Chọn platform bạn muốn nhận thông báo:

<AccordionGroup>
  <Accordion title="Telegram">
    <Steps>
      <Step title="Tạo bot">
        Mở [@BotFather](https://t.me/BotFather), gửi `/newbot`, đặt tên và lưu lại **Bot Token**.
      </Step>

      <Step title="Lấy Chat ID">
        Thêm bot vào nhóm hoặc chat riêng, rồi truy cập `https://api.telegram.org/bot{TOKEN}/getUpdates` để lấy **Chat ID**.
      </Step>

      <Step title="Điền vào SePay">
        Nhập Bot Token và Chat ID vào form tạo kênh.
      </Step>
    </Steps>
  </Accordion>

  <Accordion title="Slack">
    Tạo Incoming Webhook tại [Slack API](https://api.slack.com/messaging/webhooks), copy URL rồi dán vào form tạo kênh trên SePay.
  </Accordion>

  <Accordion title="Discord">
    Vào **Channel Settings → Integrations → Webhooks**, tạo webhook mới, copy URL rồi dán vào form tạo kênh trên SePay.
  </Accordion>
</AccordionGroup>

Tạo xong bấm **Kiểm tra** để thử gửi tin. Đảm bảo kênh nhận được trước khi gắn vào webhook.

<Image src="/images/webhooks/alert-channel-create.png" alt="Tạo kênh cảnh báo" caption="Form tạo kênh cảnh báo mới" />

### Gắn cảnh báo vào webhook

Khi tạo/sửa webhook, ở bước **Cảnh báo**:

1. Bật toggle cảnh báo
2. Đặt ngưỡng lỗi liên tiếp trước khi gửi (1–20, mặc định 3)
3. Chọn loại sự kiện cảnh báo
4. Tick kênh muốn nhận

<Callout type="info">
Kênh đang tạm ngưng sẽ hiện mờ và không chọn được.
</Callout>

### Hành vi cảnh báo

**Bộ đếm lỗi**: tăng khi lần gửi đầu hoặc retry tự động thất bại. Phát lại thủ công không tăng đếm. Khi đếm đủ ngưỡng đã đặt (mặc định 3 lần lỗi liên tiếp), SePay gửi cảnh báo qua các kênh đã chọn.

**Phục hồi tự động**: giao dịch mới hoặc retry thành công thì bộ đếm được đặt lại và SePay gửi thông báo phục hồi kèm tên webhook, URL, số lần lỗi, số giao dịch bị ảnh hưởng, thời gian lỗi. Telegram trả lời tin lỗi ban đầu.

**Phục hồi qua Phát lại thủ công**: đóng sự cố và bỏ luôn khoảng nghỉ giữa các cảnh báo (xem mục dưới). Không gửi thông báo phục hồi vì bạn đã biết endpoint OK. Nếu endpoint sập lại sau đó, cảnh báo mới gửi ngay.

**Khoảng nghỉ giữa các cảnh báo**: sau mỗi lần gửi cảnh báo, cùng một webhook sẽ không gửi thêm cảnh báo nào trong 60 phút, kể cả khi vẫn còn lỗi. Mục đích là tránh spam khi webhook lỗi liên tục. Khoảng nghỉ này hết khi webhook phục hồi.

### Nội dung thông báo

Mỗi thông báo gồm: tên webhook, URL, HTTP status lỗi, số lần lỗi liên tiếp, thời gian. Mỗi kênh hiển thị theo style mặc định của nó.

<Image src="/images/webhooks/alert-notification-sample.png" alt="Thông báo cảnh báo mẫu" caption="Thông báo cảnh báo webhook lỗi hiển thị trên Telegram" />

## Sự cố

Khi webhook lỗi liên tiếp, SePay gom các lần lỗi đó lại thành một **sự cố**. Mỗi sự cố ghi rõ thời gian, loại lỗi và những giao dịch bị ảnh hưởng. Webhook chạy lại bình thường thì sự cố tự đóng.

Yêu cầu: webhook phải bật cảnh báo (xem phần Cảnh báo phía trên).

### Vòng đời

**1. Mở**
Webhook lỗi lần đầu, SePay tạo sự cố ở trạng thái **Mở**. Mỗi lần lỗi tiếp theo cộng 1 vào bộ đếm cảnh báo (xem [Hành vi cảnh báo](#hanh-vi-canh-bao) cho chi tiết ngưỡng và khoảng nghỉ giữa các cảnh báo).

**2. Đóng**
Có 3 đường đóng sự cố:

* **Tự động**: webhook gửi thành công trở lại. Gửi thông báo phục hồi nếu trước đó đã gửi cảnh báo.
* **Thủ công**: bấm **Đánh dấu đã xử lý** sau khi đối soát xong. SePay ghi lại ai xử lý, không gửi thông báo.
* **Phát lại thành công**: bạn chủ động test thành công. Không gửi thông báo phục hồi.

Sự cố đã đóng có thể **Mở lại** nếu bấm nhầm hoặc phát hiện vấn đề chưa xong.

### Xem sự cố

Tab **Sự cố**. Mặc định lọc **Đang mở**.

<Image src="/images/webhooks/incidents-tab.png" alt="Tab Sự cố" caption="Danh sách sự cố với thẻ chỉ số và bộ lọc" />

Bốn chỉ số 30 ngày gần nhất:

| Chỉ số                 | Ý nghĩa                        |
| ---------------------- | ------------------------------ |
| Đang mở                | Chưa xử lý                     |
| Đã xử lý               | Đã đóng                        |
| Giao dịch bị ảnh hưởng | Tổng giao dịch trong các sự cố |
| Đã gửi lại             | Webhook đã phát lại thành công |

### Chi tiết

Bấm vào sự cố để mở panel: trạng thái, URL, thời gian lỗi, tổng tiền, loại lỗi (HTTP 500, Timeout, DNS...).

Bên dưới là danh sách giao dịch: mã, số tiền, trạng thái phát lại.

<Image src="/images/webhooks/incident-detail.png" alt="Chi tiết sự cố" caption="Panel chi tiết sự cố với danh sách giao dịch" />

### Gửi lại hàng loạt

1. Mở chi tiết sự cố
2. Chọn giao dịch (hoặc **Chọn tất cả**)
3. Bấm **Gửi lại**

Gửi thành công thì checkbox khóa lại.

<Callout type="tip">
Bấm 
Xem đầy đủ trong Lịch sử gửi
 để chuyển sang lịch sử, đã lọc sẵn theo webhook và khoảng thời gian sự cố.
</Callout>

## Quản lý kênh cảnh báo

Trên danh sách kênh, bạn có thể bật/tắt (có xác nhận), sửa thông tin, xóa, hoặc xem lịch sử gửi thông báo.

## Tiếp theo

* [Xử lý lỗi](./xu-ly-loi): lịch retry, chẩn đoán khi webhook không gửi
* [Tích hợp webhook](./tich-hop-webhook): chống trùng lặp khi retry hoặc phát lại
* [Bảo mật](./bao-mat): checklist bảo mật endpoint production
