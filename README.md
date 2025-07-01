# Audit Loop Monorepo

This monorepo implements a thin slice of Audit Loop:

- **Events API**: HTTP endpoint for activity events (apps/api)
- **Queue**: Local SQS-compatible queue (LocalStack, packages/sqs)
- **Processor + Storage**: Worker for metrics and DB (apps/worker, packages/db, packages/metrics)
- **Dashboard**: Live-updating web UI (apps/dashboard)
- **Budget Alarm**: Slack webhook alert if spend > $10/hr

---

## How it looks

<img width="1630" alt="Screenshot 2025-07-02 at 00 14 50" src="https://github.com/user-attachments/assets/6e4fc934-aebf-4d67-bb06-48157be7b0ed" />

### Features implemented

- Workspace selector and workspace info
- Fire test events to SQS
- Live metrics (latency, spend) with real-time updates via WebSocket
- Prometheus metrics endpoint
- Slack alert if spend > $10/hr
- Placeholder UI for empty states
- Error and toast notifications
- All services run locally via Docker Compose

---

## Quick Start (Docker Compose)

1. **Copy and edit your environment variables:**

   ```sh
   cp .env.example .env
   # Edit .env as needed
   ```

2. **Build and start all services:**

   ```sh
   docker-compose up --build -d
   ```

3. **Initialize the database and SQS queue:**

   ```sh
   ./scripts/setup-docker.sh
   ```

4. **Access your services:**
   - Dashboard: [http://localhost:5220](http://localhost:5220)
   - API: [http://localhost:8009](http://localhost:8009)
   - PgAdmin: [http://localhost:8080](http://localhost:8080) (user: admin@admin.com, pass: admin)
   - LocalStack: [http://localhost:4566](http://localhost:4566)

---

## Local Development (without Docker Compose)

1. Install dependencies:
   ```sh
   npm install
   ```
2. Start supporting services (Postgres, LocalStack, PgAdmin) via Docker Compose:
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

---

## Environment Variables

- All environment variables are loaded from `.env` in the project root.
- See `.env.example` for all required variables and example values.
- Docker Compose will use your local `.env` if present.

---

## Adding the Postgres server to PgAdmin

1. Go to [http://localhost:8080](http://localhost:8080) and log in (user: `admin@admin.com`, pass: `admin`).
2. Click "Add New Server".
3. In the "General" tab, set **Name**: `audit`
4. In the "Connection" tab:
   - **Host**: `postgres`
   - **Port**: `5432`
   - **Username**: `audit`
   - **Password**: `audit`
   - **Database**: `audit`
5. Save. You should now see the `audit` database and tables.

---

## Structure

- `apps/api` - Express API for events
- `apps/worker` - SQS processor, metrics, budget alarm
- `apps/dashboard` - React UI
- `packages/db` - DB connection
- `packages/sqs` - SQS client
- `packages/metrics` - Metrics logic

---

## Notes

- All services are orchestrated via Docker Compose for easy local development.
- The setup script runs DB migrations and creates the SQS queue in LocalStack.
- The dashboard and API are hot-reloading in dev mode via `tsx` and Vite.
- For production, you can adapt the Dockerfiles to use a build step and run the compiled JS.
