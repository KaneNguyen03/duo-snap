# Duo Snap

Private couple snap app inspired by Locket, built for a two-person room.

## Stack

- Next.js App Router
- TypeScript
- tRPC for end-to-end type-safe API contracts
- Drizzle schema for production database wiring
- Tailwind CSS
- PWA manifest
- Google Stitch MCP config scaffold

## Current MVP

- Camera/upload-first flow
- Couple invite code
- Private timeline UI
- Partner snap preview
- Heart reactions
- Local browser persistence for quick testing
- tRPC seed and preview mutation
- Drizzle-ready Postgres schema for Supabase/Turso/Neon-style production persistence

## Run

npm install
npm run dev

Open http://localhost:3000.

## Production notes

The current MVP stores new snaps in browser localStorage so the UI can be tested immediately. To make it real for two phones, connect the Drizzle schema in src/server/db/schema.ts to a hosted Postgres database and store uploaded images in Supabase Storage, Vercel Blob, or S3.

## Stitch MCP

See docs/stitch-mcp.md.
