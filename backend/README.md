# Majirani Skills — Backend Boilerplate

Express + Prisma + PostgreSQL + JWT auth backend for the Majirani Skills frontend.

## Stack
- **Express 4** — HTTP server
- **Prisma 5** — type-safe ORM for PostgreSQL
- **JWT** + **bcryptjs** — auth
- **Zod** — request validation
- **TypeScript** strict mode

## Setup

```bash
npm install
cp .env.example .env       # then fill in DATABASE_URL and JWT_SECRET
npm run prisma:generate
npm run prisma:migrate     # creates tables
npm run seed               # optional sample data
npm run dev                # http://localhost:4000
```

## Folder structure

```
src/
├── controllers/     Request handlers (auth, artisans, services)
├── routes/          Express routers
├── middleware/      auth, error handler
├── lib/             prisma client, jwt helpers
└── server.ts        App entrypoint
prisma/
├── schema.prisma   Models: User, Artisan, Service, Review
└── seed.ts         Seed script
```

## API

| Method | Path                  | Auth      | Description       |
|--------|-----------------------|-----------|-------------------|
| POST   | /api/auth/register    | —         | Create account    |
| POST   | /api/auth/login       | —         | Get JWT token     |
| GET    | /api/auth/me          | Bearer    | Current user      |
| GET    | /api/artisans         | —         | List + ?q=&location= |
| GET    | /api/artisans/:id     | —         | Detail            |
| POST   | /api/artisans         | ARTISAN   | Create            |
| PUT    | /api/artisans/:id     | ARTISAN   | Update            |
| DELETE | /api/artisans/:id     | ADMIN     | Delete            |
| GET    | /api/services         | —         | List + ?category= |
| GET    | /api/services/:id     | —         | Detail            |
| POST   | /api/services         | ARTISAN   | Create            |
| PUT    | /api/services/:id     | ARTISAN   | Update            |
| DELETE | /api/services/:id     | ARTISAN   | Delete            |

## Wiring to the Vite frontend

In your frontend, set `VITE_API_URL=http://localhost:4000/api` and replace the
mock calls in `src/services/artisansService.js` with `fetch(\`\${import.meta.env.VITE_API_URL}/artisans\`)`.
