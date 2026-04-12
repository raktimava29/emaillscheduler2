# 📬 Chronomail — Email Scheduling System

**Chronomail** is a full-stack email scheduling platform that allows users to compose, schedule, and manage email deliveries efficiently. It uses Redis-backed job queues for asynchronous processing and ensures reliable, fault-tolerant email delivery.

> 🚀 Backend Deployed at: https://emaillscheduler2.onrender.com

---

## 🛠️ Tech Stack

### Frontend (`frontend/`)

* React (Vite + TypeScript)
* Tailwind CSS
* Context API (Auth management)
* Axios for API communication

### Backend (`backend/`)

* Node.js & Express (TypeScript)
* PostgreSQL (Supabase)
* Redis + BullMQ (job queue system)
* JWT Authentication + Google OAuth
* Nodemailer (SMTP / Ethereal)

---

## 🔐 Features

* 📅 Schedule emails for future delivery
* ⚡ Instant email sending support
* 🔁 Automatic retries for failed jobs (BullMQ)
* 🔐 Secure authentication (JWT + Google OAuth)
* 📊 Dashboard to manage scheduled and sent emails
* 📦 RESTful API architecture
* 🧪 Centralized validation and error handling
* 📦 Backend deployed on Render

---

## 🚀 Getting Started

### Clone the repo

```bash
git clone https://github.com/your-username/chronomail.git
cd chronomail
```

### Setup Backend

```bash
cd backend
npm install
npm run dev
```

### Setup Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## ⚙️ Environment Variables

Create a `.env` file inside the `backend/` folder:

```env
PORT=4000

# PostgreSQL (Supabase / Render)
DATABASE_URL=your_postgres_connection_string

# Redis (BullMQ)
REDIS_URL=your_redis_connection_string

# Email Service (SMTP / Ethereal)
ETHEREAL_USER=your_ethereal_email
ETHEREAL_PASS=your_ethereal_password

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:4000/auth/google/callback

# JWT
JWT_SECRET=your_jwt_secret
```

---

## 🔄 API Highlights

* `POST /email/schedule` → Schedule an email
* `POST /email/send` → Send instantly
* `GET /email` → Fetch email history
* `POST /auth/login` → User authentication

---

## 🧠 System Design

Chronomail follows a **producer-consumer architecture**:

* API server pushes email jobs into a Redis queue (producer)
* Worker processes jobs and sends emails at scheduled time
* Failed jobs are retried automatically for reliability

---
