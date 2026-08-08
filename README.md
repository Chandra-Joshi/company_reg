# CA Firm Management System

A full-stack management system for Chartered Accountant firms, built around
**Permission-Based Access Control (PBAC)**: instead of hard-coding what a
"Manager" or "Staff" role can do, every action in the system is gated by a
granular permission key (`client.create`, `tax.approve`, ...). Roles are just
named bundles of permissions, and individual users can additionally be
granted or explicitly denied specific permissions on top of their roles.

## Tech Stack

- **Backend:** Node.js, Express, TypeScript, Prisma ORM, PostgreSQL, JWT auth
- **Frontend:** React (Vite), TypeScript, Tailwind CSS, React Router
- **Database:** PostgreSQL

## How PBAC works here

- **Permissions** are fine-grained action keys (`client.create`, `task.assign`, `tax.approve`, ...) — see the full catalog in [backend/src/constants/permissions.ts](backend/src/constants/permissions.ts).
- **Roles** bundle permissions together (e.g. `Manager`, `Accountant`, `Staff`) and are assignable to users.
- **Direct user overrides** let an admin grant or deny a specific permission to one user regardless of their role — a direct `DENY` always wins over a role-granted `ALLOW`.
- A user's **effective permissions** = (permissions from all their roles) + (direct `ALLOW` grants) − (direct `DENY` grants), recomputed from the database on every request so access changes apply immediately, without requiring re-login.
- Every state-changing request is checked by an `authorize(...permissionKeys)` middleware and recorded to the `AuditLog` table.

## Core Modules

1. **Client Management** — client profiles, KYC status, document uploads, communication history, staff assignment
2. **Employee Management** — staff records, departments, designations, performance notes
3. **Role & Permission Management** — roles, the permission catalog, per-user role/permission overrides, audit log viewer
4. **Task Management** — task creation, assignment, deadlines, progress tracking
5. **Tax Filing** — ITR, GST, TDS, Advance Tax and Tax Notices, with a draft → submit → approve/reject workflow

## Project Structure

```
backend/    Express + TypeScript API, Prisma schema & migrations
frontend/   React + TypeScript SPA (Vite)
```

## Running locally

### 1. Database

Start PostgreSQL (via Docker, or your own local instance). With Docker:

```bash
docker compose up -d db
```

This starts Postgres on `localhost:5432` with database `ca_firm_management` (user `postgres` / password `12345` — see `docker-compose.yml`).

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env      # adjust DATABASE_URL / JWT_SECRET as needed
npm run prisma:migrate    # creates tables
npm run prisma:seed       # seeds the permission catalog, default roles, and an admin user
npm run dev                # http://localhost:5000
```

The seed script creates a `Super Admin` role with every permission and a login:

```
email:    admin@cafirm.com
password: Admin@12345
```

(both configurable via `ADMIN_EMAIL` / `ADMIN_PASSWORD` in `.env`)

Uploaded client documents are stored on local disk under `backend/uploads/` and served at `/uploads/<file>`.

### 3. Frontend

```bash
cd frontend
npm install
cp .env.example .env      # VITE_API_URL, defaults to http://localhost:5000/api
npm run dev                # http://localhost:5173
```

Log in with the seeded admin account above, then use **Roles & Permissions**
to create additional roles / assign permissions, and **Employees** to create
staff accounts (each employee record creates a linked login user).

## Default seeded roles

| Role | Notes |
|---|---|
| Super Admin | every permission (system role, cannot be edited/deleted) |
| Partner | full access across all modules |
| Manager | client/task/tax workflows, no delete/approve rights |
| Accountant | tax filing preparation and client updates |
| Staff | read-mostly access to clients/tasks/tax filings |

These are a starting point — permissions on any non-system role can be freely
edited from the **Roles & Permissions** page, and roles/permissions can be
assigned per-user from the **User Access** tab.

## Docker

```bash
docker compose up --build -d
```

Runs the backend (applying `prisma migrate deploy` on startup) and a
PostgreSQL database. Run `npm run prisma:seed` against that database
separately (or exec into the container) to seed the permission catalog and
admin user the first time.
