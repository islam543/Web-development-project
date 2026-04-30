# Copilot Instructions

## Build, test, and lint commands

Use these commands from the repository root:

- Install dependencies: `npm install`
- Start local dev server: `npm run dev`
- Build production bundle: `npm run build`
- Run linter: `npm run lint`
- Run Prisma migration locally: `npm run db:migrate`
- Seed database: `npm run db:seed`

There is no dedicated automated single-test command yet.

## High-level architecture

- App Router Next.js application under `app/` with page routes for `feed`, `users/[username]`, `post/[postId]`, `stats`, and auth pages.
- Data layer uses Prisma + SQLite with schema in `prisma/schema.prisma` and seed data in `prisma/seed.js`.
- Route handlers in `app/api/**` act as APIs for auth, post/reply/like/repost actions, follow actions, user search, and stats.
- Repository logic is centralized in `lib/repositories/socialRepository.js`; route handlers and pages should call repository functions instead of writing ad hoc queries.
- Session-based authentication is cookie-driven (`smp_session`) with middleware route protection and server-side session validation.

## Key repository conventions

- Keep auth checks strict: protected pages and APIs must not be accessible without a valid session.
- When adding data operations, place filtering/sorting/aggregation in Prisma queries (DB-side), not in-memory post-processing.
- Preserve profile discoverability: user profile routes should stay viewable by any authenticated user.
- Avoid non-functional controls in UI. Every visible button/link should perform an action or be clearly disabled.
- Keep the current classy theme system in `app/globals.css`; avoid reintroducing X-like branding or placeholder markup from old static pages.
