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
        $incidents = Incident::query()
            ->whereHas('monitoredApi', function ($query) {
                $query->where('user_id', $request->user()->id);
            })
            ->with(['monitoredApi' => fn($q) => $q->select('id', 'name')])
            ->latest('started_at')
            ->get();

        return IncidentResource::collection($incidents);
    }

    /**
     * Display the specified incident.
     */
    public function show(Incident $incident)
    {
        $incident->load(['monitoredApi' => fn($q) => $q->select('id', 'name')]);

        return new IncidentResource($incident);
    }
}