## Freelance Marketplace Application
* This application is built using these main tools
  * `Vite`
  * `React`
  * `Typescript`
  * `Tailwindcss`
  * `Redux Toolkit`
  * `RTK Query`
  * `SePay/VietQR`
  * `Elasticsearch`
  * `Axios`
  * `React Router DOM`
  * `React Redux`
  * `React Quill`
  * `SocketIO Client`
  * `ESlint and Prettier`
* There are other tools and packages used.
* You can update the version of `NodeJS` used inside the `Dockerfile`
* Copy contents of `.env.dev` to `.env` file.
* Payment is handled by the backend through SePay/VietQR. The frontend only needs `VITE_BASE_ENDPOINT` and `VITE_CLIENT_ENDPOINT`.

### Create docker images
* You can create your own docker image from this microservice.
* Create an account on `hub.docker.com` or login if you already have one.
* Make sure to login on your terminal as well.
* Steps to build and push your image to docker hub
  * `docker build -t <your-dockerhub-username>/ithust-frontend .`
  * `docker tag <your-dockerhub-username>/ithust-frontend <your-dockerhub-username>/ithust-frontend:stable`
  * `docker push <your-dockerhub-username>/ithust-frontend:stable`
