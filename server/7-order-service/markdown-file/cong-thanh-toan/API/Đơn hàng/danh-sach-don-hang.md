# API lấy danh sách đơn hàng

## Lấy danh sách đơn hàng từ Cổng thanh toán SePay qua API listOrders — hỗ trợ phân trang, lọc theo ngày và trạng thái cho mọi merchant.

---

**API Overview:**

API cổng thanh toán SePay hỗ trợ nhiều phương thức thanh toán bao gồm chuyển khoản ngân hàng qua QR code, NAPAS QR và thẻ quốc tế.

**Base URLs:**
- Production API: `https://pgapi.sepay.vn`
- Sandbox API: `https://pgapi-sandbox.sepay.vn`
- Production Checkout: `https://pay.sepay.vn`
- Sandbox Checkout: `https://pay-sandbox.sepay.vn`

**Xác thực:** Tất cả API sử dụng Basic Authentication với `merchant_id` và `secret_key`.


---

## API Endpoint

<Endpoint>
  <Method>GET</Method>

  <Path>https://pgapi.sepay.vn/v1/order</Path>

  <Description>
    Danh sách đơn hàng
  </Description>

  <Authentication>
    basicAuth
  </Authentication>
</Endpoint>

## API Request

<Params>
  <QueryParams>
    <Param name="per_page" type="integer" required="false">
      Số đơn hàng mỗi trang (mặc định 20)
    </Param>
    <Param name="page" type="integer" required="false">
      Trang hiện tại (mặc định 1)
    </Param>
    <Param name="q" type="string" required="false">
      Tìm kiếm theo từ khóa
    </Param>
    <Param name="order_status" type="enum: CAPTURED, CANCELLED, AUTHENTICATION_NOT_NEEDED" required="false">
      Lọc theo trạng thái đơn hàng:
- CAPTURED: Đã thanh toán
- CANCELLED: Đã hủy
- AUTHENTICATION_NOT_NEEDED: Đang đợi thanh toán

    </Param>
    <Param name="customer_id" type="string" required="false">
      Lọc theo ID khách hàng
    </Param>
    <Param name="created_at" type="string" required="false">
      Lọc theo ngày tạo (YYYY-MM-DD)
    </Param>
    <Param name="from_created_at" type="string" required="false">
      Ngày bắt đầu (YYYY-MM-DD)
    </Param>
    <Param name="end_created_at" type="string" required="false">
      Ngày kết thúc (YYYY-MM-DD)
    </Param>
    <Param name="sort" type="string" required="false">
      Sắp xếp (created_at:asc, created_at:desc)
    </Param>
  </QueryParams>

</Params>

## API Response

<Responses>
  <Response status="200">
    <Description>
      Danh sách đơn hàng
    </Description>

    <Example>
      {
        "data": [
          {
            "id": "9",
            "customer_id": "2427",
            "order_id": "SEPAY-68BA83CE637C1",
            "order_invoice_number": "DH1757053857",
            "order_status": "AUTHENTICATION_NOT_NEEDED",
            "order_amount": "300000.00",
            "order_currency": "VND",
            "order_description": "Đơn hàng #1757053857",
            "authentication_status": null,
            "created_at": "2025-09-05 13:31:42",
            "updated_at": "2025-09-05 13:31:42"
          }
        ],
        "meta": {
          "per_page": 20,
          "total": 1,
          "has_more": false,
          "current_page": 1,
          "page_count": 1
        }
      }
    </Example>
  </Response>

</Responses>

<ResponseDescriptionFields>
  <ResponseSchema status="200">
    <Fields>
      <Field name="data" type="array" required="false">
        <ArrayItems>
          <Fields>
            <Field name="id" type="string" required="false">
              ID nội bộ của đơn hàng
            </Field>
            <Field name="customer_id" type="string" required="false">
              ID khách hàng (có thể null)
            </Field>
            <Field name="order_id" type="string" required="false">
              Mã đơn hàng duy nhất
            </Field>
            <Field name="order_invoice_number" type="string" required="false">
              Mã hóa đơn
            </Field>
            <Field name="order_status" type="enum: CAPTURED, CANCELLED, AUTHENTICATION_NOT_NEEDED" required="false">
              Trạng thái đơn hàng:
- CAPTURED: Đã thanh toán
- CANCELLED: Đã hủy
- AUTHENTICATION_NOT_NEEDED: Đang đợi thanh toán

            </Field>
            <Field name="order_amount" type="string" required="false">
              Số tiền đơn hàng (VND)
            </Field>
            <Field name="order_currency" type="string" required="false">
              Mã tiền tệ
            </Field>
            <Field name="order_description" type="string" required="false">
              Mô tả đơn hàng
            </Field>
            <Field name="authentication_status" type="string" required="false">
              Trạng thái xác thực
            </Field>
            <Field name="created_at" type="string" required="false">
              Thời gian tạo (YYYY-MM-DD HH:mm:ss)
            </Field>
            <Field name="updated_at" type="string" required="false">
              Thời gian cập nhật cuối (YYYY-MM-DD HH:mm:ss)
            </Field>
          </Fields>
        </ArrayItems>
      </Field>
      <Field name="meta" type="object" required="false">
        <Fields>
          <Field name="per_page" type="integer" required="false">
            Số bản ghi mỗi trang
          </Field>
          <Field name="total" type="integer" required="false">
            Tổng số bản ghi
          </Field>
          <Field name="has_more" type="boolean" required="false">
            Còn dữ liệu ở trang tiếp theo hay không
          </Field>
          <Field name="current_page" type="integer" required="false">
            Trang hiện tại
          </Field>
          <Field name="page_count" type="integer" required="false">
            Tổng số trang
          </Field>
        </Fields>
      </Field>
    </Fields>
  </ResponseSchema>

</ResponseDescriptionFields>

## Code mẫu

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
      --url 'https://pgapi.sepay.vn/v1/order?per_page=50&page=1&q=INV_20231201&order_status=CAPTURED&customer_id=CUST_001&created_at=2023-12-01&from_created_at=2023-12-01&end_created_at=2023-12-31&sort=created_at%3Adesc' \
      --header 'Authorization: Basic REPLACE_BASIC_AUTH'
    ```
  </CodeSample>

  <CodeSample value="php_curl" lang="php">
    ```php
    <?php
    
    $curl = curl_init();
    
    curl_setopt_array($curl, [
      CURLOPT_URL => "https://pgapi.sepay.vn/v1/order?per_page=50&page=1&q=INV_20231201&order_status=CAPTURED&customer_id=CUST_001&created_at=2023-12-01&from_created_at=2023-12-01&end_created_at=2023-12-31&sort=created_at%3Adesc",
      CURLOPT_RETURNTRANSFER => true,
      CURLOPT_ENCODING => "",
      CURLOPT_MAXREDIRS => 10,
      CURLOPT_TIMEOUT => 30,
      CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
      CURLOPT_CUSTOMREQUEST => "GET",
      CURLOPT_HTTPHEADER => [
        "Authorization: Basic REPLACE_BASIC_AUTH"
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
    
    conn = http.client.HTTPSConnection("pgapi.sepay.vn")
    
    headers = { 'Authorization': "Basic REPLACE_BASIC_AUTH" }
    
    conn.request("GET", "/v1/order?per_page=50&page=1&q=INV_20231201&order_status=CAPTURED&customer_id=CUST_001&created_at=2023-12-01&from_created_at=2023-12-01&end_created_at=2023-12-31&sort=created_at%3Adesc", headers=headers)
    
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
      "hostname": "pgapi.sepay.vn",
      "port": null,
      "path": "/v1/order?per_page=50&page=1&q=INV_20231201&order_status=CAPTURED&customer_id=CUST_001&created_at=2023-12-01&from_created_at=2023-12-01&end_created_at=2023-12-31&sort=created_at%3Adesc",
      "headers": {
        "Authorization": "Basic REPLACE_BASIC_AUTH"
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
      .url("https://pgapi.sepay.vn/v1/order?per_page=50&page=1&q=INV_20231201&order_status=CAPTURED&customer_id=CUST_001&created_at=2023-12-01&from_created_at=2023-12-01&end_created_at=2023-12-31&sort=created_at%3Adesc")
      .get()
      .addHeader("Authorization", "Basic REPLACE_BASIC_AUTH")
      .build();
    
    Response response = client.newCall(request).execute();
    ```
  </CodeSample>

  <CodeSample value="ruby_native" lang="ruby">
    ```ruby
    require 'uri'
    require 'net/http'
    require 'openssl'
    
    url = URI("https://pgapi.sepay.vn/v1/order?per_page=50&page=1&q=INV_20231201&order_status=CAPTURED&customer_id=CUST_001&created_at=2023-12-01&from_created_at=2023-12-01&end_created_at=2023-12-31&sort=created_at%3Adesc")
    
    http = Net::HTTP.new(url.host, url.port)
    http.use_ssl = true
    http.verify_mode = OpenSSL::SSL::VERIFY_NONE
    
    request = Net::HTTP::Get.new(url)
    request["Authorization"] = 'Basic REPLACE_BASIC_AUTH'
    
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
    
    	url := "https://pgapi.sepay.vn/v1/order?per_page=50&page=1&q=INV_20231201&order_status=CAPTURED&customer_id=CUST_001&created_at=2023-12-01&from_created_at=2023-12-01&end_created_at=2023-12-31&sort=created_at%3Adesc"
    
    	req, _ := http.NewRequest("GET", url, nil)
    
    	req.Header.Add("Authorization", "Basic REPLACE_BASIC_AUTH")
    
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
        RequestUri = new Uri("https://pgapi.sepay.vn/v1/order?per_page=50&page=1&q=INV_20231201&order_status=CAPTURED&customer_id=CUST_001&created_at=2023-12-01&from_created_at=2023-12-01&end_created_at=2023-12-31&sort=created_at%3Adesc"),
        Headers =
        {
            { "Authorization", "Basic REPLACE_BASIC_AUTH" },
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
    
    let headers = ["Authorization": "Basic REPLACE_BASIC_AUTH"]
    
    let request = NSMutableURLRequest(url: NSURL(string: "https://pgapi.sepay.vn/v1/order?per_page=50&page=1&q=INV_20231201&order_status=CAPTURED&customer_id=CUST_001&created_at=2023-12-01&from_created_at=2023-12-01&end_created_at=2023-12-31&sort=created_at%3Adesc")! as URL,
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
      .url("https://pgapi.sepay.vn/v1/order?per_page=50&page=1&q=INV_20231201&order_status=CAPTURED&customer_id=CUST_001&created_at=2023-12-01&from_created_at=2023-12-01&end_created_at=2023-12-31&sort=created_at%3Adesc")
      .get()
      .addHeader("Authorization", "Basic REPLACE_BASIC_AUTH")
      .build()
    
    val response = client.newCall(request).execute()
    ```
  </CodeSample>

</CodeSamples>
