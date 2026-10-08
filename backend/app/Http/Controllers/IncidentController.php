<?php

namespace App\Http\Controllers;

use App\Http\Resources\IncidentResource;
use App\Models\Incident;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class IncidentController extends Controller
{
    /**
     * Display a listing of incidents.
     *
     * Supported query parameters:
     *   - status: "OPEN" or "RESOLVED"
     *   - apiId: integer (must belong to authenticated user)
     *   - search: search title and API name
     *   - page: Laravel pagination page
     *   - perPage: items per page (max 100, default 20)
     */
    public function index(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'status' => ['sometimes', 'in:OPEN,RESOLVED'],
            'apiId' => ['sometimes', 'integer', 'exists:monitored_apis,id'],
            'search' => ['sometimes', 'string'],
            'perPage' => ['sometimes', 'integer', 'between:1,100'],
            'page' => ['sometimes', 'integer'],
        ]);

        $query = Incident::query()
            ->whereHas('monitoredApi', function ($query) use ($user) {
                $query->where('user_id', $user->id);
            })
            ->with(['monitoredApi' => fn($q) => $q->select('id', 'name')]);

        // Filter by status
        $status = $request->string('status');
        if ($status === 'OPEN') {
            $query->whereNull('resolved_at');
        } elseif ($status === 'RESOLVED') {
            $query->whereNotNull('resolved_at');
        }

        // Filter by API ID
        $apiId = $request->integer('apiId');
        if ($apiId !== null) {
            $query->where('monitored_api_id', $apiId);
        }

        // Search in title and API name
        $search = $request->string('search');
        if ($search) {
            $searchLower = Str::lower($search);
            $query->where(function ($q) use ($searchLower) {
                $q->whereRaw('LOWER(title) LIKE ?', ["%{$searchLower}%"])
                    ->orWhereHas('monitoredApi', function ($aq) use ($searchLower) {
                        $aq->whereRaw('LOWER(name) LIKE ?', ["%{$searchLower}%"]);
                    });
            });
        }

        // Pagination
        $perPage = min($request->integer('perPage') ?? 20, 100);
        $page = $request->integer('page') ?? 1;

        $incidents = $query
            ->latest('started_at')
            ->paginate($perPage, ['*'], 'page', $page);

        return IncidentResource::collection($incidents)->additional([
            'meta' => [
                'currentPage' => $incidents->currentPage(),
                'lastPage' => $incidents->lastPage(),
                'perPage' => $incidents->perPage(),
                'total' => $incidents->total(),
            ],
        ]);
    }

    /**
     * Display the specified incident.
     */
    public function show(Incident $incident)
    {
        $incident->load(['monitoredApi' => fn($q) => $q->select('id', 'name')]);

        // Verify ownership: incident's monitoredApi must belong to authenticated user
        $user = auth()->user();
        if ($incident->monitoredApi->user_id !== $user->id) {
            throw ValidationException::withMessages([
                'incident' => ['Incident not found.'],
            ]);
        }

        return new IncidentResource($incident);
    }
}