# Auth & Sessions

## User Flow

```
Sign Up
  ↓
Supabase creates auth.users record
  ↓
on_auth_user_created trigger → copies data to tbl_users
  ↓
on_user_created_create_workspace trigger → creates "[First]'s Workspace"
  ↓
Redirected to /dashboard
```

```
Sign In
  ↓
Supabase validates credentials → issues JWT
  ↓
JWT stored in cookies (HttpOnly, managed by @supabase/ssr)
  ↓
middleware.ts reads cookie, validates with Supabase server
  ↓
User lands on /dashboard (or is kept on / if invalid)
```

## Auto-Login

When a user revisits the site with a valid session cookie, middleware silently refreshes the JWT and redirects them to `/dashboard` automatically. They never see the login page again until they sign out or the session expires and cannot be refreshed.

## Session Management

- Sessions are stored in cookies, not localStorage
- `middleware.ts` runs on every request and calls `supabase.auth.getUser()` — this validates the JWT with Supabase's server (not just reading the cookie)
- If the JWT is expired but the refresh token is valid, Supabase silently issues a new JWT and the middleware writes it to both the request and response cookies
- Always use `getUser()` for session checks — `getSession()` only reads the cookie and does not validate with the server

## Protected Routes

Any route under these paths requires a valid session:

- `/dashboard`
- `/projects`
- `/calendar`
- `/teams`
- `/trash`
- `/settings`
- `/workspace`

Unauthenticated users are redirected to `/`.

## AuthProvider

`src/components/providers/auth-provider.tsx` syncs the Supabase session into React state using `onAuthStateChange`. Any client component can access the user via `useAuth()`:

```ts
const { user, signOut } = useAuth()
```

## tbl_users vs auth.users

Supabase has two user tables:
- `auth.users` — managed by Supabase Auth, not directly accessible from client code
- `tbl_users` — our app table, populated by trigger on signup, accessible via RLS

The IDs are the same UUID. Always query `tbl_users` for app data, never `auth.users`.
