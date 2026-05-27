# API Void giao dịch thẻ

## Hủy (void) giao dịch thẻ qua API voidTransaction của Cổng thanh toán SePay — đảo giao dịch đã CAPTURED trước thời điểm quyết toán nhanh chóng.

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

## Điều kiện hủy giao dịch

<Callout type="info" title="Chỉ cho phép hủy giao dịch khi thỏa mãn các điều kiện sau:">
Chỉ cho hủy giao dịch khi thanh toán bằng thẻ (
`payment_method=CARD`
).
Chỉ cho hủy giao dịch khi trạng thái đơn hàng là 
`CAPTURED`
 (
`order_status=CAPTURED`
).
Chỉ cho hủy giao dịch khi chưa đến thời điểm quyết toán. Lịch quyết toán:
Trước 16:00 (4 giờ chiều): Tiền về ngày làm việc kế tiếp (T + 1).
Ví dụ: Giao dịch lúc 
15:30 Thứ 3 (T3)
 → Tiền về 
Thứ 4 (T4)
.
Sau 16:00 (4 giờ chiều): Tiền về sau 2 ngày làm việc (T + 2).
Ví dụ: Giao dịch lúc 
17:00 Thứ 3 (T3)
 → Tiền về 
Thứ 5 (T5)
.
Sau 16:00 Thứ 6 (T6): Tiền về Thứ 2 tuần kế tiếp (T2).
</Callout>

## API Endpoint

<Endpoint>
  <Method>POST</Method>

  <Path>https://pgapi.sepay.vn/v1/order/voidTransaction</Path>

  <Description>
    Hủy giao dịch
  </Description>

  <Authentication>
    basicAuth
  </Authentication>
</Endpoint>

## API Request

<Params>
  <RequestBody>
    <Fields>
      <Field name="order_invoice_number" type="string" required="true">
        Mã hóa đơn của giao dịch thanh toán cần hủy
      </Field>
    </Fields>

    <Example>
      {
        "order_invoice_number": "DH1756370479"
      }
    </Example>
  </RequestBody>
</Params>

## API Response

<Responses>
  <Response status="200">
    <Description>
      Hủy giao dịch thành công
    </Description>

    <Example>
      {
        "message": "Đã hủy giao dịch thành công"
      }
    </Example>
  </Response>

</Responses>

<ResponseDescriptionFields>
  <ResponseSchema status="200">
    <Fields>
      <Field name="message" type="string" required="false">
        Thông báo kết quả
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
    curl --request POST \
      --url https://pgapi.sepay.vn/v1/order/voidTransaction \
      --header 'Authorization: Basic REPLACE_BASIC_AUTH' \
      --header 'content-type: application/json' \
      --data '{"order_invoice_number":"DH1756370479"}'
    ```
  </CodeSample>

  <CodeSample value="php_curl" lang="php">
    ```php
    <?php
    
    $curl = curl_init();
    
    curl_setopt_array($curl, [
      CURLOPT_URL => "https://pgapi.sepay.vn/v1/order/voidTransaction",
      CURLOPT_RETURNTRANSFER => true,
      CURLOPT_ENCODING => "",
      CURLOPT_MAXREDIRS => 10,
      CURLOPT_TIMEOUT => 30,
      CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
      CURLOPT_CUSTOMREQUEST => "POST",
      CURLOPT_POSTFIELDS => "{\"order_invoice_number\":\"DH1756370479\"}",
      CURLOPT_HTTPHEADER => [
        "Authorization: Basic REPLACE_BASIC_AUTH",
        "content-type: application/json"
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
    
    payload = "{\"order_invoice_number\":\"DH1756370479\"}"
    
    headers = {
        'Authorization': "Basic REPLACE_BASIC_AUTH",
        'content-type': "application/json"
        }
    
    conn.request("POST", "/v1/order/voidTransaction", payload, headers)
    
    res = conn.getresponse()
    data = res.read()
    
    print(data.decode("utf-8"))
    ```
  </CodeSample>

  <CodeSample value="node_native" lang="javascript">
    ```javascript
    const http = require("https");
    
    const options = {
      "method": "POST",
      "hostname": "pgapi.sepay.vn",
      "port": null,
      "path": "/v1/order/voidTransaction",
      "headers": {
        "Authorization": "Basic REPLACE_BASIC_AUTH",
        "content-type": "application/json"
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
    
    req.write(JSON.stringify({order_invoice_number: 'DH1756370479'}));
    req.end();
    ```
  </CodeSample>

  <CodeSample value="java_okhttp" lang="java">
    ```java
    OkHttpClient client = new OkHttpClient();
    
    MediaType mediaType = MediaType.parse("application/json");
    RequestBody body = RequestBody.create(mediaType, "{\"order_invoice_number\":\"DH1756370479\"}");
    Request request = new Request.Builder()
      .url("https://pgapi.sepay.vn/v1/order/voidTransaction")
      .post(body)
      .addHeader("Authorization", "Basic REPLACE_BASIC_AUTH")
      .addHeader("content-type", "application/json")
      .build();
    
    Response response = client.newCall(request).execute();
    ```
  </CodeSample>

  <CodeSample value="ruby_native" lang="ruby">
    ```ruby
    require 'uri'
    require 'net/http'
    require 'openssl'
    
    url = URI("https://pgapi.sepay.vn/v1/order/voidTransaction")
    
    http = Net::HTTP.new(url.host, url.port)
    http.use_ssl = true
    http.verify_mode = OpenSSL::SSL::VERIFY_NONE
    
    request = Net::HTTP::Post.new(url)
    request["Authorization"] = 'Basic REPLACE_BASIC_AUTH'
    request["content-type"] = 'application/json'
    request.body = "{\"order_invoice_number\":\"DH1756370479\"}"
    
    response = http.request(request)
    puts response.read_body
    ```
  </CodeSample>

  <CodeSample value="go_native" lang="go">
    ```go
    package main
    
    import (
    	"fmt"
    	"strings"
    	"net/http"
    	"io/ioutil"
    )
    
    func main() {
    
    	url := "https://pgapi.sepay.vn/v1/order/voidTransaction"
    
    	payload := strings.NewReader("{\"order_invoice_number\":\"DH1756370479\"}")
    
    	req, _ := http.NewRequest("POST", url, payload)
    
    	req.Header.Add("Authorization", "Basic REPLACE_BASIC_AUTH")
    	req.Header.Add("content-type", "application/json")
    
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
        Method = HttpMethod.Post,
        RequestUri = new Uri("https://pgapi.sepay.vn/v1/order/voidTransaction"),
        Headers =
        {
            { "Authorization", "Basic REPLACE_BASIC_AUTH" },
        },
        Content = new StringContent("{\"order_invoice_number\":\"DH1756370479\"}")
        {
            Headers =
            {
                ContentType = new MediaTypeHeaderValue("application/json")
            }
        }
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
    
    let headers = [
      "Authorization": "Basic REPLACE_BASIC_AUTH",
      "content-type": "application/json"
    ]
    let parameters = ["order_invoice_number": "DH1756370479"] as [String : Any]
    
    let postData = JSONSerialization.data(withJSONObject: parameters, options: [])
    
    let request = NSMutableURLRequest(url: NSURL(string: "https://pgapi.sepay.vn/v1/order/voidTransaction")! as URL,
                                            cachePolicy: .useProtocolCachePolicy,
                                        timeoutInterval: 10.0)
    request.httpMethod = "POST"
    request.allHTTPHeaderFields = headers
    request.httpBody = postData as Data
    
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
    
    val mediaType = MediaType.parse("application/json")
    val body = RequestBody.create(mediaType, "{\"order_invoice_number\":\"DH1756370479\"}")
    val request = Request.Builder()
      .url("https://pgapi.sepay.vn/v1/order/voidTransaction")
      .post(body)
      .addHeader("Authorization", "Basic REPLACE_BASIC_AUTH")
      .addHeader("content-type", "application/json")
      .build()
    
    val response = client.newCall(request).execute()
    ```
  </CodeSample>

</CodeSamples>
