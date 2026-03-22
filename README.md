# Nail Art Studio Management System

## Tech Stack

### Backend

- Node.js
- Express.js
- PostgreSQL
- JWT Auth (Access + Refresh)
- bcrypt
- multer
- Helmet, CORS, Morgan
- MVC + Service Layer + Repository

### Frontend

- React (Vite)
- Tailwind CSS
- React Router v6
- Axios
- Zustand (auth state)

## Project Structure

- `backend/` Express API
- `frontend/` React app

## Backend Setup

### 1) Install dependencies

```bash
npm install
```

Run from `backend/`.

### 2) Configure environment

Copy:

- `.env.example` to `.env`

Update DB + secrets.

### 3) Create database + schema

Create the database (example `nail_studio`) and run:

- `backend/sql/schema.sql`

### 4) Seed initial admin

Set environment variables and run:

```bash
SEED_ADMIN_EMAIL=admin@example.com SEED_ADMIN_PASSWORD=StrongPass123 npm run seed:admin
```

### 5) Start API

```bash
npm run dev
```

API runs at:

- `http://localhost:4000`

Uploads served at:

- `http://localhost:4000/uploads/...`

## Frontend Setup

### 1) Install dependencies

Run from `frontend/`:

```bash
npm install
```

### 2) Configure environment

Create `frontend/.env`:

```bash
VITE_API_URL=http://localhost:4000
```

### 3) Start frontend

```bash
npm run dev
```

Frontend runs at:

- `http://localhost:5173`

## Auth Flow

- `POST /api/auth/login`
  - returns `accessToken` and `user`
  - sets refresh token as **httpOnly cookie**

- `POST /api/auth/refresh-token`
  - rotates refresh token
  - returns new `accessToken` and `user`

## RBAC Guarantee

- Admin routes are protected with `authorize(['admin'])`
- Staff routes are protected with `authorize(['staff'])`
- **Staff cannot access completed works list** because `/api/admin/completed-works` is admin-only on the backend.

## API Endpoints

### Auth

- `POST /api/auth/login`
- `POST /api/auth/refresh-token`

### Admin

- `POST /api/admin/create-admin`
- `POST /api/admin/create-staff`
- `GET /api/admin/users`
- `DELETE /api/admin/users/:id`
- `GET /api/admin/appointments`
- `GET /api/admin/completed-works`
- `GET /api/admin/dashboard-stats`
- `GET /api/admin/activity-logs`

### Staff

- `POST /api/staff/appointments`
- `GET /api/staff/my-appointments`
- `POST /api/staff/upload-work` (multipart, field `image`)
