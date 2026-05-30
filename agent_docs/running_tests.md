# Running Tests

## Current State

No automated test suite has been set up yet.

## Lint

```bash
npm run lint
```

Runs ESLint via Next.js's built-in lint config.

## Manual Testing Checklist

### Auth
- [ ] Sign up with a new email → user row created in tbl_users, workspace auto-created
- [ ] Log out → redirected to `/`
- [ ] Reopen site while logged in → auto-redirected to `/dashboard`
- [ ] Visit `/dashboard` while logged out → redirected to `/`

### Workspace
- [ ] New workspace dialog → workspace appears in sidebar
- [ ] Workspace name shows in sidebar list

### Dashboard
- [ ] Stats cards render
- [ ] Project rows render with correct status colors
- [ ] Weekly pulse shows
- [ ] Recent activity shows
