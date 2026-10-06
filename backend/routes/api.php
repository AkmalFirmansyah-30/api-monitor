<?php

use App\Http\Controllers\IncidentController;
use App\Http\Controllers\MonitoredApiController;
use App\Services\ApiMonitoringService;
use Illuminate\Support\Facades\Route;

Route::apiResource('apis', MonitoredApiController::class);

Route::post('apis/{monitoredApi}/check', [MonitoredApiController::class, 'check']);

Route::get(
    'apis/{monitoredApi}/checks',
    [MonitoredApiController::class, 'checks']
);

Route::get('incidents', [IncidentController::class, 'index']);

Route::get(
    'incidents/{incident}',
    [IncidentController::class, 'show']
);

Route::get('/test/health', function () {
    return response()->json([
        'status' => 'ok',
        'message' => 'API is healthy',
        'timestamp' => now()->toISOString(),
    ]);
});

Route::get('/test/slow', function () {
    usleep(1800000); // 1.8 seconds delay to trigger DEGRADED status

    return response()->json([
        'status' => 'ok',
        'message' => 'Slow test endpoint',
    ]);
});