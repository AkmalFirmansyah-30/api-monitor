# API Monitor — Roadmap

Implemented
- API CRUD operations (create, read, update, delete monitored APIs)
- Manual health checks via POST /api/apis/{id}/check
- Automatic monitoring via Laravel Scheduler (api-monitor:check every minute)
- Status classification: UP (2xx + < 1s), DEGRADED (2xx + >= 1s), DOWN (errors/non-2xx)
- Response time monitoring and recording (milliseconds)
- Uptime percentage calculation from check history
- API check history (last 50 checks per API)
- Incident management: CREATE on DOWN, duplicate prevention, RESOLVE on UP
- Dashboard with summary stats (Total APIs, Operational, Down, Uptime)
- API detail page with status badge, response time chart, check history, incidents
- Incidents page with OPEN/RESOLVED filtering and duration display
- API endpoints: CRUD, manual check, check history, incidents
- Database tables: users, monitored_apis, api_headers, api_checks, incidents
- Relationships between all tables (foreign keys with cascade on delete)
- ApiMonitoringService with full monitoring flow
- IncidentService with createIncident (duplicate check), resolveIncident, getIncidents
- MonitoredApiController with all route handlers
- IncidentController with index and show
- Frontend: 5 pages (Apis, ApiDetail, Dashboard, Incidents, Settings)
- Frontend: Types (ApiStatus, HttpMethod, IncidentStatus, MonitoredApi, ApiCheck, Incident)
- Frontend: Services (api.ts, monitoredApiService.ts)
- Frontend: Components (ApiStatusBadge, StatCard, ApiCard, ApiStatusBadge)
- Frontend: Pages (Apis.tsx, ApiDetail.tsx, Dashboard.tsx, Incidents.tsx)
- Manual check flow: frontend → backend → service → HTTP → database → incidents
- Automatic check scheduler: Laravel Scheduler → api-monitor:check → due-check logic

In Progress
- None

Planned
- Authentication with Laravel Sanctum API tokens
- Background job processing for checks (currently synchronous via scheduler)
- Redis caching for check history and performance
- Email/Slack notifications on incident creation/detection
- Webhook endpoints for external alerting
- Docker containerization and deployment scripts
- Advanced charting with trend lines (uptime trends, response time distributions)
- API key authentication for manual check endpoints
- Multi-user isolation (each user sees only their APIs)

Future Enhancements
- Real-time WebSocket updates for live status changes
- Multi-tenant data isolation
- Scheduled report generation (daily/weekly uptime reports)
- Advanced analytics (correlation between response time and incidents)
- Geographic distribution of API checks
- SLAs and SLOs tracking