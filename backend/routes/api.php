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