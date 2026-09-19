# task-manager-api

Practical 4 — RESTful API with Node.js and Express.

## Setup

```bash
cd task-manager-api
npm install
node server.js
```

Server runs on http://localhost:5000

## Endpoints

| Method | Route        | Description               |
|--------|--------------|---------------------------|
| GET    | /tasks       | List all tasks            |
| GET    | /tasks/:id   | Get a single task         |
| POST   | /tasks       | Create a task              |
| PUT    | /tasks/:id   | Update a task              |
| DELETE | /tasks/:id   | Delete a task              |

## Middleware pipeline

1. `express.json()` — parses JSON request bodies
2. Request logger — logs method, URL, and timestamp for every request
3. Content-Type validator — rejects POST/PUT without `application/json`
4. Route-specific `validateIdParam` — checks `:id` is a positive integer
5. 404 handler — catches undefined routes
6. Global error handler — always defined last, returns a safe 500 response

## Testing with curl

```bash
curl http://localhost:5000/tasks
curl -X POST http://localhost:5000/tasks -H "Content-Type: application/json" -d '{"title":"New task"}'
curl -X PUT http://localhost:5000/tasks/1 -H "Content-Type: application/json" -d '{"completed":true}'
curl -X DELETE http://localhost:5000/tasks/1
```
