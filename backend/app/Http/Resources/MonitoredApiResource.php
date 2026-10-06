<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;


class MonitoredApiResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'url' => $this->url,
            'method' => $this->method,
            'status' => $this->status,
            'responseTime' => $this->response_time,
            'uptime' => $this->uptime,
            'lastChecked' => $this->last_checked_at?->diffForHumans(),
            'lastCheckedAt' => $this->last_checked_at?->toISOString(),
            'timeout' => $this->timeout,
            'interval' => $this->interval,
            'checksCount' => $this->whenCounted('checks'),
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),
        ];
    }
}