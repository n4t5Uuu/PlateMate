# Contract: App routes and access rules

**Feature**: [spec.md](../spec.md)

Access is decided in one place, `frontend/proxy.ts`, and is deny by default: a route is private unless it appears in the public list.

| Route | Access | Behavior |
| --- | --- | --- |
| `/sign-in` and everything under it | Public | The log-in page. Also hosts the second-step prompt and the two-step setup task. A signed-in person is sent to `/`. |
| `/sign-up` and everything under it | Public | The sign-up page. Includes email confirmation and two-step setup. A signed-in person is sent to `/`. |
| `/` | Private | The simple signed-in home page. Shows who is signed in and holds the sign-out control. Replaced by workspace setup when that feature exists. |
| Every other route, including ones added later | Private | A signed-out visitor is sent to `/sign-in`, then returned to the page they asked for after logging in. Only same-site return addresses are honored. |

**Public list rule**: adding a route to the public list is a deliberate change that must be reviewed against SC-004 (100% of private routes refuse signed-out visitors). The list lives in one exported constant in `frontend/lib/auth-routes.ts`, covered by a unit test.

**Static files and framework internals** (`_next`, images, fonts, the favicon) are excluded by the proxy's `matcher` so they load on the log-in page; they contain no user data.

**Response headers (XSS defense)**: every page response carries a `Content-Security-Policy` (no `unsafe-eval`, `object-src 'none'`, `base-uri 'self'`, `frame-ancestors 'none'`, scripts only from PlateMate and the sign-in provider), `X-Content-Type-Options: nosniff` and a strict `Referrer-Policy`. The policy starts in report-only mode and is enforced after the sign-in pages work under it. Built in `frontend/lib/security-headers.ts` and covered by a unit test.

**Sign out** ends the session on the current device and sends the person to `/sign-in`. After signing out, the browser's back button shows no private content because private pages are not served without a session.
