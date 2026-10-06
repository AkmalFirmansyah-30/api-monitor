<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class IncidentResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'apiId' => $this->monitored_api_id,
            'apiName' => $this->monitoredApi->name,
            'title' => $this->title,
            'status' => $this->status,
            'startedAt' => $this->started_at?->toISOString(),
            'resolvedAt' => $this->resolved_at?->toISOString(),
            'description' => $this->description,
        ];
    }
}