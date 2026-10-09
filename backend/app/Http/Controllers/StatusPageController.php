<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreStatusPageRequest;
use App\Http\Requests\UpdateStatusPageRequest;
use App\Models\StatusPage;
use App\Models\MonitoredApi;
use Illuminate\Http\Request;

class StatusPageController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
    }

    public function publicShow($slug)
    {
        $statusPage = StatusPage::where('slug', $slug)
            ->where('is_public', true)
            ->with('statusPageApis.monitoredApi')
            ->first();

        if (!$statusPage) {
            return response()->json(['message' => 'Status page not found.'], 404);
        }

        $apis = $statusPage->statusPageApis->map(function ($pageApi) {
            $api = $pageApi->monitoredApi;

            return [
                'id' => $api->id,
                'name' => $api->name,
                'status' => $api->status,
                'responseTime' => $api->response_time,
                'uptime' => $api->uptime,
                'lastCheckedAt' => $api->last_checked_at,
                'sortOrder' => $pageApi->pivot->sort_order,
            ];
        })->values()->toArray();

        $overallStatus = 'OPERATIONAL';
        $hasDown = false;
        $hasDegraded = false;

        foreach ($apis as $api) {
            if ($api['status'] === 'DOWN') {
                $hasDown = true;
            }
            if ($api['status'] === 'DEGRADED') {
                $hasDegraded = true;
            }
        }

        if ($hasDown) {
            $overallStatus = 'OUTAGE';
        } elseif ($hasDegraded) {
            $overallStatus = 'DEGRADED';
        }

        return response()->json([
            'data' => [
                'name' => $statusPage->name,
                'slug' => $statusPage->slug,
                'description' => $statusPage->description,
                'overallStatus' => $overallStatus,
                'apis' => $apis,
                'updatedAt' => $statusPage->updated_at,
            ],
        ]);
    }

    public function index()
    {
        $statusPages = auth()->user()->statusPages()
            ->with('statusPageApis.monitoredApi')
            ->get();

        return response()->json($statusPages);
    }

    public function store(StoreStatusPageRequest $request)
    {
        $validated = $request->validated();

        $statusPage = auth()->user()->statusPages()->create([
            'name' => $validated['name'],
            'slug' => $validated['slug'],
            'description' => $validated['description'] ?? null,
            'is_public' => $validated['isPublic'] ?? true,
        ]);

        if (isset($validated['apiIds']) && is_array($validated['apiIds'])) {
            $apis = MonitoredApi::whereIn('id', $validated['apiIds'])
                ->where('user_id', auth()->id())
                ->get();

            $syncArray = $apis->pluck('id')->map(function ($id, $key) {
                // Use the key from the array as sort_order to preserve selection order
                return ['monitored_api_id' => $id, 'sort_order' => $key];
            });

            $statusPage->statusPageApis()->sync($syncArray);
        }

        return response()->json($statusPage->load('statusPageApis.monitoredApi'));
    }

    public function show(StatusPage $statusPage)
    {
        abort_if($statusPage->user_id !== auth()->id(), 403);

        $statusPage->load('statusPageApis.monitoredApi');

        return response()->json($statusPage);
    }

    public function update(UpdateStatusPageRequest $request, StatusPage $statusPage)
    {
        abort_if($statusPage->user_id !== auth()->id(), 403);

        $validated = $request->validated();

        $statusPage->update([
            'name' => $validated['name'],
            'slug' => $validated['slug'],
            'description' => $validated['description'] ?? null,
            'is_public' => $validated['isPublic'] ?? $statusPage->is_public,
        ]);

        if (isset($validated['apiIds']) && is_array($validated['apiIds'])) {
            $selectedApis = MonitoredApi::whereIn('id', $validated['apiIds'])
                ->where('user_id', auth()->id())
                ->get();

            $syncArray = $selectedApis->pluck('id')->map(function ($id, $key) {
                // Use the key from the array as sort_order to preserve selection order
                return ['monitored_api_id' => $id, 'sort_order' => $key];
            });

            $statusPage->statusPageApis()->sync($syncArray);
        } elseif ($validated['removeApiIds'] ?? false) {
            $statusPage->statusPageApis()
                ->whereIn('monitored_api_id', $validated['removeApiIds'])
                ->delete();
        }

        return response()->json($statusPage->load('statusPageApis.monitoredApi'));
    }

    public function destroy(StatusPage $statusPage)
    {
        abort_if($statusPage->user_id !== auth()->id(), 403);

        $statusPage->statusPageApis()->delete();
        $statusPage->delete();

        return response()->json(['message' => 'Status page deleted successfully']);
    }
}