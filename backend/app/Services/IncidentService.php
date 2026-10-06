<?php

namespace App\Services;

use App\Models\Incident;
use App\Models\MonitoredApi;

class IncidentService
{
    /**
     * Create a new incident for a monitored API.
     *
     * @param  MonitoredApi  $api
     * @param  string  $title
     * @param  string  $description
     * @return Incident
     */
    public function createIncident(MonitoredApi $api, string $title, string $description = ''): Incident
    {
        // Cari incident OPEN yang sudah ada untuk API ini
        $existing = Incident::where('monitored_api_id', $api->id)
            ->where('status', 'OPEN')
            ->first();

        if ($existing) {
            // Incident OPEN sudah ada, jangan buat yang baru
            return $existing;
        }

        // Buat incident baru
        return Incident::create([
            'monitored_api_id' => $api->id,
            'title' => $title,
            'status' => 'OPEN',
            'started_at' => now(),
            'description' => $description,
        ]);
    }

    /**
     * Find the active/open incident for a monitored API.
     *
     * @param  MonitoredApi  $api
     * @return Incident|null
     */
    public function findOpenIncident(MonitoredApi $api): ?Incident
    {
        return Incident::where('monitored_api_id', $api->id)
            ->where('status', 'OPEN')
            ->first();
    }

    /**
     * Resolve an open incident for a monitored API.
     *
     * @param  MonitoredApi  $api
     * @return Incident|null
     */
    public function resolveIncident(MonitoredApi $api): ?Incident
    {
        $incident = $this->findOpenIncident($api);

        if ($incident) {
            $incident->status = 'RESOLVED';
            $incident->resolved_at = now();
            $incident->save();
        }

        return $incident;
    }

    /**
     * Get incidents for a monitored API with status filtering.
     *
     * @param  MonitoredApi  $api
     * @param  string  $status
     * @return \Illuminate\Database\Eloquent\Collection|Incident[]
     */
    public function getIncidents(MonitoredApi $api, string $status = null): \Illuminate\Database\Eloquent\Collection
    {
        $query = Incident::where('monitored_api_id', $api->id);

        if ($status) {
            $query->where('status', $status);
        }

        return $query->latest('started_at')->get();
    }

    /**
     * Get count of open incidents for a monitored API.
     *
     * @param  MonitoredApi  $api
     * @return int
     */
    public function countOpenIncidents(MonitoredApi $api): int
    {
        return Incident::where('monitored_api_id', $api->id)
            ->where('status', 'OPEN')
            ->count();
    }
}