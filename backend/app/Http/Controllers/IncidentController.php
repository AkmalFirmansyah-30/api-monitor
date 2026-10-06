<?php

namespace App\Http\Controllers;

use App\Http\Resources\IncidentResource;
use App\Models\Incident;
use Illuminate\Http\Request;

class IncidentController extends Controller
{
    /**
     * Display a listing of incidents.
     */
    public function index(Request $request)
    {
        $apiId = $request->query('api_id');

        $query = Incident::query()
            ->with(['monitoredApi' => fn($q) => $q->select('id', 'name')]);

        if ($apiId) {
            $query->where('monitored_api_id', $apiId);
        }

        $incidents = $query->latest('started_at')->get();

        return IncidentResource::collection($incidents);
    }

    /**
     * Display the specified incident.
     */
    public function show(Incident $incident)
    {
        return new IncidentResource($incident);
    }
}