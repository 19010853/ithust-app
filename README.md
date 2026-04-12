# IT HUST App - Microservices Backend

## Overview
IT HUST App is a comprehensive scalable microservices-based application backend. Designed for flexibility and high performance, the platform is structured into multiple independent services that communicate via robust APIs and message brokers.

## Services Architecture
The application backend is built using **Node.js** and **TypeScript**, consisting of the following microservices:
- **Gateway Service**: API Gateway, handles routing, rate limiting, and request forwarding.
- **Notification Service**: Centralized service for sending emails and platform notifications.
- **Auth Service**: Manages user authentication, registration, and JWT token issuing.
- **Users Service**: Handles user profiles, buyer/seller information.
- **Gig Service**: Manages services/gigs offered on the platform, including search via Elasticsearch.
- **Chat Service**: Real-time messaging between users powered by Socket.io.
- **Order Service**: Handles order processing, payments, and lifecycle management.
- **Review Service**: Manages user ratings and feedback for gigs.

## Tech Stack
- **Languages/Frameworks**: Node.js, Express.js, TypeScript
- **Caching & Real-time**: Redis, Socket.io
- **Search Engine**: Elasticsearch
- **Orchestration**: Kubernetes (AWS EKS & Minikube)
- **Containerization**: Docker
- **CI/CD**: Jenkins Pipeline
- **Monitoring/Observability**: Elastic APM, Beats (Heartbeat, Metricbeat)

## Directory Structure
- `/server`: Contains the source code for all the microservices.
- `/kubernetes`: Kubernetes manifesting files for `minikube` (local) and `AWS` (production).
- `/volumes`: Configurations and persistent volumes for infrastructure tools like Jenkins agent.
- `/apiCalls`: Postman or similar API collections for testing requests.

## Deployment Configuration
The project is designed to be fully cloud-native. It uses **Kubernetes** to manage containers. 
For CI/CD processes, the platform integrates with Jenkins to handle code building, Docker image generation, and automated deployments to the AWS cluster via rolling updates.

## License
ISC
