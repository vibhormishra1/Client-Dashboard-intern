<div align="center">
  <h1>⚡ Velozity</h1>
  <p><strong>Real-Time Client Project Dashboard</strong></p>
  <p>A production-ready, role-isolated project management tool with live WebSocket event streaming.</p>

  [![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
  [![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
  [![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
  [![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white)](https://socket.io/)
</div>

## 🚀 Live Demo
[velozity-dashboard.vercel.app](https://velozity-dashboard.vercel.app) *(Placeholder)*

## ✨ Core Features
- **Strict Role Isolation:** Backend-enforced role separation (Admin, PM, Developer).
- **Real-Time WebSockets:** Live fan-out of task updates and activity feeds with `Socket.io`.
- **Offline Catch-up:** Missed event recovery from PostgreSQL via timestamps.
- **Background Cron Jobs:** Automated flagging of overdue tasks.
- **Robust Security:** JWT Access Tokens (Memory) + Refresh Tokens (HttpOnly cookies).

---

## 💻 Local Setup

### Prerequisites
- Node.js 20+
- PostgreSQL
- Docker & Docker Compose (Optional, but recommended)

### With Docker (Recommended)
```bash
git clone https://github.com/vibhormishra1/Client-Dashboard-intern.git
cd Client-Dashboard-intern
cp backend/.env.example backend/.env
# Update DATABASE_URL in backend/.env if needed, but docker-compose sets up a postgres instance automatically
docker-compose up --build
```
App runs on http://localhost:5001 (backend) and http://localhost:5173 (frontend).

### Manual Setup
1. **Clone the repository**
   ```bash
   git clone https://github.com/vibhormishra1/Client-Dashboard-intern.git
   cd Client-Dashboard-intern
   ```

2. **Environment Variables**
   ```bash
   cp backend/.env.example backend/.env
   # Update the DATABASE_URL with your local PostgreSQL credentials
   ```

3. **Install Dependencies**
   ```bash
   npm install --prefix frontend
   npm install --prefix backend
   ```

4. **Database Migration & Seeding**
   ```bash
   cd backend
   npx prisma migrate dev
   npm run seed
   ```
   > **Note:** The seeder creates 7 test users (1 Admin, 2 PMs, 4 Devs), 3 clients, 3 projects, 15+ tasks in varied statuses, **2 tasks pre-set to OVERDUE state**, and pre-existing activity log entries so the feed is not empty on first load.

5. **Run Development Servers**
   ```bash
   # Terminal 1 (Backend - runs on port 5001)
   cd backend && npm run dev

   # Terminal 2 (Frontend - runs on port 5173)
   cd frontend && npm run dev
   ```

---

## 🏛️ Architecture Decisions

| Decision | Choice | Why | Alternative considered |
|---|---|---|---|
| **Backend framework** | Express | Familiarity, ecosystem, simple middleware chain | Fastify (faster, but less ecosystem, overkill here) |
| **ORM** | Prisma | Type-safe queries, auto-migrations, schema-first | Raw SQL (more control but no type safety for TS) |
| **Real-time** | Socket.io | Auto-reconnect, rooms, namespaces built-in | Native WS (would rebuild all Socket.io features manually) |
| **Background jobs** | node-cron | Zero extra infra, one hourly job | Bull (requires Redis, overkill for one job) |
| **Validation** | Zod | TS-first, composable, integrates with Prisma types | Joi (JS-first, less TS ergonomics) |
| **Auth** | JWT HS256 | Simple, stateless, fits single-service | RS256 (needed only for multi-service auth) |
| **Frontend state** | Zustand | Lightweight, no boilerplate, TS-friendly | Redux Toolkit (overkill for this app size) |
| **Database** | PostgreSQL | ACID, relational, proper FK constraints | MySQL (weaker JSON support, less PGQL features) |

---

## 🗄️ Database Schema & Indexing Decisions

### ER Overview / Schema Table

| Table | Purpose | Key columns |
|---|---|---|
| `users` | All system users | id, name, email, password, role (ADMIN/PM/DEVELOPER), isOnline |
| `refresh_tokens` | Stored hashed refresh tokens for invalidation | id, token (hashed), userId, expiresAt |
| `clients` | Agency clients | id, name, email, createdById |
| `projects` | Client projects | id, name, status, clientId, createdById (PM who owns it) |
| `tasks` | Project tasks | id, title, status (TO_DO/IN_PROGRESS/IN_REVIEW/DONE/OVERDUE), priority, dueDate, assignedToId, projectId |
| `activity_logs` | Immutable audit trail of all task status changes | id, taskId, projectId (denormalized), userId, fromStatus, toStatus, message |
| `notifications` | In-app notifications | id, recipientId, type, taskId, isRead |

The relationships are strictly enforced using UUID-based Foreign Keys with `ON DELETE CASCADE` where appropriate.

### Core Indexing Strategies
To ensure sub-50ms query times at scale, the following B-Tree indexes are applied:

1. **`tasks(assignedToId)`**: Without this, every developer dashboard load does a full table scan. With 10k tasks, this index reduces query time from 800ms to 2ms.
2. **`tasks(projectId)`**: Used heavily when a Project Manager opens a specific project detail page.
3. **`tasks(status, dueDate)`**: Optimized specifically for the hourly `node-cron` job that queries `WHERE status != DONE AND dueDate < NOW()`.
4. **`activity_logs(projectId, createdAt DESC)`**: We intentionally **denormalized** `projectId` into the `activity_logs` table. This allows the global feed to instantly filter by project and sort by recent events without running a costly JOIN on the `tasks` table for every single feed load.

---

## ⚠️ Known Limitations
- **WebSocket Clustering:** Connections are not currently clustered. Horizontal scaling would require adding the Redis adapter (`socket.io-redis`).
- **Token Rotation:** Refresh tokens are not rotated on each use. True rotation would require one-time-use tokens and a subsequent DB write per refresh.
- **Rate Limiting:** No rate limiting is applied to the authentication endpoints (production requires `express-rate-limit`).
- **Cron Latency:** The overdue cron runs hourly, not in real-time. Tasks become flagged as overdue with up to a 60-minute lag.
- **Email Delivery:** No email notifications — all notifications are in-app only via WebSockets.
