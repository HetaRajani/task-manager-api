# Task Manager API (Backend)

Practical 5 & 6 — RESTful API built with Node.js, Express, and MongoDB/Mongoose.

Part of the full-stack Task Manager application, integrated with the [Portfolio Frontend](../portfolio).

---

## Getting Started

### 1. Prerequisites
- Node.js (v18+)
- MongoDB Atlas cluster or local MongoDB instance

### 2. Environment Configuration
Copy the example environment file and configure your database connection string:

```bash
cp .env.example .env
```

Edit `.env` and set your MongoDB connection string:
```env
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/task-manager?retryWrites=true&w=majority
PORT=5000
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Start the Server
```bash
node server.js
```

The API server runs on `http://localhost:5000`.

---

## API Endpoints

| Method | Route | Description | Request Body | Status Codes |
|---|---|---|---|---|
| `GET` | `/tasks` | List all tasks | None | `200` |
| `GET` | `/tasks/:id` | Get single task by ID | None | `200`, `400` (invalid id), `404` (not found) |
| `POST` | `/tasks` | Create a new task | `{ "title": "...", "description": "...", "priority": "low"\|"medium"\|"high" }` | `201`, `400` (validation) |
| `PUT` | `/tasks/:id` | Update task by ID | `{ "completed": true, ... }` | `200`, `400` (validation), `404` (not found) |
| `DELETE` | `/tasks/:id` | Delete task by ID | None | `200`, `400` (invalid id), `404` (not found) |

---

## Architecture & Middleware

1. **CORS (`cors`)**: Enabled globally before routes to allow cross-origin requests from the React frontend running on `http://localhost:5173`.
2. **JSON Parser (`express.json()`)**: Parses incoming request bodies with JSON payloads.
3. **Request Logger**: Logs HTTP method, URL, and timestamp for every request.
4. **Content-Type Validation**: Enforces `Content-Type: application/json` on `POST` and `PUT` requests.
5. **ObjectId Validation (`validateIdParam`)**: Verifies `:id` parameter format before hitting the database.
6. **Mongoose Model (`models/Task.js`)**:
   - Fields: `title` (required, trimmed), `description`, `completed` (default `false`), `priority` (`low`/`medium`/`high`, default `medium`), `createdAt`.
   - Pre-save hook trims whitespace from task titles.
7. **Global Error Handler**: Returns structured JSON responses for validation errors (`400`), cast errors (`400`), and unknown errors (`500`).

---

## Frontend Integration

This backend serves the React + Vite frontend located in the [portfolio repo](../portfolio).
For the full application experience, make sure this backend is running on `http://localhost:5000` before starting the frontend dev server.

## Frontend
The React frontend (Tasks page) lives in https://github.com/HetaRajani/portfolio- on the `practical-6` branch. CORS is enabled so it can call this API from localhost:5173.
