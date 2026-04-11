apiVersion: v1
kind: Secret
metadata:
  name: ithust-backend-secret
  namespace: production
type: Opaque
data:
  secret-key-one: MTE1MTc5YWZiYjI1ZDdlMDYwNzA1M2MyYTVhMDBkM2Q=
  secret-key-two: ZDhjMmEzOTgwMTVjNzUzNDQzMWFmYjc5ODYxN2NlOTQ=
  gateway-jwt-token: MTZjOGE2NmRmZDBhYjA4MTA0Nzg0MGUzYzA0YzUyMGU=
  jwt-token: ZTNhZTdmYmIwMGEzNjYzOGMwYThlZTM1ZTNhMDRhN2Y=
  ithust-redis-host: redis://ithust-redis-cluster.fmpttb.ng.0001.apse1.cache.amazonaws.com:6379
  sender-email: YnJhbm5vbi5rcmFqY2lrODdAZXRoZXJlYWwuZW1haWw=
  sender-email-password: M3VXaFlacWtXczIzblRUWGRI
  ithust-mysql-db: mysql://ithustadmin:ikAWS2004@ithust-auth-db.c3y6e8owqjwa.ap-southeast-1.rds.amazonaws.com/ithust_auth
  ithust-postgres-host: ithust-postgres.c3y6e8owqjwa.ap-southeast-1.rds.amazonaws.com
  ithust-postgres-user: 
  ithust-postgres-password: 
  cloud-name: ZGJ4YTFrMXcx
  cloud-api-key: OTczOTE3NTc0ODgxOTg3
  cloud-api-secret: SmU1LWFUalZ5SEppcXlXNDczNFZ5cWxReXhJ
  mongo-database-url: mongodb+srv://ithustadmin:ikMGDB2004%40@ithust.036owe0.mongodb.net/?appName=ithust
  stripe-api-key: c2tfdGVzdF81MVJQMFNZUjRhYTFqc1Bzb1NTTWdHQjBOZHNiOWp6TGdrUFdtSXFyVkMzSVI2bFlIdUFycjFoUE1CSlZBMFRBaE5Da1ZlZm5SeFV2OXJ2U2Yxc21KSUtubzAwY0xSNEN6QjA=
  stripe-client-key: c2tfdGVzdF81MVJQMFNZUjRhYTFqc1Bzb1NTTWdHQjBOZHNiOWp6TGdrUFdtSXFyVkMzSVI2bFlIdUFycjFoUE1CSlZBMFRBaE5Da1ZlZm5SeFV2OXJ2U2Yxc21KSUtubzAwY0xSNEN6QjA=
  ithust-rabbitmq-user: aXRodXN0
  ithust-rabbitmq-password: aXRodXN0cGFzcw==
  ithust-rabbitmq-endpoint: YW1xcDovL2l0aHVzdDppdGh1c3RwYXNzQGl0aHVzdC1xdWV1ZS5wcm9kdWN0aW9uLnN2Yy5jbHVzdGVyLmxvY2FsOjU2NzI=
  ithust-elasticsearch-url: https://elastic:TschHEv6xMhuZ0PWZs1li7LR@ithustapp-ee03f1.es.asia-southeast1.gcp.elastic-cloud.com
  ithust-elastic-apm-server-url: https://4bfb350658044d049d645ab4e5533060.apm.asia-southeast1.gcp.elastic-cloud.com:443
  ithust-elastic-apm-secret-token: vvsdPkL8JEJdBBcyRA
  ithust-elasticsearch-host: ithustapp-ee03f1.es.asia-southeast1.gcp.elastic-cloud.com
  ithust-elasticsearch-username: elastic
  ithust-elasticsearch-password: TschHEv6xMhuZ0PWZs1li7LR
  ithust-elastic-cloud-id: ithustapp:YXNpYS1zb3V0aGVhc3QxLmdjcC5lbGFzdGljLWNsb3VkLmNvbTo0NDMkYzEzMTkzMmFhNjhjNDg3ZWJlZmI4NDllNTY4MDRiMjgkODBkOWEzMDRlZjNkNGQ2N2ExZGQ4N2RmOTljYjEzYjQ=
  # <elasticsearch-username>:<elasticsearch-password>
  ithust-elastic-cloud-auth: elastic:TschHEv6xMhuZ0PWZs1li7LR