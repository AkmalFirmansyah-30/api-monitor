<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\IncidentController;
use App\Http\Controllers\MonitoredApiController;
use App\Services\ApiMonitoringService;
use Illuminate\Support\Facades\Route;

// Authentication routes (public)
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
Route::get('/auth/me', [AuthController::class, 'me'])->middleware('auth:sanctum');

// Monitored API routes (protected)
Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('apis', MonitoredApiController::class);

    Route::post('apis/{monitoredApi}/check', [MonitoredApiController::class, 'check']);

    Route::get(
        'apis/{monitoredApi}/checks',
        [MonitoredApiController::class, 'checks']
    );

    // Dashboard routes (protected)
    Route::get('dashboard/summary', [\App\Http\Controllers\DashboardController::class, 'summary']);
    Route::get('dashboard/recent-checks', [\App\Http\Controllers\DashboardController::class, 'recentChecks']);
    Route::get('dashboard/response-time', [\App\Http\Controllers\DashboardController::class, 'responseTime']);
    Route::get('dashboard/uptime', [\App\Http\Controllers\DashboardController::class, 'uptime']);
    Route::get('dashboard/incidents', [\App\Http\Controllers\DashboardController::class, 'incidents']);

// API detail & analytics routes (protected)
    Route::get('apis/{api}', [\App\Http\Controllers\MonitoredApiController::class, 'show']);
    Route::get('apis/{api}/checks', [\App\Http\Controllers\MonitoredApiController::class, 'checks']);
    Route::post('apis/{api}/check', [\App\Http\Controllers\MonitoredApiController::class, 'check']);
    Route::get('apis/{api}/stats', [\App\Http\Controllers\MonitoredApiController::class, 'stats']);
    Route::get('apis/{api}/response-time', [\App\Http\Controllers\MonitoredApiController::class, 'responseTime']);

    // Incidents routes (protected)
    Route::get('incidents', [IncidentController::class, 'index'])->middleware('auth:sanctum');
    Route::get(
        'incidents/{incident}',
        [IncidentController::class, 'show']
    )->middleware('auth:sanctum');
});

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