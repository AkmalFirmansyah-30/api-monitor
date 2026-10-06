<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use App\Models\MonitoredApi;
use App\Models\ApiCheck;
use App\Services\IncidentService;

class ApiMonitoringService
{
    /**
     * The incident service instance.
     *
     * @var \App\Services\IncidentService
     */
    protected $incidentService;

    /**
     * Create a new ApiMonitoringService instance.
     *
     */
    public function __construct()
    {
        $this->incidentService = app(IncidentService::class);
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

            // Logika status
            if ($response->successful()) {
                if ($responseTime >= 1000) {
                    $status = 'DEGRADED';
                } else {
                    $status = 'UP';
                }
            } elseif ($response->serverError() || $response->clientError()) {
                $status = 'DOWN';
                $statusCode = $response->status();
                $errorMessage = "HTTP {$statusCode}";
                if ($responseTime >= 1000) {
                    $status = 'DEGRADED';
                }
            } else {
                $status = 'DOWN';
                $errorMessage = "Request failed: {$response->reason()}";
            }
        } catch (\Exception $e) {
            $responseTime = (microtime(true) - $startTime) * 1000;
            $responseTime = round($responseTime);
            $statusCode = null;
            $errorMessage = $e->getMessage();
            $status = 'DOWN';
        }

        // Pastikan response_time minimal 0
        if ($responseTime < 0) {
            $responseTime = 0;
        }

        // Simpan record check
        ApiCheck::create([
            'monitored_api_id' => $api->id,
            'status' => $status,
            'status_code' => $statusCode,
            'response_time' => $responseTime,
            'error_message' => $errorMessage,
            'checked_at' => now(),
        ]);

        // Update monitored API
        $api->status = $status;
        $api->response_time = $responseTime;
        $api->last_checked_at = now();
        $api->save();

        // Incident detection and management
        if ($status === 'DOWN') {
            $this->incidentService->createIncident(
                $api,
                "{$api->name} is down",
                $errorMessage ?? 'Connection failed'
            );
        } elseif ($status === 'UP') {
            // Resolve any open incident when API returns to UP
            $this->incidentService->resolveIncident($api);
        }

        return [
            'apiId' => $api->id,
            'status' => $status,
            'statusCode' => $statusCode,
            'responseTime' => $responseTime,
            'checkedAt' => now(),
            'errorMessage' => $errorMessage,
        ];
    }
}