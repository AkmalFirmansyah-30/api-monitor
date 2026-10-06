# API Monitor

API Monitor is a web application for monitoring the health and performance of APIs. It performs automated and manual health checks against configured API endpoints, tracks response times and uptime, classifies status as UP/DEGRADED/DOWN, and manages incident detection and resolution lifecycle.

## Overview

API Monitor addresses the need for continuous API observability. The system allows users to define monitored APIs with configurable intervals, methods, and timeouts. It automatically checks endpoints at scheduled intervals, records check history, updates API status, and detects incidents when APIs become unavailable. Manual check-on-demand is also available for immediate testing.

Key capabilities:

- **Manual health checks**: Trigger instant checks on demand via the UI or API (`POST /api/apis/{id}/check`)
- **Automatic scheduled monitoring**: Laravel Scheduler runs `api-monitor:check` every minute to check due APIs based on their configured intervals
- **Status classification**: UP (2xx response + response time < 1000ms), DEGRADED (2xx response + response time >= 1000ms), DOWN (non-2xx response or request exception)
- **Uptime tracking**: Percentage of successful checks over time, calculated from `api_checks` history
- **Response time monitoring**: Records and displays response latency per check in milliseconds
- **Incident management**: Automatic incident creation when APIs go down, duplicate prevention, automatic resolution when APIs recover
- **Check history**: Full record of all API checks with status, response time, and error messages
- **Dashboard overview**: Summary stats, recent activity, and quick access to all monitored APIs

## Features

The following features are implemented in the current codebase:

- **API Management**: Create, read, update, and delete monitored APIs with methods (GET/POST/PUT/PATCH/DELETE), timeouts, and intervals
- **Manual health checks**: POST `/api/apis/{id}/check` triggers an immediate check of a specific API
- **Automatic monitoring**: Laravel Scheduler with `api-monitor:check` command checks all due APIs every minute
- **Response time monitoring**: Records response time per check; classifies as UP (< 1s), DEGRADED (>= 1s)
- **Uptime tracking**: Calculates uptime percentage from check history
- **API status classification**: UP, DEGRADED, DOWN with clear visual badges
- **Check history**: Full audit trail of all API checks with status, response time, and error messages
- **Incident management**: Automatic incident creation on DOWN status, duplicate prevention, automatic resolution on recovery, new incident creation after prior incident resolved
- **Dashboard**: Summary stats, recent activity, and quick navigation
- **API detail page**: Status badge, response time chart, check history, incidents, and Check Now button
- **Incidents page**: List of all incidents with OPEN/RESOLVED status, filtering, and duration display

## Tech Stack

### Backend

- **Laravel**: PHP framework (v12)
- **PHP**: Server-side language
- **MySQL**: Database server (configure via environment variables)
- **Laravel Scheduler**: For automatic minute-based check scheduling
- **HTTP Client**: Laravel Http facade for making API requests

### Frontend

- **React**: UI library (v19)
- **TypeScript**: Type-safe development
- **Vite**: Build tool and dev server
- **Tailwind CSS**: Utility-first CSS framework
- **Axios**: HTTP client for API calls
- **Recharts**: Response time charting
- **Lucide React**: Icon set
- **React Router**: Page navigation

## Architecture

```mermaid
flowchart TB
    direction LR
    React_Frontend -->|HTTP/Axios| Laravel_API
    Laravel_API -->|PDO/Eloquent| MySQL
    
    subgraph "Backend Layer"
        L1[Routes (api.php)] --> L2[Controllers]
        L2 --> L3[Services]
        L3 --> L4[Models]
        L4 --> L5[Database]
    end
    
    subgraph "Frontend Layer"
        F1[React Components] --> F2[Axios Services]
        F2 -->|GET/POST| Laravel_API
    end
    
    style React_Frontend fill:#e3f2fd,stroke:#1565c0,stroke-width:2px
    style Laravel_API fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px
    style MySQL fill:#fff3e0,stroke:#f57c00,stroke-width:2px
```

### Project Structure

```
api-monitor/
├── backend/              Laravel 12 application
│   ├── app/              PHP models, services, controllers
│   ├── routes/           API routes (api.php)
│   ├── database/         migrations and seeders
│   ├── console/          Artisan commands
│   └── http/             controllers and resources
├── frontend/             React + TypeScript + Vite
│   ├── src/pages         UI pages (Apis, ApiDetail, Incidents, Dashboard)
│   ├── src/services      API services (Axios instances)
│   ├── src/types         TypeScript type definitions
│   ├── src/components    UI components
│   └── src/assets        Static assets
├── docs/                 Project documentation
├── .gitignore
└── README.md
```

## Monitoring Logic

The `ApiMonitoringService` determines API status based on HTTP response:

| Status | Condition |
|---|---|
| **UP** | Successful response (2xx) AND response time < 1000ms |
| **DEGRADED** | Successful response (2xx) AND response time >= 1000ms |
| **DOWN** | Non-successful response (server/client error) OR request exception |

### Check Flow

1. Laravel Scheduler triggers `api-monitor:check` every minute
2. Command iterates all `monitored_apis`
3. `isDue()` checks if `last_checked_at` is null or current time >= last_checked + interval
4. Due APIs are checked via `ApiMonitoringService->check()`
5. Service performs HTTP request (GET/POST/PUT/PATCH/DELETE)
6. `api_checks` record created with status, response time, error message
7. `monitored_apis` status and `last_checked_at` updated
8. **Incident logic**:
   - Status = DOWN: Creates incident (if no OPEN incident exists)
   - Status = UP: Resolves OPEN incident
   - Status = DEGRADED: No incident action

### Database Updates

- `api_checks`: One record per check with status, response_time, error_message, checked_at
- `monitored_apis`: status, response_time, last_checked_at updated after each check

## API Endpoints

All endpoints are defined in `backend/routes/api.php`.

| Method | Endpoint | Description |
|---|---|---|
| **GET** | `/api/apis` | List all monitored APIs with check counts |
| **POST** | `/api/apis` | Create a new monitored API |
| **GET** | `/api/apis/{api}` | Show single API details with checks and incidents |
| **PUT** | `/api/apis/{api}` | Update API configuration |
| **DELETE** | `/api/apis/{api}` | Delete API and related data |
| **POST** | `/api/apis/{monitoredApi}/check` | Manual check now (also triggers incident detection) |
| **GET** | `/api/apis/{monitoredApi}/checks` | Get check history for a specific API |
| **GET** | `/api/incidents` | List all incidents (with optional `?api_id` filter) |
| **GET** | `/api/incidents/{incident}` | Show single incident detail |
| **GET** | `/api/test/health` | Health check endpoint (returns ok) |
| **GET** | `/api/test/slow` | Slow endpoint (1.8s delay, triggers DEGRADED) |

## Database

### Tables and Relationships

```mermaid
erDiagram
    USERS |--|{ MONITORED_APIS : "owns"
    MONITORED_APIS ||--|{ API_HEADERS : "has headers"
    MONITORED_APIS ||--|{ API_CHECKS : "many check records"
    MONITORED_APIS ||--|{ INCIDENTS : "many incidents"
    API_CHECKS ||--|{ INCIDENTS : "triggered by checks (logical)"
```

### Key Columns

- `monitored_apis`: `status` defaults to `UP`, `uptime` defaults to `100.00`, `interval` defaults to `5` minutes, `timeout` defaults to `10` seconds
- `api_checks`: `status_code` is the HTTP response code, `response_time` is in milliseconds
- `incidents`: `status` defaults to `OPEN`, `started_at` and `resolved_at` track the incident timeline

### Migration Details

| Table | Key Columns |
|---|---|
| `users` | id, name, email, password, timestamps |
| `monitored_apis` | id, user_id (FK), name, url, method, timeout (default 10), interval (default 5), status (default UP), response_time, uptime (decimal 5,2, default 100.00), last_checked_at |
| `api_headers` | id, monitored_api_id (FK cascade), name, value, timestamps |
| `api_checks` | id, monitored_api_id (FK cascade), status (UP/DEGRADED/DOWN), status_code (nullable), response_time (nullable), error_message (nullable), checked_at |
| `incidents` | id, monitored_api_id (FK cascade), title, status (default OPEN), started_at, resolved_at (nullable), description, timestamps |

## Installation

### Requirements

- PHP >= 8.1
- Composer
- Node.js >= 18 & npm
- MySQL or compatible database

### Backend

1. Install dependencies: `composer install`
2. Copy environment: `cp .env.example .env`
3. Generate application key: `php artisan key:generate`
4. Configure database in `.env`:
   ```
   DB_DATABASE=api_monitor
   DB_USERNAME=root
   DB_PASSWORD=
   ```
5. Run migrations: `php artisan migrate`
6. Start backend: `php artisan serve` (default port: 8000)

### Frontend

1. Install dependencies: `npm install`
2. Start frontend: `npm run dev` (default port: 5173)

### Scheduler

The automatic monitoring uses Laravel's built-in scheduler. The `api-monitor:check` command must be run periodically:

- **Local development**: Run `php artisan schedule:work` in a separate terminal, or configure your server's cron to run `php artisan schedule:run` every minute
- **Production**: Configure system cron: `* * * * * cd /path-to-project && php artisan schedule:run >> /dev/null 2>&1`

### Environment Variables

Key environment variables (based on actual `.env`):

```
DB_DATABASE=api_monitor
DB_USERNAME=root
DB_PASSWORD=

APP_URL=http://127.0.0.1:8000

QUEUE_CONNECTION=sync

# Frontend API base URL configured in src/services/api.ts
VITE_API_BASE_URL=http://127.0.0.1:8000/api
```

## Scheduler

The `api-monitor:check` command is the core of automatic monitoring:

```
php artisan api-monitor:check
```

**Behavior:**

- Iterates all `monitored_apis`
- `isDue()`: Returns true if `last_checked_at` is null OR current time >= `last_checked_at` + `interval` (in minutes)
- For due APIs, runs `ApiMonitoringService->check()`
- Tracks counts: due, processed, skipped (not due), errors
- Each check: performs HTTP request, records `api_checks`, updates `monitored_apis`, manages incidents

**On local development**, the scheduler may need explicit activation:

```
php artisan schedule:work
```

This runs the scheduler loop, checking due APIs every minute. Without this, only manual `php artisan api-monitor:check` runs are possible.

## Testing

The project currently does not have automated test suites. Manual verification is the primary testing method:

### Manual Verification Steps

1. **Start the application**: Backend (`php artisan serve`) and Frontend (`npm run dev`)
2. **Access the UI**: Visit `http://localhost:5173`
3. **Add a monitored API**: Go to `/apis`, click "Create API", configure name, URL, method
4. **Manual Check Now**: Visit any API detail page and click "Check Now", or call `POST /api/apis/{id}/check`
5. **Observe incident lifecycle**:
   - DOWN status → OPEN incident created
   - Repeated DOWN checks → same incident (no duplicate)
   - UP status → incident resolved
   - DOWN after RESOLVED → new incident created
6. **Verify scheduler**: Run `php artisan schedule:work` and observe it checking APIs every minute
7. **Test error isolation**: Create APIs that point to invalid endpoints; ensure one failure doesn't stop monitoring of others

### Known Endpoints for Testing

- `GET /api/test/health` - Returns healthy status (used in project)
- `GET /api/test/slow` - Returns 200 after 1.8s delay (triggers DEGRADED status)

## Troubleshooting

| Issue | Likely Cause | Resolution |
|---|---|---|
| **Backend not reachable** | `php artisan serve` not running or wrong port | Start backend, verify port 8000 |
| **Frontend blank/errors** | `npm run dev` not running or wrong port | Start frontend, verify port 5173 |
| **Scheduler not running** | `php artisan schedule:work` not executed | Run scheduler in separate terminal |
| **API checks stuck** | External endpoint timeout or unreachable | Check API URL/network connectivity |
| **Incidents not creating** | API status stays UP/DEGRADED | Verify endpoint is actually returning errors |
| **CORS errors** | Missing CORS configuration | Ensure Laravel serves API from correct origin |
| **Scheduler runs once then stops** | `schedule:work` process terminated | Keep process running or use system cron |
| **DEGRADED status not appearing** | All responses either < 1s or errors | Test with slow endpoint `http://127.0.0.1:8000/api/test/slow` |

## Roadmap

The following are planned or future considerations, **not currently implemented**:

### Planned

- Authentication with Laravel Sanctum API tokens
- Background job processing with queued checks
- Redis caching for check history
- Email/Slack notifications on incident creation/detection
- Webhook endpoints for external alerting

### Future Enhancements

- Docker containerization
- Deployment scripts for production servers
- Advanced charting (uptime trends, response time distributions)
- API key authentication for manual check endpoints
- Multi-user isolation (each user sees only their APIs)

**License**: This project does not have a formal license assigned. Use of this code is at your own risk.

## Documentation Index

- Product Requirements → docs/PRD.md
- Architecture → docs/ARCHITECTURE.md
- API Reference → docs/API.md
- Database → docs/DATABASE.md
- Monitoring Engine → docs/MONITORING.md
- Incident Management → docs/INCIDENTS.md
- Development Guide → docs/DEVELOPMENT.md
- Testing → docs/TESTING.md
- Roadmap → docs/ROADMAP.md