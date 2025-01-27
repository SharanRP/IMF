# IMF Gadget API

A secure API for managing IMF's gadget inventory, built with Node.js, Express, PostgreSQL, and Prisma.

## Features

- JWT Authentication
- CRUD operations for gadgets
- Random codename generation
- Mission success probability calculation
- Self-destruct sequence simulation
- Status-based filtering
- Multi-environment support (Development & Production)

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL
- npm or yarn

## Environment Setup

The API supports both development and production environments. Environment-specific configurations are managed through separate `.env` files.

### Development Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env.development` file with your development environment variables:
```bash
NODE_ENV=development
PORT=3003
DATABASE_URL="your-development-database-url"
JWT_SECRET="your-development-secret"
BASE_URL="http://localhost:3003"
```

3. Initialize the database:
```bash
npx prisma migrate dev
```

4. Start the development server:
```bash
npm run dev
```

### Production Setup

1. Create a `.env.production` file with your production environment variables:
```bash
NODE_ENV=production
PORT=3003
DATABASE_URL="your-production-database-url"
JWT_SECRET="your-production-secret"
BASE_URL="https://imf-gadget-api.production.com"
```

2. Build and start the production server:
```bash
npm run build
npm start
```

## Deployment

The application is automatically deployed using GitHub Actions:

- Push to `develop` branch -> Deploys to development environment
- Push to `main` branch -> Deploys to production environment

Development URL: https://dev-imf-gadget-api.azurewebsites.net
Production URL: https://imf-gadget-api.azurewebsites.net

## API Endpoints

### Authentication
- POST /auth/register - Register a new user
- POST /auth/login - Login and receive JWT token

### Gadgets (Protected Routes)
- GET /gadgets - Get all gadgets
- GET /gadgets?status={status} - Filter gadgets by status
- POST /gadgets - Create a new gadget
- PATCH /gadgets/:id - Update a gadget
- DELETE /gadgets/:id - Decommission a gadget
- POST /gadgets/:id/self-destruct - Trigger self-destruct sequence

### Health Check
- GET /health - Check API status and environment

## Status Values
- AVAILABLE
- DEPLOYED
- DESTROYED
- DECOMMISSIONED

## Documentation

API documentation is available at:
- Production:https://imf-production-5750.up.railway.app/api-docs
