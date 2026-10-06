<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Incident extends Model
{
    protected $fillable = [
        'monitored_api_id',
        'title',
        'status',
        'started_at',
        'resolved_at',
        'description',
    ];

    protected function casts(): array
    {
        return [
            'started_at' => 'datetime',
            'resolved_at' => 'datetime',
        ];
    }

    public function monitoredApi(): BelongsTo
    {
        return $this->belongsTo(MonitoredApi::class);
    }
}