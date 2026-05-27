# API lấy chi tiết đơn hàng

## Lấy chi tiết đơn hàng qua API getOrderDetails của Cổng thanh toán SePay — trả về trạng thái, số tiền, khách hàng và lịch sử giao dịch.

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

  <Path>https://pgapi.sepay.vn/v1/order/detail/{order_id}</Path>

  <Description>
    Chi tiết đơn hàng
  </Description>

  <Authentication>
    basicAuth
  </Authentication>
</Endpoint>

## API Request

<Params>
  <PathParams>
    <Param name="order_id" type="string" required="true">
      ID đơn hàng cần truy vấn (Ví dụ SEPAY-68BA83CE637C1)
    </Param>
  </PathParams>

</Params>

## API Response

<Responses>
  <Response status="200">
    <Description>
      Chi tiết đơn hàng
    </Description>

    <Example>
      {
        "data": {
          "id": "1",
          "customer_id": null,
          "order_id": "SEPAY-68B01673A77FF",
          "order_invoice_number": "DH1756370479",
          "order_status": "CAPTURED",
          "order_amount": "300000.00",
          "order_currency": "VND",
          "order_description": "Đơn hàng #1756370479",
          "authentication_status": "AUTHENTICATION_SUCCESSFUL",
          "created_at": "2025-08-28 15:43:48",
          "updated_at": "2025-08-28 15:43:48",
          "transactions": [
            {
              "id": "1",
              "payment_method": "CARD",
              "transaction_type": "PAYMENT",
              "transaction_amount": "300000",
              "transaction_currency": "VND",
              "transaction_status": "APPROVED",
              "authentication_status": "AUTHENTICATION_SUCCESSFUL",
              "card_number": "512345xxxxxx0008",
              "card_holder_name": "NGO QUOC DAT",
              "card_expiry": "1230",
              "card_funding_method": "DEBIT",
              "card_brand": "MASTERCARD",
              "transaction_date": "2025-08-28 15:43:41",
              "transaction_last_updated_date": "2025-08-28 15:43:41"
            }
          ]
        }
      }
    </Example>
  </Response>

</Responses>

<ResponseDescriptionFields>
  <ResponseSchema status="200">
    <Fields>
      <Field name="data" type="object" required="false">
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
          <Field name="transactions" type="array" required="false">
            <Description>Danh sách giao dịch</Description>
            <ArrayItems>
              <Fields>
                <Field name="id" type="string" required="false">
                  ID giao dịch
                </Field>
                <Field name="payment_method" type="enum: CARD, BANK_TRANSFER, NAPAS_BANK_TRANSFER" required="false">
                  Phương thức thanh toán:
- CARD: Thẻ quốc tế
- BANK_TRANSFER: Chuyển khoản QR
- NAPAS_BANK_TRANSFER: Chuyển khoản NAPAS QR

                </Field>
                <Field name="transaction_type" type="enum: PAYMENT, REFUND, VOID" required="false">
                  Loại giao dịch:
- PAYMENT: Thanh toán
- REFUND: Hoàn tiền
- VOID: Hủy giao dịch

                </Field>
                <Field name="transaction_amount" type="string" required="false">
                  Số tiền giao dịch
                </Field>
                <Field name="transaction_currency" type="string" required="false">
                  Mã tiền tệ
                </Field>
                <Field name="transaction_status" type="enum: APPROVED, DECLINED, PENDING" required="false">
                  Trạng thái giao dịch:
- APPROVED: Đã duyệt
- DECLINED: Bị từ chối
- PENDING: Đang xử lý

                </Field>
                <Field name="authentication_status" type="string" required="false">
                  Trạng thái xác thực giao dịch
                </Field>
                <Field name="card_number" type="string" required="false">
                  Số thẻ đã mask
                </Field>
                <Field name="card_holder_name" type="string" required="false">
                  Tên chủ thẻ
                </Field>
                <Field name="card_expiry" type="string" required="false">
                  Hạn thẻ (MMYY)
                </Field>
                <Field name="card_funding_method" type="enum: DEBIT, CREDIT" required="false">
                  Loại thẻ:
- DEBIT: Thẻ ghi nợ
- CREDIT: Thẻ tín dụng

                </Field>
                <Field name="card_brand" type="enum: VISA, MASTERCARD, JCB" required="false">
                  Thương hiệu thẻ
                </Field>
                <Field name="transaction_date" type="string" required="false">
                  Thời gian giao dịch
                </Field>
                <Field name="transaction_last_updated_date" type="string" required="false">
                  Thời gian cập nhật cuối
                </Field>
              </Fields>
            </ArrayItems>
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
      --url https://pgapi.sepay.vn/v1/order/detail/SEPAY-68BA83CE637C1 \
      --header 'Authorization: Basic REPLACE_BASIC_AUTH'
    ```
  </CodeSample>

  <CodeSample value="php_curl" lang="php">
    ```php
    <?php
    
    $curl = curl_init();
    
    curl_setopt_array($curl, [
      CURLOPT_URL => "https://pgapi.sepay.vn/v1/order/detail/SEPAY-68BA83CE637C1",
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
    
    conn.request("GET", "/v1/order/detail/SEPAY-68BA83CE637C1", headers=headers)
    
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
      "path": "/v1/order/detail/SEPAY-68BA83CE637C1",
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
      .url("https://pgapi.sepay.vn/v1/order/detail/SEPAY-68BA83CE637C1")
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
    
    url = URI("https://pgapi.sepay.vn/v1/order/detail/SEPAY-68BA83CE637C1")
    
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
    
    	url := "https://pgapi.sepay.vn/v1/order/detail/SEPAY-68BA83CE637C1"
    
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
        RequestUri = new Uri("https://pgapi.sepay.vn/v1/order/detail/SEPAY-68BA83CE637C1"),
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
    
    let request = NSMutableURLRequest(url: NSURL(string: "https://pgapi.sepay.vn/v1/order/detail/SEPAY-68BA83CE637C1")! as URL,
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
      .url("https://pgapi.sepay.vn/v1/order/detail/SEPAY-68BA83CE637C1")
      .get()
      .addHeader("Authorization", "Basic REPLACE_BASIC_AUTH")
      .build()
    
    val response = client.newCall(request).execute()
    ```
  </CodeSample>

</CodeSamples>

## Ghi chú

<Callout type="tip" title="Định nghĩa trạng thái đơn hàng">
`CAPTURED: `
Đã thanh toán
`CANCELLED: `
Đã hủy
`AUTHENTICATION_NOT_NEEDED: `
Đang đợi thanh toán
</Callout>
