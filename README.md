# PulseCheck - Uptime Monitor

PulseCheck is a lightweight uptime monitoring service built as a robust DevOps resume project. It simulates real-world distributed architectures while maintaining a minimal resource footprint making it perfect for cheap EC2/VPS deployments.

## Architecture

* **Frontend**: React Single Page Application served via NGINX (Multi-stage Docker build).
* **Backend**: Node.js & Express REST API handling status checks.
* **Worker System**: Periodical service pings via Redis + BullMQ, tracking response latencies.
* **Persistence**: PostgreSQL Database tracking historical uptime events.
* **Observability**: Exposes a `/metrics` Prometheus endpoint mapping Node.js telemetry and Redis cache performance.
* **CI/CD**: Advanced `Jenkinsfile` for distributed building, testing, container creation, and deployment.

## Running Locally

Requires Docker and Docker Compose.

```bash
docker-compose up -d --build
```
1. Frontend will be accessible on `http://localhost:8000`
2. Backend API runs on `http://localhost:3000`
3. Prometheus metrics exported at `http://localhost:3000/metrics`

## Monitoring a Service

To trigger the monitor to start pinging a URL every 10 seconds:
```bash
curl -X POST http://localhost:3000/api/monitor \
     -H "Content-Type: application/json" \
     -d '{"url":"https://google.com"}'
```

The React frontend will immediately begin reflecting the service's UP/DOWN lifecycle status.
