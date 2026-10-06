# API Monitor — Testing Documentation

The project currently does not have automated test suites. Manual verification is the primary testing method for the monitoring lifecycle.

## Manual Verification

### Setup

1. **Start the application**: Backend (`php artisan serve`) and Frontend (`npm run dev`)
2. **Access the UI**: Visit `http://localhost:5173`
3. **Add a monitored API**: Go to `/apis`, click "Create API", configure name, URL, method

### Monitoring Lifecycle Verification

#### Test 1: UP Status (No Incident)

1. Add a monitored API with a valid, reachable endpoint (e.g., `http://127.0.0.1:8000/api/test/health`)
2. Perform a manual check (Check Now button or `POST /api/apis/{id}/check`)
3. Verify the API status is `UP`
4. Verify no OPEN incident exists for the API
5. **Acceptance criteria A**: UP without OPEN incident → no TypeError, no incident created

#### Test 2: DOWN → Incident Created

1. Add a monitored API with an invalid/unreachable endpoint (e.g., `http://nonexistent.example.com`)
2. Perform a manual check
3. Verify the API status is `DOWN`
4. Verify exactly ONE OPEN incident exists for the API
5. **Acceptance criteria B**: DOWN → API DOWN creates exactly ONE OPEN incident

#### Test 3: No Duplicate Incidents

1. Ensure the API from Test 2 is still DOWN
2. Perform another manual check
3. Verify only ONE OPEN incident exists (no new one created)
4. **Acceptance criteria C**: DOWN → DOWN → repeated checks do NOT create duplicate OPEN incidents

#### Test 4: DOWN → UP → Incident Resolved

1. Change the API's URL to a reachable endpoint (or use the test health endpoint)
2. Perform a manual check
3. Verify the API status changes to `UP`
4. Verify the OPEN incident is now RESOLVED
5. Verify `resolved_at` is set
6. **Acceptance criteria D**: DOWN → UP → OPEN incident becomes RESOLVED

#### Test 5: RESOLVED → DOWN → New Incident

1. Ensure the API has a RESOLVED incident from Test 4
2. Change the API's URL to an invalid endpoint
3. Perform a manual check
4. Verify a NEW OPEN incident is created
5. Verify the prior incident remains RESOLVED
6. **Acceptance criteria E**: RESOLVED → DOWN → new incident created (old incident stays RESOLVED)

#### Test 6: UP → No New Incident

1. Add a monitored API with a valid, reachable endpoint
2. Perform a manual check
3. Verify the API status is `UP`
4. Verify no incident is created
5. **Acceptance criteria F**: UP → UP → no new incident, no error

## Known Test Endpoints

| Endpoint | Behavior |
|---|---|
| `GET /api/test/health` | Returns `200` with `{"status": "ok", "message": "API is healthy"}` — triggers UP status |
| `GET /api/test/slow` | Returns `200` after 1.8s delay (`usleep(1800000)`) — triggers DEGRADED status (2xx + >= 1000ms) |

## Testing Commands

```bash
# Run any PHPUnit tests if available
vendor/bin/phpunit

# Manual verification steps (see Testing section above)

# Check scheduler behavior
php artisan api-monitor:check

# Verify routes
php artisan route:list

# Database check
php artisan migrate:status
```

## Acceptance Criteria Summary

All runtime tests must pass without crashes:

- **A**: UP without OPEN incident → no TypeError, no incident created
- **B**: DOWN → API DOWN creates exactly ONE OPEN incident
- **C**: DOWN → DOWN → repeated checks do NOT create duplicate OPEN incidents
- **D**: DOWN → UP → OPEN incident becomes RESOLVED
- **E**: RESOLVED → DOWN → new incident created (old incident stays RESOLVED)
- **F**: UP → UP → no new incident, no error