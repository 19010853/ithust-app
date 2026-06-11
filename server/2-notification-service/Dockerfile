FROM node:22-alpine3.18 AS builder

ARG NPM_TOKEN

WORKDIR /app
COPY package*.json ./
COPY tsconfig.json ./
RUN set -eux; \
    if [ -n "${NPM_TOKEN:-}" ]; then \
      printf '@19010853:registry=https://npm.pkg.github.com\n//npm.pkg.github.com/:_authToken=%s\n' "${NPM_TOKEN}" > .npmrc; \
    fi; \
    npm ci --legacy-peer-deps; \
    rm -f .npmrc
COPY src ./src
COPY tools ./tools
RUN npm run build

FROM node:22-alpine3.18

ARG NPM_TOKEN

WORKDIR /app
RUN apk add --no-cache curl
COPY package*.json ./
RUN set -eux; \
    if [ -n "${NPM_TOKEN:-}" ]; then \
      printf '@19010853:registry=https://npm.pkg.github.com\n//npm.pkg.github.com/:_authToken=%s\n' "${NPM_TOKEN}" > .npmrc; \
    fi; \
    npm ci --omit=dev --legacy-peer-deps; \
    npm cache clean --force; \
    rm -f .npmrc
COPY --from=builder /app/build ./build

EXPOSE 4001

CMD ["npm", "run", "start"]
