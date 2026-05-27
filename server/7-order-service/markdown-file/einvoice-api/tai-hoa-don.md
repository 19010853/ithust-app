# API tải hóa đơn điện tử

## Tải file hóa đơn điện tử dạng PDF hoặc XML theo mã tracking qua SePay E-Invoice API. Trả về nội dung file dạng base64 để lưu trữ hoặc in ấn.

---

**API Overview:**

API tạo và quản lý hóa đơn điện tử theo quy định của Tổng cục Thuế Việt Nam.

**Base URLs:**
- Production: `https://einvoice-api.sepay.vn`
- Sandbox: `https://einvoice-api-sandbox.sepay.vn`


---

## API Endpoint

<Endpoint>
  <Method>GET</Method>

  <Path>https://einvoice-api.sepay.vn/v1/invoices/{tracking_code}/download</Path>

  <Description>
    Tải hóa đơn
  </Description>

  <Authentication>
    bearerAuth
  </Authentication>
</Endpoint>

## API Request

<Params>
  <PathParams>
    <Param name="tracking_code" type="string" required="true">
      Mã tracking của hóa đơn
    </Param>
  </PathParams>

  <QueryParams>
    <Param name="type" type="enum: pdf, xml" required="true">
      Loại file cần tải (pdf hoặc xml)
    </Param>
  </QueryParams>

</Params>

## API Response

<Responses>
  <Response status="200">
    <Description>
      File hóa đơn (base64 encoded)
    </Description>

    <Example>
      {
        "success": true,
        "data": {
          "file_type": "pdf",
          "file_name": "HD_0000589_20251215.pdf",
          "content": "JVBERi0xLjQKJeLjz9MKMyAwIG9iago8PC9UeXBlL1hPYmplY3Q..."
        }
      }
    </Example>
  </Response>

</Responses>

<ResponseDescriptionFields>
  <ResponseSchema status="200">
    <Fields>
      <Field name="success" type="boolean" required="false">
      </Field>
      <Field name="data" type="object" required="false">
        <Fields>
          <Field name="file_type" type="enum: pdf, xml" required="true">
            Loại file được tải (pdf hoặc xml)
          </Field>
          <Field name="file_name" type="string" required="true">
            Tên file gợi ý khi lưu
          </Field>
          <Field name="content" type="string" required="true">
            Nội dung file được mã hóa base64. Cần decode để lưu thành file.
          </Field>
        </Fields>
      </Field>
    </Fields>
  </ResponseSchema>

</ResponseDescriptionFields>

## Xử lý lỗi

<ErrorCodes
  hiddenHead={true}
  rows={[
  { code: 400, name: "Bad Request", description: "Tham số type không hợp lệ (không phải pdf hoặc xml)." },
  { code: 401, name: "Unauthorized", description: "Thiếu hoặc sai Bearer token." },
  { code: 404, name: "Not Found", description: "Không tìm thấy hóa đơn theo tracking_code." }
]}
/>

## Lưu ý

<Callout type="info" title="Lưu ý">
API trả về nội dung file dạng 
base64
. Bạn cần decode base64 để lưu thành file PDF hoặc XML.
Tham số 
`type`
 chỉ chấp nhận hai giá trị: 
`pdf`
 hoặc 
`xml`
.
Đảm bảo hóa đơn đã được phát hành thành công trước khi tải file.
</Callout>

## Xử lý Base64 thành File

Sau khi gọi API thành công, bạn cần decode nội dung base64 và lưu thành file. Dưới đây là ví dụ với PHP:

<Php title="Decode Base64 và lưu file">
```php
<?php
// Giả sử $response là kết quả từ API
$response = json_decode($apiResult, true);

if ($response['success']) {
  // Lấy nội dung base64 từ response
  $base64Content = $response['data']['content'];
  $fileName = $response['data']['file_name'];

  // Decode base64 thành binary
  $binaryContent = base64_decode($base64Content);

  // Kiểm tra decode thành công
  if ($binaryContent === false) {
      throw new Exception('Lỗi decode base64');
  }

  // Lưu file
  $bytesWritten = file_put_contents($fileName, $binaryContent);

  if ($bytesWritten === false) {
      throw new Exception('Lỗi ghi file');
  }

  echo "Đã lưu file: {$fileName} ({$bytesWritten} bytes)";
}
```
</Php>

**Các bước xử lý:**

1. **Parse JSON response** - Chuyển đổi response thành mảng PHP
2. **Lấy nội dung base64** - Truy cập `$response['data']['content']`
3. **Decode base64** - Sử dụng `base64_decode()` để chuyển thành binary
4. **Lưu file** - Sử dụng `file_put_contents()` để ghi ra file

<Callout type="warning" title="Lưu ý quan trọng">
Luôn kiểm tra kết quả 
`base64_decode()`
 vì có thể trả về 
`false`
 nếu chuỗi base64 không hợp lệ.
Đảm bảo thư mục lưu file có quyền ghi (write permission).
Với file PDF, có thể kiểm tra header 
`%PDF`
 sau khi decode để xác nhận file hợp lệ.
</Callout>

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
      --url 'https://einvoice-api.sepay.vn/v1/invoices/084e179d-d95a-11f0-aef4-52c7e9b4f41b/download?type=pdf' \
      --header 'Authorization: Bearer REPLACE_BEARER_TOKEN'
    ```
  </CodeSample>

  <CodeSample value="php_curl" lang="php">
    ```php
    <?php
    
    $curl = curl_init();
    
    curl_setopt_array($curl, [
      CURLOPT_URL => "https://einvoice-api.sepay.vn/v1/invoices/084e179d-d95a-11f0-aef4-52c7e9b4f41b/download?type=pdf",
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
    
    conn = http.client.HTTPSConnection("einvoice-api.sepay.vn")
    
    headers = { 'Authorization': "Bearer REPLACE_BEARER_TOKEN" }
    
    conn.request("GET", "/v1/invoices/084e179d-d95a-11f0-aef4-52c7e9b4f41b/download?type=pdf", headers=headers)
    
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
      "hostname": "einvoice-api.sepay.vn",
      "port": null,
      "path": "/v1/invoices/084e179d-d95a-11f0-aef4-52c7e9b4f41b/download?type=pdf",
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
      .url("https://einvoice-api.sepay.vn/v1/invoices/084e179d-d95a-11f0-aef4-52c7e9b4f41b/download?type=pdf")
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
    
    url = URI("https://einvoice-api.sepay.vn/v1/invoices/084e179d-d95a-11f0-aef4-52c7e9b4f41b/download?type=pdf")
    
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
    
    	url := "https://einvoice-api.sepay.vn/v1/invoices/084e179d-d95a-11f0-aef4-52c7e9b4f41b/download?type=pdf"
    
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
        RequestUri = new Uri("https://einvoice-api.sepay.vn/v1/invoices/084e179d-d95a-11f0-aef4-52c7e9b4f41b/download?type=pdf"),
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
    
    let request = NSMutableURLRequest(url: NSURL(string: "https://einvoice-api.sepay.vn/v1/invoices/084e179d-d95a-11f0-aef4-52c7e9b4f41b/download?type=pdf")! as URL,
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
      .url("https://einvoice-api.sepay.vn/v1/invoices/084e179d-d95a-11f0-aef4-52c7e9b4f41b/download?type=pdf")
      .get()
      .addHeader("Authorization", "Bearer REPLACE_BEARER_TOKEN")
      .build()
    
    val response = client.newCall(request).execute()
    ```
  </CodeSample>

</CodeSamples>

## Bước tiếp theo

Sau khi tải hóa đơn thành công:

1. **[Kiểm tra hạn ngạch](/vi/einvoice-api/v1/kiem-tra-han-ngach)** — Kiểm tra số lượng hóa đơn còn lại trong gói dịch vụ để tránh gián đoạn khi xuất hóa đơn tiếp theo
2. **[Xuất hóa đơn điện tử](/vi/einvoice-api/v1/xuat-hoa-don-dien-tu)** — Bắt đầu chu trình mới để xuất hóa đơn cho giao dịch tiếp theo
