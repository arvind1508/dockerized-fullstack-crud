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

## Run Production Compose

The production Compose file uses the optimized Dockerfiles:

- Frontend: `frontend/Dockerfile.prod`, served by Nginx on port `80`
- Backend: `backend/Dockerfile.prod`, served on container port `5000`

Start production services:

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

Stop production services:

```bash
docker compose -f docker-compose.prod.yml down
```

View production logs:

```bash
docker compose -f docker-compose.prod.yml logs -f
```

In production Compose:

- Frontend: `http://localhost`
- Backend API: `http://localhost:8000`
- Swagger UI: `http://localhost:8000/api-docs`

The backend still listens inside Docker on port `5000`, but the host port is `8000` to avoid conflicts with macOS port `5000`.

## Service URLs

- Backend API: `http://localhost:8000`
- Swagger UI: `http://localhost:8000/api-docs`
- Swagger JSON: `http://localhost:8000/api-docs.json`
- PostgreSQL: `localhost:5433`
- Redis: `localhost:6379`

Inside Docker, the backend listens on port `5000`. Docker maps it to host port `8000`.

## AWS EC2 Deployment

These steps deploy the app on an AWS EC2 instance using Docker Compose.

### 1. Launch EC2

Create an EC2 instance with:

- Ubuntu Server 22.04 or 24.04
- Instance type: `t2.micro` or larger
- Security group inbound rules:

| Port | Source | Purpose |
| --- | --- | --- |
| 22 | Your IP | SSH |
| 80 | `0.0.0.0/0` | React frontend |
| 8000 | `0.0.0.0/0` | Backend API and Swagger |

### 2. Connect to EC2

```bash
ssh -i your-key.pem ubuntu@YOUR_EC2_PUBLIC_IP
```

### 3. Install Docker

```bash
sudo apt update
sudo apt install -y ca-certificates curl git
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo $VERSION_CODENAME) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo usermod -aG docker ubuntu
```

Log out and SSH back in so the Docker group permission applies.

### 4. Clone The Project

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
cd YOUR_REPO
```

If you copy files manually instead of using GitHub, make sure `docker-compose.prod.yml`, `backend`, and `frontend` are all present.

### 5. Build And Start

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

Check containers:

```bash
docker compose -f docker-compose.prod.yml ps
```

Check logs:

```bash
docker compose -f docker-compose.prod.yml logs -f
```

### 6. Open The App

Replace `YOUR_EC2_PUBLIC_IP` with your EC2 public IP:

- Frontend: `http://YOUR_EC2_PUBLIC_IP`
- Backend API: `http://YOUR_EC2_PUBLIC_IP:8000/users`
- Swagger UI: `http://YOUR_EC2_PUBLIC_IP:8000/api-docs`

### 7. Update Deployment

After pushing new code to GitHub:

```bash
git pull
docker compose -f docker-compose.prod.yml up -d --build
```

### 8. Stop Deployment

```bash
docker compose -f docker-compose.prod.yml down
```

To remove the PostgreSQL volume too:

```bash
docker compose -f docker-compose.prod.yml down -v
```

Only use `down -v` when you are okay deleting database data.

### AWS Troubleshooting

If the frontend opens but API calls fail:

- Confirm backend is running:

```bash
docker compose -f docker-compose.prod.yml ps
```

- Confirm backend logs show `Backend running on port 5000`:

```bash
docker compose -f docker-compose.prod.yml logs backend
```

- Confirm the EC2 security group allows inbound TCP port `8000`.

- Test the API from inside EC2:

```bash
curl http://localhost:8000/users
```

- Test the API from your laptop:

```bash
curl http://YOUR_EC2_PUBLIC_IP:8000/users
```

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
