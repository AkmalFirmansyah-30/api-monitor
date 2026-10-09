<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Notification;
use App\Models\MonitoredApi;
use App\Models\ApiCheck;
use App\Services\IncidentService;
use App\Services\MonitoringRuleEvaluator;
use App\Notifications\IncidentCreatedNotification;
use App\Notifications\IncidentResolvedNotification;

class ApiMonitoringService
{
    /**
     * The incident service instance.
     *
     * @var \App\Services\IncidentService
     */
    protected $incidentService;

    /**
     * The monitoring rule evaluator instance.
     *
     * @var \App\Services\MonitoringRuleEvaluator
     */
    protected $ruleEvaluator;

    /**
     * Create a new ApiMonitoringService instance.
     *
     */
    public function __construct()
    {
        $this->incidentService = app(IncidentService::class);
        $this->ruleEvaluator = new MonitoringRuleEvaluator();
    }

    /**
     * Cek satu monitored API.
     *
     * @param  MonitoredApi  $api
     * @return array
     */
    public function check(MonitoredApi $api): array
    {
        $startTime = microtime(true);

        $status = 'DOWN';
        $statusCode = null;
        $responseTime = 0;
        $errorMessage = null;
        $assertionFailures = [];

        try {
            // GET request (tanpa body untuk MVP)
            if ($api->method === 'GET') {
                $response = Http::get($api->url, [], $api->timeout);
            } elseif ($api->method === 'POST') {
                $response = Http::post($api->url, [], $api->timeout);
            } elseif ($api->method === 'PUT') {
                $response = Http::put($api->url, [], $api->timeout);
            } elseif ($api->method === 'PATCH') {
                $response = Http::patch($api->url, [], $api->timeout);
            } elseif ($api->method === 'DELETE') {
                $response = Http::delete($api->url, [], $api->timeout);
            } else {
                $response = Http::get($api->url);
            }

            $statusCode = $response->status();
            $responseTime = (microtime(true) - $startTime) * 1000;
            $responseTime = round($responseTime);

            // Apply monitoring rules evaluation
            $evaluation = $this->ruleEvaluator->evaluate($api, $response, $responseTime);
            $status = $evaluation['status'];
            $assertionFailures = $evaluation['failures'];
        } catch (\Exception $e) {
            $responseTime = (microtime(true) - $startTime) * 1000;
            $responseTime = round($responseTime);
            $statusCode = null;
            $errorMessage = $e->getMessage();
            $status = 'DOWN';
            $assertionFailures = ['Request failed: ' . $e->getMessage()];
        }

        // Pastikan response_time minimal 0
        if ($responseTime < 0) {
            $responseTime = 0;
        }

        // Simpan record check dengan assertion failures
        $checkData = [
            'monitored_api_id' => $api->id,
            'status' => $status,
            'status_code' => $statusCode,
            'response_time' => $responseTime,
            'checked_at' => now(),
        ];

        // Store assertion failures safely (without sensitive data)
        if (!empty($assertionFailures)) {
            $checkData['error_message'] = implode('; ', $assertionFailures);
        }

        ApiCheck::create($checkData);

        // Update monitored API
        $api->status = $status;
        $api->response_time = $responseTime;
        $api->last_checked_at = now();
        $api->save();

        // Incident detection and management
        // Use the evaluated status for incident lifecycle
        if ($status === 'DOWN') {
            $incident = $this->incidentService->createIncident(
                $api,
                "{$api->name} is down",
                $assertionFailures ? implode('; ', $assertionFailures) : 'Connection failed'
            );

            // Notify API owner of new incident
            if ($incident) {
                $user = $api->user;
                if ($user) {
                    Notification::send($user, new IncidentCreatedNotification($incident));
                }
            }
        } elseif ($status === 'UP') {
            // Resolve any open incident when API returns to UP
            $incident = $this->incidentService->resolveIncident($api);

            // Notify API owner of recovery
            if ($incident) {
                $user = $api->user;
                if ($user) {
                    Notification::send($user, new IncidentResolvedNotification($incident));
                }
            }
        } elseif ($status === 'DEGRADED') {
            // Handle DEGRADED status - follow existing policy
            // Check if there's an open incident that should be resolved
            $openIncident = $this->incidentService->findOpenIncident($api);
            if ($openIncident) {
                $this->incidentService->resolveIncident($api);
                // Trigger resolution notification
                $user = $api->user;
                if ($user) {
                    Notification::send($user, new IncidentResolvedNotification($openIncident));
                }
            }
        }

        return [
            'apiId' => $api->id,
            'status' => $status,
            'statusCode' => $statusCode,
            'responseTime' => $responseTime,
            'checkedAt' => now(),
            'errorMessage' => $assertionFailures ? implode('; ', $assertionFailures) : null,
        ];
    }
}