# Audit Loop Monorepo

This monorepo implements a thin slice of Audit Loop:

- **Events API**: HTTP endpoint for activity events (apps/api)
- **Queue**: Local SQS-compatible queue (LocalStack, packages/sqs)
- **Processor + Storage**: Worker for metrics and DB (apps/worker, packages/db, packages/metrics)
- **Dashboard**: Live-updating web UI (apps/dashboard)
- **Budget Alarm**: Slack webhook alert if spend > $10/hr

## Quick Start (Docker Compose)

1. **Build and start all services:**

   ```sh
   docker-compose up --build -d
   ```

2. **Initialize the database and SQS queue:**

   ```sh
   ./scripts/setup-docker.sh
   ```

3. **Access your services:**
   - Dashboard: [http://localhost:5220](http://localhost:5220)
   - API: [http://localhost:8009](http://localhost:8009)
   - PgAdmin: [http://localhost:8080](http://localhost:8080) (user: <admin@admin.com>, pass: admin)
   - LocalStack: [http://localhost:4566](http://localhost:4566)

## Local Development (without Docker Compose)

1. Install dependencies:

   ```sh
   npm install
   ```

2. Start supporting services (Postgres, LocalStack) via Docker Compose:

   ```sh
   docker-compose up -d postgres localstack pgadmin
   ```

3. Start each app locally (in separate terminals):

   ```sh
   npm run dev -w apps/api
   npm run dev -w apps/worker
   npm run dev -w apps/dashboard
   ```

4. Run migrations and create the SQS queue:

   ```sh
   ./scripts/setup-docker.sh
   ```

## Structure

- `apps/api` - Express API for events
- `apps/worker` - SQS processor, metrics, budget alarm
- `apps/dashboard` - React UI
- `packages/db` - DB connection
- `packages/sqs` - SQS client
- `packages/metrics` - Metrics logic

## Notes

- All services are orchestrated via Docker Compose for easy local development.
- The setup script runs DB migrations and creates the SQS queue in LocalStack.
- The dashboard and API are hot-reloading in dev mode via `tsx` and Vite.
- For production, you can adapt the Dockerfiles to use a build step and run the compiled JS.
