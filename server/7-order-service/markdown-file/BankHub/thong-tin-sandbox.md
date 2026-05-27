# Tài khoản test Sandbox

## Danh sách tài khoản ngân hàng mẫu cho môi trường Sandbox SePay Bank Hub. Mô phỏng luồng liên kết, hủy liên kết và giao dịch an toàn trước khi go-live.

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

<Callout type="info" title="Môi trường Sandbox">
Tài liệu này cung cấp thông tin tài khoản mẫu để merchant test Bank Hub trong môi trường 
sandbox
. Tất cả dữ liệu đều là dữ liệu giả lập và không ảnh hưởng đến hệ thống thực tế.
</Callout>

## Thông tin chung cho môi trường Sandbox

<Node title="client_id">
```js
your_client_id
```
</Node>

<Node title="client_secret">
```js
your_client_secret
```
</Node>

<Callout type="tip">
Nếu bạn muốn có thông tin 
`client_id`
 và 
`client_secret`
 riêng hãy liên hệ SePay bằng cách click vào liên hệ ngay bên dưới để được hỗ trợ.
</Callout>

<ButtonLink href="https://sepay.vn/lien-he.html" target="_blank" variant="primary">Liên hệ ngay</ButtonLink>

## Danh sách tài khoản Sandbox

Dưới đây là danh sách tài khoản mẫu cho các ngân hàng được hỗ trợ. Bạn có thể sử dụng các tài khoản này để test flow liên kết và hủy liên kết tài khoản ngân hàng.

<SandboxAccounts
  banks={[
{
  bankCode: "MBBank",
  bankName: "MBBank",
  sections: [
    {
      type: "personal",
      accounts: [
        {
          accountNumber: "0123456789",
          accountName: "NGUYEN VAN A",
          idNumber: "001234567890",
          phoneNumber: "0000000001",
          otp: "12345678"
        },
        {
          accountNumber: "9876543210",
          accountName: "TRAN THI B",
          idNumber: "009876543210",
          phoneNumber: "0000000002",
          otp: "87654321"
        },
        {
          accountNumber: "1111222233",
          accountName: "LE VAN C",
          idNumber: "001111222233",
          phoneNumber: "0000000003",
          otp: "11112222"
        }
      ]
    },
    {
      type: "business",
      accounts: [
        {
          accountNumber: "5555666677",
          accountName: "CONG TY TNHH ABC",
          idNumber: "0123456789",
          phoneNumber: "0000000004",
          otp: "55556666"
        },
        {
          accountNumber: "8888999900",
          accountName: "CONG TY CP XYZ",
          idNumber: "9876543210",
          phoneNumber: "0000000005",
          otp: "88889999"
        },
        {
          accountNumber: "4444555566",
          accountName: "CONG TY TNHH DEF",
          idNumber: "4444555566",
          phoneNumber: "0000000006",
          otp: "44445555"
        }
      ]
    }
  ]
},
{
  bankCode: "ACB",
  bankName: "ACB",
  sections: [
    {
      type: "personal",
      accounts: [
        {
          accountNumber: "4567890123",
          accountName: "BUI VAN G",
          idNumber: "045678901234",
          phoneNumber: "0000000007",
          otp: "456789"
        },
        {
          accountNumber: "5678901234",
          accountName: "TRUONG THI H",
          idNumber: "056789012345",
          phoneNumber: "0000000008",
          otp: "567890"
        },
        {
          accountNumber: "6789012345",
          accountName: "VO VAN I",
          idNumber: "067890123456",
          phoneNumber: "0000000009",
          otp: "678901"
        }
      ]
    },
    {
      type: "business",
      accounts: [
        {
          accountNumber: "1111333344",
          accountName: "CONG TY TNHH PQR",
          idNumber: "1111333344",
          phoneNumber: "0000000010",
          otp: "111133"
        },
        {
          accountNumber: "2222444455",
          accountName: "CONG TY CP STU",
          idNumber: "2222444455",
          phoneNumber: "0000000011",
          otp: "222244"
        },
        {
          accountNumber: "3333555566",
          accountName: "CONG TY TNHH VWX",
          idNumber: "3333555566",
          phoneNumber: "0000000012",
          otp: "333355"
        }
      ]
    }
  ]
},
{
  bankCode: "BIDV",
  bankName: "BIDV",
  sections: [
    {
      type: "personal",
      accounts: [
        {
          accountNumber: "7890123456",
          accountName: "DO VAN J",
          idNumber: "078901234567",
          phoneNumber: "0000000013",
          otp: "789012"
        },
        {
          accountNumber: "8901234567",
          accountName: "PHAN THI K",
          idNumber: "089012345678",
          phoneNumber: "0000000014",
          otp: "890123"
        },
        {
          accountNumber: "9012345678",
          accountName: "LUU VAN L",
          idNumber: "090123456789",
          phoneNumber: "0000000015",
          otp: "901234"
        }
      ]
    },
    {
      type: "business",
      accounts: [
        {
          accountNumber: "4444666677",
          accountName: "CONG TY TNHH YZ",
          idNumber: "4444666677",
          phoneNumber: "0000000016",
          otp: "444466"
        },
        {
          accountNumber: "5555777788",
          accountName: "CONG TY CP ABC TECH",
          idNumber: "5555777788",
          phoneNumber: "0000000017",
          otp: "555577"
        },
        {
          accountNumber: "6666888899",
          accountName: "CONG TY TNHH DEF SOLUTION",
          idNumber: "6666888899",
          phoneNumber: "0000000018",
          otp: "666688"
        }
      ]
    }
  ]
},
{
  bankCode: "VietinBank",
  bankName: "VietinBank",
  sections: [
    {
      type: "personal",
      accounts: [
        {
          accountNumber: "0011223344",
          accountName: "NGUYEN VAN M",
          idNumber: "001122334455",
          phoneNumber: "0000000019",
          otp: "001122"
        },
        {
          accountNumber: "1122334455",
          accountName: "TRAN THI N",
          idNumber: "011223344556",
          phoneNumber: "0000000020",
          otp: "112233"
        },
        {
          accountNumber: "2233445566",
          accountName: "LE VAN O",
          idNumber: "022334455667",
          phoneNumber: "0000000021",
          otp: "223344"
        }
      ]
    },
    {
      type: "business",
      accounts: [
        {
          accountNumber: "7777999900",
          accountName: "CONG TY TNHH GHI TRADING",
          idNumber: "7777999900",
          phoneNumber: "0000000022",
          otp: "777799"
        },
        {
          accountNumber: "8888000011",
          accountName: "CONG TY CP JKL GROUP",
          idNumber: "8888000011",
          phoneNumber: "0000000023",
          otp: "888800"
        },
        {
          accountNumber: "9999111122",
          accountName: "CONG TY TNHH MNO EXPORT",
          idNumber: "9999111122",
          phoneNumber: "0000000024",
          otp: "999911"
        }
      ]
    }
  ]
},
{
  bankCode: "OCB",
  bankName: "OCB",
  sections: [
    {
      type: "personal",
      accounts: [
        {
          accountNumber: "9900112233",
          accountName: "DO VAN V",
          idNumber: "099001122334",
          phoneNumber: "0000000025",
          otp: "990011"
        },
        {
          accountNumber: "0011223355",
          accountName: "PHAN THI W",
          idNumber: "001122335566",
          phoneNumber: "0000000026",
          otp: "001122"
        },
        {
          accountNumber: "1122334466",
          accountName: "LUU VAN X",
          idNumber: "011223344667",
          phoneNumber: "0000000027",
          otp: "112233"
        }
      ]
    },
    {
      type: "business",
      accounts: [
        {
          accountNumber: "7777000011",
          accountName: "CONG TY TNHH GHI CONSULTING",
          idNumber: "7777000011",
          phoneNumber: "0000000028",
          otp: "777700"
        },
        {
          accountNumber: "8888111122",
          accountName: "CONG TY CP JKL FINANCE",
          idNumber: "8888111122",
          phoneNumber: "0000000029",
          otp: "888811"
        },
        {
          accountNumber: "9999222233",
          accountName: "CONG TY TNHH MNO INVESTMENT",
          idNumber: "9999222233",
          phoneNumber: "0000000030",
          otp: "999922"
        }
      ]
    }
  ]
},
{
  bankCode: "KienLongBank",
  bankName: "Kiên Long Bank",
  sections: [
    {
      type: "personal",
      accounts: [
        {
          accountNumber: "2233445577",
          accountName: "NGUYEN VAN Y",
          idNumber: "022334455778",
          phoneNumber: "0000000031",
          otp: "223344"
        },
        {
          accountNumber: "3344556688",
          accountName: "TRAN THI Z",
          idNumber: "033445566889",
          phoneNumber: "0000000032",
          otp: "334455"
        },
        {
          accountNumber: "4455667799",
          accountName: "LE VAN AA",
          idNumber: "044556677990",
          phoneNumber: "0000000033",
          otp: "445566"
        }
      ]
    },
    {
      type: "business",
      accounts: [
        {
          accountNumber: "1111222244",
          accountName: "CONG TY TNHH PQR MANUFACTURING",
          idNumber: "1111222244",
          phoneNumber: "0000000034",
          otp: "111122"
        },
        {
          accountNumber: "2222333355",
          accountName: "CONG TY CP STU CONSTRUCTION",
          idNumber: "2222333355",
          phoneNumber: "0000000035",
          otp: "222233"
        },
        {
          accountNumber: "3333444466",
          accountName: "CONG TY TNHH VWX SERVICES",
          idNumber: "3333444466",
          phoneNumber: "0000000036",
          otp: "333344"
        }
      ]
    }
  ]
}
]}
/>

<Callout type="warning" title="Lưu ý quan trọng">
Chỉ sử dụng trong môi trường sandbox
: Tất cả tài khoản trên chỉ hoạt động trong môi trường test.
Dữ liệu giả lập
: Thông tin CMND/CCCD, số điện thoại, OTP đều là dữ liệu giả lập.
OTP cố định
: Mã OTP được cung cấp sẵn cho mỗi tài khoản và không thay đổi.
Không giới hạn số lần test
: Bạn có thể test liên kết/hủy liên kết không giới hạn số lần.
</Callout>

## Hướng dẫn sử dụng

1. **Chọn ngân hàng**: Chọn bất kỳ ngân hàng nào trong danh sách trên.
2. **Chọn loại tài khoản**: Chọn tài khoản cá nhân hoặc doanh nghiệp tùy theo nhu cầu test.
3. **Nhập thông tin**: Sử dụng các thông tin được cung cấp (số tài khoản, CMND/CCCD, số điện thoại).
4. **Nhập OTP**: Khi được yêu cầu nhập OTP, sử dụng mã OTP được cung cấp trong bảng.

<Callout type="info" title="Copy nhanh">
Bạn có thể click vào icon copy bên cạnh mỗi thông tin để copy nhanh vào clipboard.
</Callout>

***

## Bước tiếp theo

Sau khi có thông tin tài khoản sandbox, bạn có thể:

1. **[Bắt đầu nhanh](/vi/bankhub/bat-dau-nhanh)** - Thực hiện tích hợp Bank Hub với tài khoản test
2. **[Tạo Link Token](/vi/bankhub/api/link-token/tao-link-token)** - Tạo link token để bắt đầu luồng liên kết
3. **[SDK JavaScript](/vi/bankhub/sdk)** - Tích hợp SDK để mở Hosted Link

<Callout type="info" title="Gợi ý">
Sử dụng tài khoản sandbox ở trên để test luồng liên kết tài khoản ngân hàng trước khi chuyển sang môi trường Production.
</Callout>
