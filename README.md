# Majirani Skills

A platform that connects users in Kenya with trusted local artisans —
carpenters, tailors, electricians, plumbers, painters and more.

## Tech stack

- **React 18** + **Vite 5**
- **Tailwind CSS** with a semantic-token design system
- **shadcn/ui** component primitives
- **React Router** for routing
- **TanStack Query** ready for async data
- JSDoc typedefs for lightweight type safety in `.jsx` files

## Getting started

Requires Node.js 18+ and npm.

```sh
npm install
npm run dev
```

The dev server runs on http://localhost:8080.

Other scripts:

```sh
npm run build     # production build
npm run preview   # preview the production build
npm run lint      # run eslint
```

## Folder structure

```
src/
├── assets/              Static images (hero, etc.)
├── components/
│   ├── layout/          App shell: Navbar, Footer
│   └── ui/              shadcn/ui primitives (Button, Card, Input, ...)
├── data/                Static seed data (artisans, categories, steps)
├── features/            Domain features grouped by area
│   ├── artisans/        ArtisanCard, FeaturedArtisans
│   ├── search/          Hero, SearchBar
│   └── services/        ServiceCategoriesGrid, HowItWorks
├── hooks/               Reusable React hooks (e.g. useArtisanSearch)
├── lib/                 Generic helpers (cn, etc.)
├── pages/               Route-level pages (Index, NotFound)
├── services/            Mock API layer — swap for real backend later
└── types/               JSDoc typedefs (Artisan, ServiceCategory, ...)
```

### Why this layout

- **`features/`** keeps domain logic close together — easy to grow into
  full pages (e.g. an artisan profile route) without scattering files.
- **`services/`** isolates data fetching so swapping mock data for a real
  API (Lovable Cloud, REST, etc.) only touches one folder.
- **`data/`** holds seed content so designers can tweak copy without
  hunting through components.
- **`types/`** centralises shapes used across the app.

## Design system

All colors, gradients and shadows are defined as HSL semantic tokens in
`src/index.css` and exposed through `tailwind.config.js`. Components use
tokens like `bg-primary`, `text-muted-foreground`, never raw colors.

## Replacing mock data with a real API

Edit `src/services/artisansService.js` and `src/services/categoriesService.js`
to call your backend (e.g. `fetch("/api/artisans")`). Components and hooks
already consume these services, so no UI changes are required.
