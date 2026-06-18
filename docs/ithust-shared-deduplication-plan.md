# ITHust Shared Deduplication Plan

## Context

The backend contains eight microservices plus the separately versioned package
`server/ithust-shared`. The services already depend on
`@19010853/ithust-shared`, but several infrastructure patterns were duplicated
inside each service.

This plan moves repeatable plumbing into shared helpers while keeping domain
logic inside each service. The first implementation is compatibility-preserving:
service exports such as `createConnection`, `publishDirectMessage`,
`checkConnection`, and `databaseConnection` keep their existing names.

## Audit Findings

- RabbitMQ connection setup was duplicated across notification, auth, users,
  gig, chat, order, and review services.
- RabbitMQ direct/fanout publish helpers repeated the same channel fallback,
  exchange assertion, publish, and logging flow.
- Elasticsearch client creation, health retry, index creation, and index CRUD
  were duplicated across gateway and service backends.
- Mongoose connection logic was duplicated in users, gig, chat, and order.
- Redis client creation and "open before use" checks were duplicated in gateway
  and gig.
- Health handlers and `gatewaytoken` to `gatewayToken` normalization repeated
  across service routes.
- Config files repeated `.env` loading, APM startup, Cloudinary setup, CSV
  parsing, and inline comment stripping.

## Shared API Added

New modules in `server/ithust-shared/src`:

- `queues.ts`
  - `createRabbitMQConnection`
  - `publishDirectMessage`
  - `publishFanoutMessage`
  - `consumeQueueMessage`
- `elasticsearch.ts`
  - `createElasticSearchClient`
  - `checkElasticSearchConnection`
  - `createIndexIfMissing`
  - `getIndexedDocument`
  - `getDocumentCount`
  - `addIndexedDocument`
  - `updateIndexedDocument`
  - `deleteIndexedDocument`
- `database.ts`
  - `connectMongooseDatabase`
- `redis.ts`
  - `createRedisConnection`
  - `ensureRedisClientOpen`
  - `connectRedisClient`
- `express-middleware.ts`
  - `normalizeGatewayTokenHeader`
  - `attachCurrentUser`
  - `createHealthHandler`
  - `createServiceErrorHandler`
- `config-helpers.ts`
  - `loadEnv`
  - `startElasticApm`
  - `configureCloudinary`
  - `stripInlineComment`
  - `parseCsv`

All helpers are exported from `server/ithust-shared/src/index.ts`.

## Migration Order

1. Update `server/ithust-shared` first.
   - Add helper modules.
   - Export helper APIs from `src/index.ts`.
   - Bump the package to `0.1.0`.
   - Regenerate `package-lock.json`.
   - Build the package.

2. Migrate service wrappers without changing domain behavior.
   - Queue connection files call `createRabbitMQConnection`.
   - Producer files call shared direct/fanout publish helpers.
   - Elasticsearch files call shared client, health, and index helpers.
   - Mongoose services call `connectMongooseDatabase`.
   - Redis files call shared client/open helpers.
   - Routes use `normalizeGatewayTokenHeader`.
   - Health controllers/routes use `createHealthHandler`.
   - Internal servers use `attachCurrentUser` and `createServiceErrorHandler`.
   - Config files use `loadEnv`, `startElasticApm`, `configureCloudinary`,
     `stripInlineComment`, and `parseCsv`.

3. Keep the following service-specific:
   - Email template selection and transport behavior.
   - Order, refund, review, gig, seller, buyer, and admin business logic.
   - SePay webhook validation and payment state transitions.
   - PostgreSQL table creation in review service.
   - MySQL/Sequelize setup in auth service.
   - Socket.IO setup and gateway proxy behavior.

## Version And Publish Steps

Run from `server/ithust-shared`:

```bash
npm install
npm run build
npm publish
```

Expected shared package changes:

- `package.json` version is `0.1.0`.
- `package-lock.json` root package version is `0.1.0`.
- New runtime dependencies include `amqplib`, `redis`, `dotenv`, and
  `elastic-apm-node`.
- New type/dev dependencies include `@types/amqplib` and `@types/node`.

After publish, run this in each service folder:

```bash
npm install @19010853/ithust-shared@0.1.0
npm run build
```

Services to update:

- `server/1-gateway-service`
- `server/2-notification-service`
- `server/3-auth-service`
- `server/4-users-service`
- `server/5-gig-service`
- `server/6-chat-service`
- `server/7-order-service`
- `server/8-review-service`

The root `.gitignore` should use slash-safe syntax for the nested shared repo:

```gitignore
server/ithust-shared/
```

This avoids ripgrep parse errors from a Windows backslash pattern.

## Verification Checklist

- Build shared: `npm run build` in `server/ithust-shared`.
- Confirm shared lockfile version:
  `node -e "const p=require('./package-lock.json'); console.log(p.version, p.packages[''].version)"`.
- Build each service with `npm run build`.
- Run focused tests where available:
  - notification helper/email consumer tests
  - gateway restriction/auth controller tests
  - users seller/withdrawal tests
  - gig/order/review create tests
- Smoke test health endpoints:
  - `/auth-health`
  - `/notification-health`
  - `/users-health`
  - `/gig-health`
  - `/api/v1/message/chat-health`
  - `/order-health`
  - `/review-health`
  - gateway health route
- Smoke test protected routes still accept both `gatewaytoken` and
  `gatewayToken`.

## Notes

- `server/ithust-shared` is a nested Git repository with its own remote:
  `git@github.com:19010853/ithust-shared.git`.
- Root repo service package locks can only resolve `@19010853/ithust-shared@0.1.0`
  from GitHub Packages after `npm publish` succeeds.
- If publishing is not available in the current shell, keep the service code
  changes but defer service lockfile updates until the package is published.
