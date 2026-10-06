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
            ->where('user_id', $request->user()?->id ?? 1)
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
            'user_id' => $request->user()?->id ?? 1,
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
        $service = app(ApiMonitoringService::class);

        return $service->check($monitoredApi);
    }

    /**
     * Get check history for the specified monitored API.
     */
    public function checks(MonitoredApi $monitoredApi)
    {
        $checks = $monitoredApi->checks()
            ->latest('checked_at')
            ->limit(50)
            ->get();

        return ApiCheckResource::collection($checks);
    }
}