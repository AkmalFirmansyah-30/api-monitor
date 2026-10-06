<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ApiCheck extends Model
{
    protected $fillable = [
        'monitored_api_id',
        'status',
        'status_code',
        'response_time',
        'error_message',
        'checked_at',
    ];

    protected function casts(): array
    {
        return [
            'checked_at' => 'datetime',
        ];
    }

    public function monitoredApi(): BelongsTo
    {
        return $this->belongsTo(MonitoredApi::class);
    }
}