# API lấy danh sách tài khoản ngân hàng

## Lấy danh sách tài khoản ngân hàng của công ty đã xác thực qua SePay API v2. Trả về thông tin tài khoản BIDV, Sacombank và các ngân hàng kết nối.

---

**API Overview:**

REST API chuẩn hóa cho SePay. Thay thế các endpoint legacy userapi/.

**Base URL:** `https://userapi.sepay.vn/v2`

**Rate Limits:** 3 requests/giây. Vượt quá trả HTTP 429.


---

## Danh sách tài khoản ngân hàng

<Endpoint>
  <Method>GET</Method>

  <Path>https://userapi.sepay.vn/v2/bank-accounts</Path>

  <Description>
    Danh sách tài khoản ngân hàng
  </Description>

  <Authentication>
    bearerAuth
  </Authentication>
</Endpoint>

<Callout type="info" title="Thông tin">
Danh sách tài khoản ngân hàng của công ty đã xác thực. Mặc định 20 tài khoản mỗi trang, tối đa 100.
</Callout>

### Tham số

<Params>
  <QueryParams>
    <Param name="bank_short_name" type="string" required="false">
      Lọc theo tên ngắn ngân hàng (ví dụ: ACB, BIDV, VPB)
    </Param>
    <Param name="last_transaction_from" type="string" required="false">
      Giao dịch cuối từ ngày
    </Param>
    <Param name="last_transaction_to" type="string" required="false">
      Giao dịch cuối đến ngày
    </Param>
    <Param name="accumulated_min" type="integer" required="false">
      Số dư tích lũy tối thiểu
    </Param>
    <Param name="accumulated_max" type="integer" required="false">
      Số dư tích lũy tối đa
    </Param>
    <Param name="q" type="string" required="false">
      Tìm theo tên, nhãn hoặc số tài khoản
    </Param>
    <Param name="active" type="string" required="false">
      Lọc theo trạng thái: 1 = hoạt động, 0 = ngưng
    </Param>
    <Param name="created_at_sort" type="enum: asc, desc" required="false">
      Sắp xếp theo ngày tạo: asc hoặc desc
    </Param>
    <Param name="last_transaction_sort" type="enum: asc, desc" required="false">
      Sắp xếp theo ngày giao dịch cuối: asc hoặc desc
    </Param>
    <Param name="accumulated_sort" type="enum: asc, desc" required="false">
      Sắp xếp theo số dư: asc hoặc desc
    </Param>
    <Param name="page" type="integer" required="false">
      Số trang
    </Param>
    <Param name="per_page" type="integer" required="false">
      Số bản ghi mỗi trang (tối đa 100)
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
      --url 'https://userapi.sepay.vn/v2/bank-accounts?bank_short_name=ACB&last_transaction_from=SOME_STRING_VALUE&last_transaction_to=SOME_STRING_VALUE&accumulated_min=SOME_INTEGER_VALUE&accumulated_max=SOME_INTEGER_VALUE&q=SOME_STRING_VALUE&active=SOME_STRING_VALUE&created_at_sort=SOME_STRING_VALUE&last_transaction_sort=SOME_STRING_VALUE&accumulated_sort=SOME_STRING_VALUE&page=SOME_INTEGER_VALUE&per_page=SOME_INTEGER_VALUE' \
      --header 'Authorization: Bearer REPLACE_BEARER_TOKEN'
    ```
  </CodeSample>

  <CodeSample value="php_curl" lang="php">
    ```php
    <?php
    
    $curl = curl_init();
    
    curl_setopt_array($curl, [
      CURLOPT_URL => "https://userapi.sepay.vn/v2/bank-accounts?bank_short_name=ACB&last_transaction_from=SOME_STRING_VALUE&last_transaction_to=SOME_STRING_VALUE&accumulated_min=SOME_INTEGER_VALUE&accumulated_max=SOME_INTEGER_VALUE&q=SOME_STRING_VALUE&active=SOME_STRING_VALUE&created_at_sort=SOME_STRING_VALUE&last_transaction_sort=SOME_STRING_VALUE&accumulated_sort=SOME_STRING_VALUE&page=SOME_INTEGER_VALUE&per_page=SOME_INTEGER_VALUE",
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
    
    conn.request("GET", "/v2/bank-accounts?bank_short_name=ACB&last_transaction_from=SOME_STRING_VALUE&last_transaction_to=SOME_STRING_VALUE&accumulated_min=SOME_INTEGER_VALUE&accumulated_max=SOME_INTEGER_VALUE&q=SOME_STRING_VALUE&active=SOME_STRING_VALUE&created_at_sort=SOME_STRING_VALUE&last_transaction_sort=SOME_STRING_VALUE&accumulated_sort=SOME_STRING_VALUE&page=SOME_INTEGER_VALUE&per_page=SOME_INTEGER_VALUE", headers=headers)
    
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
      "path": "/v2/bank-accounts?bank_short_name=ACB&last_transaction_from=SOME_STRING_VALUE&last_transaction_to=SOME_STRING_VALUE&accumulated_min=SOME_INTEGER_VALUE&accumulated_max=SOME_INTEGER_VALUE&q=SOME_STRING_VALUE&active=SOME_STRING_VALUE&created_at_sort=SOME_STRING_VALUE&last_transaction_sort=SOME_STRING_VALUE&accumulated_sort=SOME_STRING_VALUE&page=SOME_INTEGER_VALUE&per_page=SOME_INTEGER_VALUE",
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
      .url("https://userapi.sepay.vn/v2/bank-accounts?bank_short_name=ACB&last_transaction_from=SOME_STRING_VALUE&last_transaction_to=SOME_STRING_VALUE&accumulated_min=SOME_INTEGER_VALUE&accumulated_max=SOME_INTEGER_VALUE&q=SOME_STRING_VALUE&active=SOME_STRING_VALUE&created_at_sort=SOME_STRING_VALUE&last_transaction_sort=SOME_STRING_VALUE&accumulated_sort=SOME_STRING_VALUE&page=SOME_INTEGER_VALUE&per_page=SOME_INTEGER_VALUE")
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
    
    url = URI("https://userapi.sepay.vn/v2/bank-accounts?bank_short_name=ACB&last_transaction_from=SOME_STRING_VALUE&last_transaction_to=SOME_STRING_VALUE&accumulated_min=SOME_INTEGER_VALUE&accumulated_max=SOME_INTEGER_VALUE&q=SOME_STRING_VALUE&active=SOME_STRING_VALUE&created_at_sort=SOME_STRING_VALUE&last_transaction_sort=SOME_STRING_VALUE&accumulated_sort=SOME_STRING_VALUE&page=SOME_INTEGER_VALUE&per_page=SOME_INTEGER_VALUE")
    
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
    
    	url := "https://userapi.sepay.vn/v2/bank-accounts?bank_short_name=ACB&last_transaction_from=SOME_STRING_VALUE&last_transaction_to=SOME_STRING_VALUE&accumulated_min=SOME_INTEGER_VALUE&accumulated_max=SOME_INTEGER_VALUE&q=SOME_STRING_VALUE&active=SOME_STRING_VALUE&created_at_sort=SOME_STRING_VALUE&last_transaction_sort=SOME_STRING_VALUE&accumulated_sort=SOME_STRING_VALUE&page=SOME_INTEGER_VALUE&per_page=SOME_INTEGER_VALUE"
    
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
        RequestUri = new Uri("https://userapi.sepay.vn/v2/bank-accounts?bank_short_name=ACB&last_transaction_from=SOME_STRING_VALUE&last_transaction_to=SOME_STRING_VALUE&accumulated_min=SOME_INTEGER_VALUE&accumulated_max=SOME_INTEGER_VALUE&q=SOME_STRING_VALUE&active=SOME_STRING_VALUE&created_at_sort=SOME_STRING_VALUE&last_transaction_sort=SOME_STRING_VALUE&accumulated_sort=SOME_STRING_VALUE&page=SOME_INTEGER_VALUE&per_page=SOME_INTEGER_VALUE"),
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
    
    let request = NSMutableURLRequest(url: NSURL(string: "https://userapi.sepay.vn/v2/bank-accounts?bank_short_name=ACB&last_transaction_from=SOME_STRING_VALUE&last_transaction_to=SOME_STRING_VALUE&accumulated_min=SOME_INTEGER_VALUE&accumulated_max=SOME_INTEGER_VALUE&q=SOME_STRING_VALUE&active=SOME_STRING_VALUE&created_at_sort=SOME_STRING_VALUE&last_transaction_sort=SOME_STRING_VALUE&accumulated_sort=SOME_STRING_VALUE&page=SOME_INTEGER_VALUE&per_page=SOME_INTEGER_VALUE")! as URL,
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
      .url("https://userapi.sepay.vn/v2/bank-accounts?bank_short_name=ACB&last_transaction_from=SOME_STRING_VALUE&last_transaction_to=SOME_STRING_VALUE&accumulated_min=SOME_INTEGER_VALUE&accumulated_max=SOME_INTEGER_VALUE&q=SOME_STRING_VALUE&active=SOME_STRING_VALUE&created_at_sort=SOME_STRING_VALUE&last_transaction_sort=SOME_STRING_VALUE&accumulated_sort=SOME_STRING_VALUE&page=SOME_INTEGER_VALUE&per_page=SOME_INTEGER_VALUE")
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
    "id": "f9e8d7c6-b5a4-3210-fedc-ba0987654321",
    "account_holder_name": "CONG TY CP VINA TECH",
    "account_number": "19033256789",
    "accumulated": 23500000,
    "last_transaction": "2026-03-05 11:22:45",
    "label": "Tai khoan chinh",
    "account_type": "personal",
    "active": 1,
    "created_at": "2025-01-15 10:30:00",
    "bank_short_name": "ACB",
    "bank_full_name": "Ngan hang TMCP A Chau",
    "bank_bin": "970416",
    "bank_code": "ACB"
  }
],
"meta": {
  "pagination": {
    "total": 5,
    "per_page": 20,
    "current_page": 1,
    "last_page": 1,
    "has_more": false
  }
}
}
```
</Node>

<Responses>
  <Response status="200">
    <Description>
      Danh sách tài khoản ngân hàng
    </Description>

    <Example>
      {
        "status": "success",
        "data": [
          {
            "id": "f9e8d7c6-b5a4-3210-fedc-ba0987654321",
            "account_holder_name": "CONG TY CP TECH VINA",
            "account_number": "19028745631",
            "accumulated": 15000000,
            "last_transaction": "2025-08-15 09:30:00",
            "label": "TK giao dich chinh",
            "account_type": "personal",
            "active": 1,
            "created_at": "2025-01-15 10:30:00",
            "bank_short_name": "ACB",
            "bank_full_name": "Ngan hang TMCP A Chau",
            "bank_bin": "970416",
            "bank_code": "ACB"
          }
        ],
        "meta": {
          "pagination": {
            "total": 5,
            "per_page": 20,
            "current_page": 1,
            "last_page": 1,
            "has_more": false
          }
        }
      }
    </Example>
  </Response>

</Responses>

### Ghi chú

* `id` là UUID của tài khoản ngân hàng
* `accumulated` là integer (VND)
* `q` tìm kiếm đồng thời trên label, account\_holder\_name và account\_number

### Ví dụ sử dụng

Lấy tài khoản ngân hàng của BIDV

<Node title="cURL">
```js
curl -X GET "https://userapi.sepay.vn/v2/bank-accounts?bank_short_name=BIDV" \\
-H "Content-Type: application/json" \\
-H "Authorization: Bearer YOUR_API_TOKEN"
```
</Node>

Lọc tài khoản có số dư tích lũy từ 1,000,000 trở lên

<Node title="cURL">
```js
curl -X GET "https://userapi.sepay.vn/v2/bank-accounts?accumulated_min=1000000" \\
-H "Content-Type: application/json" \\
-H "Authorization: Bearer YOUR_API_TOKEN"
```
</Node>

Tìm kiếm tài khoản theo tên chủ tài khoản

<Node title="cURL">
```js
curl -X GET "https://userapi.sepay.vn/v2/bank-accounts?q=CONG+TY+ABC" \\
-H "Content-Type: application/json" \\
-H "Authorization: Bearer YOUR_API_TOKEN"
```
</Node>
