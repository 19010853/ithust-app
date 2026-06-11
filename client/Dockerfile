FROM node:21-alpine3.18 as builder

WORKDIR /app
ARG VITE_NODE_ENV=production
ARG VITE_BASE_ENDPOINT=https://ithust.store
ARG VITE_CLIENT_ENDPOINT=https://ithust.shop
ARG VITE_ELASTIC_APM_SERVER=
ENV VITE_NODE_ENV=$VITE_NODE_ENV
ENV VITE_BASE_ENDPOINT=$VITE_BASE_ENDPOINT
ENV VITE_CLIENT_ENDPOINT=$VITE_CLIENT_ENDPOINT
ENV VITE_ELASTIC_APM_SERVER=$VITE_ELASTIC_APM_SERVER
COPY package*.json ./
COPY tsconfig*.json ./
RUN npm ci
COPY . .
# Bundle app source
RUN npm run build

FROM nginx:stable-alpine

WORKDIR /app
COPY --from=builder /app/build /app/html
COPY nginx.conf /app
RUN mkdir -p /app/run && apk add --no-cache bash && apk add --no-cache curl

EXPOSE 80

CMD ["nginx", "-c", "/app/nginx.conf"]
