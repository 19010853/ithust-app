# API tạo Access Token

## POST /tokens — tạo Bearer access token để xác thực mọi request API SePay Bank Hub. Bước bắt buộc đầu tiên trước khi gọi các endpoint khác.

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

## API Endpoint

<Endpoint>
  <Method>POST</Method>

  <Path>https://bankhub-api-sandbox.sepay.vn/v1/token</Path>

  <Description>
    Tạo Token
  </Description>

  <Authentication>
    basicAuth
  </Authentication>
</Endpoint>

## Xác thực

API này sử dụng **Basic Authentication** với thông tin đăng nhập:

* **Username:** `client_id` (được SePay cấp cho đối tác)
* **Password:** `client_secret` (được SePay cấp cho đối tác)

<Callout type="info" title="Lưu ý">
Sử dụng 
Basic Authentication
: Encode chuỗi 
`client_id:client_secret`
 thành Base64 và đặt vào header 
`Authorization: Basic {base64_string}`
Gửi request với body rỗng
Access token có thời gian hiệu lực theo giá trị 
`ttl`
 (tính bằng giây)
Khi token hết hạn, cần gọi lại API này để lấy token mới
</Callout>

## Xử lý lỗi

<ErrorCodes
  hiddenHead={true}
  rows={[
  { code: 401, name: "Unauthenticated", description: "Client ID hoặc Client Secret không hợp lệ hoặc bị vô hiệu hóa" }
]}
/>

## API Response

<Responses>
  <Response status="201">
    <Description>
      Tạo token thành công
    </Description>
  </Response>

</Responses>

<ResponseDescriptionFields>
  <ResponseSchema status="201">
    <Fields>
      <Field name="code" type="integer" required="false">
        Mã trạng thái HTTP
      </Field>
      <Field name="access_token" type="string" required="false">
        Bearer token dùng để xác thực cho các API Bank Hub khác
      </Field>
      <Field name="ttl" type="integer" required="false">
        Thời gian hiệu lực của token (tính bằng giây)
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
      --url https://bankhub-api-sandbox.sepay.vn/v1/token \
      --header 'Authorization: Basic REPLACE_BASIC_AUTH'
    ```
  </CodeSample>

  <CodeSample value="php_curl" lang="php">
    ```php
    <?php
    
    $curl = curl_init();
    
    curl_setopt_array($curl, [
      CURLOPT_URL => "https://bankhub-api-sandbox.sepay.vn/v1/token",
      CURLOPT_RETURNTRANSFER => true,
      CURLOPT_ENCODING => "",
      CURLOPT_MAXREDIRS => 10,
      CURLOPT_TIMEOUT => 30,
      CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
      CURLOPT_CUSTOMREQUEST => "POST",
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
    
    conn = http.client.HTTPSConnection("bankhub-api-sandbox.sepay.vn")
    
    headers = { 'Authorization': "Basic REPLACE_BASIC_AUTH" }
    
    conn.request("POST", "/v1/token", headers=headers)
    
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
      "hostname": "bankhub-api-sandbox.sepay.vn",
      "port": null,
      "path": "/v1/token",
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
      .url("https://bankhub-api-sandbox.sepay.vn/v1/token")
      .post(null)
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
    
    url = URI("https://bankhub-api-sandbox.sepay.vn/v1/token")
    
    http = Net::HTTP.new(url.host, url.port)
    http.use_ssl = true
    http.verify_mode = OpenSSL::SSL::VERIFY_NONE
    
    request = Net::HTTP::Post.new(url)
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
    
    	url := "https://bankhub-api-sandbox.sepay.vn/v1/token"
    
    	req, _ := http.NewRequest("POST", url, nil)
    
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
        Method = HttpMethod.Post,
        RequestUri = new Uri("https://bankhub-api-sandbox.sepay.vn/v1/token"),
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
    
    let request = NSMutableURLRequest(url: NSURL(string: "https://bankhub-api-sandbox.sepay.vn/v1/token")! as URL,
                                            cachePolicy: .useProtocolCachePolicy,
                                        timeoutInterval: 10.0)
    request.httpMethod = "POST"
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
      .url("https://bankhub-api-sandbox.sepay.vn/v1/token")
      .post(null)
      .addHeader("Authorization", "Basic REPLACE_BASIC_AUTH")
      .build()
    
    val response = client.newCall(request).execute()
    ```
  </CodeSample>

</CodeSamples>

***

## Sử dụng Access Token

Sau khi lấy được `access_token`, bạn cần sử dụng nó trong header `Authorization` với format `Bearer` cho tất cả các API Bank Hub khác:

<TextBlock title="Sử dụng Bearer Token">
```text
Authorization: Bearer 5e79079684d93027ed1d7e414b02343b1d6ef164
```
</TextBlock>

## Làm mới Token

Token có thời gian hiệu lực giới hạn (được chỉ định bởi trường `ttl`). Khi token hết hạn, các API sẽ trả về lỗi `401 Unauthorized`. Lúc này bạn cần:

* Gọi lại API `/v1/token` để lấy token mới
* Cập nhật token mới vào hệ thống của bạn
* Tiếp tục sử dụng token mới cho các API tiếp theo

<Callout type="warn" title="Lưu ý">
Lưu trữ token an toàn, không để lộ ra client-side
Implement cơ chế refresh token tự động trước khi hết hạn
Xử lý lỗi 401 bằng cách tự động lấy token mới và retry request
</Callout>

***

## Bước tiếp theo

Sau khi có access token, bạn có thể:

1. **[Tạo công ty](/vi/bankhub/api/cong-ty/tao-cong-ty)** - Tạo công ty để quản lý tài khoản ngân hàng
2. **[Tạo Link Token](/vi/bankhub/api/link-token/tao-link-token)** - Tạo link để người dùng liên kết ngân hàng
3. **[Danh sách tài khoản ngân hàng](/vi/bankhub/api/tai-khoan-ngan-hang/danh-sach-tai-khoan)** - Xem các tài khoản đã liên kết
