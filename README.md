# Company Registration Tool

A simple full-stack web application for registering companies and their shareholders.

## Tech Stack
- **Frontend:** React (Vite), Tailwind CSS, React Router
- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL

## How to Run the Project

### 1. Database Setup
Create a PostgreSQL database named `company_incorporation`:
```sql
CREATE DATABASE company_incorporation;
```

### 2. Backend Setup
The backend runs on port `5000`.

1. Open a terminal and navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on `.env.example` and update your database credentials:
   ```env
   DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/company_incorporation
   PORT=5000
   ```
4. Start the server (it will automatically create the required database tables):
   ```bash
   npm run dev
   ```

### 3. Frontend Setup
The frontend runs on port `5173`.

1. Open a new terminal and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite dev server:
   ```bash
   npm run dev
   ```

### 4. Open the App
Go to `http://localhost:5173` in your browser.

## Features
- **Company Registration:** A simple 2-step form to register a company and its shareholders.
- **Admin Panel:** View all registered companies and their details.
- **Atomic Operations:** Company and shareholders are saved together securely in a single database transaction.
- **Clean UI:** Responsive, minimal, and beginner-friendly design using Tailwind CSS.
