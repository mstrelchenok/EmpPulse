# EmpPulse

## Prerequisites

| Tool | Version | Notes |
|---|---|---|
| JDK | 21 | `sudo apt install openjdk-21-jdk` |
| Docker | any | `sudo apt install docker.io` |
| docker compose | v2 | see below |
| Node.js | 20+ | only for standalone frontend dev |

**Docker Compose v2** (if not installed):
```bash
DOCKER_CONFIG=${DOCKER_CONFIG:-$HOME/.docker}
mkdir -p $DOCKER_CONFIG/cli-plugins
curl -SL https://github.com/docker/compose/releases/download/v2.35.1/docker-compose-linux-x86_64 \
  -o $DOCKER_CONFIG/cli-plugins/docker-compose
chmod +x $DOCKER_CONFIG/cli-plugins/docker-compose
```

Add your user to the docker group (required once):
```bash
sudo usermod -aG docker $USER
# then restart your terminal
```

---

## Full version (backend + frontend + database)

Builds the React frontend, packages it into the Spring Boot jar, and runs everything via Docker.

```bash
# 1. Build the jar (downloads Node 22 and builds the frontend automatically)
./mvnw clean package -DskipTests

# 2. Start all services
docker compose up --build
```

App → http://localhost:8080  
Default login: `owner@emppulse.com` / `admin`

To stop:
```bash
docker compose down
```

---

## Frontend only (dev mode)

Runs the Vite dev server with hot reload. Requires the backend to be running separately for API calls to work.

```bash
# Start the database
docker compose up -d db

# Start the backend (in a separate terminal)
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5433/emppulse_db ./mvnw spring-boot:run

# Start the frontend dev server (in a separate terminal)
cd frontend
npm install
npm run dev
```

Frontend → http://localhost:5173  
Backend → http://localhost:8080
