<div align="center">

# PlateMate

**Version control and critique for architectural plates. Track revisions, compare versions, annotate, and collaborate in shared workspaces.**

![Next.js](https://img.shields.io/badge/NEXT.JS-16.4-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/REACT-19-149ECA?style=for-the-badge&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TYPESCRIPT-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/TAILWIND_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Hono](https://img.shields.io/badge/HONO-4-E36002?style=for-the-badge&logo=hono&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/POSTGRESQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![pnpm](https://img.shields.io/badge/PNPM-11-F69220?style=for-the-badge&logo=pnpm&logoColor=white)

</div>

---

## About

PlateMate is a tracker and notes app for architectural plates, in the spirit of Notion but built around one idea: making plates is full of revisions. Every upload becomes a version in a git-style history, so students and firms can see how a plate changed from one crit to the next.

It is built for architecture students working solo and for firms working together. A workspace can be one person or a whole office, and only people invited to a project can see it.

PlateMate renders a base image of each plate and never edits the file. Original files are kept as they were uploaded.

---

## Key Features

- **Workspaces:** solo or shared with a firm, with admin, moderator and member roles.
- **Projects:** client name and details at creation, project settings for the project head, and invite-only access per project.
- **Plate versions:** every upload is a version in a history you can browse, like a commit log for a drawing.
- **Visual compare:** side-by-side, swipe slider, onion-skin overlay and pixel diff between any two versions.
- **Annotations:** mark the exact part of a plate that needs revision and leave notes on it. Annotations can be resolved once the revision is done.
- **Crit notes and meetings:** notes from each crit, plus a meeting link (Zoom or Meet) with a calendar invite.
- **Design options:** branch a plate into options and promote the one you choose to the main line.
- **Archive before delete:** projects are archived first and only removed permanently after a grace period.
- **Sign in your way:** Google or other single sign-on, or email and password, through Clerk.
- **Large plates:** zoomable deep-zoom viewing for A1 and A0 sheets.

---

## Supported Plate Formats

| Format | Status |
|---|---|
| PDF, JPG, PNG, WebP, TIFF, HEIC, SVG | MVP |
| PSD, AI | MVP |
| DXF | Later |
| DWG, SKP, 3DM, RVT, IFC | Later (export a PDF for crits in the meantime) |

---

## Tech Stack

| Layer | Tools |
|---|---|
| Frontend | Next.js, shadcn/ui, Tailwind CSS, motion-primitives, TanStack Query, React Hook Form, OpenSeadragon, Annotorious, BlockNote |
| Backend | Hono, PostgreSQL, Drizzle ORM, Zod, Clerk, Resend, Inngest |
| Files | S3, CloudFront, SQS, Lambda (sharp, pdfium, ag-psd, pixelmatch) |
| Tooling | pnpm, Turborepo, Docker, LocalStack, SST, Vitest, Playwright |
| Deployment | Vercel, Neon, AWS, GitHub Actions |

---

## Project Structure

```
platemate/
├─ frontend/              Next.js app (UI)
├─ backend/               Hono API
├─ packages/
│  ├─ db/                 Drizzle schema and migrations
│  └─ shared/             Zod schemas, types, permission helpers
├─ services/
│  └─ file-processor/     Lambda that renders previews, thumbnails and tiles
├─ infra/                 SST config
└─ docker-compose.yml     Postgres and LocalStack for local development
```

---

## Getting Started

You need Node.js, pnpm and Docker.

```bash
pnpm install
pnpm dev                 # starts Docker (Postgres, LocalStack), the backend and the frontend
```

Docker Desktop must be running first. Stop the containers with `pnpm down`.

The frontend runs at `http://localhost:3000` and the API at `http://localhost:8787` (`/health` to check it).

Copy your keys into a `.env` file before using auth or email. It is git-ignored.

---

## Status

Early setup. The monorepo, dependencies and local services are in place. The database schema, auth and the plate viewer are next.
