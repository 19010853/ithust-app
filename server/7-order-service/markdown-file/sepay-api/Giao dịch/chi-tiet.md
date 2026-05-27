# API lấy chi tiết giao dịch

## Lấy thông tin chi tiết một giao dịch ngân hàng theo UUID qua SePay API v2. Trả về số tiền, nội dung, tài khoản ngân hàng và metadata giao dịch.

---

**API Overview:**

REST API chuẩn hóa cho SePay. Thay thế các endpoint legacy userapi/.

**Base URL:** `https://userapi.sepay.vn/v2`

**Rate Limits:** 3 requests/giây. Vượt quá trả HTTP 429.


---

## Chi tiết giao dịch

<Endpoint>
  <Method>GET</Method>

  <Path>https://userapi.sepay.vn/v2/transactions/{transaction_id}</Path>

  <Description>
    Chi tiết giao dịch
  </Description>

  <Authentication>
    bearerAuth
  </Authentication>
</Endpoint>

Lấy thông tin chi tiết một giao dịch theo UUID.

### Tham số

<Params>
  <PathParams>
    <Param name="transaction_id" type="string" required="true">
      UUID giao dịch
    </Param>
  </PathParams>

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
      --url https://userapi.sepay.vn/v2/transactions/a1b2c3d4-e5f6-7890-abcd-ef1234567890 \
      --header 'Authorization: Bearer REPLACE_BEARER_TOKEN'
    ```
  </CodeSample>

  <CodeSample value="php_curl" lang="php">
    ```php
    <?php
    
    $curl = curl_init();
    
    curl_setopt_array($curl, [
      CURLOPT_URL => "https://userapi.sepay.vn/v2/transactions/a1b2c3d4-e5f6-7890-abcd-ef1234567890",
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
    
    conn.request("GET", "/v2/transactions/a1b2c3d4-e5f6-7890-abcd-ef1234567890", headers=headers)
    
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
      "path": "/v2/transactions/a1b2c3d4-e5f6-7890-abcd-ef1234567890",
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
      .url("https://userapi.sepay.vn/v2/transactions/a1b2c3d4-e5f6-7890-abcd-ef1234567890")
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
    
    url = URI("https://userapi.sepay.vn/v2/transactions/a1b2c3d4-e5f6-7890-abcd-ef1234567890")
    
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
    
    	url := "https://userapi.sepay.vn/v2/transactions/a1b2c3d4-e5f6-7890-abcd-ef1234567890"
    
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
        RequestUri = new Uri("https://userapi.sepay.vn/v2/transactions/a1b2c3d4-e5f6-7890-abcd-ef1234567890"),
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
    
    let request = NSMutableURLRequest(url: NSURL(string: "https://userapi.sepay.vn/v2/transactions/a1b2c3d4-e5f6-7890-abcd-ef1234567890")! as URL,
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
      .url("https://userapi.sepay.vn/v2/transactions/a1b2c3d4-e5f6-7890-abcd-ef1234567890")
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
"data": {
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "transaction_date": "2026-01-22 16:45:30",
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
}
```
</Node>

<Responses>
  <Response status="200">
    <Description>
      Chi tiết giao dịch
    </Description>

    <Example>
      {
        "status": "success",
        "data": {
          "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
          "transaction_date": "2025-11-22 14:45:00",
          "account_number": "68501234789",
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
      }
    </Example>
  </Response>

</Responses>

### Lỗi

* **404**: Trả 404 nếu giao dịch không tìm thấy hoặc không thuộc công ty đã xác thực
