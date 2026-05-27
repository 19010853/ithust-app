# Đối soát giao dịch

## Đối soát giao dịch giữa hệ thống của bạn và SePay qua API và Dashboard để không bỏ sót webhook nào, kể cả khi delivery bị lỗi hay trùng lặp.

## Tại sao cần đối soát?

Webhook gửi giao dịch theo thời gian thực, nhưng đôi lúc vẫn có trường hợp webhook không đến được server của bạn:

* Server tạm ngưng (deploy, restart, downtime)
* Lỗi mạng giữa SePay và server
* Webhook bị timeout vì server xử lý quá lâu
* Đã hết số lần retry (tối đa 7 lần trong 33 phút)

Để không bỏ sót giao dịch, bạn nên chạy đối soát định kỳ: gọi [SePay API](/vi/sepay-api/v2/giao-dich/danh-sach) lấy danh sách giao dịch, so khớp với database của bạn, rồi bổ sung những bản ghi còn thiếu.

## Các bước

### 1. Lấy danh sách giao dịch từ SePay

Gọi API lấy giao dịch trong khoảng thời gian cần đối soát:

<Endpoint method="GET" path="https://userapi.sepay.vn/v2/transactions" />

<ParamsTable
  rows={[
{ "name": "transaction_date_from", "type": "string", "description": "Ngày bắt đầu (bao gồm), định dạng <code>YYYY-MM-DD HH:mm:ss</code>" },
{ "name": "transaction_date_to", "type": "string", "description": "Ngày kết thúc (bao gồm), định dạng <code>YYYY-MM-DD HH:mm:ss</code>" },
{ "name": "bank_account_id", "type": "string", "description": "Lọc theo UUID tài khoản ngân hàng (không bắt buộc)" },
{ "name": "per_page", "type": "integer", "description": "Số giao dịch mỗi trang, tối đa 100 (mặc định 20)" },
{ "name": "page", "type": "integer", "description": "Số trang (mặc định 1)" },
{ "name": "since_id", "type": "string", "description": "UUID giao dịch cuối đã xử lý, trả các giao dịch mới hơn" }
]}
/>

Danh sách đầy đủ tham số: [SePay API - Danh sách giao dịch](/vi/sepay-api/v2/giao-dich/danh-sach).

Ví dụ: lấy giao dịch ngày 01/03/2026

```bash
curl -X GET "https://userapi.sepay.vn/v2/transactions?transaction_date_from=2026-03-01%2000:00:00&transaction_date_to=2026-03-01%2023:59:59&per_page=100" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_TOKEN"
```

### 2. So khớp với database

So sánh giao dịch từ SePay với database của bạn. Dùng trường **`id`** (UUID) hoặc **`reference_number`** để xác định giao dịch nào bị thiếu.

### 3. Bổ sung giao dịch thiếu

Giao dịch có trên SePay nhưng không có trong database thì lưu bổ sung và xử lý logic (cập nhật đơn hàng, ghi nhận thanh toán...).

## Code mẫu

<CodeTabs>
  <Code label="PHP">
    ```php
    <?php
    $token = getenv('SEPAY_API_TOKEN');
    $pdo   = new PDO('mysql:host=localhost;dbname=db_name;charset=utf8mb4', 'db_user', 'db_pass',
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
    
    $dateFrom = date('Y-m-d H:i:s', strtotime('-24 hours'));
    $dateTo   = date('Y-m-d H:i:s');
    
    // 1. Lấy giao dịch 24h gần nhất từ SePay
    $url = 'https://userapi.sepay.vn/v2/transactions?' . http_build_query([
        'transaction_date_from' => $dateFrom,
        'transaction_date_to'   => $dateTo,
        'per_page'              => 100,
    ]);
    
    $ctx = stream_context_create(['http' => [
        'header' => "Authorization: Bearer $token\r\nContent-Type: application/json",
    ]]);
    $result = json_decode(file_get_contents($url, false, $ctx), true);
    $transactions = $result['data'] ?? [];
    printf("SePay: %d giao dich\n", count($transactions));
    
    // 2. Đã lưu những giao dịch nào?
    $stmt = $pdo->prepare('SELECT reference_number FROM tb_transactions WHERE created_at >= ?');
    $stmt->execute([$dateFrom]);
    $existing = array_flip($stmt->fetchAll(PDO::FETCH_COLUMN));
    
    // 3. Bổ sung phần còn thiếu. UNIQUE(sepay_id) đảm bảo không trùng.
    $insert = $pdo->prepare('INSERT IGNORE INTO tb_transactions
        (sepay_id, gateway, transaction_date, account_number, sub_account,
         amount_in, amount_out, accumulated, code, transaction_content, reference_number)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
    
    $missing = 0;
    foreach ($transactions as $tx) {
        if (isset($existing[$tx['reference_number']])) continue;
    
        $insert->execute([
            $tx['id'], $tx['bank_brand_name'], $tx['transaction_date'],
            $tx['account_number'], $tx['va'] ?? '',
            $tx['amount_in'] ?? 0, $tx['amount_out'] ?? 0, $tx['accumulated'] ?? 0,
            $tx['code'], $tx['transaction_content'], $tx['reference_number'],
        ]);
        $missing++;
    }
    
    printf("Xong. Bo sung %d giao dich.\n", $missing);
    ```
  </Code>
  <Code label="Node.js">
    ```js
    import mysql from 'mysql2/promise';
    
    const TOKEN = process.env.SEPAY_API_TOKEN;
    const toMySQLDate = (d) => d.toISOString().slice(0, 19).replace('T', ' ');
    
    async function reconcile() {
      const db = await mysql.createConnection({
        host: 'localhost', user: 'db_user', password: 'db_pass', database: 'db_name',
      });
    
      const now      = new Date();
      const dateFrom = toMySQLDate(new Date(now - 24 * 3600 * 1000));
      const dateTo   = toMySQLDate(now);
    
      // 1. Lấy giao dịch 24h gần nhất từ SePay
      const params = new URLSearchParams({
        transaction_date_from: dateFrom,
        transaction_date_to:   dateTo,
        per_page: '100',
      });
      const res = await fetch(`https://userapi.sepay.vn/v2/transactions?${params}`, {
        headers: { Authorization: `Bearer ${TOKEN}` },
      });
      const { data: transactions = [] } = await res.json();
      console.log(`SePay: ${transactions.length} giao dich`);
    
      // 2. Đã lưu những giao dịch nào?
      const [rows] = await db.query(
        'SELECT reference_number FROM tb_transactions WHERE created_at >= ?', [dateFrom],
      );
      const existing = new Set(rows.map((r) => r.reference_number));
    
      // 3. Bổ sung phần còn thiếu. UNIQUE(sepay_id) đảm bảo không trùng.
      let missing = 0;
      for (const tx of transactions) {
        if (existing.has(tx.reference_number)) continue;
    
        await db.query(
          `INSERT IGNORE INTO tb_transactions
           (sepay_id, gateway, transaction_date, account_number, sub_account,
            amount_in, amount_out, accumulated, code, transaction_content, reference_number)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            tx.id, tx.bank_brand_name, tx.transaction_date,
            tx.account_number, tx.va ?? '',
            tx.amount_in ?? 0, tx.amount_out ?? 0, tx.accumulated ?? 0,
            tx.code, tx.transaction_content, tx.reference_number,
          ],
        );
        missing++;
      }
    
      console.log(`Xong. Bo sung ${missing} giao dich.`);
      await db.end();
    }
    
    reconcile().catch(console.error);
    ```
  </Code>
  <Code label="Python">
    ```python
    import os
    import httpx
    import mysql.connector
    from datetime import datetime, timedelta
    
    TOKEN = os.environ['SEPAY_API_TOKEN']
    
    def reconcile():
        now       = datetime.now()
        date_from = (now - timedelta(hours=24)).strftime('%Y-%m-%d %H:%M:%S')
        date_to   = now.strftime('%Y-%m-%d %H:%M:%S')
    
        # 1. Lấy giao dịch 24h gần nhất từ SePay
        res = httpx.get(
            'https://userapi.sepay.vn/v2/transactions',
            params={'transaction_date_from': date_from, 'transaction_date_to': date_to, 'per_page': 100},
            headers={'Authorization': f'Bearer {TOKEN}'},
        )
        transactions = res.json().get('data', [])
        print(f'SePay: {len(transactions)} giao dich')
    
        with mysql.connector.connect(
            host='localhost', user='db_user', password='db_pass', database='db_name'
        ) as db:
            cur = db.cursor(dictionary=True)
    
            # 2. Đã lưu những giao dịch nào?
            cur.execute(
                'SELECT reference_number FROM tb_transactions WHERE created_at >= %s',
                (date_from,),
            )
            existing = {row['reference_number'] for row in cur.fetchall()}
    
            # 3. Bổ sung phần còn thiếu. UNIQUE(sepay_id) đảm bảo không trùng.
            missing = 0
            for tx in transactions:
                if tx['reference_number'] in existing:
                    continue
                cur.execute(
                    '''INSERT IGNORE INTO tb_transactions
                        (sepay_id, gateway, transaction_date, account_number, sub_account,
                         amount_in, amount_out, accumulated, code, transaction_content, reference_number)
                       VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)''',
                    (
                        tx['id'], tx['bank_brand_name'], tx['transaction_date'],
                        tx['account_number'], tx.get('va', ''),
                        tx.get('amount_in', 0), tx.get('amount_out', 0), tx.get('accumulated', 0),
                        tx['code'], tx['transaction_content'], tx['reference_number'],
                    ),
                )
                missing += 1
    
            db.commit()
            print(f'Xong. Bo sung {missing} giao dich.')
    
    reconcile()
    ```
  </Code>
</CodeTabs>

<Callout type="tip" title="Mẹo">
Nên đặt cron job chạy đối soát tự động, ví dụ mỗi giờ:
```bash
0 * * * * node /path/to/reconcile.js >> /var/log/reconcile.log 2>&1
```
</Callout>

## Chiến lược đối soát

Chọn một trong hai cách tuỳ vào tần suất chạy đối soát:

<AccordionGroup>
  <Accordion title="Theo khoảng thời gian">
    Dùng `transaction_date_from` và `transaction_date_to` để lấy giao dịch trong một khoảng cố định. Phù hợp khi chạy định kỳ theo giờ hoặc theo ngày.
  </Accordion>

  <Accordion title="Theo `since_id`">
    Lưu lại UUID của giao dịch cuối cùng đã xử lý, rồi dùng `since_id` để chỉ lấy các giao dịch mới hơn. Phù hợp khi chạy đối soát liên tục.

    ```bash
    curl -X GET "https://userapi.sepay.vn/v2/transactions?since_id=a1b2c3d4-e5f6-7890-abcd-ef1234567890&per_page=100" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer YOUR_API_TOKEN"
    ```
  </Accordion>
</AccordionGroup>

<Callout type="warn" title="Lưu ý">
Rate limit (giới hạn tốc độ gọi):
 API chỉ cho phép tối đa 3 request/giây. Vượt quá sẽ trả HTTP 429.
Chống trùng:
 Luôn kiểm tra 
`id`
 (UUID) hoặc 
`reference_number`
 trước khi lưu.
Phân trang:
 Dùng 
`page`
 và 
`per_page`
 (tối đa 100). Khi dữ liệu lớn, chia nhỏ khoảng thời gian hoặc dùng 
`since_id`
.
Tài liệu API:
 Xem chi tiết tại 
SePay API - Danh sách giao dịch
.
</Callout>

## Tiếp theo

* [Tạo QR và trang thanh toán](./tao-qr-va-form-thanh-toan): code mẫu trang thanh toán đầy đủ
* [Sự cố](./giam-sat#su-co): xem giao dịch bị mất từ webhook lỗi và phát lại
* [Tích hợp webhook](./tich-hop-webhook#chong-trung-lap): chống trùng khi webhook và đối soát chạy song song
