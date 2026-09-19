# Technical Dashboard

A high-concurrency Technical Dashboard project featuring an Express backend, simulation engine, and system monitoring layers, utilizing Docker for localized infrastructure management.

## 📁 Repository Structure

```text
├── backend/            # Express + TypeScript API Engine
│   ├── prisma/         # Database migrations, contracts, and seed execution logic
│   └── src/
│       ├── config/     # Centralized database and caching pool connections
│       ├── utils/      # In-memory pre-warm cache layer scripts
│       └── workers/    # Asynchronous background transaction worker pipelines
├── frontend/           # UI client application
├── simulations/        # Simulation data engines (k6 load testing)
├── docker-compose.yml  # Local Postgres & Redis instances
└── package.json        # Global workspace config (pnpm)
```

## 🛠️ Tech Stack & Prerequisites

- **Runtime & Package Manager:** Node.js, `pnpm`
- **Backend Framework:** Express, TypeScript
- **Infrastructure:** Docker, Docker Compose
- **Databases & ORM:** PostgreSQL, Redis, Prisma 7 (with native Driver Adapters)
- **Telemetry & Load Testing:** Grafana `k6` Performance Suites

## 🏗️ Implemented Architecture: High-Concurrency Flash Sale

To protect the system under structural loads, the backend implements an **asynchronous gateway reservation pattern**:

1. **Cache Pre-Warming:** Master inventory levels are pulled from PostgreSQL and cached atomically in Redis memory before transactions activate.
2. **Atomic Memory Reservation:** Incoming endpoint loads are processed sequentially using Redis memory operations (`DECR`) in `<2ms`. Excess traffic is safely deflected at the gateway with zero write amplification to the database.
3. **Asynchronous Processing Message Queue:** Successful ticket reservations are instantly pushed to a Redis FIFO Queue, returning immediate confirmations to clients to avoid connection locking.
4. **Resilient Background Workers:** Dedicated system process threads pull from the queue, execute simulated payment channels, persist approvals into PostgreSQL via Prisma, and automatically fire **atomic inventory rollbacks (`INCR`)** if transactions fail.

## 🚀 Getting Started

### 1. Clone and Install Dependencies

```bash
git clone <your-repository-url>
cd technical-dashboard
pnpm install
```

### 2. Spin up Infrastructure (Databases)

Ensure Docker Desktop is running, then start the PostgreSQL and Redis containers:

```bash
docker-compose up -d
```

### 3. Environment Setup

Navigate to the backend directory, ensure your `.env` file is configured:

```bash
cd backend
# Create your .env file and specify the system bounds:
PORT=3000
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/tech_dashboard?schema=public"
REDIS_URL="redis://localhost:6379"
```

### 4. Database Initialization & Data Seeding

Compile the database contractual schemas and seed the primary inventory records:

```bash
pnpm exec prisma migrate dev --name init_ecom_schema
pnpm exec prisma db seed
```

### 5. Run the Core Platform Engines

Boot up the main application API server and the async background execution worker inside separate terminal processes:

**Terminal 1 (Express API Server):**

```bash
pnpm dev
```

**Terminal 2 (Asynchronous Order Worker Pipeline):**

```bash
pnpm exec tsx src/workers/orderWorker.ts
```

### 6. Execute Concurrency Load Simulations

To stress test the system under load, navigate to the simulation space and trigger the telemetry attack suite:

```bash
cd ../simulations
# Sets environment telemetry variables and launches real-time browser graphs
set K6_WEB_DASHBOARD=true&& k6 run load-test.js
```

_Open `http://localhost:5665` in your browser window to monitor performance metrics dynamically._
