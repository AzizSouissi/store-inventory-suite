# Store Inventory

Inventory management system with a React + CoreUI frontend and a NestJS + MongoDB backend.

## Features

- Products, categories, suppliers, and stock movements
- Batch tracking (receive, waste, adjust)
- JWT authentication with roles (`ADMIN`, `STAFF`)
- Swagger API docs

## Project Structure

- `frontend/` React app (Vite, CoreUI)
- `backend/` NestJS API (MongoDB, JWT, Swagger)

## Prerequisites

- Node.js 20+
- MongoDB (local or remote)

## Quick Start

### Backend

```bash
cd backend
npm install
cp .env.example .env
npm run start:dev
```

- API base URL: `http://localhost:8080`
- Swagger UI: `http://localhost:8080/swagger`

### Frontend

```bash
cd frontend
npm install
npm start
```

- App URL: `http://localhost:5173`

## Environment

Backend expects the following in `backend/.env` (see `backend/.env.example`):

- `PORT`
- `MONGODB_URI`
- `JWT_SECRET`
- `JWT_EXPIRES_MINUTES`
- `BOOTSTRAP_ADMIN_USERNAME`
- `BOOTSTRAP_ADMIN_PASSWORD`
- `BOOTSTRAP_STAFF_USERNAME`
- `BOOTSTRAP_STAFF_PASSWORD`

Security note: Replace bootstrap credentials before publishing or deploying.

## Scripts

### Frontend

- `npm start` - dev server
- `npm run build` - production build

### Backend

- `npm run start:dev` - dev server
- `npm run build` - production build

## License

MIT. See the root LICENSE and NOTICE.
