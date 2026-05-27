# API lấy danh sách giao dịch

## Truy vấn danh sách giao dịch của công ty đã xác thực qua SePay API v2. Hỗ trợ phân trang và lọc theo ngày, số tiền và tài khoản ngân hàng.

---

**API Overview:**

REST API chuẩn hóa cho SePay. Thay thế các endpoint legacy userapi/.

**Base URL:** `https://userapi.sepay.vn/v2`

**Rate Limits:** 3 requests/giây. Vượt quá trả HTTP 429.


---

## Danh sách giao dịch

<Endpoint>
  <Method>GET</Method>

  <Path>https://userapi.sepay.vn/v2/transactions</Path>

  <Description>
    Danh sách giao dịch
  </Description>

  <Authentication>
    bearerAuth
  </Authentication>
</Endpoint>

<Callout type="info" title="Thông tin">
Danh sách giao dịch của công ty đã xác thực. Mặc định 20 giao dịch mỗi trang, tối đa 100.
</Callout>

### Tham số

<Params>
  <QueryParams>
    <Param name="q" type="string" required="false">
      Tìm theo reference_number, transaction_content, code
    </Param>
    <Param name="bank_account_id" type="string" required="false">
      Lọc theo UUID tài khoản ngân hàng
    </Param>
    <Param name="va_id" type="string" required="false">
      Lọc theo UUID tài khoản ảo
    </Param>
    <Param name="bank_brand_name" type="string" required="false">
      Lọc theo ngân hàng (ví dụ: ACB, BIDV, VPB)
    </Param>
    <Param name="transaction_date_from" type="string" required="false">
      Ngày bắt đầu (bao gồm)
    </Param>
    <Param name="transaction_date_to" type="string" required="false">
      Ngày kết thúc (bao gồm)
    </Param>
    <Param name="amount_in_min" type="integer" required="false">
      Số tiền vào tối thiểu
    </Param>
    <Param name="amount_in_max" type="integer" required="false">
      Số tiền vào tối đa
    </Param>
    <Param name="amount_out_min" type="integer" required="false">
      Số tiền ra tối thiểu
    </Param>
    <Param name="amount_out_max" type="integer" required="false">
      Số tiền ra tối đa
    </Param>
    <Param name="reference_number" type="string" required="false">
      Lọc theo mã tham chiếu (khớp chính xác)
    </Param>
    <Param name="transaction_content" type="string" required="false">
      Tìm theo nội dung giao dịch
    </Param>
    <Param name="transfer_type" type="enum: in, out" required="false">
      Loại giao dịch: in hoặc out
    </Param>
    <Param name="webhook_success" type="enum: 0, 1" required="false">
      Trạng thái webhook: 0 hoặc 1
    </Param>
    <Param name="since_id" type="string" required="false">
      Lấy giao dịch mới từ lần gọi trước. Truyền UUID giao dịch cuối cùng
    </Param>
    <Param name="transaction_date_sort" type="enum: asc, desc" required="false">
      Sắp xếp theo ngày giao dịch: asc hoặc desc
    </Param>
    <Param name="amount_in_sort" type="enum: asc, desc" required="false">
      Sắp xếp theo số tiền vào: asc hoặc desc
    </Param>
    <Param name="amount_out_sort" type="enum: asc, desc" required="false">
      Sắp xếp theo số tiền ra: asc hoặc desc
    </Param>
    <Param name="page" type="integer" required="false">
      Số trang
    </Param>
    <Param name="per_page" type="integer" required="false">
      Số bản ghi mỗi trang (tối đa 100)
    </Param>
    <Param name="fields" type="string" required="false">
      Chọn trường trả về (danh sách phân cách bằng dấu phẩy)
    </Param>
    <Param name="timestamp_format" type="string" required="false">
      Truyền `iso8601` để chuyển tất cả trường datetime sang ISO 8601 với múi giờ Asia/Ho_Chi_Minh. Ví dụ: 2026-03-18T09:00:00+07:00
    </Param>
  </QueryParams>

</Params>

### Code mẫu

<CodeSamples>
  <CodeSamplesList>
    <CodeSamplesTrigger value="shell_curl">
      cURL
    </CodeSamplesTrigger>

    <CodeSamplesTrigger value="php_curl">
      PHP
    </CodeSamplesTrigger>

    <CodeSamplesTrigger value="python_python3">
      Python
    </CodeSamplesTrigger>

    <CodeSamplesTrigger value="node_native">
      NodeJS
    </CodeSamplesTrigger>

    <CodeSamplesTrigger value="java_okhttp">
      Java
    </CodeSamplesTrigger>

    <CodeSamplesTrigger value="ruby_native">
      Ruby
    </CodeSamplesTrigger>

    <CodeSamplesTrigger value="go_native">
      Go
    </CodeSamplesTrigger>

    <CodeSamplesTrigger value="csharp_httpclient">
      .NET
    </CodeSamplesTrigger>

    <CodeSamplesTrigger value="swift_nsurlsession">
      Swift
    </CodeSamplesTrigger>

    <CodeSamplesTrigger value="kotlin_okhttp">
      Kotlin
    </CodeSamplesTrigger>

  </CodeSamplesList>

  <CodeSample value="shell_curl" lang="bash">
    ```bash
    curl --request GET \
      --url 'https://userapi.sepay.vn/v2/transactions?q=SOME_STRING_VALUE&bank_account_id=f9e8d7c6-b5a4-3210-fedc-ba0987654321&va_id=a2b3c4d5-e6f7-8901-bcde-f12345678901&bank_brand_name=ACB&transaction_date_from=2026-01-01%2000%3A00%3A00&transaction_date_to=2026-03-31%2023%3A59%3A59&amount_in_min=500000&amount_in_max=10000000&amount_out_min=SOME_INTEGER_VALUE&amount_out_max=SOME_INTEGER_VALUE&reference_number=SOME_STRING_VALUE&transaction_content=SOME_STRING_VALUE&transfer_type=SOME_STRING_VALUE&webhook_success=SOME_INTEGER_VALUE&since_id=a1b2c3d4-e5f6-7890-abcd-ef1234567890&transaction_date_sort=SOME_STRING_VALUE&amount_in_sort=SOME_STRING_VALUE&amount_out_sort=SOME_STRING_VALUE&page=SOME_INTEGER_VALUE&per_page=SOME_INTEGER_VALUE&fields=SOME_STRING_VALUE&timestamp_format=SOME_STRING_VALUE' \
      --header 'Authorization: Bearer REPLACE_BEARER_TOKEN'
    ```
  </CodeSample>

  <CodeSample value="php_curl" lang="php">
    ```php
    <?php
    
    $curl = curl_init();
    
    curl_setopt_array($curl, [
      CURLOPT_URL => "https://userapi.sepay.vn/v2/transactions?q=SOME_STRING_VALUE&bank_account_id=f9e8d7c6-b5a4-3210-fedc-ba0987654321&va_id=a2b3c4d5-e6f7-8901-bcde-f12345678901&bank_brand_name=ACB&transaction_date_from=2026-01-01%2000%3A00%3A00&transaction_date_to=2026-03-31%2023%3A59%3A59&amount_in_min=500000&amount_in_max=10000000&amount_out_min=SOME_INTEGER_VALUE&amount_out_max=SOME_INTEGER_VALUE&reference_number=SOME_STRING_VALUE&transaction_content=SOME_STRING_VALUE&transfer_type=SOME_STRING_VALUE&webhook_success=SOME_INTEGER_VALUE&since_id=a1b2c3d4-e5f6-7890-abcd-ef1234567890&transaction_date_sort=SOME_STRING_VALUE&amount_in_sort=SOME_STRING_VALUE&amount_out_sort=SOME_STRING_VALUE&page=SOME_INTEGER_VALUE&per_page=SOME_INTEGER_VALUE&fields=SOME_STRING_VALUE&timestamp_format=SOME_STRING_VALUE",
      CURLOPT_RETURNTRANSFER => true,
      CURLOPT_ENCODING => "",
      CURLOPT_MAXREDIRS => 10,
      CURLOPT_TIMEOUT => 30,
      CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
      CURLOPT_CUSTOMREQUEST => "GET",
      CURLOPT_HTTPHEADER => [
        "Authorization: Bearer REPLACE_BEARER_TOKEN"
      ],
    ]);
    
    $response = curl_exec($curl);
    $err = curl_error($curl);
    
    curl_close($curl);
    
    if ($err) {
      echo "cURL Error #:" . $err;
    } else {
      echo $response;
    }
    ```
  </CodeSample>

  <CodeSample value="python_python3" lang="python">
    ```python
    import http.client
    
    conn = http.client.HTTPSConnection("userapi.sepay.vn")
    
    headers = { 'Authorization': "Bearer REPLACE_BEARER_TOKEN" }
    
    conn.request("GET", "/v2/transactions?q=SOME_STRING_VALUE&bank_account_id=f9e8d7c6-b5a4-3210-fedc-ba0987654321&va_id=a2b3c4d5-e6f7-8901-bcde-f12345678901&bank_brand_name=ACB&transaction_date_from=2026-01-01%2000%3A00%3A00&transaction_date_to=2026-03-31%2023%3A59%3A59&amount_in_min=500000&amount_in_max=10000000&amount_out_min=SOME_INTEGER_VALUE&amount_out_max=SOME_INTEGER_VALUE&reference_number=SOME_STRING_VALUE&transaction_content=SOME_STRING_VALUE&transfer_type=SOME_STRING_VALUE&webhook_success=SOME_INTEGER_VALUE&since_id=a1b2c3d4-e5f6-7890-abcd-ef1234567890&transaction_date_sort=SOME_STRING_VALUE&amount_in_sort=SOME_STRING_VALUE&amount_out_sort=SOME_STRING_VALUE&page=SOME_INTEGER_VALUE&per_page=SOME_INTEGER_VALUE&fields=SOME_STRING_VALUE&timestamp_format=SOME_STRING_VALUE", headers=headers)
    
    res = conn.getresponse()
    data = res.read()
    
    print(data.decode("utf-8"))
    ```
  </CodeSample>

  <CodeSample value="node_native" lang="javascript">
    ```javascript
    const http = require("https");
    
    const options = {
      "method": "GET",
      "hostname": "userapi.sepay.vn",
      "port": null,
      "path": "/v2/transactions?q=SOME_STRING_VALUE&bank_account_id=f9e8d7c6-b5a4-3210-fedc-ba0987654321&va_id=a2b3c4d5-e6f7-8901-bcde-f12345678901&bank_brand_name=ACB&transaction_date_from=2026-01-01%2000%3A00%3A00&transaction_date_to=2026-03-31%2023%3A59%3A59&amount_in_min=500000&amount_in_max=10000000&amount_out_min=SOME_INTEGER_VALUE&amount_out_max=SOME_INTEGER_VALUE&reference_number=SOME_STRING_VALUE&transaction_content=SOME_STRING_VALUE&transfer_type=SOME_STRING_VALUE&webhook_success=SOME_INTEGER_VALUE&since_id=a1b2c3d4-e5f6-7890-abcd-ef1234567890&transaction_date_sort=SOME_STRING_VALUE&amount_in_sort=SOME_STRING_VALUE&amount_out_sort=SOME_STRING_VALUE&page=SOME_INTEGER_VALUE&per_page=SOME_INTEGER_VALUE&fields=SOME_STRING_VALUE&timestamp_format=SOME_STRING_VALUE",
      "headers": {
        "Authorization": "Bearer REPLACE_BEARER_TOKEN"
      }
    };
    
    const req = http.request(options, function (res) {
      const chunks = [];
    
      res.on("data", function (chunk) {
        chunks.push(chunk);
      });
    
      res.on("end", function () {
        const body = Buffer.concat(chunks);
        console.log(body.toString());
      });
    });
    
    req.end();
    ```
  </CodeSample>

  <CodeSample value="java_okhttp" lang="java">
    ```java
    OkHttpClient client = new OkHttpClient();
    
    Request request = new Request.Builder()
      .url("https://userapi.sepay.vn/v2/transactions?q=SOME_STRING_VALUE&bank_account_id=f9e8d7c6-b5a4-3210-fedc-ba0987654321&va_id=a2b3c4d5-e6f7-8901-bcde-f12345678901&bank_brand_name=ACB&transaction_date_from=2026-01-01%2000%3A00%3A00&transaction_date_to=2026-03-31%2023%3A59%3A59&amount_in_min=500000&amount_in_max=10000000&amount_out_min=SOME_INTEGER_VALUE&amount_out_max=SOME_INTEGER_VALUE&reference_number=SOME_STRING_VALUE&transaction_content=SOME_STRING_VALUE&transfer_type=SOME_STRING_VALUE&webhook_success=SOME_INTEGER_VALUE&since_id=a1b2c3d4-e5f6-7890-abcd-ef1234567890&transaction_date_sort=SOME_STRING_VALUE&amount_in_sort=SOME_STRING_VALUE&amount_out_sort=SOME_STRING_VALUE&page=SOME_INTEGER_VALUE&per_page=SOME_INTEGER_VALUE&fields=SOME_STRING_VALUE&timestamp_format=SOME_STRING_VALUE")
      .get()
      .addHeader("Authorization", "Bearer REPLACE_BEARER_TOKEN")
      .build();
    
    Response response = client.newCall(request).execute();
    ```
  </CodeSample>

  <CodeSample value="ruby_native" lang="ruby">
    ```ruby
    require 'uri'
    require 'net/http'
    require 'openssl'
    
    url = URI("https://userapi.sepay.vn/v2/transactions?q=SOME_STRING_VALUE&bank_account_id=f9e8d7c6-b5a4-3210-fedc-ba0987654321&va_id=a2b3c4d5-e6f7-8901-bcde-f12345678901&bank_brand_name=ACB&transaction_date_from=2026-01-01%2000%3A00%3A00&transaction_date_to=2026-03-31%2023%3A59%3A59&amount_in_min=500000&amount_in_max=10000000&amount_out_min=SOME_INTEGER_VALUE&amount_out_max=SOME_INTEGER_VALUE&reference_number=SOME_STRING_VALUE&transaction_content=SOME_STRING_VALUE&transfer_type=SOME_STRING_VALUE&webhook_success=SOME_INTEGER_VALUE&since_id=a1b2c3d4-e5f6-7890-abcd-ef1234567890&transaction_date_sort=SOME_STRING_VALUE&amount_in_sort=SOME_STRING_VALUE&amount_out_sort=SOME_STRING_VALUE&page=SOME_INTEGER_VALUE&per_page=SOME_INTEGER_VALUE&fields=SOME_STRING_VALUE&timestamp_format=SOME_STRING_VALUE")
    
    http = Net::HTTP.new(url.host, url.port)
    http.use_ssl = true
    http.verify_mode = OpenSSL::SSL::VERIFY_NONE
    
    request = Net::HTTP::Get.new(url)
    request["Authorization"] = 'Bearer REPLACE_BEARER_TOKEN'
    
    response = http.request(request)
    puts response.read_body
    ```
  </CodeSample>

  <CodeSample value="go_native" lang="go">
    ```go
    package main
    
    import (
    	"fmt"
    	"net/http"
    	"io/ioutil"
    )
    
    func main() {
    
    	url := "https://userapi.sepay.vn/v2/transactions?q=SOME_STRING_VALUE&bank_account_id=f9e8d7c6-b5a4-3210-fedc-ba0987654321&va_id=a2b3c4d5-e6f7-8901-bcde-f12345678901&bank_brand_name=ACB&transaction_date_from=2026-01-01%2000%3A00%3A00&transaction_date_to=2026-03-31%2023%3A59%3A59&amount_in_min=500000&amount_in_max=10000000&amount_out_min=SOME_INTEGER_VALUE&amount_out_max=SOME_INTEGER_VALUE&reference_number=SOME_STRING_VALUE&transaction_content=SOME_STRING_VALUE&transfer_type=SOME_STRING_VALUE&webhook_success=SOME_INTEGER_VALUE&since_id=a1b2c3d4-e5f6-7890-abcd-ef1234567890&transaction_date_sort=SOME_STRING_VALUE&amount_in_sort=SOME_STRING_VALUE&amount_out_sort=SOME_STRING_VALUE&page=SOME_INTEGER_VALUE&per_page=SOME_INTEGER_VALUE&fields=SOME_STRING_VALUE&timestamp_format=SOME_STRING_VALUE"
    
    	req, _ := http.NewRequest("GET", url, nil)
    
    	req.Header.Add("Authorization", "Bearer REPLACE_BEARER_TOKEN")
    
    	res, _ := http.DefaultClient.Do(req)
    
    	defer res.Body.Close()
    	body, _ := ioutil.ReadAll(res.Body)
    
    	fmt.Println(res)
    	fmt.Println(string(body))
    
    }
    ```
  </CodeSample>

  <CodeSample value="csharp_httpclient" lang="csharp">
    ```csharp
    var client = new HttpClient();
    var request = new HttpRequestMessage
    {
        Method = HttpMethod.Get,
        RequestUri = new Uri("https://userapi.sepay.vn/v2/transactions?q=SOME_STRING_VALUE&bank_account_id=f9e8d7c6-b5a4-3210-fedc-ba0987654321&va_id=a2b3c4d5-e6f7-8901-bcde-f12345678901&bank_brand_name=ACB&transaction_date_from=2026-01-01%2000%3A00%3A00&transaction_date_to=2026-03-31%2023%3A59%3A59&amount_in_min=500000&amount_in_max=10000000&amount_out_min=SOME_INTEGER_VALUE&amount_out_max=SOME_INTEGER_VALUE&reference_number=SOME_STRING_VALUE&transaction_content=SOME_STRING_VALUE&transfer_type=SOME_STRING_VALUE&webhook_success=SOME_INTEGER_VALUE&since_id=a1b2c3d4-e5f6-7890-abcd-ef1234567890&transaction_date_sort=SOME_STRING_VALUE&amount_in_sort=SOME_STRING_VALUE&amount_out_sort=SOME_STRING_VALUE&page=SOME_INTEGER_VALUE&per_page=SOME_INTEGER_VALUE&fields=SOME_STRING_VALUE&timestamp_format=SOME_STRING_VALUE"),
        Headers =
        {
            { "Authorization", "Bearer REPLACE_BEARER_TOKEN" },
        },
    };
    using (var response = await client.SendAsync(request))
    {
        response.EnsureSuccessStatusCode();
        var body = await response.Content.ReadAsStringAsync();
        Console.WriteLine(body);
    }
    ```
  </CodeSample>

  <CodeSample value="swift_nsurlsession" lang="swift">
    ```swift
    import Foundation
    
    let headers = ["Authorization": "Bearer REPLACE_BEARER_TOKEN"]
    
    let request = NSMutableURLRequest(url: NSURL(string: "https://userapi.sepay.vn/v2/transactions?q=SOME_STRING_VALUE&bank_account_id=f9e8d7c6-b5a4-3210-fedc-ba0987654321&va_id=a2b3c4d5-e6f7-8901-bcde-f12345678901&bank_brand_name=ACB&transaction_date_from=2026-01-01%2000%3A00%3A00&transaction_date_to=2026-03-31%2023%3A59%3A59&amount_in_min=500000&amount_in_max=10000000&amount_out_min=SOME_INTEGER_VALUE&amount_out_max=SOME_INTEGER_VALUE&reference_number=SOME_STRING_VALUE&transaction_content=SOME_STRING_VALUE&transfer_type=SOME_STRING_VALUE&webhook_success=SOME_INTEGER_VALUE&since_id=a1b2c3d4-e5f6-7890-abcd-ef1234567890&transaction_date_sort=SOME_STRING_VALUE&amount_in_sort=SOME_STRING_VALUE&amount_out_sort=SOME_STRING_VALUE&page=SOME_INTEGER_VALUE&per_page=SOME_INTEGER_VALUE&fields=SOME_STRING_VALUE&timestamp_format=SOME_STRING_VALUE")! as URL,
                                            cachePolicy: .useProtocolCachePolicy,
                                        timeoutInterval: 10.0)
    request.httpMethod = "GET"
    request.allHTTPHeaderFields = headers
    
    let session = URLSession.shared
    let dataTask = session.dataTask(with: request as URLRequest, completionHandler: { (data, response, error) -> Void in
      if (error != nil) {
        print(error)
      } else {
        let httpResponse = response as? HTTPURLResponse
        print(httpResponse)
      }
    })
    
    dataTask.resume()
    ```
  </CodeSample>

  <CodeSample value="kotlin_okhttp" lang="kotlin">
    ```kotlin
    val client = OkHttpClient()
    
    val request = Request.Builder()
      .url("https://userapi.sepay.vn/v2/transactions?q=SOME_STRING_VALUE&bank_account_id=f9e8d7c6-b5a4-3210-fedc-ba0987654321&va_id=a2b3c4d5-e6f7-8901-bcde-f12345678901&bank_brand_name=ACB&transaction_date_from=2026-01-01%2000%3A00%3A00&transaction_date_to=2026-03-31%2023%3A59%3A59&amount_in_min=500000&amount_in_max=10000000&amount_out_min=SOME_INTEGER_VALUE&amount_out_max=SOME_INTEGER_VALUE&reference_number=SOME_STRING_VALUE&transaction_content=SOME_STRING_VALUE&transfer_type=SOME_STRING_VALUE&webhook_success=SOME_INTEGER_VALUE&since_id=a1b2c3d4-e5f6-7890-abcd-ef1234567890&transaction_date_sort=SOME_STRING_VALUE&amount_in_sort=SOME_STRING_VALUE&amount_out_sort=SOME_STRING_VALUE&page=SOME_INTEGER_VALUE&per_page=SOME_INTEGER_VALUE&fields=SOME_STRING_VALUE&timestamp_format=SOME_STRING_VALUE")
      .get()
      .addHeader("Authorization", "Bearer REPLACE_BEARER_TOKEN")
      .build()
    
    val response = client.newCall(request).execute()
    ```
  </CodeSample>

</CodeSamples>

### Response

<Node title="Response 200">
```js
{
"status": "success",
"data": [
  {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "transaction_date": "2026-02-18 09:35:12",
    "account_number": "0123456789",
    "va": "VA001",
    "transfer_type": "in",
    "amount_in": 500000,
    "amount_out": 0,
    "accumulated": 1500000,
    "transaction_content": "Thanh toan don hang #123",
    "reference_number": "FT26069ABC",
    "code": null,
    "bank_brand_name": "ACB",
    "bank_account_id": "f9e8d7c6-b5a4-3210-fedc-ba0987654321",
    "va_id": "a2b3c4d5-e6f7-8901-bcde-f12345678901",
    "webhook_success": 1
  }
],
"meta": {
  "pagination": {
    "total": 150,
    "per_page": 20,
    "current_page": 1,
    "last_page": 8,
    "has_more": true
  }
}
}
```
</Node>

<Responses>
  <Response status="200">
    <Description>
      Danh sách giao dịch
    </Description>

    <Example>
      {
        "status": "success",
        "data": [
          {
            "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
            "transaction_date": "2025-08-15 09:30:00",
            "account_number": "19028745631",
            "va": "VA001",
            "amount_in": 500000,
            "amount_out": 0,
            "accumulated": 1500000,
            "transaction_content": "Chuyen tien mua hang DH2025001",
            "reference_number": "FT26069ABC",
            "code": "ABC123",
            "bank_brand_name": "ACB",
            "bank_account_id": "f9e8d7c6-b5a4-3210-fedc-ba0987654321",
            "va_id": "a2b3c4d5-e6f7-8901-bcde-f12345678901",
            "webhook_success": 1,
            "transfer_type": "in"
          }
        ],
        "meta": {
          "pagination": {
            "total": 150,
            "per_page": 20,
            "current_page": 1,
            "last_page": 8,
            "has_more": true
          }
        }
      }
    </Example>
  </Response>

</Responses>

### Ghi chú

* `id` là UUID của giao dịch
* `bank_account_id` là UUID của tài khoản ngân hàng
* `va_id` là UUID của VA, `null` nếu giao dịch không qua VA
* `webhook_success`: `0` = chưa gửi/thất bại, `1` = thành công, `null` nếu không có cấu hình webhook
* Trường tiền tệ luôn là integer
* `q` tìm kiếm đồng thời trên reference\_number, transaction\_content, code
* `since_id` lấy dữ liệu mới: trả các giao dịch có ID lớn hơn giá trị chỉ định, sắp xếp tăng dần
* `per_page` tối đa 100

### Ví dụ sử dụng

Lấy giao dịch tiền vào từ 500,000 đến 1,000,000

<Node title="cURL">
```js
curl -X GET "https://userapi.sepay.vn/v2/transactions?amount_in_min=500000&amount_in_max=1000000" \\
-H "Content-Type: application/json" \\
-H "Authorization: Bearer YOUR_API_TOKEN"
```
</Node>

Polling giao dịch mới với since\_id

<Node title="cURL">
```js
curl -X GET "https://userapi.sepay.vn/v2/transactions?since_id=a1b2c3d4-e5f6-7890-abcd-ef1234567890" \\
-H "Content-Type: application/json" \\
-H "Authorization: Bearer YOUR_API_TOKEN"
```
</Node>

Tìm kiếm giao dịch theo nội dung

<Node title="cURL">
```js
curl -X GET "https://userapi.sepay.vn/v2/transactions?q=don+hang+123" \\
-H "Content-Type: application/json" \\
-H "Authorization: Bearer YOUR_API_TOKEN"
```
</Node>
