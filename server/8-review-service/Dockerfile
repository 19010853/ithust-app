FROM node:22-alpine3.18 as builder

# GitHub Packages — truyền từ CI: docker build --build-arg NPM_TOKEN=...
ARG NPM_TOKEN
ENV NPM_TOKEN=${NPM_TOKEN}

WORKDIR /app
COPY package*.json ./
COPY tsconfig.json ./
COPY .npmrc ./
COPY src ./src
RUN npm ci && \
    npm run build

FROM node:22-alpine3.18

ARG NPM_TOKEN
ENV NPM_TOKEN=${NPM_TOKEN}

WORKDIR /app
RUN apk add --no-cache curl
COPY package*.json ./
COPY .npmrc ./
RUN npm install -g pm2 && \
    npm ci --production && \
    npm cache clean --force && \
    rm -f .npmrc
COPY --from=builder /app/build ./build

EXPOSE 4007

CMD [ "npm", "run", "start" ]