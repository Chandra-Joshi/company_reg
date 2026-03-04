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
   cd backend

2. Install dependencies:
   npm install
  
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
   cd frontend
 
2. Install dependencies:
    npm install
 
3. Start the Vite dev server:
   npm run dev
  

### 4. Open the App
Go to `http://localhost:5173` in your browser.

## Features
- **Company Registration:** A simple 2-step form to register a company and its shareholders.
- **Admin Panel:** View all registered companies and their details.
- **Atomic Operations:** Company and shareholders are saved together securely in a single database transaction.
- **Clean UI:** Responsive, minimal, and beginner-friendly design using Tailwind CSS.



# Company Registration Project - Docker Setup
With Docker, you can run the app **without installing Node.js or PostgreSQL** on your system.

---

## 1️⃣ Requirements

- Docker Desktop installed on your computer  


## 2️⃣ Project Structure


company_registration/company_reg
│
├── backend/ # Node.js backend app
│ ├── Dockerfile # Defines how to build the backend container
│ ├── package.json
│ └── ... other files
│
├── docker-compose.yml # Defines all services (backend + db)
└── README.md


---

## 3️⃣ Dockerfile (Backend)

The `Dockerfile` does the following:

1. Uses a Node.js base image  
2. Copies the backend code into the container  
3. Installs dependencies (`npm install`)  
4. Sets the default command to run the Node.js app  

> This builds the **backend container** that can run anywhere.

---

## 4️⃣ docker-compose.yml

`docker-compose.yml` defines **all services** for this project:

- **backend**: runs the Node.js app  
- **db**: runs PostgreSQL database  

It also defines:

- Port mapping:  
  - Backend → `5000:5000`  
  - PostgreSQL → `5432:5432`  
- Environment variables for database username, password, and database name  
- Dependencies (`backend` depends on `db`)  

---

## 5️⃣ How to Run the Project

 Step 1: Build and start containers

```bash
docker compose up --build -d

--build → rebuild images if code changed

-d → run containers in background

Step 2: Check running containers
docker ps

You should see:

company_reg_container (backend)

company_db_container (database)

Step 3: Stop containers
docker compose down

Stops all containers created by Docker Compose

To remove volumes as well (reset database):
docker compose down -v