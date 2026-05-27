# Bắt đầu nhanh với SePay eInvoice API

## Phát hành hóa đơn điện tử đầu tiên với SePay eInvoice API trong 4 bước. Lấy token, chọn nhà cung cấp, tạo và phát hành hóa đơn lên cơ quan thuế.

---

**API Overview:**

API tạo và quản lý hóa đơn điện tử theo quy định của Tổng cục Thuế Việt Nam.

**Base URLs:**
- Production: `https://einvoice-api.sepay.vn`
- Sandbox: `https://einvoice-api-sandbox.sepay.vn`


---

<Callout type="info" title="Trước khi bắt đầu">
Bạn cần có:
client_id
 và 
client_secret
 từ tài khoản SePay eInvoice
Sử dụng môi trường 
Sandbox
 để thử nghiệm: 
`https://einvoice-api-sandbox.sepay.vn`
Tất cả API calls phải thực hiện từ 
server-side
 — không gọi trực tiếp từ client/browser
</Callout>

***

## Bước 1: Lấy Access Token

Mọi API eInvoice đều yêu cầu xác thực bằng Bearer token. Gọi endpoint `/v1/token` với **Basic Authentication** để lấy `access_token`.

<Endpoint>
  <Method>POST</Method>

  <Path>https://einvoice-api.sepay.vn/v1/token</Path>

  <Description>
    Tạo token xác thực
  </Description>

  <Authentication>
    basicAuth
  </Authentication>
</Endpoint>

<Callout type="warning" title="Bảo mật">
KHÔNG
 gọi API này từ browser hay mobile app. 
`client_secret`
 phải được giữ tuyệt mật trên server của bạn.
</Callout>

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
      --url https://einvoice-api.sepay.vn/v1/token \
      --header 'Authorization: Basic REPLACE_BASIC_AUTH'
    ```
  </CodeSample>

  <CodeSample value="php_curl" lang="php">
    ```php
    <?php
    
    $curl = curl_init();
    
    curl_setopt_array($curl, [
      CURLOPT_URL => "https://einvoice-api.sepay.vn/v1/token",
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
    
    conn = http.client.HTTPSConnection("einvoice-api.sepay.vn")
    
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
      "hostname": "einvoice-api.sepay.vn",
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
      .url("https://einvoice-api.sepay.vn/v1/token")
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
    
    url = URI("https://einvoice-api.sepay.vn/v1/token")
    
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
    
    	url := "https://einvoice-api.sepay.vn/v1/token"
    
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
        RequestUri = new Uri("https://einvoice-api.sepay.vn/v1/token"),
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
    
    let request = NSMutableURLRequest(url: NSURL(string: "https://einvoice-api.sepay.vn/v1/token")! as URL,
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
      .url("https://einvoice-api.sepay.vn/v1/token")
      .post(null)
      .addHeader("Authorization", "Basic REPLACE_BASIC_AUTH")
      .build()
    
    val response = client.newCall(request).execute()
    ```
  </CodeSample>

</CodeSamples>

<Responses>
  <Response status="200">
    <Description>
      Token tạo thành công
    </Description>

    <Example>
      {
        "success": true,
        "data": {
          "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
          "token_type": "Bearer",
          "expires_in": 86400
        }
      }
    </Example>
  </Response>

</Responses>

<Callout type="info" title="Quản lý token">
Token có hiệu lực 
86400 giây (24 giờ)
. Nên lưu vào cache và tái sử dụng thay vì gọi lại mỗi request. Khi nhận lỗi 
`401`
, tự động lấy token mới.
</Callout>

***

## Bước 2: Lấy danh sách tài khoản nhà cung cấp

Trước khi tạo hóa đơn, bạn cần biết `provider_account_id` — ID tài khoản nhà cung cấp hóa đơn điện tử đã được cấu hình trong hệ thống. Gọi endpoint `/v1/provider-accounts` để lấy danh sách.

<Endpoint>
  <Method>GET</Method>

  <Path>https://einvoice-api.sepay.vn/v1/provider-accounts</Path>

  <Description>
    Danh sách tài khoản nhà cung cấp
  </Description>

  <Authentication>
    bearerAuth
  </Authentication>
</Endpoint>

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
      --url 'https://einvoice-api.sepay.vn/v1/provider-accounts?page=1&per_page=20' \
      --header 'Authorization: Bearer REPLACE_BEARER_TOKEN'
    ```
  </CodeSample>

  <CodeSample value="php_curl" lang="php">
    ```php
    <?php
    
    $curl = curl_init();
    
    curl_setopt_array($curl, [
      CURLOPT_URL => "https://einvoice-api.sepay.vn/v1/provider-accounts?page=1&per_page=20",
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
    
    conn.request("GET", "/v1/provider-accounts?page=1&per_page=20", headers=headers)
    
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
      "path": "/v1/provider-accounts?page=1&per_page=20",
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
      .url("https://einvoice-api.sepay.vn/v1/provider-accounts?page=1&per_page=20")
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
    
    url = URI("https://einvoice-api.sepay.vn/v1/provider-accounts?page=1&per_page=20")
    
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
    
    	url := "https://einvoice-api.sepay.vn/v1/provider-accounts?page=1&per_page=20"
    
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
        RequestUri = new Uri("https://einvoice-api.sepay.vn/v1/provider-accounts?page=1&per_page=20"),
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
    
    let request = NSMutableURLRequest(url: NSURL(string: "https://einvoice-api.sepay.vn/v1/provider-accounts?page=1&per_page=20")! as URL,
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
      .url("https://einvoice-api.sepay.vn/v1/provider-accounts?page=1&per_page=20")
      .get()
      .addHeader("Authorization", "Bearer REPLACE_BEARER_TOKEN")
      .build()
    
    val response = client.newCall(request).execute()
    ```
  </CodeSample>

</CodeSamples>

<Responses>
  <Response status="200">
    <Description>
      Danh sách tài khoản
    </Description>

    <Example>
      {
        "data": {
          "paging": {
            "per_page": 20,
            "total": 1,
            "has_more": false,
            "current_page": 1,
            "page_count": 1
          },
          "items": [
            {
              "id": "0aea3134-da40-11f0-aef4-52c7e9b4f41b",
              "provider": "matbao",
              "active": true,
              "tax_authority_approved_date": "2026-04-20"
            }
          ]
        }
      }
    </Example>
  </Response>

</Responses>

<Callout type="info" title="Chọn tài khoản đúng">
Chỉ sử dụng tài khoản có 
`active: true`
. Nếu bạn có nhiều tài khoản từ nhiều nhà cung cấp khác nhau, hãy gọi 
API chi tiết tài khoản
 để xem mẫu hóa đơn và ký hiệu được phép dùng cho từng tài khoản.
</Callout>

***

## Bước 3: Tạo và phát hành hóa đơn

Gọi endpoint `/v1/invoices/create` với `is_draft: false` để tạo và phát hành hóa đơn trực tiếp (không qua bước nháp). API xử lý bất đồng bộ và trả về `tracking_code` để theo dõi kết quả ở bước tiếp theo.

<Endpoint>
  <Method>POST</Method>

  <Path>https://einvoice-api.sepay.vn/v1/invoices/create</Path>

  <Description>
    Xuất hóa đơn điện tử
  </Description>

  <Authentication>
    bearerAuth
  </Authentication>
</Endpoint>

<Params>
  <RequestBody>
    <Fields>
      <Field name="template_code" type="string" required="true">
        Mã mẫu hóa đơn (lấy từ API chi tiết tài khoản)
      </Field>
      <Field name="invoice_series" type="string" required="true">
        Ký hiệu hóa đơn (lấy từ API chi tiết tài khoản)
      </Field>
      <Field name="issued_date" type="string" required="true">
        Ngày phát hành (YYYY-MM-DD HH:mm:ss)
      </Field>
      <Field name="currency" type="enum: VND, USD, CAD" required="true">
        Đơn vị tiền tệ:
- VND: Việt Nam Đồng
- USD: Đô la Mỹ
- CAD: Đô la Canada

      </Field>
      <Field name="provider_account_id" type="string" required="true">
        ID tài khoản nhà cung cấp (UUID)
      </Field>
      <Field name="reference_code" type="string" required="false">
        Mã tham chiếu hóa đơn, phải là duy nhất. Nếu không truyền, hệ thống tự sinh UUID.
      </Field>
      <Field name="payment_method" type="enum: TM, CK, TM/CK, KHAC" required="false">
        Phương thức thanh toán:
- TM: Tiền mặt (Cash)
- CK: Chuyển khoản (Bank transfer)
- TM/CK: Tiền mặt và chuyển khoản (Cash and bank transfer)
- KHAC: Khác (Other)

      </Field>
      <Field name="is_draft" type="boolean" required="false">
        - `true`: Xuất nháp (cần phát hành sau, không tính vào hạn ngạch)
- `false`: Xuất và phát hành luôn

      </Field>
      <Field name="buyer" type="object" required="true">
        <Fields>
          <Field name="type" type="enum: personal, company" required="false">
            Loại người mua (personal, company)
          </Field>
          <Field name="name" type="string" required="false">
            Tên người/đơn vị mua
          </Field>
          <Field name="legal_name" type="string" required="false">
            Tên pháp lý (dùng cho công ty)
          </Field>
          <Field name="tax_code" type="string" required="false">
            Mã số thuế
          </Field>
          <Field name="address" type="string" required="false">
            Địa chỉ
          </Field>
          <Field name="email" type="string (email)" required="false">
            Email nhận hóa đơn
          </Field>
          <Field name="phone" type="string" required="false">
            Số điện thoại
          </Field>
          <Field name="buyer_code" type="string" required="false">
            Mã khách hàng (mã người mua hàng)
          </Field>
          <Field name="national_id" type="string" required="false">
            Căn cước công dân / Số CCCD / Số định danh cá nhân
          </Field>
        </Fields>
      </Field>
      <Field name="items" type="array" required="true">
        <Description>Danh sách hàng hóa/dịch vụ</Description>
        <ArrayItems>
          <Fields>
            <Field name="line_number" type="integer" required="true">
              Số thứ tự dòng
            </Field>
            <Field name="line_type" type="enum: 1, 2, 3, 4" required="true">
              Loại dòng hàng:
- 1: Hàng hóa/dịch vụ bình thường
- 2: Hàng khuyến mại
- 3: Chiết khấu thương mại
- 4: Ghi chú

            </Field>
            <Field name="item_code" type="string" required="false">
              Mã hàng hóa/dịch vụ
            </Field>
            <Field name="item_name" type="string" required="true">
              Tên hàng hóa/dịch vụ
            </Field>
            <Field name="unit" type="string" required="false">
              Đơn vị tính
            </Field>
            <Field name="quantity" type="number" required="false">
              Số lượng
            </Field>
            <Field name="unit_price" type="number" required="false">
              Đơn giá
            </Field>
            <Field name="tax_rate" type="enum: -2, -1, 0, 5, 8, 10" required="false">
              Thuế suất (%):
- -2: Không chịu thuế
- -1: Không kê khai, tính nộp thuế GTGT
- 0: 0%
- 5: 5%
- 8: 8%
- 10: 10%

            </Field>
            <Field name="discount_tax" type="number" required="false">
              Phần trăm chiết khấu trên sản phẩm (%)
            </Field>
            <Field name="discount_amount" type="number" required="false">
              Số tiền chiết khấu trên sản phẩm
            </Field>
            <Field name="before_discount_and_tax_amount" type="number" required="false">
              Số tiền trước chiết khấu và thuế (dùng cho line_type=3)
            </Field>
          </Fields>
        </ArrayItems>
      </Field>
      <Field name="notes" type="string" required="false">
        Ghi chú nội bộ
      </Field>
    </Fields>

    <Example>
      {
        "template_code": "2",
        "invoice_series": "C25HTV",
        "issued_date": "2025-12-11 08:00:00",
        "currency": "VND",
        "provider_account_id": "0aea3134-da40-11f0-aef4-52c7e9b4f41b",
        "buyer": {
          "name": "Công ty ABC",
          "tax_code": "0101234567",
          "address": "123 Đường A, Quận B, Hà Nội",
          "email": "buyer@example.com",
          "phone": "0900000000"
        },
        "items": [
          {
            "line_number": 1,
            "line_type": 1,
            "item_code": "SP001",
            "item_name": "Sản phẩm A",
            "unit": "cái",
            "quantity": 1,
            "unit_price": 4500000
          }
        ],
        "notes": "Ghi chú hóa đơn",
        "is_draft": true
      }
    </Example>
  </RequestBody>
</Params>

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
      --url https://einvoice-api.sepay.vn/v1/invoices/create \
      --header 'Authorization: Bearer REPLACE_BEARER_TOKEN' \
      --header 'content-type: application/json' \
      --data '{"template_code":"1","invoice_series":"C26TSE","issued_date":"2026-01-26 00:00:00","currency":"VND","provider_account_id":"0aea3134-da40-11f0-aef4-52c7e9b4f41b","reference_code":"0aea3134-da40-11f0-aef4-52c7e9b4f41b","payment_method":"TM","is_draft":false,"buyer":{"type":"personal","name":"Công ty TNHH ABC","legal_name":"CÔNG TY CỔ PHẦN ABC","tax_code":"0123456789","address":"123 Đường ABC, Quận 1, TP.HCM","email":"contact@abc.com","phone":"0901234567","buyer_code":"KH-001","national_id":"001234567890"},"items":[{"line_number":1,"line_type":1,"item_code":"SP001","item_name":"Sản phẩm A","unit":"cái","quantity":10,"unit_price":100000,"tax_rate":10,"discount_tax":10,"discount_amount":100000,"before_discount_and_tax_amount":4500000}],"notes":"Ghi chú nội bộ"}'
    ```
  </CodeSample>

  <CodeSample value="php_curl" lang="php">
    ```php
    <?php
    
    $curl = curl_init();
    
    curl_setopt_array($curl, [
      CURLOPT_URL => "https://einvoice-api.sepay.vn/v1/invoices/create",
      CURLOPT_RETURNTRANSFER => true,
      CURLOPT_ENCODING => "",
      CURLOPT_MAXREDIRS => 10,
      CURLOPT_TIMEOUT => 30,
      CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
      CURLOPT_CUSTOMREQUEST => "POST",
      CURLOPT_POSTFIELDS => "{\"template_code\":\"1\",\"invoice_series\":\"C26TSE\",\"issued_date\":\"2026-01-26 00:00:00\",\"currency\":\"VND\",\"provider_account_id\":\"0aea3134-da40-11f0-aef4-52c7e9b4f41b\",\"reference_code\":\"0aea3134-da40-11f0-aef4-52c7e9b4f41b\",\"payment_method\":\"TM\",\"is_draft\":false,\"buyer\":{\"type\":\"personal\",\"name\":\"Công ty TNHH ABC\",\"legal_name\":\"CÔNG TY CỔ PHẦN ABC\",\"tax_code\":\"0123456789\",\"address\":\"123 Đường ABC, Quận 1, TP.HCM\",\"email\":\"contact@abc.com\",\"phone\":\"0901234567\",\"buyer_code\":\"KH-001\",\"national_id\":\"001234567890\"},\"items\":[{\"line_number\":1,\"line_type\":1,\"item_code\":\"SP001\",\"item_name\":\"Sản phẩm A\",\"unit\":\"cái\",\"quantity\":10,\"unit_price\":100000,\"tax_rate\":10,\"discount_tax\":10,\"discount_amount\":100000,\"before_discount_and_tax_amount\":4500000}],\"notes\":\"Ghi chú nội bộ\"}",
      CURLOPT_HTTPHEADER => [
        "Authorization: Bearer REPLACE_BEARER_TOKEN",
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
    
    conn = http.client.HTTPSConnection("einvoice-api.sepay.vn")
    
    payload = "{\"template_code\":\"1\",\"invoice_series\":\"C26TSE\",\"issued_date\":\"2026-01-26 00:00:00\",\"currency\":\"VND\",\"provider_account_id\":\"0aea3134-da40-11f0-aef4-52c7e9b4f41b\",\"reference_code\":\"0aea3134-da40-11f0-aef4-52c7e9b4f41b\",\"payment_method\":\"TM\",\"is_draft\":false,\"buyer\":{\"type\":\"personal\",\"name\":\"Công ty TNHH ABC\",\"legal_name\":\"CÔNG TY CỔ PHẦN ABC\",\"tax_code\":\"0123456789\",\"address\":\"123 Đường ABC, Quận 1, TP.HCM\",\"email\":\"contact@abc.com\",\"phone\":\"0901234567\",\"buyer_code\":\"KH-001\",\"national_id\":\"001234567890\"},\"items\":[{\"line_number\":1,\"line_type\":1,\"item_code\":\"SP001\",\"item_name\":\"Sản phẩm A\",\"unit\":\"cái\",\"quantity\":10,\"unit_price\":100000,\"tax_rate\":10,\"discount_tax\":10,\"discount_amount\":100000,\"before_discount_and_tax_amount\":4500000}],\"notes\":\"Ghi chú nội bộ\"}"
    
    headers = {
        'Authorization': "Bearer REPLACE_BEARER_TOKEN",
        'content-type': "application/json"
        }
    
    conn.request("POST", "/v1/invoices/create", payload, headers)
    
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
      "hostname": "einvoice-api.sepay.vn",
      "port": null,
      "path": "/v1/invoices/create",
      "headers": {
        "Authorization": "Bearer REPLACE_BEARER_TOKEN",
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
    
    req.write(JSON.stringify({
      template_code: '1',
      invoice_series: 'C26TSE',
      issued_date: '2026-01-26 00:00:00',
      currency: 'VND',
      provider_account_id: '0aea3134-da40-11f0-aef4-52c7e9b4f41b',
      reference_code: '0aea3134-da40-11f0-aef4-52c7e9b4f41b',
      payment_method: 'TM',
      is_draft: false,
      buyer: {
        type: 'personal',
        name: 'Công ty TNHH ABC',
        legal_name: 'CÔNG TY CỔ PHẦN ABC',
        tax_code: '0123456789',
        address: '123 Đường ABC, Quận 1, TP.HCM',
        email: 'contact@abc.com',
        phone: '0901234567',
        buyer_code: 'KH-001',
        national_id: '001234567890'
      },
      items: [
        {
          line_number: 1,
          line_type: 1,
          item_code: 'SP001',
          item_name: 'Sản phẩm A',
          unit: 'cái',
          quantity: 10,
          unit_price: 100000,
          tax_rate: 10,
          discount_tax: 10,
          discount_amount: 100000,
          before_discount_and_tax_amount: 4500000
        }
      ],
      notes: 'Ghi chú nội bộ'
    }));
    req.end();
    ```
  </CodeSample>

  <CodeSample value="java_okhttp" lang="java">
    ```java
    OkHttpClient client = new OkHttpClient();
    
    MediaType mediaType = MediaType.parse("application/json");
    RequestBody body = RequestBody.create(mediaType, "{\"template_code\":\"1\",\"invoice_series\":\"C26TSE\",\"issued_date\":\"2026-01-26 00:00:00\",\"currency\":\"VND\",\"provider_account_id\":\"0aea3134-da40-11f0-aef4-52c7e9b4f41b\",\"reference_code\":\"0aea3134-da40-11f0-aef4-52c7e9b4f41b\",\"payment_method\":\"TM\",\"is_draft\":false,\"buyer\":{\"type\":\"personal\",\"name\":\"Công ty TNHH ABC\",\"legal_name\":\"CÔNG TY CỔ PHẦN ABC\",\"tax_code\":\"0123456789\",\"address\":\"123 Đường ABC, Quận 1, TP.HCM\",\"email\":\"contact@abc.com\",\"phone\":\"0901234567\",\"buyer_code\":\"KH-001\",\"national_id\":\"001234567890\"},\"items\":[{\"line_number\":1,\"line_type\":1,\"item_code\":\"SP001\",\"item_name\":\"Sản phẩm A\",\"unit\":\"cái\",\"quantity\":10,\"unit_price\":100000,\"tax_rate\":10,\"discount_tax\":10,\"discount_amount\":100000,\"before_discount_and_tax_amount\":4500000}],\"notes\":\"Ghi chú nội bộ\"}");
    Request request = new Request.Builder()
      .url("https://einvoice-api.sepay.vn/v1/invoices/create")
      .post(body)
      .addHeader("Authorization", "Bearer REPLACE_BEARER_TOKEN")
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
    
    url = URI("https://einvoice-api.sepay.vn/v1/invoices/create")
    
    http = Net::HTTP.new(url.host, url.port)
    http.use_ssl = true
    http.verify_mode = OpenSSL::SSL::VERIFY_NONE
    
    request = Net::HTTP::Post.new(url)
    request["Authorization"] = 'Bearer REPLACE_BEARER_TOKEN'
    request["content-type"] = 'application/json'
    request.body = "{\"template_code\":\"1\",\"invoice_series\":\"C26TSE\",\"issued_date\":\"2026-01-26 00:00:00\",\"currency\":\"VND\",\"provider_account_id\":\"0aea3134-da40-11f0-aef4-52c7e9b4f41b\",\"reference_code\":\"0aea3134-da40-11f0-aef4-52c7e9b4f41b\",\"payment_method\":\"TM\",\"is_draft\":false,\"buyer\":{\"type\":\"personal\",\"name\":\"Công ty TNHH ABC\",\"legal_name\":\"CÔNG TY CỔ PHẦN ABC\",\"tax_code\":\"0123456789\",\"address\":\"123 Đường ABC, Quận 1, TP.HCM\",\"email\":\"contact@abc.com\",\"phone\":\"0901234567\",\"buyer_code\":\"KH-001\",\"national_id\":\"001234567890\"},\"items\":[{\"line_number\":1,\"line_type\":1,\"item_code\":\"SP001\",\"item_name\":\"Sản phẩm A\",\"unit\":\"cái\",\"quantity\":10,\"unit_price\":100000,\"tax_rate\":10,\"discount_tax\":10,\"discount_amount\":100000,\"before_discount_and_tax_amount\":4500000}],\"notes\":\"Ghi chú nội bộ\"}"
    
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
    
    	url := "https://einvoice-api.sepay.vn/v1/invoices/create"
    
    	payload := strings.NewReader("{\"template_code\":\"1\",\"invoice_series\":\"C26TSE\",\"issued_date\":\"2026-01-26 00:00:00\",\"currency\":\"VND\",\"provider_account_id\":\"0aea3134-da40-11f0-aef4-52c7e9b4f41b\",\"reference_code\":\"0aea3134-da40-11f0-aef4-52c7e9b4f41b\",\"payment_method\":\"TM\",\"is_draft\":false,\"buyer\":{\"type\":\"personal\",\"name\":\"Công ty TNHH ABC\",\"legal_name\":\"CÔNG TY CỔ PHẦN ABC\",\"tax_code\":\"0123456789\",\"address\":\"123 Đường ABC, Quận 1, TP.HCM\",\"email\":\"contact@abc.com\",\"phone\":\"0901234567\",\"buyer_code\":\"KH-001\",\"national_id\":\"001234567890\"},\"items\":[{\"line_number\":1,\"line_type\":1,\"item_code\":\"SP001\",\"item_name\":\"Sản phẩm A\",\"unit\":\"cái\",\"quantity\":10,\"unit_price\":100000,\"tax_rate\":10,\"discount_tax\":10,\"discount_amount\":100000,\"before_discount_and_tax_amount\":4500000}],\"notes\":\"Ghi chú nội bộ\"}")
    
    	req, _ := http.NewRequest("POST", url, payload)
    
    	req.Header.Add("Authorization", "Bearer REPLACE_BEARER_TOKEN")
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
        RequestUri = new Uri("https://einvoice-api.sepay.vn/v1/invoices/create"),
        Headers =
        {
            { "Authorization", "Bearer REPLACE_BEARER_TOKEN" },
        },
        Content = new StringContent("{\"template_code\":\"1\",\"invoice_series\":\"C26TSE\",\"issued_date\":\"2026-01-26 00:00:00\",\"currency\":\"VND\",\"provider_account_id\":\"0aea3134-da40-11f0-aef4-52c7e9b4f41b\",\"reference_code\":\"0aea3134-da40-11f0-aef4-52c7e9b4f41b\",\"payment_method\":\"TM\",\"is_draft\":false,\"buyer\":{\"type\":\"personal\",\"name\":\"Công ty TNHH ABC\",\"legal_name\":\"CÔNG TY CỔ PHẦN ABC\",\"tax_code\":\"0123456789\",\"address\":\"123 Đường ABC, Quận 1, TP.HCM\",\"email\":\"contact@abc.com\",\"phone\":\"0901234567\",\"buyer_code\":\"KH-001\",\"national_id\":\"001234567890\"},\"items\":[{\"line_number\":1,\"line_type\":1,\"item_code\":\"SP001\",\"item_name\":\"Sản phẩm A\",\"unit\":\"cái\",\"quantity\":10,\"unit_price\":100000,\"tax_rate\":10,\"discount_tax\":10,\"discount_amount\":100000,\"before_discount_and_tax_amount\":4500000}],\"notes\":\"Ghi chú nội bộ\"}")
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
      "Authorization": "Bearer REPLACE_BEARER_TOKEN",
      "content-type": "application/json"
    ]
    let parameters = [
      "template_code": "1",
      "invoice_series": "C26TSE",
      "issued_date": "2026-01-26 00:00:00",
      "currency": "VND",
      "provider_account_id": "0aea3134-da40-11f0-aef4-52c7e9b4f41b",
      "reference_code": "0aea3134-da40-11f0-aef4-52c7e9b4f41b",
      "payment_method": "TM",
      "is_draft": false,
      "buyer": [
        "type": "personal",
        "name": "Công ty TNHH ABC",
        "legal_name": "CÔNG TY CỔ PHẦN ABC",
        "tax_code": "0123456789",
        "address": "123 Đường ABC, Quận 1, TP.HCM",
        "email": "contact@abc.com",
        "phone": "0901234567",
        "buyer_code": "KH-001",
        "national_id": "001234567890"
      ],
      "items": [
        [
          "line_number": 1,
          "line_type": 1,
          "item_code": "SP001",
          "item_name": "Sản phẩm A",
          "unit": "cái",
          "quantity": 10,
          "unit_price": 100000,
          "tax_rate": 10,
          "discount_tax": 10,
          "discount_amount": 100000,
          "before_discount_and_tax_amount": 4500000
        ]
      ],
      "notes": "Ghi chú nội bộ"
    ] as [String : Any]
    
    let postData = JSONSerialization.data(withJSONObject: parameters, options: [])
    
    let request = NSMutableURLRequest(url: NSURL(string: "https://einvoice-api.sepay.vn/v1/invoices/create")! as URL,
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
    val body = RequestBody.create(mediaType, "{\"template_code\":\"1\",\"invoice_series\":\"C26TSE\",\"issued_date\":\"2026-01-26 00:00:00\",\"currency\":\"VND\",\"provider_account_id\":\"0aea3134-da40-11f0-aef4-52c7e9b4f41b\",\"reference_code\":\"0aea3134-da40-11f0-aef4-52c7e9b4f41b\",\"payment_method\":\"TM\",\"is_draft\":false,\"buyer\":{\"type\":\"personal\",\"name\":\"Công ty TNHH ABC\",\"legal_name\":\"CÔNG TY CỔ PHẦN ABC\",\"tax_code\":\"0123456789\",\"address\":\"123 Đường ABC, Quận 1, TP.HCM\",\"email\":\"contact@abc.com\",\"phone\":\"0901234567\",\"buyer_code\":\"KH-001\",\"national_id\":\"001234567890\"},\"items\":[{\"line_number\":1,\"line_type\":1,\"item_code\":\"SP001\",\"item_name\":\"Sản phẩm A\",\"unit\":\"cái\",\"quantity\":10,\"unit_price\":100000,\"tax_rate\":10,\"discount_tax\":10,\"discount_amount\":100000,\"before_discount_and_tax_amount\":4500000}],\"notes\":\"Ghi chú nội bộ\"}")
    val request = Request.Builder()
      .url("https://einvoice-api.sepay.vn/v1/invoices/create")
      .post(body)
      .addHeader("Authorization", "Bearer REPLACE_BEARER_TOKEN")
      .addHeader("content-type", "application/json")
      .build()
    
    val response = client.newCall(request).execute()
    ```
  </CodeSample>

</CodeSamples>

<Responses>
  <Response status="200">
    <Description>
      Yêu cầu xuất hóa đơn đã được tiếp nhận
    </Description>

    <Example>
      {
        "success": true,
        "data": {
          "tracking_code": "084e179d-d95a-11f0-aef4-52c7e9b4f41b",
          "tracking_url": "https://einvoice-api.sepay.vn/v1/invoices/create/check/084e179d-d95a-11f0-aef4-52c7e9b4f41b",
          "message": "Đã tạo yêu cầu xuất bán hóa đơn điện tử"
        }
      }
    </Example>
  </Response>

</Responses>

<Callout type="warning" title="Xử lý bất đồng bộ">
API trả về 
`tracking_code`
 ngay lập tức, nhưng hóa đơn 
chưa được phát hành
 tại thời điểm này. Bạn 
bắt buộc
 phải thực hiện Bước 4 để xác nhận kết quả phát hành.
</Callout>

***

## Bước 4: Kiểm tra trạng thái tạo hóa đơn

Gọi endpoint `/v1/invoices/create/check/{tracking_code}` để kiểm tra kết quả tạo hóa đơn. Khi `is_draft: false`, bước tạo đã bao gồm ký số và nộp lên cơ quan thuế — endpoint này xác nhận toàn bộ kết quả đó. Thực hiện polling với khoảng cách 2-3 giây, tối đa 10 lần.

<Endpoint>
  <Method>GET</Method>

  <Path>https://einvoice-api.sepay.vn/v1/invoices/create/check/{tracking_code}</Path>

  <Description>
    Theo dõi trạng thái xuất hóa đơn
  </Description>

  <Authentication>
    bearerAuth
  </Authentication>
</Endpoint>

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
      --url https://einvoice-api.sepay.vn/v1/invoices/create/check/084e179d-d95a-11f0-aef4-52c7e9b4f41b \
      --header 'Authorization: Bearer REPLACE_BEARER_TOKEN'
    ```
  </CodeSample>

  <CodeSample value="php_curl" lang="php">
    ```php
    <?php
    
    $curl = curl_init();
    
    curl_setopt_array($curl, [
      CURLOPT_URL => "https://einvoice-api.sepay.vn/v1/invoices/create/check/084e179d-d95a-11f0-aef4-52c7e9b4f41b",
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
    
    conn.request("GET", "/v1/invoices/create/check/084e179d-d95a-11f0-aef4-52c7e9b4f41b", headers=headers)
    
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
      "path": "/v1/invoices/create/check/084e179d-d95a-11f0-aef4-52c7e9b4f41b",
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
      .url("https://einvoice-api.sepay.vn/v1/invoices/create/check/084e179d-d95a-11f0-aef4-52c7e9b4f41b")
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
    
    url = URI("https://einvoice-api.sepay.vn/v1/invoices/create/check/084e179d-d95a-11f0-aef4-52c7e9b4f41b")
    
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
    
    	url := "https://einvoice-api.sepay.vn/v1/invoices/create/check/084e179d-d95a-11f0-aef4-52c7e9b4f41b"
    
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
        RequestUri = new Uri("https://einvoice-api.sepay.vn/v1/invoices/create/check/084e179d-d95a-11f0-aef4-52c7e9b4f41b"),
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
    
    let request = NSMutableURLRequest(url: NSURL(string: "https://einvoice-api.sepay.vn/v1/invoices/create/check/084e179d-d95a-11f0-aef4-52c7e9b4f41b")! as URL,
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
      .url("https://einvoice-api.sepay.vn/v1/invoices/create/check/084e179d-d95a-11f0-aef4-52c7e9b4f41b")
      .get()
      .addHeader("Authorization", "Bearer REPLACE_BEARER_TOKEN")
      .build()
    
    val response = client.newCall(request).execute()
    ```
  </CodeSample>

</CodeSamples>

<Responses>
  <Response status="200">
    <Description>
      Trạng thái xử lý
    </Description>

    <Example>
      {
        "success": true,
        "data": {
          "reference_code": "084e179d-d95a-11f0-aef4-52c7e9b4f41b",
          "status": "Success",
          "message": "Xuất hóa đơn điện tử thành công",
          "invoice": {
            "reference_code": "084e179d-d95a-11f0-aef4-52c7e9b4f41b",
            "invoice_number": "0",
            "issued_date": "2025-12-15",
            "pdf_url": "https://beta-portalv2.mifi.vn/DownloadPDFCA.aspx?kk=1434747710&keyinv=...",
            "xml_url": null,
            "status": "draft",
            "buyer": {
              "name": "Công ty ABC",
              "tax_code": "0101234567",
              "address": "123 Đường A, Quận B, Hà Nội",
              "email": "buyer@example.com",
              "phone": "0900000000"
            },
            "total_before_tax": 200000,
            "tax_amount": 20000,
            "total_amount": 220000,
            "notes": "Ghi chú hóa đơn",
            "source": "api"
          }
        }
      }
    </Example>
  </Response>

</Responses>

<Callout type="warning" title="Xử lý trạng thái Failed">
Nếu 
`status`
 trả về 
`"Failed"`
, kiểm tra trường 
`message`
 để biết nguyên nhân cụ thể (sai thông tin người mua, ký hiệu hóa đơn không hợp lệ, hết hạn mức...). Sau khi sửa dữ liệu, gọi lại 
API Xuất hóa đơn
 để tạo hóa đơn mới.
</Callout>

***

## Bước tiếp theo

Sau khi phát hành hóa đơn thành công:

1. **[Xác thực Bearer Token](/vi/einvoice-api/v1/tao-token)** — Chi tiết về xác thực và quản lý token
2. **[Danh sách nhà cung cấp](/vi/einvoice-api/v1/danh-sach-tai-khoan)** — Xem và chọn tài khoản nhà cung cấp
3. **[Chi tiết nhà cung cấp](/vi/einvoice-api/v1/chi-tiet-tai-khoan)** — Lấy cấu hình mẫu và ký hiệu hóa đơn
4. **[Xuất hóa đơn điện tử](/vi/einvoice-api/v1/xuat-hoa-don-dien-tu)** — Tham số đầy đủ khi tạo hóa đơn
5. **[Trạng thái xuất hóa đơn](/vi/einvoice-api/v1/theo-doi-trang-thai-xuat-hoa-don)** — Chi tiết về polling trạng thái
6. **[Phát hành hóa đơn từ nháp](/vi/einvoice-api/v1/phat-hanh-hoa-don-dien-tu)** — Luồng tạo nháp rồi phát hành
7. **[Chi tiết hóa đơn](/vi/einvoice-api/v1/chi-tiet-hoa-don)** — Lấy thông tin hóa đơn sau phát hành
8. **[Tải hóa đơn](/vi/einvoice-api/v1/tai-hoa-don)** — Tải file PDF/XML của hóa đơn
9. **[Kiểm tra hạn mức](/vi/einvoice-api/v1/kiem-tra-han-ngach)** — Theo dõi số lượt phát hành còn lại
