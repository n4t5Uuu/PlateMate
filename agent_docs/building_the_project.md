# Building & Running the Project

## Dev Server

```bash
npm run dev
```

Opens at http://localhost:3000

## Production Build

```bash
npm run build
npm run start
```

## Environment Variables

Create a `.env.local` file in the root with:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Both values are found in your Supabase project under Settings → API.

## Database Setup

All SQL lives in `src/lib/supabase/schema/`. To deploy or redeploy:

1. Run `.\combine-schema.ps1` in the terminal — this combines all SQL files in the correct order and copies to clipboard
2. Open Supabase → SQL Editor → New Query
3. Paste and run

Order in the script matters:
- plpgsql functions first (not validated at creation)
- Tables next
- sql-language functions after tables (validated at creation, need tables to exist)
- Triggers and policies last
