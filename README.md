# Duo Snap

A private, Locket-inspired photo feed for two people. Built as a portfolio case study to demonstrate fullstack TypeScript architecture using a monorepo setup.

## Why I built this

I wanted to showcase my ability to design and implement a modern, scalable fullstack architecture. While a simple photo feed could be built as a standalone React app or a PWA, this project intentionally uses an "over-engineered" monorepo setup to demonstrate how to manage shared packages, robust APIs, and separate polished UIs for web and mobile.

## The problem

Couples and close friends often want a dedicated, noise-free space to share spontaneous snaps without the clutter of mainstream social media. Most existing solutions either require installing heavy apps or lack privacy controls for a strict two-person limit.

## The solution

**Duo Snap** solves this by providing a hyper-focused, invite-only feed limited to two configured emails. It uses magic links for frictionless login, signed URLs for secure media storage, and provides both a beautiful Web client and an Expo Mobile app—all backed by a shared tRPC API.

## Tech stack

- **Architecture:** Turborepo / Monorepo
- **Web App:** Next.js (App Router), Tailwind CSS v4, shadcn/ui, Framer Motion
- **Mobile App:** Expo, React Native, NativeWind, Reanimated, Expo Camera
- **Backend API:** tRPC (Server Actions & API Routes)
- **Database:** PostgreSQL (Supabase), Drizzle ORM
- **Authentication:** Supabase Auth (Magic Links)
- **Storage:** Supabase Storage (Signed URLs)
- **Package Manager:** pnpm

## Architecture

The project is structured as a T3-based monorepo:
- `apps/nextjs`: The web client featuring glassmorphism and Framer Motion layout animations.
- `apps/expo`: The mobile client with native camera integration and BlurView.
- `packages/api`: Shared tRPC routers (auth, photos) ensuring type safety across clients.
- `packages/db`: Drizzle ORM schema and database client.
- `packages/auth`: Centralized Supabase configuration and authentication helpers.
- `packages/ui`: Shared shadcn UI components used by the web app.

## Features

- **Strict Allowlist:** Only two pre-configured email addresses can sign in.
- **Magic Link Auth:** Passwordless login via Supabase OTP.
- **Shared Timeline:** A real-time, chronological feed of snaps.
- **Secure Uploads:** Direct-to-storage uploads using temporary signed URLs.
- **Cross-Platform:** Beautiful, platform-specific UIs sharing 100% of their business logic.

## Challenges & trade-offs

- **Monorepo Complexity:** Managing a Turborepo with React Native and Next.js requires careful dependency alignment and configuration, particularly with Metro and PostCSS.
- **UI Consistency:** I chose to keep the web and mobile UIs separate rather than using a universal UI library (like Tamagui). This trade-off requires writing UI code twice but ensures each platform feels native and leverages the best tools for the job (Framer Motion on Web, Reanimated on Mobile).
- **Over-engineered for scale:** A two-person app doesn't *need* a scalable Postgres database or a tRPC monorepo. However, this architecture proves that the foundation can easily support a multi-tenant "Groups" feature in the future.

## Supabase setup

1. Create a new Supabase project.
2. Run the schema migrations from `packages/db/src/schema.ts` in the SQL editor to create `profiles` and `photos`.
3. Create a Storage bucket named `duo-snaps` (can be private).
4. Configure Magic Link email auth in Supabase Authentication settings.

## Local development

1. Clone the repository and run `pnpm install`.
2. Copy `.env.example` to `.env` in the root directory.
3. Fill in your Supabase credentials, Postgres connection string, and the two `ALLOWED_EMAILS`.

## Running web

From the root directory:
```bash
pnpm dev:web
```
The app will be available at `http://localhost:3000`.

## Running mobile

From the root directory:
```bash
pnpm dev:mobile
```
This starts the Expo bundler. Press `i` to open in the iOS simulator, or `a` for Android.

## Roadmap

- Push notifications for new snaps (Expo Notifications).
- Offline support and caching for the mobile feed.
- "Reactions" or tiny notes on specific photos.

