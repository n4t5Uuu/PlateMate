# 🍽️ PlateMate

> **⚠️ WORK IN PROGRESS**
> This project is currently under active development. Features are subject to change, and some functionality may be incomplete.

## 🚀 Overview

**PlateMate** is your collaborative management tool designed to be your team's best friend. It aims to help teams manage projects, track tasks, and stay organized efficiently.

## 🛠️ Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Authentication:** Supabase Auth (with Global Context Provider)
- **Database:** Supabase
- **Icons:** Lucide React
- **UI Components:** Radix UI (via Shadcn/ui patterns), Sonner (Toast)

## ✨ Features (Current)

- **Authentication System:**
  - Secure Sign Up & Login via Supabase.
  - Global Session Management (Instant UI updates on login/logout).
  - Protected Routes & Dynamic Sidebar User Profile.
- **Dashboard Layout:**
  - responsive Sidebar navigation.
  - Organization into Workspace, Pinned Projects, and Quick Actions.

## 🚧 Roadmap / Planned Features

- Project & Task Management
- Team Collaboration Tools
- Calendar Integration
- Drag-and-drop Task Boards (Kanban)
- Dark Mode Support

## 🏃‍♂️ Getting Started

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/yourusername/plate-mate.git
    cd plate-mate
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Environment Setup:**
    Create a `.env.local` file in the root directory and add your Supabase credentials:
    ```env
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

5.  Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📂 Project Structure

- `src/app`: App Router pages and layouts.
- `src/components`: Reusable UI components.
  - `providers`: Global context providers (e.g., AuthProvider).
  - `page-components`: Components specific to certain pages (e.g., Sidebar).
- `src/lib`: Utility functions and clients (Supabase client setup).
- `src/hooks`: Custom React hooks.

---
*Created by [Your Name/Team]*
