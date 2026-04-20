# Majirani Skills 🛠️

**Majirani Skills** is a premium, full-stack marketplace designed to bridge the gap between skilled master artisans and local clients in Kenya. The platform focuses on high-aesthetic design and secure, role-based interaction, allowing users to discover heritage skills in their own neighborhoods.

<img src="public/image.png" alt="Branding" width="200" />

##  Key Features

- **Pixel-Perfect UI**: A high-end, responsive design system built with Tailwind CSS, focusing on a balance of modern aesthetics and heritage branding.
- **Dual-Role Onboarding**: Users can register as either a **Client** (to find services) or an **Artisan** (to showcase skills).
- **Social Authentication**: Secure, one-click login via **Google OAuth2**.
- **Secure Sessions**: Robust JWT-based authentication with role-based access control (RBAC).
- **Pro-Grade Backend**: A modular NestJS architecture ensuring scalability and maintainability.
- **Data Integrity**: Powered by PostgreSQL and Prisma ORM for type-safe database interactions and migrations.

---

##  Technology Stack

### Frontend
- **Framework**: React 18 + Vite 5
- **Styling**: Tailwind CSS (Semantic-token based design system)
- **Icons**: Lucide React
- **Notifications**: Sonner (Aesthetic Toast notifications)
- **Routing**: React Router v6

### Backend
- **Framework**: NestJS (Modular Architecture)
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: Passport.js (JWT & Google OAuth2 Strategy)
- **Validation**: Class-validator & Class-transformer

---

## Getting Started

### 1. Prerequisites
- **Node.js** (v18 or higher)
- **PostgreSQL** (Running locally or via Docker)

### 2. Backend Setup
1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure Environment Variables:
   Create a `.env` file in the `backend/` directory:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/majirani_skills?schema=public"
   JWT_SECRET="your_secure_secret"
   JWT_EXPIRES_IN="7d"
   GOOGLE_CLIENT_ID="your_google_client_id"
   GOOGLE_CLIENT_SECRET="your_google_client_secret"
   ```
4. Initialize the Database:
   ```bash
   npx prisma db push
   ```
5. Start the server:
   ```bash
   npm run start:dev
   ```

### 3. Frontend Setup
1. Navigate to the project root:
   ```bash
   cd ..
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

---

## Project Structure

```text
├── backend/                # NestJS API
│   ├── src/
│   │   ├── auth/           # Authentication logic (JWT & Google)
│   │   ├── prisma/         # Database service & seeds
│   │   ├── common/         # Decorators, Guards, & Middlewares
│   │   └── ...             # Feature modules (Users, Artisans, etc.)
│   └── prisma/             # Schema & Migrations
├── src/                    # React Frontend
│   ├── components/
│   │   ├── layout/         # Shared MainLayout, Navbar, Footer
│   │   └── ui/             # Reusable UI components (Logo, Button, etc.)
│   ├── pages/              # Route-level components (SignIn, SignUp, ...)
│   ├── features/           # Domain-specific modules
│   └── ...
└── public/                 # Static assets (Logos, Icons)
```

---

## Roadmap

- [x] Full-Stack Authentication (JWT + Google OAuth)
- [x] Unified Design System & Logo Integration
- [x] Master Artisan Sign-Up & Role Selection
- [ ] Artisan Profile Dashboard & Verification
- [ ] Service Catalog & Categorized Search
- [ ] Real-time Inquiry & Booking System
- [ ] Review & Rating Engine for Trust

---

## License

© 2026 Majirani Skills. Handcrafted Excellence. All Rights Reserved.
