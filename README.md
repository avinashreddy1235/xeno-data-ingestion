# Xeno FDE Internship Assignment - Ingestion Service

A multi-tenant Shopify Data Ingestion & Insights Service.

## Architecture

```mermaid
graph TD
    User[User] -->|Browser| Frontend[Next.js Dashboard]
    Frontend -->|HTTP API| Backend[Express.js Backend]
    Backend -->|Prisma ORM| DB[(PostgreSQL)]
    Backend -->|REST API| Shopify[Shopify Admin API]
```

**Tech Stack:**
- **Backend**: Node.js, Express, TypeScript, Prisma (ORM).
- **Frontend**: Next.js, React, TailwindCSS, Recharts.
- **Database**: PostgreSQL (Multi-tenant schema).

## Features
- **Data Ingestion**: Fetches Customers, Products, and Orders from Shopify.
- **Multi-tenancy**: Data isolated by `Tenant` model. Upserts handle data synchronization.
- **Insights Dashboard**: Visualizes Revenue, Order Trends, and Top Customers.

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- PostgreSQL Database

### 1. Database Setup
Ensure you have a PostgreSQL database running. Update `backend/.env` with your URL.
```env
DATABASE_URL="postgresql://user:password@localhost:5432/xeno_db"
```

### 2. Backend
```bash
cd backend
npm install
npx prisma migrate dev --name init # Apply schema
npm run dev
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```

### 4. Usage
1.  **Ingestion**: Call the API to ingest data from a store.
    ```bash
    curl -X POST http://localhost:4000/api/ingest \
      -H "Content-Type: application/json" \
      -d '{
        "shopUrl": "your-store.myshopify.com",
        "accessToken": "shpat_...",
        "name": "My Demo Store"
      }'
    ```
2.  **Dashboard**: Open `http://localhost:3000`.
3.  **Login**: Enter the Tenant ID returned by the ingestion API (or your Store URL if you customized the login to lookup).

## Assumptions & Trade-offs
- **Simulated Auth**: For the dashboard, we use a simple "Tenant ID" entry instead of full OAuth/Email-password flow for simplicity.
- **Sync**: Configured as an on-demand API call (`/ingest`). A production version would use Webhooks or Cron jobs (BullMQ).
- **Data Grouping**: Chart data grouping is done in-mmeory for simplicity. Production should use database aggregations (`date_trunc`).
