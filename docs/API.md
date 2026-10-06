# API Monitor — API Reference

All endpoints are defined in `backend/routes/api.php`. Below are the documented endpoints based on the actual codebase.

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| **GET** | `/api/apis` | List all monitored APIs with check counts and user filtering |
| **POST** | `/api/apis` | Create a new monitored API |
| **GET** | `/api/apis/{api}` | Show single API detail with loaded headers, latest 50 checks, and incidents |
| **PUT** | `/api/apis/{api}` | Update API configuration (name, URL, method, timeout, interval) |
| **DELETE** | `/api/apis/{api}` | Delete API and related data (api_checks, api_headers, incidents cascade) |
| **POST** | `/api/apis/{monitoredApi}/check` | Manual check now — triggers HTTP request, records api_checks, updates monitored_apis, manages incidents |
| **GET** | `/api/apis/{monitoredApi}/checks` | Get check history for a specific API (last 50 checks, sorted by checked_at desc) |
| **GET** | `/api/incidents` | List all incidents, filterable by `?api_id` query parameter |
| **GET** | `/api/incidents/{incident}` | Show single incident detail |
| **GET** | `/api/test/health` | Health check endpoint — returns OK status (inline closure) |
| **GET** | `/api/test/slow` | Slow test endpoint — returns 200 after 1.8s delay (triggers DEGRADED status) |

## Request / Response Examples

### GET /api/apis

**Response:**
```json
[
  {
    "id": 1,
    "name": "Production API",
    "url": "https://api.example.com/health",
    "method": "GET",
    "status": "UP",
    "responseTime": 124,
    "uptime": "100.00",
    "lastChecked": "2 minutes ago",
    "timeout": 10,
    "interval": 5,
    "checksCount": 12,
    "createdAt": "2026-10-05T06:17:10.000000Z",
    "updatedAt": "2026-10-05T06:17:10.000000Z",
    "message": "API created successfully."
  }
]
```

### POST /api/apis

**Request:**
```json
{
  "name": "Production API",
  "url": "https://api.example.com/health",
  "method": "GET",
  "timeout": 10,
  "interval": 5
}
```

**Response:** `201 Created`
```json
{
  "id": 2,
  "name": "Production API",
  "url": "https://api.example.com/health",
  "method": "GET",
  "status": "UP",
  "responseTime": null,
  "uptime": "100.00",
  "lastChecked": null,
  "timeout": 10,
  "interval": 5,
  "checksCount": 0,
  "createdAt": "2026-10-05T06:17:10.000000Z",
  "updatedAt": "2026-10-05T06:17:10.000000Z",
  "message": "API created successfully."
}
```

### GET /api/apis/{api}

**Response:** Single API resource with loaded relationships (headers, checks limited to 50, incidents).

### POST /api/apis/{monitoredApi}/check

**Response:**
```json
{
  "apiId": 1,
  "status": "UP",
  "statusCode": 200,
  "responseTime": 124,
  "checkedAt": "2026-10-05T12:00:00.000000Z",
  "errorMessage": null
}
```

**Status classification:**
- `UP`: 2xx response + response_time < 1000ms
- `DEGRADED`: 2xx response + response_time >= 1000ms
- `DOWN`: non-2xx response or request exception

### GET /api/apis/{monitoredApi}/checks

**Response:**
```json
[
  {
    "id": 1,
    "apiId": 1,
    "status": "UP",
    "statusCode": 200,
    "responseTime": 124,
    "errorMessage": null,
    "checkedAt": "2026-10-05T12:00:00.000000Z"
  }
]
```

### GET /api/incidents

**Response (with ?api_id=1):**
```json
[
  {
    "id": 1,
    "apiId": 1,
    "apiName": "Production API",
    "title": "Production API is down",
    "status": "OPEN",
    "startedAt": "2026-10-05T10:30:00.000000Z",
    "resolvedAt": null,
    "description": "Production API is down"
  }
]
```

### GET /api/incidents/{incident}

**Response:** Single incident resource with full details.

## Data Resources

### MonitoredApiResource

| Field | Type |
|---|---|
| id | int |
| name | string |
| url | string |
| method | string |
| status | string (UP/DEGRADED/DOWN) |
| responseTime | int |
| uptime | decimal |
| lastChecked | string (diffForHumans) |
| lastCheckedAt | ISO string |
| timeout | int |
| interval | int |
| checksCount | int |
| createdAt | ISO string |
| updatedAt | ISO string |

### ApiCheckResource

| Field | Type |
|---|---|
| id | int |
| apiId | int |
| status | string (UP/DEGRADED/DOWN) |
| statusCode | int (nullable) |
| responseTime | int (nullable) |
| errorMessage | string (nullable) |
| checkedAt | ISO string |

### IncidentResource

| Field | Type |
|---|---|
| id | int |
| apiId | int |
| apiName | string |
| title | string |
| status | string (OPEN/RESOLVED) |
| startedAt | ISO string |
| resolvedAt | ISO string (nullable) |
| description | string (nullable) |