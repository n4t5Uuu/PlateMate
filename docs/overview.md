# PlateMate — Product Overview

## What it is

PlateMate is a project management web app built specifically for architecture students and professionals. It manages the full lifecycle of an architectural project — from brief and concept through to plate submission — with a focus on the revision process that makes architecture unique.

Unlike general PM tools (Notion, Asana), PlateMate is built around the concept of **plates**: design drawings that go through multiple revision rounds, get annotated with feedback, and need a clear version history.

## Who it's for

- Architecture students managing studio projects
- Small architecture firms managing client work
- Anyone who needs version-controlled design deliverables with structured feedback

## Core Concepts

### Workspace
The top-level container. Think of it like an organization in GitHub or a team in Notion. A user gets one workspace by default on signup ("Alden's Workspace"). Additional workspaces can be created. Each workspace has members with roles (owner / member).

### Project
Lives inside a workspace. Represents one architectural project (e.g. "Housing Development — Phase 1"). Has a status (Active / Review / Completed / Delayed), priority, due date, and progress.

### Plate
The architectural drawing or submission artifact. A project has many plates. Each plate has a version history — this is the core feature that makes PlateMate different from a generic PM tool.

### Version
A snapshot of a plate at a point in time. Versions can be annotated with pins, receive revision notes, and be compared side-by-side.

### Moodboard
A per-project inspiration board. Users can pin images, links, and references to help communicate design intent to teammates or clients.

## Feature Map

```
Workspace
  └── Projects
        ├── Tasks & Subtasks
        ├── Project Members
        ├── Plate Versions
        │     ├── Annotations (pin-based)
        │     └── Revision Notes
        ├── Moodboard
        ├── Project Brief (AI-parsed)
        ├── Submission Checklist
        ├── Crit Sessions
        └── Activity Log
```

## What makes it different

1. **Plate versioning** — not just file uploads; each version is a structured record with annotations and revision feedback baked in
2. **Architecture-specific workflow** — crit sessions, submission checklists, project briefs
3. **AI features** — AI-parsed project briefs and per-project chat (planned)
4. **Moodboard** — inspiration collection inside the project, not in a separate tool

## Tech Stack at a glance

- Next.js (App Router) + TypeScript
- Supabase (PostgreSQL + Row Level Security + Auth)
- Tailwind CSS + shadcn/ui

Full technical detail: [../agent_docs/service_architecture.md](../agent_docs/service_architecture.md)
