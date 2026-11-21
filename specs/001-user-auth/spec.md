# Feature Specification: User Authentication (Sign Up and Log In)

**Feature Branch**: `001-user-auth` (not created: no branch hook is installed)

**Created**: 2026-11-21

**Status**: Draft

**Input**: User description: "build the auth and the login page for platemate. the user can both sign in and login using clerk as our auth"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Sign up for a PlateMate account (Priority: P1)

A new person, such as an architecture student or a firm member, opens PlateMate for the first time and creates an account with their email and a password. They confirm their email address, set up two-step verification (see User Story 7), and land inside the app, ready to start working.

**Why this priority**: Nobody can use PlateMate without an account. Every other feature (workspaces, projects, plates) depends on a person being able to get in. It is also the first impression of the product.

**Independent Test**: Can be fully tested by signing up with a new email address on the sign-up page and confirming the person ends up inside the app as a signed-in user with a PlateMate account. It delivers a working account without any other feature existing.

**Acceptance Scenarios**:

1. **Given** a visitor who has no account, **When** they enter a valid email and a password that meets the rules, confirm their email and complete two-step verification setup, **Then** they are signed in and taken into the app.
2. **Given** a visitor on the sign-up page, **When** they enter an email that already has an account, **Then** they are told an account exists and are offered to log in instead.
3. **Given** a visitor on the sign-up page, **When** they enter an invalid email or a password that is too weak, **Then** they see a clear message saying what to fix and nothing is created.
4. **Given** a visitor who has signed up but not yet confirmed their email, **When** they try to continue, **Then** they cannot enter the app until the email is confirmed, and they can request a new confirmation.

---

### User Story 2 - Log in to an existing account (Priority: P1)

A returning person opens the log-in page and gets back into their account with their email and password, or with an emailed one-time sign-in link if they prefer not to use a password.

**Why this priority**: Returning users are the daily users. Without a smooth log-in, the product cannot be used past the first visit.

**Independent Test**: Can be fully tested by logging in with an account created earlier, once with a password and once with the emailed sign-in link, and confirming the person lands inside the app.

**Acceptance Scenarios**:

1. **Given** a person with an account, **When** they enter the correct email and password and then a valid two-step code, **Then** they are signed in and taken into the app.
2. **Given** a person with an account, **When** they ask for an emailed sign-in link, open it and enter a valid two-step code, **Then** they are signed in without typing a password.
3. **Given** a person on the log-in page, **When** they enter a wrong password or an email with no account, **Then** they see the same general message in both cases, so the page never reveals whether an account exists.
4. **Given** an emailed sign-in link that has expired or was already used, **When** the person opens it, **Then** they are told it is no longer valid and can request a new one.
5. **Given** a person who has failed to log in several times in a row, **When** they try again, **Then** further attempts are slowed or blocked for a short time and they are told to wait.

---

### User Story 3 - Private pages require a log-in (Priority: P1)

Anyone who is not logged in is kept out of every page and every piece of data that belongs to a signed-in user. When they try to open a private page, they are sent to log in, and after logging in they arrive at the page they originally wanted.

**Why this priority**: PlateMate holds students' and firms' unpublished work. Keeping it private is the core promise of the product, so signing in has no value unless signed-out visitors are reliably kept out.

**Independent Test**: Can be fully tested by opening a private page and requesting private data while signed out, confirming both are refused, then logging in and confirming the person is returned to the page they asked for.

**Acceptance Scenarios**:

1. **Given** a signed-out visitor, **When** they open a private page directly, **Then** they are sent to the log-in page.
2. **Given** a visitor who was sent to log in from a private page, **When** they log in successfully, **Then** they arrive at that page, not at a generic start page.
3. **Given** a signed-out visitor, **When** a request is made to the server for private data, **Then** the server refuses it and returns no data.
4. **Given** a signed-in person, **When** they open the sign-up or log-in page, **Then** they are sent into the app instead.

---

### User Story 4 - Sign in with Google or Microsoft (Priority: P2)

A person chooses "Continue with Google" or "Continue with Microsoft" on the sign-up or log-in page and is signed in without creating a separate password, using the work or school account they already have.

**Why this priority**: Most students and firm staff already have a Google or Microsoft account, so this removes friction. It is a requirement in the product plan, but email sign-up already makes the product usable, so it comes after the P1 stories.

**Independent Test**: Can be fully tested by signing up with a Google account and a Microsoft account, then logging in again with each, confirming the same account is used each time.

**Acceptance Scenarios**:

1. **Given** a person with no PlateMate account, **When** they choose Google or Microsoft, approve access and complete two-step verification setup, **Then** an account is created and they are taken into the app.
2. **Given** a person who already has a PlateMate account, **When** they choose Google or Microsoft with the same verified email and enter a valid two-step code, **Then** they are signed in to that same account and no duplicate is created.
3. **Given** a person who starts the Google or Microsoft flow, **When** they cancel or deny access, **Then** they return to the log-in page with a clear message and nothing is created.

---

### User Story 5 - Sign out (Priority: P2)

A signed-in person can sign out from anywhere in the app, which ends their session on that device.

**Why this priority**: People use shared studio and school computers, so signing out must work reliably. It is quick to deliver once log-in exists.

**Independent Test**: Can be fully tested by signing in, signing out, and confirming that private pages are no longer reachable, including by pressing the browser's back button.

**Acceptance Scenarios**:

1. **Given** a signed-in person, **When** they choose to sign out, **Then** they are taken to the log-in page and their session on that device ends.
2. **Given** a person who has just signed out, **When** they press the browser's back button, **Then** no private content is shown and they are asked to log in.

---

### User Story 6 - Reset a forgotten password (Priority: P3)

A person who forgot their password can ask for a reset link by email, set a new password, and get back into their account.

**Why this priority**: It prevents lockouts and support requests, but people can still get in with the emailed sign-in link or a social account, so it is not blocking.

**Independent Test**: Can be fully tested by requesting a reset for an existing account, following the emailed link, setting a new password, and logging in with it.

**Acceptance Scenarios**:

1. **Given** a person with an account, **When** they request a reset and follow the emailed link, **Then** they can set a new password and log in with it, still entering a valid two-step code. A password reset never removes two-step verification.
2. **Given** an email address with no account, **When** someone requests a reset for it, **Then** the page shows the same general confirmation message as for a real account.
3. **Given** a reset link that has expired or was already used, **When** the person opens it, **Then** they are told it is no longer valid and can request a new one.

---

### User Story 7 - Two-step verification is required for every account (Priority: P1)

Every PlateMate account is protected by two-step verification, with no exceptions. A new person sets it up before they first enter the app, using an authenticator app on their phone, and receives backup codes to use if they lose the phone. From then on, every log-in, by any method, asks for a six-digit code from the authenticator app after the first step.

**Why this priority**: PlateMate holds unpublished design work, so a password alone is not enough. Because it is required, it is part of the sign-up and log-in path itself, not an add-on: a person cannot get in without it.

**Independent Test**: Can be fully tested by signing up a new account, confirming the app cannot be entered until two-step setup is complete, logging out, logging in again with an authenticator code, then logging in once with a backup code and confirming that code cannot be reused.

**Acceptance Scenarios**:

1. **Given** a new person who has confirmed their email (or approved a Google or Microsoft sign-in), **When** they have not yet finished two-step setup, **Then** they cannot enter the app and are shown the setup steps.
2. **Given** the setup steps, **When** the person enters a valid code from their authenticator app, **Then** setup is complete, they are shown their backup codes once, and they are taken into the app.
3. **Given** an account with setup complete, **When** the person logs in by any method, **Then** they are asked for a code before they get in.
4. **Given** the code prompt, **When** they enter a wrong or expired code, **Then** they are refused with a clear message and can try again.
5. **Given** the code prompt, **When** they enter an unused backup code, **Then** they get in and that backup code can never be used again.
6. **Given** a person who left halfway through setup, **When** they log in again, **Then** they are taken back to finish setup before they can enter the app.
7. **Given** a signed-in person, **When** they replace their authenticator device or generate new backup codes, **Then** they must first confirm with a current code or an unused backup code. There is no option to turn two-step verification off.

---

### Edge Cases

- A person loses their phone and has no backup codes left: they cannot log in by themselves. Recovering such an account is handled by the PlateMate team and is out of scope here, so the page tells them to contact support.
- The clock on a person's phone is slightly off, so codes are rejected: codes from the neighboring time window are accepted, and a persistent failure shows a hint to check the phone's time.
- A person signs in with Google or Microsoft: PlateMate still requires its own two-step code on top of whatever protection those providers have, so no sign-in method skips the second step.
- A person closes the browser in the middle of two-step setup: nothing is lost, and the next log-in resumes the setup.
- A person signs up with Google and later tries to log in with a password for the same email: they are guided to the method they used, or can set a password, and never end up with two accounts.
- The same email is entered with different capitalization: it is treated as the same account.
- A person's session expires while they are working: they are asked to log in again and then return to where they were.
- A person is signed in on two devices and signs out on one: the other device is not affected unless they choose to sign out everywhere.
- The "return to the page I wanted" address points to another website: it is ignored and the person goes to the default landing page, so the log-in page cannot be used to send people elsewhere.
- The sign-in service is unreachable: the person sees a friendly "try again shortly" message, and private content stays protected.
- A person's account is deleted or disabled: they can no longer log in, and any open session stops working.
- Someone opens the sign-up page with a link from an email invitation: the invitation flow is a separate feature, so for now they sign up normally.
- An emailed link is opened on a different device from the one that requested it: it still works, or says clearly that it cannot, without exposing the account.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Visitors MUST be able to create an account with an email address and a password, and the page MUST explain the password rules before they submit.
- **FR-002**: The system MUST confirm that a person controls their email address before giving them access to the app.
- **FR-003**: People MUST be able to log in with their email and password.
- **FR-004**: People MUST be able to log in or sign up with a one-time link sent to their email instead of a password.
- **FR-005**: People MUST be able to sign up and log in with a Google account and with a Microsoft account.
- **FR-006**: The system MUST keep one account per person: signing up or logging in by different methods with the same verified email MUST lead to the same account.
- **FR-007**: Error messages on the log-in, sign-up and reset pages MUST NOT reveal whether a given email address has an account.
- **FR-008**: After 5 failed log-in attempts in a row, the system MUST block further attempts for that account for 15 minutes and tell the person to wait.
- **FR-009**: People MUST be able to reset a forgotten password by email, and reset links and emailed sign-in links MUST expire after 1 hour and work only once.
- **FR-010**: People MUST be able to sign out, which ends their session on that device and makes private pages and data unreachable.
- **FR-011**: Signed-out visitors MUST be sent to the log-in page when they open a private page, and after logging in they MUST be returned to that page, but only if it is a page within PlateMate.
- **FR-012**: Signed-in people who open the sign-up or log-in page MUST be sent into the app.
- **FR-013**: Every request for private data MUST be checked on the server to identify the person making it, and requests from signed-out callers MUST be refused. Hiding a page or button is never the only check.
- **FR-014**: Every new account MUST automatically get a PlateMate user record, exactly once and without any manual step, so other features can refer to the person.
- **FR-015**: A person's session MUST last across closing and reopening the browser for up to 30 days, and MUST end after 7 days without use, after which they are asked to log in again and returned to where they were.
- **FR-016**: The sign-up, log-in and reset pages MUST work by keyboard alone, label every field for screen readers, and meet WCAG 2.2 AA.
- **FR-017**: When the sign-in service is unavailable, the system MUST show a clear, friendly message and MUST keep private content protected.
- **FR-018**: Every account MUST have two-step verification. A new person MUST complete setup, using a six-digit code from an authenticator app and confirming one valid code, before they can first enter the app. A person who has not finished setup MUST be taken back to it at their next log-in.
- **FR-019**: When setup is completed, the system MUST give the person 10 single-use backup codes, shown once, and each backup code MUST stop working after it is used.
- **FR-020**: Every log-in, by any method (password, emailed link, Google or Microsoft), MUST require a valid code or an unused backup code before access is granted. Wrong codes count toward the failed-attempt limit in FR-008.
- **FR-021**: Two-step verification MUST NOT be possible to turn off, and a password reset MUST NOT remove it. People MUST be able to replace their authenticator device and generate new backup codes, each only after confirming with a current code or an unused backup code.

- **FR-022**: A person's account record MUST be readable and changeable only for that person (and for the automatic sync from the sign-in service). This MUST be enforced by the database itself, so a mistake in the application cannot expose one person's record to another, and a missing rule means no access.
- **FR-023**: Anything a person types that is shown back to them or to others (for example their display name) MUST be displayed as plain text and never run as page code. Link addresses supplied by people MUST be limited to safe web addresses.

### Key Entities *(include if feature involves data)*

- **User**: A person with a PlateMate account. Has a unique email address (verified), a display name when available, and the date the account was created. One person has exactly one user record, however they sign in.
- **Session**: A period during which a person is signed in on one device. Has a start time, an expiry, and the device it belongs to. Ends on sign-out, inactivity, or account removal.
- **Sign-in method**: A way a person proves who they are, either an email and password, an emailed link, a Google account, or a Microsoft account. A user can have several, all leading to the same account.
- **Two-step verification**: A required extra protection on every account. Records whether setup is complete and how many backup codes are left. The secret behind the codes and the backup codes themselves are never shown again after setup.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A new person can sign up with email and reach the inside of the app in under 4 minutes, including confirming their email and setting up two-step verification.
- **SC-002**: A returning person can log in and reach the app in under 45 seconds, including entering their two-step code.
- **SC-003**: 95% of first-time visitors who start signing up complete it on their first attempt, without needing help.
- **SC-004**: 100% of private pages and private data requests refuse signed-out visitors, verified by automated tests covering every private route that exists.
- **SC-005**: 100% of new accounts have a matching PlateMate user record within 1 minute, with no manual step and no duplicates.
- **SC-006**: The sign-up and log-in pages become usable in under 2.5 seconds on a typical broadband connection.
- **SC-007**: The sign-up, log-in and reset pages pass an accessibility check for WCAG 2.2 AA, and every step can be completed with the keyboard only.
- **SC-008**: Across all error cases on the log-in, sign-up and reset pages, no message reveals whether an account exists for an email address.
- **SC-009**: 90% of new people who reach the two-step setup finish it on their first attempt.
- **SC-010**: 100% of log-ins, by every method, require the second step, and no account can reach the app without completing setup, verified by automated tests. No backup code works twice.

- **SC-011**: 100% of attempts by one person to read or change another person's account record are refused by the database itself, and a table without access rules refuses everyone, verified by an automated check that also fails when any data table lacks access rules.
- **SC-012**: A display name made of page code, such as `<img src=x onerror=alert(1)>`, appears as plain text everywhere it is shown and runs nothing.

## Assumptions

- "Sign in and login" in the request is read as "sign up (create an account) and log in (return to an account)". If it meant something else, this spec needs revising.
- Clerk is the authentication provider. This is a decision already made for the project, so the provider's capabilities (email and password, emailed links, Google and Microsoft sign-in, password reset, sessions) set what is achievable, and this spec describes outcomes, not the provider's settings.
- Anyone can create an account; PlateMate is not invite-only at the sign-up step. Joining a workspace by invitation is a separate feature.
- Email confirmation is required before access, which is standard practice for an app that holds private work.
- The time limits in FR-008, FR-009 and FR-015 (5 attempts, 15 minutes, 1 hour, 30 days, 7 days) are starting defaults chosen as sensible for a private work tool. They can be changed without changing the feature.
- Two-step verification is required for everyone, always, including people who sign in with Google or Microsoft. PlateMate's own second step applies on top of those providers' protection, because "always" leaves no exception. It uses authenticator-app codes and backup codes. Text-message codes, phone-number sign-in, single sign-on for firms (SAML), and sign-in with other providers are out of scope for this feature.
- Recovering an account whose owner lost both their phone and their backup codes is handled by the PlateMate team outside the product for now.
- Out of scope: the profile (name, photo, school or firm), workspaces and workspace roles, project roles and permissions, invitations, guest access, account deletion, and any admin screen for managing users. These are separate features in the product plan.
- After sign-up, a person lands on a simple signed-in home page, because workspace creation is built separately. The home page can be replaced by the workspace setup step when that feature exists.
- The visual design of the sign-up and log-in pages follows the product's design direction and is decided at design time, with the user choosing the layout.
- Desktop and tablet are the primary targets; the pages also work on a phone. Supported browsers are the latest two versions of Chrome, Edge, Safari and Firefox.
- Dependencies: a Clerk application and its keys are available for development, and keys are kept out of the repository. The server can verify who is calling for every private request, which the rest of the product relies on (see the permissions rules in the product requirements).
