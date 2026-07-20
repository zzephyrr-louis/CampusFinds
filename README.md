# CampusFind

CampusFind is a campus lost-and-found system with a React frontend, a Spring Boot REST API, and MySQL persistence. Students can report, search, and claim items; administrators can review claims, manage users, and inspect recent system activity.

The authoritative runtime is:

- React production build served at `http://127.0.0.1:5173`
- Spring Boot API at `http://127.0.0.1:8080/api`
- MySQL database named `campusfind`

The retired Express/SQLite server is not part of the application anymore.

## Quick start on Windows

### Requirements

- Windows 10 or 11
- Java 17 or newer on `PATH`
- Node.js supported by Vite 8 (`20.19+` or `22.12+`) and npm on `PATH`
- MySQL 8 running locally
- A current checkout of this repository

Configure MySQL and the environment variables described below, then run this from the repository root:

```powershell
.\run.cmd
```

You can also double-click `run.cmd`. The launcher:

1. Checks Java, Node.js, npm, and the required project files.
2. Installs locked frontend dependencies with `npm ci` when needed.
3. Builds React with the Spring API URL.
4. Reuses a healthy Spring process or starts one on port `8080`.
5. Waits until Spring and MySQL pass `GET /api/health`.
6. Reuses the current production build or serves it on port `5173`.
7. Opens CampusFind in the default browser.

Backend, frontend, and build output is written to the ignored `logs` directory. The two servers run in separate minimized command windows; close those windows to stop CampusFind.

The launcher refuses to reuse an unrelated process on ports `8080` or `5173`. If it reports a port conflict, stop the existing process and run it again.

## MySQL setup

The default configuration can create `campusfind` when the configured MySQL account has permission. A dedicated local account is safer than using `root`. Run the following once in MySQL Workbench or the MySQL client while connected as an administrator, replacing the sample password:

```sql
CREATE DATABASE IF NOT EXISTS campusfind
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS 'campusfind_app'@'localhost'
  IDENTIFIED BY 'replace-with-a-local-password';

GRANT ALL PRIVILEGES ON campusfind.*
  TO 'campusfind_app'@'localhost';

FLUSH PRIVILEGES;
```

Set the connection values in the same PowerShell session that will launch CampusFind:

```powershell
$env:DB_URL = 'jdbc:mysql://localhost:3306/campusfind?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC'
$env:DB_USERNAME = 'campusfind_app'
$env:DB_PASSWORD = 'replace-with-a-local-password'
$env:JWT_SECRET = 'replace-with-a-long-random-development-secret'
.\run.cmd
```

These process variables are not written to the repository. Do not add real database passwords or JWT secrets to tracked files.

Hibernate uses `spring.jpa.hibernate.ddl-auto=update`: it creates or updates required tables without deleting existing records. The application persists data in these tables:

| Table | Purpose and relationships |
| --- | --- |
| `users` | Unique student ID and email, BCrypt password, role, and account status |
| `items` | Lost/found reports; each belongs to a reporter and can optionally reference a related report |
| `item_claims` | Belongs to one item and claimant, optionally one reviewing admin; unique per item and claimant |
| `notifications` | Belongs to one user and can reference an item or claim |
| `activity_logs` | Records administrative/system activity and an optional actor |

## Configuration reference

Spring reads the following environment variables. Defaults are intended only for local development.

| Variable | Default | Purpose |
| --- | --- | --- |
| `DB_URL` | `jdbc:mysql://localhost:3306/campusfind?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC` | JDBC connection URL |
| `DB_USERNAME` | `root` | MySQL username |
| `DB_PASSWORD` | `root` | MySQL password |
| `JWT_SECRET` | Development-only fallback | Secret used to sign login tokens |
| `JWT_EXPIRATION_MS` | `86400000` | Token lifetime in milliseconds |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:5173,http://127.0.0.1:5173` | Comma-separated frontend origins |
| `UPLOAD_DIR` | `uploads` | Image storage directory, relative to `springboot-backend` when using the launcher |
| `JPA_SHOW_SQL` | `false` | Log SQL statements |
| `JPA_FORMAT_SQL` | `false` | Format logged SQL |
| `ADMIN_STUDENT_ID` | `ADMIN-0001` | Optional bootstrap administrator ID |
| `ADMIN_FULLNAME` | `CampusFind Administrator` | Optional bootstrap administrator name |
| `ADMIN_EMAIL` | Empty | Administrator bootstrap is disabled when empty |
| `ADMIN_PASSWORD` | Empty | Bootstrap password; must contain at least 8 characters |

### Create the first administrator

Public registration always creates a student. To create the first administrator in an empty database, set all bootstrap values before the first successful backend start:

```powershell
$env:ADMIN_STUDENT_ID = 'ADMIN-0001'
$env:ADMIN_FULLNAME = 'CampusFind Administrator'
$env:ADMIN_EMAIL = 'admin@campusfind.local'
$env:ADMIN_PASSWORD = 'replace-with-a-strong-password'
.\run.cmd
```

Bootstrap is idempotent: it does not create another account when the email or student ID already exists. It does not reset an existing password. Clear the variables after the account has been created if you no longer need bootstrap.

## Manual development commands

### Spring Boot API

Run backend tests:

```powershell
cd springboot-backend
.\mvnw.cmd clean test
```

Start the API manually:

```powershell
cd springboot-backend
.\mvnw.cmd spring-boot:run
```

The API is ready only when this returns HTTP 200:

```powershell
curl.exe http://127.0.0.1:8080/api/health
```

### React frontend

For hot reload, open another PowerShell window:

```powershell
cd client
$env:VITE_API_URL = 'http://127.0.0.1:8080/api'
npm.cmd ci
npm.cmd run dev
```

Before requesting a merge, run:

```powershell
cd client
npm.cmd run lint
$env:VITE_API_URL = 'http://127.0.0.1:8080/api'
npm.cmd run build
```

To serve that production build without Vite's development server:

```powershell
npm.cmd run serve
```

## Main workflows

### Student workflow

1. Register or log in.
2. Submit a lost-item or found-item report, with an optional image.
3. Search and filter saved reports, then open an item for full details.
4. Submit one ownership claim for an available item and review it in Claim History.
5. Read notifications generated by matching and claim-review activity.

Reports, claims, users, and notification read state are stored in MySQL and survive browser refreshes and server restarts.

### Administrator workflow

1. Log in with the bootstrapped administrator account.
2. Review dashboard totals, recent reports, recent claims, and activity.
3. Approve or reject pending claims with optional remarks.
4. Edit, suspend, or delete user accounts where allowed; administrators can also create accounts through the documented API.
5. Review the administrative activity log.

The API enforces administrator-only operations server-side; hiding a frontend control is not the security boundary.

## API overview

Login and registration are public. The health endpoint is public so the launcher can verify MySQL. All other `/api` endpoints require a valid Bearer token; administrator operations additionally require the `admin` role.

| Area | Method and path | Purpose |
| --- | --- | --- |
| Health | `GET /api/health` | API and database readiness |
| Authentication | `POST /api/auth/register` | Create a student account |
| Authentication | `POST /api/auth/login` | Authenticate and issue a JWT |
| Authentication | `GET /api/auth/me` | Current authenticated user |
| Items | `GET /api/items` | Search/filter items with `q`, `type`, `category`, `status`, `days`, and `sort` |
| Items | `GET /api/items/lost` | Lost reports |
| Items | `GET /api/items/found` | Found reports |
| Items | `GET /api/items/claimable` | Items currently eligible for claims |
| Items | `GET /api/items/{itemId}` | Item details |
| Items | `POST /api/items` | Create a lost/found report |
| Items | `POST /api/items/lost`, `POST /api/items/found` | Type-specific report aliases |
| Items | `PUT /api/items/{itemId}` | Update an item when authorized |
| Items | `PUT /api/items/{itemId}/status` | Update item status |
| Items | `DELETE /api/items/{itemId}` | Delete an item when authorized |
| Claims | `GET /api/claims` | All claims (administrator) |
| Claims | `GET /api/claims/mine` | Current user's claim history |
| Claims | `GET /api/claims/user/{userId}` | Claims for a user (administrator) |
| Claims | `GET /api/claims/{claimId}` | Claim details when authorized |
| Claims | `POST /api/claims` | Submit a claim |
| Claims | `PUT /api/claims/{claimId}/approve` | Approve a pending claim (administrator) |
| Claims | `PUT /api/claims/{claimId}/reject` | Reject a pending claim (administrator) |
| Claims | `DELETE /api/claims/{claimId}` | Delete a claim when authorized |
| Dashboard | `GET /api/dashboard/summary` | Item/claim totals and recent activity |
| Notifications | `GET /api/notifications` | Current user's notifications |
| Notifications | `GET /api/notifications/unread-count` | Current unread total |
| Notifications | `PATCH /api/notifications/{id}/read` | Mark one notification read |
| Notifications | `PATCH /api/notifications/read-all` | Mark all current-user notifications read |
| Users | `GET /api/users` | List users (administrator) |
| Users | `GET /api/users/me` | Current user profile |
| Users | `GET /api/users/{userId}` | User details (administrator) |
| Users | `POST /api/users` | Create a user (administrator) |
| Users | `PUT /api/users/{userId}` | Update a user (administrator) |
| Users | `DELETE /api/users/{userId}` | Delete a user (administrator) |
| Activity | `GET /api/activity` | Recent activity (administrator) |
| Files | `POST /api/files/upload` | Upload a validated item/claim image |

Uploaded images are served from `/uploads/**`. Requests that fail validation return structured `400` responses; missing records return `404`; duplicate accounts or claims return `409`; unauthorized and forbidden requests return `401` and `403`.

## Project structure

```text
CampusFind/
|-- client/                 React pages, components, contexts, and API adapter
|-- springboot-backend/     Spring controllers, services, repositories, JPA models, and tests
|-- logs/                   Generated launcher logs (ignored)
|-- run.cmd                 Integrated Windows production launcher
`-- README.md               Setup, API, testing, and team handoff guide
```

The old Express/SQLite source was removed so there is only one backend. A pre-existing local `server/database/*.sqlite` file remains ignored to avoid deleting a teammate's local data, but CampusFind does not read it.

## Team workflow

Start new work from the latest `main`:

```powershell
git switch main
git pull --ff-only
git switch -c your-branch-name
```

For every feature, fix, or setup change:

1. Run frontend lint/build and backend tests before requesting a merge.
2. Update this README when setup, routes, configuration, or workflows change.
3. Never commit passwords, tokens, database files, uploaded user files, `node_modules`, Maven `target`, or generated frontend builds.
4. Keep controllers focused on HTTP handling, business logic in services, and persistence in repositories.

## Troubleshooting

### The launcher says Spring did not become ready

Open `logs/backend.log`, then confirm:

- MySQL is running.
- `DB_URL`, `DB_USERNAME`, and `DB_PASSWORD` are correct.
- The configured user has access to the `campusfind` database.
- Port `8080` is free.

The health endpoint intentionally returns `503` when the database is unavailable.

### Port 5173 is occupied by an outdated frontend

Stop the existing Vite or Node process, then run `run.cmd` again. The launcher compares the served HTML with the build it just created and does not silently reuse an old build.

### Administrator bootstrap did not create an account

Check `logs/backend.log`. `ADMIN_EMAIL` must be non-empty, `ADMIN_PASSWORD` must contain at least 8 characters, and neither the configured email nor student ID can already exist.

### PowerShell blocks npm scripts

Use `npm.cmd` as shown in this README; it avoids PowerShell's `npm.ps1` execution-policy wrapper.

### Uploaded images are missing

Check `UPLOAD_DIR` and filesystem permissions. The default launcher location is `springboot-backend/uploads`, which is intentionally ignored by Git.

## Sprint 3/4 handoff

Last updated: **2026-07-20**

- Spring Boot/MySQL is the single backend and owns authentication, users, items, claims, notifications, activity, uploads, and dashboard summaries.
- Frontend API calls target the Spring endpoints; the integrated launcher builds in server mode.
- Dashboard, reports, search/details, claims, notifications, and administrator workflows use persisted API data.
- Validation, centralized API errors, JWT authentication, role checks, duplicate-claim prevention, and item availability rules are enforced server-side.
- Legacy Express/SQLite source and mock-only runtime documentation were removed.
- `run.cmd` now builds, starts, health-checks, logs, and opens the two-application stack.
