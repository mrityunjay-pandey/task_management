# Task Management System

Full Stack Developer (Fresher) technical assessment submission — a task and
project management app closely following a provided Figma design, plus a
product-understanding analysis of AbleSpace's "Take Data" workflow.

## 1. Project Overview

A guest-authenticated task/project manager with Board and List views,
subtasks, comments, an auto-generated activity log, and a two-axis theme
system (Light/Dark × 6 accent colors). Built to closely reproduce the
provided Figma design rather than a generic dashboard template.

## 2. Features

- Guest login (no password), session persists across page refresh
- Task CRUD: create, edit, delete, mark complete/incomplete, search, filter
- Project CRUD, each project drills down into its own scoped task board/list
- Subtasks (reusing the Task model itself via a self-relation)
- Comments and an auto-generated activity feed on each task
- Board (Kanban) and List (grouped table) views for tasks
- Theme system: Light/Dark mode × 6 accent colors, persists after refresh,
  no flash of the wrong theme on load
- Fully responsive (tested down to 390px)
- Profile settings page (email/title/username)
- Loading, empty, and error states throughout
- Backend request validation on every endpoint (class-validator)
- Guests can only ever see/edit their own data (see Security below)

## 3. Tech Stack

- **Frontend:** Next.js (App Router), TypeScript, Tailwind CSS v4, next-themes
- **Backend:** NestJS, TypeScript, class-validator/class-transformer
- **Database:** PostgreSQL via Prisma ORM
- **Auth:** Guest session via httpOnly JWT cookie

## 4. Architecture

```
Browser (Next.js, App Router)
   │  fetch, credentials: "include" (httpOnly session cookie)
   ▼
NestJS REST API
   Controllers (thin - validation + calling services)
        │
   Services (business logic + ownership enforcement)
        │
   Prisma ORM
        │
   PostgreSQL
```

**Auth flow:** `POST /auth/guest` creates a `User` row and sets a signed JWT
as an httpOnly cookie. Every protected route runs through `AuthGuard`, which
verifies that cookie and attaches the resolved user to the request via
`@CurrentUser()`. On every page load, the frontend calls `GET /auth/me` to
check whether the session is still valid — this is what makes a guest
session survive a refresh without using `localStorage` for auth.

**Ownership model:** every task/project query is scoped by `reporterId` /
`leadId` matching the logged-in guest directly in the Prisma `where` clause
— not as an after-the-fact permission check. A guest requesting another
guest's task ID gets a `404`, not a `403`, so the API never confirms whether
a given ID even exists.

## 5. Folder Structure

```
task-management/
├── frontend/
│   ├── app/                 Next.js App Router pages
│   │   ├── login/
│   │   └── (app)/            Authenticated route group (Sidebar shell)
│   │       ├── tasks/
│   │       ├── projects/
│   │       └── settings/
│   ├── components/
│   │   ├── ui/               Button, Input, Modal, Dialog, Select
│   │   ├── tasks/             TaskCard, TaskBoard, TaskList, TaskForm, etc.
│   │   ├── projects/
│   │   ├── layout/            Sidebar, PageHeader, ThemeMenu
│   │   └── states/            EmptyState, LoadingState, ErrorState
│   ├── hooks/                 useAuth, useTasks, useProjects, useAppTheme
│   ├── lib/                   api client, auth/theme providers
│   ├── services/               typed API wrappers
│   └── types/
├── backend/
│   ├── src/
│   │   ├── auth/               guest session, profile update
│   │   ├── tasks/               task CRUD, subtasks, comments
│   │   ├── projects/             project CRUD
│   │   ├── users/
│   │   ├── prisma/
│   │   └── common/               guards, filters, decorators
│   └── prisma/schema.prisma
├── part2/                      AbleSpace product analysis
└── README.md
```

## 6. Setup Instructions

**Prerequisites:** Node.js 20+, npm, a PostgreSQL database (local or hosted
— see Database Setup below).

```bash
git clone https://github.com/mrityunjay-pandey/task_management.git
cd task_management
```

### Backend

```bash
cd backend
npm install
cp .env.example .env
# edit .env: set DATABASE_URL and SESSION_SECRET (see Environment Variables)
npx prisma generate
npx prisma migrate dev --name init
npm run start:dev
```
Backend runs at `http://localhost:4000`.

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
# NEXT_PUBLIC_API_URL should point at the backend above
npm run dev
```
Frontend runs at `http://localhost:3000`. Open it, click "Continue as
Guest", and you're in.

## 7. Environment Variables

**backend/.env**
| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `PORT` | Port the API listens on (default 4000) |
| `CORS_ORIGIN` | Comma-separated allowed frontend origin(s) |
| `SESSION_SECRET` | Secret used to sign the guest session JWT — use a long random string |

**frontend/.env.local**
| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Base URL of the backend API |

Never commit real `.env` files — only `.env.example` with placeholders is
checked in.

## 8. Database Setup

Any PostgreSQL instance works. For a free hosted option: create a database
on [Neon](https://neon.tech) or [Supabase](https://supabase.com), copy the
connection string into `DATABASE_URL`, then run:
```bash
npx prisma generate
npx prisma migrate dev --name init
```
This creates all tables from `backend/prisma/schema.prisma` (User, Task,
Project, TaskMember, Label, Comment, Activity).

## 9. Running Frontend / 10. Running Backend

Covered in Setup Instructions above — both run independently with
`npm run dev` (frontend) and `npm run start:dev` (backend).

## 11. API Documentation

All responses use `{ data, error }`. All routes below except `POST
/auth/guest` require the session cookie (sent automatically by the
frontend).

**Auth**
| Method | Route | Description |
|---|---|---|
| POST | `/auth/guest` | Create a guest session |
| GET | `/auth/me` | Get the current session's user |
| PATCH | `/auth/me` | Update profile (email/title/username) |
| POST | `/auth/logout` | Clear the session |

**Tasks**
| Method | Route | Description |
|---|---|---|
| GET | `/tasks` | List own tasks (`?status=&priority=&search=&projectId=`) |
| POST | `/tasks` | Create a task |
| GET | `/tasks/:id` | Get one task (includes comments, activities, subtasks) |
| PATCH | `/tasks/:id` | Update a task |
| PATCH | `/tasks/:id/status` | Update just the status |
| DELETE | `/tasks/:id` | Delete a task |
| GET/POST | `/tasks/:id/subtasks` | List/create subtasks |
| GET/POST | `/tasks/:id/comments` | List/add comments |

**Projects**
| Method | Route | Description |
|---|---|---|
| GET | `/projects` | List own projects |
| POST | `/projects` | Create a project |
| GET | `/projects/:id` | Get one project |
| PATCH | `/projects/:id` | Update a project |
| DELETE | `/projects/:id` | Delete a project |
| GET | `/projects/:id/tasks` | List that project's tasks |

## 12. Deployment

See the **Deployment** section below (filled in once actually deployed and
verified — not claimed until tested end-to-end).

## 13. Design Decisions

- **Subtasks as a self-relation:** a subtask is just a `Task` with a
  `parentTaskId` pointing at its parent, rather than a separate model —
  avoids duplicating CRUD logic and validation for what's structurally the
  same entity.
- **Activity log is server-written only:** the client never sends activity
  entries directly; the service writes them when it detects a real
  status/priority change. This keeps the log trustworthy as an audit trail.
- **Task editing lives on the detail page, not a modal:** matches the
  Figma interaction (clicking a task swaps the whole content area), and
  keeps `TaskForm` create-only rather than carrying unused edit-mode logic.
- **Ownership enforced in the query itself:** every task/project lookup
  filters by `reporterId`/`leadId` directly in the `where` clause, not as a
  separate permission check afterward.
- **Two-axis theme system:** the Figma design has independent Theme
  (Light/Dark) and Color Mode (6 accents) menus. `next-themes` natively
  supports one axis, so both are encoded into one combined value (e.g.
  `"dark-emerald"`) and split back into two values for the UI via a small
  adapter hook (`useAppTheme`).

## 14. Intentional Deviations from Figma

- **Google login button** is shown (matching the design) but disabled —
  the assessment scope is guest login only.
- **Color Mode accent colors:** the Figma screenshots only show the color
  *picker*, not the applied result on every screen, so the 6 accent colors
  were applied to focus rings, active-nav state, and small UI accents while
  primary buttons stay black/white (consistent with every screenshot we
  have). Documented here as an assumption rather than invented from nothing.
- **Drag-and-drop reordering** (the `⠿` handles visible on Figma board
  cards) was not implemented — status changes happen via a dropdown
  instead. Noted as a scope simplification given the size of the rest of
  the build (Projects, subtasks, comments, activity log were all built in
  full per the agreed scope).
- **Exact hex values / pixel measurements** weren't extractable from the
  provided screenshots (no Figma Inspect panel access was available), so
  colors/spacing are close visual matches rather than pixel-exact.
- The duplicate "Members" checkbox visible in the Figma Fields dropdown
  (appears twice) was treated as a single field — likely a duplication in
  the source file.

## 15. Known Limitations

- No real OAuth (Google button is decorative)
- Activity log only tracks status and priority changes, not every field
- No pagination on task/project lists
- No real-time collaboration (no websockets)
- Profile "picture" is generated initials, not an uploaded image
- Backend tests cover the ownership-critical service logic (Auth, Tasks)
  but not every controller/e2e path, given assessment time constraints

## 16. Part 2

See `part2/analysis.md` for the AbleSpace "Take Data" workflow analysis.

## 17. Screenshots

_(To be added once the app is deployed/running — see Deployment.)_

## 18. Future Improvements

- Drag-and-drop task reordering (`@dnd-kit`)
- Optimistic UI updates instead of refetch-after-mutation
- Real OAuth (Google) as a second auth strategy alongside guest
- Pagination/virtualization for large task lists
- File upload for profile pictures
