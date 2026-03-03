# Company Incorporation Tool

A full-stack web application for managing company incorporations with a multi-step form, shareholder management, and admin dashboard.

## Tech Stack

| Layer    | Technology                                       |
| -------- | ------------------------------------------------ |
| Backend  | Node.js, Express.js, PostgreSQL (`pg` library)   |
| Frontend | Vite, React 18, Tailwind CSS, React Router DOM, Axios |
| Database | PostgreSQL                                        |

## Features

- **Multi-step incorporation form** with real-time validation
- **Draft persistence** — refresh the browser or return later, your progress is saved
- **Automatic database initialization** — tables created on server start
- **Admin dashboard** with company list and detail modal
- **JSON aggregation** — companies returned with nested shareholders via `json_agg`
- **Responsive design** — works on desktop and mobile
- **Modern UI** — gradient accents, animations, progress bar, loading spinners

## Setup Instructions

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [PostgreSQL](https://www.postgresql.org/) installed and running

### 1. Create the Database

```sql
CREATE DATABASE company_incorporation;
```

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` to set your PostgreSQL connection string:

```
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/company_incorporation
PORT=5000
```

Start the backend:

```bash
npm run dev
```

The server will automatically create the `companies` and `shareholders` tables on startup.

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### 4. Open the App

Navigate to [http://localhost:5173](http://localhost:5173) in your browser.

## Running Both Servers

Open two terminal windows:

**Terminal 1 — Backend:**
```bash
cd backend && npm run dev
```

**Terminal 2 — Frontend:**
```bash
cd frontend && npm run dev
```

## API Endpoints

| Method | Endpoint                          | Description                          |
| ------ | --------------------------------- | ------------------------------------ |
| POST   | `/api/companies`                  | Create a new company (Step 1 draft)  |
| POST   | `/api/companies/:id/shareholders` | Add shareholders to a company        |
| GET    | `/api/companies`                  | Get all companies with shareholders  |
| GET    | `/api/companies/:id`              | Get a single company with shareholders |

## Reset Database

```sql
DROP TABLE IF EXISTS shareholders;
DROP TABLE IF EXISTS companies;
```

Then restart the backend — tables will be re-created automatically.

## Screenshots

> _Screenshots can be added here after running the application._

## Bonus Features

- ✅ Clean architecture with separation of concerns
- ✅ Auto table creation on startup (`CREATE TABLE IF NOT EXISTS`)
- ✅ JSON aggregation with `json_agg` + `json_build_object`
- ✅ Draft persistence via `localStorage` + backend storage
- ✅ Beautiful, responsive Tailwind CSS UI with animations
- ✅ Proper error handling and validation on both frontend & backend
- ✅ Transaction-based shareholder insertion with rollback support
