# DevOps Intro Practice App

Small frontend project for practicing CI/CD, Docker, Docker Compose, and Jenkins without heavy assets.

## What this app includes

- Lightweight Vite + Vanilla JavaScript frontend
- DevOps intro dashboard with tool cards and CI/CD flow
- Dockerfile for production-style static hosting with nginx
- docker-compose.yml for local container run
- Jenkinsfile with starter pipeline stages: Checkout, Install, Build, Docker Build

## Local development

```bash
npm install
npm run dev
```

Open the local URL shown by Vite (usually http://localhost:5173).

## Build app

```bash
npm run build
npm run preview
```

## Docker usage

Build image:

```bash
docker build -t devops-intro:local .
```

Run container:

```bash
docker run --rm -p 8080:80 devops-intro:local
```

Open http://localhost:8080

## Docker Compose usage

```bash
docker compose up --build
```

Stop compose:

```bash
docker compose down
```

## Jenkinsfile notes

- `npm ci` installs dependencies
- `npm run build` creates production assets
- `docker build` creates container image

When you are ready, you can add a deploy stage in Jenkins to run compose or push image to a registry.
