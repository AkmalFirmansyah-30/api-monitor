<?php

namespace App\Jobs;

use App\Models\MonitoredApi;
use App\Services\ApiMonitoringService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

/**
 * Job to check a single monitored API.
 *
 * This job delegates the actual monitoring logic to ApiMonitoringService
 * and preserves all existing behavior: ApiCheck creation, status updates,
 * incident lifecycle, UP/DEGRADED/DOWN determination, etc.
 *
 * The job receives a MonitoredApi ID and performs internal system monitoring.
 * It does NOT depend on HTTP authentication ($request->user()) because
 * monitoring is a system-level background process.
 */
class CheckMonitoredApi implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * The monitored API ID.
     *
     * @var int
     */
    public $apiId;

    /**
     * Create a new job instance.
     *
     * @param  int  $apiId
     * @return void
     */
    public function __construct(int $apiId)
    {
        $this->apiId = $apiId;
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle(): void
    {
        Log::info("[API Monitor] Checking API #{$this->apiId} via queue job");

        // Load the MonitoredApi model safely
        $api = MonitoredApi::find($this->apiId);

        // Fail safely if the API was deleted before the job executes
        if ($api === null) {
            Log::warning("[API Monitor] API #{$this->apiId} not found - job terminated");
            return;
        }

        try {
            Log::info("[API Monitor] API #{$this->apiId} ({$api->name}) - checking (interval: {$api->interval} min)");

            // Delegate actual monitoring to ApiMonitoringService
            // This preserves all existing behavior:
            // - HTTP request via Http facade
            // - UP / DEGRADED / DOWN logic
            // - ApiCheck creation
            // - monitored_apis status/response_time/last_checked_at updates
            // - IncidentService createIncident / resolveIncident
            $service = new ApiMonitoringService();
            $result = $service->check($api);

            Log::info("[API Monitor] API #{$this->apiId} result: {$result['status']} ({$result['responseTime']}ms)");

        } catch (\Exception $e) {
            Log::error("[API Monitor] API #{$this->apiId} check failed: " . $e->getMessage());

            // Optionally, we could create a manual check record for the failure
            // but we preserve the existing behavior by not swallowing the error.
            // The job is considered "failed" and Laravel's failed job mechanism
            // will handle it if configured.
            throw $e;
        }
    }

    /**
     * Get the tags that should be assigned to the job.
     *
     * @return array
     */
    public function tags(): array
    {
        return [
            "api-{$this->apiId}",
            "monitoring",
        ];
    }

    /**
     * The number of times the job may be attempted.
     *
     * @return int|array
     */
    public function attempts(): int
    {
        // Reasonable default: try up to 3 times before marking as failed
        // This prevents infinite retries while allowing transient failures
        return 3;
    }

    /**
     * The number of seconds to wait before retrying the job.
     *
     * @return int|array
     */
    public function backoff(): int
    {
        // Wait 5 minutes before each retry
        // This is separate from the API request timeout ($monitoredApi->timeout)
        return 300;
    }
}