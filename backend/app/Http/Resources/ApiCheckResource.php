<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ApiCheckResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'apiId' => $this->monitored_api_id,
            'status' => $this->status,
            'statusCode' => $this->status_code,
            'responseTime' => $this->response_time,
            'errorMessage' => $this->error_message,
            'checkedAt' => $this->checked_at?->toISOString(),
        ];
    }
}