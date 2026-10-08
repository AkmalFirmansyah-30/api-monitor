<?php

namespace App\Http\Controllers;

use App\Models\MonitoredApi;
use App\Models\ApiCheck;
use App\Models\Incident;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class DashboardController extends Controller
{
    /**
     * Get dashboard summary for the authenticated user.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function summary(Request $request)
    {
        $user = $request->user();

        $totalApis = MonitoredApi::where('user_id', $user->id)->count();

        $upApis = MonitoredApi::where('user_id', $user->id)
            ->where('status', 'UP')
            ->count();

        $degradedApis = MonitoredApi::where('user_id', $user->id)
            ->where('status', 'DEGRADED')
            ->count();

        $downApis = MonitoredApi::where('user_id', $user->id)
            ->where('status', 'DOWN')
            ->count();

        $averageResponseTime = MonitoredApi::where('user_id', $user->id)
            ->whereNotNull('response_time')
            ->avg('response_time');

        $averageUptime = MonitoredApi::where('user_id', $user->id)
            ->avg('uptime');

        $activeIncidents = Incident::whereHas('monitoredApi', function ($query) use ($user) {
            $query->where('user_id', $user->id);
        })
            ->where('status', 'OPEN')
            ->count();

        $totalChecks = ApiCheck::whereHas('monitoredApi', function ($query) use ($user) {
            $query->where('user_id', $user->id);
        })->count();

        return response()->json([
            'totalApis' => $totalApis,
            'up' => $upApis,
            'degraded' => $degradedApis,
            'down' => $downApis,
            'averageResponseTime' => $averageResponseTime !== null
                ? round($averageResponseTime)
                : null,
            'averageUptime' => $averageUptime !== null
                ? round($averageUptime, 2)
                : null,
            'activeIncidents' => $activeIncidents,
            'totalChecks' => $totalChecks,
        ]);
    }

    /**
     * Get recent monitoring checks for the authenticated user's APIs.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function recentChecks(Request $request)
    {
        $limit = $request->integer('limit') ?? 10;
        $limit = min($limit, 50);

        $user = $request->user();

        $checks = ApiCheck::whereHas('monitoredApi', function ($query) use ($user) {
            $query->where('user_id', $user->id);
        })
            ->latest('checked_at')
            ->take($limit)
            ->get(['id', 'monitored_api_id', 'status', 'status_code', 'response_time', 'error_message', 'checked_at']);

        // Load the API name for each check
        $checks->load(['monitoredApi' => fn($q) => $q->select('id', 'name')]);

        return response()->json([
            'range' => 'latest',
            'data' => $checks->map(function ($check) {
                return [
                    'id' => $check->id,
                    'apiId' => $check->monitored_api_id,
                    'apiName' => $check->monitoredApi ? $check->monitoredApi->name : 'Unknown',
                    'status' => $check->status,
                    'statusCode' => $check->status_code,
                    'responseTime' => $check->response_time,
                    'errorMessage' => $check->error_message,
                    'checkedAt' => $check->checked_at,
                ];
            }),
        ]);
    }

    /**
     * Get response time analytics for the authenticated user's APIs.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function responseTime(Request $request)
    {
        $range = $request->string('range') ?? '24h';

        $validRanges = ['24h', '7d', '30d'];
        if (!in_array($range, $validRanges)) {
            return response()->json([
                'error' => 'Invalid range. Valid ranges: 24h, 7d, 30d',
            ], 422);
        }

        $user = $request->user();

        $apiId = $request->integer('apiId');

        if ($apiId !== null) {
            $api = MonitoredApi::where('user_id', $user->id)
                ->where('id', $apiId)
                ->first();

            if (!$api) {
                return response()->json([
                    'error' => 'API not found or not owned by you',
                ], 404);
            }
        }

        $now = now();

        $checks = ApiCheck::whereHas('monitoredApi', function ($query) use ($user, $apiId) {
            $query->where('user_id', $user->id);

            if ($apiId !== null) {
                $query->where('monitored_api_id', $apiId);
            }
        })
            ->latest('checked_at')
            ->get(['id', 'monitored_api_id', 'status', 'response_time', 'checked_at']);

        // Aggregate data based on range
        $aggregated = $this->aggregateChecks($checks, $range, $now);

        return response()->json([
            'range' => $range,
            'apiId' => $apiId,
            'data' => $aggregated,
        ]);
    }

    /**
     * Get uptime analytics for the authenticated user's APIs.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function uptime(Request $request)
    {
        $range = $request->string('range') ?? '24h';

        $validRanges = ['24h', '7d', '30d'];
        if (!in_array($range, $validRanges)) {
            return response()->json([
                'error' => 'Invalid range. Valid ranges: 24h, 7d, 30d',
            ], 422);
        }

        $user = $request->user();

        $apiId = $request->integer('apiId');

        if ($apiId !== null) {
            $api = MonitoredApi::where('user_id', $user->id)
                ->where('id', $apiId)
                ->first();

            if (!$api) {
                return response()->json([
                    'error' => 'API not found or not owned by you',
                ], 404);
            }
        }

        $now = now();

        $checks = ApiCheck::whereHas('monitoredApi', function ($query) use ($user, $apiId) {
            $query->where('user_id', $user->id);

            if ($apiId !== null) {
                $query->where('monitored_api_id', $apiId);
            }
        })
            ->latest('checked_at')
            ->get(['id', 'monitored_api_id', 'status', 'checked_at']);

        // Calculate uptime: successful checks / total checks * 100
        $successful = $checks->whereIn('status', ['UP', 'DEGRADED'])->count();
        $total = $checks->count();

        $uptime = $total > 0 ? round(($successful / $total) * 100, 2) : null;

        // Aggregate by the specified range
        $aggregated = $this->aggregateUptime($checks, $range, $now);

        return response()->json([
            'range' => $range,
            'apiId' => $apiId,
            'data' => $aggregated,
            'summary' => [
                'totalChecks' => $total,
                'successfulChecks' => $successful,
                'uptime' => $uptime,
            ],
        ]);
    }

    /**
     * Get active/open incidents for the authenticated user.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function incidents(Request $request)
    {
        $user = $request->user();

        $incidents = Incident::whereHas('monitoredApi', function ($query) use ($user) {
            $query->where('user_id', $user->id);
        })
            ->where('status', 'OPEN')
            ->latest('started_at')
            ->get(['id', 'monitored_api_id', 'title', 'status', 'started_at', 'resolved_at', 'description']);

        // Load the API name
        $incidents->load(['monitoredApi' => fn($q) => $q->select('id', 'name')]);

        return response()->json([
            'data' => $incidents->map(function ($incident) {
                $duration = null;
                if ($incident->status === 'OPEN' && $incident->started_at) {
                    $duration = now()->diffForHumans($incident->started_at);
                } elseif ($incident->resolved_at) {
                    $duration = $incident->started_at && $incident->resolved_at
                        ? $incident->started_at->diffForHumans($incident->resolved_at)
                        : null;
                }

                return [
                    'id' => $incident->id,
                    'apiId' => $incident->monitored_api_id,
                    'apiName' => $incident->monitoredApi ? $incident->monitoredApi->name : 'Unknown',
                    'title' => $incident->title,
                    'status' => $incident->status,
                    'startedAt' => $incident->started_at,
                    'resolvedAt' => $incident->resolved_at,
                    'description' => $incident->description,
                    'duration' => $duration,
                ];
            }),
        ]);
    }

    /**
     * Aggregate checks by time range.
     *
     * @param  \Illuminate\Support\Collection  $checks
     * @param  string  $range
     * @param  \Carbon\Carbon  $now
     * @return array
     */
    private function aggregateChecks($checks, string $range, $now)
    {
        $result = [];

        if ($range === '24h') {
            // Aggregate by hour
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
            // Aggregate by day
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
            // Aggregate by day (same as 7d for simplicity)
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

    /**
     * Aggregate uptime data by time range.
     *
     * @param  \Illuminate\Support\Collection  $checks
     * @param  string  $range
     * @param  \Carbon\Carbon  $now
     * @return array
     */
    private function aggregateUptime($checks, string $range, $now)
    {
        $result = [];

        if ($range === '24h') {
            // Hourly uptime
            $hourly = $checks->groupBy(function ($check) use ($now) {
                return $now->startOfHour()->subHour()->format('Y-m-d H:i');
            });

            foreach ($hourly as $timestamp => $hourChecks) {
                $successful = $hourChecks->whereIn('status', ['UP', 'DEGRADED'])->count();
                $total = $hourChecks->count();
                $result[] = [
                    'timestamp' => $timestamp,
                    'uptime' => $total > 0 ? round(($successful / $total) * 100, 2) : null,
                ];
            }
        } elseif ($range === '7d') {
            // Daily uptime
            $daily = $checks->groupBy(function ($check) use ($now) {
                return $now->startOfDay()->subDay()->format('Y-m-d');
            });

            foreach ($daily as $timestamp => $dayChecks) {
                $result[] = [
                    'date' => $timestamp,
                    'uptime' => $dayChecks->count() > 0
                        ? round(($dayChecks->whereIn('status', ['UP', 'DEGRADED'])->count() / $dayChecks->count()) * 100, 2)
                        : null,
                ];
            }
        } elseif ($range === '30d') {
            // Daily uptime (same logic as 7d)
            $daily = $checks->groupBy(function ($check) use ($now) {
                return $now->startOfDay()->subDay()->format('Y-m-d');
            });

            foreach ($daily as $timestamp => $dayChecks) {
                $result[] = [
                    'date' => $timestamp,
                    'uptime' => $dayChecks->count() > 0
                        ? round(($dayChecks->whereIn('status', ['UP', 'DEGRADED'])->count() / $dayChecks->count()) * 100, 2)
                        : null,
                ];
            }
        }

        return $result;
    }
}