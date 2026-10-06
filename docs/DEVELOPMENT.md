# API Monitor — Development Guide

## Prerequisites

- PHP >= 8.1
- Composer
- Node.js >= 18 & npm
- MySQL or compatible database (e.g., MariaDB)
- Git

## Local Setup

### Backend

1. Clone the repository
2. Install PHP dependencies: `composer install`
3. Copy environment file: `cp .env.example .env`
4. Generate application key: `php artisan key:generate`
5. Configure database in `.env`:
   ```
   DB_DATABASE=api_monitor
   DB_USERNAME=root
   DB_PASSWORD=
   APP_URL=http://127.0.0.1:8000
   ```
6. Run migrations: `php artisan migrate`
7. (Optional) Run seeder to populate sample data: `php artisan db:seed`

### Frontend

1. Install Node dependencies: `npm install`
2. Start development server: `npm run dev`
   - UI available at `http://localhost:5173`
   - API base URL: `http://127.0.0.1:8000/api`

### Running the Application

**Backend:** `php artisan serve` (default port: 8000)

**Frontend:** `npm run dev` (default port: 5173)

Both services should be running simultaneously for full functionality.

## Backend Development

### Useful Artisan Commands

| Command | Description |
|---|---|
| `php artisan serve` | Start local development server (port 8000) |
| `php artisan migrate` | Run database migrations |
| `php artisan migrate:refresh` | Refresh all migrations |
| `php artisan db:seed` | Run database seeders |
| `php artisan api-monitor:check` | Run manual monitoring check |
| `php artisan schedule:work` | Run scheduler loop (checks due APIs every minute) |
| `php artisan schedule:run` | Run scheduler once (cron-style) |
| `php artisan config:cache` | Cache configuration |
| `php artisan route:list` | List all registered routes |

### Backend Structure

- **Routes**: `routes/api.php` — API routes (resourceful + manual endpoints)
- **Controllers**: `app/Http/Controllers/`
  - `MonitoredApiController` — API CRUD and check management
  - `IncidentController` — Incident listing and detail
- **Services**: `app/Services/`
  - `ApiMonitoringService` — Core monitoring logic (HTTP requests, status classification, incident management)
  - `IncidentService` — Incident lifecycle (create, resolve, filtering)
- **Models**: `app/Models/`
  - `MonitoredApi` — Main API config model
  - `ApiCheck` — Check history record
  - `Incident` — Incident record
  - `ApiHeader` — API header configuration
  - `User` — Laravel auth user
- **Http/Requests**: `app/Http/Requests/`
  - `StoreMonitoredApiRequest` — Validation for creating API
  - `UpdateMonitoredApiRequest` — Validation for updating API
- **Http/Resources**: `app/Http/Resources/`
  - `MonitoredApiResource` — API response resource
  - `ApiCheckResource` — Check history resource
  - `IncidentResource` — Incident resource

### Adding a New Monitored API

1. Create API via UI (`/apis` → "Create API") or API (`POST /api/apis`)
2. Configure name, URL, method, timeout (seconds), interval (minutes)
3. Manual check: Visit API detail page and click "Check Now", or call `POST /api/apis/{id}/check`
4. Automatic check: Ensure Laravel Scheduler is running (`php artisan schedule:work`)

## Frontend Development

### Project Structure

```
frontend/src/
├── pages/          UI pages (Apis, ApiDetail, Dashboard, Incidents, Settings)
├── components/     UI components (ApiStatusBadge, StatCard, etc.)
├── services/       API services (Axios instances)
├── types/          TypeScript type definitions
├── hooks/          Custom React hooks
├── layouts/        Page layouts
└── lib/            Utility functions
```

### Key Services

| Service | Purpose |
|---|---|
| `api.ts` | Axios instance (`http://127.0.0.1:8000/api`) |
| `monitoredApiService.ts` | API CRUD, check, get incidents |

### Key Types (`src/types/api.ts`)

- `ApiStatus` = "UP" \| "DEGRADED" \| "DOWN"
- `HttpMethod` = "GET" \| "POST" \| "PUT" \| "PATCH" \| "DELETE"
- `IncidentStatus` = "OPEN" \| "RESOLVED"
- `MonitoredApi`, `ApiCheck`, `Incident` types

### Running Frontend

```bash
npm run dev     # Start Vite dev server (port 5173)
npm run build   # Production build
npm run lint    # ESLint check
npm run preview # Preview production build
```

## Database Setup

### Creating Database

```sql
CREATE DATABASE api_monitor;
```

### Running Migrations

```bash
php artisan migrate
```

### Seeding

To run the database seeder (if available):

```bash
php artisan db:seed
```

If no seeder is defined, sample data can be added via the UI or API.

## Seeding

The project includes a seeder that may populate initial data. To run:

```bash
php artisan db:seed
```

If no seeder output is visible, the MVP starts with an empty database; APIs are added by the user via the UI or API.

## Running Scheduler

### Local Development

```bash
php artisan schedule:work
```

This runs the scheduler loop, checking due APIs every minute. Keep this running in a separate terminal while developing.

### Production

Configure system cron to run every minute:

```
* * * * * cd /path-to-project && php artisan schedule:run >> /dev/null 2>&1
```

## Build Frontend

```bash
npm run build
```

Produces optimized production build in `frontend/dist/`.

## Debugging

### Backend Debugging

- Check Laravel logs: `storage/logs/laravel.log`
- Use `dd()` or `dump()` in controllers/services for development
- Test endpoints with `http://127.0.0.1:8000/api/test/health`
- Test slow endpoint: `http://127.0.0.1:8000/api/test/slow` (1.8s delay)

### Frontend Debugging

- Console logs in React components (visible in browser dev tools)
- ESLint: `npm run lint`
- Vite error overlay at `http://localhost:5173`
- Network tab to verify API calls to `http://127.0.0.1:8000/api`

### Common Issues

| Issue | Solution |
|---|---|
| API calls failing | Verify `php artisan serve` is running on port 8000 |
| Frontend won't load | Run `npm run dev`, check port 5173 |
| Scheduler not checking | Run `php artisan schedule:work` in separate terminal |
| Incidents not creating | Verify API returns non-2xx or throws exception |
| DEGRADED not appearing | Test with slow endpoint `http://127.0.0.1:8000/api/test/slow` |
| CORS errors | Ensure frontend origin matches Laravel CORS config |

## Common Development Workflow

1. **Start services**: `php artisan serve` (port 8000) + `npm run dev` (port 5173)
2. **Add API**: Use UI or `POST /api/apis` to create a new monitored API
3. **Test manual check**: Click "Check Now" on API detail, or call `POST /api/apis/{id}/check`
4. **Verify automatic check**: Run `php artisan schedule:work` and observe API checks
5. **Observe incident lifecycle**: Create APIs with invalid URLs, observe DOWN → OPEN incident → UP → RESOLVED
6. **Iterate**: Fix issues, add more APIs, test error isolation
7. **Build for production**: `npm run build`, configure cron for scheduler