# ⚡ TaskFlow — Scalable REST API with Auth & RBAC

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Backend Runtime | Node.js (ESM) |
| Backend Framework | Express.js |
| Database | MongoDB + Mongoose |
| Authentication | JWT (jsonwebtoken) + bcryptjs |
| API Documentation | Swagger UI (swagger-jsdoc + swagger-ui-express) |
| Validation | express-validator |
| Security | helmet, cors, express-rate-limit, express-mongo-sanitize, hpp |
| Frontend | React.js + Vite |
| Styling | Tailwind CSS |
| HTTP Client | Axios |

---

## 📁 Project Structure

```
prime-trade-project/
├── backend/
│   ├── config/
│   │   ├── config.js          # Centralized env config (fail-fast validation)
│   │   ├── db.js              # MongoDB connection
│   │   └── swagger.js         # Swagger/OpenAPI spec
│   ├── middlewares/
│   │   ├── auth.middleware.js  # JWT protect middleware
│   │   ├── role.middleware.js  # RBAC: authorizeRoles(...roles)
│   │   └── error.middleware.js # Global error handler (single source of truth)
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── user.model.js       # Mongoose schema + bcrypt pre-save hook
│   │   │   ├── auth.service.js     # Business logic (register, login, users)
│   │   │   ├── auth.controller.js  # Thin controllers (delegates to service)
│   │   │   ├── auth.validator.js   # express-validator rules
│   │   │   └── auth.routes.js      # Routes + Swagger JSDoc
│   │   └── tasks/
│   │       ├── task.model.js       # Mongoose schema with indexes
│   │       ├── task.service.js     # Business logic + aggregation stats
│   │       ├── task.controller.js  # Thin controllers
│   │       ├── task.validator.js   # Validation rules
│   │       └── task.routes.js      # Routes + Swagger JSDoc
│   ├── utils/
│   │   ├── ApiResponse.js     # Standardized success response class
│   │   ├── ApiError.js        # Custom error class with stack capture
│   │   └── asyncHandler.js    # Async wrapper (eliminates try/catch repetition)
│   ├── app.js                 # Express app with all security middleware
│   ├── server.js              # Entry point with graceful shutdown
│   └── .env.example
└── frontend/
    └── src/
        ├── components/        # Reusable UI components
        ├── context/           # Auth context (React Context API)
        ├── hooks/             # useTasks custom hook
        ├── pages/             # Login, Register, Dashboard
        └── utils/             # Axios instance with interceptors
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB (local or [MongoDB Atlas](https://cloud.mongodb.com))

### 1. Clone the repository

```bash
git clone https://github.com/vishnumegharaj/prime-trade-project.git
cd prime-trade-project
```

### 2. Backend Setup

```bash
cd backend
npm install

# Copy and configure environment variables
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
```

**.env configuration:**
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/prime-trade-project
JWT_SECRET=your_super_secret_jwt_key_min_32_chars
JWT_EXPIRY=7d
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

```bash
# Start the development server
npm run dev
```

Backend runs at: **http://localhost:5000**
API Docs (Swagger): **http://localhost:5000/api-docs**
Health Check: **http://localhost:5000/health**

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: **http://localhost:5173**

---

## 📋 API Endpoints

### Authentication (`/api/v1/auth`)

| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST | `/register` | Public | Register a new user |
| POST | `/login` | Public | Login and receive JWT |
| GET | `/me` | Protected | Get current user profile |
| GET | `/users` | Admin only | Get all users (paginated) |

### Tasks (`/api/v1/tasks`)

| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET | `/` | Protected | Get tasks (own for users; all for admin) |
| POST | `/` | Protected | Create a new task |
| GET | `/stats` | Protected | Get status/priority breakdown |
| GET | `/:id` | Protected | Get a single task |
| PUT | `/:id` | Protected | Update a task |
| DELETE | `/:id` | Protected | Delete a task |

### Query Parameters (GET /tasks)
- `page` — page number (default: 1)
- `limit` — items per page (default: 9)
- `status` — filter by `todo` | `in-progress` | `done`
- `priority` — filter by `low` | `medium` | `high`
- `search` — search by task title (regex)

---

## 🔐 Security Practices

- **Password Hashing** — bcryptjs with salt rounds of 12
- **JWT Authentication** — tokens verified on every protected route; stored in localStorage with auto-expiry handling
- **Rate Limiting** — global 100 req/15min; auth routes limited to 10 req/15min
- **Helmet** — sets secure HTTP headers
- **CORS** — restricted to frontend origin only
- **Mongo Sanitization** — blocks NoSQL injection (`$where`, `$gt`, etc.)
- **HPP** — prevents HTTP parameter pollution
- **Input Validation** — express-validator on all write endpoints
- **Body Size Limit** — `10kb` max JSON payload
- **Fail-Fast Config** — server crashes at startup if required env vars are missing

---

## 🗄️ Database Schema

### User
```js
{
  name: String (2-50 chars),
  email: String (unique, lowercase),
  password: String (hashed, select: false),
  role: Enum['user', 'admin'] (default: 'user'),
  timestamps: true
}
```

### Task
```js
{
  title: String (3-100 chars),
  description: String (max 500 chars),
  status: Enum['todo', 'in-progress', 'done'] (default: 'todo'),
  priority: Enum['low', 'medium', 'high'] (default: 'medium'),
  dueDate: Date,
  owner: ObjectId → User,
  timestamps: true
}
// Indexes: { owner, status } and { owner, createdAt }
```

---

## 📈 Scalability Note

### Current Architecture
This is a **modular monolith** — each domain (auth, tasks) is a self-contained module with its own model, service, controller, validator, and routes. New modules (e.g., `notifications`, `projects`) can be added without touching existing code.

### Path to Microservices
When traffic grows, each module can be extracted into its own independently deployable service:
- **Auth Service** — handles registration, login, token issuance
- **Task Service** — CRUD operations, publishes events (task created, completed)
- **Notification Service** — subscribes to events, sends emails/push

Services communicate via a **message broker** (Redis Pub/Sub or RabbitMQ) for async workflows.

### Caching Strategy
- **Redis** for session storage and frequently-read data (user profiles, task stats)
- Cache invalidation on write operations using cache-aside pattern
- Estimated read latency reduction: 10ms → <1ms for cached endpoints

### Horizontal Scaling
- **Load Balancer** (Nginx or AWS ALB) distributes traffic across multiple Node.js instances
- **Stateless JWT** tokens make horizontal scaling trivial — no shared session store needed
- **MongoDB Atlas** with replica sets for high availability and read scaling

### Additional Production Considerations
- **Docker** containerization (each service has its own `Dockerfile`)
- **Docker Compose** for local multi-service development
- **Structured Logging** with Winston + correlation IDs for distributed tracing
- **Health check endpoint** (`/health`) for load balancer probes and K8s readiness checks
- **API Versioning** (`/api/v1/`) ensures backward compatibility during upgrades
- **CI/CD** pipeline with automated tests before deployment

---

## 🧪 Testing the API with Swagger

1. Navigate to **http://localhost:5000/api-docs**
2. Register a user via `POST /auth/register`
3. Login via `POST /auth/login` — copy the `token` from the response
4. Click **Authorize** (top right), enter `<your-token>` — Swagger stores it for all subsequent calls
5. Test all task CRUD endpoints

---

## 📦 Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `MONGO_URI` | ✅ | — | MongoDB connection string |
| `JWT_SECRET` | ✅ | — | Secret for signing JWT tokens |
| `PORT` | ❌ | 5000 | Server port |
| `JWT_EXPIRY` | ❌ | 7d | JWT token expiry |
| `NODE_ENV` | ❌ | development | Environment |
| `CLIENT_URL` | ❌ | http://localhost:5173 | Frontend URL (for CORS) |
