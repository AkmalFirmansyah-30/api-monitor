# API Monitor — Database Documentation

## Database Overview

The application uses MySQL as the database backend. All database changes are managed via Laravel migrations. The schema consists of 5 core tables: `users`, `monitored_apis`, `api_headers`, `api_checks`, and `incidents`.

## Tables

### `users`

| Column | Type | Key | Details |
|---|---|---|---|
| id | int | PK | Auto-increment |
| name | string | | |
| email | string | Unique | |
| password | string | | |
| remember_token | string | | |
| email_verified_at | timestamp | Nullable | |
| created_at | datetime | | |
| updated_at | datetime | | |

### `monitored_apis`

| Column | Type | Key | Details |
|---|---|---|---|
| id | int | PK | Auto-increment |
| user_id | int | FK → users | cascadeOnDelete |
| name | string | | |
| url | text | | |
| method | string (20) | Default: "GET" | GET/POST/PUT/PATCH/DELETE |
| timeout | unsigned integer | Default: 10 | Seconds |
| interval | unsigned integer | Default: 5 | Minutes |
| status | string (20) | Default: "UP" | UP/DEGRADED/DOWN |
| response_time | unsigned integer | Nullable | Milliseconds |
| uptime | decimal (5,2) | Default: 100.00 | Percentage |
| last_checked_at | timestamp | Nullable | |
| created_at | datetime | | |
| updated_at | datetime | | |

### `api_headers`

| Column | Type | Key | Details |
|---|---|---|---|
| id | int | PK | Auto-increment |
| monitored_api_id | int | FK → monitored_apis | cascadeOnDelete |
| name | string | | |
| value | text | | |
| created_at | datetime | | |
| updated_at | datetime | | |

### `api_checks`

| Column | Type | Key | Details |
|---|---|---|---|
| id | int | PK | Auto-increment |
| monitored_api_id | int | FK → monitored_apis | cascadeOnDelete |
| status | string (20) | | UP/DEGRADED/DOWN |
| status_code | unsigned smallint | Nullable | HTTP response code |
| response_time | unsigned integer | Nullable | Milliseconds |
| error_message | text | Nullable | Error description |
| checked_at | timestamp | | |
| created_at | datetime | | |
| updated_at | datetime | | |

### `incidents`

| Column | Type | Key | Details |
|---|---|---|---|
| id | int | PK | Auto-increment |
| monitored_api_id | int | FK → monitored_apis | cascadeOnDelete |
| title | string | | |
| status | string (20) | Default: "OPEN" | OPEN/RESOLVED |
| started_at | timestamp | | |
| resolved_at | timestamp | Nullable | |
| description | text | Nullable | |
| created_at | datetime | | |
| updated_at | datetime | | |

## Relationships

- **users** `1:N` **monitored_apis** — A user owns multiple monitored APIs
- **monitored_apis** `1:N` **api_headers** — An API can have multiple header configurations
- **monitored_apis** `1:N` **api_checks** — An API has many check records
- **monitored_apis** `1:N` **incidents** — An API has many incidents

ER Diagram:

```mermaid
erDiagram
    USERS |--|{ MONITORED_APIS : "owns"
    MONITORED_APIS ||--|{ API_HEADERS : "has headers"
    MONITORED_APIS ||--|{ API_CHECKS : "many check records"
    MONITORED_APIS ||--|{ INCIDENTS : "many incidents"
    
    API_CHECKS ||--|{ INCIDENTS : "triggered by checks (logical)"
```

## Indexes/Constraints

- Primary keys on all tables: `id`
- Unique constraint on `users.email`
- Foreign key constraints:
  - `monitored_apis.user_id` → `users.id` (cascade on delete)
  - `api_headers.monitored_api_id` → `monitored_apis.id` (cascade on delete)
  - `api_checks.monitored_api_id` → `monitored_apis.id` (cascade on delete)
  - `incidents.monitored_api_id` → `monitored_apis.id` (cascade on delete)
- No additional indexes currently defined

## Migration Files (source of truth)

| Migration File | Table |
|---|---|
| `0001_01_01_000000_create_users_table.php` | `users` |
| `2026_10_05_061710_create_monitored_apis_table.php` | `monitored_apis` |
| `2026_10_05_061749_create_api_headers_table.php` | `api_headers` |
| `2026_10_05_061756_create_api_checks_table.php` | `api_checks` |
| `2026_10_05_061803_create_incidents_table.php` | `incidents` |