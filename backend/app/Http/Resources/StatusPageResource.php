<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StatusPageResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'is_public' => $this->is_public,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'statusPageApis' => $this->statusPageApis->map(function ($pageApi) {
                return [
                    'monitoredApi' => [
                        'id' => $pageApi->monitoredApi->id,
                        'name' => $pageApi->monitoredApi->name,
                    ],
                    'pivot' => [
                        'sort_order' => $pageApi->pivot->sort_order,
                    ],
                ];
            }),
        ];
    }
}