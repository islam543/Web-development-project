# Social Media Platform (Phase 2)

This project now uses **Next.js + Prisma +  PostgreSQL (Neon) and includes:** 

- database-backed users, posts, replies, likes, follows, and reposts
- authentication with protected routes
- public profile pages for every user
- user discovery search + follow/unfollow
- direct image upload in post creation
- stats page with query-backed platform metrics
-live deployment on Vercel
🌐 Live Demo: https://social-media-platform-tau-drab.vercel.app




## Run locally

1. Install dependencies:

```powershell
npm install
```

2.Create a .env file in the project root:


DATABASE_URL="postgresql://neondb_owner:npg_1a4UIHmStwDu@ep-round-glade-amrx9efc.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require"
Option A — PostgreSQL via Neon (recommended):

Go to neon.tech and create a free account
Create a new project and copy the connection string:
postgresql://neondb_owner:npg_1a4UIHmStwDu@ep-round-glade-amrx9efc-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

Option B — SQLite (local only):

Set DATABASE_URL="file:./prisma/dev.db"
Change provider = "postgresql" to provider = "sqlite" in prisma/schema.prisma
3. Create and migrate the database:

```powershell
npm run db:migrate
```

4. Seed sample data:

```powershell
npm run db:seed
```

5. Start the app:

```powershell
npm run dev
```
Deploy to Vercel

Install Vercel CLI:

powershellnpm install -g vercel

Add your database URL as an environment variable:

powershellvercel env add DATABASE_URL production
vercel env add DATABASE_URL preview

Deploy:

powershellvercel --prod

The build script runs prisma generate automatically before next build — no extra steps needed.
## Demo account

After seeding, all seeded users share this password:

- **Password:** `Password123!`

Use any seeded email from `prisma/seed.js`, for example:

- `alex@asteria.social`
