# Fullstack Docker CRUD API

A simple Node.js backend API using Express, PostgreSQL, Redis, Docker Compose, and Swagger documentation.

## Tech Stack

- Node.js
- Express
- PostgreSQL
- Redis
- Docker Compose
- Swagger / OpenAPI

## Project Structure

```text
.
├── backend
│   ├── app.js
│   ├── redisClient.js
│   ├── swagger.js
│   ├── init.sql
│   ├── Dockerfile
│   ├── package.json
│   └── package-lock.json
├── docker-compose.yml
└── README.md
```

## Run With Docker

Start all services:

```bash
docker compose up --build
```

Run in the background:

```bash
docker compose up -d --build
```

Stop services:

```bash
docker compose down
```

Stop services and remove database volume:

```bash
docker compose down -v
```

## Service URLs

- Backend API: `http://localhost:8000`
- Swagger UI: `http://localhost:8000/api-docs`
- Swagger JSON: `http://localhost:8000/api-docs.json`
- PostgreSQL: `localhost:5433`
- Redis: `localhost:6379`

Inside Docker, the backend listens on port `5000`. Docker maps it to host port `8000`.

## API Endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/users` | Get all users |
| POST | `/users` | Create a user |
| PUT | `/users/:id` | Update a user |
| DELETE | `/users/:id` | Delete a user |

## Example Requests

Create a user:

```bash
curl -X POST http://localhost:8000/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Arvind Kumar","email":"arvind@example.com"}'
```

Get users:

```bash
curl http://localhost:8000/users
```

Update a user:

```bash
curl -X PUT http://localhost:8000/users/1 \
  -H "Content-Type: application/json" \
  -d '{"name":"Arvind Updated","email":"updated@example.com"}'
```

Delete a user:

```bash
curl -X DELETE http://localhost:8000/users/1
```

## Environment Variables

The Docker Compose file sets these backend variables:

```text
DB_HOST=db
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=crud_db
PORT=5000
REDIS_HOST=redis
REDIS_PORT=6379
```

## Redis Cache

`GET /users` caches the user list in Redis using the key `users:all` for 1 hour.

The cache is cleared when a user is created, updated, or deleted.

## Useful Commands

View container status:

```bash
docker compose ps
```

View backend logs:

```bash
docker compose logs backend
```

View fresh backend logs:

```bash
docker compose logs backend --since 1m
```

Rebuild only the backend:

```bash
docker compose up -d --build backend
```
