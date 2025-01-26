# IMF Gadget API

A secure API for managing IMF's gadget inventory, built with Node.js, Express, PostgreSQL, and Prisma.

## Features

- JWT Authentication
- CRUD operations for gadgets
- Random codename generation
- Mission success probability calculation
- Self-destruct sequence simulation
- Status-based filtering

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL
- npm or yarn

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up your environment variables by copying the .env.example to .env and filling in your values:
```bash
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/imf_gadgets?schema=public"
JWT_SECRET="your-super-secret-key-here"
PORT=3000
```

3. Initialize the database:
```bash
npx prisma migrate dev
```

4. Start the development server:
```bash
npm run dev
```

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

## Status Values
- AVAILABLE
- DEPLOYED
- DESTROYED
- DECOMMISSIONED
