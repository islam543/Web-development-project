# Social Media Platform (Phase 2)

This project now uses **Next.js + Prisma + SQLite** and includes:

- database-backed users, posts, replies, likes, follows, and reposts
- authentication with protected routes
- public profile pages for every user
- user discovery search + follow/unfollow
- direct image upload in post creation
- stats page with query-backed platform metrics

## Run locally

1. Install dependencies:

```powershell
npm install
```

2. Create and migrate the database:

```powershell
npm run db:migrate
```

3. Seed sample data:

```powershell
npm run db:seed
```

4. Start the app:

```powershell
npm run dev
```

## Demo account

After seeding, all seeded users share this password:

- **Password:** `Password123!`

Use any seeded email from `prisma/seed.js`, for example:

- `alex@asteria.social`
