<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreMonitoredApiRequest;
use App\Http\Requests\UpdateMonitoredApiRequest;
use App\Http\Resources\ApiCheckResource;
use App\Http\Resources\MonitoredApiResource;
use App\Models\MonitoredApi;
use App\Services\ApiMonitoringService;
use Illuminate\Http\Request;

class MonitoredApiController extends Controller
{
    /**
     * Display a listing of monitored APIs.
     */
    public function index(Request $request)
    {
        $apis = MonitoredApi::query()
            ->where('user_id', $request->user()->id)
            ->withCount('checks')
            ->latest()
            ->get();

        return MonitoredApiResource::collection($apis);
    }

    /**
     * Store a newly created monitored API.
     */
    public function store(StoreMonitoredApiRequest $request)
    {
        $api = MonitoredApi::create([
            ...$request->validated(),
            'user_id' => $request->user()->id,
            'status' => 'UP',
            'uptime' => 100.00,
        ]);

        return (new MonitoredApiResource($api))
            ->additional([
                'message' => 'API created successfully.',
            ])
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Display the specified monitored API.
     */
    public function show(MonitoredApi $monitoredApi)
    {
        $monitoredApi->load([
            'headers',
            'checks' => function ($query) {
                $query
                    ->latest('checked_at')
                    ->limit(50);
            },
            'incidents' => function ($query) {
                $query->latest('started_at');
            },
        ]);

        return new MonitoredApiResource($monitoredApi);
    }

    /**
     * Update the specified monitored API.
     */
    public function update(
        UpdateMonitoredApiRequest $request,
        MonitoredApi $monitoredApi
    ) {
        $this->authorize('update', $monitoredApi);

        $monitoredApi->update(
            $request->validated()
        );

        return (new MonitoredApiResource(
            $monitoredApi->fresh()
        ))->additional([
            'message' => 'API updated successfully.',
        ]);
    }

    /**
     * Remove the specified monitored API.
     */
    public function destroy(
        MonitoredApi $monitoredApi
    ) {
        $this->authorize('delete', $monitoredApi);

        $monitoredApi->delete();

        return response()->json([
            'message' => 'API deleted successfully.',
        ]);
    }

    /**
     * Check the specified monitored API.
     */
    public function check(MonitoredApi $monitoredApi)
    {
        $this->authorize('check', $monitoredApi);

        $service = app(ApiMonitoringService::class);

        return $service->check($monitoredApi);
    }

    /**
     * Get check history for the specified monitored API.
     */
    public function checks(MonitoredApi $monitoredApi)
    {
        $this->authorize('view checks', $monitoredApi);

        $perPage = $monitoredApi->checks()
            ->paginate(20)->perPage();

        $perPage = min($perPage, 100);

        $checks = $monitoredApi->checks()
            ->latest('checked_at')
            ->paginate($perPage);

        return ApiCheckResource::collection($checks)->additional([
            'meta' => [
                'currentPage' => $checks->currentPage(),
                'lastPage' => $checks->lastPage(),
                'perPage' => $checks->perPage(),
                'total' => $checks->total(),
            ],
        ]);
    }

    /**
     * Get statistics for the specified monitored API.
     */
    public function stats(MonitoredApi $monitoredApi)
    {
        $this->authorize('view', $monitoredApi);

        $totalChecks = $monitoredApi->checks()->count();
        $upChecks = $monitoredApi->checks()->where('status', 'UP')->count();
        $degradedChecks = $monitoredApi->checks()->where('status', 'DEGRADED')->count();
        $downChecks = $monitoredApi->checks()->where('status', 'DOWN')->count();

        $averageResponseTime = $monitoredApi->checks()
            ->whereNotNull('response_time')
            ->avg('response_time');

        $uptime = $totalChecks > 0
            ? round((($upChecks + $degradedChecks) / $totalChecks) * 100, 2)
            : 0;

        return [
            'uptime' => $uptime,
            'averageResponseTime' => $averageResponseTime !== null
                ? round($averageResponseTime)
                : null,
            'totalChecks' => $totalChecks,
            'upChecks' => $upChecks,
            'degradedChecks' => $degradedChecks,
            'downChecks' => $downChecks,
        ];
    }

    /**
     * Get response time analytics for the specified monitored API.
     */
    public function responseTime(MonitoredApi $monitoredApi, Request $request)
    {
        $this->authorize('view', $monitoredApi);

        $range = $request->string('range') ?? '24h';

        $validRanges = ['24h', '7d', '30d'];
        if (!in_array($range, $validRanges)) {
            return response()->json([
                'error' => 'Invalid range. Valid ranges: 24h, 7d, 30d',
            ], 422);
        }

        $now = now();
        $checks = $monitoredApi->checks()
            ->latest('checked_at')
            ->get(['id', 'status', 'response_time', 'checked_at']);

        // Aggregate data based on range
        $aggregated = $this->aggregateResponseTime($checks, $range, $now);

        return response()->json([
            'range' => $range,
            'data' => $aggregated,
        ]);
    }

    /**
     * Aggregate response time by time range.
     */
    private function aggregateResponseTime($checks, string $range, $now)
    {
        $result = [];

        if ($range === '24h') {
            $hourly = $checks->groupBy(function ($check) use ($now) {
                return $now->startOfHour()->subHour()->format('Y-m-d H:i');
            });

            foreach ($hourly as $timestamp => $hourChecks) {
                $result[] = [
                    'timestamp' => $timestamp,
                    'averageResponseTime' => $hourChecks->avg('response_time') ?? 0,
                ];
            }
        } elseif ($range === '7d') {
            $daily = $checks->groupBy(function ($check) use ($now) {
                return $now->startOfDay()->subDay()->format('Y-m-d');
            });

            foreach ($daily as $timestamp => $dayChecks) {
                $result[] = [
                    'date' => $timestamp,
                    'averageResponseTime' => $dayChecks->avg('response_time') ?? 0,
                ];
            }
        } elseif ($range === '30d') {
            $daily = $checks->groupBy(function ($check) use ($now) {
                return $now->startOfDay()->subDay()->format('Y-m-d');
            });

            foreach ($daily as $timestamp => $dayChecks) {
                $result[] = [
                    'date' => $timestamp,
                    'averageResponseTime' => $dayChecks->avg('response_time') ?? 0,
                ];
            }
        }

        return $result;
    }
}