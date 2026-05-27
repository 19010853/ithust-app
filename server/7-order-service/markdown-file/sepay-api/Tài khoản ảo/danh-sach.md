# API lấy danh sách tài khoản ảo

## Lấy danh sách tài khoản ảo (VA) qua SePay API v2. Hỗ trợ phân trang và lọc để quản lý tất cả VA của tài khoản BIDV và Sacombank.

---

**API Overview:**

REST API chuẩn hóa cho SePay. Thay thế các endpoint legacy userapi/.

**Base URL:** `https://userapi.sepay.vn/v2`

**Rate Limits:** 3 requests/giây. Vượt quá trả HTTP 429.


---

## Danh sách tài khoản ảo

<Endpoint>
  <Method>GET</Method>

  <Path>https://userapi.sepay.vn/v2/bank-accounts/{ba_xid}/va</Path>

  <Description>
    Danh sách tài khoản ảo
  </Description>

  <Authentication>
    bearerAuth
  </Authentication>
</Endpoint>

### Tham số

<Params>
  <QueryParams>
    <Param name="q" type="string" required="false">
      Tìm theo số VA hoặc nhãn
    </Param>
    <Param name="active" type="string" required="false">
      Lọc theo trạng thái: 1 = hoạt động, 0 = ngưng
    </Param>
    <Param name="official" type="enum: 0, 1" required="false">
      `1` = VA chính thức, `0` = VA ảo
    </Param>
    <Param name="static" type="enum: 0, 1" required="false">
      `1` = VA tĩnh, `0` = VA động
    </Param>
    <Param name="created_at_sort" type="enum: asc, desc" required="false">
      Sắp xếp theo ngày tạo (mặc định: mới nhất trước)
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
      --url 'https://userapi.sepay.vn/v2/bank-accounts/f9e8d7c6-b5a4-3210-fedc-ba0987654321/va?q=SOME_STRING_VALUE&active=SOME_STRING_VALUE&official=SOME_INTEGER_VALUE&static=SOME_INTEGER_VALUE&created_at_sort=SOME_STRING_VALUE&page=SOME_INTEGER_VALUE&per_page=SOME_INTEGER_VALUE' \
      --header 'Authorization: Bearer REPLACE_BEARER_TOKEN'
    ```
  </CodeSample>

  <CodeSample value="php_curl" lang="php">
    ```php
    <?php
    
    $curl = curl_init();
    
    curl_setopt_array($curl, [
      CURLOPT_URL => "https://userapi.sepay.vn/v2/bank-accounts/f9e8d7c6-b5a4-3210-fedc-ba0987654321/va?q=SOME_STRING_VALUE&active=SOME_STRING_VALUE&official=SOME_INTEGER_VALUE&static=SOME_INTEGER_VALUE&created_at_sort=SOME_STRING_VALUE&page=SOME_INTEGER_VALUE&per_page=SOME_INTEGER_VALUE",
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
    
    conn.request("GET", "/v2/bank-accounts/f9e8d7c6-b5a4-3210-fedc-ba0987654321/va?q=SOME_STRING_VALUE&active=SOME_STRING_VALUE&official=SOME_INTEGER_VALUE&static=SOME_INTEGER_VALUE&created_at_sort=SOME_STRING_VALUE&page=SOME_INTEGER_VALUE&per_page=SOME_INTEGER_VALUE", headers=headers)
    
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
      "path": "/v2/bank-accounts/f9e8d7c6-b5a4-3210-fedc-ba0987654321/va?q=SOME_STRING_VALUE&active=SOME_STRING_VALUE&official=SOME_INTEGER_VALUE&static=SOME_INTEGER_VALUE&created_at_sort=SOME_STRING_VALUE&page=SOME_INTEGER_VALUE&per_page=SOME_INTEGER_VALUE",
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
      .url("https://userapi.sepay.vn/v2/bank-accounts/f9e8d7c6-b5a4-3210-fedc-ba0987654321/va?q=SOME_STRING_VALUE&active=SOME_STRING_VALUE&official=SOME_INTEGER_VALUE&static=SOME_INTEGER_VALUE&created_at_sort=SOME_STRING_VALUE&page=SOME_INTEGER_VALUE&per_page=SOME_INTEGER_VALUE")
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
    
    url = URI("https://userapi.sepay.vn/v2/bank-accounts/f9e8d7c6-b5a4-3210-fedc-ba0987654321/va?q=SOME_STRING_VALUE&active=SOME_STRING_VALUE&official=SOME_INTEGER_VALUE&static=SOME_INTEGER_VALUE&created_at_sort=SOME_STRING_VALUE&page=SOME_INTEGER_VALUE&per_page=SOME_INTEGER_VALUE")
    
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
    
    	url := "https://userapi.sepay.vn/v2/bank-accounts/f9e8d7c6-b5a4-3210-fedc-ba0987654321/va?q=SOME_STRING_VALUE&active=SOME_STRING_VALUE&official=SOME_INTEGER_VALUE&static=SOME_INTEGER_VALUE&created_at_sort=SOME_STRING_VALUE&page=SOME_INTEGER_VALUE&per_page=SOME_INTEGER_VALUE"
    
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
        RequestUri = new Uri("https://userapi.sepay.vn/v2/bank-accounts/f9e8d7c6-b5a4-3210-fedc-ba0987654321/va?q=SOME_STRING_VALUE&active=SOME_STRING_VALUE&official=SOME_INTEGER_VALUE&static=SOME_INTEGER_VALUE&created_at_sort=SOME_STRING_VALUE&page=SOME_INTEGER_VALUE&per_page=SOME_INTEGER_VALUE"),
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
    
    let request = NSMutableURLRequest(url: NSURL(string: "https://userapi.sepay.vn/v2/bank-accounts/f9e8d7c6-b5a4-3210-fedc-ba0987654321/va?q=SOME_STRING_VALUE&active=SOME_STRING_VALUE&official=SOME_INTEGER_VALUE&static=SOME_INTEGER_VALUE&created_at_sort=SOME_STRING_VALUE&page=SOME_INTEGER_VALUE&per_page=SOME_INTEGER_VALUE")! as URL,
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
      .url("https://userapi.sepay.vn/v2/bank-accounts/f9e8d7c6-b5a4-3210-fedc-ba0987654321/va?q=SOME_STRING_VALUE&active=SOME_STRING_VALUE&official=SOME_INTEGER_VALUE&static=SOME_INTEGER_VALUE&created_at_sort=SOME_STRING_VALUE&page=SOME_INTEGER_VALUE&per_page=SOME_INTEGER_VALUE")
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
    "id": "c3d4e5f6-a7b8-9012-cdef-345678901234",
    "va": "VA001234",
    "sub_holder_name": "NGUYEN VAN A",
    "label": "VA thanh toan",
    "active": 1,
    "official": 1,
    "static": 0,
    "bank_account_id": "f9e8d7c6-b5a4-3210-fedc-ba0987654321",
    "created_at": "2025-06-01 09:00:00",
    "updated_at": "2026-03-12 17:30:00"
  }
],
"meta": {
  "pagination": {
    "total": 10,
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
      Danh sách tài khoản ảo
    </Description>

    <Example>
      {
        "status": "success",
        "data": [
          {
            "id": "c3d4e5f6-a7b8-9012-cdef-123456789013",
            "va": "VA001234",
            "sub_holder_name": "NGUYEN VAN A",
            "label": "Thu ho khach le",
            "active": 1,
            "official": 1,
            "static": 0,
            "bank_account_id": "f9e8d7c6-b5a4-3210-fedc-ba0987654321",
            "created_at": "2025-06-15 10:00:00",
            "updated_at": "2025-11-22 14:45:00"
          }
        ],
        "meta": {
          "pagination": {
            "total": 10,
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

* `id` là UUID của tài khoản ảo
* `bank_account_id` là UUID của tài khoản ngân hàng cha
