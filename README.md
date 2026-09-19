# Technical Dashboard

A Technical Dashboard project featuring an Express backend, frontend, and simulation Scripts, utilizing Docker for localized infrastructure management.

## 📁 Repository Structure
```text
├── backend/            # Express + TypeScript API
├── frontend/           # UI client application
├── simulations/        # Simulation data engines
├── docker-compose.yml  # Local Postgres & Redis instances
└── package.json        # Global workspace config (pnpm)
```

## 🛠️ Tech Stack & Prerequisites
* **Runtime & Package Manager:** Node.js, `pnpm`
* **Backend Framework:** Express, TypeScript
* **Infrastructure:** Docker, Docker Compose
* **Databases:** PostgreSQL, Redis

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
Navigate to the backend, ensure your `.env` file is configured:
```bash
cd backend
# Create your .env file and specify the PORT (Default: 3000)
```

### 4. Run the Development Server
```bash
pnpm dev
```
