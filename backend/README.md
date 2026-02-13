# Store Inventory Suite API

NestJS API for the Store Inventory Suite (MongoDB, JWT auth, Swagger).

## Prerequisites

- Node.js 20+
- MongoDB (local or remote)

## Setup

```bash
npm install
cp .env.example .env
npm run start:dev
```

- API base URL: http://localhost:8080
- Swagger UI: http://localhost:8080/swagger

## Environment Variables

See [.env.example](.env.example) for the full list.

- PORT
- MONGODB_URI
- JWT_SECRET
- JWT_EXPIRES_MINUTES
- BOOTSTRAP_ADMIN_USERNAME
- BOOTSTRAP_ADMIN_PASSWORD
- BOOTSTRAP_STAFF_USERNAME
- BOOTSTRAP_STAFF_PASSWORD

## Scripts

- npm run start:dev
- npm run build
- npm run test
- npm run lint

## License

MIT. See the root LICENSE and NOTICE.
