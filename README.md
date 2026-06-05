# EmpPulse

## Prerequisites

| Tool | Version | Notes |
|---|---|---|
| JDK | 21 | see install instructions below |
| Docker | any | see install instructions below |
| Node.js | 20+ | only for standalone frontend dev |

### Linux

```bash
sudo apt install openjdk-21-jdk docker.io
sudo usermod -aG docker $USER  # then restart your terminal
```

**Docker Compose v2** (if not bundled):
```bash
DOCKER_CONFIG=${DOCKER_CONFIG:-$HOME/.docker}
mkdir -p $DOCKER_CONFIG/cli-plugins
curl -SL https://github.com/docker/compose/releases/download/v2.35.1/docker-compose-linux-x86_64 \
  -o $DOCKER_CONFIG/cli-plugins/docker-compose
chmod +x $DOCKER_CONFIG/cli-plugins/docker-compose
```

### Windows

Install via [winget](https://learn.microsoft.com/en-us/windows/package-manager/winget/) (run in PowerShell):

```powershell
winget install Microsoft.OpenJDK.21
winget install Docker.DockerDesktop
```

After installing Docker Desktop, **restart your PC**, then launch Docker Desktop from the Start menu and wait for "Engine running" before running any `docker` commands.

---

## Full version (backend + frontend + database)

Builds the React frontend, packages it into the Spring Boot jar, and runs everything via Docker.

```bash
# 1. Build the jar (downloads Node 22 and builds the frontend automatically)
./mvnw clean package -DskipTests     # Linux/macOS
.\mvnw clean package -DskipTests     # Windows (PowerShell)

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
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5433/emppulse_db ./mvnw spring-boot:run   # Linux
$env:SPRING_DATASOURCE_URL="jdbc:postgresql://localhost:5433/emppulse_db"; .\mvnw spring-boot:run  # Windows

# Start the frontend dev server (in a separate terminal)
cd frontend
npm install
npm run dev
```

Frontend → http://localhost:5173  
Backend → http://localhost:8080

---

## Windows — without Docker

If you prefer not to use Docker, install PostgreSQL natively instead:

```powershell
winget install Microsoft.OpenJDK.21
winget install OpenJS.NodeJS.LTS
winget install PostgreSQL.PostgreSQL
```

Create the database once (open **psql** or pgAdmin after PostgreSQL installs):

```sql
CREATE USER "user" WITH PASSWORD 'password';
CREATE DATABASE emppulse_db OWNER "user";
```

Then start the backend and frontend in two separate terminals:

```powershell
# Terminal 1 — backend
.\mvnw spring-boot:run "-Dspring.datasource.url=jdbc:postgresql://localhost:5432/emppulse_db"

# Terminal 2 — frontend
cd frontend
npm install
npm run dev
```

Frontend → http://localhost:5173  
Backend → http://localhost:8080
