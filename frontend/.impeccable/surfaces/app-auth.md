---
version: 1
slug: "app-auth"
primary_target: "app/(auth)"
related_targets: []
---

# Auth surface (sign-in, sign-up)

Mode: Operate. The visitor signs in or creates an account. Routes /sign-in and /sign-up share one stage and switch with a motion.

Audience and job: architecture students and firm members; get into the workspace fast, via Google, Microsoft or email and password. Two-step verification is set up after email confirmation (sign-up note).
Constraints: WCAG 2.2 AA, keyboard, reduced motion = instant swap, phone width, no content behind shapes. Clerk is not wired: static placeholder form, replaced by Clerk's components later.
Unresolved: real Clerk appearance mapping (T017+), error and loading states once Clerk is live.

## Direction contract

THESIS: One paper sheet laid on three flat curved planes; switching between sign in and sign up physically moves the planes and slides the sheet. Refuses the centered-card-on-grey-gradient auth template and the literal drawing-sheet costume.
OWN-WORLD: Title Block palette: ink #1A1A1A, paper #FAFAF8, 1px ink hairlines, mono uppercase sheet label. Planes: blue quarter-circle #2B3F8C, vermilion arch #D4381F, signal-yellow circle #F2B705, flat, no shadow, no gradient. Sheet radius 22px, fields and buttons 12px. Archivo for text, JetBrains Mono only for the sheet label.
STORY: The visitor sees PlateMate, picks Sign in or Create account from a pill switch, uses SSO or email and password, and understands two-step verification comes after email confirmation.
FIRST VIEWPORT: Desktop: sheet 520px wide at left (about 17vw), vertically centered; blue quarter-circle bleeding off the top-left, arch bottom-right, yellow circle top-right. Inside the sheet: wordmark, pill switch, heading, Google and Microsoft buttons, or divider, email, password, ink main button, note, title-block label. Phone: sheet fills the width, planes shrink and crop around it.
FORM: user-chosen sketch frontend/.impeccable/mocks/decision/planes-three.html, seed: none (pinned) "build the real auth shell to match the chosen sketch at frontend/.impeccable/mocks/decision/planes-three.html".
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
